import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { NOTIFICATION_TYPES } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/formatters';

export default function Notifications() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: NOTIFICATION_TYPES.BROADCAST, title: '', body: '', targetAudience: 'all' });

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try { setNotifications(await notificationService.getByCommunity(community.id)); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id]);

  const send = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return toast.error('Title and body required');
    try {
      await notificationService.send({
        communityId: community.id, type: form.type, title: form.title, body: form.body,
        targetAudience: form.targetAudience, channels: ['in_app', 'push'],
        sentBy: user.userId, senderUsername: user.username,
      });
      toast.success('Notification sent');
      setForm({ type: NOTIFICATION_TYPES.BROADCAST, title: '', body: '', targetAudience: 'all' });
      load();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notification Center</h1>
      <Card>
        <h3 className="font-semibold mb-3">Send Notification</h3>
        <form onSubmit={send} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(NOTIFICATION_TYPES).map(([k, v]) => <option key={k} value={v}>{k.replace(/_/g, ' ')}</option>)}
            </Select>
            <Select label="Audience" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}>
              <option value="all">All Members</option>
              <option value="community">Community</option>
            </Select>
          </div>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Button type="submit">📤 Send Notification</Button>
        </form>
      </Card>

      {notifications.length === 0 ? (
        <Card><EmptyState icon="🔔" title="No notifications yet" /></Card>
      ) : (
        <Card>
          <h3 className="font-semibold mb-3">Recent Notifications</h3>
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="p-3 border-b border-surface last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-text-secondary text-sm">{n.body}</p>
                    <Badge className="mt-1">{n.type}</Badge>
                  </div>
                  <span className="text-xs text-text-secondary">{formatTimeAgo(n.sentAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
