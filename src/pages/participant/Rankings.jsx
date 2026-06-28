import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { leaderboardService } from '../../services/leaderboardService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { STAGE_ORDER, STAGE_LABELS } from '../../utils/constants';
import { pdfService } from '../../services/pdfService';

export default function Rankings() {
  const { user, community } = useAuth();
  const [stage, setStage] = useState('overall');
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!community?.id) return;
      setLoading(true);
      try { setLeaderboard(await leaderboardService.getLeaderboard(community.id, stage)); }
      catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [community?.id, stage]);

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Community Rankings</h1>
        <div className="flex gap-2">
          <Select value={stage} onChange={(e) => setStage(e.target.value)} className="max-w-xs">
            <option value="overall">Overall</option>
            {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </Select>
          {leaderboard && <Button variant="ghost" onClick={() => pdfService.exportLeaderboard(leaderboard, community.communityName, stage)}>📄 PDF</Button>}
        </div>
      </div>
      {!leaderboard || !leaderboard.rankings?.length ? (
        <Card><EmptyState icon="🏆" title="No rankings yet" description="Rankings appear after results are entered and leaderboards generated" /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Rank</th><th>Username</th><th>Points</th><th>Matches</th><th>Perfect</th><th>Exact Scores</th>
            </tr></thead>
            <tbody>
              {leaderboard.rankings.map((r) => (
                <tr key={r.userId} className={`table-row ${r.userId === user.userId ? 'bg-accent/10' : ''}`}>
                  <td className="py-2">{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</td>
                  <td className="font-mono">@{r.username}{r.userId === user.userId && <span className="ml-2 text-accent text-xs">(You)</span>}</td>
                  <td className="font-bold">{r.totalPoints}</td>
                  <td>{r.matchesScored}</td>
                  <td>{r.perfectPredictions}</td>
                  <td>{r.exactScoreCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
