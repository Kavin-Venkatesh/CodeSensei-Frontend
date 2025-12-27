import styles from "./rightContainer.module.css";
import OurEditor from "../../../../components/editor/index.tsx";
import { useState, useEffect } from "react";
import { useQuestionContext } from "../../contextAPI/index.tsx";
import { MdKeyboardDoubleArrowUp, MdKeyboardDoubleArrowDown } from "react-icons/md";
import { GoCheckbox } from "react-icons/go";
import { VscRunCoverage } from "react-icons/vsc";
import axios from "axios";
import { OutputLoader } from "../../../../components/Loading/index.tsx";
import { FaSave } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';

export const languageNameToId: Record<string, number> = {
    python: 109,
    javascript: 63,
    java: 91,
    cpp: 54,
    c: 50,
};

type TestCaseResult = {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    error: string | null;
    status: {
        id: number;
        description: string;
    };
    executionTime: string;
    memoryUsage: number;
};

type ExecutionResult = {
    input: string;
    expectedOutput: string;
    compiledOutput: string;
    error: string | null;
    status: "success" | "error";
    executionTime: string;
    memoryUsage: number;
};


interface TestCase {
    id: number;
    input: string;
    output: string;
    isBackend?: boolean;
}

type Submission = {
    code: string;
    language_id: number;
    language: string;
    question_id?: number;
    user_id?: number;
};

const RightContainer = () => {
    const { currentQuestion , submissions } = useQuestionContext();

    const [showConsole, setShowConsole] = useState(false);
    const [activeTab, setActiveTab] = useState<"input" | "output">("input");

    const [codes, setCodes] = useState<Record<number, string>>({});
    const [selectedLanguage, setSelectedLanguage] = useState("python");
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    const [result, setResult] = useState<ExecutionResult[]>([]);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [selectedTestCase, setSelectedTestCase] = useState<number | null>(null);
    const [selectedResultTestCase, setSelectedResultTestCase] = useState(0);

    const [prevSubmission, setPrevSubmission] = useState<Submission>({
        code: "",
        language_id: 0,
        language: "",
        question_id: 0,
        user_id: 0,
    });

    useEffect(() => {
        if (!currentQuestion) return;

        const backendCases: TestCase[] = currentQuestion.test_cases?.map((tc: any) => ({
            id: tc.test_case_id,
            input: tc.input || "",
            output: tc.output || "",
            isBackend: true,
        })) || [];

        setTestCases(backendCases);
        setSelectedTestCase(backendCases[0]?.id || null);

        if (!(currentQuestion.question_id in codes)) {
            setCodes((prev) => ({
                ...prev,
                [currentQuestion.question_id]: "",
            }));
        }

        // Map saved submission (from context) into editor when available
        if (Array.isArray(submissions) && submissions.length > 0) {
            // try to find a submission for the current question
            const saved = submissions.find((s: Submission | any) => s.question_id === currentQuestion.question_id);
            if (saved) {
                const savedCode = saved.code ?? "";
                // only update if different to avoid overwriting user typing
                setCodes((prev) => {
                    if (prev[currentQuestion.question_id] === savedCode) return prev;
                    return {
                        ...prev,
                        [currentQuestion.question_id]: savedCode,
                    };
                });

                // set language if provided (normalize to lowercase)
                if (saved.language) {
                    const lang = String(saved.language).toLowerCase();
                    // only set if it's a known language key
                    if (lang in languageNameToId) {
                        setSelectedLanguage(lang);
                    }
                }

                // initialize prevSubmission so Save button can detect changes
                setPrevSubmission({
                    code: saved.code ?? "",
                    language_id: saved.language_id ?? 0,
                    language: saved.language ?? "",
                    question_id: saved.question_id ?? 0,
                    user_id: saved.user_id ?? 0,
                });
            }
        }
    }, [currentQuestion, submissions]);

    const toggleOutput = () => setShowConsole(!showConsole);

    const addTestCase = () => {
        const newId = Date.now();
        const newTestCase: TestCase = { id: newId, input: "", output: "" };
        setTestCases((prev) => [...prev, newTestCase]);
        setSelectedTestCase(newId);
    };

    const removeTestCase = (id: number) => {
        setTestCases((prev) => prev.filter((t) => t.id !== id));
        if (selectedTestCase === id && testCases.length > 1) {
            setSelectedTestCase(testCases[0].id);
        }
    };

    const updateTestCase = (id: number, field: keyof TestCase, value: string) => {
        setTestCases((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    };

    const activeTestCase = testCases.find((t) => t.id === selectedTestCase);
    const currentCode = currentQuestion ? codes[currentQuestion.question_id] || "" : "";

    const selectedLanguageID = languageNameToId[selectedLanguage];

    const handleRunCode = async () => {
        if (!currentQuestion) return;

        setLoading(true);
        setShowConsole(true);
        setActiveTab("output");
        setResult([]);
        setSelectedResultTestCase(0); // First test case active by default

        if (!selectedLanguageID) {
            console.error("Invalid language selected");
            setLoading(false);
            return;
        }

        const access_token = localStorage.getItem("access_token");
        const backendurl = import.meta.env.VITE_BACKEND_URL;

        try {
            const payload = {
                code: currentCode,
                language_id: selectedLanguageID,
                testCases: testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output,
                })),
                question_id: currentQuestion.question_id,
            };

            console.log("Payload sent:", payload);

            const res = await axios.post(`${backendurl}/api/code/executetestcases`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    ...(access_token && { Authorization: `Bearer ${access_token}` }),
                },
            });

            if (res.data && Array.isArray(res.data.results)) {
                const mappedResults: ExecutionResult[] = (res.data.results as TestCaseResult[]).map(r => ({
                    input: r.input,
                    expectedOutput: r.expectedOutput,
                    compiledOutput: r.actualOutput || "",
                    error: r.error || null,
                    status: r.passed ? "success" : "error",
                    executionTime: r.executionTime,
                    memoryUsage: r.memoryUsage,
                }));

                console.log("Mapped results:", mappedResults);
                setResult(mappedResults);
            } else {
                console.error("Unexpected backend response:", res.data);
            }
        } catch (err) {
            console.error("Error running code:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleSaveCode = async () => {
        try {
            const backendurl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const access_token = localStorage.getItem("access_token");


            const body: Submission = {
                code: currentCode,
                language_id: selectedLanguageID,
                language: selectedLanguage,
                question_id: currentQuestion?.question_id,
                user_id: Number(id),
            };

            const hasChanged = (Object.keys(body) as (keyof Submission)[]).some(
                key => (body[key] ?? "") !== (prevSubmission[key] ?? "")
            );

            if (!hasChanged) {
                toast.info("No changes to save.", { position: "top-right", autoClose: 2000 });
                return;
            }

            const response = await axios.post(`${backendurl}/api/code/saveSubmission`, body,
                {
                    headers: {
                        "Content-Type": 'application/json',
                        ...(access_token && {
                            Authorization: `Bearer ${access_token}`
                        })
                    }
                });

            const { success, message } = response.data;
            if (success) {
                toast.success(message, { position: 'top-right', autoClose: 2500 });
                setPrevSubmission(body);
            } else {
                toast.error(message || "Something went wrong", { position: 'top-right', autoClose: 2500 });
            }
        } catch (err) {
            console.log("error", err);
            toast.error("Error while saving your code", {
                position: 'top-right',
                autoClose: 2500
            })
        }
    }

        const interpretExecutionResult = (output : any, error : any) => {
        if (error) {
            if (
            error.includes("OSError: [Errno 27] File too large") ||
            error.toLowerCase().includes("timed out") ||
            error.toLowerCase().includes("time limit")
            ) {
            return "Time Limit Exceeded";
            }
            return error;
        }
        return output;
        };


    return (
        <div className={styles.compilerRightContainer}>
            <div className={styles.editorHeader}>
                <select
                    name="language"
                    id="language-select"
                    className={styles.languageSelect}
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                </select>

                <button 
                    className={styles.runButton}
                    onClick={handleRunCode}
                    disabled={loading}
                >
                    {loading ? "..." : "Run"}
                </button>
            </div>

            <div className={`${styles.editorContainer} ${showConsole ? styles.shrinkEditor : ""}`}>
                <OurEditor
                    value={currentCode}
                    onChange={(val) => {
                        if (currentQuestion) {
                            setCodes((prev) => ({
                                ...prev,
                                [currentQuestion.question_id]: val || "",
                            }));
                        }
                    }}
                    language={selectedLanguage}
                    readOnly={false}
                    theme="vs-dark"
                />
            </div>

            <div className={styles.consoleButtonContainer}>
                <button className={styles.consoleButton} onClick={toggleOutput} title="Click here toggle output console">
                    Console {showConsole ? <MdKeyboardDoubleArrowDown /> : <MdKeyboardDoubleArrowUp />}
                </button>

                <button className={styles.saveCodeButton} title="Save Code" onClick={handleSaveCode}>
                    <FaSave />
                    Save
                </button>
            </div>

            {showConsole && (
                <div className={`${styles.bottomContainer} ${showConsole ? styles.bottomOpen : ""}`}>
                    <div className={styles.inputAndOutputNavigation}>
                        <button
                            className={`${styles.testCaseSwitchButton} ${activeTab === "input" ? styles.activeSwitchButton : ""}`}
                            onClick={() => setActiveTab("input")}
                        >
                            <span>
                                <GoCheckbox />
                            </span>{" "}
                            Test Cases
                        </button>
                        <button
                            className={`${styles.testCaseSwitchButton} ${activeTab === "output" ? styles.activeSwitchButton : ""}`}
                            onClick={() => setActiveTab("output")}
                        >
                            <span>
                                <VscRunCoverage />
                            </span>{" "}
                            Test Result
                        </button>
                    </div>

                    {activeTab === "output" ? (
                        <>
                            {loading ? (
                                <OutputLoader />
                            ) : (
                                <>
                                    {result.length === 0 ? (
                                        <div className={styles.emptyResultMessage}>
                                            <h1>Write some code and execute to see the output</h1>
                                        </div>
                                    ) : (
                                        <>                                          
                                            <div className={styles.outputTestCaseContainer}>
                                                {result.map((res, index) => {
                                                    const isPassed = res.status === "success";
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`${styles.testCase} ${isPassed ? styles.passedCase : styles.failedCase
                                                                } ${selectedResultTestCase === index ? styles.activeCase : ""
                                                                }`}
                                                            onClick={() => setSelectedResultTestCase(index)}
                                                        >
                                                            <p>Case {index + 1}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Selected test case details */}
                                            {selectedResultTestCase !== null && result[selectedResultTestCase] && (
                                                <div className={styles.outputContainer}>
                                                    <div className={styles.excecutionDetailsContainer}>
                                                        <h3 className={`${styles.executionStatus} ${result[selectedResultTestCase].status === "success" ? styles.acceptedResult : styles.wrongResult }`}>  {result[selectedResultTestCase].status === "success" ? "Accepted" : "Wrong Answer"  } </h3>
                                                        <h5 className={styles.executionTime}>{result[selectedResultTestCase].executionTime} ms</h5>
                                                    </div>

                                                    <label>Input</label>
                                                    <textarea
                                                        className={styles.testCaseInputContainer}
                                                        value={result[selectedResultTestCase].input}
                                                        readOnly
                                                    />

                                                    <label>Expected Output</label>
                                                    <textarea
                                                        className={styles.testCaseInputContainer}
                                                        value={result[selectedResultTestCase].expectedOutput}
                                                        readOnly
                                                    />

                                                    <label>Compiled Output</label>
                                                    <textarea
                                                        className={styles.testCaseInputContainer}
                                                        value={interpretExecutionResult(
                                                                result?.[selectedResultTestCase]?.compiledOutput,
                                                                result?.[selectedResultTestCase]?.error
                                                                )}
                                                        readOnly
                                                        />

                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                        </>
                    ) : (
                        <>
                            <div className={styles.testCaseContainer}>
                                {testCases.map((testCase, index) => (
                                    <div
                                        key={testCase.id}
                                        className={`${styles.testCase} ${selectedTestCase === testCase.id ? styles.activeCase : ""}`}
                                        onClick={() => setSelectedTestCase(testCase.id)}
                                    >
                                        <p>
                                            <span>.</span> {testCase.isBackend ? `Case ${index + 1}` : `Custom ${index + 1}`}
                                        </p>
                                        {!testCase.isBackend && (
                                            <button
                                                className={styles.testCaseCloseButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeTestCase(testCase.id);
                                                }}
                                            >
                                                x
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button className={styles.addTestCaseContainer} onClick={addTestCase}>
                                    +
                                </button>
                            </div>

                            {activeTestCase && (
                                <div className={styles.inputContainer}>
                                    <label>Input</label>
                                    <textarea
                                        className={styles.testCaseInputContainer}
                                        placeholder="Test Case Input"
                                        value={activeTestCase.input}
                                        onChange={(e) => updateTestCase(activeTestCase.id, "input", e.target.value)}
                                        readOnly={activeTestCase.isBackend}
                                    />

                                    <label>Output</label>
                                    <textarea
                                        className={styles.testCaseInputContainer}
                                        placeholder="Expected Output"
                                        value={activeTestCase.output}
                                        onChange={(e) => updateTestCase(activeTestCase.id, "output", e.target.value)}
                                        readOnly={activeTestCase.isBackend}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <ToastContainer theme="dark" />
        </div>
    );
};

export default RightContainer;
