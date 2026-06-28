import { useState, useEffect, useCallback } from 'react';
import { matchService } from '../services/matchService';

export function useMatches(communityId) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const data = await matchService.getByCommunity(communityId);
      setMatches(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [communityId]);

  useEffect(() => { load(); }, [load]);

  return { matches, loading, error, reload: load };
}
