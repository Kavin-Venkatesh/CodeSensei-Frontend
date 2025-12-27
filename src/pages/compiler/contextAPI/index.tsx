import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Loading } from "../../../components/Loading";

interface TestCase {
  test_case_id: number;
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

interface Submission {
  question_id: number;
  user_id: number;
  code: string;
  language_id: number;
  language: string;
}

interface QuestionContextType {
  questions: Question[];
  currentQuestion: Question | null;
  setCurrentQuestion: (id: number) => void;
  submitQuestion: (id: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submissions: Submission[];
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestionState] = useState<Question | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { id } = useParams();
  const [loading , setLoading] = useState(true);
  const questionsToastedRef = React.useRef(false);
  const submissionsToastedRef = React.useRef(false);

  // --- Utility: merge questions + submissions to set submitted flags ---
  const applySubmittedFlags = (questions: Question[], submissions: Submission[]) => {
    if (!Array.isArray(questions)) return questions;
    const submittedSet = new Set(submissions.map((s) => Number(s.question_id)));
    return questions.map((q) => ({
      ...q,
      submitted: submittedSet.has(Number(q.question_id)),
    }));
  };

  // --- Fetch submissions first, then questions ---
  useEffect(() => {
    if (!id) {
      console.warn("User ID is not found");
      setLoading(false);
      return;
    }

    let mounted = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const access_token = localStorage.getItem("access_token");

    const fetchSubmissions = async (): Promise<Submission[]> => {
      try {
        const response = await axios.get(`${backendUrl}/api/code/get-submissions/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(access_token && { Authorization: `Bearer ${access_token}` }),
          },
        });

        if (!mounted) return [];

        const fetchedSubmissions: Submission[] = (response.data.submissions || []).map((s: any) => ({
          ...s,
          question_id: Number(s.question_id),
        }));

        setSubmissions(fetchedSubmissions);

        if (!submissionsToastedRef.current) {
          toast.success("Submissions fetched successfully!", { position: "top-right", autoClose: 2000 });
          submissionsToastedRef.current = true;
        }

        return fetchedSubmissions;
      } catch (err) {
        console.error("Error fetching submissions:", err);
        if (!submissionsToastedRef.current) {
          toast.error("Error fetching submissions.", { position: "top-right", autoClose: 2000 });
          submissionsToastedRef.current = true;
        }
        return [];
      }
    };

    const fetchQuestions = async (submissionsList: Submission[]) => {
      try {
        const response = await axios.get(`${backendUrl}/api/questions/fetch-questions/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(access_token && { Authorization: `Bearer ${access_token}` }),
          },
        });

        if (!mounted) return;

        const fetchedQuestions: Question[] = (response.data.data.questions || []).map((q: any) => ({
          ...q,
          question_id: Number(q.question_id),
        }));

        const flagged = applySubmittedFlags(fetchedQuestions, submissionsList);
        setQuestions(flagged);

        if (flagged.length > 0 && !currentQuestion) {
          setCurrentQuestionState(flagged[0]);
        }

        if (!questionsToastedRef.current) {
          toast.success("Questions fetched successfully!", { position: "top-right", autoClose: 2000 });
          questionsToastedRef.current = true;
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        if (!questionsToastedRef.current) {
          toast.error("Error fetching questions.", { position: "top-right", autoClose: 2000 });
          questionsToastedRef.current = true;
        }
      }
    };

    const init = async () => {
      const subs = await fetchSubmissions();
      await fetchQuestions(subs);
      setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [id]);


  useEffect(() => {
    if (questions.length > 0 && submissions.length > 0) {
      setQuestions((prev) => applySubmittedFlags(prev, submissions));
    }
  }, [submissions]);

  // --- Context utility functions ---
  const setCurrentQuestion = (question_id: number) => {
    const selectedQuestion = questions.find((q) => q.question_id === question_id) || null;
    setCurrentQuestionState(selectedQuestion);
  };

  const submitQuestion = (question_id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.question_id === question_id ? { ...q, submitted: true } : q))
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

  if( loading ){
    return <Loading />;
  }
  
  return (
    <QuestionContext.Provider
      value={{
        questions,
        currentQuestion,
        setCurrentQuestion,
        submitQuestion,
        nextQuestion,
        previousQuestion,
        submissions,
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
