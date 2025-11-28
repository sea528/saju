import { LottoDraw } from './types';

// Sampled data from the PDF OCR content
export const HISTORICAL_DATA: LottoDraw[] = [
  { drawNo: 1199, date: '2025.11.22', numbers: [17, 75, 75, 0, 0, 0], bonus: 0 }, // Placeholder from future projection in PDF
  { drawNo: 1198, date: '2025.11.15', numbers: [10, 78, 0, 0, 0, 0], bonus: 0 },
  // Real historical data approximation based on PDF pages
  { drawNo: 600, date: '2014.05.31', numbers: [5, 11, 14, 27, 29, 36], bonus: 44 }, // Extracted from PDF patterns/OCR
  { drawNo: 599, date: '2014.05.24', numbers: [8, 12, 17, 29, 30, 44], bonus: 3 },
  { drawNo: 1060, date: '2023.03.25', numbers: [3, 10, 24, 33, 38, 45], bonus: 12 },
  { drawNo: 1059, date: '2023.03.18', numbers: [7, 10, 22, 25, 34, 40], bonus: 27 },
  { drawNo: 894, date: '2020.01.18', numbers: [19, 32, 37, 40, 41, 45], bonus: 2 }, // Sample
  { drawNo: 893, date: '2020.01.11', numbers: [1, 15, 17, 23, 25, 41], bonus: 10 },
  { drawNo: 762, date: '2017.07.08', numbers: [10, 12, 18, 31, 38, 41], bonus: 42 },
  { drawNo: 630, date: '2014.12.27', numbers: [3, 4, 15, 22, 28, 40], bonus: 41 },
];

export const AI_PROMPT_TEMPLATE = `
You are a mystical Korean fortune teller specialized in Saju (Four Pillars of Destiny) and Numerology.
The user was born in {year} ({zodiac}, {element} element).
We have generated the following Lucky Lotto Numbers for them: {numbers}.
The strategy used was: {strategy}.

Please provide a short, mystical, and encouraging reading (max 3 sentences).
Explain why these numbers might be lucky for their element ({element}).
If the strategy is "SAJU", emphasize the elemental harmony.
If "RANDOM" or "MIXED", emphasize luck and chance.
Keep the tone wise, traditional yet modern.
Output in Korean.
`;
