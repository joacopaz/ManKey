import { recommended } from "../posts/util";
export function Recommended() {
	const recommendList = recommended.sort(() => Math.random() - 0.5);
	return (
		<>
			<h1 className="favHeader">Recommended</h1>
			<ul>
				{recommendList.map((e) => (
					<li key={e}>{e}</li>
				))}
			</ul>
		</>
	);
}
