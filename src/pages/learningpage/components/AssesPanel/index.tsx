import LeftContainer from "./leftContainer/index.js";
import RightContainer from  "./rightContainer/index.js"
import styles from "./assessPanel.module.css";

const AssessPanel = () =>{
    return(
        <div className = {styles.assessmentMainContainer}>

            <LeftContainer />
            <RightContainer />
            
        </div>
    )
}

export default AssessPanel;
