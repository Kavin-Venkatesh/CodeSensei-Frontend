import { useState } from 'react';
import axios from 'axios';
import OurEditor from "../../../components/editor";
import styles from '../learning.module.css';

interface ExecutionResult {
    output?: string;
    error?: string;
    status: 'success' | 'error';
    executionTime?: number;
    memoryUsage?: number;
}

const EditorComponent = () => {
    const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")');
    const [output, setOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [executionTime, setExecutionTime] = useState<number | null>(null);

    const handleCodeChange = (newCode: string | undefined) => {
        if (newCode !== undefined) {
            setCode(newCode);
        }
    };

    const executeCode = async () => {
        setIsLoading(true);
        setOutput('');
        setError('');
        setExecutionTime(null);

        const startTime = Date.now();

        try {
            // Use the same backend URL pattern as in GoogleLoginButton
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
            const response = await axios.post<ExecutionResult>(`${backendUrl}/api/code/execute`, {
                code: code,
                language: 'python',
                // Optional: add user authentication if needed
                ...(localStorage.getItem("access_token") && {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                })
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem("access_token") && {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    })
                }
            });

            const endTime = Date.now();
            setExecutionTime(endTime - startTime);

            if (response.data.status === 'success') {
                setOutput(response.data.output || '');
            } else {
                setError(response.data.error || 'Unknown error occurred');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else if (err.response?.status === 429) {
                    setError('Too many requests. Please wait before trying again.');
                } else if (err.response && err.response.status >= 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(err.response?.data?.message || err.response?.data?.error || err.message);
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearOutput = () => {
        setOutput('');
        setError('');
        setExecutionTime(null);
    };

    const resetCode = () => {
        setCode('# Write your Python code here\nprint("Hello, World!")');
        clearOutput();
    };

    const language = "python";
    const theme = "vs-dark";

    return (
        <div className={styles.codeEditorContainer}>
            <div className={styles.editorSection}>
                <div className={styles.editorHeader}>
                    <h3>Code Editor</h3>
                    <div className={styles.editorControls}>
                        <button 
                            onClick={executeCode} 
                            disabled={isLoading}
                            className={styles.runButton}
                        >
                            {isLoading ? 'Running...' : 'Run Code'}
                        </button>
                        <button 
                            onClick={clearOutput}
                            className={styles.clearButton}
                        >
                            Clear Output
                        </button>
                        <button 
                            onClick={resetCode}
                            className={styles.resetButton}
                        >
                            Reset Code
                        </button>
                    
                    </div>
                </div>
                <OurEditor 
                    value={code} 
                    onChange={handleCodeChange}
                    language={language}
                    theme={theme}
                />
            </div>
            
            <div className={styles.outputSection}>
                <div className={styles.outputHeader}>
                    <h3>Output</h3>
                    {executionTime !== null && (
                        <span className={styles.executionTime}>
                            Executed in {executionTime}ms
                        </span>
                    )}
                </div>
                <div className={styles.outputContent}>
                    {isLoading && (
                        <div className={styles.loadingIndicator}>
                            <span>Executing code...</span>
                        </div>
                    )}
                    {error && (
                        <div className={styles.errorOutput}>
                            <strong>Error:</strong>
                            <pre>{error}</pre>
                        </div>
                    )}
                    {output && !error && (
                        <div className={styles.successOutput}>
                            <pre>{output}</pre>
                        </div>
                    )}
                    {!output && !error && !isLoading && (
                        <div className={styles.emptyOutput}>
                            Click "Run Code" to see the output here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorComponent;
