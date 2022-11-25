import bubble from "../../assets/bubble.png";
import neutralScore from "../../assets/score_arrow.png";
import positiveScore from "../../assets/score_arrow_upvote.png";
import negativeScore from "../../assets/score_arrow_downvote.png";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import link from "../../assets/link.png";
import share from "../../assets/share.png";
import { decodeHTML, applyEmojis } from "./util";
import { useNavigate } from "react-router-dom";
import { Video } from "./Video";
import { useRef, useState } from "react";
import { Tweet } from "react-twitter-widgets";
import { Gallery } from "./Gallery";
import { setLastPost } from "./postsSlice";
import { useDispatch } from "react-redux";

export function Posts({ content, stickies, setScrolled }) {
	const [oversized, setOversized] = useState(false);
	const dispatch = useDispatch();
	const ref = useRef(null);
	const navigate = useNavigate();
	const promptRef = useRef(null);

	const stickyPost = () => {
		if (!content.stickied) return "post";
		if (stickies === 1) return "post sticky only";
		if (stickies === 2) return "post sticky duo";
	};
	const checkOversized = (e) => {
		if (e.target.clientHeight / e.target.clientWidth > 3.5) {
			setOversized(true);
			e.target.classList.add("oversized");
		}
	};
	const handleClick = () => {
		setScrolled(false);
		dispatch(setLastPost(content.id));
		navigate(`./${content.id}`);
	};
	// console.log(content);
	return (
		<>
			<ul className={stickyPost()} id={content.id}>
				<div
					className={
						content.isMedia !== "video" &&
						!content.isYoutube &&
						content.isMedia !== "gallery"
							? "postClickListen"
							: ""
					}
					onClick={handleClick}></div>
				<span className="pinned">
					{content.stickied ? "PINNED BY MODERATORS" : ""}
				</span>
				<li className="content author">
					Posted by {content.author}{" "}
					{content.authorFlair && (
						<span
							className="emojiContainer"
							style={{
								backgroundColor: content.authorFlairBackground
									? content.authorFlairBackground
									: "rgb(77, 77, 77)",
								color:
									content.authorFlairColor === "dark" &&
									content.authorFlairBackground !== "transparent" &&
									content.authorFlairBackground
										? "black"
										: "white",
							}}
							dangerouslySetInnerHTML={{
								__html: applyEmojis(content.emojis, content.authorFlair),
							}}></span>
					)}
					{" · "}
					{content.createdAgo}{" "}
					{content.awards
						? content.awards.map((award) => (
								<div key={award.id} className="awards">
									<img
										src={award.icon}
										alt={award.name}
										className="award"
										title={award.name}
									/>
									<span>{award.count > 1 ? award.count : ""}</span>
								</div>
						  ))
						: ""}
				</li>

				<li className="content" onClick={handleClick}>
					{content.flair && (
						<span
							className="flair"
							style={{
								backgroundColor: content.linkFlairBackground,
								color:
									content.linkFlairTextColor === "dark" ? "black" : "white",
							}}
							dangerouslySetInnerHTML={{
								__html: applyEmojis(content.emojis, content.flair),
							}}></span>
					)}
					<span className="content title">{content.title}</span>
				</li>

				<li className="content score">
					{content.score > 999
						? `${Math.round((content.score / 1000) * 10) / 10}k`
						: content.score}
					<span
						className="innerScore"
						onClick={handleClick}
						style={
							content.score === 0
								? { backgroundImage: `url(${neutralScore})` }
								: content.score > 0
								? {
										backgroundImage: `url(${positiveScore})`,
								  }
								: {
										backgroundImage: `url(${negativeScore})`,
								  }
						}></span>
				</li>
				<li className="content media">
					{content.isMedia === "image" && (
						<>
							<img
								src={content.img}
								alt={content.title}
								onLoad={(e) => checkOversized(e)}></img>

							{oversized && (
								<>
									<div className="imgPreview"></div>
									<p
										style={oversized ? {} : { display: "none" }}
										className="txtImgPreview">
										See More
									</p>
								</>
							)}
						</>
					)}
					{content.isMedia === "video" && (
						<Video id={content.id} video={content.video} />
					)}
					{content.isMedia === "text" && !content.stickied && (
						<div
							ref={ref}
							className={`textMedia ${
								ref && ref.current && ref.current.scrollHeight > 272
									? " overflow"
									: ""
							}`}
							dangerouslySetInnerHTML={{
								__html: decodeHTML(content.body),
							}}></div>
					)}
					{content.isTweet && (
						<Tweet
							tweetId={content.isTweet}
							options={{
								theme: "dark",
								height: "512px",
								dnt: true,
								align: "center",
							}}
						/>
					)}
					{content.gallery && <Gallery imgs={content.gallery} />}
					{content.isMedia === "link" &&
						!content.isTweet &&
						!content.isYoutube && (
							<div className="linkContainer">
								<a href={content.link} rel="noreferrer" target="_blank">
									{content.link.length > 20
										? content.link.substring(0, 30) + "..."
										: content.link}
								</a>
								<img src={link} alt="link" className="linkImg" />
							</div>
						)}
					{content.isYoutube && (
						<LiteYouTubeEmbed
							id={content.isYoutube}
							noCookie={true}
							adNetwork={true}
						/>
					)}
				</li>
				<li className="content buttons">
					<div className="content comments" onClick={handleClick}>
						<img src={bubble} alt="#"></img>
						{content.numComments} Comments
					</div>
					<div
						className="content share"
						onClick={() => {
							navigator.clipboard.writeText(
								`${window.location.origin}${window.location.pathname}/${content.id}`
							);
							if (promptRef && promptRef.current) {
								promptRef.current.style.opacity = "100";
								setTimeout(() => (promptRef.current.style.opacity = "0"), 1500);
							}
						}}>
						<img src={share} alt="Share"></img> Share
					</div>
					<div className="prompt" ref={promptRef}>
						Share link copied to clipboard!
					</div>
				</li>
			</ul>
		</>
	);
}
