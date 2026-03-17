export type RangeBarThreshold = {
  label: string;
  color: string;
  min: number;
};

export type RangeBarDefinition = {
  label: string;
  ranges: RangeBarThreshold[];
};

export const RangeBarConfig: Record<string, RangeBarDefinition> = {
  '52w_iv_rank': {
    label: '52w IV Rank',
    ranges: [
      { label: 'Acceptable', color: 'oklch(68.1% 0.162 75.834)', min: 30 },
      { label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 50 },
    ],
  },
  '52w_iv_perc': {
    label: '52w IV Percentile',
    ranges: [
      { label: 'Active', color: 'oklch(68.1% 0.162 75.834)', min: 50 },
      { label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 70 },
      { label: 'High', color: 'oklch(68.1% 0.162 75.834)', min: 90 },
      { label: 'Crisis / Event', color: 'oklch(44.4% 0.177 26.899)', min: 95 },
    ],
  },
  opt_vlm: {
    label: 'Option Volume',
    ranges: [{ label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 10 }],
  },
  iv___hist_vol: {
    label: 'IV vs Hist Vol',
    ranges: [
      { label: 'Suboptimal', color: 'oklch(68.1% 0.162 75.834)', min: 90 },
      { label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 100 },
    ],
  },
  p_c_int: {
    label: 'Put/Call Open Interest',
    ranges: [
      { label: 'Call Skew', color: 'oklch(68.1% 0.162 75.834)', min: 0 },
      { label: 'Neutral', color: 'oklch(44.8% 0.119 151.328)', min: 0.5 },
      { label: 'Put Skew', color: 'oklch(68.1% 0.162 75.834)', min: 1.5 },
    ],
  },
  price: {
    label: 'Price',
    ranges: [
      { label: 'Low', color: 'oklch(68.1% 0.162 75.834)', min: 20 },
      { label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 30 },
      { label: 'High', color: 'oklch(68.1% 0.162 75.834)', min: 100 },
      { label: 'Too High', color: 'oklch(44.4% 0.177 26.899)', min: 200 },
    ],
  },
  days_until_ex_date: {
    label: 'Days Until Ex-Date',
    ranges: [
      { label: 'Approaching', color: 'oklch(68.1% 0.162 75.834)', min: 30 },
      { label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 45 },
    ],
  },
  dividend_yield: {
    label: 'Dividend Yield %',
    ranges: [
      { label: 'Optimal', color: 'oklch(44.8% 0.119 151.328)', min: 0 },
      { label: 'High', color: 'oklch(68.1% 0.162 75.834)', min: 1.5 },
      { label: 'Too High', color: 'oklch(44.4% 0.177 26.899)', min: 2.5 },
    ],
  },
  market_cap: {
    label: 'Market Cap (M)',
    ranges: [
      { label: 'Mid Cap', color: 'oklch(68.1% 0.162 75.834)', min: 2000 },
      { label: 'Large Cap', color: 'oklch(44.8% 0.119 151.328)', min: 10000 },
    ],
  },
};
