import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { matchService } from '../../services/matchService';
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
import { STAGES, STAGE_LABELS, STAGE_ORDER, MATCH_STATUS } from '../../utils/constants';
import { TEAMS } from '../../data/teams';
import { formatDate } from '../../utils/formatters';

export default function Matches() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    matchCode: '', teamA: '', teamB: '', stadium: '', matchDate: '', matchTime: '12:00', matchLocation: '', stage: STAGES.GROUP_STAGE,
  });

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try { setMatches(await matchService.getByCommunity(community.id)); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id]);

  const importFixtures = async () => {
    try {
      const count = await matchService.importFifaFixtures(community.id, user.userId, user.username);
      toast.success(`Imported ${count} fixtures`);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await matchService.importFromExcel(file, community.id, user.userId, user.username);
      toast.success(`Imported ${count} matches from Excel`);
      load();
    } catch (err) { toast.error(err.message); }
    e.target.value = '';
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      const teamA = TEAMS.find((t) => t.code === form.teamA);
      const teamB = TEAMS.find((t) => t.code === form.teamB);
      await matchService.create({
        matchCode: form.matchCode,
        teamA: { code: teamA.code, name: teamA.name, flagUrl: teamA.flag },
        teamB: { code: teamB.code, name: teamB.name, flagUrl: teamB.flag },
        stadium: form.stadium,
        matchDate: new Date(`${form.matchDate}T${form.matchTime}:00`),
        matchTime: form.matchTime,
        matchLocation: form.matchLocation,
        stage: form.stage,
      }, user.userId, user.username, community.id);
      toast.success('Match created');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Match Management</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={importFixtures}>📥 Import FIFA Fixtures</Button>
          <label>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
            <span className="btn-secondary cursor-pointer">📊 Excel Upload</span>
          </label>
          <Button onClick={() => setModalOpen(true)}>+ New Match</Button>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card><EmptyState icon="⚽" title="No matches yet" description="Import FIFA fixtures or add matches manually" action={<Button onClick={importFixtures}>Import FIFA Fixtures</Button>} /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Code</th><th>Match</th><th>Stage</th><th>Date</th><th>Status</th>
            </tr></thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="table-row">
                  <td className="py-3 font-mono">{m.matchCode}</td>
                  <td>
                    <Flag code={m.teamA.code} flag={m.teamA.flagUrl} name={m.teamA.name} size="sm" /> {m.teamA.code}
                    <span className="mx-2 text-text-secondary">vs</span>
                    {m.teamB.code} <Flag code={m.teamB.code} flag={m.teamB.flagUrl} name={m.teamB.name} size="sm" />
                  </td>
                  <td>{STAGE_LABELS[m.stage] || m.stage}</td>
                  <td className="text-text-secondary">{formatDate(m.matchDate)}</td>
                  <td><Badge variant={m.status === 'completed' ? 'success' : m.status === 'live' ? 'danger' : 'info'}>{m.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Match" size="lg">
        <form onSubmit={create} className="space-y-4">
          <Input label="Match Code" placeholder="GS-A1" value={form.matchCode} onChange={(e) => setForm({ ...form, matchCode: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Team A" value={form.teamA} onChange={(e) => setForm({ ...form, teamA: e.target.value })} required>
              <option value="">Select team...</option>
              {TEAMS.map((t) => <option key={t.code} value={t.code}>{t.flag} {t.name}</option>)}
            </Select>
            <Select label="Team B" value={form.teamB} onChange={(e) => setForm({ ...form, teamB: e.target.value })} required>
              <option value="">Select team...</option>
              {TEAMS.map((t) => <option key={t.code} value={t.code}>{t.flag} {t.name}</option>)}
            </Select>
          </div>
          <Input label="Stadium" value={form.stadium} onChange={(e) => setForm({ ...form, stadium: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Match Date" type="date" value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })} required />
            <Input label="Match Time" type="time" value={form.matchTime} onChange={(e) => setForm({ ...form, matchTime: e.target.value })} required />
          </div>
          <Input label="Location" value={form.matchLocation} onChange={(e) => setForm({ ...form, matchLocation: e.target.value })} />
          <Select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Match</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
