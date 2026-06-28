import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { USER_STATUS, ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export default function Users() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try { setUsers(await userService.getByCommunity(community.id)); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id]);

  const handleAction = async (userId, action) => {
    try {
      const statusMap = { approve: USER_STATUS.APPROVED, reject: USER_STATUS.REJECTED, suspend: USER_STATUS.SUSPENDED };
      await userService.updateStatus(userId, statusMap[action], user.userId, user.username, community.id);
      toast.success(`User ${action}d`);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const generateToken = async (userId) => {
    try {
      const { token, expiry } = await authService.generateLoginToken(userId, user.userId, user.username, community.id);
      toast.success(`Token generated (expires ${formatDate(expiry)}): ${token}`, 8000);
    } catch (e) { toast.error(e.message); }
  };

  const filtered = users.filter((u) => {
    if (filter !== 'all' && u.status !== filter) return false;
    if (search && !`${u.fullName} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="flex flex-wrap gap-2 items-center">
        {['all', USER_STATUS.PENDING, USER_STATUS.APPROVED, USER_STATUS.SUSPENDED].map((s) => (
          <Button key={s} variant={filter === s ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === USER_STATUS.PENDING && users.filter((u) => u.status === s).length > 0 && (
              <span className="ml-1 bg-warning text-primary px-1.5 rounded-full text-xs">{users.filter((u) => u.status === s).length}</span>
            )}
          </Button>
        ))}
        <Input placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="ml-auto max-w-xs" />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon="👥" title="No users found" /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Registered</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="py-3">{u.fullName}</td>
                  <td className="font-mono">@{u.username}</td>
                  <td className="text-text-secondary">{u.email}</td>
                  <td><Badge variant={u.role === ROLES.SUPER_ADMIN ? 'accent' : u.role === ROLES.COMMUNITY_ADMIN ? 'info' : 'default'}>{u.role}</Badge></td>
                  <td><Badge variant={u.status === USER_STATUS.APPROVED ? 'success' : u.status === USER_STATUS.PENDING ? 'warning' : 'danger'}>{u.status}</Badge></td>
                  <td className="text-text-secondary">{formatDate(u.registrationDate)}</td>
                  <td>
                    <div className="flex gap-1">
                      {u.status === USER_STATUS.PENDING && <Button size="sm" variant="success" onClick={() => handleAction(u.id, 'approve')}>✓</Button>}
                      {u.status === USER_STATUS.PENDING && <Button size="sm" variant="danger" onClick={() => handleAction(u.id, 'reject')}>✕</Button>}
                      {u.status === USER_STATUS.APPROVED && <Button size="sm" variant="warning" onClick={() => handleAction(u.id, 'suspend')}>⏸</Button>}
                      {u.status === USER_STATUS.SUSPENDED && <Button size="sm" variant="success" onClick={() => handleAction(u.id, 'approve')}>▶</Button>}
                      <Button size="sm" variant="ghost" onClick={() => generateToken(u.id)}>🔑</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
