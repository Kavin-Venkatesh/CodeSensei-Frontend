import styles from './login.module.css';
import logo from '../../assets/CodeSensei_Logo.png'

import GoogleLoginButton from '../../components/GoogleLoginButton';
import { toast, ToastContainer } from "react-toastify";


import { useNavigate } from 'react-router-dom';
const Login = () => {

  const navigate = useNavigate();

  const handleGoogleLogin = (user: any, token: string) => {
    toast.success(`Welcome back, ${user.name || "User"}! 🎉`, {
      position: "top-right",
      autoClose: 3000,
    });

    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    navigate(`/home/${user.id}`);
  };

  const handleGoogleError = (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <div className={styles.loginContainer}>
        <div className={styles.loginFormContainer}>
          <img
            src={logo}
            alt="Platform Logo"
            className={styles.imageStyle}
          />

          <h2><span>M</span>aster
            <br />the <span>Art</span> of <span>Coding.</span></h2>

          <GoogleLoginButton onLogin={handleGoogleLogin} className={styles.googleButton} onError={handleGoogleError} />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="dark"
      />
    </>
  )
}

export default Login;