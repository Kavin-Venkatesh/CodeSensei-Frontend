
import LeftContainer from './components/leftContainer';
import MiddleContainer from './components/middleContainer';
import RightContainer from './components/rightContainer';

import styles from './compiler.module.css';
import { QuestionProvider } from './contextAPI';

const CompilerPage = () => {

    // const userId = useParams();

    return (
        <QuestionProvider>
            <div className={styles.compilerMainContainer}>
                <LeftContainer />
                <MiddleContainer />
                <RightContainer />
            </div>
        </QuestionProvider>
    )
}

export default CompilerPage;
