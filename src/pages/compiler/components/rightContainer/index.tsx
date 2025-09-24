import styles from "./rightContainer.module.css";
import OurEditor from "../../../../components/editor/index.tsx";
import { use, useState } from "react";

import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { RiInputCursorMove } from "react-icons/ri";
import { VscOutput } from "react-icons/vsc";

interface ExecutionResult {
    output?: string;
    error?: string;
    status: 'success' | 'error';
    executionTime?: number;
    memoryUsage?: number;
}


const RightContainer = () => {

    const [showConsole, setShowConsole] = useState(true);
    const [activeTab , setActiveTab] = useState<'input' | 'output'>("input");
    const [codeInput , setCodeInput] = useState("");
    const [result , setResult] = useState<ExecutionResult | null>(null);



    const toggleOutput = () => {
        setShowConsole(!showConsole);
    };

    
    return(
        <div className={styles.compilerRightContainer}>

            <div className={styles.editorHeader}>

                <select name="language" id="language-select" className={styles.languageSelect}>
                    <option value="python" selected>Choose language</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="csharp">C#</option>
                </select>


                <button className={styles.runButton}>Run</button>
                
            </div>

            <div className={`${styles.editorContainer} ${showConsole ? styles.shrinkEditor : ""}`}>
            <OurEditor
                value = "# Write your code here"
                language = "python"
                readOnly = {false}
                theme = "vs-dark"
            />

            </div>

            <div className={styles.outputContainer}>
                <button
                 className={styles.consoleButton}
                 onClick={toggleOutput}> 
                 Console {showConsole ?
                  <MdKeyboardDoubleArrowDown /> :  <MdKeyboardDoubleArrowUp />
                  }
                </button>
            </div>

            {showConsole && (
            <div
                className={`${styles.bottomContainer} ${
                    showConsole ? styles.bottomOpen : ""
                }`}
                >
                <div className={styles.switchButtonsContainer}>
                    <button  className={`${styles.switchButtons} ${activeTab === 'input' ? styles.active : ""}`} onClick={ ()=> setActiveTab("input")}>Input Console <RiInputCursorMove /></button>
                    <button className= {`${styles.switchButtons} ${activeTab === 'output' ? styles.active : ""}`}onClick={()=>setActiveTab("output")}>Output Console <VscOutput />
                            </button>
                </div>
                {
                        activeTab === 'input' ?
                            (
                                <div className={styles.inputContainer}>
                                    <textarea className={styles.editorInputFeild}
                                        value={codeInput}
                                        onChange={(e) => { setCodeInput(e.target.value) }}
                                        placeholder='Enter your input here'
                                    />
                                </div>
                            )
                            :
                            (
                                <div className={styles.outputContainer}>
                                    <div className={styles.outputContent}>
                                        {result ? (
                                            <>
                                                {result.status === "success" && (
                                                    <>
                                                        {result.output && (
                                                            <pre className={styles.consoleSuccess}>{result.output}</pre>
                                                        )}
                                                        <div className={styles.metaInfo}>
                                                            <span>⏱ {result.executionTime} ms</span>
                                                            <span>💾 {result.memoryUsage} KB</span>
                                                        </div>
                                                    </>
                                                )}
                                                {result.status === "error" && (
                                                    <pre className={styles.consoleError}>{result.error}</pre>
                                                )}
                                            </>
                                        ) : (
                                            <pre className={styles.consolePlaceholder}>


                                                <div aria-label="Loading..." role="status" className={styles.loader}>
                                                    <svg className={styles.spinnericon} viewBox="0 0 256 256">
                                                        <line x1="128" y1="32" x2="128" y2="64" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="224" y1="128" x2="192" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="128" y1="224" x2="128" y2="192" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="32" y1="128" x2="64" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                        <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                                                    </svg>
                                                    <span className={styles.loadingText}>
                                                        Please be patient
                                                    </span>
                                                </div>

                                            </pre>
                                        )}
                                    </div>
                                </div>

                            )

                    }
            </div>
            )}

        </div>
    )
};

export default RightContainer;