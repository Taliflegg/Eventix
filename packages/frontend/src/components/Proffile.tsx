import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, RefreshCw, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";
import { FaCamera, FaLock, FaTrash, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import NotificationPreferencesModal from "../components/NotificationPreferences";
import { useAuth } from '../context/AuthContext';
import { fetchDietaryRestrictions } from "../services/apiServices";
import { deleteAccount, fetchAuthenticatedUser, getUserDietaryRestrictions, removeProfileImage, sendEmail, unlinkGoogleAccount, updateUser } from "../services/usersService";
import DietaryRestrictionsList from "./DietaryRestrictionsList";
import LinkGoogleAccount from "./LinkGoogleAccount";
import ChangePassword from "./Password";
import { log } from "console";
const LockIcon = FaLock as unknown as React.FC;
const TrashIcon = FaTrash as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const LogoutIcon = FiLogOut as unknown as React.FC;
const RefreshCwIcon = RefreshCw as unknown as React.FC;
const UserIcon = FaUserCircle as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const PencilIcon = Pencil as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const XIcon = X as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const SaveIcon = Save as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const LoaderIcon = Loader2 as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const backendUrl = process.env.REACT_APP_BACKEND_URL;
function EditableField({
  label,
  value,
  onChange,
  onValidate,
  isTextarea = false,
  isSelect = false,
  options = [],
  error = "",
  isEmailField = false,
  setIsSaveButtonDisabled,
  email,
  setNewEmail
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onValidate: (val: string) => void;
  isTextarea?: boolean;
  isSelect?: boolean;
  options?: { value: string; label: string }[];
  error?: string;
  showValidationButton?: boolean;
  isEmailField?: boolean;
  setIsSaveButtonDisabled: (value: boolean) => void;
  email?: string;
  setNewEmail?: (val: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const { t }: { t: (key: string) => string } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleInputChange = (val: string) => {
    setTempValue(val);
    onChange(val);

    // רק עבור שדה אימייל נקרא onValidate
    if (label === t('Profile.email')) {
      onValidate(val);
      localStorage.setItem("userEmail", val);
    }
  };

  const handleVerifyEmail = () => {
    onValidate(tempValue); // שמירה על הלוגיקה הקודמת
    navigate('/verify-profile'); // ניווט לדף החדש
  };

  return (
    <div className="bg-gray-100 rounded-xl p-4 mb-4 shadow-sm w-full">
      <label className="block font-semibold mb-2 text-gray-800">{label}</label>

      <AnimatePresence mode="wait" initial={false}>
        {!isEditing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center"
          >
            <span className="text-gray-700">
              {isSelect
                ? options.find((opt) => opt.value === value)?.label || value
                : value || t('profile.Not entered yet')}
            </span>
            <Pencil
              className="text-green-700 hover:text-green-800 cursor-pointer"
              onClick={() => setIsEditing(true)}
              size={18}
            />
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {isTextarea ? (
              <textarea
                value={tempValue}
                onChange={(e) => handleInputChange(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : isSelect ? (
              <select
                value={tempValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            <div className="flex items-center justify-between space-x-2">
              <XIcon
                onClick={() => {
                  if (setNewEmail) {
                    setNewEmail(value); // עדכון האימייל החדש
                  }

                  setTempValue(value); // שמירה על הערך המקורי
                  setIsEditing(false);
                  setIsSaveButtonDisabled(false);
                }}
                className="ml-0 text-red-500 hover:text-red-700 cursor-pointer"
              />

              {label === t('Profile.email') && (
                <button
                  onClick={handleVerifyEmail}
                  className="bg-green-600 hover:bg-green-700 p-2 text-white rounded-md transition mr-0"
                >
                  {t('Profile.verify_email')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function Profile({ embedded = false, onImageChange }: { embedded?: boolean; onImageChange?: (img: string) => void; }) {
  const { t }: { t: (key: string) => string } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("he");
  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showImageSavedModal, setShowImageSavedModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [image, setImage] = useState<string>("https://i.imgur.com/abc123.jpg");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeEmail, setChangeEmail] = useState(localStorage.getItem("changEmail") || "");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const { logout, isAuthenticated } = useAuth();
  interface DietaryOption {
    id: string;
    name: string;
  }
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [googleId, setGoogleId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [password, setPassword] = useState<string | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);



  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setNewEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    const emailChanged = isEmailChanged();
    console.log("isSaveButtonDisabled", isSaveButtonDisabled)
    setIsSaveButtonDisabled(!emailChanged);
    console.log("isSaveButtonDisabled", isSaveButtonDisabled)
  }, [newEmail, email]);

  useEffect(() => {
    if (newEmail) {
      localStorage.setItem("userEmail", newEmail);
    }
  }, [newEmail]);

  useEffect(() => {
    console.log("changeEmail effect triggered", changeEmail);
    setIsSaveButtonDisabled(false)
  }, [changeEmail]);

  const isEmailChanged = () => {
    return newEmail === email || newEmail === changeEmail;
  };

  // הימנע משימוש ישיר ב-setChangeEmail מחוץ לפונקציה

  useEffect(() => {
    const intervalId = setInterval(() => {
      const email = localStorage.getItem("changEmail");
      if (email !== changeEmail) {
        setChangeEmail(email || "");
      }
    }, 1000); // בדוק כל שנייה

    return () => clearInterval(intervalId); // ניקוי ה-interval כשקומפוננטה מתפרקת
  }, [changeEmail]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  function hexToString(hex: string): string {
    if (hex.startsWith('\\x')) {
      hex = hex.slice(2);
    }
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await fetchAuthenticatedUser();
        setUserId(userData.id || null);
        setName(userData.name || "");
        setNewEmail(userData.email || "");
        setEmail(userData.email || "");
        setLanguage(userData.language || "he");
        const formData = new FormData();
        
        let imageUrl = userData.imageUrl || "";
        console.log(imageUrl);

        if (imageUrl && (imageUrl.startsWith('\\x') || /^[0-9a-f]+$/i.test(imageUrl.replace(/\\x/g, '')))) {
          imageUrl = hexToString(imageUrl);
        }
        setImage(imageUrl);
        console.log("imageUrl after conversion: ", imageUrl);


        // שליפת כל האפשרויות מהשרת (כולל ID)
        const allOptions = await fetchDietaryRestrictions(); // מחזיר [{id, name}]
        // setAllDietaryOptions(allOptions);

        // שליפת ההעדפות של המשתמש לפי שם
        const userRestrictions = await getUserDietaryRestrictions(userData.id);
        const matchedIds = allOptions
          .filter(opt => userRestrictions.some(ur => ur.name === opt.name))
          .map(opt => opt.id);
        console.log("matchedIds", matchedIds);


        setDietaryRestrictions(matchedIds); 
        setGoogleId(userData.googleId || null);

        
        setDietaryRestrictions(matchedIds);
        setGoogleId(userData.googleId || null);
        setPassword(userData.passwordHash || null);
      } catch (error) {
        toast.error(t('Profile.Error loading profile'));
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!userId) {
      toast.error(t('Profile.User ID not found. Please try logging in again.'));
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const uploadUrl = `${backendUrl}/api/users/${userId}/uploadImage`;
      await axios.post(uploadUrl, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowImageSavedModal(true);

    } catch (error) {
      console.error("שגיאה בהעלאת תמונה:", error);
      toast.error(t('Profile.upload_error'));
    }
  };

  const handleRemoveImage = async () => {
    if (!userId) {
      toast.error(t('Profile.User ID not found'));
      return;
    }

    try {
      const response = await removeProfileImage(userId);
      if (response.success) {
        setImage("");
        toast.success(t('Profile.delete_image_success'));
      } else {
        toast.error(t('Profile.delete_image_error'));
      }
    } catch (error) {
      console.error("שגיאה בהסרת תמונה:", error);
      toast.error(t('Profile.delete_image_error'));
    }
  };

  if (loading) {
    return <div className="text-center mt-20">{t('Profile.loading')}</div>;
  }

  const handleUnlinkGoogle = async () => {
    try {
      await unlinkGoogleAccount();
      setGoogleId(null);
      toast.success(t('Profile.unlink_google_success'));
    }
    catch (error) {
      console.error("Unlink failed", error);
      toast.error(t('Profile.unlink_google_error'));
    }
  }

  const handleDeleteAccount = async () => {
    if (isDeleteDisabled) return;
    setIsDeleteDisabled(true);
    setTimeout(() => setIsDeleteDisabled(false), 10000);
    const confirmed = window.confirm(t("deleting_account.confirm"));
    if (!confirmed) {
      setIsDeleteDisabled(false);
      return;
    }

    try {
      const user = await fetchAuthenticatedUser();
      const id = user.id;
      const email = user.email;
      const result = await deleteAccount(id);
      if (result) {
        await sendEmail(email, t("deleting_account.email_subject"), t("deleting_account.email_body"));
       toast.success(t("deleting_account.success_message"));
        setTimeout(() => {
          navigate("/");
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error deleting account: ', error);
      if (error && error.message && error.message.includes("The user is in the events table")) {
        toast.error(t("deleting_account.in_event"))

      } else
        toast.error(error.message || t("deleting_account.error_message"));
    }
  };


  const handleSaveAll = async () => {
    console.log("newEmail", newEmail)
    setIsSaving(true);
    try {
      const isNameValid = validateName(name);
      const isEmailValid = validateEmail(email);

      if (!isNameValid) {
        setNameError(t("update_details.name_error"));
      }
      if (!isEmailValid) {
        setEmailError(t("update_details.email_error"));
      }

      if (!isNameValid || !isEmailValid) {
        setIsSaveDisabled(true);
        return;
      }

      let temp = language;
      if (language === "עברית") {
        temp = "he";
      }
      if (language === "English") {
        temp = "en";
      }
      const dietaryRestrictionsIds = dietaryRestrictions.map((restriction) => restriction.toString());
      const user = await fetchAuthenticatedUser();
      const id = user.id;
      const result = await updateUser(id, name, newEmail, temp, dietaryRestrictionsIds);
      if (result) {
        toast.success(t("update_details.success_message"));
        const user = await fetchAuthenticatedUser();
        setEmail(user.email || "")
      }
    } catch (error) {
      if (error && error && error.toString().includes("duplicate key value violates unique constraint \"User_email_key\"")) {
        toast.error(t("update_details.already_email"))
      } else {
        toast.error(t("update_details.error_message"));
      }
    } finally {
      setIsSaving(false);
    }
  };


  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateName = (name: string): boolean => {
    return /^[\u0590-\u05FFa-zA-Z\s]+$/.test(name.trim()) && name.trim().length > 1;
  };

  return (
    <motion.div
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 60, damping: 15 }}
      className="p-6 bg-white min-h-screen text-right font-sans w-full px-4"
      dir="rtl"
    >

      {!embedded && (
        <h2 className="text-2xl text-green-700 font-bold text-center mb-8">
          {t('Profile.profile settings')}
        </h2>
      )}
      <div className="w-full max-w-xl mx-auto">
        <div className="flex justify-center mt-4 mb-8">
          <label className="relative cursor-pointer group w-24 h-24 sm:w-32 sm:h-32">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="rounded-full object-cover w-full h-full border-4 border-green-500 shadow-md transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <UserIcon className="w-full h-full text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
              <span className="text-white text-sm font-semibold">
                {React.createElement(FaCamera as unknown as React.FC)}
              </span>
            </div>
            <button
              onClick={() => {
                Swal.fire({
                  title: t('Profile.Are you sure you want to remove the picture?'),
                  text: t('Profile.You will remove the picture from your account'),
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: t('Profile.Yes, remove it'),
                  cancelButtonText: t('Profile.Cancel'),
                  background: "#fff",
                  color: "#333",
                  backdrop: `rgba(0,0,0,0.6)`,
                }).then((result) => {
                  if (result.isConfirmed) {
                    handleRemoveImage();
                  }
                });
              }}
              className="text-sm text-red-600 hover:underline absolute top-15 right-4"
            >
              <TrashIcon className="inline-block mr-1" />
              {t('Profile.delete_image')}
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
        <EditableField
          label={t('Profile.full_name')}
          value={name}
          onChange={(val) => setName(val)}
          onValidate={(val) => {
            if (!validateName(val)) setNameError(t('Profile.name_error'));
            else setNameError("");
          }}
          error={nameError}
          showValidationButton={false} // לא להציג את כפתור האימות כאן
          setIsSaveButtonDisabled={setIsSaveButtonDisabled} // הוסף שורה זו
        />
        <EditableField
          label={t('Profile.email')}
          value={email}
          onChange={(val) => setNewEmail(val)}
          onValidate={(val) => {
            if (!validateEmail(val)) setEmailError(t('Profile.email_error'));
            else setEmailError("");
          }}
          error={emailError}
          showValidationButton={!isSaveButtonDisabled}
          setIsSaveButtonDisabled={setIsSaveButtonDisabled}
          // הוסף כאן את הפרופס setNewEmail
          setNewEmail={setNewEmail} // הוסף שורה זו
        />


        <DietaryRestrictionsList
          selected={dietaryRestrictions}
          onChange={setDietaryRestrictions}
        />
        <EditableField
          label={t('Profile.preferred_language')}
          value={language}
          onChange={setLanguage}
          isSelect
          onValidate={() => { }}
          options={[
            { value: "he", label: t('Profile.language_options.he') },
            { value: "en", label: t('Profile.language_options.en') },
          ]}
          showValidationButton={false}
          setIsSaveButtonDisabled={setIsSaveButtonDisabled} // הוסף שורה זו // לא להציג את כפתור האימות כאן
        />
        <div className="bg-gray-100 rounded-xl p-4 mb-4 shadow-sm w-full flex justify-between items-center">
          <span className="text-gray-800 font-semibold">{t('Profile.notification_preferences')}</span>
          <PencilIcon
            onClick={() => setShowNotificationModal(true)}
            className="text-green-700 hover:text-green-800 cursor-pointer"
            width={18}
            height={18}
          />
        </div>
        {showNotificationModal && (
          <NotificationPreferencesModal
            userId={userId!}
            onClose={() => setShowNotificationModal(false)}
          />
        )}
        {password && password.trim() !== "" ? (
          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition mx-auto"
            onClick={() => setShowChangePassword(true)}
          >
            <LockIcon />
            {t('Profile.change_password')}
          </button>
        ) : null}
        {showChangePassword && (
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        )}
        <br />
        <div>
          {googleId === null ? (
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
              <div className="bg-white p-4 rounded-xl flex justify-center ">
                <LinkGoogleAccount onLinked={(googleId: string) => setGoogleId(googleId)} />
              </div>
            </GoogleOAuthProvider>
          ) : password && password?.trim() !== "" ? (
            <button onClick={handleUnlinkGoogle}>
              {t('Profile.unlink_google')}
            </button>
          ) : null}
        </div>
        <br />
        <div className="flex justify-center items-center text-center gap-4">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition rounded-xl"
          >
            {t('Profile.delete_account')}
            <TrashIcon />
          </button>
          <button
            onClick={() => {
              Swal.fire({
                title: t('Profile.logout_confirm.title'),
                text: t('Profile.logout_confirm.text'),
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: t('Profile.logout_confirm.confirm'),
                cancelButtonText: t('Profile.logout_confirm.cancel'),
                background: "#fff",
                color: "#333",
                backdrop: `rgba(0,0,0,0.6)`,
              }).then((result) => {
                if (result.isConfirmed) {
                  logout();
                  toast.success(t('Profile.logout_success'));
                  setTimeout(() => navigate("/"), 1000);
                }
              });
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition rounded-xl"
          >
            {t('Profile.logout')}
            <LogoutIcon />
          </button>
        </div>
        <div className="text-center mt-10">
          <button
            onClick={handleSaveAll}
            disabled={isSaveButtonDisabled} // כפתור השמירה יהיה חסום כאשר כפתור האימות פתוח
            className={`${isSaveButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700'} text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition mx-auto`}
          >
            {isSaving ? <LoaderIcon className="animate-spin" /> : <SaveIcon width={20} height={20} />}
          </button>
        </div>
      </div>
      {showImageSavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm text-center">
            <h3 className="text-xl font-bold text-green-700 mb-4">{t('Profile.image_uploaded')}</h3>
            <p className="text-gray-700 mb-6">{t('Profile.image_uploaded_hint')}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <RefreshCwIcon />
            </button>
          </div>
        </div>
      )}
       <ToastContainer />
    </motion.div>
  );
}
export default Profile;