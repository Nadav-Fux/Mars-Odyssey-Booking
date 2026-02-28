import { useState, memo, lazy, Suspense } from 'react';
import { Ticket } from 'lucide-react';

const BoardingPass = lazy(() => import('@/components/BoardingPass'));

const LoadingSpinner = <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>;

/* Floating boarding pass toggle button — desktop only, below AchievementPanel */
function BoardingPassButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger */}
      <button
      onClick={() => setOpen(true)}
      className="fixed top-16 right-5 z-[100] hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer
          bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-primary/20
          transition-all duration-300 group"


      aria-label="Open boarding pass"
      title="Commander's Boarding Pass">

        <Ticket className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary/80 transition-colors" />
        <span className="text-[9px] font-display tracking-[0.15em] text-white/30 group-hover:text-white/50 transition-colors">
          PASS
        </span>
      </button>

      {/* Overlay */}
      <Suspense fallback={LoadingSpinner}>
        {open && <BoardingPass open={open} onClose={() => setOpen(false)} />}
      </Suspense>
    </>);

}

export default memo(BoardingPassButton);