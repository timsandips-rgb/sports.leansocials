import { useState, useEffect } from 'react';
import { getTimeRemaining } from '../utils/formatters';

export default function DeadlineCountdown({ deadline, label = 'Predictions close in' }) {
  const [remaining, setRemaining] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const t = setInterval(() => setRemaining(getTimeRemaining(deadline)), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  if (!remaining) return null;

  if (remaining.expired) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-card p-3 text-center">
        <p className="text-red-400 font-semibold">⏰ Deadline passed — predictions locked</p>
      </div>
    );
  }

  return (
    <div className="bg-warning/10 border border-warning rounded-card p-3 text-center">
      <p className="text-text-secondary text-xs mb-1">⏰ {label}</p>
      <p className="text-2xl font-bold text-warning">
        {remaining.days.toString().padStart(2, '0')}d : {remaining.hours.toString().padStart(2, '0')}h : {remaining.minutes.toString().padStart(2, '0')}m : {remaining.seconds.toString().padStart(2, '0')}s
      </p>
    </div>
  );
}
