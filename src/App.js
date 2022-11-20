import React from "react";
import { Header } from "./features/header/Header";
import { useSelector } from "react-redux";
import { Subreddits } from "./features/subReddits/Subreddits";
import { SubReddit } from "./features/posts/SubReddit";
import "./App.css";
import { selectHasError } from "./features/searchbar/searchSlice";
import { selectFavorites } from "./features/favorites/favoritesSlice";
import { Routes, Route } from "react-router-dom";
import { Favorites } from "./features/favorites/Favorites";
import { Post } from "./features/post/Post";
import { Recommended } from "./features/recommended/Recommended";

function App() {
	const hasError = useSelector(selectHasError);
	const favorites = useSelector(selectFavorites);
	return (
		<div className="App">
			<Header />
			{hasError
				? alert(
						"The Reddit API is not responding, please check your connection or the status of the service."
				  )
				: ""}
			<Routes>
				<Route path="*" element={<Favorites favorites={favorites} />} />
				<Route path="search" element={<Subreddits />} />
				<Route path="/r/:subReddit" element={<SubReddit />} />
				<Route path="/r/:subReddit/:post" element={<Post />} />
				<Route path="recommended" element={<Recommended />} />
			</Routes>
		</div>
	);
}

export default App;
