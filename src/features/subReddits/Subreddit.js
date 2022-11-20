import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import noIcon from "../../assets/reddit-logo-2436.png";
import { Popup } from "./Popup";
import {
	selectFavorites,
	addFavorite,
	removeFavorite,
} from "../favorites/favoritesSlice";

export function Subreddit({ content, tabIndex, isFav }) {
	const favorites = useSelector(selectFavorites);
	const isFavorite =
		favorites && favorites.find((favorite) => favorite === content.title);
	const [selected, setSelected] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	return (
		<>
			{selected && (
				<Popup
					content={content}
					setSelected={setSelected}
					isFavorite={isFavorite}
					dispatch={dispatch}
					addFavorite={addFavorite}
					removeFavorite={removeFavorite}
					isFav={isFav}
				/>
			)}
			<li>
				<div
					className="subReddit"
					tabIndex={tabIndex}
					onKeyDown={({ code }) =>
						code === "Enter" || code === "Space" ? setSelected(true) : ""
					}>
					<div
						className="clickableSubredditLink one"
						onClick={() => {
							setSelected(true);
						}}></div>
					<div
						className="clickableSubredditLink two"
						onClick={() => {
							setSelected(true);
						}}></div>
					<div
						className="clickableSubredditLink three"
						onClick={() => {
							setSelected(true);
						}}></div>
					<h3>{content.title}</h3>
					<p className="subs">
						{new Intl.NumberFormat("en").format(content.subscribers)} subs
					</p>
					<div
						className={`favorite ${isFavorite ? "active" : "inactive"}`}
						onClick={() => {
							if (isFav) {
								isFavorite
									? dispatch(removeFavorite(content))
									: dispatch(addFavorite(content));
								return;
							}
							isFavorite
								? dispatch(removeFavorite(content))
								: dispatch(addFavorite(content));
						}}></div>
					<p className="enter" onClick={() => navigate("../" + content.title)}>
						Visit
					</p>
					<img
						className="icon"
						src={content.icon ? content.icon : noIcon}
						alt={`${content.title}'s icon`}
					/>
				</div>
			</li>
		</>
	);
}
