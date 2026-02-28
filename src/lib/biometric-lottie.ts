/**
 * Hand-crafted Lottie animation data for a biometric pulse-scan effect.
 *
 * Layers:
 *   1. Outer expanding ring  (frame 0–60, scale 25%→110%, opacity 85%→0%)
 *   2. Middle expanding ring (frame 12–58, scale 18%→90%, opacity 65%→0%)
 *   3. Inner expanding ring  (frame 22–54, scale 12%→72%, opacity 50%→0%)
 *   4. Centre pulse dot      (frame 0–60, pulsing scale + opacity)
 *
 * Canvas: 200×200 px, 30 fps, 60 frames (2 s)
 * Colours: ARES-X Mars red / accent orange
 */

const MARS_RED = [1, 0.271, 0, 1] as const;
const ACCENT_ORANGE = [1, 0.42, 0.208, 1] as const;

/* Helper — builds a shape-layer with one stroked ellipse */
function ringLayer(
  ind: number,
  name: string,
  inFrame: number,
  outFrame: number,
  startScale: number,
  endScale: number,
  startOpacity: number,
  strokeColor: readonly [number, number, number, number],
  strokeWidth: number,
) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: inFrame, s: [startOpacity] },
          { t: outFrame, s: [0] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [100, 100, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          {
            i: { x: [0.4, 0.4, 0.67], y: [1, 1, 1] },
            o: { x: [0.6, 0.6, 0.33], y: [0, 0, 0] },
            t: inFrame,
            s: [startScale, startScale, 100],
          },
          { t: outFrame, s: [endScale, endScale, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr',
        it: [
          { ty: 'el', d: 1, s: { a: 0, k: [160, 160] }, p: { a: 0, k: [0, 0] }, nm: 'Ellipse' },
          {
            ty: 'st',
            c: { a: 0, k: [...strokeColor] },
            o: { a: 0, k: 100 },
            w: { a: 0, k: strokeWidth },
            lc: 2,
            lj: 2,
            nm: 'Stroke',
          },
          {
            ty: 'tr',
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
          },
        ],
        nm: 'Group',
      },
    ],
    ip: inFrame,
    op: outFrame + 1,
    st: inFrame,
    bm: 0,
  };
}

export const biometricScanData = {
  v: '5.7.1',
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: 'Biometric Scan',
  ddd: 0,
  assets: [] as unknown[],
  layers: [
    // 1 — Outer ring
    ringLayer(1, 'Ring Outer', 0, 60, 25, 110, 85, MARS_RED, 2.5),
    // 2 — Middle ring
    ringLayer(2, 'Ring Mid', 12, 58, 18, 90, 65, MARS_RED, 2),
    // 3 — Inner ring
    ringLayer(3, 'Ring Inner', 22, 54, 12, 72, 50, ACCENT_ORANGE, 1.5),
    // 4 — Centre pulse dot
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Center Dot',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [100] },
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 30, s: [35] },
            { t: 60, s: [100] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            {
              i: { x: [0.4, 0.4, 0.67], y: [1, 1, 1] },
              o: { x: [0.6, 0.6, 0.33], y: [0, 0, 0] },
              t: 0,
              s: [100, 100, 100],
            },
            {
              i: { x: [0.4, 0.4, 0.67], y: [1, 1, 1] },
              o: { x: [0.6, 0.6, 0.33], y: [0, 0, 0] },
              t: 30,
              s: [60, 60, 100],
            },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [24, 24] }, p: { a: 0, k: [0, 0] }, nm: 'Dot' },
            {
              ty: 'fl',
              c: { a: 0, k: [...MARS_RED] },
              o: { a: 0, k: 100 },
              r: 1,
              nm: 'Fill',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Group',
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
};
