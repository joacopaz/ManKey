import { calculateTime } from "../searchbar/searchSlice";

export const options = {
	method: "GET",
	mode: "cors",
	headers: {
		"Access-Control-Allow-Origin": "*",
		Vary: "Origin",
	},
};

export const decodeHTML = function (html) {
	const text = document.createElement("textarea");
	text.innerHTML = html;
	return text.value;
};

export const generateRandomBackground = (percentage, ref) => {
	const randomColor =
		"#" +
		Math.floor(Math.random() * 16777215)
			.toString(16)
			.padStart(6, "0")
			.toUpperCase();
	ref.current.style.background = `radial-gradient(circle, ${randomColor} ${percentage}, ${randomColor} ${percentage}, #00000000 ${percentage}, #00000000 ${percentage})`;
};

export const fetchImg = async (author) => {
	if (author === "[deleted]") return null;
	const response = await fetch(
		`https://www.reddit.com/user/${author}/about.json`,
		options
	);
	const jsonResponse = await response.json();

	return jsonResponse.data.icon_img.match(/^(.+)\?/)?.[1];
};

export const applyEmojis = function (emojis, string) {
	if (!string) return;
	let replacedString = string;
	emojis.forEach(
		(emoji) =>
			(replacedString = replacedString.replace(
				new RegExp(":" + emoji.text + ":"),
				`<span class="emoji" style="background-image: url(${emoji.url})"></span>`
			))
	);
	return replacedString;
};

export const formatTime = (time) => {
	const sec_num = parseInt(time, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - hours * 3600) / 60);
	let seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return /*hours + ":" + */ minutes + ":" + seconds;
};

export const handlePost = (data) => {
	let body = data.selftext_html;
	if (!body) {
		body = "";
		// console.log(data);
	}
	const author = `u/${data.author}`;
	const thumbnail = data.thumbnail === "self" ? null : data.thumbnail;
	const title = data.title;
	const ratio = data.upvote_ratio;
	const score = data.score;
	const nsfw = data.over_18;
	const flair = data.link_flair_text;
	const linkFlairBackground = data.link_flair_background_color;
	const linkFlairTextColor = data.link_flair_text_color;
	const authorFlairBackground = data.author_flair_background_color;
	const authorFlairColor = data.author_flair_text_color;
	const authorFlair = data.author_flair_text;
	const preview = data.preview ? data.preview.enabled : false;
	const isTweet =
		data.media && data.media.type && data.media.type === "twitter.com"
			? data.media.oembed.url.match(/\d+$/)[0]
			: false;
	let awards = data.all_awardings.map((award) => ({
		id: award.id,
		icon: award.icon_url,
		name: award.name,
		count: award.count,
	}));
	if (!awards.length) awards = 0;
	const emojis = [];
	if (data.author_flair_richtext) {
		data.author_flair_richtext.forEach((emoji) =>
			emoji.u
				? emojis.push({
						text: emoji.u.match(/.*\/(.*)/)[1],
						url: emoji.u,
				  })
				: ""
		);
	}
	if (data.link_flair_richtext) {
		data.link_flair_richtext.forEach((emoji) =>
			emoji.u
				? emojis.push({
						text: emoji.u.match(/.*\/(.*)/)[1],
						url: emoji.u,
				  })
				: ""
		);
	}

	const createdAgo = calculateTime(data.created * 1000);
	const created = new Date(data.created * 1000).toDateString();
	const numComments = data.num_comments;
	const id = data.id;
	const stickied = data.stickied;
	const commentsURL = `https://www.reddit.com/comments/${id}.json`;
	const postHint = data.post_hint;
	const subReddit = data.subreddit;
	let isMedia = data.is_reddit_media_domain;
	const sort = data.suggested_sort;
	let video = null;
	let gallery = null;
	if (data.is_gallery) {
		for (const img in data.media_metadata) {
			const media = data.media_metadata[img];
			const format = media.m?.match(/\/(.*)/)[1];
			const url = `https://i.redd.it/${media.id}.${format}`;
			isMedia = "gallery";
			if (!gallery) gallery = [];
			gallery.push(url);
		}
	}

	let img = null;
	if (isMedia) {
		if (data.is_video) {
			video = {
				videoURL: data.media.reddit_video.fallback_url.match(
					/(.*)\?source=fallback/
				)[1],
				audioURL: (
					data.media.reddit_video.fallback_url.match(/(.*)DASH_/)[1] +
					"DASH_audio." +
					data.media.reddit_video.fallback_url.match(/\.([^.]*)$/)[1]
				).match(/(.*)\?source=fallback/)[1],
			};
			isMedia = "video";
		}
		if (!data.is_video && !data.is_gallery) {
			img = data.url;
		}
	}
	if (postHint === "image") {
		isMedia = "image";
		img = data.url;
	}
	if (!isMedia) isMedia = "text";
	let link;
	if (isMedia === "text" && data.url_overridden_by_dest) isMedia = "link";
	let isYoutube;
	if (isMedia === "link") {
		link = data.url_overridden_by_dest;
		if (data.domain.match(/youtu/))
			isYoutube = data.url_overridden_by_dest.match(/(\w+)$/)[0];
	}
	if (isMedia === "text" && body.match(/https:\/\/preview.redd.it/)) {
		isMedia = "image";
		img = `https://i.redd.it/${
			body.match(/https:\/\/preview.redd.it\/(.+)\?/)[1]
		}`;
	}
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
		subReddit,
		sort,
	};
};

export const handleComment = (data, kind) => {
	if (kind === "more" || (!data.author && data.id)) {
		const hasMore = data.children.map((id) => id);
		const { count } = data;
		return { hasMore, kind, count };
	}

	let awards = data.all_awardings.map((award) => ({
		id: award.id,
		icon: award.icon_url,
		name: award.name,
		count: award.count,
	}));
	if (!awards.length) awards = 0;
	const emojis = [];
	if (data.author_flair_richtext) {
		data.author_flair_richtext.forEach((emoji) =>
			emoji.u
				? emojis.push({
						text: emoji.u.match(/.*\/(.*)/)[1],
						url: emoji.u,
				  })
				: ""
		);
	}

	return {
		author: data.author,
		created: calculateTime(data.created * 1000, true),
		score: data.score,
		body: data.body_html,
		edited: data.edited,
		replies: data.replies?.data?.children.map((reply) =>
			handleComment(reply.data)
		),
		id: data.id,
		flairColor: data.author_flair_text_color,
		flairBackground: data.author_flair_background_color,
		flairText: data.author_flair_text,
		isOP: data.is_submitter,
		awards,
		emojis,
	};
};

export const getMoreComments = async (parentId, id) => {
	try {
		const endpoint = `https://www.reddit.com/comments/${parentId}/comment/${id}.json`;
		const comment = await fetch(endpoint, options);
		const jsonData = await comment.json();
		return jsonData[1].data.children.map((child) => {
			const data = handleComment(child.data);
			return data;
		});
	} catch (error) {
		console.log(error);
	}
};

export const recommended = [
	"r/AskReddit",
	"r/IAmA",
	"r/bestof",
	"r/fatpeoplestories",
	"r/pettyrevenge",
	"r/TalesFromRetail",
	"r/DoesAnybodyElse",
	"r/CrazyIdeas",
	"r/WTF",
	"r/aww",
	"r/cringepics",
	"r/cringe",
	"r/JusticePorn",
	"r/MorbidReality",
	"r/rage",
	"r/mildlyinfuriating",
	"r/creepy",
	"r/creepyPMs",
	"r/nosleep",
	"r/nostalgia",
	"r/gaming",
	"r/leagueoflegends",
	"r/pokemon",
	"r/Minecraft",
	"r/starcraft",
	"r/Games",
	"r/DotA2",
	"r/skyrim",
	"r/tf2",
	"r/magicTCG",
	"r/wow",
	"r/KerbalSpaceProgram",
	"r/mindcrack",
	"r/Fallout",
	"r/roosterteeth",
	"r/Planetside",
	"r/gamegrumps",
	"r/battlefield3",
	"r/zelda",
	"r/darksouls",
	"r/masseffect",
	"r/arresteddevelopment",
	"r/gameofthrones",
	"r/doctorwho",
	"r/mylittlepony",
	"r/community",
	"r/breakingbad",
	"r/adventuretime",
	"r/startrek",
	"r/TheSimpsons",
	"r/futurama",
	"r/HIMYM",
	"r/DunderMifflin",
	"r/thewalkingdead",
	"r/Music",
	"r/movies",
	"r/harrypotter",
	"r/StarWars",
	"r/DaftPunk",
	"r/hiphopheads",
	"r/anime",
	"r/comicbooks",
	"r/geek",
	"r/batman",
	"r/TheLastAirbender",
	"r/Naruto",
	"r/FanTheories",
	"r/funny",
	"r/AdviceAnimals",
	"r/fffffffuuuuuuuuuuuu",
	"r/4chan",
	"r/ImGoingToHellForThis",
	"r/firstworldanarchists",
	"r/circlejerk",
	"r/MURICA",
	"r/facepalm",
	"r/Jokes",
	"r/wheredidthesodago",
	"r/polandball",
	"r/TrollXChromosomes",
	"r/comics",
	"r/nottheonion",
	"r/britishproblems",
	"r/TumblrInAction",
	"r/onetruegod",
	"r/pics",
	"r/videos",
	"r/gifs",
	"r/reactiongifs",
	"r/mildlyinteresting",
	"r/woahdude",
	"r/FiftyFifty",
	"r/FoodPorn",
	"r/HistoryPorn",
	"r/wallpapers",
	"r/youtubehaiku",
	"r/Unexpected",
	"r/photoshopbattles",
	"r/AnimalsBeingJerks",
	"r/cosplay",
	"r/EarthPorn",
	"r/QuotesPorn",
	"r/awwnime",
	"r/AbandonedPorn",
	"r/carporn",
	"r/PerfectTiming",
	"r/OldSchoolCool",
	"r/RoomPorn",
	"r/Pareidolia",
	"r/MapPorn",
	"r/tumblr",
	"r/techsupportgore",
	"r/PrettyGirls",
	"r/itookapicture",
	"r/todayilearned",
	"r/science",
	"r/askscience",
	"r/space",
	"r/AskHistorians",
	"r/YouShouldKnow",
	"r/explainlikeimfive",
	"r/trees",
	"r/MakeupAddiction",
	"r/cats",
	"r/LifeProTips",
	"r/RedditLaqueristas",
	"r/Random_Acts_Of_Amazon",
	"r/food",
	"r/guns",
	"r/tattoos",
	"r/corgi",
	"r/teenagers",
	"r/GetMotivated",
	"r/motorcycles",
	"r/sex",
	"r/progresspics",
	"r/DIY",
	"r/bicycling",
	"r/Fitness",
	"r/lifehacks",
	"r/longboarding",
	"r/Frugal",
	"r/drunk",
	"r/Art",
	"r/loseit",
	"r/Military",
	"r/politics",
	"r/worldnews",
	"r/news",
	"r/conspiracy",
	"r/Libertarian",
	"r/TrueReddit",
	"r/Conservative",
	"r/offbeat",
	"r/canada",
	"r/toronto",
	"r/australia",
	"r/unitedkingdom",
	"r/atheism",
	"r/TwoXChromosomes",
	"r/MensRights",
	"r/gaybros",
	"r/lgbt",
	"r/nba",
	"r/soccer",
	"r/hockey",
	"r/nfl",
	"r/formula1",
	"r/baseball",
	"r/MMA",
	"r/SquaredCircle",
	"r/technology",
	"r/Android",
	"r/Bitcoin",
	"r/programming",
	"r/apple",
	"r/announcements",
	"r/Showerthoughts",
	"r/books",
	"r/sports",
	"r/blog",
	"r/gadgets",
];
