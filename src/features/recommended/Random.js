import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function Random() {
	const navigate = useNavigate();
	const headerRef = useRef(null);
	useLayoutEffect(() => {
		setTimeout(() =>
			fetch("https://www.reddit.com/random.json")
				.then((r) => r.json())
				.then((r) => navigate(`/r/${r[0].data.children[0].data.subreddit}`))
				.catch((err) => console.log(err))
		);
	}, [headerRef]);
	return (
		<>
			<h1 className="favHeader" ref={headerRef}>
				Randomizing
			</h1>
			<div className="center">
				<div className="lds-ring">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
		</>
	);
}
