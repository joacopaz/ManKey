import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "../features/searchbar/searchSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";
import postsReducer from "../features/posts/postsSlice";
import postReducer from "../features/post/postSlice";

const generateFavCookie = (favorites) => {
	document.cookie = `favorites=${favorites}; expires=${new Date(
		new Date().getTime() + 1000 * 60 * 60 * 24 * 365
	).toGMTString()}; path=/; SameSite=Lax`;
};

const cookieMiddleware = (store) => (next) => (action) => {
	if (action.type === "favorites/addFavorite") {
		const prevFavs = [...store.getState().favorites.favorites];
		prevFavs.push(action.payload.title);
		const favs = prevFavs;
		generateFavCookie(JSON.stringify(favs));
	}
	if (action.type === "favorites/removeFavorite") {
		const prevFavs = [...store.getState().favorites.favorites];
		const favs = prevFavs.filter(
			(favorite) => favorite !== action.payload.title
		);
		generateFavCookie(JSON.stringify(favs));
	}
	return next(action);
};

export const store = configureStore({
	reducer: {
		search: searchReducer,
		favorites: favoritesReducer,
		posts: postsReducer,
		post: postReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(cookieMiddleware),
});
