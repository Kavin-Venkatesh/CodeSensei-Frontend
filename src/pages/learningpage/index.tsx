import { useEffect, useState } from "react";

import styles from "./learning.module.css";

import { SiTicktick } from "react-icons/si";
import { FaLock } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";

import { IoMenuSharp } from "react-icons/io5";

import EditorComponent from "./components/editorComponent";
import { useParams } from "react-router-dom";
import axios from 'axios';
import AssessPanel from "./components/AssesPanel";


interface Topics{
    topic_id : number,
    topic_title : string,
    topic_description : string,
    is_completed : string
    language_id : number
}

interface TopicsApiResponse {
    success: boolean;
    message: string;
    data: {
        topics: Topics[];
        total: number;
    };
}

const LearningPage = () =>{
    const [isLearningPathVisible, setIsLearningPathVisible] = useState(true);
    const [learningPath, setLearningPath] = useState<Topics[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topics | null>(null);

    const {id} = useParams();

    // const markAsCompleted = (topic_id: number) => {
    //     setLearningPath(prevPath =>
    //         prevPath.map(item =>
    //             item.topic_id === topic_id ? { ...item, completed: true } : item
    //         )
    //     );
    // };

    // const resetLearningPath = () => {
    //     setLearningPath(prevPath =>
    //         prevPath.map(item => ({ ...item, completed: false }))
    //     );
    // };

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

    const toggleLearningPath = () => {
        setIsLearningPathVisible(!isLearningPathVisible);
    };

    const handleTopicSelect = (topic: Topics) => {
        setSelectedTopic(topic);
    };

    return(
        <div className ={styles.learningMainContainer}>
            <div className= {styles.learningNavbar}>
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
                            className={`${styles.learningPathItem} ${item.is_completed ? styles.completed : ''} ${selectedTopic?.topic_id === item.topic_id ? styles.selected : ''}`}
                            onClick={() => handleTopicSelect(item)}
                            style={{ cursor: 'pointer' }}
                        >   
                            {item.is_completed ? <SiTicktick className={styles.icon} /> : <FaLock className={styles.icon} />}
                            {item.topic_title}
                        </li>
                    ))}

                    {/* <button className={styles.resetButton} onClick={resetLearningPath}>
                        Reset Progress
                    </button> */}
                </ul>
            </div>
            
            {/* Content Area */}
            <div className={styles.contentMainContainer}>
                <div className={styles.learningContentHeader}>
                    <FaLightbulb className={styles.explanationIcon} />
                    <h3> {selectedTopic ? (
                        <div>
                            <p>{selectedTopic.topic_description}</p>
                            {/* You can add more dynamic content here based on the topic */}
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
                    {/* <button

                        className={styles.completeButton}
                        onClick={() => markAsCompleted(1)} // Mark "Introduction" as completed
                    >
                        Mark as Completed
                    </button> */}

                </div>



            </div>
            </div>
            
        
                <AssessPanel />
            
            
           {/* <div className={styles.editorSection}> 
                <EditorComponent />
           </div> */}


        </div>
    )
}

export default LearningPage;
