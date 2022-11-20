import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const calculateTime = (date, abbreviate) => {
	const now = new Date();
	let diffInMilliseconds = Math.abs(now - date) / 1000;
	const days = Math.floor(diffInMilliseconds / 86400);
	diffInMilliseconds -= days * 86400;
	const hours = Math.floor(diffInMilliseconds / 60 / 60);
	let difference = "";
	if (days > 365) {
		abbreviate
			? (difference += `${Math.floor(days / 365)} yrs`)
			: (difference += `${Math.floor(days / 365)} years`);
	} else if (days > 0 && days < 365) {
		difference += days + " days";
	} else if (days === 0 && hours > 0) {
		abbreviate
			? (difference = hours + " hr.")
			: (difference = hours + " hours");
	} else if (hours === 0) {
		abbreviate
			? (difference = Math.floor(diffInMilliseconds / 60) + " min.")
			: (difference = Math.floor(diffInMilliseconds / 60) + " minutes");
	}
	return difference + " ago";
};

const searchTerm = localStorage.getItem("searchTerm")
	? localStorage.getItem("searchTerm")
	: "";

const initialState = {
	searchTerm: searchTerm,
	isLoading: false,
	loadingPage: false,
	hasError: false,
	results: {},
};

export const fetchSubreddits = createAsyncThunk(
	"search/fetchSubreddits",
	async (term) => {
		try {
			const endpoint = `https://www.reddit.com/search/.json?q=${term}&type=sr&count=24&limit=24`;
			const response = await fetch(endpoint);
			const jsonResponse = await response.json();
			if (!jsonResponse.data) return { subReddits: [], page: 1 };
			const children = jsonResponse.data.children;
			const subReddits = children.map((sub) => {
				const { data } = sub;
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
			});
			return {
				subReddits,
				nextPage: jsonResponse.data.after,
				prevPage: jsonResponse.data.before,
				page: 1,
			};
		} catch (error) {
			console.log(error);
		}
	}
);

export const fetchNextPage = createAsyncThunk(
	"search/fetchNextPage",
	async (args) => {
		const { term, nextPage, page } = args;
		try {
			const endpoint = `https://www.reddit.com/search/.json?q=${term}&type=sr&after=${nextPage}&count=24&limit=24`;
			const response = await fetch(endpoint);
			const jsonResponse = await response.json();
			const children = jsonResponse.data.children;
			const subReddits = children.map((sub) => {
				const { data } = sub;
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
			});
			return {
				subReddits: subReddits,
				nextPage: jsonResponse.data.after,
				prevPage: jsonResponse.data.before,
				page: nextPage ? parseInt(page) + 1 : 1,
			};
		} catch (error) {
			console.log(error);
		}
	}
);

export const fetchPrevPage = createAsyncThunk(
	"search/fetchPrevPage",
	async (args) => {
		const { term, prevPage, page } = args;
		try {
			const endpoint = `https://www.reddit.com/search/.json?q=${term}&type=sr&before=${prevPage}&count=24&limit=24`;

			const response = await fetch(endpoint);
			const jsonResponse = await response.json();
			const children = jsonResponse.data.children;
			const subReddits = children.map((sub) => {
				const { data } = sub;
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
			});
			return {
				subReddits: subReddits,
				nextPage: jsonResponse.data.after,
				prevPage: jsonResponse.data.before,
				page: prevPage ? parseInt(page) - 1 : 1,
			};
		} catch (error) {
			console.log(error);
		}
	}
);

export const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		setTerm: (state, action) => {
			localStorage.setItem("searchTerm", action.payload);
			state.searchTerm = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSubreddits.pending, (state) => {
				state.isLoading = true;
				state.hasError = false;
			})
			.addCase(fetchSubreddits.fulfilled, (state, action) => {
				state.isLoading = false;
				state.hasError = false;
				state.results = action.payload;
			})
			.addCase(fetchSubreddits.rejected, (state) => {
				state.isLoading = false;
				state.hasError = true;
				state.results = "";
			})
			.addCase(fetchNextPage.pending, (state) => {
				state.loadingPage = true;
				state.hasError = false;
			})
			.addCase(fetchNextPage.fulfilled, (state, action) => {
				state.loadingPage = false;
				state.hasError = false;
				state.results = action.payload;
			})
			.addCase(fetchNextPage.rejected, (state) => {
				state.loadingPage = false;
				state.hasError = true;
				state.results = "";
			})
			.addCase(fetchPrevPage.pending, (state) => {
				state.loadingPage = true;
				state.hasError = false;
			})
			.addCase(fetchPrevPage.fulfilled, (state, action) => {
				state.loadingPage = false;
				state.hasError = false;
				state.results = action.payload;
			})
			.addCase(fetchPrevPage.rejected, (state) => {
				state.loadingPage = false;
				state.hasError = true;
				state.results = "";
			});
	},
});

export const { setTerm } = searchSlice.actions;
export const selectResults = (state) => state.search.results;
export const selectTerm = (state) => state.search.searchTerm;
export const selectIsLoading = (state) => state.search.isLoading;
export const selectLoadingPage = (state) => state.search.loadingPage;
export const selectHasError = (state) => state.search.hasError;
export default searchSlice.reducer;
