import { useNavigate } from "react-router-dom";
import warning from "../../assets/warning.png";

export function Warning({ authorize }) {
	const navigate = useNavigate(-1);
	return (
		<div className="nsfw-popup">
			<img src={warning} alt="Warning; over 18 required" />
			<span>This subreddit has been tagged as NSFW</span>
			<div className="nsfw-buttons">
				<button className="go-back" onClick={() => navigate(-1)}>
					Leave
				</button>
				<button
					className="confirm-age"
					onClick={() => {
						window.confirm("Are you sure you want to proceed?")
							? authorize(true)
							: navigate(-1);
					}}>
					I'm over 18
				</button>
			</div>
		</div>
	);
}
