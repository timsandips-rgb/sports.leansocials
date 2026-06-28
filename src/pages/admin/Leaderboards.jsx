import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { leaderboardService } from '../../services/leaderboardService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { STAGE_ORDER, STAGE_LABELS } from '../../utils/constants';
import { pdfService } from '../../services/pdfService';

export default function Leaderboards() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [stage, setStage] = useState('overall');
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try { setLeaderboard(await leaderboardService.getLeaderboard(community.id, stage)); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id, stage]);

  const generate = async () => {
    try {
      const lb = await leaderboardService.generate(community.id, stage, user.userId, user.username);
      setLeaderboard(lb);
      toast.success('Leaderboard generated');
    } catch (e) { toast.error(e.message); }
  };

  const exportPdf = () => {
    if (!leaderboard) return;
    pdfService.exportLeaderboard(leaderboard, community.communityName, stage);
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Leaderboards</h1>
        <div className="flex gap-2">
          <Select value={stage} onChange={(e) => setStage(e.target.value)} className="max-w-xs">
            <option value="overall">Overall</option>
            {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </Select>
          <Button variant="secondary" onClick={generate}>🔄 Generate</Button>
          <Button variant="ghost" onClick={exportPdf} disabled={!leaderboard}>📄 PDF</Button>
        </div>
      </div>

      {!leaderboard || !leaderboard.rankings?.length ? (
        <Card><EmptyState icon="🏆" title="No leaderboard yet" description="Click Generate to calculate rankings" action={<Button onClick={generate}>Generate Leaderboard</Button>} /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Rank</th><th>Username</th><th>Points</th><th>Matches</th><th>Perfect</th><th>Exact</th>
            </tr></thead>
            <tbody>
              {leaderboard.rankings.map((r) => (
                <tr key={r.userId} className="table-row">
                  <td className="py-3">
                    {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                  </td>
                  <td className="font-mono">@{r.username}</td>
                  <td className="font-bold">{r.totalPoints}</td>
                  <td>{r.matchesScored}</td>
                  <td>{r.perfectPredictions}</td>
                  <td>{r.exactScoreCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-text-secondary text-xs mt-3">Last updated: {leaderboard.updatedAt?.toDate ? new Date(leaderboard.updatedAt.toDate()).toLocaleString() : '-'}</p>
        </Card>
      )}
    </div>
  );
}
