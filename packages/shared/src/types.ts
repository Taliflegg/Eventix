//types.ts
// Core TypeScript Types for Meals Together
// Core TypeScript Types for Meals Together
// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // Optional for Google SSO users
  googleId?: string; // For Google SSO
  language: 'en' | 'he';
  dietaryRestrictions?: DietaryRestriction[];
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  imageUrl?: string;
  profile_image?: string;
}
export type UserRole = 'administrator' | 'user';
export interface NotificationPreferences {
  id: number;
  created_at: Date;
  updated_at: Date;
  user_id: string; // UUID
  notify_event_created: boolean;
  notify_event_updated: boolean;
  notify_reminder: boolean;
  notify_menu_changed: boolean;
}
export interface NotificationPreferencesResponse extends BaseResponse {
  data: NotificationPreferences;
}
export interface UpdateNotificationPreferencesDto {
  notify_event_created?: boolean;
  notify_event_updated?: boolean;
  notify_reminder?: boolean;
  notify_menu_changed?: boolean;
}
export interface DietaryRestriction {
  id: string;
  name: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  datetime: Date;
  language: 'en' | 'he';
  mealType: MealType;
  expectedCount: number;
  actualCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isLimited: boolean
  thumbnail: string | null; // תמונה מוקטנת לאירוע
}
export type MealType = 'meat' | 'dairy' | 'vegetarian' | 'vegan' | 'kosher' | 'bbq' | 'other';
export interface UserEvent {
  id: string;
  userId: string;
  eventId: string;
  role: UserEventRole;
  joinedAt: Date;
}
export type UserEventRole = 'admin' | 'participant';
// Menu and Dish Types
export interface MenuAction {
  id: string;
  eventId: string;
  userId: string;
  actionType: MenuActionType;
  actionData: MenuActionData;
  timestamp: Date;
}
export type MenuActionType = 'add_category' | 'remove_category' | 'update_category' | 'add_dish' | 'remove_dish' | 'update_dish' | 'update_category' | 'move_item' | 'assign_dish' | 'unassign_dish' | 'undo_action';
export interface MenuActionData {
  itemId?: string;
  name?: string;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  categoryId?: string;
  position?: number;
  newPosition?: number;
  isCategory?: boolean;
}
export interface MenuItem {
  id: string;
  name: string;
  notes?: string;
  tags: string[];
  assignedTo?: string;
  categoryId?: string;
  position: number;
  isCategory: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface JwtPayload {
  userId: string;
  email?: string;
}
// Share Link Types
export interface ShareLink {
  id: string;
  eventId: string;
  token: string;
  createdBy: string;
  expirationDate?: Date;
  accessLevel: AccessLevel;
  usageCount: number;
  createdAt: Date;
}
export type AccessLevel = 'view_only' | 'join_and_edit';
export interface EventWithDetails {
  event: Event;
  participants: UserEvent[];
  menu: MenuItem[];
  shareLink?: ShareLink;
  UserEventRole?: UserEventRole; // Current user's role in this event
}
export interface EventPreview {
  event: Pick<Event, 'id' | 'title' | 'datetime' | 'location' | 'mealType'>;
  participantCount: number;
  isPublic: boolean;
}
export interface JoinEventRequest {
  eventId: string;
  shareToken: string;
  userId: string;
}
export interface AssignedMenuItem {
  assignedUser?: User;
  item: MenuItem;
}
export type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserRequest = Partial<Pick<User, 'name' | 'language' | 'dietaryRestrictions'>>;
export type CreateEventRequest = Omit<Event, 'id' | 'createdBy' | 'actualCount' | 'createdAt' | 'updatedAt'>;
export type UpdateEventRequest = Partial<Pick<Event, 'title' | 'description' | 'location' | 'datetime' | 'mealType' | 'expectedCount'>>;
export interface BaseResponse {
  success: boolean;
  error?: string;
}
export interface EventResponse extends BaseResponse {
  data: Event;
}
export interface EventsResponse extends BaseResponse {
  success: boolean;
  data: Event[];
  totalItems?: number;     // סך כל האירועים במערכת
  totalPages?: number;     // כמה עמודים יש בסה"כ
  currentPage?: number;    // העמוד הנוכחי
  error?: string;
}
// מייצג משתתף בארוע עם העדפת התזונה שלו
export interface Attendee {
  id: string;
  name: string;
  dietaryRestrictions?: string[];
}
// תגובה מהשרת שמכיל דטה של כל המשתתפים בארוע עם העדפות התזונה שלהם
export interface AttendeesResponse {
  success: boolean;
  data: Attendee[];
  error?: string;
}
//מייצג פרטי אורע מקוצרים להצגה לכולם
export interface EventDetailsView {
  title: string;
  datetime: Date;
  location: string;
  description: string;
  DietaryRestriction: string[];
  joinedCount: number;
}
//מחזיר פרטי ארוע מלאים + העדפות תזונה + רמת גישה והאים מחובר
export type ShareLinkFullEvent = {
  event: Event & {
    participants: Attendee[];
  };
  accessLevel: string;
  isAuthenticated: true;
};
//מחזיר שגיאה כאשר אין קישור שיתוף תקין
export type ShareLinkErrorResult = {
  error: string;
  status: number;
};
//מחזיר את פרטי הארוע כאשר המשתמש לא מחובר
export type ShareLinkNotAuthenticatedSuccess = {
  event: EventDetailsView;
  accessLevel: string;
  isAuthenticated: false;
};
export interface AssignedMenuItem {
  assignedUser?: User;
  item: MenuItem;
}
export interface AssignedMenuResponse {
  success: boolean;
  eventName?: string;
  eventCreatorID?: string;
  assignedMenuItems: AssignedMenuItem[];
  error?: string;
}
export interface MenuActionsResponse extends BaseResponse {
  data: MenuAction[];
}
export interface EventResponse extends BaseResponse {
  data: Event;
}
export interface EventsResponse extends BaseResponse {
  success: boolean;
  data: Event[];
  totalItems?: number;     // סך כל האירועים במערכת
  totalPages?: number;     // כמה עמודים יש בסה"כ
  currentPage?: number;    // העמוד הנוכחי
  error?: string;
}


export interface BaseResponse {
  success: boolean;
  error?: string;
  message?: string; // **הוסף/י את זה אם חסר**
}


export interface UserEventResponse extends BaseResponse {
  data: UserEvent;
}
export interface UserEventsResponse extends BaseResponse {
  data: UserEvent[];
}
export interface MenuActionResponse extends BaseResponse {
  data: MenuAction;
}
export interface UsersResponse extends BaseResponse {
  data: User[];
}
export interface UserResponse extends BaseResponse {
  data: User;
}
export interface MenuActionsResponse extends BaseResponse {
  data: MenuAction[];
}
export interface MenuActionResponse extends BaseResponse {
  data: MenuAction;
}

// export interface Location {
//   id: string;
//   accountId: string;
//   name: string;
//   address: string;
//   location_type: LocationType;
// }
export interface OnboardingInput {
  name: string;
  email: string;
  accountName: string;
  accountType: 'family' | 'individual';
  mainLocation: {
    name: string;
    address: string;
  };
  additionalLocations?: {
    name: string;
    address: string;
    location_type?: LocationType; // :white_check_mark: הוספת location_type
  }[];
}
//# sourceMappingURL=types.d.ts.map

// מייצג משתתף בארוע עם העדפת התזונה שלו
export interface Attendee {
  id: string;
  name: string;
  dietaryRestrictions?: string[];
}
// תגובה מהשרת שמכיל דטה של כל המשתתפים בארוע עם העדפות התזונה שלהם
export interface AttendeesResponse {
  success: boolean;
  data: Attendee[];
  error?: string;
}
//# sourceMappingURL=types.d.ts.map


export interface AccountUser {
  name: string;
  profile_image: string;
}

export interface UsersInAccountResponse {
  success: boolean;
  accountName: string;
  accountId: string;
  data: AccountUser[];
  error?: string;
}

export type LocationType = 'home' | 'inlaws' | 'parents' | 'friends' | 'other';

export interface AccountLocation {
  id: string;
  name: string;
  address: string;
  locationType: LocationType;
}

export interface LocationsInAccountResponse {
  success: boolean;
  data: AccountLocation[];
  error?: string;
}
export interface ShabbatDataForFrontend {
  dateEnglish: string;
  dateHebrew: string;
  parasha: string;
  locations: LocationDataForFrontend[];
}
export interface LocationDataForFrontend {
  id: string;
  type: string;
  name: string;
  subtitle: string;
  myStatus: string;
  confirmedCount: number;
  pendingCount: number;
  confirmedNames: string[];
  pendingNames: string[];
}
export interface MealTrains {
  id:string,
  name:string,
  address:string
  startDate:Date
  endDate:Date,
  peopleCount?: number
  adults:number,
  childrens:number,
  dietaryInfo:string
  deliveryTime:string
  adminUserId:string
  shareToken:string
  createdAt:Date,
   Image:string|null
}
export interface MealTrainDates {
  id: string
  mealTrainId: string,
  date: Date,
  volunteerUserId: string | null,
  volunteerName: string,
  mealDescription: string,
  notes: string,
  reminderDays: 1 | 2 | 3,
  createdAt: Date
}
export interface ShabbatDataForFrontend {
  dateEnglish: string;
  dateHebrew: string;
  parasha: string;
  locations: LocationDataForFrontend[];
}
export interface connectionLocations {
  createdAt?: Date,
  accountIdA: string,
  locationIdA: string,
  accountIdB: string,
  locationIdB: string,
}
export interface MealTrainWithRole extends MealTrains {
  role: 'admin' | 'volunteer' | 'viewer' | 'adminVolunteer';
  progress?: {
    total_dates: number;
    booked_dates: number;
  };
}

export interface MealTrainResponse extends BaseResponse {
  success: boolean;
  data: MealTrains;
  error?: string;
}
export interface Location {
  id: string;
  name: string;
  address: string;
  location_type: 'home' | 'parents' | 'inlaws' | 'other';  // שים לב: location_type
}
export type SharedLocationConnection = {
  id: string;
  created_at: string;
  is_mutual: boolean;
  location_b: {
    id: string;
    name: string;
    address: string;
  };

  account_b: {
    id: string;
    name: string;
  };
};

export interface MealTrainWithDates extends MealTrains {
  meal_train_dates: MealTrainDates[];
}

export interface GetAccountNameResponse {
  success: boolean;
  data: string | [];
  error?: string;
}

export interface EventsUserResponse extends BaseResponse {
  success: boolean;
  data: {
    event: Event;
    role: string;
  }[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  error?: string;
}

export interface SharedMealTrainResponse {
  success: boolean;
  error?: string;
  data: {
    isAuthenticated: boolean;
  };
}
export interface MealTrainsResponse {
  success: boolean;
  data: MealTrains[];
  error?: string;
}

export interface JoinMealTrainResponse {
  success: boolean;
  data: MealTrainDates;
  error?: string;
}
export interface EmailListResponse extends BaseResponse {
  success: boolean;
  data: string[];
  error?: string;
}
export interface MealTrainDatesResponse extends BaseResponse {
  success: boolean;
  data: MealTrainDates[];
  error?: string;
}
export interface JoinMealTrainResponse {
  success: boolean;
  data: MealTrainDates;
  error?: string;
}
export interface EmailListResponse extends BaseResponse {
  success: boolean;
  data: string[];
  error?: string;
}
export interface MealTrainDatesResponse extends BaseResponse {
  success: boolean;
  data: MealTrainDates[];
  error?: string;
}
//# sourceMappingURL=types.d.ts.map
