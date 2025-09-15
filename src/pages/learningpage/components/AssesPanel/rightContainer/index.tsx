import styles from "../assessPanel.module.css";
import EditorComponent from "../../editorComponent";

const RightContainer = () =>{
    return(
        <div className={styles.assessRightContainer}>
            <EditorComponent />
        </div>
    )
}

export default RightContainer;