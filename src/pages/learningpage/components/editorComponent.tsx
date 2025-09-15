import { useState } from 'react';
import axios from 'axios';
import OurEditor from "../../../components/editor";
import { IoMdRefresh } from "react-icons/io";
import styles from '../learning.module.css';

interface ExecutionResult {
    output?: string;
    error?: string;
    status: 'success' | 'error';
    executionTime?: number;
    memoryUsage?: number;
}

const EditorComponent = () => {
    const [code, setCode] = useState('# Write your code here');

    const [activeTab, setActiveTab] = useState<"input" | "output">("input")
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [codeInput, setCodeInput] = useState("");

    const handleCodeChange = (newCode: string | undefined) => {
        if (newCode !== undefined) {
            setCode(newCode);
        }
    };

    const handleResetCode = () => {
        if (code) {
            setCode("");
        }
    }


    const handleRun = async () => {
        setLoading(true);
        setActiveTab("output");
        setResult(null);


        try {
            const token = localStorage.getItem("access_token");
            const body = {
                code,
                language_id: 91,
                stdin: codeInput,
                userToken: token  // pass it here if needed
            };
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const response = await axios.post(`${backendUrl}/api/code/execute`, body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

            console.log(response);

            setResult(
                {
                    output: response.data.output,
                    error: response.data.error,
                    status: response.data.error ? "error" : "success",
                    executionTime: response.data.executionTime,
                    memoryUsage: response.data.memoryUsage
                });

        } catch (err: any) {
            setResult({
                error: err.response?.data?.error || "Something went wrong",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }






    return (
        <div className={styles.codeEditorContainer}>
            <div className={styles.editorSection}>
                <OurEditor
                    value={code}
                    onChange={handleCodeChange}
                    language="java"
                    theme="vs-dark"
                />

                <div className={styles.editorBottom}>
                    <div>
                        <button
                            title='Click to reset the code'
                            className={styles.resetButton}
                            onClick={handleResetCode}
                        >
                            <IoMdRefresh />
                        </button>

                        <button
                            className={`${styles.switchButtons} ${activeTab === 'input' ? styles.active : ""}`}

                            onClick={() => setActiveTab("input")}
                        >
                            Input Console
                        </button>
                        <button
                            onClick={() => setActiveTab("output")}
                            className={`${styles.switchButtons} ${activeTab === 'output' ? styles.active : ""}`}
                        > Output Console</button>
                    </div>
                    <div>
                        <button
                            className={styles.runButton}
                            title='Click to run the code '
                            onClick={handleRun}
                            disabled={loading}
                        >
                            {loading ?
                                <div className={styles.ldsEllipsis}><div></div><div></div><div></div></div>
                                :
                                "Run"}
                        </button>
                    </div>
                </div>


                <div className={styles.InputOutputContainer}>
                    {/* input Container */}

                    {
                        activeTab === 'input' ?
                            (
                                <div className={styles.inputContainer}>
                                    <textarea className={styles.editorInputFeild}
                                        value={codeInput}
                                        onChange={(e) => { setCodeInput(e.target.value) }}
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
                                                    <span className={styles.loadingText}></span>
                                                </div>

                                            </pre>
                                        )}
                                    </div>
                                </div>

                            )

                    }

                </div>
            </div>
        </div>
    );
};

export default EditorComponent;
