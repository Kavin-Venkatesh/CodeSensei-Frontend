import PracticeContainer from  "./practiceContainer/index.js"
import styles from "./practice.module.css";

const AssessPanel = ({languageId}: {languageId: number}) =>{

    return(
        <div className = {styles.assessmentMainContainer}>
            <PracticeContainer languageId={languageId} />
        </div>
    )
}

export default AssessPanel;
