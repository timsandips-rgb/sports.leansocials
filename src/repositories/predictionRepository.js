import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FirestoreRepository } from './firestoreRepository';

class PredictionRepository extends FirestoreRepository {
  constructor() { super('predictions'); }

  buildId(communityId, matchId, userId) {
    return `${communityId}_${matchId}_${userId}`;
  }

  async getByUser(communityId, userId) {
    const q = query(
      collection(db, 'predictions'),
      where('communityId', '==', communityId),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getByMatch(communityId, matchId) {
    const q = query(
      collection(db, 'predictions'),
      where('communityId', '==', communityId),
      where('matchId', '==', matchId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getByUserAndMatch(communityId, matchId, userId) {
    const id = this.buildId(communityId, matchId, userId);
    return this.getById(id);
  }
}

export const predictionRepository = new PredictionRepository();
