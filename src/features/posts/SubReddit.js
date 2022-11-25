import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Posts } from "./Posts";
import {
	setSubReddit,
	selectIsLoading,
	selectPosts,
	selectFilters,
	fetchPosts,
	setCleanup,
	selectNextPage,
	setSticked,
	selectSticked,
	selectSubredditInfo,
	fetchSubredditInfo,
	selectinfoHasError,
	selectLastPost,
	selectLoaded,
} from "./postsSlice";
import { isMobile } from "react-device-detect";
import "./subReddit.css";
import { Filters } from "./Filters";
import { Warning } from "./Warning";

export function SubReddit() {
	useEffect(() => {
		window.scrollTo(0, 0, {
			behavior: "smooth",
		});
	}, []);
	const [confirmed, setConfirmed] = useState(false);
	const params = useParams();
	const subReddit = params.subReddit;
	const { firstFilter } = useSelector(selectFilters);
	const { secondFilter } = useSelector(selectFilters);
	const dispatch = useDispatch();
	const lastPost = useSelector(selectLastPost);
	const loaded = useSelector(selectLoaded);
	const [scrolled, setScrolled] = useState(false);
	useEffect(() => {
		if (lastPost && document.getElementById(lastPost) && !scrolled) {
			setScrolled(true);
			document.getElementById(lastPost).scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [loaded, lastPost, scrolled]);

	useEffect(() => {
		dispatch(fetchSubredditInfo(subReddit));
		dispatch(setSubReddit(subReddit));
		dispatch(
			fetchPosts({
				subReddit: subReddit,
				filter: firstFilter,
				secondFilter: secondFilter,
			})
		);
		// Observe if object sticks for animation
		const observer = new IntersectionObserver(
			(entry) =>
				entry[0].isIntersecting
					? dispatch(setSticked(false))
					: dispatch(setSticked(true)),
			{
				rootMargin: !isMobile ? "-60px 0px 0px 0px" : "-25px 0px 0px 0px",
				threshold: [1],
			}
		);
		observer.observe(stickyRef.current);
		return () => {
			dispatch(setCleanup());
			dispatch(setSticked(false));
			observer.disconnect();
		};
	}, [firstFilter, secondFilter, dispatch, subReddit]);

	useEffect(() => {
		if (fetching) return;
		fetching = true;
		const fetchMorePosts = (entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !isLoading && nextPage)
					dispatch(
						fetchPosts({
							subReddit: subReddit,
							filter: firstFilter,
							secondFilter: secondFilter,
							page: { after: nextPage },
						})
					);
			});
		};

		// Observer for fetching more posts
		const options = {
			rootMargin: isMobile ? "200px" : "0px",
			threshold: [1],
		};

		let observer = new IntersectionObserver(fetchMorePosts, options);

		if (bottomRef.current) observer.observe(bottomRef.current);

		return () => {
			observer.disconnect();
			fetching = false;
		};
	});
	const bottomRef = useRef(null);
	const stickyRef = useRef(null);
	const isLoading = useSelector(selectIsLoading);
	const nextPage = useSelector(selectNextPage);
	const isStuck = useSelector(selectSticked);
	const posts = useSelector(selectPosts);
	let fetching = false;
	const stickies = posts.filter((post) => post.stickied);
	const info = useSelector(selectSubredditInfo);
	const infoHasError = useSelector(selectinfoHasError);
	const navigate = useNavigate();
	// console.log(infoHasError);
	if (infoHasError)
		return (
			<>
				<h1 className="favHeader">Oops, something went wrong </h1>
				<p className="link" onClick={() => navigate(-1)}>
					Go back
				</p>
			</>
		);
	return (
		<>
			{info?.nsfw && !confirmed ? <Warning authorize={setConfirmed} /> : ""}
			{!info?.nsfw || confirmed ? (
				<>
					<h1
						className={`favHeader ${isStuck ? "hidden" : ""}`}
						ref={stickyRef}>
						r/{subReddit}
					</h1>
					<Filters />
					<div className="posts">
						{posts.map((post, i) => (
							<Posts
								content={post}
								key={post.id}
								stickies={stickies.length}
								setScrolled={setScrolled}
							/>
						))}
					</div>
					<div ref={bottomRef} className="bottomDetector">
						{isLoading && (
							<>
								<p className="loading">Loading...</p>
								<div className="lds-ring">
									<div></div>
									<div></div>
									<div></div>
									<div></div>
								</div>
							</>
						)}
					</div>
				</>
			) : (
				""
			)}
		</>
	);
}
