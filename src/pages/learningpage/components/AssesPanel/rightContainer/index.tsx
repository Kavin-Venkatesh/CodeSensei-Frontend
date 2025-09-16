import styles from "../assessPanel.module.css";
import EditorComponent from "../../editorComponent";
import type React from "react";


const RightContainer = ({languageId }: {languageId : number}) => {
    return(
        <div className={styles.assessRightContainer}>
            <EditorComponent languageId={languageId} />
        </div>  
    )
}

export default RightContainer;