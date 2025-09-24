import styles from '../leftContainer/leftContainer.module.css';

const LeftContainer = () => {
    return (
        <div className={styles.compilerLeftContainer}>
            <div className={styles.compilerLeftContainerHeader}>
                <button className={styles.addQuestionsButton}>
                   + Add Question
                </button>
            </div>


            <div className={styles.compilerLeftContainerBody}>
                <h3>Questions List  </h3>
                <div className={styles.questionsList}>
                    <div className={styles.questionsListItems}>
                        1
                    </div>
                    <div className={styles.questionsListItems}>
                        2
                    </div>

                     <div className={styles.questionsListItems}>
                        3
                    </div>

                     <div className={styles.questionsListItems}>
                        4
                    </div>
                     <div className={styles.questionsListItems}>
                        5
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LeftContainer;
