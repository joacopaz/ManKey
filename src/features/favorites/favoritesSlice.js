import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { calculateTime } from "../searchbar/searchSlice";
let favs = [];
if (
	document.cookie.match(/favorites=(.*)/) &&
	document.cookie.match(/favorites=(.*)/)[1]
)
	try {
		favs = JSON.parse(document.cookie.match(/favorites=(.*)/)[1]);
	} catch (error) {
		console.log(error);
		document.cookie = `favorites=''; expires=${new Date(
			new Date().getTime() - 1000 * 60 * 60 * 24 * 365
		).toGMTString()};`;
	}

const initialState = {
	favorites: favs,
	favoritesFetched: [],
	isLoading: false,
	hasError: false,
};

export const fetchFavorites = createAsyncThunk(
	"favorites/fetchFavorites",
	async (favorites) => {
		try {
			const fetchedFavorites = await Promise.all(
				favorites.map(async (favorite) => {
					const endpoint = `https://www.reddit.com/${favorite}/about.json`;
					const response = await fetch(endpoint, {
						mode: 'cors',
						headers: {
						  'Access-Control-Allow-Origin':'*'
						}});
					if (!response.ok) {
						alert("There has been an error fetching your favorite Subreddits");
						document.cookie = `favorites=''; expires=${new Date(
							new Date().getTime() - 1000 * 60 * 60 * 24 * 365
						).toGMTString()};`;
					}
					const jsonResponse = await response.json();
					const data = jsonResponse.data;
					let icon = data.community_icon;
					if (icon.match(/(.*)(.png|.jpg|.jpeg|.PNG|.JPG|.JPEG)/)) {
						icon = icon.match(/(.*)(.png|.jpg|.jpeg|.PNG|.JPG|.JPEG)/)[0];
					}
					return {
						title: data.display_name_prefixed,
						subscribers: data.subscribers,
						description: data.public_description,
						createdAgo: calculateTime(data.created * 1000),
						created: new Date(data.created * 1000).toDateString(),
						nsfw: data.over18,
						url: data.url,
						icon: icon,
					};
				})
			);
			return fetchedFavorites;
		} catch (error) {
			console.log(error);
		}
	}
);

export const favoritesSlice = createSlice({
	name: "favorites",
	initialState,
	reducers: {
		addFavorite: (state, action) => {
			state.favorites.push(action.payload.title);
		},
		removeFavorite: (state, action) => {
			state.favorites = state.favorites.filter(
				(favorite) => favorite !== action.payload.title
			);
		},
	},
	extraReducers: (builder) =>
		builder
			.addCase(fetchFavorites.pending, (state) => {
				state.isLoading = true;
				state.hasError = false;
			})
			.addCase(fetchFavorites.fulfilled, (state, action) => {
				state.isLoading = false;
				state.hasError = false;
				state.favoritesFetched = action.payload;
			})
			.addCase(fetchFavorites.rejected, (state) => {
				state.isLoading = false;
				state.hasError = true;
				state.favoritesFetched = [];
			}),
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesFetched = (state) => {
	return state.favorites.favoritesFetched;
};
export const selectFavIsLoading = (state) => state.favorites.isLoading;
export const selectFavHasError = (state) => state.favorites.hasError;

export default favoritesSlice.reducer;
