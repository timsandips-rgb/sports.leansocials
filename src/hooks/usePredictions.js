import { useState, useEffect, useCallback } from 'react';
import { predictionService } from '../services/predictionService';

export function usePredictions(communityId, userId) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!communityId || !userId) return;
    setLoading(true);
    try {
      const data = await predictionService.getMyPredictions(communityId, userId);
      setPredictions(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [communityId, userId]);

  useEffect(() => { load(); }, [load]);

  const saveDraft = useCallback(async (payload) => {
    const result = await predictionService.saveDraft(payload);
    await load();
    return result;
  }, [load]);

  const submit = useCallback(async (payload) => {
    const result = await predictionService.submit(payload);
    await load();
    return result;
  }, [load]);

  return { predictions, loading, reload: load, saveDraft, submit };
}
