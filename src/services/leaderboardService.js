import { scoreRepository } from '../repositories/scoreRepository';
import { predictionRepository } from '../repositories/predictionRepository';
import { matchRepository } from '../repositories/matchRepository';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { sortLeaderboard } from '../utils/helpers';
import { auditService } from './auditService';

export const leaderboardService = {
  async getLeaderboard(communityId, stage = 'overall') {
    const leaderboardId = `${communityId}__${stage}`;
    const snap = await getDoc(doc(db, 'leaderboards', leaderboardId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async generate(communityId, stage = 'overall', adminId, adminUsername) {
    // Gather all scores
    const scoreQuery = stage === 'overall'
      ? query(collection(db, 'scores'), where('communityId', '==', communityId))
      : query(collection(db, 'scores'), where('communityId', '==', communityId), where('stage', '==', stage));
    const scoreSnap = await getDocs(scoreQuery);
    const scores = scoreSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Aggregate per user
    const byUser = {};
    scores.forEach((s) => {
      if (!byUser[s.userId]) {
        byUser[s.userId] = {
          userId: s.userId,
          username: s.username || '',
          totalPoints: 0,
          matchesScored: 0,
          perfectPredictions: 0,
          exactScoreCount: 0,
          correctWinnerCount: 0,
          lastSubmissionAt: null,
        };
      }
      byUser[s.userId].totalPoints += s.totalPoints || 0;
      byUser[s.userId].matchesScored += 1;
      if (s.isPerfect) byUser[s.userId].perfectPredictions += 1;
      if (s.correctExactScore) byUser[s.userId].exactScoreCount += 1;
      if (s.correctWinner) byUser[s.userId].correctWinnerCount += 1;
    });

    // Add submission timestamps
    const userPredictions = await predictionRepository.getByCommunity(communityId);
    userPredictions.forEach((p) => {
      if (byUser[p.userId] && p.submittedAt) {
        const existing = byUser[p.userId].lastSubmissionAt;
        if (!existing || (p.submittedAt?.toDate?.() || p.submittedAt) > (existing?.toDate?.() || existing)) {
          byUser[p.userId].lastSubmissionAt = p.submittedAt;
        }
      }
    });

    const sorted = sortLeaderboard(Object.values(byUser));
    const rankings = sorted.map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    const leaderboardId = `${communityId}__${stage}`;
    const leaderboard = {
      leaderboardId,
      communityId,
      stage,
      rankings,
      updatedAt: new Date(),
      generatedBy: adminId || 'system',
    };

    await setDoc(doc(db, 'leaderboards', leaderboardId), leaderboard, { merge: true });

    if (adminId) {
      await auditService.log({
        userId: adminId, username: adminUsername, communityId,
        action: 'WINNER_DECLARED', resource: 'leaderboards', resourceId: leaderboardId,
        details: { stage, entries: rankings.length },
      });
    }

    return leaderboard;
  },

  async getTopN(communityId, n = 5, stage = 'overall') {
    const leaderboard = await this.getLeaderboard(communityId, stage);
    if (!leaderboard) return [];
    return (leaderboard.rankings || []).slice(0, n);
  },

  async getUserRank(communityId, userId, stage = 'overall') {
    const leaderboard = await this.getLeaderboard(communityId, stage);
    if (!leaderboard) return null;
    return leaderboard.rankings.find((r) => r.userId === userId) || null;
  },
};
