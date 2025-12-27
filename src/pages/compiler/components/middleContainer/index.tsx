import styles from './middleContainer.module.css';
import { useQuestionContext } from '../../contextAPI';
import Modal from '../../../../components/Modal/index';
import { FaLessThan } from "react-icons/fa";
import { FaGreaterThan } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { BsQuestionCircle  } from "react-icons/bs";

const MiddleContainer = () => {

    const { currentQuestion, nextQuestion, previousQuestion } = useQuestionContext();
    const [isModalOpen , setIsModalOpen] = useState(false);
    if (!currentQuestion) return <div>No Questions found </div>

    const handleDelete = async () => {
        if (!currentQuestion) return;

        const access_token = localStorage.getItem("access_token");
        const backendurl = import.meta.env.VITE_BACKEND_URL;

        try {
            const response = await axios.delete(`${backendurl}/api/questions/delete-question/${
                currentQuestion.question_id
                }`,
                {
                headers: {
                    "Content-Type": "application/json",
                    ...(access_token && { Authorization: `Bearer ${access_token}` }),
                },
            });
            

            if (response.status === 200 && response.data.success) {
                toast.success("Question deleted successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                nextQuestion();


            } else {
                toast.error("Failed to delete the question.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }

        } catch (error) {
            toast.error("An error occurred while deleting the question.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };


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
                            title="Previous Question"
                        > <FaLessThan /> </button>
                        <button
                            className={styles.nextButton}
                            onClick={nextQuestion}
                            title="Next Question"
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
                        <p> <span>Input  : </span>{currentQuestion.sample_input}</p>
                        <p> <span>Output  : </span> {currentQuestion.sample_output}</p>
                        <p> <span>Explanation  : </span> {currentQuestion.explanation}</p>
                    </div>
                </div>

                <div className={styles.deleteButtonContainer}>
                    <button
                        className={styles.deleteButton}
                        onClick={handleOpenModal}
                    >
                        <MdOutlineDeleteOutline />
                    </button>
                </div>

            </div>


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title = "Confirm Deletion"
                width="40vw"
                height="37vh"

            >
                <div className={styles.modalContent}>

                    <BsQuestionCircle  className={styles.questionIcon} />
                    <h2>Are you sure you want to delete this question?</h2>
                    <div className={styles.modalButtons}>
                        <button

                            className={styles.confirmButton}
                            onClick={() => {
                                handleDelete();
                                setIsModalOpen(false);
                            }}
                        >
                            Yes, Delete
                        </button>
                        <button

                            className={styles.cancelButton}
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MiddleContainer;
