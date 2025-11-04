import styles from "../practice.module.css";
import EditorComponent from "../../editorComponent";


const PracticeContainer = ({languageId }: {languageId : number}) => {
    return(
        <div className={styles.assessRightContainer}>
            <div className={styles.editorContainer}>
                 <EditorComponent languageId={languageId} />
            </div>
        </div>  
    )
}

export default PracticeContainer;