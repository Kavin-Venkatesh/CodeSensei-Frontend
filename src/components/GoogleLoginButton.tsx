import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";


interface Props {
  onLogin: (user: any, token: string) => void;
  onError? : (error : string) => void;
  className?: string;
}

const GoogleLoginButton: React.FC<Props> = ({ onLogin, className , onError }) => {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await axios.post(
        `${backendUrl}/api/auth/google`,
         {
        token: credentialResponse.credential,
      }
      );

      const { user, accessToken } = res.data;
      // Pass data to login page
      onLogin(user, accessToken);
     
    } catch (error) {
      console.error("Google Login Failed", error);
      onError?.("Google login failed. Please try again.");
    }
  };

  const handleError = () => {
    console.error("<======Google Login Failed=======>");
    onError?.("Google login could not be completed!");
  };

  return (
    <div className={className}>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError}/>
    </div>
  );
};

export default GoogleLoginButton;
