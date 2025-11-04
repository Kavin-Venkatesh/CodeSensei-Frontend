import styles from './middleContainer.module.css';
import { useQuestionContext } from '../../contextAPI';

import { FaLessThan } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";

const MiddleContainer = () => {

    const {currentQuestion , nextQuestion , previousQuestion} = useQuestionContext();

    if(!currentQuestion) return <div>Loading</div>

    return (
        <div className={styles.compilerMiddleContainer}>
            <div className={styles.questionContainer}>
                <div className={styles.questionHeader}>
                    <h1>
                        {currentQuestion.question_title}
                    </h1>

                    <div className={styles.questionNavigationContainer}>
                        <button 
                            className={styles.previousButton}
                            onClick={previousQuestion}
                            title = "Previous Question"
                        > <FaLessThan /> </button>
                        <button 
                            className={styles.nextButton}
                            onClick={nextQuestion}
                            title = "Next Question"
                        > <FaGreaterThan /> </button>
                    </div>

                </div>

                <div className={styles.questionDescription}>
                    <p> {currentQuestion.question_description}</p>
                </div>


                <div className={styles.sampleContainer}>
                    <h2>Sample Input and Output</h2>
                    
                    <div className={styles.sampleInputOutputContainer}>
                                <h3>Example </h3>
                                <p> <span>Input  : </span>{ currentQuestion.sample_input}</p>
                                <p> <span>Output  : </span> {currentQuestion.sample_output}</p>
                                <p> <span>Explanation  : </span> {currentQuestion.explanation}</p>
                    </div>
                </div>

                <div className={styles.deleteButtonContainer}>
                    <button className={styles.deleteButton}>
                        <MdOutlineDeleteOutline />
                    </button>
                </div>

                
            </div>
        </div>
    );
};

export default MiddleContainer;
