import type { RangeBarDefinition } from './RangeBarConfig';

type RangeBarProps = {
  value: string;
  config: RangeBarDefinition;
  max?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const FALLBACK_RANGE = {
  label: 'Low',
  color: 'oklch(44.4% 0.177 26.899)',
  min: 0,
};

const parseNumericValue = (value: string) => {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

export const RangeBar = ({ value, config, max = 100 }: RangeBarProps) => {
  const numericValue = parseNumericValue(value);
  const sortedRanges = [...config.ranges].sort((left, right) => left.min - right.min);
  const markerValue = numericValue === null ? 0 : clamp(numericValue, 0, max);
  const markerPosition = max === 0 ? 0 : (markerValue / max) * 100;
  const activeRange =
    numericValue === null
      ? null
      : ([...sortedRanges].reverse().find(range => markerValue >= range.min) ?? FALLBACK_RANGE);

  const segments = [FALLBACK_RANGE, ...sortedRanges].map((range, index, ranges) => {
    const nextMin = ranges[index + 1]?.min ?? max;
    const start = clamp(range.min, 0, max);
    const end = clamp(nextMin, start, max);

    return {
      key: `${range.label}-${range.min}`,
      color: range.color,
      left: max === 0 ? 0 : (start / max) * 100,
      width: max === 0 ? 0 : ((end - start) / max) * 100,
    };
  });

  return (
    <section className="range-bar-card">
      <div className="range-bar-header">
        <div>
          <span className="meta-label">{config.label}</span>
          <p className="range-bar-value">{value}</p>
        </div>
        <div className="range-bar-badge" style={{ backgroundColor: activeRange?.color ?? '#9ca3af' }}>
          {activeRange?.label ?? 'Unavailable'}
        </div>
      </div>

      <div className="range-bar-track" aria-label={`${config.label} range`}>
        {segments.map(segment => (
          <div
            key={segment.key}
            className="range-bar-segment"
            style={{
              left: `${segment.left}%`,
              width: `${segment.width}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}

        <div
          className="range-bar-marker"
          style={{ left: `${markerPosition}%` }}
          title={numericValue === null ? 'Unavailable' : `${markerPosition}%`}
        />
      </div>

      <div className="range-bar-scale">
        <span>0</span>
        <span>{max / 4}</span>
        <span>{max / 2}</span>
        <span>{(3 * max) / 4}</span>
        <span>{max}</span>
      </div>
    </section>
  );
};
