import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { matchService } from '../../services/matchService';
import { deadlineService } from '../../services/deadlineService';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import { STAGE_LABELS } from '../../utils/constants';

export default function AdminDashboard() {
  const { user, community } = useAuth();
  const [stats, setStats] = useState({ users: {}, matches: [], deadlines: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!community?.id) return;
      try {
        const [users, matches, deadlines] = await Promise.all([
          userService.getStats(community.id),
          matchService.getByCommunity(community.id),
          deadlineService.getAll(community.id),
        ]);
        setStats({ users, matches, deadlines });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [community?.id]);

  if (loading) return <Spinner className="py-20" />;

  const upcomingMatches = stats.matches.filter((m) => m.status === 'scheduled').slice(0, 5);
  const matchesLeft = stats.matches.filter((m) => m.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><p className="text-text-secondary text-sm">Total Users</p><p className="text-3xl font-bold mt-2">{stats.users.total || 0}</p></Card>
        <Card><p className="text-text-secondary text-sm">Approved</p><p className="text-3xl font-bold text-success mt-2">{stats.users.approved || 0}</p></Card>
        <Card><p className="text-text-secondary text-sm">Pending</p><p className="text-3xl font-bold text-warning mt-2">{stats.users.pending || 0}</p></Card>
        <Card><p className="text-text-secondary text-sm">Matches Left</p><p className="text-3xl font-bold text-accent mt-2">{matchesLeft}</p></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-3">Upcoming Matches</h3>
          {upcomingMatches.length === 0 ? <p className="text-text-secondary text-sm">No upcoming matches</p> : (
            <ul className="space-y-2">
              {upcomingMatches.map((m) => (
                <li key={m.id} className="flex justify-between text-sm py-2 border-b border-surface last:border-0">
                  <span>{m.teamA.flag} {m.teamA.code} vs {m.teamB.code} {m.teamB.flag}</span>
                  <span className="text-text-secondary">{formatDate(m.matchDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Upcoming Deadlines</h3>
          {stats.deadlines.length === 0 ? <p className="text-text-secondary text-sm">No deadlines set</p> : (
            <ul className="space-y-2">
              {stats.deadlines.map((d) => (
                <li key={d.id} className="flex justify-between text-sm py-2 border-b border-surface last:border-0">
                  <span>{STAGE_LABELS[d.stage] || d.stage}</span>
                  <span className="text-text-secondary">{formatDate(d.deadlineDateTime)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
