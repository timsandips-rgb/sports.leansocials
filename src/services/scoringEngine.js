import { getWinner } from '../utils/helpers';

export const scoringEngine = {
  calculateMatchScore(prediction, result, scoringRules) {
    let points = 0;
    let correctCount = 0;

    const predictedWinner = prediction.predictedWinner || getWinner(prediction.teamAScore, prediction.teamBScore);
    if (predictedWinner === result.winner) {
      points += scoringRules.correctWinner || 5;
      correctCount++;
    }

    if (prediction.teamAScore === result.teamAScore && prediction.teamBScore === result.teamBScore) {
      points += scoringRules.correctExactScore || 5;
      correctCount++;
    }

    if (prediction.decisionMethod && result.decisionMethod) {
      if (prediction.decisionMethod === result.decisionMethod) {
        points += scoringRules.correctDecisionMethod || 5;
        correctCount++;
      }
    }

    const isPerfect = correctCount === 3 || (correctCount === 2 && !prediction.decisionMethod && result.winner !== 'draw');
    if (correctCount === 3 || isPerfect) {
      points += scoringRules.allCorrectBonus || 10;
      correctCount = 3;
    }

    return {
      winnerPoints: predictedWinner === result.winner ? scoringRules.correctWinner || 5 : 0,
      exactScorePoints: prediction.teamAScore === result.teamAScore && prediction.teamBScore === result.teamBScore ? scoringRules.correctExactScore || 5 : 0,
      decisionMethodPoints: prediction.decisionMethod && result.decisionMethod && prediction.decisionMethod === result.decisionMethod ? scoringRules.correctDecisionMethod || 5 : 0,
      bonusPoints: correctCount === 3 ? scoringRules.allCorrectBonus || 10 : 0,
      totalPoints: Math.min(points, scoringRules.maxScorePerMatch || 25),
      isPerfect: correctCount === 3,
      correctWinner: predictedWinner === result.winner,
      correctExactScore: prediction.teamAScore === result.teamAScore && prediction.teamBScore === result.teamBScore,
      correctDecisionMethod: prediction.decisionMethod === result.decisionMethod,
    };
  },

  async calculateStageScores(communityId, stage, matches, predictions, scoringRules, scoreRepository) {
    const stageMatches = matches.filter((m) => m.stage === stage && m.result);
    const stagePredictions = predictions.filter((p) => p.stage === stage);
    const scoreOps = [];

    for (const match of stageMatches) {
      const matchPredictions = stagePredictions.filter((p) => p.matchId === match.id);
      for (const pred of matchPredictions) {
        const score = this.calculateMatchScore(pred, match.result, scoringRules);
        const scoreId = scoreRepository.buildId(communityId, match.id, pred.userId);
        scoreOps.push({
          id: scoreId,
          data: {
            scoreId,
            communityId, matchId: match.id, userId: pred.userId, username: pred.username,
            stage,
            ...score,
            calculatedAt: new Date(),
          },
          type: 'set',
        });
      }
    }

    if (scoreOps.length > 0) {
      await scoreRepository.batchWrite(scoreOps);
    }
    return scoreOps.length;
  },
};
