import { auditRepository } from '../repositories/auditRepository';

export const auditService = {
  async log({ userId, username, communityId, action, resource, resourceId, details = {} }) {
    try {
      await auditRepository.log({
        userId,
        username,
        communityId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: 'client',
        userAgent: navigator.userAgent,
        sessionId: sessionStorage.getItem('sessionId') || 'unknown',
        timestamp: new Date(),
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }
  },
};
