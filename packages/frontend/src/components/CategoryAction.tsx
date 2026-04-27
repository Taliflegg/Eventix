import { MenuAction, MenuActionData } from '@eventix/shared';
import { menuActionService } from '../services/menuActionService';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useSendSocketMessage } from "./hooks/useSendSocketMessage";

interface Props {
  eventId: string;
  userId: string;
  assignedMenuItems: any[];
  setAssignedMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  t: any;
  isOwner: boolean;
}
export const useCategoryActions = ({ eventId, userId, assignedMenuItems, setAssignedMenuItems, t, isOwner }: Props) => {
  const { send: sendSocketMessage } = useSendSocketMessage(); //  הפעלת השידור

  const handleDelete = async (categoryId: string, currentName: string) => {
    if (!isOwner || !eventId || !userId) return;
    const { isConfirmed } = await Swal.fire({
      title: t('confirm.deleteCategory'),
      text: t('confirm.deleteWarning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28A745',
      cancelButtonColor: '',
      confirmButtonText: t('button.delete'),
      cancelButtonText: t('button.cancel'),
    });
    if (!isConfirmed) return;
    // מחפשים את הקטגוריה מתוך הרשימה
    const categoryItem = assignedMenuItems.find(i => i.item.id === categoryId);
    if (!categoryItem) {
      toast.error(t('messages.categoryNotFound'));
      return;
    }
    const { item: category } = categoryItem;
    const action: MenuAction = {
      id: crypto.randomUUID(),
      eventId,
      userId,
      actionType: 'remove_category',
      timestamp: new Date(),
      actionData: {
        itemId: category.id,
        name: category.name,
        notes: category.notes ?? null,
        tags: category.tags ?? [],
        assignedTo: userId,
        categoryId: category.parentCategoryId ?? null,
        position: category.position ?? null,
        newPosition: category.position ?? null,
        isCategory: true
      }
    };
    try {
      const resp = await menuActionService.sendAction(action);
      const removedItemId = resp.data;
      if (!removedItemId) throw new Error('itemId missing');
      setAssignedMenuItems(prev => prev.filter(i => i.item.id !== removedItemId));
      await Swal.fire({
        title: t('messages.categoryDeletedTitle'),
        text: t('messages.categoryDeletedText', { name: category.name }),
        icon: 'success',
        confirmButtonColor: '#28A745',
        confirmButtonText: t('button.ok')
      });
       sendSocketMessage({
        type: 'category',
        action: 'delete',
        payload: {
          itemId: category.id,
          name: category.name,
          notes: category.notes,
          tags: category.tags,
          categoryId: category.categoryId,
          position: category.position
        }
      });
    } catch (e) {
      console.error('Failed to delete category:', e);
      toast.error(t('messages.deleteFailed'));
    }
  };
  const handleEdit = async (categoryId: string, currentName: string) => {
    if (!isOwner || !eventId || !userId) return;
    const { value: newName, isConfirmed } = await Swal.fire({
      title: t('swal.edit_title'),
      input: 'text',
      inputLabel: t('swal.edit_input'),
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonColor: '#28A745',
      confirmButtonText: t('swal.edit_confirm'),
      cancelButtonText: t('swal.edit_cancel'),
      inputValidator: (value) => {
        if (!value.trim()) return t('swal.edit_empty');
        return null;
      }
    });
    if (!isConfirmed || !newName?.trim()) return;
    // שליפת הקטגוריה המלאה
    const category = assignedMenuItems.find(i => i.item.id === categoryId);
    if (!category) {
      toast.error(t('messages.categoryNotFound'));
      return;
    }
    const { item } = category;
    const action: MenuAction = {
      id: crypto.randomUUID(),
      eventId,
      userId,
      actionType: 'update_category',
      actionData: {
        itemId: categoryId,
        isCategory: true,
        name: newName.trim(),
        notes: item.notes || null,
        tags: item.tags || [],
        position: item.position ?? 0
      },
      timestamp: new Date(),
    };
    try {
      await menuActionService.sendAction(action);
      setAssignedMenuItems(prev =>
        prev.map(i =>
          i.item.id === categoryId
            ? { ...i, item: { ...i.item, name: newName.trim() } }
            : i
        )
      );
      await Swal.fire({
        title: t('messages.categoryUpdatedTitle'),
        text: t('messages.categoryUpdatedText', { name: newName.trim() }),
        icon: 'success',
        confirmButtonColor: '#28A745',
        confirmButtonText: t('button.ok')
      });
       sendSocketMessage({
        type: 'category',
        action: 'update',
        payload: {
          itemId: category.id,
          name: category.name,
          notes: category.notes,
          tags: category.tags,
          categoryId: category.categoryId,
          position: category.position
        }
      });
    } catch (e) {
      console.error('Failed to update category:', e);
      toast.error(t('messages.updateFailed'));
    }
  };
  return { handleDelete, handleEdit };
};