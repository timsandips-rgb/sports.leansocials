import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const pdfService = {
  exportPredictions(predictions, matches, communityName, userName) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('FIFA World Cup 2026 — Predictions', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Community: ${communityName}`, 14, 28);
    doc.text(`User: ${userName}`, 14, 34);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);

    const rows = predictions.map((p) => {
      const match = matches.find((m) => m.id === p.matchId);
      const teamA = match?.teamA?.name || '-';
      const teamB = match?.teamB?.name || '-';
      return [
        match?.matchCode || '-',
        `${teamA} vs ${teamB}`,
        `${p.teamAScore} - ${p.teamBScore}`,
        p.predictedWinner === 'teamA' ? teamA : p.predictedWinner === 'teamB' ? teamB : 'Draw',
        p.decisionMethod || '-',
        p.status,
      ];
    });

    autoTable(doc, {
      head: [['Match Code', 'Match', 'Score', 'Predicted Winner', 'Decision Method', 'Status']],
      body: rows,
      startY: 48,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [233, 69, 96] },
    });

    doc.save(`predictions_${userName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  },

  exportLeaderboard(leaderboard, communityName, stage) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Leaderboard — ${communityName}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Stage: ${stage}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    const rows = (leaderboard.rankings || []).map((r) => [
      r.rank,
      r.username,
      r.totalPoints,
      r.matchesScored,
      r.perfectPredictions,
      r.exactScoreCount,
    ]);

    autoTable(doc, {
      head: [['Rank', 'Username', 'Points', 'Matches', 'Perfect', 'Exact Scores']],
      body: rows,
      startY: 42,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 52, 96] },
    });

    doc.save(`leaderboard_${stage}.pdf`);
  },

  exportAuditLogs(logs, communityName) {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text(`Audit Logs — ${communityName}`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    const rows = logs.map((l) => [
      new Date(l.timestamp?.seconds * 1000 || l.timestamp).toLocaleString(),
      l.username || '-',
      l.action,
      l.resource,
      l.resourceId || '-',
    ]);

    autoTable(doc, {
      head: [['Timestamp', 'User', 'Action', 'Resource', 'Resource ID']],
      body: rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 26, 46] },
    });

    doc.save('audit_logs.pdf');
  },
};
