//shabbat.service
import { getUpcomingShabbatsFromCalendar } from './calendar.service';
import { supabase } from './database.service';
import moment from 'moment-timezone';
import { ShabbatDataForFrontend, LocationDataForFrontend } from '@eventix/shared';
import { getAccountIdByUserId } from '../services/users.service';

type SharedLocation = {
    id: string;
    created_at: string;
    location_b: {
        id: string;
        name: string;
        address: string;
    }[];

    account_b: {
        id: string;
        name: string;
    }[];
};
type ConnectionFull = {
    id: string;
    created_at: string;
    location_b: {
        id: string;
        name: string;
        address: string;
    } | null;
    account_b: {
        id: string;
        name: string;
    } | null;
};
export type SharedLocationConnection = {
    id: string;
    created_at: string;

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
function canSeePlan(
    myAccountId: string,
    myLocationId: string,
    planAccountId: string,
    planLocationId: string,
    locationConnections: any[]
): boolean {
    // אם זו תוכנית שלי — רואה תמיד
    if (planAccountId === myAccountId && planLocationId === myLocationId) return true;

    // 🔹 האם אני המשתף (אני account_a והוא account_b) ויש הדדיות
    const mutualConnectionFromMe = locationConnections.find(conn =>
        conn.account_a_id === myAccountId &&
        conn.location_a_id === myLocationId &&
        conn.account_b_id === planAccountId &&
        conn.location_b_id === planLocationId &&
        conn.is_mutual === true
    );

    if (mutualConnectionFromMe) return true;

    // 🔹 האם הצד השני שיתף אותי — רואה תמיד
    const connectionFromOther = locationConnections.find(conn =>
        conn.account_a_id === planAccountId &&
        conn.location_a_id === planLocationId &&
        conn.account_b_id === myAccountId &&
        conn.location_b_id === myLocationId
    );

    if (connectionFromOther) return true;

    return false;
}

export const shabbatService = {
    
    getAllUpcomingShabbats: async (
        userId: string,
        limit: number = 4,
        offset: number = 0
    ): Promise<ShabbatDataForFrontend[]> => {
        try {
            //שליפת מזהה החשבון מהפונקציה בuser.service
            const accountId = await getAccountIdByUserId(userId);
            if (!accountId) {
                console.warn(`User ${userId} not found or has no account_id.`);
                return []; // אם אין accountId, אין טעם להמשיך
            }
            // קבלת שבתות מהלוח
            const selectedShabbats = getUpcomingShabbatsFromCalendar(new Date(), limit, offset);
            if (selectedShabbats.length === 0) {
                return [];
            }
            // שליפת מיקומי המשתמש
            const { data: locationsData, error: locationsError } = await supabase
                .from('locations')
                .select('id, name, address, location_type')
                .eq('account_id', accountId);

            if (locationsError) {
                console.error('Error fetching locations:', locationsError.message);
                throw new Error('Failed to retrieve location data.');
            }
            const allUserLocations = locationsData || [];

            if (allUserLocations.length === 0) {
                return selectedShabbats.map(shabbat => ({
                    dateEnglish: shabbat.dateEnglish,
                    dateHebrew: shabbat.dateHebrew,
                    parasha: shabbat.parasha,
                    locations: []
                }));
            }
            const userLocationIds = allUserLocations.map(loc => loc.id);
            const shabbatDatesStrings = selectedShabbats.map(s => moment(s.date).format('YYYY-MM-DD'));

            if (userLocationIds.length === 0 || shabbatDatesStrings.length === 0) {
                return selectedShabbats.map(shabbat => ({
                    dateEnglish: shabbat.dateEnglish,
                    dateHebrew: shabbat.dateHebrew,
                    parasha: shabbat.parasha,
                    locations: []
                }));
            }
            // שליפת תוכניות (plans) לכל התאריכים הנבחרים, בלי לסנן לפי location_id
            const { data: plansData, error: plansError } = await supabase
                .from('plans')
                .select('id, location_id, date, status, account_id')
                .in('date', shabbatDatesStrings);

            if (plansError) {
                console.error('Error fetching plans:', plansError.message);
                throw new Error('Failed to retrieve plans data.');
            }
            const allRelevantPlans = plansData || [];

            // ➕ הוספת שליפת location_connections
            const { data: locationConnectionsData, error: locationConnectionsError } = await supabase
                .from('location_connections')
                .select('*');

            if (locationConnectionsError) {
                console.error('Error fetching location connections:', locationConnectionsError.message);
                throw new Error('Failed to retrieve location connection data.');
            }
            const locationConnections = locationConnectionsData || [];

            // שליפת שמות חשבונות למיפוי account_id => name
            const allAccountIdsInPlans = Array.from(new Set(allRelevantPlans.map(p => p.account_id)));
            let accountsMap: Map<string, string> = new Map();

            if (allAccountIdsInPlans.length > 0) {
                const { data: accountsNamesData, error: accountsNamesError } = await supabase
                    .from('accounts')
                    .select('id, name')
                    .in('id', allAccountIdsInPlans);

                if (accountsNamesError) {
                    console.error('Error fetching account names for plans:', accountsNamesError.message);
                } else {
                    accountsNamesData?.forEach(account => {
                        accountsMap.set(account.id, account.name);
                    });
                }
            }

            const finalShabbats: ShabbatDataForFrontend[] = [];

            for (const shabbat of selectedShabbats) {
                const currentShabbatDate = shabbat.date;
                const currentShabbatDateString = moment(currentShabbatDate).format('YYYY-MM-DD');

                const locationsForThisShabbat: LocationDataForFrontend[] = [];

                for (const userLocation of allUserLocations) {
                    const locationId = userLocation.id;

                    // סינון תוכניות לפי קשרים ב-location_connections
                    const plansForThisLocationAndShabbat = allRelevantPlans.filter(plan => {
                        const planDateStr = moment(plan.date).format('YYYY-MM-DD');
                        if (planDateStr !== currentShabbatDateString) return false;
                    
                        return canSeePlan(accountId, locationId, plan.account_id, plan.location_id, locationConnections);
                    });
                    
                    

                    // מציאת הסטטוס שלי (של המשתמש המחובר) באותו מיקום ושבת
                    let myStatusValue = '?';
                    const userPlanForThisShabbatAndLocation = allRelevantPlans.find(
                        p =>
                            p.account_id === accountId &&
                            p.location_id === locationId &&
                            moment(p.date).format('YYYY-MM-DD') === currentShabbatDateString
                    );
                    if (userPlanForThisShabbatAndLocation?.status) {
                        myStatusValue = userPlanForThisShabbatAndLocation.status;
                    }

                    if (userPlanForThisShabbatAndLocation?.status) {
                        myStatusValue = userPlanForThisShabbatAndLocation.status;
                    }

                    // peopleCount: ספירת אנשים רשומים למיקום ולשבת זו
                    const peopleCount = plansForThisLocationAndShabbat.length;

                    let confirmedCount = 0;
                    let pendingCount = 0;
                    const confirmedNames: string[] = [];
                    const pendingNames: string[] = [];

                    for (const plan of plansForThisLocationAndShabbat) {
                        const accountName = accountsMap.get(plan.account_id) || `חשבון ${plan.account_id.substring(0, 4)}`;
                        if (plan.status === 'going') {
                            confirmedCount++;
                            confirmedNames.push(accountName);
                        } else if (plan.status === 'tentative') {
                            pendingCount++;
                            pendingNames.push(accountName);
                        }
                    }
                    console.log('Location Connections:', locationConnections);

                    locationsForThisShabbat.push({
                        id: userLocation.id,
                        type: userLocation.location_type || 'home',
                        name: userLocation.name,
                        subtitle: userLocation.address,
                        // people: `${peopleCount} people`,
                        // myStatus: myStatusValue
                        myStatus: myStatusValue,
                        confirmedCount,
                        pendingCount,
                        confirmedNames,
                        pendingNames,
                    });
                }

                finalShabbats.push({
                    dateEnglish: shabbat.dateEnglish,
                    dateHebrew: shabbat.dateHebrew,
                    parasha: shabbat.parasha,
                    locations: locationsForThisShabbat,
                });
            }

            return finalShabbats;

        } catch (error) {
            console.error('Error in shabbatService.getAllUpcomingShabbats:', error);
            throw new Error('Failed to fetch upcoming shabbats due to a service error. Please try again later.');
        }
    },
    getSharedLocationsByUser: async (accountId: string) => {
        console.log(':mag: getSharedLocationsByUser called with accountId:', accountId);

        const { data, error } = await supabase
            .from('location_connections')
            .select(`
                id,
                created_at,
                is_mutual,
                location_b:location_b_id (
                  id,
                  name,
                  address
                ),
                account_b:account_b_id (
                  id,
                  name
                )
            `)
            .or(`account_a_id.eq.${accountId},and(account_b_id.eq.${accountId},is_mutual.eq.true)`);

        if (error)
            throw new Error(error.message);

        console.log(':white_check_mark: getSharedLocationsByUser result data:', data);
        return data;
    },


    deleteLocationShare: async (accountAId: string, accountBId: string) => {
        const { error } = await supabase
            .from('location_connections')
            .delete()
            .eq('account_a_id', accountAId)
            .eq('account_b_id', accountBId);

        if (error)
            throw new Error(error.message);
    },


    //מחזירה למשתמש את כל המיקומים האישיים שלו לשבת מסוימת
    //   כולל הסטטוס האישי שלו בכל מיקום
    //   ואת רשימת החברים שהולכים או מתלבטים (maybe) לגבי כל מיקום
    // לשבת הזו Away מחזירה גם האם המשתמש סימן שהוא  
    getShabbatDecisionData: async (accountId: string, date: string) => {
        try {
            //  שלב 1: שליפת כל המיקומים של המשתמש כולל כתובת
            const { data: locationsData, error: locationsError } = await supabase
                .from('locations')
                .select('id, name, location_type, address')
                .eq('account_id', accountId);

            if (locationsError) {
                console.error('Error fetching locations:', locationsError.message);
                throw new Error('Failed to retrieve locations.');
            }

            const locations = locationsData || [];

            //  שלב 2: שליפת הקשרים של המשתמש
            const { data: connectionsData, error: connectionsError } = await supabase
                .from('location_connections')
                .select('account_b_id')
                .eq('account_a_id', accountId);

            if (connectionsError) {
                console.error('Error fetching connections:', connectionsError.message);
                throw new Error('Failed to retrieve connections.');
            }
            // יוצר מערך של כל מזהי החברים מהתוצאות
            const connectionAccountIds = (connectionsData || []).map(
                (conn: { account_b_id: string }) => conn.account_b_id
            );

            //  שלב 2.5: שליפת השמות של הקשרים

            // יוצר מפה ריקה לאחסון מזהה => שם
            let accountNamesMap = new Map<string, string>();
            if (connectionAccountIds.length > 0) {
                const { data: accountsData, error: accountsError } = await supabase
                    .from('accounts')
                    .select('id, name')
                    .in('id', connectionAccountIds);

                if (accountsError) {
                    console.error('Error fetching account names:', accountsError.message);
                    throw new Error('Failed to retrieve account names.');
                }

                accountNamesMap = new Map<string, string>(
                    (accountsData || []).map((a: { id: string; name: string }) => [
                        a.id,
                        a.name,
                    ])
                );
            }

            //  שלב 3: שליפת התכניות
            const { data: plansData, error: plansError } = await supabase
                .from('plans')
                .select('account_id, location_id, status')
                .eq('date', date)
                .in('account_id', [accountId, ...connectionAccountIds]);

            if (plansError) {
                console.error('Error fetching plans:', plansError.message);
                throw new Error('Failed to retrieve plans.');
            }

            const plans = plansData || [];

            //  שלב 4: בניית התוצאה
            const result = {
                date,
                locations: [] as {
                    id: string;
                    name: string;
                    type: string;
                    subtitle: string;
                    status: string | null;
                    confirmed: string[];
                    maybe: string[];
                }[],
                away: false,
            };

            //  שלב 5: עבור כל מיקום – חיבור סטטוס אישי ורשימת קשרים
            for (const location of locations) {
                const locationId = location.id;

                const myPlan = plans.find(
                    (p) => p.account_id === accountId && p.location_id === locationId
                );
                const status = myPlan?.status || null;

                const confirmed = plans
                    .filter(
                        (p) =>
                            p.location_id === locationId &&
                            p.account_id !== accountId &&
                            p.status === 'going'
                    )
                    .map(
                        (p) =>
                            accountNamesMap.get(p.account_id) ||
                            `Account ${p.account_id}`
                    );

                const maybe = plans
                    .filter(
                        (p) =>
                            p.location_id === locationId &&
                            p.account_id !== accountId &&
                            p.status === 'maybe'
                    )
                    .map(
                        (p) =>
                            accountNamesMap.get(p.account_id) ||
                            `Account ${p.account_id}`
                    );

                result.locations.push({
                    id: locationId,
                    name: location.name,
                    type: location.location_type || 'home',
                    subtitle: location.address || '',
                    status,
                    confirmed,
                    maybe,
                });
            }

            // "away" שלב 6: בדיקה אם המשתמש סימן שהוא 
            const isaway = plans.some(
                (p) => p.account_id === accountId && p.status === 'away'
            );
            result.away = isaway;

            //  שלב 7: החזרת התוצאה
            return result;
        } catch (error) {
            console.error('Error in shabbatService.getShabbatDecisionData:', error);
            throw new Error('Failed to fetch Shabbat decision data.');
        }
    },
    /**
     * שומר את החלטת השבת של המשתמש עבור תאריך מסוים.
     * 
     * אם הסטטוס 'going' או 'away' — מוחק תכנונים קודמים של 'going' או 'away' בלבד לאותו יום
     * ואז מוסיף תכנון חדש.
     * 
     * אם הסטטוס 'maybe' — מוסיף תכנון חדש בלי למחוק אחרים.
     * 
     * @param accountId מזהה המשתמש
     * @param date תאריך השבת
     * @param locationId מזהה המיקום (אם נדרש)
     * @param status סטטוס ההחלטה
     */
    savePlan: async (
        accountId: string,
        date: string,
        locationId: string | null,
        status: "going" | "away" | "maybe" | "tentative"
    ): Promise<{ success: boolean; status: number; data?: any; message?: string }> => {

        const fixedDateStr = date.replace(/,(\S)/, ', $1');
        const planDateMoment = moment(fixedDateStr, 'MMMM D, YYYY', true);
        if (!planDateMoment.isValid() || planDateMoment.isBefore(moment(), 'day')) {
            return { success: false, status: 400, message: 'Invalid or past date' };
        }

        const formattedDate = planDateMoment.format('YYYY-MM-DD');

        if (!['going', 'maybe', 'away', 'tentative'].includes(status)) {
            return { success: false, status: 400, message: 'Invalid status' };
        }

        if (status !== 'away' && !locationId) {
            return { success: false, status: 400, message: 'locationId is required' };
        }

        if (locationId) {
            const { data: locationData, error: locationError } = await supabase
                .from('locations')
                .select('id, account_id')
                .eq('id', locationId)
                .single();

            if (locationError || !locationData || locationData.account_id !== accountId) {
                return { success: false, status: 403, message: 'Invalid locationId' };
            }
        }

        if (status === 'going' || status === 'away') {
            // מוחק הכל
            const { error: deleteError } = await supabase
                .from('plans')
                .delete()
                .eq('account_id', accountId)
                .eq('date', formattedDate);

            if (deleteError) {
                return { success: false, status: 500, message: 'Failed to clear previous plans' };
            }
        }

        if (status === 'maybe' || status === 'tentative') {
            // מוחק רק תכנונים סותרים: going, away, tentative — אבל לא maybe
            const { error: deleteConflict } = await supabase
                .from('plans')
                .delete()
                .eq('account_id', accountId)
                .eq('date', formattedDate)
                .in('status', ['going', 'away',]);

            if (deleteConflict) {
                return { success: false, status: 500, message: 'Failed to clear conflicting plans for maybe' };
            }
        }

        const { data: insertedData, error: insertError } = await supabase
            .from('plans')
            .insert({
                account_id: accountId,
                location_id: locationId,
                date: formattedDate,
                status,
                created_at: new Date().toISOString()
            })
            .select();

        if (insertError) {
            return { success: false, status: 500, message: 'Failed to save plan' };
        }

        return { success: true, status: 201, data: insertedData };
    }

}


