import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

type SeatStatus = 'available' | 'selected' | 'taken' | 'premium';

interface Seat {
  id: string;
  row: number;
  col: number;
  status: SeatStatus;
  tier: 'explorer' | 'pioneer' | 'odyssey';
}

interface SeatMapProps {
  selectedTier: number;
  selectedSeat: string | null;
  onSelect: (id: string) => void;
}

const TIER_COLORS = {
  explorer: '#4ab8c4',
  pioneer: '#FF4500',
  odyssey: '#eab308'
};

const TIER_NAMES: Array<'explorer' | 'pioneer' | 'odyssey'> = ['explorer', 'pioneer', 'odyssey'];

function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  const takenSet = new Set<string>();
  // Randomly mark ~35% as taken
  for (let i = 0; i < 42; i++) {
    const r = Math.floor(Math.random() * 10);
    const c = Math.floor(Math.random() * 12);
    takenSet.add(`${r}-${c}`);
  }

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 12; col++) {
      // Skip aisle gaps
      if (col === 3 || col === 8) continue;
      // Tier zones: rows 0-1 odyssey, 2-4 pioneer, 5-9 explorer
      const tier: 'explorer' | 'pioneer' | 'odyssey' =
      row <= 1 ? 'odyssey' : row <= 4 ? 'pioneer' : 'explorer';
      const id = `${String.fromCharCode(65 + row)}${col + 1}`;
      const isTaken = takenSet.has(`${row}-${col}`);
      seats.push({
        id,
        row,
        col,
        status: isTaken ? 'taken' : 'available',
        tier
      });
    }
  }
  return seats;
}

export default function SeatMap({ selectedTier, selectedSeat, onSelect }: SeatMapProps) {
  const seats = useMemo(generateSeats, []);
  const activeTier = TIER_NAMES[selectedTier];

  // SVG dimensions
  const W = 560;
  const H = 440;
  const padX = 60;
  const padTop = 80;
  const seatW = 32;
  const seatH = 28;
  const gapX = 4;
  const gapY = 4;

  const getSeatX = (col: number) => {
    let adjustedCol = col;
    if (col > 3) adjustedCol -= 1; // remove aisle gap from index
    if (col > 8) adjustedCol -= 1;
    // Re-add aisle visual gaps
    let aisleOffset = 0;
    if (col > 3) aisleOffset += 20;
    if (col > 8) aisleOffset += 20;
    return padX + adjustedCol * (seatW + gapX) + aisleOffset;
  };
  const getSeatY = (row: number) => padTop + row * (seatH + gapY);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl mx-auto" style={{ minWidth: 360 }}>
        <defs>
          <filter id="seat-glow">
            <feGaussianBlur stdDeviation="3" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hull-nose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          {/* 3D perspective gradient for floor */}
          <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.02" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* === SPACECRAFT CROSS-SECTION HULL === */}
        {/* Outer hull */}
        <path
        d={`M${padX - 20} ${padTop - 20}
              Q${W / 2} ${padTop - 50} ${W - padX + 20} ${padTop - 20}
              L${W - padX + 25} ${padTop + 10 * (seatH + gapY) + 10}
              Q${W / 2} ${padTop + 10 * (seatH + gapY) + 35} ${padX - 25} ${padTop + 10 * (seatH + gapY) + 10}
              Z`}
        fill="url(#hull-nose)"
        stroke="#FF4500"
        strokeWidth="0.6"
        strokeOpacity="0.2" />


        {/* Cockpit nose cone */}
        <path
        d={`M${W / 2 - 80} ${padTop - 15} Q${W / 2} ${padTop - 48} ${W / 2 + 80} ${padTop - 15}`}
        fill="none"
        stroke="#4ab8c4"
        strokeWidth="0.8"
        strokeOpacity="0.3" />

        <text x={W / 2} y={padTop - 30} textAnchor="middle" fill="#4ab8c4" fillOpacity="0.4" fontSize="7" fontFamily="Orbitron, monospace">
          COCKPIT
        </text>

        {/* Tier zone labels + background */}
        {[
        { label: 'ODYSSEY CLASS', rows: [0, 1], color: TIER_COLORS.odyssey },
        { label: 'PIONEER CLASS', rows: [2, 4], color: TIER_COLORS.pioneer },
        { label: 'EXPLORER CLASS', rows: [5, 9], color: TIER_COLORS.explorer }].
        map((zone) => {
          const y1 = getSeatY(zone.rows[0]) - 4;
          const y2 = getSeatY(zone.rows[1]) + seatH + 4;
          return (
            <g key={zone.label}>
              <rect
              x={padX - 10}
              y={y1}
              width={W - padX * 2 + 20}
              height={y2 - y1}
              rx={8}
              fill={zone.color}
              fillOpacity={0.02}
              stroke={zone.color}
              strokeWidth={0.4}
              strokeOpacity={0.1} />

              <text
              x={padX - 14}
              y={(y1 + y2) / 2}
              textAnchor="end"
              fill={zone.color}
              fillOpacity={0.35}
              fontSize="6"
              fontFamily="Orbitron, monospace"
              transform={`rotate(-90 ${padX - 14} ${(y1 + y2) / 2})`}>

                {zone.label}
              </text>
            </g>);

        })}

        {/* Row letters */}
        {Array.from({ length: 10 }, (_, r) =>
        <text
        key={`row-${r}`}
        x={padX - 18}
        y={getSeatY(r) + seatH / 2 + 3}
        textAnchor="middle"
        fill="white"
        fillOpacity={0.15}
        fontSize="8"
        fontFamily="Orbitron, monospace">

            {String.fromCharCode(65 + r)}
          </text>
        )}

        {/* Seats */}
        {seats.map((seat) => {
          const x = getSeatX(seat.col);
          const y = getSeatY(seat.row);
          const isSelected = selectedSeat === seat.id;
          const isActiveTier = seat.tier === activeTier;
          const isTaken = seat.status === 'taken';
          const color = TIER_COLORS[seat.tier];
          const dimmed = !isActiveTier && !isSelected;

          return (
            <g
            key={seat.id}
            onClick={() => !isTaken && isActiveTier && onSelect(seat.id)}
            style={{ cursor: isTaken || !isActiveTier ? 'default' : 'pointer' }}>

              {/* Seat body - 3D-like with top highlight */}
              <rect
              x={x}
              y={y}
              width={seatW}
              height={seatH}
              rx={5}
              ry={5}
              fill={isTaken ? 'rgba(255,255,255,0.03)' : isSelected ? color : `${color}10`}
              stroke={isTaken ? 'rgba(255,255,255,0.05)' : isSelected ? color : `${color}30`}
              strokeWidth={isSelected ? 1.5 : 0.6}
              opacity={dimmed ? 0.25 : 1}
              filter={isSelected ? 'url(#seat-glow)' : undefined} />

              {/* 3D top edge highlight */}
              {!isTaken &&
              <rect
              x={x + 2}
              y={y + 1}
              width={seatW - 4}
              height={3}
              rx={2}
              fill={color}
              fillOpacity={isSelected ? 0.4 : 0.1}
              opacity={dimmed ? 0.2 : 1} />

              }
              {/* Armrests */}
              {!isTaken &&
              <>
                  <rect x={x + 1} y={y + seatH - 6} width={2} height={5} rx={1} fill={color} fillOpacity={isSelected ? 0.3 : 0.08} opacity={dimmed ? 0.2 : 1} />
                  <rect x={x + seatW - 3} y={y + seatH - 6} width={2} height={5} rx={1} fill={color} fillOpacity={isSelected ? 0.3 : 0.08} opacity={dimmed ? 0.2 : 1} />
                </>
              }
              {/* X for taken */}
              {isTaken &&
              <text
              x={x + seatW / 2}
              y={y + seatH / 2 + 3}
              textAnchor="middle"
              fill="white"
              fillOpacity={0.08}
              fontSize="8"
              fontFamily="monospace">

                  ×
                </text>
              }
              {/* Seat number */}
              {!isTaken && isActiveTier &&
              <text
              x={x + seatW / 2}
              y={y + seatH / 2 + 3}
              textAnchor="middle"
              fill={isSelected ? 'white' : color}
              fillOpacity={isSelected ? 0.9 : 0.4}
              fontSize="6.5"
              fontFamily="Orbitron, monospace">

                  {seat.id}
                </text>
              }
            </g>);

        })}

        {/* Legend */}
        {[
        { label: 'Available', color: TIER_COLORS[activeTier], fill: `${TIER_COLORS[activeTier]}15` },
        { label: 'Selected', color: TIER_COLORS[activeTier], fill: TIER_COLORS[activeTier] },
        { label: 'Taken', color: 'rgba(255,255,255,0.15)', fill: 'rgba(255,255,255,0.03)' }].
        map((item, i) =>
        <g key={item.label}>
            <rect x={padX + i * 100} y={H - 30} width={14} height={11} rx={3} fill={item.fill} stroke={item.color} strokeWidth={0.6} />
            <text x={padX + i * 100 + 20} y={H - 22} fill="white" fillOpacity={0.3} fontSize="7" fontFamily="Orbitron, monospace">
              {item.label}
            </text>
          </g>
        )}

        {/* Aisle labels */}
        <text x={getSeatX(3) + seatW + 6} y={padTop - 6} fill="white" fillOpacity={0.1} fontSize="6" fontFamily="Orbitron, monospace" transform={`rotate(-90 ${getSeatX(3) + seatW + 6} ${padTop + 50})`}>AISLE</text>
        <text x={getSeatX(9) - 6} y={padTop - 6} fill="white" fillOpacity={0.1} fontSize="6" fontFamily="Orbitron, monospace" transform={`rotate(-90 ${getSeatX(9) - 6} ${padTop + 50})`}>AISLE</text>
      </svg>
    </div>);

}