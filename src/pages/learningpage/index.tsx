import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

import styles from "./learning.module.css";

import { SiTicktick } from "react-icons/si";
import { FaLock } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { RiAiGenerate2 } from "react-icons/ri";
import { IoMenuSharp } from "react-icons/io5";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";

import Beginner from "../../assets/basic.png"
import Intermediate from "../../assets/intermediate.png"
import Advanced from "../../assets/advanced.png"


import AssessPanel from "./components/AssesPanel";
import Modal from "../../components/Modal/index.tsx";


interface Topics {
    topic_id: number,
    topic_title: string,
    topic_description: string,
    is_completed: string
    language_id: number
}

interface TopicsApiResponse {
    success: boolean;
    message: string;
    data: {
        topics: Topics[];
        total: number;
    };
}

interface Sample {
    input: string,
    output: string,
    explanation: string
}
interface Question {
    title: string,
    difficulty_level : string,
    description: string,
    samples: Sample[]
}

const LearningPage = () => {
    const [isLearningPathVisible, setIsLearningPathVisible] = useState(true);
    const [learningPath, setLearningPath] = useState<Topics[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topics | null>(null);
    const [difficultyLevel, setDifficultyLevel] = useState("beginner");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

    const [question, setQuestion] = useState<Question | null>(null);

    const { id } = useParams();

    const fetchTopics = async () => {
        try {
            console.log("Fetching topics for learning path...");
            console.log("Language ID:", id);

            // Validate id before making the API call
            if (!id) {
                console.error("Course ID is missing. Cannot fetch topics.");
                return;
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const response = await axios.get<TopicsApiResponse>(`${backendUrl}/api/topics/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });

            console.log(response.data.data.topics);
            const topics = response.data.data.topics;
            setLearningPath(topics);

            // Set the first incomplete topic as selected, or the first topic if all are completed
            const firstIncomplete = topics.find(topic => !topic.is_completed);
            const topicToSelect = firstIncomplete || topics[0];
            if (topicToSelect) {
                setSelectedTopic(topicToSelect);
            }

        } catch (err) {
            console.error("Error fetching topics:", err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTopics();
        } else {
            console.error("Course ID is not available in the URL.");
        }
    }, [id]);



    useEffect(() => {
        const fetchLatestQuestion = async () => {
            setIsLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");
            const topic_id = selectedTopic?.topic_id;

            if (!topic_id) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${backendUrl}/api/topics/latest-question`, {
                    params: { topic_id },
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken && {
                            Authorization: `Bearer ${accessToken}`
                        })
                    }
                });

                if (response.data.success && response.data.data) {
                    setQuestion(response.data.data);
                } else {
                    setQuestion(null); // No question found
                }
            } catch (err) {
                console.error("Error fetching latest question:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestQuestion();

    }, [selectedTopic]);

    const toggleLearningPath = () => {
        setIsLearningPathVisible(!isLearningPathVisible);
    };

    const handleTopicSelect = (topic: Topics) => {
        setSelectedTopic(topic);
    };

    const handleDifficultyLevel = (e: string) => {
        setDifficultyLevel(e);
    }

    const handleQuestionGeneration = async () => {
        try {
            setIsGeneratingQuestion(true)
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const response = await axios.post(`${backendUrl}/api/topics/generate-question`, {
                topicId: selectedTopic?.topic_id,
                topicTitle: selectedTopic?.topic_title,
                difficultyLevel: difficultyLevel
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });
            console.log(response);
            setIsModalOpen(false);
            setIsGeneratingQuestion(false);
            setQuestion(response.data.data);
        } catch (err) {
            console.error("Error generating question:", err);
            setIsModalOpen(false);
        }finally{
            setIsGeneratingQuestion(false)
        }
    }

    const handlePreviousTopic = () => {
        if (!selectedTopic || learningPath.length === 0) return;

        const currentIndex = learningPath.findIndex(topic => topic.topic_id === selectedTopic.topic_id);
        if (currentIndex > 0) {
            setSelectedTopic(learningPath[currentIndex - 1]);
        }
    };

    const handleNextTopic = () => {
        if (!selectedTopic || learningPath.length === 0) return;

        const currentIndex = learningPath.findIndex(topic => topic.topic_id === selectedTopic.topic_id);
        if (currentIndex < learningPath.length - 1) {
            setSelectedTopic(learningPath[currentIndex + 1]);
        }
    };


    return (
        <div className={styles.learningMainContainer}>
            <div className={styles.learningNavbar}>
                <IoMenuSharp
                    className={styles.menuIcon}
                    onClick={toggleLearningPath}
                />
                <h1>{selectedTopic ? selectedTopic.topic_title : 'Select a Topic'}</h1>
            </div>
            <div className={styles.learningContent}>

                {/* Learning path */}
                <div
                    className={`${styles.learningPath} ${!isLearningPathVisible ? styles.hidden : ''}`}
                >
                    <div className={styles.learningPathHeader}>
                        <h2>Learning Path</h2>
                    </div>
                    <ul className={styles.learningPathList}>
                        {learningPath.map(item => (
                            <li
                                key={item.topic_id}
                                className={`${styles.learningPathItem} ${item.is_completed ? styles.completed : ''} ${selectedTopic?.topic_id === item.topic_id ? styles.selectedTopic : ''}`}
                                onClick={() => handleTopicSelect(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                {item.is_completed ? <SiTicktick className={styles.icon} /> : <FaLock className={styles.icon} />}
                                {item.topic_title}
                            </li>
                        ))}

                        <button className={styles.resetButton} >
                            Reset Progress
                        </button>
                    </ul>
                </div>

                {/* Content Area */}
                <div className={styles.contentMainContainer}>
                    <div className={styles.learningContentHeader}>
                        <FaLightbulb className={styles.explanationIcon} />
                        <h3> {selectedTopic ? (
                            <div>
                                <p>{selectedTopic.topic_description}</p>
                            </div>
                        ) : (
                            <div>
                                <p>Please select a topic from the learning path to view its content.</p>
                            </div>
                        )}</h3>
                        <button className={styles.readAloudButton}>Read Loud</button>
                    </div>

                    <div className={styles.learningContentBody}>




                        <h3>Explanation:</h3>
                        <ul>
                            <li><code>range(1, 6)</code> → generates numbers from 1 to 5.</li>
                            <li><code>i</code> → takes each value one by one.</li>
                            <li><code>print("Number:", i)</code> → displays the number.</li>
                        </ul>

                        <h2>2. Python <code>while</code> Loop Example</h2>
                        <p>This loop is used when we don’t know the exact number of repetitions.</p>

                        <pre>
                            <code>
                                # Using a while loop to print numbers from 1 to 5
                                i = 1  # starting point
                                {/* while i <= 5: */}
                                print("Number:", i)
                                i += 1  # increment by 1
                            </code>
                        </pre>

                        <h3>Explanation:</h3>
                        <ul>
                            <li>Start with <code>i = 1</code>.</li>
                            <li>The loop runs while <code>i &lt;= 5</code>.</li>
                            <li>After every iteration, <code>i</code> increases by 1.</li>
                            <li>When <code>i</code> becomes 6, the loop stops.</li>
                        </ul>
                    </div>
                </div>
            </div>


            <div className={styles.questionGenerationContainer}>
                <p>Practice with AI Generated Questions</p>
                <button className={styles.generateQuestionButton}
                    onClick={() => setIsModalOpen(true)}
                >
                    Generate Question <RiAiGenerate2 className={styles.generateAIImage} />
                </button>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Practice Question Difficulty level"
                    width="50vw"
                    height="40vh"
                >   
                    {isGeneratingQuestion === true && (
                        <div className={styles.loadingOverlay}></div>
                    )}
                    {isGeneratingQuestion === true ? (
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

                    ) : (<>

                        <div className={styles.modalImagesContainer}>
                            <div
                                className={`${styles.imageContainers} ${difficultyLevel === "Beginner" ? styles.selectedDifficulty : ""}`}
                                onClick={() => handleDifficultyLevel("Beginner")}
                            >
                                <div className={styles.modalImageContainer}>
                                    <img className={styles.modalImageContainerImg} src={Beginner} alt="Beginner Image" />
                                </div>

                                <p className={styles.imageContainersTitle}>Beginner</p>
                            </div>

                            <div
                                className={`${styles.imageContainers} ${difficultyLevel === "Intermediate" ? styles.selectedDifficulty : ""}`}
                                onClick={() => handleDifficultyLevel("Intermediate")}
                            >
                                <div className={styles.modalImageContainer}>
                                    <img className={styles.modalImageContainerImg} src={Intermediate} alt="Beginner Image" />
                                </div>
                                <p className={styles.imageContainersTitle}>Intermediate</p>
                            </div>

                            <div
                                className={`${styles.imageContainers} ${difficultyLevel === "Advanced" ? styles.selectedDifficulty : ""}`}
                                onClick={() => handleDifficultyLevel("Advanced")}
                            >                            <div className={styles.modalImageContainer}>
                                    <img className={styles.modalImageContainerImg} src={Advanced} alt="Beginner Image" />
                                </div>

                                <p className={styles.imageContainersTitle}>Advanced</p>
                            </div>
                        </div>
                        <button
                            className={styles.modalConfirmDifficulty}
                            onClick={handleQuestionGeneration}
                        >
                            Confirm
                        </button>
                    </>)}
                </Modal>
            </div>


            {question === null ? "" : (
                <AssessPanel generatedQuestion={question} languageId={selectedTopic?.language_id || 0} />
            )}


            <div className={styles.learningNavigation}>
                <button
                    className={styles.previousTopicNavigation}
                    onClick={handlePreviousTopic}
                    disabled={!selectedTopic || learningPath.findIndex(topic => topic.topic_id === selectedTopic.topic_id) === 0}
                >
                    <GrCaretPrevious className={styles.navigationIcons} />
                    Previous Topic

                </button>
                <button
                    className={styles.nextTopicNavigation}
                    onClick={handleNextTopic}
                    disabled={!selectedTopic || learningPath.findIndex(topic => topic.topic_id === selectedTopic.topic_id) === learningPath.length - 1}
                >
                    Next Topic
                    <GrCaretNext className={styles.navigationIcons} />
                </button>

                <button className={styles.topicCompletion}>Mark as Completed
                    <IoCheckmarkDoneOutline className={styles.navigationIcons} />
                </button>
            </div>

        </div>
    )
}

export default LearningPage;
