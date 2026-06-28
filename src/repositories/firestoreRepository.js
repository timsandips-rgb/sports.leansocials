import {
  collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter,
  addDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';

export class FirestoreRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  async getById(id) {
    const snap = await getDoc(doc(db, this.collectionName, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  async getByField(field, value, constraints = []) {
    const q = query(this.collectionRef, where(field, '==', value), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getByCommunity(communityId, constraints = [], pageSize = 50) {
    const q = query(this.collectionRef, where('communityId', '==', communityId), ...constraints, limit(pageSize));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async create(id, data) {
    const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    if (id) {
      await setDoc(doc(db, this.collectionName, id), payload);
      return { id, ...payload };
    }
    const ref = await addDoc(this.collectionRef, payload);
    return { id: ref.id, ...payload };
  }

  async update(id, data) {
    await updateDoc(doc(db, this.collectionName, id), { ...data, updatedAt: serverTimestamp() });
    return { id, ...data };
  }

  async softDelete(id) {
    return this.update(id, { status: 'deleted', deletedAt: serverTimestamp() });
  }

  async batchWrite(items) {
    const batch = writeBatch(db);
    items.forEach(({ id, data, type = 'set' }) => {
      const ref = doc(db, this.collectionName, id);
      if (type === 'set') batch.set(ref, data);
      else if (type === 'update') batch.update(ref, data);
      else if (type === 'delete') batch.delete(ref);
    });
    await batch.commit();
  }

  subscribe(communityId, constraints, callback) {
    const q = query(this.collectionRef, where('communityId', '==', communityId), ...constraints);
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }
}
