import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FirestoreRepository } from './firestoreRepository';

class MatchRepository extends FirestoreRepository {
  constructor() { super('matches'); }

  async getByCommunity(communityId, constraints = []) {
    const q = query(collection(db, 'matches'), where('communityId', '==', communityId), ...constraints, orderBy('matchDate', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getByStage(communityId, stage) {
    return this.getByCommunity(communityId, [where('stage', '==', stage)]);
  }

  async getUpcoming(communityId, count = 5) {
    const { serverTimestamp } = await import('firebase/firestore');
    const q = query(
      collection(db, 'matches'),
      where('communityId', '==', communityId),
      where('status', '==', 'scheduled'),
      orderBy('matchDate', 'asc'),
      ...(count ? [require('firebase/firestore').limit(count)] : [])
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export const matchRepository = new MatchRepository();
