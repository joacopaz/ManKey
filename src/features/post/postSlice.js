import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handlePost } from "../posts/util";
import { handleComment } from "../posts/util";

const initialState = {
	post: {},
	isLoading: false,
	comments: [],
};

export const fetchPost = createAsyncThunk("post/fetchPost", async (post) => {
	try {
		const endpoint = `https://www.reddit.com/${post}.json`;
		const response = await fetch(endpoint, {
			mode: 'cors',
			headers: {
			  'Access-Control-Allow-Origin':'*'
			}});
		const jsonResponse = await response.json();
		// Handle the post information logic
		if (!jsonResponse[0]?.data) return console.error("Invalid post");
		const data = jsonResponse[0]?.data?.children[0].data;
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
			subReddit,
			sort,
		} = handlePost(data);
		// Handle the comments information logic
		const comments = jsonResponse[1].data.children.map(({ data, kind }) => {
			const comment = handleComment(data, kind);
			return comment;
		});
		return {
			post: {
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
				subReddit,
				sort,
			},
			comments,
		};
	} catch (error) {
		console.log(error);
	}
});

export const postSlice = createSlice({
	name: "post",
	initialState,
	reducers: {
		resetPost: (state) => {
			state.post = {};
			state.comments = [];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPost.pending, (state) => {
				state.isLoading = true;
				state.hasError = false;
				state.loaded = false;
			})
			.addCase(fetchPost.fulfilled, (state, action) => {
				state.isLoading = false;
				state.hasError = false;
				state.loaded = true;
				state.post = action.payload?.post;
				state.comments = action.payload?.comments;
			})
			.addCase(fetchPost.rejected, (state) => {
				state.isLoading = false;
				state.hasError = true;
				state.loaded = false;
			});
	},
});
export const { resetPost } = postSlice.actions;
export const selectPost = (state) => state.post;
export default postSlice.reducer;
