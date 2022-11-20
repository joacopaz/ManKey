import { useSelector } from "react-redux";
import {
	selectinfoHasError,
	selectSticked,
	selectSubReddit,
} from "../posts/postsSlice";
import { SearchBar } from "../searchbar/SearchBar";
export function Header() {
	const isStuck = useSelector(selectSticked);
	const subReddit = useSelector(selectSubReddit);
	const infoHasError = useSelector(selectinfoHasError);
	return (
		<header className={isStuck && !infoHasError ? "stucked" : ""}>
			<div className="headerContent">
				<h2>Reddit, but simpler</h2>
				<SearchBar />
				<h3>No popups nor hassle required, just navigate!</h3>
				<div
					className={`subRedditInHeader ${
						isStuck && !infoHasError ? "show" : "hide"
					}`}>
					r/{subReddit}
				</div>
			</div>
		</header>
	);
}
