import styles from './middleContainer.module.css';

import { FaLessThan } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa";


const MiddleContainer = () => {

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
                        {generatedQuestion?.title}
                    </h1>

                    <div className={styles.questionNavigationContainer}>
                        <button className={styles.previousButton}> <FaLessThan /> </button>
                        <button className={styles.nextButton}> <FaGreaterThan /> </button>
                    </div>
                </div>

                <div className={styles.questionDescription}>
                    <p> {generatedQuestion?.description}</p>
                </div>


                <div className={styles.sampleContainer}>
                    <h2>Sample Input and Output</h2>

                    {
                        generatedQuestion?.samples.map((sample, id) => (
                            <div className={styles.sampleInputOutputContainer} key={id}>
                                <h3>Example {id + 1} </h3>
                                <p> <span>Input  : </span>{sample.input}</p>
                                <p> <span>Output  : </span> {sample.output}</p>
                                <p> <span>Explanation  : </span> {sample.explanation}</p>
                            </div>
                        ))
                    }

                </div>

            </div>
        </div>
    );
};

export default MiddleContainer;
