import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FirestoreRepository } from './firestoreRepository';

class UserRepository extends FirestoreRepository {
  constructor() { super('users'); }

  async getByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  async getByUsername(username) {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  async getByCommunity(communityId, status = null) {
    const constraints = [];
    if (status) constraints.push(where('status', '==', status));
    return this.getByCommunity(communityId, constraints, 500);
  }

  async countPending(communityId) {
    const q = query(collection(db, 'users'), where('communityId', '==', communityId), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.size;
  }

  async countApproved(communityId) {
    const q = query(collection(db, 'users'), where('communityId', '==', communityId), where('status', '==', 'approved'));
    const snap = await getDocs(q);
    return snap.size;
  }
}

export const userRepository = new UserRepository();
