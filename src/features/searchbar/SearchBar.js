import React, { useState } from "react";
import { useDispatch } from "react-redux";
import searchIcon from "../../assets/search-icon.png";
import { setTerm } from "./searchSlice";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export function SearchBar() {
	const [searchInputValue, setSearchInputValue] = useState("");
	const handleChange = (e) => setSearchInputValue(e.target.value);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!searchInputValue) return;
		dispatch(setTerm(searchInputValue));
		setSearchInputValue("");
		navigate("search");
	};
	return (
		<>
			{" "}
			<div className="navbar">
				<NavLink
					to="/r/random"
					end
					tabIndex={1}
					className={(e) => (e.isActive ? "randomLink active" : "randomLink")}>
					Random!
				</NavLink>
				<NavLink
					to="/recommended"
					end
					tabIndex={2}
					className={(e) =>
						e.isActive ? "recommendedLink active" : "recommendedLink"
					}>
					Recommended
				</NavLink>
				<NavLink
					to="/"
					end
					tabIndex={3}
					className={(e) =>
						e.isActive ? "favoritesLink active" : "favoritesLink"
					}>
					Favorites
				</NavLink>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="searchBar">
					<div
						tabIndex={1}
						onFocus={() =>
							document.querySelector('[tabindex="121"]').focus()
						}></div>
					<input
						type="text"
						onChange={handleChange}
						placeholder="Search for subreddits"
						value={searchInputValue}
						tabIndex={2}
					/>
					<button type="submit">
						<img src={searchIcon} alt="Search Icon" className="search" />
					</button>
				</div>
			</form>
		</>
	);
}
