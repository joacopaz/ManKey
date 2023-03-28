import React from "react";
import ReactDOM from "react-dom";
import styles from "./ModalAlert.module.css";

function Alert({ message, setWasAlerted }) {
	const modalRef = React.useRef();
	const onClose = () => {
		setWasAlerted(true);
		localStorage.setItem("alerted", "true");
	};

	React.useEffect(() => {
		modalRef.current.addEventListener("click", onClose);
	});

	return ReactDOM.createPortal(
		<div ref={modalRef} className={styles.overlay}>
			<div className={styles.container}>
				<div className={styles.content}>
					<button className={styles.close} onClick={() => onClose()}>
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
