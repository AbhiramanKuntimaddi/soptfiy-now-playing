/* eslint-disable react/prop-types */
import spotify from "./assets/SpotifyLogo.svg";
import { useEffect, useState } from "react";
import getNowPlayingItem from "./SpotifyAPI";
import { average, prominent } from "color.js";

const LoadingSpinner = () => (
	<div className="flex p-2 w-fit items-center justify-center text-gray text-base">
		<img className="w-11 p-1 object-contain h-11 mr-10" src={spotify} alt="" />
		<p className="tracking-wider px-1 text-base text-left ">Loading...</p>
	</div>
);

const NowPlaying = ({ result }) => (
	<div className="w-[250px]">
		<div className="w-fit h-full py-2 flex flex-col text-left justify-around">
			<div className="w-full h-fit relative">
				<img
					className="w-fit h-6 p-1 object-contain absolute -rotate-45 z-10"
					src={spotify}
					alt=""
				/>
				<img
					className="w-fit h-full rounded-lg"
					src={result.albumImageUrl}
					alt="album-image"
				/>
			</div>

			<div className="flex flex-col text-left mt-2">
				<div className="w-fit h-fit">
					<a
						className="text-left underline"
						href={result.songUrl}
						target="_blank"
						rel="noreferrer">
						{result.title}
					</a>
				</div>
				<div className="w-fit h-fit">
					<p className="text-left">{result.artist}</p>
				</div>
			</div>
		</div>
	</div>
);

const Offline = () => (
	<div className="text-xl h-full items-center justify-center text-center">
	  <div className="mb-20 text-3xl md:text-5xl md:p-5 text-[#1ab26b]">
		Oops! Looks like AK is taking a break from Spotify beats.
	  </div>
	  <div className="text-sm md:text-base text-blue-900">
		Don't worry, the website is still here, vibing without any tunes!
	  </div>
	</div>
  );
  
  

const SpotifyNowPlaying = (props) => {
	const [loading, setLoading] = useState(true);
	const [result, setResult] = useState({});

	useEffect(() => {
		Promise.all([
			getNowPlayingItem(
				props.client_id,
				props.client_secret,
				props.refresh_token
			),
		]).then((results) => {
			setResult(results[0]);
			setLoading(false);
		});
	});

	return (
		<div className="flex min-w-md h-fit items-center justify-center">
			{loading ? (
				<LoadingSpinner />
			) : result.isPlaying ? (
				<NowPlaying result={result} />
			) : (
				<Offline />
			)}
		</div>
	);
};

export default SpotifyNowPlaying;
