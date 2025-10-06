import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import Carousel from "../../components/Carousel/Carousel";
import styles from "./Homepage.module.css";

import Title from "../../assets/Title.png";
import DefaultProfile from "../../assets/CodeSensei_Logo.png";
import { VscFoldDown } from "react-icons/vsc";
import { FaCode } from "react-icons/fa";

interface Course {
    course_id: number,
    course_title: string,
    description?: string,
    course_language?: string
    language_id?: number
    total_topics?: number
    completed_topics?: number
    progress?: number
}

interface CourseApiResponse {
    data: {
        courses: Course[]
    }
    message: string
    status: string
}


const Homepage: React.FC = () => {
    const [imageError, setImageError] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();


    const storedUser = localStorage.getItem("user");
    const {id} =  useParams();
    const user = storedUser ? JSON.parse(storedUser) : null;

    const profileImageUrl = user?.picture || DefaultProfile;

    // Function to fetch courses from API
    const fetchCourses = async () => {
        setIsLoading(true);
        setError('');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const response = await axios.get<CourseApiResponse>(`${backendUrl}/api/courses`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {
                        Authorization: `Bearer ${accessToken}`
                    })
                }
            });

            setCourses(response.data.data.courses);

            toast.success("Course fetched Successfully!" ,{
                position : 'top-right',
                autoClose : 2000
            })

        } catch (err) {
            console.error('Error fetching courses:', err);

            let errorMsg = "Error while fetching courses";

             if (axios.isAxiosError(err)) {
            if (err.response?.status === 401) {
                errorMsg = 'Authentication failed. Please log in again.';
            } else if (err.response?.status === 404) {
                errorMsg = 'Courses not found.';
            } else if (err.response && err.response.status >= 500) {
                errorMsg = 'Server error. Please try again later.';
            } else {
                errorMsg = err.response?.data?.message || err.message || 'Failed to fetch courses';
            }
        }

            setError(errorMsg);

            // ❌ Error Toast
            toast.error(errorMsg, {
                position: "top-right",
                autoClose: 3000,
            });

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

    const handleLearningNavigation = (course_id: number) => {
        navigate(`/learning/${course_id}`);
    }

     const handleCompilerNavigation = () => {
        navigate(`/compiler/${id}`);
    };


    return (
        <div className={styles.homeMainContainer}>
            {/* Navbar Section */}
            <div className={styles.homeNavbar}>
                <div className={styles.pageNavigationContainer}>

                    <img src={Title} alt="CodeSensei Logo" className={styles.logo} />

                    <button className={styles.editorNavigationButton}
                        onClick={handleCompilerNavigation}
                    > 
                        Complier
                        <FaCode />
                    </button>


                </div>

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

                            <div>
                                <div className={styles.progressBarContainer}>
                                    <div
                                        className={styles.progressBar}
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                                <p className={styles.progressText}>{course.progress || 0}% completed</p>

                                <button
                                    className={styles.enrollButton}
                                    onClick={() => handleLearningNavigation(course.course_id)}
                                >
                                    Start Learning
                                </button>


                            </div>


                        </div>
                    );
                })}
            </div>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="dark"
                />
        </div>
    );
};

export default Homepage;
