import { useState } from 'react'
import styles from '../assessPanel.module.css'

interface Sample {
    input: string,
    output: string,
    explanation: string
}
interface Question {
    title: string,
    difficulty_level: string,
    description: string,
    samples: Sample[]
}
const LeftContainer: React.FC<{ generatedQuestion: Question | null }> = ({ generatedQuestion }) => {

    console.log("Generated Question in Left Container:", generatedQuestion);
    return (
        <div className={styles.assessLeftContainer}>
            <div className={styles.assessQuestionContainer}>
                <div className={styles.assessQuestionHeader}>
                    <h1>
                        {generatedQuestion?.title}
                    </h1>

                    <h3
                        className={generatedQuestion?.difficulty_level === 'Beginner'
                            ? styles.greenColor
                            : generatedQuestion?.difficulty_level === 'Intermediate'
                                ? styles.yellowColor : styles.redColor}
                    >
                        {generatedQuestion?.difficulty_level}
                    </h3>
                </div>

                <div className={styles.assessQuestionDescription}>
                    <p> {generatedQuestion?.description}</p>
                </div>


                <div className={styles.assessSampleContainer}>
                    <h2>Sample Input and Output</h2>

                    {
                        generatedQuestion?.samples.map((sample, id) => (
                            <div className={styles.SampleInputOutputContainer} key={id}>
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
    )
}

export default LeftContainer;