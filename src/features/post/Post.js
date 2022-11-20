import bubble from "../../assets/bubble.png";
import neutralScore from "../../assets/score_arrow.png";
import positiveScore from "../../assets/score_arrow_upvote.png";
import negativeScore from "../../assets/score_arrow_downvote.png";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "./post.css";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import link from "../../assets/link.png";
import share from "../../assets/share.png";
import { decodeHTML, applyEmojis } from "../posts/util";
import { Video } from "../posts/Video";
import { Tweet } from "react-twitter-widgets";
import { Gallery } from "../posts/Gallery";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPost, resetPost, selectPost } from "./postSlice";
import { Comment } from "./Comment";

export function Post() {
	const { post } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const postData = useSelector(selectPost);
	const isLoading = postData.isLoading;
	const content = postData.post;
	const [width, setWidth] = useState(null);
	useEffect(() => {
		window.scrollTo({ top: 0 });
		dispatch(fetchPost(post));
		return () => dispatch(resetPost());
	}, [post, dispatch]);
	const ref = useRef(null);
	const promptRef = useRef(null);
	return (
		<>
			{isLoading && (
				<>
					<p className={"loading"}>Loading...</p>
					<div className="center">
						<div className="lds-ring">
							<div></div>
							<div></div>
							<div></div>
							<div></div>
						</div>
					</div>
				</>
			)}
			<div className="boundryLeft" onClick={() => navigate(-1)}></div>
			<div className="boundryRight" onClick={() => navigate(-1)}></div>
			{!isLoading && !content && (
				<>
					<h1 className="subRedditHeader">Invalid Post</h1>
					<p
						className="link"
						onClick={() => {
							if (content) navigate(`./${content.subReddit}`);
							if (!content) navigate(-1);
						}}>
						Go back
					</p>
				</>
			)}
			{!isLoading && content && (
				<>
					<ul
						id={content.id}
						className="post exclusive"
						onLoad={(e) => setWidth(e.currentTarget.offsetWidth)}>
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
							)}{" "}
							{content.createdAgo}
						</li>

						<li className="content">
							<span className="content title">{content.title}</span>
							{content.flair && (
								<>
									{<br></br>}
									<span
										className="flair"
										style={{
											backgroundColor: content.linkFlairBackground,
											color:
												content.linkFlairTextColor === "dark"
													? "black"
													: "white",
										}}
										dangerouslySetInnerHTML={{
											__html: applyEmojis(content.emojis, content.flair),
										}}></span>
								</>
							)}
						</li>

						<li className="content score">
							{content.score > 999
								? `${Math.round((content.score / 1000) * 10) / 10}k`
								: content.score}
							<span
								className="innerScore"
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
										onClick={() => window.open(content.img, "_blank")}></img>
								</>
							)}
							{content.isMedia === "video" && (
								<Video id={content.id} video={content.video} />
							)}
							{content.isMedia === "text" && (
								<div
									ref={ref}
									className="textMedia"
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
							<div className="content comments exclusive">
								<img src={bubble} alt="#"></img>
								{content.numComments} Comments
							</div>
							<div
								className="content share"
								onClick={() => {
									navigator.clipboard.writeText(
										`${window.location.origin}${window.location.pathname}`
									);
									if (promptRef?.current) {
										promptRef.current.style.opacity = "100";
										setTimeout(
											() => (promptRef.current.style.opacity = "0"),
											1500
										);
									}
								}}>
								<img src={share} alt="Share"></img> Share
							</div>
							<div className="prompt" ref={promptRef}>
								Share link copied to clipboard!
							</div>
						</li>
					</ul>
					<div className="commentsAll">
						{postData.comments.length > 0 ? (
							<ul className="commentList" style={{ width: width }}>
								{postData.comments.map((comment) => (
									<Comment
										content={comment}
										key={comment.id}
										nesting={0}
										parentId={content.id}
									/>
								))}
							</ul>
						) : (
							""
						)}
					</div>
				</>
			)}
		</>
	);
}
