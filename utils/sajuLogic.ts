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
 * CDM (Compound-Dirichlet-Multinomial) Logic
 * Uses historical frequency as a 'Posterior' to update the 'Prior' (uniform).
 */
const calculateCDMWeights = (): number[] => {
  const range = 45;
  const frequencies = new Array(range + 1).fill(1); // Dirichlet Prior (Alpha = 1)
  
  // 1. Calculate Frequency (CDM)
  HISTORICAL_DATA.forEach(draw => {
    draw.numbers.forEach(num => {
      if (num >= 1 && num <= 45) {
        frequencies[num]++;
      }
    });
  });

  // 2. Weight = Frequency ^ Momentum
  const weights = [];
  for (let i = 1; i <= range; i++) {
    const freqScore = Math.pow(frequencies[i], 1.5); 
    weights.push(freqScore);
  }
  
  return weights;
};

/**
 * "The 3-Strategy" Logic (Martingale / Gap Analysis)
 * 
 * Phases based on Gap (Draws since last appearance):
 * Phase 1 (0-60 draws): 1 Player (Weight x1)
 * Phase 2 (61-120 draws): 2 Players (Weight x2) - Recovery
 * Phase 3 (121-180 draws): 5 Players (Weight x5) - Profit
 * Phase 4 (181+ draws): 12 Players (Weight x12) - Complete Recovery
 */
const calculate3StrategyWeights = (): number[] => {
  const range = 45;
  const weights = [];
  const latestDrawNo = Math.max(...HISTORICAL_DATA.map(d => d.drawNo));

  for (let num = 1; num <= range; num++) {
    // 1. Find the last draw index for this number
    const lastDraw = HISTORICAL_DATA.find(draw => draw.numbers.includes(num));
    
    // Calculate Gap (If never seen in sample, assume a large gap for demo purposes, e.g., 200)
    const lastDrawNo = lastDraw ? lastDraw.drawNo : (latestDrawNo - 200); 
    const gap = latestDrawNo - lastDrawNo;

    let multiplier = 1;

    // 2. Apply The 3-Strategy Phases
    if (gap <= 60) {
      multiplier = 1; // Phase 1
    } else if (gap <= 120) {
      multiplier = 2; // Phase 2
    } else if (gap <= 180) {
      multiplier = 5; // Phase 3
    } else {
      multiplier = 12; // Phase 4
    }

    weights.push(multiplier);
  }

  return weights;
};

const weightedRandomSelect = (items: number[], weights: number[], count: number): number[] => {
  const selected = new Set<number>();
  const _weights = [...weights]; // Copy to mutate
  
  // Safety check
  if (items.length !== weights.length) return items.slice(0, count);

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
  
  // Fallback if weights exhausted
  while(selected.size < count) {
    const r = Math.floor(Math.random() * 45) + 1;
    selected.add(r);
  }

  return Array.from(selected);
};

export const generateNumbers = (strategies: Strategy[], userElement: ElementType): number[] => {
  const candidates = new Set<number>();
  const allNums = Array.from({ length: 45 }, (_, i) => i + 1);
  
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
      // CDM: Frequent numbers (Hot)
      const cdmWeights = calculateCDMWeights();
      const cdmPicks = weightedRandomSelect(allNums, cdmWeights, 10);
      cdmPicks.forEach(n => candidates.add(n));
    }
    else if (strat === Strategy.STRATEGY_3) {
      // The 3-Strategy: Overdue numbers (Cold/Gap) with Martingale weights
      const strat3Weights = calculate3StrategyWeights();
      const strat3Picks = weightedRandomSelect(allNums, strat3Weights, 10);
      strat3Picks.forEach(n => candidates.add(n));
    }
  });

  let nums = Array.from(candidates);
  const targetCount = 6;

  // Shuffle the candidate pool
  nums.sort(() => 0.5 - Math.random());

  // 2. If we have selected strategies, try to prioritize them.
  // If no strategy selected (edge case), or logic yields < 6, we fill below.
  
  // 3. Fill the rest using a balanced approach (or purely random if no sophisticated strat)
  let remainder: number[];
  
  // If Strategy 3 is active, use its weights for filling to maintain the "Martingale" pressure
  if (strategies.includes(Strategy.STRATEGY_3)) {
     const weights = calculate3StrategyWeights();
     // Zero out weights of already picked
     nums.forEach(picked => {
       if(picked >=1 && picked <= 45) weights[picked-1] = 0;
     });
     const needed = Math.max(0, targetCount - nums.length);
     // Pick more than needed to ensure uniqueness check passes easily
     const filled = weightedRandomSelect(allNums, weights, needed + 10);
     remainder = filled.filter(n => !nums.includes(n));
  } else {
     // Default fill
     remainder = allNums.filter(n => !nums.includes(n));
     remainder.sort(() => 0.5 - Math.random());
  }

  let result: number[] = [...nums];
  
  // Add from remainder until we have 6
  for (const r of remainder) {
    if (result.length >= targetCount) break;
    if (!result.includes(r)) result.push(r);
  }
  
  // Final trim and sort
  result = result.slice(0, 6);
  return result.sort((a, b) => a - b);
};