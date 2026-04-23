interface HealthScoreGaugeProps {
  score: number;
  size?: number;
}

function getColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#6366f1';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getGrade(score: number) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function getLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Work';
}

export default function HealthScoreGauge({ score, size = 140 }: HealthScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;

  function polarToCartesian(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(startDeg: number, endDeg: number) {
    const s = polarToCartesian(startDeg);
    const e = polarToCartesian(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const fillEnd = startAngle + (score / 100) * totalAngle;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="#1e2d42"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={arcPath(startAngle, Math.max(startAngle + 1, fillEnd))}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.2}
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
        {/* Grade */}
        <text
          x={cx}
          y={cy + size * 0.18}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.1}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {getGrade(score)} · {getLabel(score)}
        </text>
      </svg>
    </div>
  );
}
