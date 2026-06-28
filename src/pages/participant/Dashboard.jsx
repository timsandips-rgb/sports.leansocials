import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { matchService } from '../../services/matchService';
import { predictionService } from '../../services/predictionService';
import { leaderboardService } from '../../services/leaderboardService';
import { deadlineService } from '../../services/deadlineService';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Flag from '../../components/Flag';
import DeadlineCountdown from '../../components/DeadlineCountdown';
import { formatDate } from '../../utils/formatters';
import { STAGE_LABELS } from '../../utils/constants';

export default function ParticipantDashboard() {
  const { user, community } = useAuth();
  const [data, setData] = useState({ matches: [], predictions: [], top5: [], myRank: null, nextDeadline: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!community?.id || !user?.userId) return;
      try {
        const [matches, predictions, top5, myRank, deadlines] = await Promise.all([
          matchService.getByCommunity(community.id),
          predictionService.getMyPredictions(community.id, user.userId),
          leaderboardService.getTopN(community.id, 5),
          leaderboardService.getUserRank(community.id, user.userId),
          deadlineService.getAll(community.id),
        ]);
        const upcoming = matches.filter((m) => m.status === 'scheduled').slice(0, 5);
        const nextDeadline = deadlines.find((d) => new Date(d.deadlineDateTime?.seconds * 1000 || d.deadlineDateTime) > new Date());
        setData({ matches: upcoming, predictions, top5, myRank, nextDeadline });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [community?.id, user?.userId]);

  if (loading) return <Spinner className="py-20" />;

  const submitted = data.predictions.filter((p) => p.status === 'submitted' || p.status === 'locked').length;
  const pending = data.matches.filter((m) => !data.predictions.find((p) => p.matchId === m.id)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {user?.fullName?.split(' ')[0]}! 🎉</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><p className="text-text-secondary text-sm">Submitted</p><p className="text-3xl font-bold text-success mt-2">{submitted}</p></Card>
        <Card><p className="text-text-secondary text-sm">Pending</p><p className="text-3xl font-bold text-warning mt-2">{pending}</p></Card>
        <Card><p className="text-text-secondary text-sm">Your Points</p><p className="text-3xl font-bold text-accent mt-2">{data.myRank?.totalPoints || 0}</p></Card>
        <Card><p className="text-text-secondary text-sm">Your Rank</p><p className="text-3xl font-bold mt-2">#{data.myRank?.rank || '-'}</p></Card>
      </div>

      {data.nextDeadline && (
        <DeadlineCountdown deadline={data.nextDeadline.deadlineDateTime} label={`${STAGE_LABELS[data.nextDeadline.stage] || 'Stage'} predictions close in`} />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-3">Upcoming Matches</h3>
          {data.matches.length === 0 ? <p className="text-text-secondary text-sm">No upcoming matches</p> : (
            <ul className="space-y-2">
              {data.matches.map((m) => (
                <li key={m.id} className="flex justify-between items-center py-2 border-b border-surface last:border-0">
                  <div className="flex items-center gap-2">
                    <Flag flag={m.teamA.flagUrl} size="sm" /> {m.teamA.code} vs {m.teamB.code} <Flag flag={m.teamB.flagUrl} size="sm" />
                    <span className="text-xs text-text-secondary">{formatDate(m.matchDate)}</span>
                  </div>
                  <Link to="/app/predictions"><Button size="sm">Predict</Button></Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Top 5 Leaderboard</h3>
          {data.top5.length === 0 ? <p className="text-text-secondary text-sm">No rankings yet</p> : (
            <ol className="space-y-2">
              {data.top5.map((r, i) => (
                <li key={r.userId} className="flex justify-between items-center py-2 border-b border-surface last:border-0">
                  <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} @{r.username}</span>
                  <span className="font-bold">{r.totalPoints} pts</span>
                </li>
              ))}
              {data.myRank && !data.top5.find((r) => r.userId === user.userId) && (
                <li className="flex justify-between items-center py-2 bg-accent/10 px-2 rounded">
                  <span>★ You (#{data.myRank.rank})</span>
                  <span className="font-bold">{data.myRank.totalPoints} pts</span>
                </li>
              )}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
