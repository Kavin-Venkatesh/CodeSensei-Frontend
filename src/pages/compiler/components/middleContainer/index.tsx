import styles from './middleContainer.module.css';
import { useQuestionContext } from '../../contextAPI';

import { FaLessThan } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa";


const MiddleContainer = () => {

    const {currentQuestion , submitQuestion , nextQuestion , previousQuestion} = useQuestionContext();

    if(!currentQuestion) return <div>Loading</div>

    const generatedQuestion = {
    title: "Grade Calculator",
    difficulty_level: "Beginner",
    description: "Write a program that calculates a student's grade based on their total marks. The program should accept the student's score as input (out of 100). Based on the score, the program should print the grade according to the following rules: \n- 90 to 100: Grade A\n- 80 to 89: Grade B\n- 70 to 79: Grade C\n- 60 to 69: Grade D\n- Below 60: Grade F\n\nMake sure your program checks for edge cases such as exactly 90 or exactly 60, and assigns the correct grade. The program should be able to handle multiple inputs and print the result for each student.",
    samples: [
      {
        input: "85",
        output: "Grade B",
        explanation: "Since 85 is between 80 and 89, the grade assigned is B."
      },
      {
        input: "59",
        output: "Grade F",
        explanation: "Since 59 is below 60, the grade assigned is F."
      },
       {
        input: "85",
        output: "Grade B",
        explanation: "Since 85 is between 80 and 89, the grade assigned is B."
      }
    ]
  };

    return (
        <div className={styles.compilerMiddleContainer}>
            <div className={styles.questionContainer}>
                <div className={styles.questionHeader}>
                    <h1>
                        {currentQuestion.question_title}
                    </h1>

                    <div className={styles.questionNavigationContainer}>
                        <button className={styles.previousButton}
                            onClick={previousQuestion}
                        > <FaLessThan /> </button>
                        <button className={styles.nextButton}
                            onClick={nextQuestion}
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

                <div style={{ marginTop: "20px" }}>
                    <button
                    onClick={() => submitQuestion(currentQuestion.question_id)}
                    style={{ padding: "10px 20px", background: "blue", color: "white", borderRadius: "6px" }}
                    >
                    Submit
                    </button>
                </div>
                </div>

            </div>
        </div>
    );
};

export default MiddleContainer;
