import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '../services/leaderboardService';

export function useLeaderboard(communityId, stage = 'overall') {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard(communityId, stage);
      setLeaderboard(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [communityId, stage]);

  useEffect(() => { load(); }, [load]);

  return { leaderboard, loading, reload: load };
}
