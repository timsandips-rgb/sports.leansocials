import { predictionRepository } from '../repositories/predictionRepository';
import { deadlineService } from './deadlineService';
import { auditService } from './auditService';
import { PREDICTION_STATUS, KNOCKOUT_STAGES } from '../utils/constants';
import { getWinner } from '../utils/helpers';

export const predictionService = {
  async saveDraft({ communityId, matchId, userId, username, stage, teamAScore, teamBScore, decisionMethod }) {
    const deadlinePassed = await deadlineService.isDeadlinePassed(communityId, stage);
    if (deadlinePassed) throw new Error('Deadline has passed — predictions are locked');

    const id = predictionRepository.buildId(communityId, matchId, userId);
    const existing = await predictionRepository.getById(id);
    const isKnockout = KNOCKOUT_STAGES.includes(stage);

    const data = {
      predictionId: id,
      communityId, matchId, userId, username, stage,
      teamAScore, teamBScore,
      predictedWinner: getWinner(teamAScore, teamBScore),
      decisionMethod: isKnockout ? decisionMethod : 'regular_time',
      status: PREDICTION_STATUS.DRAFT,
      lastEditedAt: new Date(),
      ...(existing ? {} : { submittedAt: null, lockedAt: null, version: 1 }),
    };

    await predictionRepository.create(id, data);
    await auditService.log({
      userId, username, communityId,
      action: 'PREDICTION_DRAFT', resource: 'predictions', resourceId: id,
      details: { matchId, teamAScore, teamBScore },
    });
    return { id, ...data };
  },

  async submit({ communityId, matchId, userId, username, stage, teamAScore, teamBScore, decisionMethod }) {
    if (teamAScore == null || teamBScore == null || Number.isNaN(Number(teamAScore)) || Number.isNaN(Number(teamBScore))) {
      throw new Error('Both scores are required');
    }
    const deadlinePassed = await deadlineService.isDeadlinePassed(communityId, stage);
    if (deadlinePassed) throw new Error('Deadline has passed — predictions are locked');

    const isKnockout = KNOCKOUT_STAGES.includes(stage);
    const id = predictionRepository.buildId(communityId, matchId, userId);
    const data = {
      predictionId: id,
      communityId, matchId, userId, username, stage,
      teamAScore: Number(teamAScore),
      teamBScore: Number(teamBScore),
      predictedWinner: getWinner(Number(teamAScore), Number(teamBScore)),
      decisionMethod: isKnockout ? (decisionMethod || 'regular_time') : 'regular_time',
      status: PREDICTION_STATUS.SUBMITTED,
      submittedAt: new Date(),
      lastEditedAt: new Date(),
      lockedAt: null,
      version: (await predictionRepository.getById(id))?.version + 1 || 1,
    };

    await predictionRepository.create(id, data);
    await auditService.log({
      userId, username, communityId,
      action: 'PREDICTION_SUBMIT', resource: 'predictions', resourceId: id,
      details: { matchId, teamAScore, teamBScore, decisionMethod: data.decisionMethod },
    });
    return { id, ...data };
  },

  async getMyPredictions(communityId, userId) {
    return predictionRepository.getByUser(communityId, userId);
  },

  async getAllPredictionsForMatch(communityId, matchId) {
    return predictionRepository.getByMatch(communityId, matchId);
  },

  async getByUserAndMatch(communityId, matchId, userId) {
    return predictionRepository.getByUserAndMatch(communityId, matchId, userId);
  },

  async lockExpiredPredictions(communityId, stage) {
    const deadlinePassed = await deadlineService.isDeadlinePassed(communityId, stage);
    if (!deadlinePassed) return 0;
    const { getDocs, query, where, collection, writeBatch, db } = await import('firebase/firestore');
    const q = query(
      collection(db, 'predictions'),
      where('communityId', '==', communityId),
      where('stage', '==', stage),
      where('status', '==', PREDICTION_STATUS.SUBMITTED)
    );
    const snap = await getDocs(q);
    if (snap.empty) return 0;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { status: PREDICTION_STATUS.LOCKED, lockedAt: new Date() }));
    await batch.commit();
    return snap.size;
  },
};
