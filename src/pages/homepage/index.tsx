import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Carousel from "../../components/Carousel/Carousel";
import styles from "./Homepage.module.css";

import Title from "../../assets/Title.png";
import DefaultProfile from "../../assets/CodeSensei_Logo.png";
import { VscFoldDown } from "react-icons/vsc";

interface Course {
    course_id: number;
    course_title: string;
    description?: string;
    course_language?: string;
    data?: [
        courses?: Course[]
    ];

}

const Homepage: React.FC = () => {
    const [imageError, setImageError] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const navigate = useNavigate();
        
    
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const profileImageUrl = user?.picture || DefaultProfile;

    // Function to fetch courses from API
    const fetchCourses = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");
            
            const response = await axios.get<Course[]>(`${backendUrl}/api/courses`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });
            
            setCourses(response.data.data.courses);
        } catch (err) {
            console.error('Error fetching courses:', err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else if (err.response?.status === 404) {
                    setError('Courses not found.');
                } else if (err.response && err.response.status >= 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(err.response?.data?.message || err.message || 'Failed to fetch courses');
                }
            } else {
                setError('An unexpected error occurred');
            }
            
            // Fallback to default courses if API fails
            setCourses([
                { course_id: 1, course_title: "Python", description: "Learn Python programming from scratch" },
                { course_id: 2, course_title: "Java", description: "Master Java development" },
                { course_id: 3, course_title: "React JS", description: "Build modern web applications with React" },
                { course_id: 4, course_title: "Javascript", description: "Essential JavaScript for web development" }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownOpen && !target.closest(`.${styles.profileDropdown}`)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleDropDownToggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLearningNavigation = (course_id : number) =>{
        console.log("Navigating to course ID:", course_id);
        navigate(`/learning/${course_id}`);
    }


    return (
        <div className={styles.homeMainContainer}>
            {/* Navbar Section */}
            <div className={styles.homeNavbar}>
                <img src={Title} alt="CodeSensei Logo" className={styles.logo} />

                <div className={styles.profileSection}>
                   <div className={styles.profileDropdown}>
                        <button 
                            className={styles.profileButton}
                            onClick={handleDropDownToggle}
                        >
                             <img
                        src={imageError ? DefaultProfile : profileImageUrl}
                        alt={user?.name || "Profile"}
                        className={styles.profileImage}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onLoad={() => {
                            setImageError(false);
                        }}
                        onError={() => {
                            setImageError(true);
                        }}
                    />
                    </button>
                    
                    {dropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <button 
                                className={styles.dropdownItem}
                                onClick={() => {

                                    setDropdownOpen(false);
                                }}
                            >
                                Profile
                            </button>
                            <button 
                                className={styles.dropdownItem}
                                onClick={() => {
                                    // Handle logout
                                    localStorage.removeItem("user");
                                    localStorage.removeItem("access_token");
                                    setDropdownOpen(false);
                                    navigate('/');
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                   </div>
                </div>
            </div>
    
            
            <Carousel />

            
            <div className={styles.welcomeMessage}>
                <h1>Welcome {user?.name || ""}</h1>
                
                <VscFoldDown className={styles.dropDownIcon} />
            </div>
            
            <div className={styles.languageSection}>
                <p>Your journey to master programming starts here.</p>
                {/* <button 
                    className={styles.refreshButton}
                    onClick={fetchCourses}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Refresh Courses'}
                </button> */}
            </div>

            <div className={styles.courseContainer}>
                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading courses...</p>
                    </div>
                )}
                
                {!isLoading && !error && courses.length === 0 && (
                    <div className={styles.noCoursesContainer}>
                        <p>No courses available at the moment.</p>
                    </div>
                )}

                {!isLoading && courses.map((course: Course) => {
                    return (
                        <div className={styles.courseCard} key={course.course_id}>
                            <h3>{course.course_title}</h3>
                                {course.description && (
                                    <p className={styles.courseDescription}>{course.description}</p>
                                )}
                            <button 
                                className={styles.enrollButton} 
                                onClick={() => handleLearningNavigation(course.course_id)}
                            >
                                Start Learning
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Homepage;
