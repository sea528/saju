import { ElementType, Strategy } from '../types';

// Mappings from the Python code in PDF
export const OHENG_NUMBERS = {
  [ElementType.WOOD]: [3, 13, 23, 33, 43],
  [ElementType.FIRE]: [2, 12, 22, 32, 42],
  [ElementType.EARTH]: [5, 15, 25, 35, 45],
  [ElementType.METAL]: [6, 16, 26, 36, 46],
  [ElementType.WATER]: [1, 11, 21, 31, 41]
};

// "High Probability" numbers from PDF code
export const PROBABILITY_NUMBERS = [3, 16, 23, 33, 36, 43];

// Mixed Strategy Base from PDF code
export const MIXED_BASE = [6, 13, 21, 26];
export const MIXED_MID = [34];

export const getZodiac = (year: number): string => {
  const zodiacs = ['원숭이(Monkey)', '닭(Rooster)', '개(Dog)', '돼지(Pig)', '쥐(Rat)', '소(Ox)', '호랑이(Tiger)', '토끼(Rabbit)', '용(Dragon)', '뱀(Snake)', '말(Horse)', '양(Sheep)'];
  return zodiacs[year % 12];
};

export const getOheng = (year: number): ElementType => {
  const lastDigit = year % 10;
  // Mappings based on PDF Python code:
  const stems = [
    ElementType.WOOD, ElementType.WOOD, // 0, 1
    ElementType.FIRE, ElementType.FIRE, // 2, 3
    ElementType.EARTH, ElementType.EARTH, // 4, 5
    ElementType.METAL, ElementType.METAL, // 6, 7
    ElementType.WATER, ElementType.WATER  // 8, 9
  ];
  
  return stems[lastDigit];
};

export const generateNumbers = (strategies: Strategy[], userElement: ElementType): number[] => {
  const candidates = new Set<number>();
  const isRandomSelected = strategies.includes(Strategy.RANDOM);
  const otherStrategies = strategies.filter(s => s !== Strategy.RANDOM);

  // Collect candidates from non-random strategies
  otherStrategies.forEach(strat => {
    if (strat === Strategy.SAJU) {
      OHENG_NUMBERS[userElement].forEach(n => candidates.add(n));
    }
    else if (strat === Strategy.MIXED) {
      MIXED_BASE.forEach(n => candidates.add(n));
      MIXED_MID.forEach(n => candidates.add(n));
    }
    else if (strat === Strategy.PROBABILITY) {
      PROBABILITY_NUMBERS.forEach(n => candidates.add(n));
    }
  });

  let nums = Array.from(candidates);
  
  // Shuffle candidates
  nums.sort(() => 0.5 - Math.random());

  // If RANDOM is one of the selected strategies (and we have others),
  // we dilute the specific candidates to ensure randomness is included.
  // We keep at most 3-4 specific numbers, leaving space for pure randoms.
  if (isRandomSelected && otherStrategies.length > 0) {
    nums = nums.slice(0, 3); // Keep only 3 specific numbers
  }

  // Generate full pool to fill remainder
  const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1);
  const remainder = allNumbers.filter(n => !nums.includes(n));
  const shuffledRemainder = remainder.sort(() => 0.5 - Math.random());

  // Fill up to 6
  let result: number[] = [];
  if (nums.length >= 6) {
    result = nums.slice(0, 6);
  } else {
    result = [...nums, ...shuffledRemainder.slice(0, 6 - nums.length)];
  }

  return result.sort((a, b) => a - b);
};