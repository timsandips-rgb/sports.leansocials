import { collection, addDoc, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export const messageService = {
  async send({ communityId, senderId, senderName, recipientId = 'all', type = 'general', content }) {
    const msg = {
      communityId, senderId, senderName, recipientId, type, content,
      createdAt: new Date(), readAt: null,
    };
    const ref = await addDoc(collection(db, 'messages'), msg);
    return { id: ref.id, ...msg };
  },

  async getByCommunity(communityId, limit = 100) {
    const q = query(collection(db, 'messages'), where('communityId', '==', communityId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() }));
  },

  subscribe(communityId, callback) {
    const q = query(collection(db, 'messages'), where('communityId', '==', communityId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  },
};
