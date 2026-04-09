import type { BloomLevel } from '../types';

export const BLOOM_COLORS: Record<BloomLevel, { bg: string; text: string; border: string; label: string }> = {
  REMEMBER: {
    bg: '#E6F1FB',
    text: '#1D6FA4',
    border: '#AECDE8',
    label: 'L1 기억',
  },
  UNDERSTAND: {
    bg: '#E1F5EE',
    text: '#1A7A54',
    border: '#A3DACC',
    label: 'L2 이해',
  },
  APPLY: {
    bg: '#EEEDFE',
    text: '#5B4CBF',
    border: '#C5C1F7',
    label: 'L3 적용',
  },
  ANALYZE: {
    bg: '#FAEEDA',
    text: '#8B6000',
    border: '#F0D49A',
    label: 'L4 분석',
  },
  EVALUATE: {
    bg: '#FAECE7',
    text: '#9B3A1F',
    border: '#F2BDB0',
    label: 'L5 평가',
  },
  CREATE: {
    bg: '#FBEAF0',
    text: '#9B2060',
    border: '#F2B8D2',
    label: 'L6 창조',
  },
};

export const BLOOM_LEVELS: BloomLevel[] = [
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
  'EVALUATE',
  'CREATE',
];
