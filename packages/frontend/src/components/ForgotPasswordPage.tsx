import React, { useState } from "react";
import { apiService } from "../services/apiServices";
import styles from "../css/Login.module.css";
import { FaEnvelope } from "react-icons/fa";

const UserIcon = FaEnvelope as React.FC;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiService.post('/auth/password/forgot-password', { email });
      setSent(true);
    } catch {
      setError("שליחת המייל נכשלה. נסה שוב.");
    }
  };

  return (
      <div className={styles.card}>
        <h2 className={styles.title}>שחזור סיסמה</h2>
        {sent ? (
          <div className="text-green-600 text-center font-semibold">
            נשלח מייל לאיפוס סיסמה (אם קיים משתמש כזה).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label className={styles.label}>אימייל:</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>
                  <UserIcon />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={styles.input}
                  placeholder="הקלד/י את כתובת האימייל שלך"
                />
              </div>
            </div>
            {error && <div className={styles.errorText}>{error}</div>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!email}
            >
              שלח קישור לאיפוס סיסמה
            </button>
          </form>
        )}
      </div>
  );
};

export default ForgotPasswordPage;