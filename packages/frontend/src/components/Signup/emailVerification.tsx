import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    fetchAuthenticatedUser,
    sendVerificationCode,
    verifyCode,
    insertUserToEmailVerify,
    updateUserEmail // הוספת הפונקציה לעדכון המייל
} from "../../services/usersService";
import { toast, ToastContainer } from "react-toastify";
import styles from '../../css/Login.module.css';
import { useTranslation } from "react-i18next";

export default function AccountVerification() {
    const { t }: { t: (key: string) => string } = useTranslation();
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSend, setIsSend] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [userId, setUserId] = useState(""); // הוספת state למזהה המשתמש

    const hasInitialized = useRef(false);
    const from = "signup";

    useEffect(() => {
        const initializeUserVerification = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            try {
                const user = await fetchAuthenticatedUser();
                setUserId(user.id); // שמירת מזהה המשתמש
                await insertUserToEmailVerify(user.id, from);
            } catch (error) {
                navigate("/login");
            }
        };

        initializeUserVerification();
    }, [navigate, t]);

    const handleSendCode = async () => {
        const user = await fetchAuthenticatedUser();
        const email = user.email;

        if (!email) {
            toast.error(t('account_verification.sent_token.missimng_email'));
            return;
        }

        setIsSending(true);

        try {
            
            const response = await sendVerificationCode(
                user.id,
                email,
                t('account_verification.sent_token.subject'),
                t('account_verification.sent_token.text'),
                "signup"
            );
            if (response !== false) {
                toast.success(t('account_verification.sent_token.success'));
            }
        } catch (error) {
            toast.error(t('account_verification.sent_token.error'));
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async () => {
        if (isSend) return;

        setIsSend(true);
        setTimeout(() => setIsSend(false), 10000);
        if (!code) {
            toast.error(t('account_verification.verify_code.existing_code'));
            return;
        }
        setIsVerifying(true);
        try {
            const user = await fetchAuthenticatedUser();
            const userId = user.id;
            const email = user.email;

            const response = await verifyCode(userId,email, code);
            if (response) {
                toast.success(t('account_verification.verify_code.success'));
                setTimeout(() => {
                    navigate("/AppHome");
                }, 5000);
            } else {
                toast.error(t('account_verification.verify_code.error'));
            }
        } catch (error) {
            toast.error(t('account_verification.verify_code.error'));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSaveEmail = async () => {
        try {
           
            const success = await updateUserEmail(userId, newEmail);
           
            if (success) {
               // הודעת הצלחה
                toast.success(t('account_verification.changeEmail.success')); 
                setTimeout(() => {
                    setIsEditingEmail(false);
                }, 5000);// הודעת הצלחה
                // חזרה לכרטיס הקודם
                setNewEmail(""); // ניקוי השדה
            } else {
                toast.error(t('account_verification.changeEmail.error')); // הודעת שגיאה
            }
        } catch (error) {
            toast.error(t('account_verification.changeEmail.error')); // הודעת שגיאה במקרה של חריגה
        }
    };

    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`${styles.container} flex flex-col items-center justify-center min-h-[60vh]`}
            dir="rtl"
        >
            {!isEditingEmail && (
                <div className={styles.card} style={{ maxWidth: 400, width: "100%" }}>
                    <h2 className="text-2xl text-green-700 font-bold text-center mb-8">
                        {t('account_verification.title')}
                    </h2>
                    <button
                        onClick={handleSendCode}
                        className="w-full flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition mb-6"
                        disabled={isSending}
                    >
                        {isSending && <span className="inline-block w-4 h-4 border-2 border-white border-t-green-400 rounded-full animate-spin"></span>}
                        {t('account_verification.sent_Email')}
                    </button>

                    <div className="bg-gray-100 rounded-xl p-4 mb-4 shadow-sm w-full">
                        <label className="block font-semibold mb-2 text-gray-800">
                            {t('account_verification.verification_code')}
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={t('account_verification.enter_code')}
                        />
                    </div>

                    <button
                        onClick={handleVerifyCode}
                        className="w-full flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
                        disabled={isVerifying}
                    >
                        <Save size={20} />
                        {isVerifying ? t('account_verification.is_verifying.on_click') : t('account_verification.is_verifying.click')}
                    </button>

                    <a
                        href="#"
                        onClick={() => setIsEditingEmail(true)}
                        className="text-blue-500 underline mt-4"
                    >
                        <br></br>
                            {t("account_verification.changeEmail.to")}
                    </a>
                </div>
            )}

            {isEditingEmail && (
                <div className="absolute bg-white shadow-lg rounded-xl p-4 w-[90%] max-w-md z-20 mt-4">
                    <label className="block font-semibold mb-2 text-gray-800">
                       {t("account_verification.changeEmail.new_email")}
                    </label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t("account_verification.changeEmail.enter_email")}
                    />
                    <button
                        onClick={handleSaveEmail}
                        className="w-full flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition mt-4"
                    >
                        {t("account_verification.changeEmail.change")}
                    </button>
                    <a
                        href="#"
                        onClick={() => setIsEditingEmail(false)}
                        className="text-red-500 underline mt-2 block text-center"
                    >
                        {t("account_verification.changeEmail.back")}
                    </a>
                </div>
            )}
            <ToastContainer position="top-center" autoClose={3000} />
        </motion.div>
    );
}
