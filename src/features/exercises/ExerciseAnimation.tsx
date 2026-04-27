import { useTranslation } from 'react-i18next';

type P = [number, number];

type Pose = {
  head: P;
  neck: P;
  sho: P;
  hip: P;
  lEl: P;
  lWr: P;
  rEl: P;
  rWr: P;
  lKn: P;
  lAn: P;
  rKn: P;
  rAn: P;
};

const ST: Pose = {
  head: [60, 18],
  neck: [60, 28],
  sho: [60, 40],
  hip: [60, 80],
  lEl: [40, 65],
  lWr: [32, 90],
  rEl: [80, 65],
  rWr: [88, 90],
  lKn: [50, 120],
  lAn: [48, 160],
  rKn: [70, 120],
  rAn: [72, 160],
};

type ExercisePoses = { a: Pose; b: Pose; dur?: number };

const POSES: Record<string, ExercisePoses> = {
  squat: {
    a: ST,
    b: {
      head: [60, 50],
      neck: [60, 60],
      sho: [60, 72],
      hip: [60, 110],
      lEl: [24, 92],
      lWr: [11, 108],
      rEl: [96, 92],
      rWr: [109, 108],
      lKn: [36, 148],
      lAn: [38, 172],
      rKn: [84, 148],
      rAn: [82, 172],
    },
  },
  pushup: {
    a: {
      head: [60, 20],
      neck: [60, 30],
      sho: [60, 42],
      hip: [60, 86],
      lEl: [28, 64],
      lWr: [20, 92],
      rEl: [92, 64],
      rWr: [100, 92],
      lKn: [50, 124],
      lAn: [48, 166],
      rKn: [70, 124],
      rAn: [72, 166],
    },
    b: {
      head: [60, 34],
      neck: [60, 44],
      sho: [60, 56],
      hip: [60, 98],
      lEl: [28, 70],
      lWr: [20, 96],
      rEl: [92, 70],
      rWr: [100, 96],
      lKn: [50, 132],
      lAn: [48, 172],
      rKn: [70, 132],
      rAn: [72, 172],
    },
  },
  plank: {
    a: {
      head: [60, 20],
      neck: [60, 30],
      sho: [60, 42],
      hip: [60, 86],
      lEl: [28, 64],
      lWr: [20, 92],
      rEl: [92, 64],
      rWr: [100, 92],
      lKn: [50, 124],
      lAn: [48, 166],
      rKn: [70, 124],
      rAn: [72, 166],
    },
    b: {
      head: [60, 20],
      neck: [60, 30],
      sho: [60, 42],
      hip: [60, 86],
      lEl: [28, 64],
      lWr: [20, 92],
      rEl: [92, 64],
      rWr: [100, 92],
      lKn: [50, 124],
      lAn: [48, 166],
      rKn: [70, 124],
      rAn: [72, 166],
    },
  },
  lunge: {
    a: ST,
    b: {
      head: [60, 28],
      neck: [60, 38],
      sho: [60, 50],
      hip: [60, 90],
      lEl: [42, 72],
      lWr: [38, 95],
      rEl: [78, 72],
      rWr: [82, 95],
      lKn: [34, 128],
      lAn: [26, 158],
      rKn: [82, 142],
      rAn: [95, 174],
    },
  },
  'shoulder-press': {
    a: {
      head: [60, 38],
      neck: [60, 48],
      sho: [60, 60],
      hip: [60, 100],
      lEl: [30, 68],
      lWr: [26, 50],
      rEl: [90, 68],
      rWr: [94, 50],
      lKn: [50, 140],
      lAn: [48, 178],
      rKn: [70, 140],
      rAn: [72, 178],
    },
    b: {
      head: [60, 38],
      neck: [60, 48],
      sho: [60, 60],
      hip: [60, 100],
      lEl: [44, 38],
      lWr: [46, 20],
      rEl: [76, 38],
      rWr: [74, 20],
      lKn: [50, 140],
      lAn: [48, 178],
      rKn: [70, 140],
      rAn: [72, 178],
    },
    dur: 1.8,
  },
  'bicep-curl': {
    a: ST,
    b: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [40, 65],
      lWr: [46, 42],
      rEl: [80, 65],
      rWr: [74, 42],
      lKn: [50, 120],
      lAn: [48, 160],
      rKn: [70, 120],
      rAn: [72, 160],
    },
    dur: 1.4,
  },
  'glute-bridge': {
    a: ST,
    b: {
      head: [60, 14],
      neck: [60, 24],
      sho: [60, 36],
      hip: [60, 72],
      lEl: [40, 60],
      lWr: [36, 82],
      rEl: [80, 60],
      rWr: [84, 82],
      lKn: [52, 108],
      lAn: [50, 148],
      rKn: [68, 108],
      rAn: [70, 148],
    },
  },
  'mountain-climber': {
    a: {
      head: [60, 20],
      neck: [60, 30],
      sho: [60, 42],
      hip: [60, 86],
      lEl: [28, 64],
      lWr: [20, 92],
      rEl: [92, 64],
      rWr: [100, 92],
      lKn: [44, 110],
      lAn: [48, 150],
      rKn: [70, 124],
      rAn: [72, 166],
    },
    b: {
      head: [60, 20],
      neck: [60, 30],
      sho: [60, 42],
      hip: [60, 86],
      lEl: [28, 64],
      lWr: [20, 92],
      rEl: [92, 64],
      rWr: [100, 92],
      lKn: [50, 124],
      lAn: [48, 166],
      rKn: [76, 110],
      rAn: [72, 150],
    },
    dur: 0.8,
  },
  deadlift: {
    a: ST,
    b: {
      head: [75, 55],
      neck: [70, 64],
      sho: [64, 78],
      hip: [57, 110],
      lEl: [50, 88],
      lWr: [46, 110],
      rEl: [74, 84],
      rWr: [70, 106],
      lKn: [50, 140],
      lAn: [48, 174],
      rKn: [68, 140],
      rAn: [70, 174],
    },
  },
  'jumping-jack': {
    a: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [44, 62],
      lWr: [40, 84],
      rEl: [76, 62],
      rWr: [80, 84],
      lKn: [55, 120],
      lAn: [54, 160],
      rKn: [65, 120],
      rAn: [66, 160],
    },
    b: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [24, 34],
      lWr: [12, 20],
      rEl: [96, 34],
      rWr: [108, 20],
      lKn: [38, 122],
      lAn: [28, 162],
      rKn: [82, 122],
      rAn: [92, 162],
    },
    dur: 0.9,
  },
  'tricep-dip': {
    a: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [30, 48],
      lWr: [22, 38],
      rEl: [90, 48],
      rWr: [98, 38],
      lKn: [50, 118],
      lAn: [48, 155],
      rKn: [70, 118],
      rAn: [72, 155],
    },
    b: {
      head: [60, 30],
      neck: [60, 40],
      sho: [60, 52],
      hip: [60, 92],
      lEl: [30, 58],
      lWr: [22, 46],
      rEl: [90, 58],
      rWr: [98, 46],
      lKn: [50, 130],
      lAn: [48, 164],
      rKn: [70, 130],
      rAn: [72, 164],
    },
  },
  'calf-raise': {
    a: ST,
    b: {
      head: [60, 14],
      neck: [60, 24],
      sho: [60, 36],
      hip: [60, 76],
      lEl: [40, 61],
      lWr: [32, 86],
      rEl: [80, 61],
      rWr: [88, 86],
      lKn: [50, 116],
      lAn: [50, 152],
      rKn: [70, 116],
      rAn: [70, 152],
    },
    dur: 1.2,
  },
  'side-lunge': {
    a: ST,
    b: {
      head: [60, 28],
      neck: [60, 38],
      sho: [60, 50],
      hip: [60, 90],
      lEl: [38, 72],
      lWr: [34, 94],
      rEl: [82, 72],
      rWr: [86, 94],
      lKn: [24, 132],
      lAn: [16, 166],
      rKn: [76, 124],
      rAn: [78, 164],
    },
  },
  superman: {
    a: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 78],
      lEl: [38, 28],
      lWr: [28, 18],
      rEl: [82, 28],
      rWr: [92, 18],
      lKn: [50, 118],
      lAn: [48, 158],
      rKn: [70, 118],
      rAn: [72, 158],
    },
    b: {
      head: [60, 16],
      neck: [60, 26],
      sho: [60, 38],
      hip: [60, 74],
      lEl: [38, 24],
      lWr: [26, 12],
      rEl: [82, 24],
      rWr: [94, 12],
      lKn: [50, 105],
      lAn: [48, 138],
      rKn: [70, 105],
      rAn: [72, 138],
    },
  },
  burpee: {
    a: ST,
    b: {
      head: [60, 50],
      neck: [60, 60],
      sho: [60, 72],
      hip: [60, 110],
      lEl: [24, 92],
      lWr: [11, 108],
      rEl: [96, 92],
      rWr: [109, 108],
      lKn: [36, 148],
      lAn: [38, 172],
      rKn: [84, 148],
      rAn: [82, 172],
    },
    dur: 1.0,
  },
  'high-knees': {
    a: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [36, 60],
      lWr: [30, 82],
      rEl: [84, 52],
      rWr: [90, 68],
      lKn: [50, 120],
      lAn: [48, 160],
      rKn: [66, 95],
      rAn: [68, 120],
    },
    b: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [36, 52],
      lWr: [30, 68],
      rEl: [84, 60],
      rWr: [90, 82],
      lKn: [54, 95],
      lAn: [52, 120],
      rKn: [70, 120],
      rAn: [72, 160],
    },
    dur: 0.7,
  },
  'lateral-raise': {
    a: ST,
    b: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [22, 42],
      lWr: [8, 44],
      rEl: [98, 42],
      rWr: [112, 44],
      lKn: [50, 120],
      lAn: [48, 160],
      rKn: [70, 120],
      rAn: [72, 160],
    },
    dur: 1.6,
  },
  'tricep-extension': {
    a: {
      head: [60, 38],
      neck: [60, 48],
      sho: [60, 60],
      hip: [60, 100],
      lEl: [54, 36],
      lWr: [56, 58],
      rEl: [66, 36],
      rWr: [64, 58],
      lKn: [50, 140],
      lAn: [48, 178],
      rKn: [70, 140],
      rAn: [72, 178],
    },
    b: {
      head: [60, 38],
      neck: [60, 48],
      sho: [60, 60],
      hip: [60, 100],
      lEl: [52, 40],
      lWr: [52, 20],
      rEl: [68, 40],
      rWr: [68, 20],
      lKn: [50, 140],
      lAn: [48, 178],
      rKn: [70, 140],
      rAn: [72, 178],
    },
    dur: 1.4,
  },
  'reverse-lunge': {
    a: ST,
    b: {
      head: [60, 28],
      neck: [60, 38],
      sho: [60, 50],
      hip: [60, 90],
      lEl: [42, 72],
      lWr: [38, 95],
      rEl: [78, 72],
      rWr: [82, 95],
      lKn: [48, 130],
      lAn: [46, 162],
      rKn: [82, 140],
      rAn: [96, 172],
    },
  },
  'wall-sit': {
    a: ST,
    b: {
      head: [60, 18],
      neck: [60, 28],
      sho: [60, 40],
      hip: [60, 80],
      lEl: [40, 65],
      lWr: [32, 90],
      rEl: [80, 65],
      rWr: [88, 90],
      lKn: [40, 118],
      lAn: [40, 156],
      rKn: [80, 118],
      rAn: [80, 156],
    },
  },
};

const KS = '0.4 0 0.6 1';
const SPLINES = `${KS};${KS}`;
const KT = '0;0.5;1';

function av(a: number, b: number) {
  return `${a};${b};${a}`;
}

type LineProps = {
  ax1: number;
  ay1: number;
  ax2: number;
  ay2: number;
  bx1: number;
  by1: number;
  bx2: number;
  by2: number;
  dur: number;
  w?: number;
};

function AL({ ax1, ay1, ax2, ay2, bx1, by1, bx2, by2, dur, w = 3 }: LineProps) {
  const same = ax1 === bx1 && ay1 === by1 && ax2 === bx2 && ay2 === by2;
  return (
    <line
      x1={ax1}
      y1={ay1}
      x2={ax2}
      y2={ay2}
      stroke="#22c55e"
      strokeWidth={w}
      strokeLinecap="round"
      opacity="0.9"
    >
      {!same && (
        <>
          <animate
            attributeName="x1"
            values={av(ax1, bx1)}
            dur={`${dur}s`}
            repeatCount="indefinite"
            keyTimes={KT}
            calcMode="spline"
            keySplines={SPLINES}
          />
          <animate
            attributeName="y1"
            values={av(ay1, by1)}
            dur={`${dur}s`}
            repeatCount="indefinite"
            keyTimes={KT}
            calcMode="spline"
            keySplines={SPLINES}
          />
          <animate
            attributeName="x2"
            values={av(ax2, bx2)}
            dur={`${dur}s`}
            repeatCount="indefinite"
            keyTimes={KT}
            calcMode="spline"
            keySplines={SPLINES}
          />
          <animate
            attributeName="y2"
            values={av(ay2, by2)}
            dur={`${dur}s`}
            repeatCount="indefinite"
            keyTimes={KT}
            calcMode="spline"
            keySplines={SPLINES}
          />
        </>
      )}
    </line>
  );
}

type DotProps = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  r?: number;
  dur: number;
  fill?: string;
};

function AD({ ax, ay, bx, by, r = 4, dur, fill = '#22c55e' }: DotProps) {
  const same = ax === bx && ay === by;
  return (
    <circle cx={ax} cy={ay} r={r} fill={fill} opacity="0.95">
      {!same && (
        <>
          <animate
            attributeName="cx"
            values={av(ax, bx)}
            dur={`${dur}s`}
            repeatCount="indefinite"
            keyTimes={KT}
            calcMode="spline"
            keySplines={SPLINES}
          />
          <animate
            attributeName="cy"
            values={av(ay, by)}
            dur={`${dur}s`}
            repeatCount="indefinite"
            keyTimes={KT}
            calcMode="spline"
            keySplines={SPLINES}
          />
        </>
      )}
    </circle>
  );
}

function Figure({ a, b, dur }: { a: Pose; b: Pose; dur: number }) {
  const p = (key: keyof Pose) => ({ ax: a[key][0], ay: a[key][1], bx: b[key][0], by: b[key][1] });

  return (
    <svg viewBox="0 0 120 200" className="h-full" fill="none">
      {/* spine */}
      <AL
        ax1={a.neck[0]}
        ay1={a.neck[1]}
        ax2={a.hip[0]}
        ay2={a.hip[1]}
        bx1={b.neck[0]}
        by1={b.neck[1]}
        bx2={b.hip[0]}
        by2={b.hip[1]}
        dur={dur}
        w={3}
      />
      {/* L upper arm */}
      <AL
        ax1={a.sho[0]}
        ay1={a.sho[1]}
        ax2={a.lEl[0]}
        ay2={a.lEl[1]}
        bx1={b.sho[0]}
        by1={b.sho[1]}
        bx2={b.lEl[0]}
        by2={b.lEl[1]}
        dur={dur}
      />
      {/* L forearm */}
      <AL
        ax1={a.lEl[0]}
        ay1={a.lEl[1]}
        ax2={a.lWr[0]}
        ay2={a.lWr[1]}
        bx1={b.lEl[0]}
        by1={b.lEl[1]}
        bx2={b.lWr[0]}
        by2={b.lWr[1]}
        dur={dur}
      />
      {/* R upper arm */}
      <AL
        ax1={a.sho[0]}
        ay1={a.sho[1]}
        ax2={a.rEl[0]}
        ay2={a.rEl[1]}
        bx1={b.sho[0]}
        by1={b.sho[1]}
        bx2={b.rEl[0]}
        by2={b.rEl[1]}
        dur={dur}
      />
      {/* R forearm */}
      <AL
        ax1={a.rEl[0]}
        ay1={a.rEl[1]}
        ax2={a.rWr[0]}
        ay2={a.rWr[1]}
        bx1={b.rEl[0]}
        by1={b.rEl[1]}
        bx2={b.rWr[0]}
        by2={b.rWr[1]}
        dur={dur}
      />
      {/* L thigh */}
      <AL
        ax1={a.hip[0]}
        ay1={a.hip[1]}
        ax2={a.lKn[0]}
        ay2={a.lKn[1]}
        bx1={b.hip[0]}
        by1={b.hip[1]}
        bx2={b.lKn[0]}
        by2={b.lKn[1]}
        dur={dur}
      />
      {/* L shin */}
      <AL
        ax1={a.lKn[0]}
        ay1={a.lKn[1]}
        ax2={a.lAn[0]}
        ay2={a.lAn[1]}
        bx1={b.lKn[0]}
        by1={b.lKn[1]}
        bx2={b.lAn[0]}
        by2={b.lAn[1]}
        dur={dur}
      />
      {/* R thigh */}
      <AL
        ax1={a.hip[0]}
        ay1={a.hip[1]}
        ax2={a.rKn[0]}
        ay2={a.rKn[1]}
        bx1={b.hip[0]}
        by1={b.hip[1]}
        bx2={b.rKn[0]}
        by2={b.rKn[1]}
        dur={dur}
      />
      {/* R shin */}
      <AL
        ax1={a.rKn[0]}
        ay1={a.rKn[1]}
        ax2={a.rAn[0]}
        ay2={a.rAn[1]}
        bx1={b.rKn[0]}
        by1={b.rKn[1]}
        bx2={b.rAn[0]}
        by2={b.rAn[1]}
        dur={dur}
      />

      {/* head */}
      <AD {...p('head')} r={10} dur={dur} fill="none" />
      <circle
        cx={a.head[0]}
        cy={a.head[1]}
        r={10}
        stroke="#22c55e"
        strokeWidth="2.5"
        fill="none"
        opacity="0.9"
      >
        {(a.head[0] !== b.head[0] || a.head[1] !== b.head[1]) && (
          <>
            <animate
              attributeName="cx"
              values={av(a.head[0], b.head[0])}
              dur={`${dur}s`}
              repeatCount="indefinite"
              keyTimes={KT}
              calcMode="spline"
              keySplines={SPLINES}
            />
            <animate
              attributeName="cy"
              values={av(a.head[1], b.head[1])}
              dur={`${dur}s`}
              repeatCount="indefinite"
              keyTimes={KT}
              calcMode="spline"
              keySplines={SPLINES}
            />
          </>
        )}
      </circle>

      {/* joints */}
      {(
        ['sho', 'hip', 'lEl', 'rEl', 'lWr', 'rWr', 'lKn', 'rKn', 'lAn', 'rAn'] as (keyof Pose)[]
      ).map(k => (
        <AD key={k} {...p(k)} r={4} dur={dur} />
      ))}
    </svg>
  );
}

export default function ExerciseAnimation({ exerciseId }: { exerciseId: string }) {
  const { t } = useTranslation();
  const poses = POSES[exerciseId];
  const a = poses?.a ?? ST;
  const b = poses?.b ?? ST;
  const dur = poses?.dur ?? 2.2;

  return (
    <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="egrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#6b7280" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#egrid)" />
      </svg>

      {/* glow */}
      <div className="absolute inset-0 bg-radial-[ellipse_50%_40%_at_50%_60%] from-emerald-500/10 to-transparent pointer-events-none" />

      <div className="h-[82%] relative z-10">
        <Figure a={a} b={b} dur={dur} />
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/55 backdrop-blur px-3 py-1.5 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <p className="text-xs text-white/75">{t('catalog.detail.aiTracking')}</p>
      </div>
    </div>
  );
}
