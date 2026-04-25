import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

const CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
];

type JointStatus = 'ok' | 'warn' | 'error';

export type JointStatusMap = Record<number, JointStatus>;

function jointColor(status: JointStatus): string {
  if (status === 'error') return '#ef4444';
  if (status === 'warn') return '#eab308';
  return '#22c55e';
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  jointStatuses: JointStatusMap = {}
): void {
  ctx.clearRect(0, 0, width, height);

  const toPixel = (lm: NormalizedLandmark) => ({
    x: lm.x * width,
    y: lm.y * height,
  });

  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (const [a, b] of CONNECTIONS) {
    const lmA = landmarks[a];
    const lmB = landmarks[b];
    if (!lmA || !lmB) continue;
    if (lmA.visibility !== undefined && lmA.visibility < 0.4) continue;
    if (lmB.visibility !== undefined && lmB.visibility < 0.4) continue;

    const pA = toPixel(lmA);
    const pB = toPixel(lmB);

    const statusA = jointStatuses[a] ?? 'ok';
    const statusB = jointStatuses[b] ?? 'ok';
    const colorA = jointColor(statusA);
    const colorB = jointColor(statusB);

    const grad = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm) continue;
    if (lm.visibility !== undefined && lm.visibility < 0.4) continue;

    const { x, y } = toPixel(lm);
    const status = jointStatuses[i] ?? 'ok';
    const color = jointColor(status);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (status === 'error') {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

export function buildJointStatusMap(
  violatedRuleIds: string[],
  ruleJoints: { ruleId: string; joints: number[]; severity: 'warn' | 'error' }[]
): JointStatusMap {
  const map: JointStatusMap = {};

  for (const { ruleId, joints, severity } of ruleJoints) {
    if (!violatedRuleIds.includes(ruleId)) continue;
    for (const joint of joints) {
      const current = map[joint];
      if (current !== 'error') {
        map[joint] = severity;
      }
    }
  }

  return map;
}
