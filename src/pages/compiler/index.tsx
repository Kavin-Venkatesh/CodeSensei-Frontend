
import LeftContainer from './components/leftContainer';
import MiddleContainer from './components/middleContainer';
import RightContainer from './components/rightContainer';

import styles from './compiler.module.css';

const CompilerPage = () => {
    
    return(
        <div className={styles.compilerMainContainer}>
            <LeftContainer />
            <MiddleContainer />
            <RightContainer />
        </div>
    )
}

export default CompilerPage;
