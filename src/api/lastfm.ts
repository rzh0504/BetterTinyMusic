import type { NextApiRequest, NextApiResponse } from 'next';

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
      artworkUrl: track.image[3]['#text'], // 获取大尺寸图片
      artist: track.artist['#text'],
      playerStatus: track['@attr']?.nowplaying === 'true',
    });
  } catch (error) {
    console.error('获取 Last.fm 数据时出错:', error);
    res.status(500).json({ error: '获取 Last.fm 数据失败' });
  }
}