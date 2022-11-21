import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchSubreddits } from "../searchbar/searchSlice";
import {
	selectIsLoading,
	selectResults,
	selectTerm,
	selectHasError,
	selectLoadingPage,
} from "../searchbar/searchSlice";
import { fetchNextPage, fetchPrevPage } from "../searchbar/searchSlice";
import { Subreddit } from "./Subreddit";
import { useNavigate } from "react-router-dom";

export function Subreddits() {
	let subReddits, nextPage, prevPage, page;
	const results = useSelector(selectResults);
	if (results) ({ subReddits, nextPage, prevPage, page } = results);
	const navigate = useNavigate();
	const isLoading = useSelector(selectIsLoading);
	const isLoadingPage = useSelector(selectLoadingPage);
	const hasError = useSelector(selectHasError);
	const dispatch = useDispatch();
	const term = useSelector(selectTerm);
	useEffect(() => {
		if (term) dispatch(fetchSubreddits(term));
		if (!term) navigate("/");
	}, [dispatch, term, navigate]);
	const handleClick = (e) =>
		e.target.name === "next"
			? dispatch(fetchNextPage({ term, nextPage, page }))
			: dispatch(fetchPrevPage({ term, prevPage, page }));

	return (
		<>
			{hasError && <h1 className="favHeader">Network error</h1>}
			{isLoading && <p className={"loading"}>Loading...</p>}
			{isLoading && (
				<div className="center">
					<div className="lds-ring">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			)}
			{!isLoading && (
				<>
					{subReddits && subReddits.length > 0 && (
						<h3 className="favHeader">Results for "{term}"</h3>
					)}
					<ul className="subReddits">
						{typeof subReddits !== "undefined" &&
							(subReddits.length > 0 ? (
								subReddits.map((sub, i) => (
									<Subreddit content={sub} key={i} tabIndex={i + 2} />
								))
							) : (
								<>
									<li className="favHeader">No search results for "{term}"</li>
									<li
										style={{
											textAlign: "center",
											color: "white",
											textDecoration: "underline",
											cursor: "pointer",
										}}
										onClick={() => navigate("/")}>
										Go back
									</li>
								</>
							))}
					</ul>
					{typeof subReddits !== "undefined" && (
						<div className="buttonContainer">
							<button
								name="prev"
								className="prev"
								disabled={page === 1}
								onClick={handleClick}
								tabIndex={120}>
								Prev
							</button>
							<div className="pg">
								{isLoadingPage ? (
									<div className="center">
										<div className="lds-ring small">
											<div></div>
											<div></div>
											<div></div>
											<div></div>
										</div>
									</div>
								) : (
									`Page ${page}`
								)}
							</div>
							<button
								name="next"
								className="next"
								onClick={handleClick}
								disabled={!nextPage}
								tabIndex={121}>
								Next
							</button>
							<div
								tabIndex={122}
								onFocus={() =>
									document.querySelector('[tabindex="2"]').focus()
								}></div>
						</div>
					)}
				</>
			)}
		</>
	);
}
