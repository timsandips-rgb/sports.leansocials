import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { auditService } from './auditService';

export const deadlineService = {
  async getByStage(communityId, stage) {
    const deadlineId = `${communityId}__${stage}`;
    const snap = await getDoc(doc(db, 'deadlines', deadlineId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getAll(communityId) {
    const q = query(collection(db, 'deadlines'), where('communityId', '==', communityId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async isDeadlinePassed(communityId, stage) {
    const deadline = await this.getByStage(communityId, stage);
    if (!deadline) return false; // no deadline set = always open
    const d = deadline.deadlineDateTime?.toDate ? deadline.deadlineDateTime.toDate() : new Date(deadline.deadlineDateTime);
    return d < new Date();
  },

  async setDeadline(communityId, stage, deadlineDateTime, adminId, adminUsername) {
    const deadlineId = `${communityId}__${stage}`;
    const existing = await this.getByStage(communityId, stage);
    const modificationHistory = existing?.modificationHistory || [];

    if (existing) {
      modificationHistory.push({
        modifiedBy: adminId,
        previousDeadline: existing.deadlineDateTime,
        newDeadline: deadlineDateTime,
        modifiedAt: new Date(),
      });
    }

    const data = {
      deadlineId, communityId, stage,
      deadlineDateTime,
      isLocked: false,
      lockedAt: null,
      createdBy: existing?.createdBy || adminId,
      modifiedBy: adminId,
      modificationHistory,
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'deadlines', deadlineId), data, { merge: true });

    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'DEADLINE_CHANGE', resource: 'deadlines', resourceId: deadlineId,
      details: { stage, deadlineDateTime, previous: existing?.deadlineDateTime },
    });

    return data;
  },

  async lockStage(communityId, stage, adminId, adminUsername) {
    const deadlineId = `${communityId}__${stage}`;
    await updateDoc(doc(db, 'deadlines', deadlineId), { isLocked: true, lockedAt: new Date() });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'DEADLINE_CHANGE', resource: 'deadlines', resourceId: deadlineId,
      details: { stage, locked: true },
    });
  },
};
