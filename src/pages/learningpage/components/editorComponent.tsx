import { useState } from 'react';
import axios from 'axios';
import OurEditor, { languageIdToMonacoLanguage } from "../../../components/editor";
import { IoMdRefresh } from "react-icons/io";
import styles from '../learning.module.css';
import { OutputLoader } from "../../../components/Loading/index"
import { toast, ToastContainer } from "react-toastify";

interface ExecutionResult {
    output?: string;
    error?: string;
    status: 'success' | 'error';
    executionTime?: number;
    memoryUsage?: number;
}


const EditorComponent = ({ languageId }: { languageId: number }) => {
    const [code, setCode] = useState('');

    const [activeTab, setActiveTab] = useState<"input" | "output">("input")
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [codeInput, setCodeInput] = useState("");
    const monacoLanguage = languageIdToMonacoLanguage[languageId] || 'plaintext';


    const handleCodeChange = (newCode: string | undefined) => {
        if (newCode !== undefined) {
            setCode(newCode);
        }
    };

    const handleResetCode = () => {
        if (code.trim()) {
            setCode("");
            toast.info("Editor reset successfully 🧹", {
                position: "bottom-right",
                autoClose: 1500,
            });
        } else {
            toast.warning("Editor is already empty ⚠️", {
                position: "bottom-right",
                autoClose: 1500,
            });
        }
    };


    const handleRun = async () => {
        setLoading(true);
        setActiveTab("output");
        setResult(null);

        toast.info("Please wait while your code is Executing ⏳", {
            position: "top-right",
            autoClose: 1000,
        });



        try {
            const token = localStorage.getItem("access_token");
            const body = {
                code,
                language_id: languageId,
                stdin: codeInput,
                userToken: token
            };
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const response = await axios.post(`${backendUrl}/api/code/execute`, body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            
            console.log("Execution response:", response.data);
            setResult(
                {
                    output: response.data.output,
                    error: response.data.error,
                    status: response.data.error ? "error" : "success",
                    executionTime: response.data.executionTime,
                    memoryUsage: response.data.memoryUsage
                });

            if (response.data.error) {
                toast.error("Code execution failed", {
                    position: "top-right",
                    autoClose: 2500,
                });
            } else {
                toast.success("Code executed successfully", {
                    position: "top-right",
                    autoClose: 2500,
                });
            }

        } catch (err: any) {
            let message = "Something went wrong. Please try again later.";

            if (axios.isAxiosError(err)) {
                if (!err.response) {
                    message = "Network error — please check your connection 🌐";
                } else if (err.response.status === 401) {
                    message = "Unauthorized — please log in again 🔒";
                } else if (err.response.status >= 500) {
                    message = "Server error — try again later ⚙️";
                } else {
                    message = err.response.data?.error || err.message;
                }
            }

            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
            });

            setResult({
                error: message,
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className={styles.codeEditorContainer}>

            <div className={styles.editorMainContainer}>
                    <OurEditor
                        value={code}
                        onChange={handleCodeChange}
                        language={monacoLanguage || "javascript"}
                        theme="vs-dark"
                    />
            </div>
            <div className={styles.editorSection}>

                <div className={styles.editorButtonContainer}>

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

                        <button
                            title='Click to reset the code'
                            className={styles.resetCodeButton}
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


                <div className={styles.InputOutputContainer}>
                    {/* input Container */}

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
                                                <OutputLoader />
                                            </pre>
                                        )}
                                    </div>
                                </div>

                            )

                    }

                </div>
            </div>
            <ToastContainer theme="dark" />
        </div>
    );
};

export default EditorComponent;
