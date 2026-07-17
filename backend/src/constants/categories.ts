export const CATEGORIES = [
  'gida',
  'kozmetik',
  'el-sanatlari',
  'giyim',
  'ev-yasam',
  'diger',
] as const;

export type Category = (typeof CATEGORIES)[number];
