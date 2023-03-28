import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import {
	fetchFavorites,
	selectFavIsLoading,
	selectFavoritesFetched,
} from "./favoritesSlice";
import { Subreddit } from "../subReddits/Subreddit";
export function Favorites({ favorites }) {
	useEffect(() => {
		window.scrollTo(0, 0, {
			behavior: "smooth",
		});
	}, []);
	const dispatch = useDispatch();
	const fetchedFavorites = useSelector(selectFavoritesFetched);
	const favsAreLoading = useSelector(selectFavIsLoading);
	useEffect(() => {
		dispatch(fetchFavorites(favorites));
	}, [favorites, dispatch]);
	const resultsRef = useRef(null);

	return (
		<>
			{favorites.length === 0 ? (
				<div className="favoritesAll">
					<h1 className="favHeader">
						Welcome to <span style={{ color: "rgb(97, 48, 8)" }}>Man</span>
						<span style={{ color: "rgb(73, 42, 17)" }}>key</span>
					</h1>
					<h2 className="about">Reddit's easy mode</h2>

					<ol className="about aligned">
						<li>Search for subreddits up here {String.fromCharCode(8593)}</li>
						<li>
							Click the star {String.fromCharCode(9734)} to favorite subreddits
						</li>
						<li>Enjoy the memes without hassle</li>
					</ol>
				</div>
			) : (
				""
			)}
			{favsAreLoading ? (
				<p className={"loading"}>Loading...</p>
			) : favorites.length > 0 ? (
				resultsRef.current?.childNodes.length !== 1 && (
					<h1 className="favHeader">Favorites</h1>
				)
			) : (
				""
			)}
			{favsAreLoading ? (
				<div className="center">
					<div className="lds-ring">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			) : (
				""
			)}
			<ul className="subReddits favorites" ref={resultsRef}>
				{fetchedFavorites.map((favorite, i) => (
					<Subreddit content={favorite} tabIndex={i + 2} key={i} isFav={true} />
				))}
				<div
					tabIndex={fetchedFavorites.length + 2}
					onFocus={() => document.querySelector('[tabindex="1"]').focus()}
				></div>
			</ul>
		</>
	);
}
