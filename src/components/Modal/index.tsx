import type React from "react";
import styles from "./modal.module.css";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    width?: string;
    height?: string;
    title?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    width = "50vw",
    height = "auto",
    children,
}) => {


    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key == 'Escape') onClose();
        }

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose])


    if (!isOpen) return null;
    return (
        <div className={styles.overlay} onClick={onClose} >
            <div
                className={styles.modal}
                style={{ width, height }}
                onClick={(e) => e.stopPropagation()}  // Prevent closing when clicking inside
                >
                <header className={styles.header}>
                    <h1>{title || "Modal Title"}</h1>
                    <button className={styles.closeBtn} onClick={onClose}> &times; </button>
                </header>

                <div className={styles.content}>{children}
                </div>


            </div>
        </div>
    )
}

export default Modal;