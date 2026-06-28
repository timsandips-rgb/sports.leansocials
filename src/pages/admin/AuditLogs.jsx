import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auditRepository } from '../../repositories/auditRepository';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { AUDIT_ACTIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/csvExport';
import { pdfService } from '../../services/pdfService';

export default function AuditLogs() {
  const { community } = useAuth();
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', search: '' });

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try {
      const constraints = [];
      if (filter.action) {
        const { where } = await import('firebase/firestore');
        constraints.push(where('action', '==', filter.action));
      }
      setLogs(await auditRepository.getByCommunity(community.id, constraints, 200));
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id, filter.action]);

  const filtered = logs.filter((l) =>
    !filter.search || `${l.username} ${l.action} ${l.resource}`.toLowerCase().includes(filter.search.toLowerCase())
  );

  const exportCsv = () => exportToCsv('audit_logs.csv', filtered);
  const exportPdf = () => pdfService.exportAuditLogs(filtered, community.communityName);

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={exportCsv} disabled={!filtered.length}>📊 CSV</Button>
          <Button variant="ghost" onClick={exportPdf} disabled={!filtered.length}>📄 PDF</Button>
        </div>
      </div>
      <Card>
        <div className="grid md:grid-cols-2 gap-3">
          <Select label="Filter by Action" value={filter.action} onChange={(e) => setFilter({ ...filter, action: e.target.value })}>
            <option value="">All actions</option>
            {Object.values(AUDIT_ACTIONS).map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </Select>
          <Input label="Search" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} placeholder="🔍 username, resource..." />
        </div>
      </Card>
      {filtered.length === 0 ? (
        <Card><EmptyState icon="📝" title="No audit logs found" /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>Resource ID</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 100).map((l) => (
                <tr key={l.id} className="table-row">
                  <td className="py-2 text-text-secondary">{formatDate(l.timestamp, 'MMM dd, yyyy HH:mm:ss')}</td>
                  <td className="font-mono">@{l.username}</td>
                  <td>{l.action}</td>
                  <td>{l.resource}</td>
                  <td className="font-mono text-xs text-text-secondary">{l.resourceId?.slice(0, 12)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
