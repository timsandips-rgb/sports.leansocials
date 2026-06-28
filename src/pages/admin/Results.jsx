import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { matchService } from '../../services/matchService';
import { resultService } from '../../services/resultService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Flag from '../../components/Flag';
import { KNOCKOUT_STAGES, DECISION_METHODS, STAGE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export default function Results() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMatch, setModalMatch] = useState(null);
  const [form, setForm] = useState({ teamAScore: '', teamBScore: '', decisionMethod: DECISION_METHODS.REGULAR_TIME });

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try { setMatches(await matchService.getByCommunity(community.id)); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id]);

  const openResult = (m) => {
    setModalMatch(m);
    setForm({
      teamAScore: m.result?.teamAScore ?? '',
      teamBScore: m.result?.teamBScore ?? '',
      decisionMethod: m.result?.decisionMethod || DECISION_METHODS.REGULAR_TIME,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await resultService.enterResult(modalMatch.id, form, user.userId, user.username, community.id);
      toast.success('Result saved and scores calculated');
      setModalMatch(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const recalcAll = async () => {
    try {
      const count = await resultService.recalculateAll(community.id, user.userId, user.username);
      toast.success(`Recalculated ${count} scores`);
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Result Management</h1>
        <Button variant="secondary" onClick={recalcAll}>🔄 Recalculate All Scores</Button>
      </div>
      {matches.length === 0 ? (
        <Card><EmptyState icon="🎯" title="No matches" description="Add matches before entering results" /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Match</th><th>Stage</th><th>Date</th><th>Result</th><th>Action</th>
            </tr></thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="table-row">
                  <td className="py-3">
                    <Flag code={m.teamA.code} flag={m.teamA.flagUrl} size="sm" /> {m.teamA.code} vs {m.teamB.code} <Flag code={m.teamB.code} flag={m.teamB.flagUrl} size="sm" />
                  </td>
                  <td>{STAGE_LABELS[m.stage] || m.stage}</td>
                  <td className="text-text-secondary">{formatDate(m.matchDate)}</td>
                  <td>
                    {m.result ? <Badge variant="success">{m.result.teamAScore} - {m.result.teamBScore}</Badge> : <Badge>Not set</Badge>}
                  </td>
                  <td><Button size="sm" onClick={() => openResult(m)}>{m.result ? 'Edit' : 'Enter Result'}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={!!modalMatch} onClose={() => setModalMatch(null)} title="Enter Result" size="sm">
        {modalMatch && (
          <form onSubmit={submit} className="space-y-4">
            <div className="text-center">
              <p>{modalMatch.teamA.flag} {modalMatch.teamA.name} vs {modalMatch.teamB.name} {modalMatch.teamB.flag}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label={`${modalMatch.teamA.code} Score`} type="number" min="0" value={form.teamAScore}
                onChange={(e) => setForm({ ...form, teamAScore: e.target.value })} required />
              <Input label={`${modalMatch.teamB.code} Score`} type="number" min="0" value={form.teamBScore}
                onChange={(e) => setForm({ ...form, teamBScore: e.target.value })} required />
            </div>
            {KNOCKOUT_STAGES.includes(modalMatch.stage) && (
              <Select label="Decision Method" value={form.decisionMethod} onChange={(e) => setForm({ ...form, decisionMethod: e.target.value })}>
                <option value="regular_time">Regular Time</option>
                <option value="extra_time">Extra Time</option>
                <option value="penalty_shootout">Penalty Shootout</option>
              </Select>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalMatch(null)}>Cancel</Button>
              <Button type="submit">Save Result</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
