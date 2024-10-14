"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "../lib/utils";

interface MusicData {
  /**
   * Optional CSS class name to apply to the music track element.
   */
  className?: string;

  /**
   * The title of the music track.
   */
  trackTitle: string;

  /**
   * The URL of the artwork for the music track.
   */
  artworkUrl: string;

  /**
   * The current status of the music player.
   */
  playerStatus: boolean;

  /**
   * The artist of the music track.
   */
  artist: string;
}

const anim = {
  initial: { opacity: 1, scale: 0.3, transition: { delay: 1 } },
  open: {
    scale: 1,
    y: 80,
    filter: ["blur(5px)", "blur(0px)"],
    opacity: [0.1, 1],
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
  closed: { scale: 1, y: 0, filter: ["blur(5px)", "blur(0px)"] },
};

function TinyMusic({
  className,
  trackTitle,
  artworkUrl,
  playerStatus,
  artist,
}: MusicData) {
  const [isActive, setIsActive] = useState(false);
  const [imgColor, setImgColor] = useState({ r: 0, g: 0, b: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const extractAverageColor = useCallback((img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return { r: 0, g: 0, b: 0 }; // 回退颜色
    }

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const data = context.getImageData(0, 0, img.width, img.height).data;
    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
      count++;
    }

    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
    };
  }, []);

  const fetchImage = useCallback(
    async (url: string) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          setImgColor(extractAverageColor(img));
        };
      } catch (error) {
        console.error("获取图片失败:", error);
      }
    },
    [extractAverageColor]
  );

  useEffect(() => {
    if (artworkUrl) {
      void fetchImage(artworkUrl);
    }
  }, [artworkUrl, fetchImage]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile && playerStatus) {
      setIsActive(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && playerStatus) {
      setIsActive(false);
    }
  };

  return (
    <div
      className={cn(
        "hit-area z-50 pointer-events-auto relative py-4 max-w-[300px] w-full",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode={"wait"}>
        {isMounted && (
          <motion.div
            key={`music-widget-${trackTitle}-${playerStatus}`}
            variants={anim}
            initial="initial"
            animate={!isMobile && playerStatus && isActive ? "open" : "closed"}
            className={clsx(
              "pointer-events-auto relative mr-4 flex items-center rounded-xl backdrop-blur-lg w-full",
              {
                "bg-white dark:bg-black":
                  !isActive || !playerStatus || isMobile,
                "bg-opacity-10 dark:bg-opacity-10":
                  !isActive || !playerStatus || isMobile,
                "px-1.5 py-1.5 gap-1 ring-1 ring-zinc-900/5 dark:ring-white/10":
                  !isActive || !playerStatus || isMobile,
                "bg-opacity-0 dark:bg-opacity-0 px-2 py-2":
                  isActive && playerStatus && !isMobile,
              }
            )}
          >
            {playerStatus && (
              <img
                className={clsx("relative z-50", {
                  "w-8 h-8 rounded": !isActive || isMobile,
                  "w-32 h-32 rounded-md": isActive && !isMobile,
                })}
                src={artworkUrl}
                alt="专辑封面"
                style={{
                  boxShadow: `0 0 10px 1px rgba(${imgColor.r}, ${imgColor.g}, ${imgColor.b}, 0.3)`,
                }}
              />
            )}
            <div
              className="absolute inset-0 rounded-xl opacity-10"
              style={{
                backgroundColor: `rgb(${imgColor.r}, ${imgColor.g}, ${imgColor.b})`,
              }}
            ></div>
            <div className="relative z-50 flex-col items-start transition-all ml-2 max-w-[calc(100%-3rem)]">
              <div className={"text-[10px] font-semibold opacity-50"}>
                {playerStatus ? "正在播放" : ""}
              </div>
              {playerStatus ? (
                <div
                  className={
                    "text-[12px] font-semibold opacity-80 overflow-hidden"
                  }
                >
                  <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                    <div
                      className={clsx("inline-block", {
                        "animate-marquee":
                          trackTitle.length > 15 && (!isActive || isMobile),
                      })}
                    >
                      {trackTitle}
                    </div>
                  </div>
                  {isActive && !isMobile && (
                    <div className="text-[10px] opacity-60 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      {artist}
                    </div>
                  )}
                </div>
              ) : (
                <div className={"text-[12px] font-semibold opacity-80"}>
                  Not Playing
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TinyMusic;
