import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FirestoreRepository } from './firestoreRepository';

class CommunityRepository extends FirestoreRepository {
  constructor() { super('communities'); }

  async getByCode(code) {
    const q = query(collection(db, 'communities'), where('communityCode', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  async existsByCode(code, excludeId = null) {
    const q = query(collection(db, 'communities'), where('communityCode', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    if (excludeId && snap.docs[0].id === excludeId) return false;
    return true;
  }

  async incrementMemberCount(communityId, delta = 1) {
    const community = await this.getById(communityId);
    if (!community) return;
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'communities', communityId), {
      memberCount: (community.memberCount || 0) + delta,
      updatedAt: new Date(),
    });
  }
}

export const communityRepository = new CommunityRepository();
