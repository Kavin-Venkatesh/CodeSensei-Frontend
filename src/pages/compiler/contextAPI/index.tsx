import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface TestCase {
  test_case_id : number;
  input: string;
  output: string;
}

interface Question {
  question_id: number;
  question_title: string;
  question_description: string;
  sample_input: string;
  sample_output: string;
  explanation: string;
  test_cases: TestCase[];
  submitted?: boolean;
}

interface QuestionContextType {
  questions: Question[];
  currentQuestion: Question | null;
  setCurrentQuestion: (id: number) => void;
  submitQuestion: (id: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestionState] = useState<Question | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const handlefetchQuestion = async () => {
      try {
        if (!id) {
          console.log("UserId is not found", id);
          return;
        }

        console.log("Receiving Questions");
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const access_token = localStorage.getItem("access_token");

        const response = await axios.get(`${backendUrl}/api/questions/fetch-questions/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(access_token && { Authorization: `Bearer ${access_token}` })
          }
        });

        const fetchedQuestions: Question[] = response.data.data.questions || [];
        setQuestions(fetchedQuestions);

        if (fetchedQuestions.length > 0 && !currentQuestion)
           setCurrentQuestionState(fetchedQuestions[0]);
      } catch (err) {
        console.log(err);
      }
    };

    handlefetchQuestion();
  }, [id]);

  const setCurrentQuestion = (question_id: number) => {
    const selectedQuestion = questions.find((q) => q.question_id === question_id) || null;
    setCurrentQuestionState(selectedQuestion);
  };

  const submitQuestion = (question_id: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === question_id ? { ...q, submitted: true } : q
      )
    );
  };

  const nextQuestion = () => {
    if (!currentQuestion) return;
    const idx = questions.findIndex((q) => q.question_id === currentQuestion.question_id);
    if (idx < questions.length - 1) setCurrentQuestionState(questions[idx + 1]);
  };

  const previousQuestion = () => {
    if (!currentQuestion) return;
    const idx = questions.findIndex((q) => q.question_id === currentQuestion.question_id);
    if (idx > 0) setCurrentQuestionState(questions[idx - 1]);
  };

  return (
    <QuestionContext.Provider
      value={{
        questions,
        currentQuestion,
        setCurrentQuestion,
        submitQuestion,
        nextQuestion,
        previousQuestion,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestionContext = () => {
  const ctx = useContext(QuestionContext);
  if (!ctx) throw new Error("useQuestionContext must be used within QuestionProvider");
  return ctx;
};
