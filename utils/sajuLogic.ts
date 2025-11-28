import { ElementType, Strategy } from '../types';
import { HISTORICAL_DATA } from '../constants';

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

/**
 * CDM (Compound-Dirichlet-Multinomial) & 3-Strategy Implementation
 * 1. CDM: Uses historical frequency as a 'Posterior' to update the 'Prior' (uniform).
 * 2. 3-Strategy: Analyzes the 'Gap' (interval since last drawn) to find 'Due' numbers.
 */
const calculateCDMWeights = (): number[] => {
  const range = 45;
  const frequencies = new Array(range + 1).fill(1); // Dirichlet Prior (Alpha = 1)
  const gaps = new Array(range + 1).fill(0);
  
  // Analyze History
  // We process from newest to oldest to calculate current gaps correctly
  // Note: HISTORICAL_DATA in constants is just a sample, so this is a simulation based on available data.
  
  // 1. Calculate Frequency (CDM)
  HISTORICAL_DATA.forEach(draw => {
    draw.numbers.forEach(num => {
      if (num >= 1 && num <= 45) {
        frequencies[num]++;
      }
    });
  });

  // 2. Calculate Gaps (3-Strategy) - Distance from most recent draw
  // Since HISTORICAL_DATA is not continuous in our mock, we estimate gap based on presence in sample.
  for (let i = 1; i <= range; i++) {
    let found = false;
    for (let d = 0; d < HISTORICAL_DATA.length; d++) {
      if (HISTORICAL_DATA[d].numbers.includes(i)) {
        gaps[i] = d; // Index distance represents gap roughly
        found = true;
        break;
      }
    }
    if (!found) gaps[i] = HISTORICAL_DATA.length * 1.5; // Penalty/Boost for never seen
  }

  // 3. Combine into Weight
  // Weight = (Frequency ^ Momentum) + (Gap * ReversionFactor)
  // Higher frequency = higher weight (CDM/Polya Urn effect)
  // Higher gap = slightly higher weight (3-Strategy Mean Reversion)
  const weights = [];
  for (let i = 1; i <= range; i++) {
    const freqScore = Math.pow(frequencies[i], 1.2); 
    const gapScore = Math.sqrt(gaps[i]) * 2; 
    weights.push(freqScore + gapScore);
  }
  
  return weights;
};

const weightedRandomSelect = (items: number[], weights: number[], count: number): number[] => {
  const selected = new Set<number>();
  const _weights = [...weights]; // Copy to mutate
  
  while(selected.size < count) {
    const totalWeight = _weights.reduce((a, b) => a + b, 0);
    if (totalWeight <= 0) break; // Safety

    let r = Math.random() * totalWeight;
    for(let i=0; i < items.length; i++) {
        r -= _weights[i];
        if (r <= 0) {
            const num = items[i];
            if (!selected.has(num)) {
                selected.add(num);
                _weights[i] = 0; // Prevent re-selection
            }
            break;
        }
    }
  }
  
  // Fallback if weights exhausted (rare)
  while(selected.size < count) {
    const r = Math.floor(Math.random() * 45) + 1;
    selected.add(r);
  }

  return Array.from(selected);
};

export const generateNumbers = (strategies: Strategy[], userElement: ElementType): number[] => {
  const candidates = new Set<number>();
  
  // 1. Collect candidates based on selected strategies
  strategies.forEach(strat => {
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
    else if (strat === Strategy.CDM) {
      // Generate 6 high-probability numbers using CDM+3-Strategy logic
      const cdmWeights = calculateCDMWeights();
      const allNums = Array.from({ length: 45 }, (_, i) => i + 1);
      const cdmPicks = weightedRandomSelect(allNums, cdmWeights, 10); // Pick top 10 pool
      cdmPicks.forEach(n => candidates.add(n));
    }
  });

  let nums = Array.from(candidates);
  
  // 2. Refine the selection
  const isRandomSelected = strategies.includes(Strategy.RANDOM);
  const targetCount = 6;

  // Shuffle the candidate pool
  nums.sort(() => 0.5 - Math.random());

  // If "RANDOM" is selected along with others, we ensure we mix pure randoms
  if (isRandomSelected && strategies.length > 1) {
    // Keep only half from the smart strategies to let random fill the rest
    nums = nums.slice(0, 3); 
  } else if (strategies.length > 0 && !isRandomSelected) {
    // If only specific strategies, try to fill mostly from them
    // If we have too many candidates (e.g. Saju + CDM), pick best 6
    // If we have too few, we will fill later
  }

  // 3. Fill the rest
  const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1);
  
  // If CDM is involved, use CDM weights for filling remainder instead of pure random for better accuracy
  let remainder: number[];
  if (strategies.includes(Strategy.CDM) && !isRandomSelected) {
     const cdmWeights = calculateCDMWeights();
     // Zero out weights of already picked
     nums.forEach(picked => {
       if(picked >=1 && picked <= 45) cdmWeights[picked-1] = 0;
     });
     // Weighted fill
     const needed = Math.max(0, targetCount - nums.length);
     const filled = weightedRandomSelect(allNumbers, cdmWeights, needed + 5); // +5 buffer
     remainder = filled.filter(n => !nums.includes(n));
  } else {
     // Pure random fill
     remainder = allNumbers.filter(n => !nums.includes(n));
     remainder.sort(() => 0.5 - Math.random());
  }

  let result: number[] = [...nums];
  
  // Add from remainder until we have 6
  for (const r of remainder) {
    if (result.length >= targetCount) break;
    if (!result.includes(r)) result.push(r);
  }
  
  // Final trim in case we have too many (e.g. pure strategy yield > 6)
  result = result.slice(0, 6);

  return result.sort((a, b) => a - b);
};