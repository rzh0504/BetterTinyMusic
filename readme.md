# React Tiny Music Player

对[Hamster](https://buycoffee.top/)大佬的[TinyMusic 组件](https://next-tiny-music.buycoffee.top/)的(负)优化版本，增加了显示正在播放歌曲的功能并做了一些样式改进。

效果

![image.png](https://pics.051226.xyz/file/1728905388388_image.png)

![image.png](https://pics.051226.xyz/file/1728905362830_image.png)

获取正在播放的歌曲用的是 last.fm 的 [api](https://www.last.fm/api#getting-started), 支持 Spotify,具体还有哪些不知道，可以绑定 last.fm 的应该都可以(?)，音乐服务器如 Navidrome 等在绑定 last.fm 账号后也可。

## Requirements

- tailwindcss
- typescript
- framer-motion (10.16.8)
- clsx

## 特性

- 实时显示当前播放歌曲信息
- 动态获取并显示专辑封面
- 响应式设计，支持移动端和桌面端
- 悬停效果（仅桌面端）
- 自动提取专辑封面主色调作为背景

## 食用方法

1.使用 tailwindcss

```
npm install tailwindcss
```

2.下载依赖

```
npm install framer-motion@10.16.8 tailwindcss-animate class-variance-authority clsx tailwind-merge
```

3.添加依赖  
 [参考这里]()

4.添加 cn helper

在 `lib/utils.ts` 中定义

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

5.添加组件  
复制 [组件](https://github.com/rzh0504/BetterTinyMusic/blob/main/src/component/BetterTinyMusic.tsx)

6.添加环境变量

```
LASTFM_API_KEY=
LASTFM_USERNAME=
```

7.在 `app/src/api` 添加 lastfm.ts

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
    );
    const data = await response.json();
    const track = data.recenttracks.track[0];

    res.status(200).json({
      trackTitle: track.name,
      artworkUrl: track.image[3]["#text"], // 获取大尺寸图片
      artist: track.artist["#text"],
      playerStatus: track["@attr"]?.nowplaying === "true",
    });
  } catch (error) {
    console.error("获取 Last.fm 数据时出错:", error);
    res.status(500).json({ error: "获取 Last.fm 数据失败" });
  }
}
```

8.使用

```ts
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
```
