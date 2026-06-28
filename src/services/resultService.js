import { matchRepository } from '../repositories/matchRepository';
import { predictionRepository } from '../repositories/predictionRepository';
import { scoreRepository } from '../repositories/scoreRepository';
import { communityRepository } from '../repositories/communityRepository';
import { scoringEngine } from './scoringEngine';
import { auditService } from './auditService';
import { getWinner } from '../utils/helpers';

export const resultService = {
  async enterResult(matchId, { teamAScore, teamBScore, decisionMethod }, adminId, adminUsername, communityId) {
    const match = await matchRepository.getById(matchId);
    if (!match) throw new Error('Match not found');

    const result = {
      teamAScore: Number(teamAScore),
      teamBScore: Number(teamBScore),
      winner: getWinner(Number(teamAScore), Number(teamBScore)),
      decisionMethod: decisionMethod || 'regular_time',
      enteredBy: adminId,
    };

    await matchRepository.update(matchId, { result, status: 'completed' });

    // Calculate scores
    const community = await communityRepository.getById(communityId);
    const scoringRules = community?.settings?.scoringRules || {};
    const predictions = await predictionRepository.getByMatch(communityId, matchId);

    const scoreOps = [];
    for (const pred of predictions) {
      if (pred.status === 'draft') continue; // only submitted/locked count
      const score = scoringEngine.calculateMatchScore(pred, result, scoringRules);
      const scoreId = scoreRepository.buildId(communityId, matchId, pred.userId);
      scoreOps.push({
        id: scoreId,
        data: {
          scoreId, communityId, matchId, userId: pred.userId, username: pred.username,
          stage: match.stage, ...score, calculatedAt: new Date(),
        },
        type: 'set',
      });
    }
    if (scoreOps.length > 0) await scoreRepository.batchWrite(scoreOps);

    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'RESULT_UPDATE', resource: 'matches', resourceId: matchId,
      details: { result, scoresCalculated: scoreOps.length },
    });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'SCORES_CALCULATED', resource: 'scores', resourceId: matchId,
      details: { count: scoreOps.length },
    });

    return { match: { ...match, result }, scoresCalculated: scoreOps.length };
  },

  async recalculateAll(communityId, adminId, adminUsername) {
    const matches = await matchRepository.getByCommunity(communityId);
    const community = await communityRepository.getById(communityId);
    const scoringRules = community?.settings?.scoringRules || {};
    const completedMatches = matches.filter((m) => m.result);

    let totalCalculated = 0;
    for (const match of completedMatches) {
      const predictions = await predictionRepository.getByMatch(communityId, match.id);
      const scoreOps = [];
      for (const pred of predictions) {
        if (pred.status === 'draft') continue;
        const score = scoringEngine.calculateMatchScore(pred, match.result, scoringRules);
        const scoreId = scoreRepository.buildId(communityId, match.id, pred.userId);
        scoreOps.push({
          id: scoreId,
          data: {
            scoreId, communityId, matchId: match.id, userId: pred.userId, username: pred.username,
            stage: match.stage, ...score, calculatedAt: new Date(),
          },
          type: 'set',
        });
      }
      if (scoreOps.length > 0) {
        await scoreRepository.batchWrite(scoreOps);
        totalCalculated += scoreOps.length;
      }
    }

    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'SCORES_CALCULATED', resource: 'scores', resourceId: 'recalc',
      details: { totalCalculated },
    });
    return totalCalculated;
  },
};
