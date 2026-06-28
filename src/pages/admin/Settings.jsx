import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { communityService } from '../../services/communityService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';

export default function Settings() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    communityName: community?.communityName || '',
    description: community?.description || '',
    status: community?.status || 'active',
    scoringRules: community?.settings?.scoringRules || { correctWinner: 5, correctExactScore: 5, correctDecisionMethod: 5, allCorrectBonus: 10, maxScorePerMatch: 25 },
    allowLateRegistration: community?.settings?.allowLateRegistration || false,
    predictionVisibility: community?.settings?.predictionVisibility || 'after_deadline',
    timezone: community?.settings?.timezone || 'America/New_York',
  });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await communityService.update(community.id, {
        communityName: form.communityName, description: form.description, status: form.status,
        settings: {
          scoringRules: form.scoringRules,
          allowLateRegistration: form.allowLateRegistration,
          predictionVisibility: form.predictionVisibility,
          timezone: form.timezone,
        },
      }, user.userId, user.username);
      toast.success('Settings saved');
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  if (!community) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Community Settings</h1>
      <form onSubmit={save} className="space-y-6">
        <Card>
          <h3 className="font-semibold mb-3">General</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Community Name" value={form.communityName} onChange={(e) => setForm({ ...form, communityName: e.target.value })} />
            <Input label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              <option>America/New_York</option><option>America/Chicago</option>
              <option>America/Denver</option><option>America/Los_Angeles</option>
              <option>Europe/London</option><option>Asia/Kolkata</option><option>UTC</option>
            </Select>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Scoring Rules</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(form.scoringRules).map(([k, v]) => (
              <Input key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} type="number" value={v}
                onChange={(e) => setForm({ ...form, scoringRules: { ...form.scoringRules, [k]: Number(e.target.value) } })} />
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Prediction Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.allowLateRegistration} onChange={(e) => setForm({ ...form, allowLateRegistration: e.target.checked })} />
              <span>Allow late registration</span>
            </label>
            <Select label="Prediction Visibility" value={form.predictionVisibility} onChange={(e) => setForm({ ...form, predictionVisibility: e.target.value })}>
              <option value="after_deadline">After Deadline</option>
              <option value="after_result">After Result Published</option>
            </Select>
          </div>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </form>
    </div>
  );
}
