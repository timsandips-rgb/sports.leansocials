import { userRepository } from '../repositories/userRepository';
import { communityRepository } from '../repositories/communityRepository';
import { auditService } from './auditService';
import { USER_STATUS } from '../utils/constants';

export const userService = {
  async getById(id) { return userRepository.getById(id); },

  async getByCommunity(communityId, status = null) {
    return userRepository.getByCommunity(communityId, status);
  },

  async updateStatus(userId, status, adminId, adminUsername, communityId, reason = '') {
    const user = await userRepository.getById(userId);
    if (!user) throw new Error('User not found');
    await userRepository.update(userId, { status });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: status === USER_STATUS.APPROVED ? 'USER_APPROVAL'
            : status === USER_STATUS.REJECTED ? 'USER_REJECTION'
            : 'USER_SUSPENSION',
      resource: 'users', resourceId: userId,
      details: { previousStatus: user.status, newStatus: status, reason },
    });
    if (status === USER_STATUS.REJECTED) {
      await communityRepository.incrementMemberCount(communityId, -1);
    }
    return { ...user, status };
  },

  async updateRole(userId, role, adminId, adminUsername, communityId) {
    await userRepository.update(userId, { role });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'USER_APPROVAL', resource: 'users', resourceId: userId,
      details: { newRole: role },
    });
  },

  async updateProfile(userId, updates) {
    return userRepository.update(userId, updates);
  },

  async getStats(communityId) {
    const [pending, approved] = await Promise.all([
      userRepository.countPending(communityId),
      userRepository.countApproved(communityId),
    ]);
    return { pending, approved, total: pending + approved };
  },
};
