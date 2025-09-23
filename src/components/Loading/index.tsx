import styles from './loading.module.css';


const Loading = () => {
    return (
        <div className={styles.loadingOverlay}>
            <div className={styles.spinnerContainer}>
                <div className={styles.spinner}>
                    <div className={styles.spinner}>
                        <div className={styles.spinner}>
                            <div className={styles.spinner}>
                                <div className={styles.spinner}>
                                    <div className={styles.spinner} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Loading;
