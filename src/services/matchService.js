import { matchRepository } from '../repositories/matchRepository';
import { auditService } from './auditService';
import { FIFA_2026_FIXTURES } from '../data/fixtures';
import { getTeam } from '../data/teams';
import { STAGE_ORDER } from '../utils/constants';

export const matchService = {
  async create(matchData, adminId, adminUsername, communityId) {
    const match = await matchRepository.create(null, {
      ...matchData,
      communityId,
      status: 'scheduled',
      result: null,
    });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'MATCH_CREATE', resource: 'matches', resourceId: match.id,
      details: { matchCode: matchData.matchCode },
    });
    return match;
  },

  async update(matchId, updates, adminId, adminUsername, communityId) {
    const updated = await matchRepository.update(matchId, updates);
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'MATCH_UPDATE', resource: 'matches', resourceId: matchId,
      details: updates,
    });
    return updated;
  },

  async delete(matchId, adminId, adminUsername, communityId) {
    await matchRepository.softDelete(matchId);
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'MATCH_DELETE', resource: 'matches', resourceId: matchId,
    });
  },

  async getByCommunity(communityId, constraints = []) {
    return matchRepository.getByCommunity(communityId, constraints);
  },

  async getByStage(communityId, stage) {
    return matchRepository.getByStage(communityId, stage);
  },

  async importFifaFixtures(communityId, adminId, adminUsername) {
    const items = FIFA_2026_FIXTURES.map((fx) => {
      const teamA = getTeam(fx.teamA);
      const teamB = getTeam(fx.teamB);
      return {
        id: `${communityId}_${fx.matchCode}`,
        data: {
          matchCode: fx.matchCode,
          teamA: { code: teamA.code, name: teamA.name, flagUrl: teamA.flag },
          teamB: { code: teamB.code, name: teamB.name, flagUrl: teamB.flag },
          stadium: fx.stadium,
          matchDate: new Date(`${fx.matchDate}T${fx.matchTime}:00`),
          matchTime: fx.matchTime,
          matchLocation: fx.location,
          stage: fx.stage,
          communityId,
          status: 'scheduled',
          result: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        type: 'set',
      };
    });
    await matchRepository.batchWrite(items);
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'MATCH_CREATE', resource: 'matches', resourceId: 'batch',
      details: { count: items.length, source: 'fifa_import' },
    });
    return items.length;
  },

  async importFromExcel(file, communityId, adminId, adminUsername) {
    const Xlsx = await import('xlsx');
    const data = await file.arrayBuffer();
    const wb = Xlsx.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = Xlsx.utils.sheet_to_json(sheet);
    const items = rows.map((row, i) => {
      const teamA = getTeam(String(row.teamA || row.TeamA || '').toUpperCase());
      const teamB = getTeam(String(row.teamB || row.TeamB || '').toUpperCase());
      return {
        id: `${communityId}_XL_${i}_${Date.now()}`,
        data: {
          matchCode: row.matchCode || `M${i + 1}`,
          teamA: { code: teamA.code, name: teamA.name, flagUrl: teamA.flag },
          teamB: { code: teamB.code, name: teamB.name, flagUrl: teamB.flag },
          stadium: row.stadium || '',
          matchDate: new Date(row.matchDate || Date.now()),
          matchTime: String(row.matchTime || '12:00'),
          matchLocation: row.location || '',
          stage: row.stage || STAGE_ORDER[0],
          communityId,
          status: 'scheduled',
          result: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        type: 'set',
      };
    });
    await matchRepository.batchWrite(items);
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'MATCH_CREATE', resource: 'matches', resourceId: 'batch',
      details: { count: items.length, source: 'excel' },
    });
    return items.length;
  },

  async updateResult(matchId, result, adminId, adminUsername, communityId) {
    const updated = await matchRepository.update(matchId, {
      result: { ...result, enteredBy: adminId },
      status: 'completed',
    });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'RESULT_UPDATE', resource: 'matches', resourceId: matchId,
      details: result,
    });
    return updated;
  },
};
