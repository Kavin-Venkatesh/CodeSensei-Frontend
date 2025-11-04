import styles from '../leftContainer/leftContainer.module.css';
import Modal from '../../../../components/Modal/index';
import JsonEditor from '../../../../components/jsonEditor';

import { useState } from 'react';
import { useQuestionContext } from "../../contextAPI/index.tsx";

const LeftContainer = () => {

    const [isModalOpen , setIsModalOpen] = useState(false);
    const { questions, setCurrentQuestion , currentQuestion } = useQuestionContext();
    return (
        <div className={styles.compilerLeftContainer}>
            <div className={styles.compilerLeftContainerHeader}>
                <button className={styles.addQuestionsButton}
                    onClick={() => setIsModalOpen(true)}
                >
                   + Add Question
                </button>
            </div>

            <Modal
                isOpen = {isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title='Add Questions'
                width='50vw'
                height = '50vh'
            >
                <div className={styles.modalMainContainer}>                    
                    <div className={styles.questionContainer}>
                            <JsonEditor width="900px" height="380px" />
                    </div>
                </div>
            </Modal>


            <div className={styles.compilerLeftContainerBody}>
                <h3>Questions</h3>
                <div className={styles.questionsList}>

                    {questions.map((question , index) =>{
                            const isSelected = currentQuestion?.question_id === question.question_id;
                            const isSubmitted = question.submitted;
                        
                       return(<div  className={
                            ` ${styles.questionsListItems} 
                                ${isSubmitted ? styles.submitted : ""} 
                                ${isSelected ? styles.selected : ""}`
                        }
                            key={question.question_id}
                            onClick={() => setCurrentQuestion(question.question_id)}
                        > 
                        {index  + 1}
                        </div> ) 
                    })}
                </div>

                <div className={styles.bottomColorContainer}>
                    <div className = {styles.colorContainer}>
                        <div className={styles.notSelectedContainer}>

                        </div> - <h2>Not selected</h2>
                    </div>
                    <div className = {styles.colorContainer}>
                        <div className={styles.selectedContainer}>

                        </div> - <h2>Selected</h2>
                    </div>
                    <div className = {styles.colorContainer}>
                        <div className={styles.savedContainer}>

                        </div> - <h2> Saved </h2>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};
export default LeftContainer;
