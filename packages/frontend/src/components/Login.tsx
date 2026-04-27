import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../css/Login.module.css";
import ForgotPasswordPage from "./ForgotPasswordPage";
import LoginPage from "./LoginPage";
import { existUserInEmailVerify, fetchAuthenticatedUser, loginUser } from "../services/usersService";
import { useTranslation } from "react-i18next";
import { useAuth } from '../context/AuthContext';

const UserIcon = FaEnvelope as React.FC;
const UserIcon2 = FaLock as React.FC;
const EyeIcon = FaEye as React.FC;
const EyeSlashIcon = FaEyeSlash as React.FC;

function Login() {
  const location = useLocation();
  const from = (location.state?.from?.pathname + location.state?.from?.search) || '/';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);
  const { t }: { t: (key: string) => string } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // const user = await fetchAuthenticatedUser();
      // const loginSuccessful = await loginUser(email, password);
      // if (loginSuccessful) {
      const loginSuccessful = await loginUser(email, password);
      if (loginSuccessful) {
        const user = await fetchAuthenticatedUser();
        const userId = user.id
        const res = await existUserInEmailVerify(userId)
        console.log("res", res)
        if (res === "signup") {
          navigate('/verify')
        }
        else {
          toast.success(t('Login.login_successful'));
          setTimeout(() => {
            const s = localStorage.getItem('eventSharedUrl');
            if (redirectPath) {
              navigate(redirectPath);
            } else
              if (s != null) {
                localStorage.removeItem('eventSharedUrl');
                navigate(s);
              } else {
                (async () => {
                  try {
                    const fetchedUser = await fetchAuthenticatedUser();
                    login(fetchedUser);
                    console.log("Redirecting back to:", from);

                    if (from === '/') {
                      console.log("i am move to AppHome");

                      navigate('/AppHome');
                    } else {
                      navigate(from, { replace: true });
                    }
                  } catch (err) {
                    console.error('Failed to fetch user:', err);
                  }
                })();
              }
          }, 1000);
        }
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(!/\S+@\S+\.\S+/.test(value) ? "*Please enter a valid email address." : "");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('title')}</h1>
        <h2 className={styles.subtitle}>{t('Login.login')}</h2>

        {/* טופס התחברות רגיל */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="email" className={styles.label}>{t('Login.email')}</label>
            <div className={styles.inputWrapper}>
              <span className={styles.icon}>
                <UserIcon />
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={styles.input}
              />
            </div>
            {emailError && <p className={styles.errorText}>{t('Login.email_error')}</p>}
          </div>
          <div>
            <label htmlFor="password" className={styles.label}>{t('Login.password')}</label>
            <div className={styles.inputWrapper} style={{ position: "relative" }}>
              <span className={styles.icon}>
                <UserIcon2 />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={styles.input}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888"
                }}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!email || !password || !!emailError}
            className={`${styles.submitButton} ${(!email || !password || !!emailError) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('Login.login')}
          </button>

          {/* הוספת LoginPage מהקוד השני */}
          <LoginPage />
        </form>

        {/* תיבת איפוס סיסמה מוצגת מתחת לטופס ההתחברות */}
        {showForgotForm && (
          <div className={styles.forgotBox}>
            <ForgotPasswordPage />
            <button
              type="button"
              className={styles.linkButton}
              style={{ marginTop: "1rem" }}
              onClick={() => setShowForgotForm(false)}
            >
              חזור להתחברות
            </button>
          </div>
        )}

        {/* כפתורים נוספים */}
        <p className={styles.linkText}>
          {t('Login.forgot_password')}{" "}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setShowForgotForm(true)}
          >
            {t('Login.change_here')}
          </button>
        </p>

        <p className={styles.linkText}>
          {t('Login.create_account')}{" "}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate("/register")}
          >
            {t('Login.create')}
          </button>
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={3000} aria-label="Toast notifications container" />
    </div>
  );
}

export default Login;