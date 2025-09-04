

import React from "react";


import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface Props {
  onLogin: (user: any, token: string) => void;
  className?: string;
}

const GoogleLoginButton: React.FC<Props> = ({ onLogin, className }) => {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await axios.post(`${backendUrl}/api/auth/google`, {
        token: credentialResponse.credential,
      });

      const { user, accessToken } = res.data;

      // Pass data to parent component
      console.log(user, accessToken);
      onLogin(user, accessToken);
    } catch (error) {
      console.error("Google Login Failed", error);
    }
  };

  const handleError = () => {
    console.error("<======Google Login Failed=======>");
  };

  return (
    <div className={className}>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GoogleLoginButton;
