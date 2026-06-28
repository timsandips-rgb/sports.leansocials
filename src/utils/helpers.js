import clsx from 'clsx';

export function cn(...args) {
  return clsx(args);
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function getWinner(teamAScore, teamBScore) {
  if (teamAScore > teamBScore) return 'teamA';
  if (teamBScore > teamAScore) return 'teamB';
  return 'draw';
}

export function isKnockoutStage(stage, knockoutStages) {
  return knockoutStages.includes(stage);
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function paginate(array, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

export function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.perfectPredictions !== a.perfectPredictions) return b.perfectPredictions - a.perfectPredictions;
    if (b.exactScoreCount !== a.exactScoreCount) return b.exactScoreCount - a.exactScoreCount;
    if (b.correctWinnerCount !== a.correctWinnerCount) return b.correctWinnerCount - a.correctWinnerCount;
    const aTime = a.lastSubmissionAt?.seconds || 0;
    const bTime = b.lastSubmissionAt?.seconds || 0;
    return aTime - bTime;
  });
}
