import queryString from 'query-string';
import { Buffer } from 'buffer';
import { extractColors } from 'extract-colors';

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

const client_id = import.meta.env.VITE_APP_SPOTIFY_CLIENT_ID
const client_secret = import.meta.env.VITE_APP_SPOTIFY_CLIENT_SECRET
const refresh_token = import.meta.env.VITE_APP_SPOTIFY_REFRESH_TOKEN

const getAccessToken = async () => {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: queryString.stringify({
            grant_type: "refresh_token",
            refresh_token,
        }),
    });
    return response.json();
};

// now playing endpoint
export const getNowPlaying = async (client_id, client_secret, refresh_token) => {
    const { access_token } = await getAccessToken(client_id, client_secret, refresh_token);
    return fetch(NOW_PLAYING_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        }
    });
};

// return data
export default async function getNowPlayingItem(
    client_id, client_secret, refresh_token
) {
    const response = await getNowPlaying(client_id, client_secret, refresh_token);
    if (response.status === 204 || response.status > 400) {
        return false;
    }
    const song = await response.json();

    const albumImageUrl = song.item?.album.images[0].url;
    const artist = song.item?.artists.map((_artist) => _artist.name).join(",");
    const isPlaying = song.is_playing;
    const songUrl = song.item.external_urls.spotify;
    const title = song.item.name;

    return {
        albumImageUrl,
        artist,
        isPlaying,
        songUrl,
        title,
    };
}

export const fetchImageAndExtractColors = async (client_id, client_secret, refresh_token) => {
    try {
      const nowPlaying = await getNowPlaying(client_id, client_secret, refresh_token);
  
      if (!nowPlaying || !nowPlaying.item || !nowPlaying.item.album || !nowPlaying.item.album.images) {
        console.error('Invalid response or missing album information.');
        return;
      }
  
      const albumImageUrl = nowPlaying.item.album.images[0].url;
  
      if (!albumImageUrl) {
        console.error('No album image URL available.');
        return;
      }
  
      const imageResponse = await fetch(albumImageUrl);
      const imageBlob = await imageResponse.blob();
      const reader = new FileReader();
  
      reader.onloadend = async () => {
        const base64data = reader.result;
        const colors = await extractColors(base64data);
        console.log('Extracted Colors:', colors);
      };
  
      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error('Error fetching or processing image:', error);
    }
  };
  