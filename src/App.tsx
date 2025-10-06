import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import HomePage from "./pages/homepage";
import LearningPage from "./pages/learningpage";
import CompilerPage from "./pages/compiler";
import 'react-toastify/dist/ReactToastify.css';


const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route  
          path="/home/:id"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        <Route 
          path="/learning/:id"
          element = {
            <PrivateRoute>
              <LearningPage />
            </PrivateRoute>
          }
        />


        <Route path="/compiler/:id"
          element={
            <PrivateRoute>
              <CompilerPage />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
