import { STAGES } from '../utils/constants';

// Simplified fixture set — full 104-match WC 2026 tournament structure
// Each entry: { matchCode, teamA, teamB, stadium, matchDate (ISO), matchTime, location, stage }
export const FIFA_2026_FIXTURES = [
  // Group Stage — sample (full set would have 72 group-stage matches across 12 groups)
  { matchCode: 'GS-A1', teamA: 'MEX', teamB: 'USA', stadium: 'Estadio Azteca', matchDate: '2026-06-11', matchTime: '20:00', location: 'Mexico City, Mexico', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-A2', teamA: 'CAN', teamB: 'BRA', stadium: 'BMO Field', matchDate: '2026-06-12', matchTime: '15:00', location: 'Toronto, Canada', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-B1', teamA: 'ARG', teamB: 'FRA', stadium: 'MetLife Stadium', matchDate: '2026-06-13', matchTime: '18:00', location: 'New York, USA', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-B2', teamA: 'ENG', teamB: 'AUS', stadium: 'SoFi Stadium', matchDate: '2026-06-13', matchTime: '21:00', location: 'Los Angeles, USA', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-C1', teamA: 'ESP', teamB: 'JPN', stadium: 'AT&T Stadium', matchDate: '2026-06-14', matchTime: '16:00', location: 'Dallas, USA', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-C2', teamA: 'GER', teamB: 'KOR', stadium: 'Mercedes-Benz Stadium', matchDate: '2026-06-14', matchTime: '19:00', location: 'Atlanta, USA', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-D1', teamA: 'NED', teamB: 'MAR', stadium: 'Hard Rock Stadium', matchDate: '2026-06-15', matchTime: '17:00', location: 'Miami, USA', stage: STAGES.GROUP_STAGE },
  { matchCode: 'GS-D2', teamA: 'POR', teamB: 'SEN', stadium: 'NRG Stadium', matchDate: '2026-06-15', matchTime: '20:00', location: 'Houston, USA', stage: STAGES.GROUP_STAGE },

  // Round of 32 (sample)
  { matchCode: 'R32-1', teamA: 'MEX', teamB: 'NED', stadium: 'Rose Bowl', matchDate: '2026-06-28', matchTime: '18:00', location: 'Pasadena, USA', stage: STAGES.ROUND_OF_32 },
  { matchCode: 'R32-2', teamA: 'USA', teamB: 'MAR', stadium: 'Lincoln Financial Field', matchDate: '2026-06-28', matchTime: '21:00', location: 'Philadelphia, USA', stage: STAGES.ROUND_OF_32 },
  { matchCode: 'R32-3', teamA: 'ARG', teamB: 'AUS', stadium: 'Levi\'s Stadium', matchDate: '2026-06-29', matchTime: '16:00', location: 'Santa Clara, USA', stage: STAGES.ROUND_OF_32 },
  { matchCode: 'R32-4', teamA: 'FRA', teamB: 'JPN', stadium: 'Lumen Field', matchDate: '2026-06-29', matchTime: '19:00', location: 'Seattle, USA', stage: STAGES.ROUND_OF_32 },

  // Round of 16 (sample)
  { matchCode: 'R16-1', teamA: 'BRA', teamB: 'GER', stadium: 'Gillette Stadium', matchDate: '2026-07-04', matchTime: '18:00', location: 'Foxborough, USA', stage: STAGES.ROUND_OF_16 },
  { matchCode: 'R16-2', teamA: 'ARG', teamB: 'POR', stadium: 'MetLife Stadium', matchDate: '2026-07-05', matchTime: '18:00', location: 'New York, USA', stage: STAGES.ROUND_OF_16 },

  // Quarter Finals
  { matchCode: 'QF-1', teamA: 'BRA', teamB: 'FRA', stadium: 'SoFi Stadium', matchDate: '2026-07-09', matchTime: '18:00', location: 'Los Angeles, USA', stage: STAGES.QUARTER_FINAL },
  { matchCode: 'QF-2', teamA: 'ARG', teamB: 'ENG', stadium: 'Hard Rock Stadium', matchDate: '2026-07-10', matchTime: '18:00', location: 'Miami, USA', stage: STAGES.QUARTER_FINAL },

  // Semi Finals
  { matchCode: 'SF-1', teamA: 'BRA', teamB: 'ARG', stadium: 'AT&T Stadium', matchDate: '2026-07-14', matchTime: '20:00', location: 'Dallas, USA', stage: STAGES.SEMI_FINAL },
  { matchCode: 'SF-2', teamA: 'FRA', teamB: 'ENG', stadium: 'Mercedes-Benz Stadium', matchDate: '2026-07-15', matchTime: '20:00', location: 'Atlanta, USA', stage: STAGES.SEMI_FINAL },

  // Third Place
  { matchCode: 'TP-1', teamA: 'ARG', teamB: 'FRA', stadium: 'Hard Rock Stadium', matchDate: '2026-07-18', matchTime: '17:00', location: 'Miami, USA', stage: STAGES.THIRD_PLACE },

  // Final
  { matchCode: 'F-1', teamA: 'BRA', teamB: 'ENG', stadium: 'MetLife Stadium', matchDate: '2026-07-19', matchTime: '15:00', location: 'New York, USA', stage: STAGES.FINAL },
];
