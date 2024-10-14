import React, { useEffect, useState } from "react";
import TinyMusic from "./component/BetterTinyMusic";

interface TrackInfo {
  trackTitle: string;
  artworkUrl: string;
  artist: string;
  playerStatus: boolean;
}

function example() {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);

  useEffect(() => {
    const fetchTrackInfo = async () => {
      try {
        const response = await fetch("/api/lastfm");
        const data = await response.json();
        setTrackInfo(data);
      } catch (error) {
        console.error("获取歌曲信息时出错:", error);
      }
    };

    fetchTrackInfo();
    // 每60秒更新一次歌曲信息
    const intervalId = setInterval(fetchTrackInfo, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <TinyMusic
        trackTitle={trackInfo.trackTitle}
        artworkUrl={trackInfo.artworkUrl}
        playerStatus={trackInfo.playerStatus}
        artist={trackInfo.artist}
      />
    </div>
  );
}

export default example;
