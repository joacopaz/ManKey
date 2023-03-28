import React from "react";
import ReactDOM from "react-dom";
import styles from "./ModalAlert.module.css";

function Alert({ message, onClose }) {
	React.useEffect(() => {
		const listener = window.addEventListener("click", () => {
			onClose();
		});
		return () => window.removeEventListener("click", listener);
	});

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
