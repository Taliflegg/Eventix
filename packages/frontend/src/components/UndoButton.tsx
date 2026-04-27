import { MenuAction, MenuActionData, User } from "@eventix/shared";
import { useTranslation } from "react-i18next";
import { addMenuAction, fetchMenuActionsByUserId } from "../services/menuActionService";
import { useEffect, useState } from "react";
import { fetchAuthenticatedUser } from "../services/usersService";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { useSendSocketMessage } from "./hooks/useSendSocketMessage";

interface UndoButtonProps {
    onUndoAction: () => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({onUndoAction}) => {
    const { t }: { t: (key: string) => string } = useTranslation();
    const [userId, setUserId] = useState<string | null>(null);
    const { eventId } = useParams<{ eventId: string }>();
    const { send: sendSocket } = useSendSocketMessage();
    const [menuActions, setMenuActions] = useState<MenuAction[]>([]);
    useEffect(() => {
        const getUser = async () => {
            const user: User = await fetchAuthenticatedUser();
            setUserId(user.id);
            if (!eventId) {
                toast.error(t('addCategory.alert.unknownEvent'));
                return;
            }
            if (!userId && !user.id) {
                toast.error(t('addCategory.alert.unknownUser'));
                return;
            }
            setMenuActions(await fetchMenuActionsByUserId(eventId, user.id));
        }
        getUser();
    }, [eventId, userId, t]);

    const menuActionData: MenuActionData = {
        itemId: "",
        name: "",
        position: 0,
        isCategory: false
    };

    const menuAction: MenuAction = {
        id: "",
        eventId: eventId || "",
        userId: userId || "",
        actionType: 'undo_action',
        actionData: menuActionData,
        timestamp: new Date()
    };

    const undoAction = async () => {
        try {
            if (!eventId) {
                throw new Error(t('addCategory.alert.unknownEvent'));
            }
            if (!userId) {
                throw new Error(t('addCategory.alert.unknownUser'));
            }
            setMenuActions(await fetchMenuActionsByUserId(eventId, userId));
            if (!menuActions || menuActions.length === 0) {
                toast.error(t("undoAction.alerts.noAction"));
                return;
            }
            const menuActionsForThisUser = menuActions.filter(item => item.userId === userId);
            if (menuActionsForThisUser.length === 0) {
                toast.error(t("undoAction.alerts.noAction"));
                return;
            }
            await addMenuAction(menuAction);
            toast.success(t("undoAction.alerts.success"));
            sendSocket({
                type: 'dish',
                action: 'undo',
                payload: {
                }
            });
            onUndoAction();
        } catch (err) {
            console.error("Error:", err);
            toast.error(`${err instanceof Error ? err.message : t("undoAction.alerts.error")}`);
        }
    }

    return (
        <div>
            <button className="bg-[#28A745] hover:bg-[#218838]  text-white font-bold py-2 px-4 rounded m-4"
                onClick={undoAction}
                disabled={!menuActions || menuActions.length === 0} 
            >
                {t("undoAction.undoMainButton")}
            </button>
        </div>
    );
}
export default UndoButton;
