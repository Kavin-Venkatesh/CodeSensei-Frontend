import styles from './login.module.css';
import logo from '../../assets/CodeSensei_Logo.png'

import GoogleLoginButton from '../../components/GoogleLoginButton';
import {  useNavigate } from 'react-router-dom';
const Login = () =>{

    const navigate = useNavigate();

    const handleGoogleLogin = (user : any  , token : string) =>{
        localStorage.setItem("access_token" , token);
        localStorage.setItem("user" , JSON.stringify(user));

         navigate(`/home/${user.id}`);
    }
    
    return(
        <>
            <div className={styles.loginContainer}>
                    <div className={styles.loginFormContainer}>
                           <img 
                            src ={logo} 
                            alt="Platform Logo"
                            className={styles.imageStyle}
                            />

                            <h2><span>M</span>aster
                            <br />the <span>Art</span> of <span>Coding.</span></h2>

                            <GoogleLoginButton onLogin={handleGoogleLogin} className={styles.googleButton} />
                    </div>
            </div>
        </>
    )
}

export default Login;