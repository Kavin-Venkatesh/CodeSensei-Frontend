import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import Carousel from "../../components/Carousel/Carousel";
import styles from "./homepage.module.css";

import Title from "../../assets/Title.png";
import { VscFoldDown } from "react-icons/vsc";
import { FaCode } from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const [istoggleMenu , setToggleMenu] = useState(false);

    const storedUser = localStorage.getItem("user");
    const {id} =  useParams();
    const user = storedUser ? JSON.parse(storedUser) : null;


    // Function to fetch courses from API
    const fetchCourses = async () => {
        setIsLoading(true);
        setError('');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const accessToken = localStorage.getItem("access_token");

            const response = await axios.get<CourseApiResponse>(`${backendUrl}/api/courses/${id}`, {
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

    const handleLearningNavigation = (course_id: number) => {
        navigate(`/learning/${course_id}`);
    }

     const handleCompilerNavigation = () => {
        navigate(`/compiler/${id}`);
    };

    const handleMenuToggle = () => {
        setToggleMenu(!istoggleMenu);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className={styles.homeMainContainer}>

            <div className={styles.homeNavbar}>
                <div className={styles.pageNavigationContainer}>
                    
                       <button
                        className={styles.menuButton}
                        onClick={handleMenuToggle}
                        >
                        <FaBars />
                    </button>

                    <img src={Title} alt="CodeSensei Logo" className={styles.logo} />                 
    
                </div>



                <div className={`${styles.mobileMenu} ${styles.menubarButtonContainer} ${istoggleMenu ? styles.mobileMenuOpen : ''}`}>
                        <button 
                            className={styles.editorNavigationButton}
                            onClick={handleCompilerNavigation}
                            > 
                            Compiler
                            <FaCode />
                        </button>


                        <button
                            className={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            Logout
                            <MdLogout />
                        </button>
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
