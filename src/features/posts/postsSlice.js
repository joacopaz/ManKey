import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { calculateTime } from "../searchbar/searchSlice";
import { handlePost } from "./util";

const initialState = {
	subReddit: "",
	muted: true,
	fullScreen: false,
	isLoading: false,
	loaded: false,
	isLoadingPage: false,
	hasError: false,
	posts: [],
	firstPage: null,
	nextPage: null,
	prevPage: null,
	sticked: false,
	filter: { firstFilter: "hot", secondFilter: null },
	interacted: false,
	vol: 0,
	infoIsLoading: false,
	infoHasError: false,
	infoLoaded: false,
	subRedditInfo: [],
};

export const fetchPosts = createAsyncThunk(
	"posts/fetchPosts",
	async ({ subReddit, filter, secondFilter, page }) => {
		try {
			let action = null;
			let append = false;
			if (page) append = true;
			if (page && page.after) action = "after";
			if (page && page.before) action = "before";
			let endpoint = `https://www.reddit.com/r/${subReddit}${
				filter ? `/${filter}` : ""
			}.json${secondFilter ? secondFilter : ""}?count=24&limit=24${
				action ? `&${action}=${page[action]}` : ""
			}`;
			// console.log(endpoint);
			const response = await fetch(endpoint);
			const jsonResponse = await response.json();
			if (!jsonResponse.data) return { posts: [], page: 1 };
			const children = jsonResponse.data.children;
			const posts = children.map((post) => {
				const { data } = post;
				// console.log(data);
				const {
					author,
					linkFlairBackground,
					linkFlairTextColor,
					thumbnail,
					title,
					stickied,
					ratio,
					score,
					awards,
					flair,
					authorFlair,
					authorFlairBackground,
					authorFlairColor,
					createdAgo,
					created,
					numComments,
					id,
					commentsURL,
					isMedia,
					video,
					gallery,
					img,
					body,
					emojis,
					preview,
					isTweet,
					link,
					isYoutube,
				} = handlePost(data);
				return {
					author,
					linkFlairBackground,
					linkFlairTextColor,
					thumbnail,
					title,
					stickied,
					ratio,
					score,
					awards,
					flair,
					authorFlair,
					authorFlairBackground,
					authorFlairColor,
					createdAgo,
					created,
					numComments,
					id,
					commentsURL,
					isMedia,
					video,
					gallery,
					img,
					body,
					emojis,
					preview,
					isTweet,
					link,
					isYoutube,
				};
			});
			return {
				posts,
				append: append,
				nextPage: jsonResponse.data.after,
				prevPage: jsonResponse.data.before,
			};
		} catch (error) {
			console.log(error);
		}
	}
);

export const fetchSubredditInfo = createAsyncThunk(
	"posts/fetchSubredditInfo",
	async (subReddit) => {
		try {
			const endpoint = `https://www.reddit.com/r/${subReddit}/about.json`;
			const response = await fetch(endpoint);
			const jsonResponse = await response.json();
			if (!jsonResponse.data) {
				return "Invalid data";
			}
			const data = jsonResponse.data;
			// console.log(data);
			let icon = data.community_icon;
			if (icon.match(/(.*)(.png|.jpg|.jpeg|.PNG|.JPG|.JPEG)/)) {
				icon = icon.match(/(.*)(.png|.jpg|.jpeg|.PNG|.JPG|.JPEG)/)[0];
			}
			// console.log(data);
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
		} catch (error) {
			console.log(error);
		}
	}
);

export const postsSlice = createSlice({
	name: "posts",
	initialState,
	reducers: {
		setSubReddit: (state, action) => {
			state.subReddit = action.payload;
		},
		setFilters: (state, action) => {
			state.filter = {
				firstFilter: action.payload.firstFilter,
				secondFilter: action.payload.secondFilter,
			};
		},
		setMuted: (state, action) => {
			state.muted = action.payload;
		},
		setVol: (state, action) => {
			state.vol = action.payload;
		},
		setInteracted: (state, action) => {
			state.interacted = action.payload;
		},
		setCleanup: (state) => {
			state.subReddit = "";
			state.posts = [];
		},
		setFullScreen: (state, action) => {
			state.fullScreen = action.payload;
		},
		setSticked: (state, action) => {
			state.sticked = action.payload;
		},
		setSubInfo: (state, action) => {
			state.subInfo = action;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPosts.pending, (state) => {
				state.isLoading = true;
				state.hasError = false;
				state.loaded = false;
			})
			.addCase(fetchPosts.fulfilled, (state, action) => {
				state.isLoading = false;
				state.hasError = false;
				state.loaded = true;
				if (!action.payload.append) {
					state.posts = action.payload.posts;
					if (action.payload.prevPage && state.firstPage === null)
						state.firstPage = action.payload.prevPage;
				}
				if (action.payload.append) {
					action.payload.posts.forEach((post) => state.posts.push(post));
				}
				state.nextPage = action.payload.nextPage;
				state.prevPage = action.payload.prevPage;
			})
			.addCase(fetchPosts.rejected, (state) => {
				state.isLoading = false;
				state.hasError = true;
				state.loaded = false;
				state.posts = [];
			})
			.addCase(fetchSubredditInfo.pending, (state) => {
				state.infoIsLoading = true;
				state.infoHasError = false;
				state.infoLoaded = false;
			})
			.addCase(fetchSubredditInfo.fulfilled, (state, action) => {
				if (action.payload === "Invalid data") {
					state.infoHasError = true;
					return;
				}
				state.infoIsLoading = false;
				state.infoHasError = false;
				state.infoLoaded = true;
				state.subRedditInfo = action.payload;
			})
			.addCase(fetchSubredditInfo.rejected, (state, action) => {
				if (action.payload === "Invalid data") {
					state.infoHasError = true;
					return;
				}
				state.infoIsLoading = false;
				state.infoHasError = true;
				state.infoLoaded = false;
				state.subRedditInfo = [];
			});
	},
});

export const {
	setSubReddit,
	setInteracted,
	setFilters,
	setMuted,
	setCleanup,
	setVol,
	setFullScreen,
	setSticked,
} = postsSlice.actions;
export const selectVol = (state) => state.posts.vol;
export const selectFullScreen = (state) => state.posts.fullScreen;
export const selectLoaded = (state) => state.posts.loaded;
export const selectMuted = (state) => state.posts.muted;
export const selectInteracted = (state) => state.posts.interacted;
export const selectSubReddit = (state) => state.posts.subReddit;
export const selectIsLoading = (state) => state.posts.isLoading;
export const selectIsLoadingPage = (state) => state.posts.isLoadingPage;
export const selectHasError = (state) => state.posts.hasError;
export const selectPosts = (state) => state.posts.posts;
export const selectNextPage = (state) => state.posts.nextPage;
export const selectFilters = (state) => state.posts.filter;
export const selectFirstPage = (state) => state.posts.firstPage;
export const selectSticked = (state) => state.posts.sticked;
export const selectSubredditInfo = (state) => state.posts.subRedditInfo;
export const selectinfoHasError = (state) => state.posts.infoHasError;
export default postsSlice.reducer;
