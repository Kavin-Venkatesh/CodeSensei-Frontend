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
import {toast , ToastContainer } from 'react-toastify';

export const languageNameToId: Record<string, number> = {
    python: 109,
    javascript: 63,
    java: 91,
    cpp: 54,
    c: 50,
};

interface ExecutionResult {
    input?: string;
    expectedOutput?: string;
    compiledOutput?: string;
    error?: string;
    status: "success" | "error";
    executionTime?: string | number;
    memoryUsage?: string | number;
}

interface TestCase {
    id: number;
    input: string;
    output: string;
    isBackend?: boolean;
}

const RightContainer = () => {
    const { currentQuestion } = useQuestionContext();

    const [showConsole, setShowConsole] = useState(false);
    const [activeTab, setActiveTab] = useState<"input" | "output">("input");

    const [codes, setCodes] = useState<Record<number, string>>({});
    const [language, setLanguage] = useState("python");
    const [loading, setLoading] = useState(false);
    const {id} = useParams();

    const [result, setResult] = useState<ExecutionResult[]>([]);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [selectedTestCase, setSelectedTestCase] = useState<number | null>(null);
    const [selectedResultTestCase, setSelectedResultTestCase] = useState<number>(0);

    // Initialize test cases & code when question changes
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
    }, [currentQuestion]);

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

    const handleRunCode = async () => {
        if (!currentQuestion) return;

        setLoading(true);
        setShowConsole(true);
        setActiveTab("output");
        setResult([]);

        const language_id = languageNameToId[language];
        if (!language_id) {
            console.error("Invalid language selected");
            setLoading(false);
            return;
        }

        const access_token = localStorage.getItem("access_token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        console.log("Fectched backend url && access token", backendUrl, access_token);

        try {
            // Prepare bulk payload
            const payload = {
                code: currentCode,
                language_id,
                testCases: testCases.map((tc) => ({
                    input: tc.input,
                    output: tc.output,
                })),
                question_id: currentQuestion.question_id,
            };

            console.log("payload created", payload);
            // Send all test cases in one request
            const res = await axios.post(`${backendUrl}/api/code/executetestcases`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    ...(access_token && {
                        Authorization: `Bearer ${access_token}`,
                    }),
                },
            });

            console.log(res);

            // Backend returns results array
            if (res.data && res.data.results) {
                const mappedResults: ExecutionResult[] = res.data.results.map((r: any) => ({
                    input: r.input,
                    expectedOutput: r.expectedOutput,
                    compiledOutput: r.actualOutput || "",
                    error: r.error || "",
                    status: r.passed ? "success" : "error",
                    executionTime: r.executionTime,
                    memoryUsage: r.memoryUsage,
                }));

                setResult(mappedResults);
            }
            else {
                console.error("Unexpected backend response", res.data);
            }

        } catch (error) {
            console.error("Error running code:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleSaveCode = async() =>{
        try{
            const backendurl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const access_token = localStorage.getItem("access_token");
            
            const body = {
                code : currentCode,
                language_id : languageNameToId[language],
                question_id : currentQuestion?.question_id,
                user_id : id
            }
            const response = await axios.post(`${backendurl}/api/code/saveCode` , {
                    body
            },{
                headers :{
                    "Content-Type" : 'application/json',
                    ...(access_token &&{
                        Authorization : `Bearer ${access_token}`
                    })
                }
            });

            if(response.status === 200){
                toast.success("Saved your code for future use" , {
                    position :'top-right',
                    autoClose : 2500
                })
            }else{
                toast.error("Error while saving your code" , {
                    position:'top-right',
                    autoClose : 2500
                })
            }
        }catch(err){
            console.log("error" , err);
            toast.error("Error while saving your code" , {
                    position:'top-right',
                    autoClose : 2500
            })
        }
    }

    return (
        <div className={styles.compilerRightContainer}>
            <div className={styles.editorHeader}>
                <select
                    name="language"
                    id="language-select"
                    className={styles.languageSelect}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                </select>

                <button className={styles.runButton} onClick={handleRunCode}>
                    {loading ? "Running" : "Run"}
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
                    language={language}
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
                            {loading === true ? (
                                <>
                                    <OutputLoader />
                                </>
                            ) : (
                                <>
                                    {result.length === 0 &&
                                        <div className={styles.emptyResultMessage}>
                                            <h1> Write some code and excecute <br /> the code to see the output</h1>
                                        </div>}
                                    <div className={styles.testCaseContainer}>
                                        {result.map((res, index) => {
                                            const isPassed = res.status === "success";
                                            return (
                                                <div
                                                    key={index}
                                                    className={`${styles.testCase} ${isPassed ? styles.passedCase : styles.failedCase} ${selectedResultTestCase === index ? styles.activeCase : ""
                                                        }`}
                                                    onClick={() => setSelectedResultTestCase(index)}
                                                >
                                                    <p>
                                                        <span>.</span> Case {index + 1}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {selectedResultTestCase !== null && result[selectedResultTestCase] && (
                                        <div className={styles.inputContainer}>
                                            <div className={styles.excecutionDetailsContainer}>
                                                <h3>result[selectedResultTestCase].status</h3>
                                                <h5>result[selectedResultTestCase].memoryUsage</h5>
                                                <h5>result[selectedResultTestCase].executionTime</h5>
                                            </div>
                                            {result[selectedResultTestCase].input && (
                                                <>
                                                    <label>Input</label>
                                                    <textarea className={styles.testCaseInputContainer} value={result[selectedResultTestCase].input} readOnly />
                                                </>
                                            )}

                                            {result[selectedResultTestCase].expectedOutput && (
                                                <>
                                                    <label>Expected Output</label>
                                                    <textarea className={styles.testCaseInputContainer} value={result[selectedResultTestCase].expectedOutput} readOnly />
                                                </>
                                            )}

                                            <label>Compiled Output</label>
                                            <textarea
                                                className={`${styles.testCaseInputContainer} ${result[selectedResultTestCase].status === "error" ? styles.errorOutput : ""
                                                    }`}
                                                value={
                                                    result[selectedResultTestCase].status === "error"
                                                        ? result[selectedResultTestCase].error || "Unknown Error"
                                                        : `Actual Output:\n${result[selectedResultTestCase].compiledOutput || ""}\n\nExpected:\n${result[selectedResultTestCase].expectedOutput || ""}`
                                                }
                                                readOnly
                                            />

                                        </div>
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
