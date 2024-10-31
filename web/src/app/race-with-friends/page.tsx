"use client";
import Lottie from "lottie-react";
import walkingBird from "../../../public/lottie/bird-walking.json";
import { useEffect, useRef } from "react";

export default function RaceWithFriendsPage() {
  const lottieRef = useRef<any>(null);

  useEffect(() => {}, []);

  return (
    <div className="max-w-6xl ml-auto mr-auto">
      <div className="max-w-5xl ml-auto mr-auto mt-20">
        <div className="flex flex-col gap-14">
          <div className="w-full h-0 border-0 border-t-2 border-dashed border-t-neutral-400 relative">
            <Lottie
              className="absolute -bottom-8"
              style={{ height: 120, width: 120 }}
              animationData={walkingBird}
              loop={false}
            />
          </div>
          <div className="w-full h-0 border-0 border-t-2 border-dashed border-t-neutral-400 relative">
            <Lottie
              className="absolute -bottom-8"
              style={{ height: 120, width: 120 }}
              animationData={walkingBird}
            />
          </div>
          <div className="w-full h-0 border-0 border-t-2 border-dashed border-t-neutral-400 relative">
            <Lottie
              className="absolute -bottom-8"
              style={{ height: 120, width: 120 }}
              animationData={walkingBird}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
