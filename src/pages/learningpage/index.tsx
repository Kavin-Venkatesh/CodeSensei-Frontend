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
import Loading from "../../components/Loading/index.tsx";
import Modal from "../../components/Modal/index.tsx";
import MarkdownRenderer from "./components/markdownRenderer";


interface Topics {
    topic_id: number,
    topic_title: string,
    topic_description: string,
    is_completed: 0 | 1,
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
    difficulty_level: string,
    description: string,
    samples: Sample[]
}

interface TopicContentResponse {
    success: boolean;
    message: string;
    data: {
        content: {
            changed: boolean;
            reason: string;
            content: {
                official_content: string;
                ai_content: string;
            };
            topic_title: string;
            topic_description: string;
            course_title: string;
            official_docs_url: string;
        };
    };
}

const LearningPage = () => {
    const [isLearningPathVisible, setIsLearningPathVisible] = useState(true);
    const [learningPath, setLearningPath] = useState<Topics[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topics | null>(null);
    const [difficultyLevel, setDifficultyLevel] = useState("beginner");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [topicData, setTopicData] = useState<TopicContentResponse["data"]["content"] | null>(null);

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


    const fetchTopicContent = async (topicId: number) => {
        try {
            console.log("Fetching content for topic ID:", topicId);
            setIsContentLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");
            const response = await axios.get(`${backendUrl}/api/topics/ai-content/${topicId}?waitForContent=true`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });
            console.log("Topic content response:", response.data);
            setTopicData(response.data.data.content);
            setIsContentLoading(false);
            // Handle the content as needed
        } catch (err) {
            console.error("Error fetching topic content:", err);
            setIsContentLoading(false);
        } finally {
            setIsContentLoading(false);
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
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");
            const topic_id = selectedTopic?.topic_id;

            if (!topic_id) {
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
            }
        };

        fetchLatestQuestion();
        fetchTopicContent(selectedTopic?.topic_id || 0);
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
        } finally {
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


    const handleMarkAsCompleted = async () => {
        if (!selectedTopic) return;

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            await axios.put(`${backendUrl}/api/topics/mark-completed/${selectedTopic.topic_id}`, {
                is_completed: 1
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });

            setLearningPath(prev =>
                prev.map(topic =>
                    topic.topic_id === selectedTopic.topic_id
                        ? { ...topic, is_completed: 1 } // ✅ set to 1
                        : topic
                )
            );


            const currentIndex = learningPath.findIndex(
                topic => topic.topic_id === selectedTopic.topic_id
            );
            if (currentIndex < learningPath.length - 1) {
                setSelectedTopic(learningPath[currentIndex + 1]);
            }
        } catch (err) {
            console.error("Error marking topic as completed:", err);

        }
    }

    const handleResetTopics = async () => {
        try {

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const courseId = id;
            
            if (!courseId) {
                console.error("Course ID is missing. Cannot reset topics.");
                return;
            }

            await axios.put(`${backendUrl}/api/topics/reset-topics/${id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',

                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });
            // Reset local state
            setLearningPath(prev => prev.map(topic => ({ ...topic, is_completed: 0 })));
            if (learningPath.length > 0) {
                setSelectedTopic(learningPath[0]);
            } else {
                setSelectedTopic(null);
            }
        } catch (err) {
            console.error("Error resetting topics:", err);
        }

    }

    return (
        <div className={styles.learningMainContainer}>

            {isContentLoading ? <Loading /> :
                (<>
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
                                {learningPath.map((item, index) => {
                                    // Rule: first topic always clickable
                                    // Or previous topic must be completed
                                    const canNavigate =
                                        index === 0 || learningPath[index - 1].is_completed === 1;

                                    return (
                                        <li
                                            key={item.topic_id}
                                            className={`
                                                ${styles.learningPathItem} 
                                                ${item.is_completed === 1 ? styles.completed : ''} 
                                                ${selectedTopic?.topic_id === item.topic_id ? styles.selectedTopic : ''} 
                                                ${!canNavigate ? styles.locked : ''}
                                                `}
                                            onClick={() => {
                                                if (canNavigate) {
                                                    handleTopicSelect(item);
                                                }
                                            }}
                                            style={{ cursor: canNavigate ? 'pointer' : 'not-allowed' }}
                                        >
                                            {item.is_completed === 1 ? (
                                                <SiTicktick className={styles.icon} />
                                            ) : (
                                                <FaLock className={styles.icon} />
                                            )}
                                            {item.topic_title}
                                        </li>
                                    );
                                })}

                                <button 
                                    className={styles.resetButton}
                                    onClick={handleResetTopics}
                                >
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
                                {/* <button className={styles.readAloudButton}>Read Loud</button> */}
                            </div>

                            <div className={styles.learningContentBody}>
                                <MarkdownRenderer content={topicData?.content.ai_content || "Loading..."} />
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
                            disabled={
                                !selectedTopic ||
                                learningPath.findIndex(t => t.topic_id === selectedTopic.topic_id) ===
                                learningPath.length - 1 ||
                                !selectedTopic.is_completed // ✅ block until completed
                            }                        
                            >
                            Next Topic
                            <GrCaretNext className={styles.navigationIcons} />
                        </button>

                        <button
                            className={styles.topicCompletion}
                            onClick={handleMarkAsCompleted}
                            disabled={!selectedTopic || selectedTopic.is_completed === 1}
                        >
                            Mark as Completed
                            <IoCheckmarkDoneOutline className={styles.navigationIcons} />
                        </button>
                    </div>

                </>
                )}
        </div>
    )
}

export default LearningPage;
