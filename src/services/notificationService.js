import { collection, doc, addDoc, getDocs, query, where, orderBy, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, messaging, VAPID_KEY } from './firebase';
import { auditService } from './auditService';
import { getToken, onMessage } from 'firebase/messaging';

export const notificationService = {
  async send({ communityId, type, title, body, targetAudience = 'all', channels = ['in_app'], sentBy, senderUsername }) {
    const notif = {
      communityId, type, title, body, targetAudience, channels,
      status: 'sent', sentAt: new Date(), sentBy, readBy: [],
    };
    const ref = await addDoc(collection(db, 'notifications'), notif);

    await auditService.log({
      userId: sentBy, username: senderUsername, communityId,
      action: 'NOTIFICATION_SENT', resource: 'notifications', resourceId: ref.id,
      details: { type, title, targetAudience },
    });

    // FCM push (best effort)
    if (channels.includes('push') && messaging) {
      try { /* FCM topic push handled server-side normally; client cannot send to others */ } catch (e) { console.warn(e); }
    }

    return { id: ref.id, ...notif };
  },

  async getByCommunity(communityId, limit = 50) {
    const q = query(
      collection(db, 'notifications'),
      where('communityId', '==', communityId),
      orderBy('sentAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() }));
  },

  subscribe(communityId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('communityId', '==', communityId),
      orderBy('sentAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  async markAsRead(notificationId, userId) {
    await updateDoc(doc(db, 'notifications', notificationId), {
      readBy: [...(await getDocs(query(collection(db, 'notifications'), where('id', '==', notificationId)))).docs[0]?.data().readBy || [], userId],
    });
  },

  async requestPushPermission() {
    if (!messaging || !VAPID_KEY) return null;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    } catch (e) {
      console.error('Push permission error:', e);
      return null;
    }
  },

  onMessageReceived(callback) {
    if (!messaging) return () => {};
    return onMessage(messaging, (payload) => callback(payload));
  },
};
