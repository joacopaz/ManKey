import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { formatTime } from "./util";
import { useSelector, useDispatch } from "react-redux";
import {
	selectMuted,
	setMuted,
	setInteracted,
	selectInteracted,
	selectVol,
	setVol,
	selectFullScreen,
	setFullScreen,
} from "./postsSlice";
import isMuted from "../../assets/muted.png";
import isUnmuted from "../../assets/unmuted.png";
import { isMobile } from "react-device-detect";
export function Video({ id, video }) {
	const dispatch = useDispatch();
	const muted = useSelector(selectMuted);
	const interacting = useSelector(selectInteracted);
	const vol = useSelector(selectVol);
	const [playing, setPlaying] = useState(false);
	const [ended, setEnded] = useState(false);
	const [timeoutID, setTimeoutID] = useState(false);
	const [timeoutVideoID, setTimeoutVideoID] = useState(false);
	const [loading, setLoading] = useState(false);
	const [hasBeenPlayed, setHasBeenPlayed] = useState(false);
	const fullScreen = useSelector(selectFullScreen);
	const videoRef = useRef(null);
	const audioRef = useRef(null);
	const mutedRef = useRef(null);
	const seekRef = useRef(null);
	const volRef = useRef(null);
	const controlsRef = useRef(null);
	const videoContainerRef = useRef(null);
	const play = () => {
		if (videoRef.current.readyState >= 3) {
			setLoading(false);
			videoRef.current.play();
		} else {
			setLoading(true);
		}
		audioRef.current.currentTime = videoRef.current.currentTime;
	};
	const pause = () => {
		videoRef.current.pause();
		audioRef.current.currentTime = videoRef.current.currentTime;
	};
	const toggleFullScreen = (elem) => {
		if (!fullScreen) {
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.webkitRequestFullscreen) {
				/* Safari */
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) {
				/* IE11 */
				elem.msRequestFullscreen();
			}
			dispatch(setFullScreen(true));
		} else {
			document.exitFullscreen();
			dispatch(setFullScreen(false));
		}
	};
	useLayoutEffect(() => {
		document.onfullscreenchange = () => {
			document.fullscreenElement
				? dispatch(setFullScreen(true))
				: dispatch(setFullScreen(false));
		};
		return () => {
			document.onfullscreenchange = undefined;
		};
	});
	useEffect(() => {
		const handlePlay = (entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !playing && !interacting && !fullScreen)
					play();
				if (!entry.isIntersecting && playing && !interacting && !fullScreen)
					pause();
			});
		};
		const options = {
			rootMargin: "0px",
			threshold: [1],
		};

		let observer = new IntersectionObserver(handlePlay, options);

		observer.observe(videoRef.current);

		return () => observer.disconnect();
	}, [playing, interacting, fullScreen]);
	useEffect(() => {
		audioRef.current.volume = vol;
		volRef.current.value = vol * 100;
	}, [vol, dispatch]);
	return (
		<>
			<div
				className="videoContainer"
				ref={videoContainerRef}
				onPointerMove={() => {
					if (timeoutID) return;
					controlsRef.current.style.opacity = "100";
					videoContainerRef.current.style.cursor = "auto";
					setTimeoutID(
						setTimeout(() => {
							if (controlsRef.current) controlsRef.current.style.opacity = "0";
							if (videoContainerRef.current)
								videoContainerRef.current.style.cursor = "none";
							setTimeoutID(false);
						}, 5000)
					);
				}}
				onPointerEnter={() => (controlsRef.current.style.opacity = "100")}
				onPointerLeave={() => {
					if (!isMobile) controlsRef.current.style.opacity = "0";
					if (timeoutID) return;
					controlsRef.current.style.opacity = "100";
					videoContainerRef.current.style.cursor = "auto";
					setTimeoutID(
						setTimeout(() => {
							if (controlsRef.current) controlsRef.current.style.opacity = "0";
							if (videoContainerRef.current)
								videoContainerRef.current.style.cursor = "none";
							setTimeoutID(false);
						}, 5000)
					);
				}}>
				<div
					className={
						isMobile ? "invisibleListener mobile" : "invisibleListener"
					}
					onClick={(e) => {
						if (!playing) {
							dispatch(setInteracted(false));
							e.target.scrollIntoView({ behavior: "smooth", block: "center" });
							play();
						}
						if (playing) {
							dispatch(setInteracted(true));
							pause();
						}
					}}></div>
				{loading && !ended && (
					<div className="lds-ring">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				)}
				{ended ? (
					<div className="restartContainer">
						<div
							className="restart"
							onClick={() => {
								videoRef.current.loop = "true";
								videoRef.current.currentTime = 0;
								play();
							}}></div>
					</div>
				) : (
					""
				)}
				{!playing && !ended && !loading && !hasBeenPlayed ? (
					<div className="restartContainer">
						<div
							className="playNow"
							onClick={() => {
								setHasBeenPlayed(true);
								play();
							}}></div>
					</div>
				) : (
					""
				)}
				<div className="controls" ref={controlsRef}>
					<div
						className={`${playing ? "pause" : "play"} ${
							isMobile ? "mobile" : ""
						}`}
						onClick={() => {
							if (!playing) {
								play();
								setInteracted(false);
							}
							if (playing) {
								pause();
								dispatch(setInteracted(true));
							}
						}}></div>
					<span className="duration-left">
						{videoRef.current && formatTime(videoRef.current.currentTime)}
					</span>
					<input
						ref={seekRef}
						className={isMobile ? "seek mobile" : "seek"}
						type="range"
						min="0"
						max="100"
						step="0.01"
						defaultValue="0"
						onPointerDown={(e) => {
							pause();
							dispatch(setInteracted(true));
							videoRef.current.currentTime = parseFloat(seekRef.current.value);
						}}
						onPointerUp={() => {
							setInteracted(false);
							videoRef.current.currentTime = parseFloat(seekRef.current.value);
							play();
						}}
					/>
					<span className="duration-right">
						{videoRef.current &&
							formatTime(
								videoRef.current.duration ? videoRef.current.duration : "00:00"
							)}
					</span>
					<div
						className={isMobile ? "mute mobile" : "mute"}
						ref={mutedRef}
						onPointerEnter={() => (volRef.current.style.opacity = 100)}
						onPointerLeave={() =>
							setTimeout(() => (volRef.current.style.opacity = 0), 5000)
						}
						style={
							!muted || (volRef.current && parseFloat(volRef.current.value)) > 0
								? {
										backgroundImage: `url(${isUnmuted})`,
								  }
								: { backgroundImage: `url(${isMuted})` }
						}
						onClick={() => {
							if (audioRef && audioRef.current && muted) {
								audioRef.current.currentTime = videoRef.current.currentTime;
								dispatch(setMuted(false));
								dispatch(setVol(0.5));
								volRef.current.value = 50;

								if (playing) audioRef.current.play();
							} else if (audioRef && audioRef.current && !muted) {
								audioRef.current.pause();
								volRef.current.value = 0;
								dispatch(setVol(0));
								dispatch(setMuted(true));
							}
						}}></div>
					<div className={isMobile ? "volWrapper mobile" : "volWrapper"}>
						<input
							type="range"
							orient={isMobile ? "horizontal" : "vertical"}
							min="0"
							max="100"
							step="1"
							defaultValue={vol}
							onPointerUp={(e) => {
								dispatch(setVol(parseFloat(e.target.value / 100)));
								if (!muted && e.target.value / 100 > 0 && playing) {
									audioRef.current.currentTime = videoRef.current.currentTime;
									audioRef.current.play();
								}
							}}
							onChange={(e) => {
								e.target.style.opacity = "100";
								if (!muted && parseFloat(e.target.value) === 0)
									dispatch(setMuted(true));
								if (muted && parseFloat(e.target.value) > 0)
									dispatch(setMuted(false));
							}}
							className={isMobile ? "vol mobile" : "vol"}
							ref={volRef}></input>
					</div>
					<div
						className={
							isMobile ? "toggleFullScreen mobile" : "toggleFullScreen"
						}
						onClick={() => {
							toggleFullScreen(videoContainerRef.current);
						}}></div>
				</div>

				<video
					ref={videoRef}
					onLoadedData={(e) => {
						seekRef.current.max = Math.floor(e.target.duration);
					}}
					onEnded={() => setEnded(true)}
					onTimeUpdate={(e) => {
						if (timeoutVideoID) return;
						seekRef.current.value = e.target.currentTime;
						setTimeoutVideoID(setTimeout(() => setTimeoutVideoID(false), 500));
					}}
					onLoadStart={(e) => setLoading(true)}
					onCanPlay={(e) => {
						setLoading(false);
					}}
					onPlay={(e) => {
						setEnded(false);
						setPlaying(true);
						if (!muted) audioRef.current.play();
					}}
					onSeeked={(e) => {
						play();
					}}
					onPause={() => {
						setPlaying(false);
						audioRef.current.pause();
					}}
					src={video.videoURL}
					muted={true}></video>
				<audio src={video.audioURL} ref={audioRef}></audio>
			</div>
		</>
	);
}
