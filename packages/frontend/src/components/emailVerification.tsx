import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchAuthenticatedUser,
    sendVerificationCode,
    verifyCode,
    insertUserToEmailVerify
} from "../services/usersService";
import { toast, ToastContainer } from "react-toastify";
import styles from '../css/Login.module.css';
import { useTranslation } from "react-i18next";

export default function AccountVerificationPofile() {
    
    const navigate = useNavigate();
    const { from } = useParams();
    const [code, setCode] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSend, setIsSend] = useState(false);
    const { t }: { t: (key: string) => string } = useTranslation();

    const handleSendCode = async () => {
        const email = localStorage.getItem("userEmail");
   
        if (!email) {
            toast.error(t('account_verification.sent_token.missimng_email'));
            return;
        }

        if (isSending) return; 
        setIsSending(true);

        try {
            const user = await fetchAuthenticatedUser();
            const userId = user.id;
            await insertUserToEmailVerify(userId, 'profile');
        
            const response = await sendVerificationCode(
                userId,
                email,
                t('account_verification.sent_token.subject'),
                t('account_verification.sent_token.text'),
                "profile"
            );

            if (response !== false) {
                toast.success(t('account_verification.sent_token.success'));
            }
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(t('account_verification.sent_token.error'));
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async () => {
        if (isSend || isVerifying) return;

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
            const email = localStorage.getItem("userEmail");
        
            if (email) {
                const response = await verifyCode(userId, email, code);
                if (response) {
                    localStorage.setItem("changEmail", email);
                    toast.success(t('account_verification.verify_code.success2'));
                    setCode("");
                    
                } else {
                    toast.error(t('account_verification.verify_code.error'));
                }
            }
        } catch (error: any) {
            toast.error(t('account_verification.verify_code.error'));
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`${styles.container} flex flex-col items-center justify-center min-h-[60vh]`}
            dir="rtl"
        >
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
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </motion.div>
    );
}