import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { scoreRepository } from '../../repositories/scoreRepository';
import { matchService } from '../../services/matchService';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Flag from '../../components/Flag';
import { formatDate } from '../../utils/formatters';

export default function Scoreboard() {
  const { user, community } = useAuth();
  const [scores, setScores] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!community?.id || !user?.userId) return;
      try {
        const [myScores, allMatches] = await Promise.all([
          scoreRepository.getByUser(community.id, user.userId),
          matchService.getByCommunity(community.id),
        ]);
        setScores(myScores);
        setMatches(allMatches);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [community?.id, user?.userId]);

  if (loading) return <Spinner className="py-20" />;

  const totalPoints = scores.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const perfectCount = scores.filter((s) => s.isPerfect).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Scoreboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card><p className="text-text-secondary text-sm">Total Points</p><p className="text-3xl font-bold text-accent mt-2">{totalPoints}</p></Card>
        <Card><p className="text-text-secondary text-sm">Matches Scored</p><p className="text-3xl font-bold mt-2">{scores.length}</p></Card>
        <Card><p className="text-text-secondary text-sm">Perfect (25 pts)</p><p className="text-3xl font-bold text-success mt-2">{perfectCount}</p></Card>
      </div>
      {scores.length === 0 ? (
        <Card><EmptyState icon="📊" title="No scores yet" description="Scores appear after match results are published" /></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-secondary border-b border-surface">
              <th className="py-2">Match</th><th>Date</th><th>Result</th><th>Your Prediction</th><th>Winner</th><th>Exact</th><th>Method</th><th>Bonus</th><th>Total</th>
            </tr></thead>
            <tbody>
              {scores.map((s) => {
                const match = matches.find((m) => m.id === s.matchId);
                if (!match) return null;
                return (
                  <tr key={s.id} className="table-row">
                    <td className="py-2"><Flag flag={match.teamA.flagUrl} size="sm" /> {match.teamA.code} vs {match.teamB.code} <Flag flag={match.teamB.flagUrl} size="sm" /></td>
                    <td className="text-text-secondary">{formatDate(match.matchDate)}</td>
                    <td>{match.result?.teamAScore} - {match.result?.teamBScore}</td>
                    <td>{s.teamAScore ?? '-'} - {s.teamBScore ?? '-'}</td>
                    <td>{s.winnerPoints ? '✓' : '✗'}</td>
                    <td>{s.exactScorePoints ? '✓' : '✗'}</td>
                    <td>{s.decisionMethodPoints ? '✓' : '✗'}</td>
                    <td>{s.bonusPoints || 0}</td>
                    <td className="font-bold">{s.totalPoints}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
