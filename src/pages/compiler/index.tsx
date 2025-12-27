import { useState, useEffect } from 'react';
import LeftContainer from './components/leftContainer';
import MiddleContainer from './components/middleContainer';
import RightContainer from './components/rightContainer';
import { ToastContainer } from 'react-toastify';

import styles from './compiler.module.css';
import { QuestionProvider } from './contextAPI';

const CompilerPage = () => {
    const [isMobileView, setIsMobileView] = useState(() => window.innerWidth <= 768);

    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        window.addEventListener('resize', checkMobileView);

        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    if (isMobileView) {
        return (
            <div className={styles.mobileMessage}>
                <div>
                    <span className={styles.icon}>📱🚫</span>
                    <h2>Mobile Not Supported</h2>
                    <p>This page is optimized for desktop and tablet devices. For the best coding experience, please switch to a larger screen.</p>
                </div>
            </div>
        );
    }

    return (
        <QuestionProvider>
            <div className={styles.compilerMainContainer}>
                <LeftContainer />
                <MiddleContainer />
                <RightContainer />
                <ToastContainer theme='dark'/>
            </div>
        </QuestionProvider>
    );
};

export default CompilerPage;