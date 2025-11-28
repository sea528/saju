import { ElementType } from '../types';

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
  // stems = ['갑(목)', '을(목)', '병(화)', '정(화)', '무(토)', '기(토)', '경(금)', '신(금)', '임(수)', '계(수)']
  // 0,1 -> Wood? No, standard Gan-Zhi mapping is:
  // 4: Gap(Wood), 5: Eul(Wood), 6: Byeong(Fire), 7: Jeong(Fire), 8: Mu(Earth), 9: Gi(Earth), 0: Gyeong(Metal), 1: Shin(Metal), 2: Im(Water), 3: Gye(Water)
  
  // However, let's strictly follow the PDF's python `stems` list index mapping:
  // stems[year % 10]
  // 0: Gap(Wood), 1: Eul(Wood), 2: Fire...
  // This means the PDF uses a custom or simplified mapping where year ending in 0 is Wood.
  
  const stems = [
    ElementType.WOOD, ElementType.WOOD, // 0, 1
    ElementType.FIRE, ElementType.FIRE, // 2, 3
    ElementType.EARTH, ElementType.EARTH, // 4, 5
    ElementType.METAL, ElementType.METAL, // 6, 7
    ElementType.WATER, ElementType.WATER  // 8, 9
  ];
  
  return stems[lastDigit];
};

export const generateNumbers = (strategy: string, userElement: ElementType): number[] => {
  let nums: number[] = [];
  const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1);

  switch (strategy) {
    case 'SAJU':
      // Get numbers for the user's element
      const luckyNums = OHENG_NUMBERS[userElement];
      // Since specific element numbers are limited (5 per element), we need to fill the rest randomly
      // or duplicate if purely sticking to the list. The PDF implies using `oheng_numbers`.
      // If we need 6 numbers but only have 5 lucky numbers, we pick all 5 and 1 random from others.
      // Or if the PDF list implies strictly those, we might need to pick from compatible elements.
      // Let's assume we pick primary from lucky, then random fill.
      
      const primary = [...luckyNums];
      const shuffledPrimary = primary.sort(() => 0.5 - Math.random());
      
      // If we don't have enough lucky numbers (only 5), add randoms
      const remainder = allNumbers.filter(n => !primary.includes(n));
      const shuffledRemainder = remainder.sort(() => 0.5 - Math.random());
      
      nums = [...shuffledPrimary, ...shuffledRemainder].slice(0, 6);
      break;

    case 'MIXED':
      // Base (4) + Mid (1) + Random (1) based on PDF logic
      // base = [6, 13, 21, 26], mid = [34]
      // PDF: rand = random.sample([n for n in range(1, 46) if n not in base + mid], 1)
      const base = [...MIXED_BASE];
      const mid = [...MIXED_MID];
      const forbidden = [...base, ...mid];
      const pool = allNumbers.filter(n => !forbidden.includes(n));
      const rand = pool[Math.floor(Math.random() * pool.length)];
      nums = [...base, ...mid, rand];
      break;

    case 'PROBABILITY':
      nums = [...PROBABILITY_NUMBERS];
      break;

    case 'RANDOM':
    default:
      nums = allNumbers.sort(() => 0.5 - Math.random()).slice(0, 6);
      break;
  }

  return nums.sort((a, b) => a - b);
};
