import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { communityService } from '../../services/communityService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import { DEFAULT_SCORING_RULES } from '../../utils/constants';

export default function Communities() {
  const { user } = useAuth();
  const toast = useToast();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    communityName: '', communityCode: '', description: '', status: 'active',
    scoringRules: DEFAULT_SCORING_RULES,
  });

  const load = async () => {
    setLoading(true);
    try { setCommunities(await communityService.getAll()); } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ communityName: '', communityCode: '', description: '', status: 'active', scoringRules: DEFAULT_SCORING_RULES });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      communityName: c.communityName, communityCode: c.communityCode, description: c.description,
      status: c.status, scoringRules: c.settings?.scoringRules || DEFAULT_SCORING_RULES,
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await communityService.update(editing.id, {
          communityName: form.communityName, description: form.description, status: form.status,
          settings: { ...editing.settings, scoringRules: form.scoringRules },
        }, user.userId, user.username);
        toast.success('Community updated');
      } else {
        await communityService.create({
          communityName: form.communityName, communityCode: form.communityCode,
          description: form.description, settings: { scoringRules: form.scoringRules },
          createdBy: user.userId, creatorUsername: user.username,
        });
        toast.success('Community created');
      }
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Button onClick={openCreate}>+ New Community</Button>
      </div>
      {communities.length === 0 ? (
        <Card><EmptyState icon="🏢" title="No communities yet" description="Create your first community to get started" action={<Button onClick={openCreate}>Create Community</Button>} /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Name</th><th>Code</th><th>Members</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {communities.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="py-3">{c.communityName}</td>
                  <td className="font-mono text-text-secondary">{c.communityCode}</td>
                  <td>{c.memberCount || 0}</td>
                  <td><Badge variant={c.status === 'active' ? 'success' : 'danger'}>{c.status}</Badge></td>
                  <td><Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Community' : 'Create Community'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Input label="Community Name" value={form.communityName} onChange={(e) => setForm({ ...form, communityName: e.target.value })} required />
          <Input label="Community Code" placeholder="WC2026-OFFICE" value={form.communityCode} disabled={!!editing}
            onChange={(e) => setForm({ ...form, communityCode: e.target.value.toUpperCase() })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="label">Scoring Configuration</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {Object.entries(form.scoringRules).map(([k, v]) => (
                <Input key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} type="number" value={v}
                  onChange={(e) => setForm({ ...form, scoringRules: { ...form.scoringRules, [k]: Number(e.target.value) } })} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
