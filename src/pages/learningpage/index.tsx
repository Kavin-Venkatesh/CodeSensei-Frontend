import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

import styles from "./learning.module.css";

import { SiTicktick } from "react-icons/si";
import { FaLock } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { IoMenuSharp } from "react-icons/io5";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { GrCaretPrevious } from "react-icons/gr";
import { GrCaretNext } from "react-icons/gr";
import { toast, ToastContainer } from "react-toastify";


import AssessPanel from "./components/AssesPanel";
import { Loading } from "../../components/Loading/index.tsx";
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
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [topicData, setTopicData] = useState<TopicContentResponse["data"]["content"] | null>(null);

    const [question, setQuestion] = useState<Question | null>(null);

    const { id } = useParams();

const fetchTopics = async () => {
    try {
        console.log("Fetching topics for learning path...");
        const courseId = id;
        console.log("Course ID:", courseId);

        if (!courseId) {
            console.error("Course ID is missing. Cannot fetch topics.");
            return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const accessToken = localStorage.getItem("access_token");

        // Try to get user id from localStorage (set on login). Backend also accepts req.user if auth middleware is used.
        const storedUser = localStorage.getItem("user");
        const userId = storedUser ? Number(JSON.parse(storedUser).id) : undefined;

        if (!userId) {
            console.warn("User ID not found in localStorage. Backend requires user_id query param unless auth middleware supplies req.user.");
            // You can still call the endpoint without user_id if your server uses req.user from token,
            // otherwise consider redirecting to login or setting user_id on login.
        }
        
        const response = await axios.get<TopicsApiResponse>(`${backendUrl}/api/topics/course/${courseId}`, {
            params: {
                ...(userId && { user_id: userId }),
            },
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken && { Authorization: `Bearer ${accessToken}` })
            }
        });

        const topics = response.data.data.topics || [];
        console.log("Raw topics data:", topics);
        // Ensure is_completed is numeric 0 | 1
        const normalizedTopics = topics.map(t => ({
            ...t,
            is_completed: Number(t.is_completed) === 1 ? 1 : 0,
            topic_id: Number(t.topic_id),
            language_id: Number(t.language_id),
        }));

        console.log("Fetched topics:", normalizedTopics);
        setLearningPath(normalizedTopics);

        const firstIncomplete = normalizedTopics.find(topic => topic.is_completed !== 1);
        const topicToSelect = firstIncomplete || normalizedTopics[0];
        if (topicToSelect) {
            setSelectedTopic(topicToSelect);
        }

    } catch (err: any) {
        console.error("Error fetching topics:", err);
        // show friendly toast
        toast.error(err?.response?.data?.message || "Failed to fetch topics", { autoClose: 3000 });
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
        if (!selectedTopic) {
            toast.warn("⚠️ No topic selected", { autoClose: 2000 });
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const response = await axios.put(
                `${backendUrl}/api/topics/mark-completed/${selectedTopic.topic_id}`,
                { is_completed: 1 },
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                    },
                }
            );

            if (response.status === 200 && response.data.success) {
                setLearningPath(prev =>
                    prev.map(topic =>
                        topic.topic_id === selectedTopic.topic_id
                            ? { ...topic, is_completed: 1 }
                            : topic
                    )
                );

                const currentIndex = learningPath.findIndex(
                    topic => topic.topic_id === selectedTopic.topic_id
                );
                if (currentIndex < learningPath.length - 1) {
                    setSelectedTopic(learningPath[currentIndex + 1]);
                }

                toast.success("✅ Topic marked as completed!", { autoClose: 2000 });
            } else {
                toast.warn(response.data.message || "⚠️ Could not mark as completed", { autoClose: 2000 });
            }
        } catch (err: any) {
            console.error("Error marking topic as completed:", err);

            let errorMsg = "💥 Failed to mark topic as completed";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }

            toast.error(errorMsg, { autoClose: 3000 });
        }
    };
    const handleResetTopics = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const courseId = id;

            if (!courseId) {
                toast.error("⚠️ Course ID missing. Cannot reset topics.", { autoClose: 2000 });
                return;
            }

            const response = await axios.put(
                `${backendUrl}/api/topics/reset-topics/${id}`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                    },
                }
            );

            if (response.status === 200 && response.data.success) {
                setLearningPath(prev => prev.map(topic => ({ ...topic, is_completed: 0 })));
                if (learningPath.length > 0) setSelectedTopic(learningPath[0]);
                else setSelectedTopic(null);

                toast.success("🔄 Course progress reset successfully!", { autoClose: 2000 });
            } else {
                toast.warn(response.data.message || "⚠️ Could not reset course progress", { autoClose: 2000 });
            }
        } catch (err: any) {
            console.error("Error resetting topics:", err);

            let errorMsg = "💥 Failed to reset topics";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }

            toast.error(errorMsg, { autoClose: 3000 });
        }
    };

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
                                <MarkdownRenderer content={topicData?.content.ai_content || "Please Wait While Fetching Contents"} />
                            </div>
                        </div>
                    </div>


                    <div className={styles.questionGenerationContainer}>
                        <p>Practice Syntax Here!</p>
                    </div>


                    {question === null ? "" : (
                        <AssessPanel  languageId={selectedTopic?.language_id || 0} />
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
            <ToastContainer theme="dark" />
        </div>
    )
}

export default LearningPage;
