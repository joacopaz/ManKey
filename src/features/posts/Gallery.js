import { useRef, useState, useLayoutEffect } from "react";
import { isMobile } from "react-device-detect";
import "./gallery.css";

export function Gallery({ imgs }) {
	const [active, setActive] = useState(0);
	const [animating, setAnimating] = useState(false);
	const [loaded, setLoaded] = useState(0);
	const [adjustedHeight, setAdjustedHeight] = useState(false);
	const prevRef = useRef(null);
	const activeRef = useRef(null);
	const nextRef = useRef(null);
	const carrouselRef = useRef(null);
	const nextActive = imgs[active + 1] ? active + 1 : 0;
	const prevActive = imgs[active - 1] ? active - 1 : imgs.length - 1;

	useLayoutEffect(() => {
		if (animating && animating.next && animating.animating) {
			nextRef.current.style.animationName = "enterRight";
			activeRef.current.style.animationName = "exitLeft";
		}
		if (animating && animating.next && !animating.animating) {
			activeRef.current.style.animationName = "unset";
			nextRef.current.style.animationName = "unset";
		}
		if (animating && !animating.next && animating.animating) {
			prevRef.current.style.animationName = "enterLeft";
			activeRef.current.style.animationName = "exitRight";
		}
		if (animating && !animating.next && !animating.animating) {
			activeRef.current.style.animationName = "unset";
			prevRef.current.style.animationName = "unset";
		}
	}, [animating, active]);

	const handleClick = ({ target }) => {
		if (target.dataset.disabled === "true") return;
		target.dataset.disabled = "true";
		setTimeout(() => (target.dataset.disabled = "false"), 220);
		if (target.dataset.next === "true") {
			setAnimating({ next: true, animating: true });
			setTimeout(
				() => {
					setActive((active) => (imgs[active + 1] ? active + 1 : 0));
					setAnimating({ next: true, animating: false });
				},
				isMobile ? 190 : 190 //190
			);
		} else if (target.dataset.next !== "true") {
			setAnimating({ next: false, animating: true });
			setTimeout(
				() => {
					setActive((active) =>
						imgs[active - 1] ? active - 1 : imgs.length - 1
					);
					setAnimating({ next: false, animating: false });
				},
				isMobile ? 190 : 190 //190
			);
		}
	};

	return (
		<>
			<div className="carrouselContainer">
				<div className="carrousel" ref={carrouselRef}>
					{loaded < 3 && (
						<div className="lds-ring">
							<div></div>
							<div></div>
							<div></div>
							<div></div>
						</div>
					)}
					<img
						src={imgs[prevActive]}
						alt="Gallery"
						ref={prevRef}
						onLoad={() => loaded < 3 && setLoaded((prev) => prev + 1)}
						className="inactive imgLeft"
					></img>
					<img
						src={imgs[active]}
						alt="Gallery"
						ref={activeRef}
						onLoad={() => {
							loaded < 3 && setLoaded((prev) => prev + 1);
							if (
								adjustedHeight &&
								adjustedHeight > activeRef.current.clientHeight
							)
								return;
							activeRef.current.style.minHeight =
								activeRef.current.clientHeight + "px";
							setAdjustedHeight(true);
						}}
						className="active"
					></img>
					<img
						src={imgs[nextActive]}
						alt="Gallery"
						ref={nextRef}
						onLoad={() => loaded < 3 && setLoaded((prev) => prev + 1)}
						className="inactive imgRight"
					></img>

					<div className="carrouselLabel">
						{active + 1} / {imgs.length}
					</div>
				</div>
				<div
					className="carrouselButton alignRight"
					onPointerDown={loaded > 2 ? handleClick : undefined}
					data-next={true}
				>
					{">"}
				</div>
				<div
					className="carrouselButton alignLeft"
					onPointerDown={loaded > 2 ? handleClick : undefined}
					data-next={false}
				>
					{"<"}
				</div>
			</div>
		</>
	);
}
