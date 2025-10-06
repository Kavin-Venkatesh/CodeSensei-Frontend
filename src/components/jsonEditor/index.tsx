import React, { useState, useRef } from "react";
import styles from "./jsonEditor.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

interface JsonEditorProps {
  width?: string;
  height?: string;
  placeholder?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
}

const predefinedTemplate = `{
  "prompt": "You are an AI that generates programming questions in JSON format. The output must be a JSON object with the following structure. Replace the placeholders with the actual values. The generated questions must have multi-line inputs that work directly",  
  "instructions": {
 
    "topics": "arrays, loops, sorting",  
    "numberOfQuestions": "20" 
  },
  "outputFormat": {
    "questions": [
      {
        "title": "<question title>",
        "description": "<full problem description>",
        "sampleInput": "<multi-line input with \\n>",
        "sampleOutput": "<expected output>",
        "explanation": "<solution explanation>",
        "testCases": [
          { "input": "<multi-line input>", "output": "<expected output>" }
        ]
      }
    ]
  },
  "example": {
    "prompt": {
      "title": "Sum of Array Elements",
      "topics": "arrays, loops, input-output",
      "difficulty": "easy",
      "numberOfQuestions": "1"
    },
    "questions": [
      {
        "title": "Sum of Array Elements",
        "description": "Given an integer N followed by N integers, sum them and print the result.",
        "sampleInput": "5\\n1 2 3 4 5\\n",
        "sampleOutput": "15",
        "explanation": "Read array size and elements, sum them, and print the result.",
        "testCases": [
          { "input": "5\\n1 2 3 4 5\\n", "output": "15" },
          { "input": "3\\n10 20 30\\n", "output": "60" }
        ]
      }
    ]
  },
  "task": "Generate exactly the number of questions specified under 'numberOfQuestions' with the given topics and with 5 edge test cases for each  questions, in the format above so it can be directly run "   
}`;

export default function JsonEditor({
  width = "760px",
  height = "360px",
  placeholder = "Paste or edit JSON here...",
  initialValue = "",
  onChange,
}: JsonEditorProps) {
  const [text, setText] = useState<string>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    onChange?.(val);
  };

  const formatClick = () => {
    try {
      const parsed = JSON.parse(text);
      const pretty = JSON.stringify(parsed, null, 2);
      setText(pretty);
      onChange?.(pretty);
      setError("Formatted ✓");
      setTimeout(() => setError(null), 1200);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
      setTimeout(() => setError(null), 2000);
    }
    textareaRef.current?.focus();
  };

  const copyClick = async () => {
    try {
      await navigator.clipboard.writeText(predefinedTemplate);
      setError("Template copied ✓");
      setTimeout(() => setError(null), 1200);
    } catch {
      setError("Unable to copy");
      setTimeout(() => setError(null), 1200);
    }
  };

  // Generate line numbers
  const lineCount = (text || "").split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  const handleQuestionCreation = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const access_token = localStorage.getItem("access_token");
      const parsedData = JSON.parse(text)
      const response = await axios.post(`${backendUrl}/api/questions/store-questions`, {
        questions: parsedData.questions
      }, {
        headers: {
          "Content-Type": "application/json",
          ...(access_token && {
            Authorization: `Bearer ${access_token}`
          })
        }
      });

      if (response.data && response.data.success) {
        toast.success("Question created successfully", {
          position: 'top-right',
          autoClose: 2500
      })

      window.location.reload();
      } else {
        toast.error(response.data.message, {
          position: 'top-right',
          autoClose: 2500
        })
      }
    }
    catch (err: any) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 2500
      })
    }
  }
  return (
    <div className={styles.wrapper} style={{ width }}>
      <div className={styles.toolbar}>
        <div className={styles.title}>JSON Editor</div>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={formatClick} title="Format & validate">
            Format
          </button>
          <button className={styles.btn} onClick={copyClick} title="Copy template JSON">
            Copy Template
          </button>
        </div>
      </div>

      <div className={styles.editorRow} style={{ height }}>
        <div className={styles.leftPane}>
          <div className={styles.gutter}>
            {lineNumbers.map((n) => (
              <div key={n} className={styles.lineNumber}>
                {n}
              </div>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={placeholder}
            value={text}
            onChange={handleChange}
            spellCheck={false}
            aria-label="JSON input"
          />
        </div>
      </div>

      <div className={styles.footer}>
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.hint}>
            Paste JSON and click <strong>Format</strong> or <strong>Copy Template</strong>
          </div>
        )}
        <div className={styles.stats}>
          <button className={styles.addQuestionsBtn}
            onClick={handleQuestionCreation}
          >Add Questions</button>
        </div>
      </div>

      <ToastContainer theme="dark" />
    </div>
  );
}
