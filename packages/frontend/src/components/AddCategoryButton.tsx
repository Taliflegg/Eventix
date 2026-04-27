import { useEffect, useState } from "react";
import { AssignedMenuItem, MenuAction, MenuActionData, User } from "@eventix/shared";
import { addMenuAction } from "../services/menuActionService";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import i18n from "../i18n/i18n";
import { fetchAuthenticatedUser } from "../services/usersService";
import { toast } from 'react-toastify';
import { useSendSocketMessage } from "./hooks/useSendSocketMessage";
import styles from "../css/AddCategoryButton.module.css";
import NoConnectedUser from "./NoConnectedUser";
import { set } from "react-hook-form";
import Swal from "sweetalert2";

interface AddCategoryButtonProps {
    assignedMenuItemsProps: AssignedMenuItem[] | null;
}
const AddCategoryButton: React.FC<AddCategoryButtonProps> = ({ assignedMenuItemsProps }) => {
    const [isClicked, setIsClicked] = useState(false);
    const [inputValue, setInputValue] = useState<string | null>(null);
    const [incorrectInput, setIncorrectInput] = useState<string | null>(null);
    const { t }: { t: (key: string) => string } = useTranslation();
    const [userId, setUserId] = useState<string | null>(null);
    const [send, setSending] = useState<boolean>(false);
    const { eventId } = useParams<{ eventId: string }>();
    const { send: sendSocket } = useSendSocketMessage();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    useEffect(() => {
        if (incorrectInput) {
            checkAndSendInputValue();
        }
    }, [i18n.language]);
    useEffect(() => {
        const getUser = async () => {
            const user: User = await fetchAuthenticatedUser();
            setUserId(user.id);
        }
        getUser();
    }, [])
    const getLastPosition: () => number = () => {
        let maxPosition: number = 0;
        assignedMenuItemsProps?.forEach((item) => {
            if (item.item.isCategory && item.item.position > maxPosition)
                maxPosition = item.item.position;
        });
        return maxPosition;
    }
    useEffect(() => {
        if (success) {
            Swal.fire({
                title: t('addCategory.alert.success'),
                icon: 'success',
                confirmButtonColor: '#28A745',
                confirmButtonText: t('ShareLocationSecond.OK')
            });
            setSuccess(false);
        }
    }, [success, t]);

    const checkAndSendInputValue = () => {
        if (inputValue === null || inputValue === "")
            setIncorrectInput(t('addCategory.inCorrectInput.nothing'));
        else {
            if (inputValue.length === 1)
                setIncorrectInput(t('addCategory.inCorrectInput.short'));
            else {
                if (!/^[\u0590-\u05FFa-zA-Z]/.test(inputValue))
                    setIncorrectInput(t('addCategory.inCorrectInput.startDigit'))
                else {
                    setIncorrectInput(null);
                    addCategorySend(inputValue);
                }
            }
        }
    }
    const addCategorySend = async (nameCategory: string) => {
        try {
            setSending(true);
            if (!eventId) {
                throw new Error(t('addCategory.alert.unknownEvent'));
            }
            if (!userId) {
                throw new Error(t('addCategory.alert.unknownUser'));
            }
            const menuActionData: MenuActionData = {
                itemId: "",
                name: nameCategory,
                position: getLastPosition() + 1,
                isCategory: true
            };
            const menuAction: MenuAction = {
                id: "",
                eventId: eventId,
                userId: userId,
                actionType: 'add_category',
                actionData: menuActionData,
                timestamp: new Date()
            }
            const menuActionResponse: any = await addMenuAction(menuAction);
            // שידור WebSocket לצד ה־Client!
            sendSocket({
                type: 'category',
                action: 'add',
                payload: {
                    itemId: menuActionResponse.id,
                    name: menuActionResponse.name,
                    position: menuActionResponse.position,
                    tags: menuActionResponse.tags,
                }
            });
            setSuccess(true);
        }
        catch (err) {
            if (err instanceof Error && err.message === "Request failed with status code 401") {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            else {
                toast.error(`${t('addCategory.alert.error')} ${err instanceof Error && err.message}`);
                console.error('Failed to add category:', err);
            }
        }
        finally {
            setIsClicked(false);
            setInputValue(null);
            setSending(false);
        }
    }

    return (
        <>
            {error == "Request failed with status code 401" && <NoConnectedUser></NoConnectedUser>}
            {isClicked ?
                (send ? (<div className="fixed inset-0 flex items-center justify-center">
                    <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-100" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                </div>
                ) :
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className="mb-4">
                                <label className={styles.label}>
                                    {t('addCategory.insertNewCategory')}
                                </label>
                                <input type="text" placeholder={t('addCategory.newCategoryPlaceholder')}
                                    onKeyDown={(event) => { if (event.key === 'Enter') checkAndSendInputValue() }}
                                    className={styles.input}
                                    onChange={
                                        (event) => setInputValue(event.currentTarget.value)
                                    } />
                                <p className={styles.errorText}>{incorrectInput}</p>
                            </div>
                            <div className="inline-flex">
                                <button onClick={checkAndSendInputValue} className={styles.addButton}>
                                    {t('addCategory.addButton')}
                                </button>
                                <button onClick={() => { setIncorrectInput(null); setInputValue(null); setIsClicked(false); }} className="bg-gray-300 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded m-1">
                                    {t("addCategory.cancelButton")}
                                </button>
                            </div>
                        </div>
                    </div>) :
                (<button onClick={() => { setIsClicked(true); }}
                    className="bg-[#28A745] hover:bg-[#218838] text-white font-bold py-2 px-4 rounded m-4">
                    {t('addCategory.mainButtonName')}
                </button>)}

        </>
    );
};

export default AddCategoryButton;