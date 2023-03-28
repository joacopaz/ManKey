import React from "react";
import ReactDOM from "react-dom";
import styles from "./ModalAlert.module.css";

function Alert({ message, onClose }) {
	React.useEffect(() => {
		// Create event listener
		const listener = () => {
			onClose();
		};
		window.addEventListener("click", listener);

		// Remove event listener
		return () => window.removeEventListener("click", listener);
	}, [onClose]);

	return ReactDOM.createPortal(
		<div className={styles.overlay}>
			<div className={styles.container}>
				<div className={styles.content}>
					<button className={styles.close} onClick={onClose}>
						&times;
					</button>
					<p>{message}</p>
				</div>
			</div>
		</div>,
		document.body
	);
}

export default Alert;
