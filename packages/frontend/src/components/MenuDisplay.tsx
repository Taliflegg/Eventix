import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchAssignedMenuItems,
  sendMenuAction,
} from '../services/menuActionService';
import {
  AssignedMenuItem,
  MenuItem,
  MenuAction,
  AssignedMenuResponse,
  MenuActionType,
  User,
} from '../../../shared/src';
import AddCategoryButton from './AddCategoryButton';
import ExportMenuButton from './ExportMenuButton';
import { fetchAuthenticatedUser } from '../services/usersService';
import { useParams, useNavigate } from 'react-router-dom';
import { useSendSocketMessage } from '../components/hooks/useSendSocketMessage';
import { useSocketListener } from '../components/hooks/useSocketListener';
import { useCategoryActions } from "./CategoryAction";
import { toast } from 'react-toastify';
import { useDishActions } from './EditAndRemoveDish';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import UndoButton from './UndoButton';
import BackToEventButton from './BackToEventButton';
import { FaPen, FaTrash, FaPlus } from 'react-icons/fa';
import { GiChickenOven } from 'react-icons/gi';
import { FiChevronDown } from 'react-icons/fi';
import AddDishForm from './AddDish/AddDishForm';
import { fetchIsUserExistsInEvent } from '../services/userEventService';
import NoConnectedUser from './NoConnectedUser';

const PenIcon = FaPen as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const TrashIcon = FaTrash as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const PlusIcon = FaPlus as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const ChevronDownIcon = FiChevronDown as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const ChickenIcon = GiChickenOven as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

// Tooltip component
const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-10 bg-black text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap shadow-lg pointer-events-none opacity-90">
    {text}
  </div>
);

const MenuDisplay: React.FC = () => {
  const { t, i18n }: any = useTranslation();
  const { eventId } = useParams<string>();
  const navigate = useNavigate();
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [assignedMenuItems, setAssignedMenuItems] = useState<AssignedMenuItem[] | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const type: MenuActionType = 'add_dish';
  const [hoveredMeal, setHoveredMeal] = useState<null | {
    name: string;
    tags: string[];
    note: string;
  }>(null);
  const sendSocketMessage = useSendSocketMessage();
  // Drawer state for three-dots icon
  const [drawerDishId, setDrawerDishId] = useState<string | null>(null);
  const [drawerAction, setDrawerAction] = useState<'edit' | 'delete' | null>(null);
  const [openDishId, setOpenDishId] = useState<string | null>(null);
  // --- SUGGESTIONS FEATURE ---
  const [hovered, setHovered] = useState(false);
  const [isPush, setisPush] = useState(false);
  //const toggleSuggestions = () => setisPush(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isUSerExists, setIsUSerExists] = useState<boolean>(false);
  const isCreator = createdBy === user?.id;
  const isAdmin = user?.role === 'administrator';
  const loggedInUserId = user ? user.id : '';

  const [showAddDishForm, setShowAddDishForm] = useState(false);
  // הוסף סטייט לקטגוריה שנבחרה להוספת מנה
  const [addDishCategoryId, setAddDishCategoryId] = useState<string | null>(null);

  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const [suggestionsHeight, setSuggestionsHeight] = useState(0);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // מאזין לעדכונים ב-WebSocket
  useSocketListener((items) => {
    setAssignedMenuItems(items);
  });

  useLayoutEffect(() => {
    if (isPush && windowWidth < 1024 && suggestionsRef.current) {
      setSuggestionsHeight(suggestionsRef.current.offsetHeight);
    } else {
      setSuggestionsHeight(0);
    }
  }, [isPush, windowWidth]);

  const meals: MenuItem[] = [
    {
      id: '',
      name: 'ice cream',
      notes: 'ice cream vanil with peanuts',
      tags: ['milk', 'kosher', 'peanuts'],
      position: 0,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'mafrum',
      notes: 'exactly for shabat',
      tags: ['kosher', 'gluten'],
      position: 1,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'ravyoly',
      notes: 'ravyoly full of sweet potato',
      tags: ['milk', 'soya', 'eggs'],
      position: 2,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'ban',
      notes: 'Steamed bread stuffed with meat',
      tags: ['kosher', 'soya'],
      position: 3,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'pizza',
      notes: 'Crispy bread topped with tomato paste, yellow cheese and toppings of your choice.',
      tags: ['milk', 'kosher'],
      position: 4,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'nudels',
      notes: 'Noodles mixed with vegetables and meat stir-fried in a sweet sauce',
      tags: ['soya'],
      position: 4,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'fish and chips',
      notes: 'Fried fish pieces with chips',
      tags: ['kosher'],
      position: 5,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'pancake',
      notes: 'Soft fried pancakes with maple or chocolate sauce',
      tags: ['milk', 'eggs'],
      position: 5,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'Couscous with vegetables',
      notes: 'A classic Moroccan dish that no one dislikes',
      tags: ['gluten', 'vegan'],
      position: 6,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'Meat borax',
      notes: 'Puff pastry stuffed with meat',
      tags: ['gluten', 'vegan', 'kosher'],
      position: 7,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '',
      name: 'spring chicken',
      notes: 'Chicken in sweet and sour sauce',
      tags: ['kosher'],
      position: 8,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    , {
      id: '',
      name: 'Spaghetti Carbonara',
      notes: 'Classic Italian pasta with eggs, cheese, pancetta, and pepper',
      tags: ['kosher', 'eggs'],
      position: 9,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '',
      name: 'Beef Stroganoff',
      notes: 'Sautéed pieces of beef in a sour cream mushroom sauce, served over noodles.',
      tags: ['kosher', 'soya'],
      position: 10,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '',
      name: 'Caesar Salad',
      notes: 'Romaine lettuce with croutons, Parmesan cheese, and Caesar dressing',
      tags: ['kosher'],
      position: 11,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '',
      name: 'Miso Soup',
      notes: ' Traditional Japanese soup with tofu, seaweed, and miso paste',
      tags: ['eggs'],
      position: 12,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '',
      name: 'Falafel Wrap',
      notes: 'Fried chickpea balls wrapped in pita with salad and tahini sauce',
      tags: ['gluten', 'kosher'],
      position: 13,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '',
      name: 'Chocolate Lava Cake',
      notes: ' Warm chocolate cake with a gooey melted center',
      tags: ['gluten'],
      position: 14,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '',
      name: 'Margherita Pizza',
      notes: 'Pizza topped with tomato, mozzarella, and fresh basil',
      tags: ['gluten', 'kosher'],
      position: 15,
      isCategory: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

  ];
  useEffect(() => {
    const ifUserInEvent = async () => {
      try {
        if (eventId === undefined) return;
        const ifExists: boolean = await fetchIsUserExistsInEvent(loggedInUserId, eventId);
        setIsUSerExists(ifExists);
        if (!eventId) return;
      } catch (err) {
        console.error(err);
      }
    };
    ifUserInEvent();
  }, [eventId]);
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await fetchAuthenticatedUser();
        setUser(currentUser);
        if (!eventId) return;
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [eventId]);

  // טעינת התפריט
  const loadMenu = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const response: AssignedMenuResponse = await fetchAssignedMenuItems(eventId);
      setAssignedMenuItems(response.assignedMenuItems);
      setEventName(response.eventName || null);
      setCreatedBy(response.eventCreatorID || null);

    } catch (err: any) {
      setError(err.message || t('MenuDisplay.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [eventId, t]);


  const { handleDelete, handleEdit } = useCategoryActions({
    eventId: eventId || '',
    userId: user?.id || '',
    assignedMenuItems: assignedMenuItems ?? [], // <- אם null => []
    setAssignedMenuItems: setAssignedMenuItems as React.Dispatch<React.SetStateAction<AssignedMenuItem[]>>, // <- טיפוס ברור
    t,
    isOwner: isCreator || isAdmin,
  });

  // הוסף בראש הקובץ (אחרי imports):
  const createMenuActionObject = (
    actionType: 'assign_dish' | 'unassign_dish',
    item: any,
    userId: string | null
  ) => {
    return {
      id: '',
      eventId: eventId!,
      userId: userId ?? '',
      actionType,
      timestamp: new Date(),
      actionData: {
        itemId: item.id,
        name: item.name,
        notes: item.notes,
        tags: item.tags,
        assignedTo: userId ?? undefined,
        categoryId: item.categoryId,
        position: item.position,
        newPosition: 0,
        isCategory: false,
      },
    };
  };
  // יוצרת אובייקט פעולה להזזת פריט (מנה/קטגוריה)
  const buildMenuAction = (
    item: MenuItem,
    oldPosition: number,
    newPosition: number
  ): MenuAction => ({
    id: '',
    eventId: eventId || '',
    userId: loggedInUserId,
    actionType: 'move_item',
    timestamp: new Date(),
    actionData: {
      itemId: item.id,
      name: item.name,
      notes: item.notes,
      tags: item.tags,
      assignedTo: item.assignedTo ?? undefined,
      categoryId: item.categoryId,
      position: oldPosition,
      newPosition: newPosition,
      isCategory: item.isCategory,
    },
  });




  const { send: sendSocket } = useSendSocketMessage();
  const { handleEditDish, handleDeleteDish } = useDishActions({
    userId: loggedInUserId,
    eventId: eventId!,
    t
  });

  const handleDropOnCategory = async (
    e: React.DragEvent<HTMLDivElement>,
    categoryId: string
  ) => {
    e.preventDefault();
    const mealName = e.dataTransfer.getData("text/plain");
    const meal = meals.find(m => m.name === mealName);
    if (!meal || !user) return;
    const translatedName = t(`MenuSuggestions.${getMealKey(meal.name)}`);
    const action: MenuAction = {
      id: "",
      eventId: eventId!,
      userId: user.id,
      actionType: type,
      timestamp: meal.createdAt,
      actionData: {
        itemId: '',
        name: translatedName,
        notes: meal.notes,
        tags: meal.tags,
        assignedTo: user.id,
        categoryId,
        position: meal.position,
        newPosition: meal.position,
        isCategory: false
      }
    };
    try {
      await sendMenuAction(action, user.id);
      sendSocketMessage.send({
        type: 'dish',
        action: 'add',
        payload: {
          ...action.actionData,
          itemId: action.actionData.itemId!,
          assignedUser: {
            id: user.id,
            name: user.name
          }
        }
      });
    } catch (err) {
      console.error("שגיאה בהוספת מנה בגרירה:", err);
    }
  };


  // טיפול בגרירה
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !assignedMenuItems || !user) return;
    const { destination, source, draggableId, type } = result;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    const updated = [...assignedMenuItems];
    if (type === 'dish') {
      // מוודא שהמנה נגררת רק בתוך אותה קטגוריה
      if (destination.droppableId !== source.droppableId) {
        const errorDiv = document.createElement('div');
        errorDiv.className = `
  fixed bottom-6 left-1/2 transform -translate-x-1/2
  bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg
  text-sm font-medium z-50 pointer-events-none
`;
        errorDiv.innerText = t('MenuDisplay.error_drag_dish');
        document.body.appendChild(errorDiv);
        setTimeout(() => {
          errorDiv.remove();
        }, 3000);
        toast.error(t('MenuDisplay.error_drag_dish'));
        return;
      }
      const categoryId = source.droppableId;
      const dishesInCategory = updated
        .filter((i) => !i.item.isCategory && i.item.categoryId === categoryId)
        .sort((a, b) => (a.item.position ?? 0) - (b.item.position ?? 0));
      const sourceCategoryId = source.droppableId;
      const destinationCategoryId = destination.droppableId;
      const draggedIndex = source.index;
      const targetIndex = destination.index;

      // מציאת המנה שנגררה
      const movedItem = updated.find(i => i.item.id === draggableId);
      if (!movedItem) return;

      if (sourceCategoryId === destinationCategoryId) {
        // הזזה בתוך אותה קטגוריה
        const dishesInCategory = updated
          .filter((i) => !i.item.isCategory && i.item.categoryId === sourceCategoryId)
          .sort((a, b) => (a.item.position ?? 0) - (b.item.position ?? 0));

        // סידור מחדש במערך
        const [movedDish] = dishesInCategory.splice(draggedIndex, 1);
        dishesInCategory.splice(targetIndex, 0, movedDish);

        // עדכון מיקומים חדשים לכל המנות בקטגוריה
        dishesInCategory.forEach((dish, index) => {
          dish.item.position = index;
        });

        // עדכון הסטייט עם המיקומים החדשים
        const newAssigned = updated.map((i) => {
          const found = dishesInCategory.find((d) => d.item.id === i.item.id);
          return found ? { ...i, item: { ...i.item, position: found.item.position } } : i;
        });
        setAssignedMenuItems(newAssigned);

        // יצירת ושליחת הפעולה לשרת
        const oldPosition = movedDish.item.position ?? 0;
        const newPosition = targetIndex;
        const action = buildMenuAction(movedDish.item, oldPosition, newPosition);
        try {
          await sendMenuAction(action);
        } catch (err) {
          console.error('שגיאה בשליחת עדכון גרירה:', err);
        }
      } else {
        // הזזה בין קטגוריות - לא מותרת
        toast.error(t('MenuDisplay.error_drag_dish'));
        return;
      }
    }
    if (type === 'category') {
      // גרירת קטגוריות אופקית
      const categories = updated
        .filter((i) => i.item.isCategory)
        .sort((a, b) => (a.item.position ?? 0) - (b.item.position ?? 0));
      const draggedIndex = categories.findIndex((i) => i.item.id === draggableId);
      if (draggedIndex === -1) return;
      const [movedCategory] = categories.splice(draggedIndex, 1);
      categories.splice(destination.index, 0, movedCategory);

      // עדכון מיקומים חדשים לכל הקטגוריות
      categories.forEach((cat, index) => {
        cat.item.position = index;
      });

      // עדכון הסטייט עם המיקומים החדשים
      const newAssigned = updated.map((i) => {
        if (!i.item.isCategory) return i;
        const updatedCat = categories.find((c) => c.item.id === i.item.id);
        return updatedCat ?? i;
      });
      setAssignedMenuItems(newAssigned);

      const oldPosition = movedCategory.item.position ?? 0;
      const newPosition = destination.index;
      const action = buildMenuAction(movedCategory.item, oldPosition, newPosition);
      try {
        await sendMenuAction(action);
      } catch (err) {
        console.error('שגיאה בשליחת עדכון גרירת קטגוריה:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-40 gap-2">
        <div className="flex space-x-2">
          <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
        <span className="text-gray-500 text-sm">{t('MenuDisplay.loading')}</span>
      </div>
    );
  }
  const handleHover = (nameMeal: string) => {
    const meal = meals.find((item) => item.name === nameMeal);
    if (meal)
      setHoveredMeal({ name: meal.name, tags: meal.tags, note: meal.notes || '' });
  };

  const handleLeave = () => {
    setHoveredMeal(null);
  };


  if (error){
    if(error=="Request failed with status code 401"||error=="Request failed with status code 400")
      return <NoConnectedUser></NoConnectedUser>
    return <div className="p-6 text-red-600">{error}</div>;

  }
  // const categories = assignedMenuItems?.filter((e) => e.item.isCategory).map((e) => e.item);
  // const dishes = assignedMenuItems?.filter((e) => !e.item.isCategory);

  // Helper to get translation key for each meal
  const getMealKey = (name: string) => {
    switch (name) {
      case 'ice cream': return 'ice_cream';
      case 'mafrum': return 'mafrum';
      case 'ravyoly': return 'ravyoly';
      case 'ban': return 'ban';
      case 'pizza': return 'pizza';
      case 'nudels': return 'nudels';
      case 'fish and chips': return 'fish_and_chips';
      case 'pancake': return 'pancake';
      case 'Couscous with vegetables': return 'couscous_with_vegetables';
      case 'Meat borax': return 'meat_borax';
      case 'spring chicken': return 'spring_chicken';
      default: return name;
    }
  };


  // Helper to get translation key for each tag
  const getTagKey = (tag: string) => {
    return tag.toLowerCase().replace(/\s+/g, '_');
  };
  // Detect if mobile and English
  const exportOpenDirection = i18n.language === 'he' ? 'right' : 'left';

  if (!assignedMenuItems) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10 text-gray-900">
        <div className="p-6 text-gray-600 text-center">
          {t('MenuDisplay.no_items')}
        </div>
      </main>
    );
  }

  // בדיקה אם יש מנות
  const hasItems = assignedMenuItems.length > 0;

  // מפריד קטגוריות ומנות
  const categories = assignedMenuItems
    .filter((e) => e.item.isCategory)
    .map((e) => e.item)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const dishes = assignedMenuItems
    .filter((e) => !e.item.isCategory)
    .sort((a, b) => (a.item.position ?? 0) - (b.item.position ?? 0));

  // בדיקה אם יש קטגוריות
  const hasCategories = categories.length > 0;

  return (
    <main className="relative max-w-6xl mx-auto px-4 py-10 text-gray-900">
      {/* כפתור ייצוא וראשית */}
      <div className={`absolute top-0 ${i18n.language === 'he' ? 'right-0' : 'right-0'} ${windowWidth < 600 ? 'mt-10' : 'mt-40 md:mt-10'} mb-10 mx-2 flex items-center justify-between w-full max-w-6xl`}>
        <div className={`${windowWidth < 1024 ? (i18n.language === 'he' ? 'order-1 ml-2' : 'order-2 mr-2') : ''}`}>
          <ExportMenuButton eventId={eventId ?? ''} eventName={eventName ?? ''} openDirection={exportOpenDirection} />
        </div>
        <div className={`${windowWidth < 1024 ? (i18n.language === 'he' ? 'order-1 mr-2' : 'order-2 ml-2') : ''}`}>
          {/* מחליף את StarIcon ב-ChickenIcon */}
          {hasCategories && (
            <>
              <button
                onClick={() => setisPush(v => !v)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg transition lg:hidden hover:bg-[#28A745]/20"
                aria-label={t('MenuSuggestions.title')}
              >
                <ChickenIcon className="w-8 h-8 text-black" />
              </button>
              {hovered && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
                  {t('MenuSuggestions.title')}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <h1
        className={`font-extrabold text-center text-gray-800 max-w-[80vw] mx-auto break-words text-xl sm:text-2xl md:text-4xl leading-tight line-clamp-2 ${windowWidth < 600 ? 'mt-0' : 'mt-40 md:mt-0'} ${windowWidth < 1024 ? 'ml-[80px] mr-[30px]' : ''} ${hasCategories ? (i18n.language === 'he' ? 'lg:ml-[20%]' : 'lg:mr-[20%]') : ''}`}
        style={{ lineHeight: 1.2, paddingRight: 56 }}
      >
        {t('MenuDisplay.title')}
        {eventName && (
          <span> {eventName}</span>
        )}
      </h1>

      {/* --- SUGGESTIONS PANEL --- */}
      {/* Mobile/Tablet: toggled panel */}
      {isPush && hasCategories && (
        <div ref={suggestionsRef} className="flex flex-col lg:hidden gap-6">
          <div
            className={`
              w-full
              shadow-md
              rounded-2xl
              border border-gray-200
              z-50
              p-2
              /* במסך קטן – רכיב קבוע בתחתית */
              fixed bottom-0 left-0 right-0
              /* בטאבלט – רכיב נמוך עם גלילה פנימית */
              max-h-[120px] md:overflow-y-auto
            `}
          >
            {/* כותרת */}
            <label className="block font-bold text-sm text-green-600 mb-3 bg-[#F8FAFC] sticky top-0 z-10 px-3 py-2 border-2 border-green-400 rounded-md shadow-sm">
              {t('MenuSuggestions.title')}
            </label>
            {/* רשימת מנות */}
            {windowWidth < 1024 ? (
              <ul className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap max-w-full">
                {meals.map((meal) => (
                  <li
                    key={meal.name}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', meal.name)}
                    onMouseEnter={() => handleHover(meal.name)}
                    onMouseLeave={handleLeave}
                    className="relative bg-[#F8FAFC] min-w-[140px] px-2 py-1 rounded-lg text-black font-medium shadow-sm cursor-grab text-xs hover:bg-[#28A745]/20 transition-colors duration-200"
                  >
                    {t(`MenuSuggestions.${getMealKey(meal.name)}`)}
                    {hoveredMeal?.name === meal.name && (
                      <div className="absolute top-full left-0 mt-2 bg-white border p-2 rounded-md text-xs text-gray-800 shadow-lg min-w-[150px] z-50">
                        <strong>{t('MenuSuggestions.tags_label')}</strong> {hoveredMeal.tags.map(tag => t(`MenuSuggestions.tag_${getTagKey(tag)}`)).join(", ")}<br />
                        <strong>{t('MenuSuggestions.note_label')}</strong> {t(`MenuSuggestions.note_${getMealKey(hoveredMeal.name)}`)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col text-sm gap-2">
                {meals.map((meal) => (
                  <li
                    key={meal.name}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', meal.name)}
                    onMouseEnter={() => handleHover(meal.name)}
                    onMouseLeave={handleLeave}
                    className="relative bg-[#F8FAFC] px-3 py-2 rounded-lg text-black font-medium shadow-sm cursor-grab text-sm hover:bg-[#28A745]/20 transition-colors duration-200"
                  >
                    {t(`MenuSuggestions.${getMealKey(meal.name)}`)}
                    {hoveredMeal?.name === meal.name && (
                      <div className="absolute top-full left-0 mt-2 bg-white border p-2 rounded-md text-xs text-gray-800 shadow-lg min-w-[150px] z-50">
                        <strong>{t('MenuSuggestions.tags_label')}</strong> {hoveredMeal.tags.map(tag => t(`MenuSuggestions.tag_${getTagKey(tag)}`)).join(', ')}<br />
                        <strong>{t('MenuSuggestions.note_label')}</strong> {t(`MenuSuggestions.note_${getMealKey(hoveredMeal.name)}`)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Desktop: always visible panel on the side */}
      {hasCategories && (
        <div className={`hidden lg:block lg:fixed lg:top-32 ${i18n.language === 'he' ? 'lg:left-4' : 'lg:right-4'} lg:w-[20%] lg:p-4 lg:z-40`}>
          <div
            className={`
              shadow-md
              rounded-2xl
              border border-gray-200
              p-4
              sticky top-4 max-h-[80vh] overflow-y-auto
            `}
          >
            <label className="block font-bold text-base text-green-600 mb-3 bg-[#F8FAFC] sticky top-0 z-10 px-3 py-2 border-2 border-green-400 rounded-md shadow-sm">
              {t('MenuSuggestions.title')}
            </label>
            <ul className={`
              ${windowWidth < 1024 ? 'flex flex-row gap-2 overflow-x-auto whitespace-nowrap max-w-full' : 'flex flex-col text-sm gap-2'}
            `}>
              {meals.map((meal) => (
                <li
                  key={meal.name}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', meal.name)}
                  onMouseEnter={() => handleHover(meal.name)}
                  onMouseLeave={handleLeave}
                  className={`
                    relative bg-[#F8FAFC] px-3 py-2 rounded-lg text-black font-medium shadow-sm cursor-grab text-sm hover:bg-[#28A745]/20 transition-colors duration-200
                    ${windowWidth < 1024 ? 'min-w-[140px]' : ''}
                  `}
                >
                  {t(`MenuSuggestions.${getMealKey(meal.name)}`)}
                  {hoveredMeal?.name === meal.name && (
                    <div className="absolute top-full left-0 mt-2 bg-white border p-2 rounded-md text-xs text-gray-800 shadow-lg min-w-[150px] z-50">
                      <strong>{t('MenuSuggestions.tags_label')}</strong> {hoveredMeal.tags.map(tag => t(`MenuSuggestions.tag_${getTagKey(tag)}`)).join(', ')}<br />
                      <strong>{t('MenuSuggestions.note_label')}</strong> {t(`MenuSuggestions.note_${getMealKey(hoveredMeal.name)}`)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}



       {showAddDishForm && (
        <AddDishForm
          onClose={() => setShowAddDishForm(false)}
          categories={assignedMenuItems}
          defaultCategoryId={addDishCategoryId}
        />
      )}



      {/* MAIN CONTENT: categories and dishes, with margin on desktop */}
      <div
        style={{ paddingBottom: isPush && windowWidth < 1024 ? suggestionsHeight : undefined }}
        className={`${hasCategories ? (i18n.language === 'he' ? 'lg:ml-[22%]' : 'lg:mr-[22%]') : ''}`}
      >
        <>
          {/* כפתור הוספת קטגוריה */}
          <div className={`flex ${t('language') === 'he' ? 'justify-end mr-0' : 'justify-start ml-0'} mb-4 mt-4`}>
            <BackToEventButton
              onClick={() => {
                navigate(`/event/${eventId}`);
              }}
            />
            {(isCreator || isAdmin) && (
              <AddCategoryButton
                assignedMenuItemsProps={assignedMenuItems}
              />
            )}
            {(assignedMenuItems && assignedMenuItems.length > 0) &&
              <UndoButton
                onUndoAction={() => {
                  loadMenu();
                }}
              ></UndoButton>}
          </div>
          {/* תצוגת הקטגוריות והמנות בשורות */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories" type="category">
              {(provided) => (
                <div className="flex flex-col gap-8" ref={provided.innerRef} {...provided.droppableProps}>
                  {categories?.map((category, idx) => {
                    const isFirst = idx === 0;
                    const categoryDishes = dishes
                      ?.filter((d) => d.item.categoryId === category.id)
                      .sort((a, b) => (a.item.position ?? 0) - (b.item.position ?? 0));
                    return (
                      <Draggable draggableId={category.id} index={idx} key={category.id} isDragDisabled={!isCreator && !isAdmin}>
                        {(catProvided) => (
                          <div
                            ref={catProvided.innerRef}
                            {...catProvided.draggableProps}
                            className={`w-full${isFirst && i18n.language === 'he' ? ' mt-8' : ''} ${(windowWidth < 1024 && idx === categories.length - 1 && isPush) ? 'mb-40' : ''}`}
                          >
                            <div className="flex items-center gap-4 border-b pb-2 mb-2" {...catProvided.dragHandleProps}>
                              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                                {category.name}
                                {/* אייקוני עריכה ומחיקה - רק ליוצר האירוע */}
                                {(isCreator || isAdmin) && (
                                  <>
                                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[#28A745]/20 relative group"

                                      onClick={() => handleEdit(category.id, category.name)}
                                    >
                                      <PenIcon className="w-4 h-4 text-black" />
                                      <span className="hidden group-hover:block">
                                        <Tooltip text={i18n.language === 'he' ? 'עדכון קטגוריה' : 'Update category'} />
                                      </span>
                                    </button>
                                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[#28A745]/20 relative group"

                                      onClick={() => handleDelete(category.id, category.name)}
                                    >
                                      <TrashIcon className="w-4 h-4 text-black" />
                                      <span className="hidden group-hover:block">
                                        <Tooltip text={i18n.language === 'he' ? 'מחיקת קטגוריה' : 'Delete category'} />
                                      </span>
                                    </button>
                                  </>
                                )}
                                {/* אייקון פלוס - תמיד מוצג */}
                                {(isUSerExists || isAdmin || isCreator) && <span
                                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[#28A745]/20 relative group ml-1 cursor-pointer"

                                  style={{ position: 'relative' }}
                                  onClick={() => {
                                    setAddDishCategoryId(category.id);
                                    setShowAddDishForm(true);
                                  }}
                                >
                                  <PlusIcon className="w-4 h-4 text-black" />
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-10 z-50 hidden group-hover:block bg-black text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap shadow-lg pointer-events-none opacity-90">
                                    {i18n.language === 'he' ? 'הוספת מנה עבור קטגוריה זו' : 'Add a dish for this category'}
                                  </span>
                                </span>
                                }
                              </h2>
                            </div>
                            <Droppable droppableId={category.id} type="dish">
                              {(dishProvided) => (
                                <div
                                  ref={dishProvided.innerRef}
                                  {...dishProvided.droppableProps}
                                  className="flex flex-col divide-y divide-gray-200"
                                  onDrop={e => handleDropOnCategory(e, category.id)}
                                  onDragOver={e => e.preventDefault()}
                                >
                                  {categoryDishes?.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic pl-4">
                                      {t('MenuDisplay.no_dishes_in_category')}
                                    </p>
                                  ) : (
                                    categoryDishes?.map(({ item, assignedUser }, dishIdx) => {
                                      const isAssigned = !!assignedUser;
                                      const isMine = assignedUser?.id === loggedInUserId;
                                      return (
                                        <Draggable draggableId={item.id} index={dishIdx} key={item.id} isDragDisabled={!isCreator && !isAdmin}>
                                          {(dishProvided) => (
                                            <div
                                              ref={dishProvided.innerRef}
                                              {...dishProvided.draggableProps}
                                              {...dishProvided.dragHandleProps}
                                              className="flex flex-row items-center py-3 px-2 hover:bg-gray-50 transition"
                                            >
                                              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                                <div className="flex-1 min-w-0">
                                                  <span className={`text-base font-medium text-gray-800 ${i18n.language === 'he' ? 'text-right' : 'text-left'} w-full block flex items-center gap-1`}>
                                                    {item.name}
                                                    <button
                                                      type="button"
                                                      className="focus:outline-none"
                                                      onClick={() => setOpenDishId(openDishId === item.id ? null : item.id)}
                                                      aria-label={i18n.language === 'he' ? 'הצג פרטים' : 'Show details'}
                                                    >
                                                      <ChevronDownIcon
                                                        className="inline w-5 h-5 text-gray-400 transition-transform duration-200"
                                                        style={{
                                                          transform:
                                                            openDishId === item.id
                                                              ? i18n.language === 'he'
                                                                ? 'rotate(90deg)' // ← בעברית
                                                                : 'rotate(-90deg)' // → באנגלית
                                                              : 'rotate(0deg)' // ↓ ברירת מחדל
                                                        }}
                                                      />
                                                    </button>
                                                  </span>
                                                  {openDishId === item.id && (
                                                    <>
                                                      {(!item.notes && item.tags.length === 0) ? (
                                                        <p className="text-sm text-gray-400 italic">
                                                          {i18n.language === 'he' ? 'אין הערות או תגיות' : 'No notes or tags'}
                                                        </p>
                                                      ) : (
                                                        <>
                                                          {item.notes && (
                                                            <p className="text-sm text-gray-500 mt-1 truncate">
                                                              {item.notes}
                                                            </p>
                                                          )}
                                                          {item.tags.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                              {item.tags.map((tag, idx) => (
                                                                <span
                                                                  key={idx}
                                                                  className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
                                                                >
                                                                  {tag}
                                                                </span>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </>
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                                {/* כפתורים לעדכון ומחיקה */}
                                              </div>
                                              {/* כפתור שיבוץ / שחרור */}
                                              <div className="flex flex-row gap-2 ml-4 items-center" style={{ position: 'relative' }}>
                                                {/* כפתורי עדכון/מחיקה - תמיד ראשונים */}
                                                {(createdBy || isAdmin) && (
                                                  <>
                                                    <span
                                                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[#28A745]/20 relative group cursor-pointer"

                                                      onClick={() => handleEditDish(item)}
                                                    >
                                                      <PenIcon className="w-4 h-4 text-black" />
                                                      <span className="hidden group-hover:block">
                                                        <Tooltip text={i18n.language === 'he' ? 'עדכון מנה' : 'Update dish'} />
                                                      </span>
                                                    </span>
                                                    <span
                                                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[#28A745]/20 relative group cursor-pointer"

                                                      onClick={() => handleDeleteDish(item)}
                                                    >
                                                      <TrashIcon className="w-4 h-4 text-black" />
                                                      <span className="hidden group-hover:block">
                                                        <Tooltip text={i18n.language === 'he' ? 'מחיקת מנה' : 'Delete dish'} />
                                                      </span>
                                                    </span>
                                                  </>
                                                )}
                                                {/* כפתורים חדשים: עדכון ומחיקה ישירה */}
                                                {/* שיוך/הסרת שיוך/שם משויך - תמיד אחרון */}
                                                {!isAssigned && user && (isUSerExists || isAdmin || isCreator) && (
                                                  <button
                                                    onClick={async () => {
                                                      const action = createMenuActionObject(
                                                        'assign_dish',
                                                        item,
                                                        user.id
                                                      );
                                                      try {
                                                        await sendMenuAction(action);
                                                        sendSocketMessage.send({
                                                          type: 'dish',
                                                          action: 'assign',
                                                          payload: {
                                                            itemId: item.id,
                                                            assignedUser: {
                                                              id: user.id,
                                                              name: user.name,
                                                            },
                                                          },
                                                        });
                                                      } catch (err) {
                                                        console.error('שגיאה בשיבוץ:', err);
                                                      }
                                                    }}
                                                    className={`px-6 py-2 text-sm rounded-full font-medium text-white bg-[#28A745]/40 hover:bg-[#28A745]/40 transition-all duration-200 shadow-none ms-auto`}
                                                  >
                                                    {t('MenuDisplay.assign_to_user')}
                                                  </button>
                                                )}
                                                {isAssigned && isMine && (
                                                  <div className="relative group ms-auto">
                                                    <button
                                                      onClick={async () => {
                                                        const action = createMenuActionObject(
                                                          'unassign_dish',
                                                          item,
                                                          null
                                                        );
                                                        try {
                                                          await sendMenuAction(action);
                                                          sendSocketMessage.send({
                                                            type: 'dish',
                                                            action: 'unassign',
                                                            payload: {
                                                              itemId: item.id,
                                                            },
                                                          });
                                                        } catch (err) {
                                                          console.error('שגיאה בשחרור:', err);
                                                        }
                                                      }}
                                                      className="px-6 py-2 text-sm rounded-full font-medium text-white bg-[#28A745] hover:bg-[#218838] transition-all duration-200 shadow-none"
                                                    >
                                                      {user?.name}
                                                    </button>
                                                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:block bg-black text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap shadow-lg">
                                                      {i18n.language === 'he' ? 'להסרת שיוך למנה' : 'Unassign this dish'}
                                                    </div>
                                                  </div>
                                                )}
                                                {isAssigned && !isMine && assignedUser && (
                                                  <span className="text-sm text-gray-700 ms-auto">
                                                    {i18n.language === 'he' ? 'המשויך: ' : 'Assigned to: '}{assignedUser.name}
                                                  </span>
                                                )}
                                              </div>
                                              {/* מודלים של עדכון/מחיקת מנה */}
                                              {drawerDishId === item.id && drawerAction === 'edit' && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                                                    {/* <button
                                                          onClick={() => handleEditDish(item)}
                                                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                        >
                                                          {t('MenuDisplay.editdish')}
                                                        </button> */}

                                                  </div>
                                                </div>

                                              )}
                                              {drawerDishId === item.id && drawerAction === 'delete' && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                                  <button
                                                    onClick={() => handleDeleteDish(item)}
                                                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                  >
                                                    {t('MenuDisplay.removedish')}
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })
                                  )}
                                  {dishProvided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>

      </div>
      {/* אם אין מנות, מציגה הודעה מתאימה */}
      {!hasItems && (
        <div className="text-lg text-gray-600 text-center mt-0 pt-2">
          {t('MenuDisplay.no_items')}
        </div>
      )}

    </main>
  );

};

export default MenuDisplay;
