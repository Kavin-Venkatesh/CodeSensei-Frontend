
import LeftContainer from './components/leftContainer';
import MiddleContainer from './components/middleContainer';
import RightContainer from './components/rightContainer';
import { ToastContainer } from 'react-toastify';

import styles from './compiler.module.css';
import { QuestionProvider } from './contextAPI';

const CompilerPage = () => {
    return (
        <QuestionProvider>
            <div className={styles.compilerMainContainer}>
                <LeftContainer />
                <MiddleContainer />
                <RightContainer />

                <ToastContainer theme='dark'/>
            </div>
        </QuestionProvider>
    )
}

export default CompilerPage;
