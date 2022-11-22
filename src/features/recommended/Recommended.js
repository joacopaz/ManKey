import { useRef } from "react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useLocation } from "react-router-dom";
import { recommended, fetchRecommended } from "../posts/util";
import { Subreddit } from "../subReddits/Subreddit";
import { isMobile } from "react-device-detect";

export function Recommended() {
	const [page, setPage] = useState(1);
	useEffect(() => {
		if (!isMobile) return;
		window.scrollTo(0, 0, {
			behavior: "smooth",
		});
	}, [page]);
	const [list, setList] = useState(null);
	const location = useLocation();
	const q = useQueryClient();
	useEffect(() => {
		return () => q.clear();
	}, [location.pathname, q]);
	if (!list) setList(recommended.sort(() => Math.random() - 0.5));
	const pageLength = 24;
	const currentRef = useRef(null);
	const {
		isError,
		isSuccess,
		isFetching,
		data,
		error,
		refetch,
		isLoading,
		isStale,
	} = useQuery(
		["recommended"], // name of the fetch id
		() => fetchRecommended(currentRef.current), // function to run
		{ staleTime: 60000, enabled: false } // time to cache
	);
	let info = data;
	useEffect(() => {
		currentRef.current = list?.slice(
			(page - 1) * pageLength,
			page * pageLength
		);
		refetch();
	}, [refetch, list, page]);
	const fetchingMobile = isFetching && isMobile ? true : false;
	return (
		<>
			{!isError && <h1 className="favHeader">Recommended</h1>}
			{isError && <h1 className="favHeader">Network error</h1> &&
				console.log(error)}
			{(isLoading || fetchingMobile) && <p className={"loading"}>Loading...</p>}
			{(isLoading || fetchingMobile) && (
				<div className="center">
					<div className="lds-ring">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			)}

			{isSuccess && !isStale && !fetchingMobile ? (
				<>
					<ul className="subReddits">
						{data && info
							? info.map((sub, i) => {
									if (!sub) return;
									return <Subreddit content={sub} key={i} tabIndex={i + 2} />;
							  })
							: ""}
					</ul>
					{
						<div className="buttonContainer">
							<button
								name="prev"
								className="prev"
								disabled={page === 1}
								onClick={() => setPage((page) => page - 1)}
								tabIndex={120}>
								Prev
							</button>
							<div className="pg">
								{!isLoading && isFetching ? (
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
								onClick={() => setPage((page) => page + 1)}
								disabled={(page + 1) * pageLength > list?.length}
								tabIndex={121}>
								Next
							</button>
							<div
								tabIndex={122}
								onFocus={() =>
									document.querySelector('[tabindex="2"]').focus()
								}></div>
						</div>
					}
				</>
			) : (
				""
			)}
		</>
	);
}
