import { communityRepository } from '../repositories/communityRepository';
import { auditService } from './auditService';
import { DEFAULT_COMMUNITY_SETTINGS, DEFAULT_SCORING_RULES } from '../utils/constants';
import { validateCommunityCode } from '../utils/validators';

export const communityService = {
  async create({ communityName, communityCode, description, logoUrl, settings, createdBy, creatorUsername }) {
    const codeErr = validateCommunityCode(communityCode);
    if (codeErr) throw new Error(codeErr);
    if (await communityRepository.existsByCode(communityCode)) {
      throw new Error('Community code already in use');
    }
    const mergedSettings = {
      ...DEFAULT_COMMUNITY_SETTINGS,
      ...settings,
      scoringRules: { ...DEFAULT_SCORING_RULES, ...(settings?.scoringRules || {}) },
    };
    const data = {
      communityName,
      communityCode: communityCode.toUpperCase(),
      description: description || '',
      logoUrl: logoUrl || '',
      status: 'active',
      createdBy,
      settings: mergedSettings,
      memberCount: 0,
    };
    const community = await communityRepository.create(null, data);
    await auditService.log({
      userId: createdBy, username: creatorUsername, communityId: community.id,
      action: 'COMMUNITY_CREATE', resource: 'communities', resourceId: community.id,
      details: { communityName, communityCode },
    });
    return community;
  },

  async update(communityId, updates, adminId, adminUsername) {
    if (updates.communityCode && (await communityRepository.existsByCode(updates.communityCode, communityId))) {
      throw new Error('Community code already in use');
    }
    const updated = await communityRepository.update(communityId, updates);
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'COMMUNITY_UPDATE', resource: 'communities', resourceId: communityId,
      details: updates,
    });
    return updated;
  },

  async getById(id) { return communityRepository.getById(id); },
  async getByCode(code) { return communityRepository.getByCode(code); },
  async getAll() {
    const { getDocs, collection, db } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'communities'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async updateScoringRules(communityId, scoringRules, adminId, adminUsername) {
    const community = await communityRepository.getById(communityId);
    const settings = { ...community.settings, scoringRules };
    const updated = await communityRepository.update(communityId, { settings });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'SETTINGS_CHANGE', resource: 'communities', resourceId: communityId,
      details: { scoringRules },
    });
    return updated;
  },

  async toggleStatus(communityId, status, adminId, adminUsername) {
    const updated = await communityRepository.update(communityId, { status });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'COMMUNITY_UPDATE', resource: 'communities', resourceId: communityId,
      details: { status },
    });
    return updated;
  },
};
