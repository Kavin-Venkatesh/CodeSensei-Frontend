import styles from '../leftContainer/leftContainer.module.css';
import Modal from '../../../../components/Modal/index';
import JsonEditor from '../../../../components/jsonEditor';
import axios from 'axios';
import { useState } from 'react';
import { useQuestionContext } from "../../contextAPI/index.tsx";
import { MdOutlineDelete } from "react-icons/md";
import { BsQuestionCircle} from "react-icons/bs";
import { toast  } from 'react-toastify';
const LeftContainer = () => {

    const [isModalOpen , setIsModalOpen] = useState(true);
    const { questions, setCurrentQuestion , currentQuestion } = useQuestionContext();
    const [ isConfirmationModalOpen , setIsConfirmationModalOpen ] = useState(false);


    const handleDeleteAllQuestions = async() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const accessToken = localStorage.getItem('access_token');

        const user = localStorage.getItem('user');
        const userID = user ? JSON.parse(user).id : null;

        try {
            const response = await axios.delete(`${backendUrl}/api/questions/delete-all-questions/${userID}`, {
                headers: {
                    'Content-Type': 'application/json',
                       ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                }
            });
            
            if( response.status === 200 && response.data.success){
            toast.success("All questions deleted successfully");
            }
        } catch (error) {
            toast.error("Failed to delete all questions");
        }
    }


    const handleConfirmDelete = () => {
        setIsConfirmationModalOpen(true);
    };

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
                width='55vw'
                height = '70vh'
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

                <div>
                    <button
                        className={styles.deleteAllButton}
                        onClick={handleConfirmDelete}
                    >
                        <MdOutlineDelete className={styles.deleteIcon} />
                        Delete Questions
                    </button>
                </div>
            </div>


              <Modal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                title = "Confirm Deletion"
                width="40vw"
                height="37vh"

            >
                <div className={styles.modalContent}>

                    <BsQuestionCircle  className={styles.questionIcon} />
                    <h2>Are you sure you want to delete all the questions ?</h2>
                    <div className={styles.modalButtons}>
                        <button

                            className={styles.confirmButton}
                            onClick={() => {
                                handleDeleteAllQuestions();
                                setIsConfirmationModalOpen(false);
                            }}
                        >
                            Yes, Delete
                        </button>
                        <button

                            className={styles.cancelButton}
                            onClick={() => setIsConfirmationModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
export default LeftContainer;
