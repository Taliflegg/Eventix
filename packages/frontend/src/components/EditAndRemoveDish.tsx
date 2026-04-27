import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { addMenuAction } from "../services/menuActionService";
import { MenuActionType } from "@eventix/shared";
import { useSendSocketMessage } from "./hooks/useSendSocketMessage";
import { UseHandleMenuActionFunction } from "../services/apiServices";

interface Props {
    eventId: string;
    userId: string;
    t: (key: string) => string;
}

export const useDishActions = ({ eventId, userId, t }: Props) => {
    const MySwal = withReactContent(Swal);
    const myAction: MenuActionType = "update_dish";
    const myActionr: MenuActionType = "remove_dish";
    const { send: sendSocketMessage } = useSendSocketMessage(); //  הפעלת השידור

    const handleEditDish = async (dish: any) => {
        const translatedHtml = `
      <input id="dish-name" class="swal2-input" placeholder="${t("EditDish.name")}" value="${dish.name}" />
      <input id="dish-notes" class="swal2-input" placeholder="${t("EditDish.notes")}" value="${dish.notes || ""}" />
      <label style="display:block; margin-top:10px; font-weight:bold;">${t("EditDish.tags")}:</label>
      <div id="tags-container" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:5px;">
        ${["Gluten", "peanuts", "soya", "milk", "eggs", "kosher", "vegan"]
                .map(
                    (tag) => `
          <label style="display:flex;align-items:center;gap:5px;">
            <input type="checkbox" name="tag" value="${tag}" ${dish.tags?.includes(tag) ? "checked" : ""} />
            ${t(`tags.${tag}`)}
          </label>`
                )
                .join("")}
      </div>
    `;
        const { value: formValues, isConfirmed } = await Swal.fire({
            title: t("EditDish.title"),
            html: translatedHtml,
            confirmButtonText: t("EditDish.save"),
            cancelButtonText: t("EditDish.cancel"),
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonColor: "#4CAF50",
            preConfirm: () => {
                const name = (document.getElementById("dish-name") as HTMLInputElement).value;
                const notes = (document.getElementById("dish-notes") as HTMLInputElement).value;
                const tagInputs = document.querySelectorAll<HTMLInputElement>('input[name="tag"]:checked');
                const tags = Array.from(tagInputs).map((el) => el.value);
                if (!name) {
                    Swal.showValidationMessage(t("EditDish.emptyname"));
                    return;
                }
                return { name, notes, tags };
            },
        });
        if (!isConfirmed || !formValues) return;
        const updatedRow = {
            id: "",
            eventId,
            userId: userId,
            actionType: myAction,
            actionData: {
                itemId: dish.id,
                name: formValues.name,
                notes: formValues.notes,
                tags: formValues.tags,
                assignedTo: userId,
                categoryId: dish.categoryId,
                position: dish.position,
                newPosition: dish.newPosition,
                isCategory: false,
            },
            timestamp: new Date(),
        };
        try {
            const result = await UseHandleMenuActionFunction(updatedRow,userId);
            if (result) {
                Swal.fire(t("EditDish.succeed"), t("EditDish.succeedmassage"), "success");
                //  שידור WebSocket לצד ה־Client
                sendSocketMessage({
                    type: dish.isCategory ? 'category' : 'dish',
                    action: 'update',
                    payload: {
                        itemId: dish.id,
                        name:  updatedRow.actionData.name,
                        notes: updatedRow.actionData.notes,
                        tags: updatedRow.actionData.tags,
                        categoryId: dish.categoryId,
                        position: dish.position
                    }
                });
            }
        } catch (error) {
            console.error("שגיאה בשמירה:", error);
            Swal.fire(t("EditDish.error"), t("EditDish.errormassage"), "error");
        }
    };
    const handleDeleteDish = async (dish: any) => {
        const { isConfirmed } = await Swal.fire({
            title: t("RemoveDish.title"),
            text: t("RemoveDish.text"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#28A745",
            cancelButtonColor: "",
            confirmButtonText: t("RemoveDish.delete"),
            cancelButtonText: t("RemoveDish.cancel"),
        });
        if (!isConfirmed) return;
        const Removedish = {
            id: dish.id,
            eventId: eventId,
            userId: userId,
            actionType: myActionr,
            actionData: {
                itemId: dish.id,
                name: dish.name,
                notes: dish.notes,
                tags: dish.tags,
                assignedTo: userId,
                categoryId: dish.categoryId,
                position: dish.position,
                newPosition: dish.newPosition,
                isCategory: false,
            },
            timestamp: new Date(),
        };
        try {
            const result = await UseHandleMenuActionFunction(Removedish,userId);
            if (result) {
                Swal.fire(t("RemoveDish.succeed"), t("RemoveDish.succeedmassage"), "success");
                //  שידור WebSocket למחיקה
                console.log('---------------שולח הודעה לwebSocket------------------------');
                sendSocketMessage({
                    type: dish.isCategory ? 'category' : 'dish',
                    action: 'delete',
                    payload: { itemId: dish.id }
                });
            }
        } catch (error) {
            console.error("שגיאה במחיקת מנה:", error);
            Swal.fire(t("RemoveDish.error"), t("RemoveDish.errormassage"), "error");
        }
    };
    return { handleEditDish, handleDeleteDish };
};