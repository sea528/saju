export enum Strategy {
  SAJU = 'SAJU',
  MIXED = 'MIXED',
  RANDOM = 'RANDOM',
  PROBABILITY = 'PROBABILITY',
  CDM = 'CDM'
}

export enum ElementType {
  WOOD = '목(Wood)',
  FIRE = '화(Fire)',
  EARTH = '토(Earth)',
  METAL = '금(Metal)',
  WATER = '수(Water)'
}

export interface UserProfile {
  year: number;
  month: number;
  day: number;
  hour: number;
  zodiac: string;
  element: ElementType;
}

export interface GeneratedResult {
  numbers: number[];
  strategies: Strategy[];
  fortune?: string;
  luckyElement?: string;
}

export interface LottoDraw {
  drawNo: number;
  date: string;
  numbers: number[]; // First 6 numbers
  bonus: number;
}