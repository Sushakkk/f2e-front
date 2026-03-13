export type DateRangeValue = {
  from: string;
  to: string;
};

export type ActiveField = 'from' | 'to';

export type NormalizedRange = {
  from: Date | null;
  to: Date | null;
};
