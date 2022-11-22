import { useEffect, useRef, useState } from "react";
import {
	applyEmojis,
	decodeHTML,
	fetchImg,
	generateRandomBackground,
	getMoreComments,
} from "../posts/util";
import defaultIcon from "../../assets/default_avatar.png";

export function Comment({ content, nesting, parentId, isNew }) {
	const {
		author,
		created,
		score,
		body,
		edited,
		replies,
		id,
		flairColor,
		flairBackground,
		flairText,
		awards,
		emojis,
		isOP,
	} = content;
	const [fetched, setFetched] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [moreComments, setMoreComments] = useState(null);
	const [hidden, setHidden] = useState(false);
	const iconRef = useRef(null);
	const toggleDisplayRef = useRef(null);
	const toggleDisplayListener = useRef(null);
	const parentRef = useRef(null);
	const threadRef = useRef(null);
	useEffect(() => {
		if (fetched) return;
		fetchImg(content.author).then((img) => {
			if (img && iconRef && iconRef.current) iconRef.current.src = img;
			if (!img && iconRef && iconRef.current) {
				generateRandomBackground("50%", iconRef);
			}
			setFetched(true);
		});
		// if (!author && id)
		// 	getMoreComments(parentId, id).then((comments) => {
		// 		setSeeMore(comments);
		// 	});
	});
	if (!body && !author && !id && !content.hasMore) return;
	if (content.hasMore) {
		if (content.hasMore.length === 0) return;
		return (
			<>
				{!expanded ? (
					<div
						key={id}
						className="seeMore"
						onClick={async () => {
							setLoadingMore(true);
							const moreComments = await Promise.all(
								content.hasMore.map(async (id) => {
									const comment = await getMoreComments(parentId, id);
									return comment;
								})
							);
							setMoreComments(...moreComments);
							setLoadingMore(false);
							setExpanded(true);
						}}>
						{loadingMore
							? "Loading..."
							: `See ${content.hasMore ? content.count : ""} more ${
									content.count.length === 1 ? "reply" : "replies"
							  }`}
					</div>
				) : null}
				{expanded
					? moreComments.map((comment) => {
							return (
								<Comment
									isNew={true}
									key={comment.id}
									content={comment ? comment : null}
									nesting={nesting + 1}
									parentId={parentId}
								/>
							);
					  })
					: null}
			</>
		);
	}
	return (
		<li
			className={`commentItem ${nesting === 0 ? "topLevel" : ""} ${
				isNew ? "new" : ""
			}`}
			style={{
				marginLeft: nesting ? "1rem" : 0,
				width: `calc(100% - ${nesting * 5}px)`,
			}}
			ref={parentRef}>
			{hidden ? "" : <div className="thread" ref={threadRef}></div>}
			<div
				className="toggleDisplayListener"
				ref={toggleDisplayListener}
				onMouseOver={() => {
					if (threadRef?.current)
						threadRef.current.style.backgroundColor = "white";
				}}
				onMouseLeave={() => {
					if (threadRef?.current) threadRef.current.style.backgroundColor = "";
				}}
				onClick={() => setHidden((prev) => !prev)}></div>
			<div
				className={`toggleDisplay ${hidden ? "contracted" : "expanded"}`}
				ref={toggleDisplayRef}></div>
			<p className="commentAuthor">
				<img
					src={defaultIcon}
					ref={iconRef}
					className="commentIcon"
					alt={`${content.author} icon`}
				/>
				{author}&nbsp;
				{isOP ? <span className="op">OP&nbsp;</span> : ""} ·&nbsp;
				<span>{created}</span>
			</p>
			{flairText ? (
				<span
					className="emojiContainer"
					style={{
						backgroundColor: flairBackground
							? flairBackground
							: "rgb(77, 77, 77)",
						color:
							flairColor === "dark" &&
							flairBackground !== "transparent" &&
							flairBackground
								? "black"
								: "white",
					}}
					dangerouslySetInnerHTML={{
						__html: applyEmojis(emojis, flairText),
					}}></span>
			) : null}
			{hidden ? (
				""
			) : (
				<div
					className="commentBody"
					dangerouslySetInnerHTML={{
						__html: decodeHTML(content.body),
					}}></div>
			)}
			<div className="commentButtons"></div>
			{replies && !hidden ? (
				<ul className="commentList">
					{replies.map((reply, i) => (
						<Comment
							key={reply.id}
							content={reply ? reply : null}
							nesting={nesting + 1}
							parentId={parentId}
						/>
					))}
				</ul>
			) : null}
		</li>
	);
}
