import React, { useState, useEffect } from "react";
import Carousel from "../../components/Carousel/Carousel";
import styles from "./Homepage.module.css";

import Title from "../../assets/Title.png";
import DefaultProfile from "../../assets/CodeSensei_Logo.png";
import { VscFoldDown } from "react-icons/vsc";

const Homepage: React.FC = () => {
    const [imageError, setImageError] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const profileImageUrl = user?.picture || DefaultProfile;

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
                                    setDropdownOpen(false);
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
                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>
                
                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>

                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>

                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>


                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>

                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>

                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>
                
                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>

                <div className = {styles.courseCard}>
                    <h3 className={styles.cardCourseTitle}>Course Title</h3>
                    <button className={styles.enrollButton}>Start Learning </button>
                </div>

            </div>
        </div>
    );
};

export default Homepage;
