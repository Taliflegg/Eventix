import React, { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon as EyeRaw, EyeSlashIcon as EyeSlashRaw } from "@heroicons/react/24/outline";

import styles from "../css/Login.module.css";
import { fetchAuthenticatedUser } from '../services/usersService';
import { useTranslation } from 'react-i18next';
import { changePassword } from "../services/usersService";

const EyeIcon = EyeRaw as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const EyeSlashIcon = EyeSlashRaw as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

function ChangePasswordPrompt({ onClose }: { onClose: () => void }) {
    const { i18n } = useTranslation();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // RTL/LTR
    const isRTL = i18n.language === 'he';
    
    const dir = isRTL ? "rtl" : "ltr";
    const { t }: { t: (key: string) => string } = useTranslation();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError(t('error.all_fields_required'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('error.passwords_do_not_match'));
            return;
        }
        if (newPassword.length < 8) {
            setError(t('error.password_too_short'));
            return;
        }
        const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
        if (!passwordPattern.test(newPassword)) {
            setError(t('error.password_strength_weak'));
            return;
        }
        try {
            const user = await fetchAuthenticatedUser();
            const response = await changePassword(user.id, currentPassword, newPassword);
            if (response.success) {
                setSuccess(t('success.password_changed'));
                toast.success(t('success.password_changed'));
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                }, 1800);
            } else {
                // בדוק את סוג השגיאה
                if (response.error === 'PASSWORD_TOO_WEAK') {
                    setError(t('error.password_too_weak'));
                    toast.error(t('error.password_too_weak'));
                }
            }
        } catch (error) {
            setError(t('error.current_password_incorrect'));
            toast.error(t('error.current_password_incorrect'));
        }


        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div
            dir={dir}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
        >
            <div
                className={styles.card}
                style={{
                    textAlign: "center",
                    width: "340px",
                    maxWidth: "90vw",
                    padding: "2.5rem 1.5rem",
                }}
            >
                <h1 className={styles.title} style={{ textAlign: "center" }}>{t('ChangePassword.title')}</h1>
                {error && <p className={styles.errorText} style={{ textAlign: "center" }}>{error}</p>}
                {success && <p className={styles.successText} style={{ textAlign: "center" }}>{success}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <label htmlFor="currentPassword" className={styles.label}
                            style={{ display: "block", textAlign: "center" }}>
                            {t('ChangePassword.currentPassword')}
                        </label>
                        <div className={styles.inputWrapper} style={{ position: "relative" }}>
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                            <span
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={{
                                    position: "absolute",
                                    [isRTL ? "left" : "right"]: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    color: "#888"
                                }}
                            >
                                {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="newPassword" className={styles.label} style={{ display: "block", textAlign: "center" }}>
                            {t('ChangePassword.newPassword')}
                        </label>
                        <div className={styles.inputWrapper} style={{ position: "relative" }}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                            <span
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{
                                    position: "absolute",
                                    [isRTL ? "left" : "right"]: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    color: "#888"
                                }}
                            >
                                {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('signupForm.passwordHint')} {/* הוספת הודעת רמז לסיסמה */}
                        </p>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className={styles.label} style={{ display: "block", textAlign: "center" }}>
                            {t('ChangePassword.confirmPassword')}
                        </label>
                        <div className={styles.inputWrapper} style={{ position: "relative" }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={styles.input}
                                onPaste={e => e.preventDefault()}
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: "absolute",
                                    [isRTL ? "left" : "right"]: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    color: "#888"
                                }}
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!currentPassword || !newPassword || !confirmPassword}
                    >
                        {t('ChangePassword.changeButton')}
                    </button>
                </form>
                <button
                    type="button"
                    className={styles.linkButton}
                    onClick={onClose}
                    style={{ marginTop: "1rem", color: "red", textAlign: "center" }}
                >
                    {t('ChangePassword.closeButton')}
                </button>
            </div>
        </div>
    );
}

export default ChangePasswordPrompt;