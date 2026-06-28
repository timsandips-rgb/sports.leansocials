import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { matchService } from '../../services/matchService';
import { predictionService } from '../../services/predictionService';
import { deadlineService } from '../../services/deadlineService';
import { leaderboardService } from '../../services/leaderboardService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Flag from '../../components/Flag';
import DeadlineCountdown from '../../components/DeadlineCountdown';
import { pdfService } from '../../services/pdfService';
import { STAGE_ORDER, STAGE_LABELS, KNOCKOUT_STAGES, DECISION_METHODS } from '../../utils/constants';
import { isDeadlinePassed } from '../../utils/formatters';

export default function Predictions() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [stage, setStage] = useState(STAGE_ORDER[0]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState({});

  const load = async () => {
    if (!community?.id) return;
    setLoading(true);
    try {
      const [stageMatches, myPredictions, dl] = await Promise.all([
        matchService.getByStage(community.id, stage),
        predictionService.getMyPredictions(community.id, user.userId),
        deadlineService.getByStage(community.id, stage),
      ]);
      setMatches(stageMatches);
      setPredictions(myPredictions);
      setDeadline(dl?.deadlineDateTime || null);
      const initialForms = {};
      stageMatches.forEach((m) => {
        const existing = myPredictions.find((p) => p.matchId === m.id);
        initialForms[m.id] = existing
          ? { teamAScore: existing.teamAScore, teamBScore: existing.teamBScore, decisionMethod: existing.decisionMethod || DECISION_METHODS.REGULAR_TIME }
          : { teamAScore: '', teamBScore: '', decisionMethod: DECISION_METHODS.REGULAR_TIME };
      });
      setForms(initialForms);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [community?.id, stage]);

  const locked = deadline ? isDeadlinePassed(deadline) : false;

  const saveDraft = async (matchId) => {
    const f = forms[matchId];
    const match = matches.find((m) => m.id === matchId);
    try {
      await predictionService.saveDraft({
        communityId: community.id, matchId, userId: user.userId, username: user.username,
        stage: match.stage, teamAScore: f.teamAScore, teamBScore: f.teamBScore, decisionMethod: f.decisionMethod,
      });
      toast.success('Draft saved');
    } catch (e) { toast.error(e.message); }
  };

  const submit = async (matchId) => {
    const f = forms[matchId];
    if (f.teamAScore === '' || f.teamBScore === '') return toast.error('Enter both scores');
    const match = matches.find((m) => m.id === matchId);
    try {
      await predictionService.submit({
        communityId: community.id, matchId, userId: user.userId, username: user.username,
        stage: match.stage, teamAScore: f.teamAScore, teamBScore: f.teamBScore, decisionMethod: f.decisionMethod,
      });
      toast.success('Prediction submitted!');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const exportPdf = () => {
    pdfService.exportPredictions(predictions, matches, community.communityName, user.username);
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Predictions</h1>
        <div className="flex gap-2">
          <Select value={stage} onChange={(e) => setStage(e.target.value)} className="max-w-xs">
            {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </Select>
          <Button variant="ghost" onClick={exportPdf}>📄 Export PDF</Button>
        </div>
      </div>

      {deadline && <DeadlineCountdown deadline={deadline} />}

      {matches.length === 0 ? (
        <Card><p className="text-center text-text-secondary py-8">No matches in this stage yet</p></Card>
      ) : (
        matches.map((m) => {
          const f = forms[m.id] || {};
          const myPred = predictions.find((p) => p.matchId === m.id);
          const isKnockout = KNOCKOUT_STAGES.includes(m.stage);
          return (
            <Card key={m.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Flag flag={m.teamA.flagUrl} name={m.teamA.name} /> 
                  <span className="font-semibold">{m.teamA.name}</span>
                  <span className="text-text-secondary">vs</span>
                  <span className="font-semibold">{m.teamB.name}</span>
                  <Flag flag={m.teamB.flagUrl} name={m.teamB.name} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary font-mono">{m.matchCode}</span>
                  {myPred && <Badge variant={myPred.status === 'submitted' ? 'success' : myPred.status === 'locked' ? 'info' : 'warning'}>{myPred.status}</Badge>}
                </div>
              </div>
              <div className={`grid ${isKnockout ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
                <Input label={`${m.teamA.code} Score`} type="number" min="0" value={f.teamAScore}
                  disabled={locked} onChange={(e) => setForms({ ...forms, [m.id]: { ...f, teamAScore: e.target.value } })} />
                <Input label={`${m.teamB.code} Score`} type="number" min="0" value={f.teamBScore}
                  disabled={locked} onChange={(e) => setForms({ ...forms, [m.id]: { ...f, teamBScore: e.target.value } })} />
                {isKnockout && (
                  <Select label="Decision Method" value={f.decisionMethod} disabled={locked}
                    onChange={(e) => setForms({ ...forms, [m.id]: { ...f, decisionMethod: e.target.value } })}>
                    <option value="regular_time">Regular Time</option>
                    <option value="extra_time">Extra Time</option>
                    <option value="penalty_shootout">Penalty Shootout</option>
                  </Select>
                )}
              </div>
              {!locked && (
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="ghost" onClick={() => saveDraft(m.id)}>Save Draft</Button>
                  <Button onClick={() => submit(m.id)}>Submit ✓</Button>
                </div>
              )}
              {locked && myPred && (
                <p className="text-text-secondary text-sm mt-2">Your prediction: {myPred.teamAScore} - {myPred.teamBScore} ({myPred.decisionMethod})</p>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
