import SpotifyNowPlaying from './SpotifyNowPlaying';
import getNowPlayingItem from './SpotifyAPI';
import { useEffect, useState } from 'react';
import { average } from 'color.js';

function App(props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({});
  const [avgColor, setAvgColor] = useState("#000000"); // Initial color, you can set it to any default color.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nowPlayingResult] = await Promise.all([
          getNowPlayingItem(
            props.client_id,
            props.client_secret,
            props.refresh_token
          ),
        ]);

        setResult(nowPlayingResult);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  });

  useEffect(() => {
    const updateColor = async () => {
          const newAvgColor = await average(result.albumImageUrl, {
            format: 'hex',
          });
          setAvgColor(newAvgColor);
          console.log(newAvgColor);
    };

    updateColor();
  });

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-screen"
      style={{ backgroundColor: avgColor }}
    >
      <SpotifyNowPlaying />
    </div>
  );
}

export default App;
