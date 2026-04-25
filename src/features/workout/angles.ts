type Point = { x: number; y: number; z: number };

export function calculateAngle(a: Point, vertex: Point, b: Point): number {
  const ax = a.x - vertex.x;
  const ay = a.y - vertex.y;
  const bx = b.x - vertex.x;
  const by = b.y - vertex.y;
  const dot = ax * bx + ay * by;
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  if (magA === 0 || magB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return Math.acos(cos) * (180 / Math.PI);
}

export function calculateRepScore(violatedErrors: number, violatedWarns: number): number {
  return Math.max(0, 100 - violatedErrors * 20 - violatedWarns * 8);
}

export function rollingAverage(history: number[], alpha = 0.3): number {
  if (history.length === 0) return 100;
  return history.reduce((ema, val) => ema * (1 - alpha) + val * alpha, history[0]);
}
