import noIcon from "../../assets/reddit-logo-2436.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export function Popup({
	setSelected,
	content,
	dispatch,
	addFavorite,
	isFavorite,
	removeFavorite,
	isFav,
	info,
}) {
	useEffect(() => {
		document.addEventListener("keydown", ({ code }) =>
			code === "Escape" ? setSelected(false) : ""
		);
		return () => {
			document.removeEventListener("keydown", ({ code }) =>
				code === "Escape" ? setSelected(false) : ""
			);
		};
	}, [setSelected]);
	const navigate = useNavigate();
	return (
		<div className="outerPopup">
			<div className={`popup ${info && "info"}`}>
				<div
					className="close"
					tabIndex={101}
					onClick={() => setSelected(false)}
					onKeyDown={({ code }) =>
						code === "Enter" || code === "Space" ? setSelected(false) : ""
					}></div>
				<h1>{content.title}</h1>
				<h2>Description</h2>

				<p>{content.description ? content.description : "No description"}</p>

				<img
					src={content.icon ? content.icon : noIcon}
					alt="Subreddit's icon"
				/>
				<p>Created {content.createdAgo}</p>
				<p>
					{new Intl.NumberFormat("en").format(content.subscribers)} subscribers{" "}
				</p>
				{/* ghost div to focus enter */}
				<div
					tabIndex={98}
					onFocus={() => {
						document.querySelector(".close").focus();
					}}></div>
				{!info && (
					<button
						className="enter"
						id="enterPopup"
						autoFocus={true}
						tabIndex={100}
						onClick={() => navigate("../" + content.title)}>
						Visit
					</button>
				)}
				<div
					tabIndex={102}
					onFocus={() => document.querySelector("#enterPopup").focus()}></div>
				{/* end of ghost div to focus enter */}
				<div
					tabIndex={100}
					className={`favorite ${isFavorite ? "active" : "inactive"}`}
					onClick={() => {
						if (isFavorite) {
							isFavorite
								? dispatch(removeFavorite(content))
								: dispatch(addFavorite(content));
							return;
						}
						isFavorite
							? dispatch(removeFavorite(content))
							: dispatch(addFavorite(content));
					}}
					onKeyDown={({ code }) => {
						if (code === "Enter" || code === "Space") {
							if (isFavorite) {
								isFavorite
									? dispatch(removeFavorite(content))
									: dispatch(addFavorite(content));

								return;
							}
							isFavorite
								? dispatch(removeFavorite(content))
								: dispatch(addFavorite(content));
						}
					}}></div>
			</div>
		</div>
	);
}
