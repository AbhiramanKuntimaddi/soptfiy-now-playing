import queryString from 'query-string';
import { Buffer } from 'buffer';
import { average, prominent } from 'color.js'; // Import color extraction functions

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played`;

const client_id = import.meta.env.VITE_APP_SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.VITE_APP_SPOTIFY_CLIENT_SECRET;
const refresh_token = import.meta.env.VITE_APP_SPOTIFY_REFRESH_TOKEN;

const getAccessToken = async () => {
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: queryString.stringify({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });
  return response.json();
};

// Common function to extract information from the API response
const extractSongInfo = (song) => {
  const albumImageUrl = song.item?.album.images[0].url;
  const artist = song.item?.artists.map((_artist) => _artist.name).join(',');
  const songUrl = song.item.external_urls.spotify;
  const title = song.item.name;

  return {
    albumImageUrl,
    artist,
    songUrl,
    title,
  };
};

// Fetch information about the currently playing track
export const getNowPlaying = async () => {
  const { access_token } = await getAccessToken(client_id, client_secret, refresh_token);
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.status === 204 || response.status > 400) {
    return false;
  }

  const song = await response.json();
  const isPlaying = song.is_playing;
  const songInfo = extractSongInfo(song);

  return {
    ...songInfo,
    isPlaying,
  };
};

// Fetch information about the last played track
export const getLastPlayedItem = async () => {
  const { access_token } = await getAccessToken(client_id, client_secret, refresh_token);
  const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.status === 204 || response.status > 400) {
    return false;
  }

  const recentlyPlayed = await response.json();
  const lastPlayedItem = recentlyPlayed.items[0];

  if (!lastPlayedItem) {
    return false;
  }

  return extractSongInfo(lastPlayedItem.track);
};

export default getNowPlayingItem;
