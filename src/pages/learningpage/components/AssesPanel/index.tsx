import LeftContainer from "./leftContainer/index.js";
import RightContainer from  "./rightContainer/index.js"
import styles from "./assessPanel.module.css";


interface Sample {
    input: string,
    output: string,
    explanation : string
}
interface Question {
    title: string,
    difficulty_level : string,
    description: string,
    samples: Sample[]
}


interface AssessPanelProps{
    generatedQuestion : Question,
    languageId : number
}


const AssessPanel : React.FC<AssessPanelProps> = ({generatedQuestion, languageId}) =>{

    return(
        <div className = {styles.assessmentMainContainer}>

            <LeftContainer generatedQuestion={generatedQuestion} />
            <RightContainer languageId={languageId} />

        </div>
    )
}

export default AssessPanel;
