import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { deadlineService } from '../../services/deadlineService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { STAGE_ORDER, STAGE_LABELS } from '../../utils/constants';
import { formatDate, isDeadlinePassed } from '../../utils/formatters';

export default function Deadlines() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ stage: STAGE_ORDER[0], deadlineDateTime: '' });

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try { setDeadlines(await deadlineService.getAll(community.id)); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id]);

  const setDeadline = async (e) => {
    e.preventDefault();
    if (!form.deadlineDateTime) return toast.error('Pick a date and time');
    try {
      await deadlineService.setDeadline(community.id, form.stage, new Date(form.deadlineDateTime), user.userId, user.username);
      toast.success('Deadline set');
      load();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deadline Management</h1>
      <Card>
        <h3 className="font-semibold mb-3">Set Deadline</h3>
        <form onSubmit={setDeadline} className="grid md:grid-cols-3 gap-3 items-end">
          <Select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </Select>
          <Input label="Deadline Date & Time" type="datetime-local" value={form.deadlineDateTime}
            onChange={(e) => setForm({ ...form, deadlineDateTime: e.target.value })} />
          <Button type="submit">Set Deadline</Button>
        </form>
      </Card>

      {deadlines.length === 0 ? (
        <Card><EmptyState icon="⏰" title="No deadlines set" description="Set deadlines to lock predictions per stage" /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Stage</th><th>Deadline</th><th>Status</th><th>Modifications</th>
            </tr></thead>
            <tbody>
              {deadlines.map((d) => (
                <tr key={d.id} className="table-row">
                  <td className="py-3">{STAGE_LABELS[d.stage] || d.stage}</td>
                  <td>{formatDate(d.deadlineDateTime, 'MMM dd, yyyy HH:mm')}</td>
                  <td>{isDeadlinePassed(d.deadlineDateTime) ? <span className="text-red-400">Passed</span> : <span className="text-success">Active</span>}</td>
                  <td className="text-text-secondary">{d.modificationHistory?.length || 0} changes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
