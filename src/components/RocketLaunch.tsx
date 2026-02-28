import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import rocketData from '@/assets/animations/rocket-launch.json';

interface RocketLaunchProps {
  play: boolean;
  onComplete?: () => void;
}

export default function RocketLaunch({ play, onComplete }: RocketLaunchProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (play) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [play, onComplete]);

  if (!show) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-48 h-48 sm:w-56 sm:h-56">
        <Lottie
          animationData={rocketData}
          loop={false}
          autoplay={true}
          className="w-full h-full" />

      </div>
    </div>);

}