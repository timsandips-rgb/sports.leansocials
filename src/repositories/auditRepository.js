import { FirestoreRepository } from './firestoreRepository';

class AuditRepository extends FirestoreRepository {
  constructor() { super('audit_logs'); }

  async log(entry) {
    return this.create(null, entry);
  }
}

export const auditRepository = new AuditRepository();
