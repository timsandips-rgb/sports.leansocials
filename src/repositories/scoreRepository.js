import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FirestoreRepository } from './firestoreRepository';

class ScoreRepository extends FirestoreRepository {
  constructor() { super('scores'); }

  buildId(communityId, matchId, userId) {
    return `${communityId}_${matchId}_${userId}`;
  }

  async getByUser(communityId, userId) {
    const q = query(collection(db, 'scores'), where('communityId', '==', communityId), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getByMatch(communityId, matchId) {
    const q = query(collection(db, 'scores'), where('communityId', '==', communityId), where('matchId', '==', matchId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export const scoreRepository = new ScoreRepository();
