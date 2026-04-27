import { HDate, HebrewCalendar } from '@hebcal/core';
import gematriya from 'gematriya';
import moment from 'moment-timezone';

export interface ShabbatCalendarEntry {
    date: Date;
    dateEnglish: string;
    dateHebrew: string;
    parasha: string;
}

/**
 * פונקציה לשליפת נתוני שבתות קרובות מלוח השנה העברי.
 * משתמשת בספריית @hebcal/core כדי לחשב פרשות ותאריכים עבריים.
 *
 * @param startDate התאריך שממנו נתחיל לחפש את השבתות (בדרך כלל התאריך הנוכחי).
 * @param numShabbats מספר השבתות העתידיות שנרצה לשלוף.
 * @returns מערך של אובייקטים מסוג ShabbatCalendarEntry.
 */
// export const getUpcomingShabbatsFromCalendar = (startDate: Date, numShabbats: number = 8): ShabbatCalendarEntry[] => {
export const getUpcomingShabbatsFromCalendar = (startDate: Date, numShabbats: number = 8, offset: number = 0): ShabbatCalendarEntry[] => {
    const shabbats: ShabbatCalendarEntry[] = [];
    let currentDate = moment(startDate).tz('Asia/Jerusalem');


    if (currentDate.day() !== 6) {
        currentDate = currentDate.day(6);
    }

    if (currentDate.isBefore(moment(startDate).tz('Asia/Jerusalem').startOf('day'))) {
        currentDate = currentDate.add(7, 'days');
    }
    for (let j = 0; j < offset; j++) {
        currentDate = currentDate.add(7, 'days'); // קדם את התאריך בשבוע לכל דילוג
    }
    //מיפוי לפרשות מחוברות
    const combinedParashaMap: { [key: string]: string } = {
        "Tazria-Metzora": "תזריע-מצורע",
        "Acharei Mot-Kedoshim": "אחרי מות-קדושים",
        "Behar-Bechukotai": "בהר-בחוקותי",
        "Chukat-Balak": "חוקת-בלק",
        "Matot-Masei": "מטות-מסעי",
        "Nitzavim-Vayelech": "ניצבים-וילך",
        "Vayakhel-Pekudei": "ויקהל-פקודי",
    };

    for (let i = 0; shabbats.length < numShabbats; i++) {
        while (currentDate.day() !== 6) {
            currentDate.add(1, 'day');
        }

        const hdate = new HDate(currentDate.toDate());


        // קבלת פרשה בעברית
        const events = HebrewCalendar.calendar({
            start: currentDate.toDate(),
            end: currentDate.toDate(),
            sedrot: true // לוודא שפרשות נכללות
        });

        let parashaName = 'אין פרשה';
        const parashaEvent = events.find((evItem: any) => {
            const desc = typeof evItem.getDesc === 'function' ? evItem.getDesc() : evItem.desc;


            const isParashatCategory = evItem.getCategory && evItem.getCategory() === 'parashat';
            const isParashatDesc = desc && desc.includes('Parashat');

            return isParashatCategory || isParashatDesc;
        });
        if (parashaEvent) {
            let tempParashaName = 'אין פרשה';
            try {
                if (parashaEvent.render && typeof parashaEvent.render === 'function') {
                    tempParashaName = parashaEvent.render('he');
                } else {
                    tempParashaName = typeof parashaEvent.getDesc === 'function' ? parashaEvent.getDesc() : parashaEvent.desc;
                    tempParashaName = tempParashaName.replace(/פרשת\s*/g, '').replace(/Parashat\s*/i, '').trim();
                }

                // אם התוצאה עדיין נראית כמו שם לועזי של פרשה מחוברת, נשתמש במיפוי
                if (combinedParashaMap[tempParashaName]) {
                    parashaName = combinedParashaMap[tempParashaName];
                } else {
                    parashaName = tempParashaName;
                }

            } catch (e: any) {
                console.error("Failed to render parasha in Hebrew using locale, falling back to description. Error:", e ? e.message || e : 'Unknown error');
                tempParashaName = typeof parashaEvent.getDesc === 'function' ? parashaEvent.getDesc() : parashaEvent.desc;
                const cleanedEnglishParasha = tempParashaName.replace(/פרשת\s*/g, '').replace(/Parashat\s*/i, '').trim();

                parashaName = combinedParashaMap[cleanedEnglishParasha] || cleanedEnglishParasha;
            }
        }

        // שימוש בספריית הגימטריה לתאריך
        let hebDateString: string;
        try {
            const dayNum = hdate.getDate();
            const dayPart = gematriya(dayNum);
            const englishMonthName = hdate.getMonthName();
            const hebrewMonthsMap: { [key: string]: string } = {
                "Nisan": "ניסן", "Iyyar": "אייר", "Sivan": "סיון", "Tamuz": "תמוז",
                "Av": "אב", "Elul": "אלול", "Tishrei": "תשרי", "Cheshvan": "מרחשון",
                "Kislev": "כסלו", "Tevet": "טבת", "Shevat": "שבט", "Adar": "אדר",
                "Adar I": "אדר א", "Adar II": "אדר ב"
            };
            const monthPart = hebrewMonthsMap[englishMonthName] || englishMonthName;
            const yearNum = hdate.getFullYear();
            let hebrewYearLetters = gematriya(yearNum % 1000, { limit: 3 });
            if (yearNum >= 5000 && !hebrewYearLetters.startsWith('ה')) {
                hebrewYearLetters = "ה'" + hebrewYearLetters;
            }
            hebrewYearLetters = hebrewYearLetters.replace(/""/g, '"');
            hebDateString = `${dayPart} ${monthPart} ${hebrewYearLetters}`;

        } catch (e: any) {
            console.error("Failed to format Hebrew date with gematriya, falling back to basic toString(). Error:", e ? e.message || e : 'Unknown error');
            hebDateString = hdate.toString();
        }

        shabbats.push({
            date: currentDate.toDate(),
            dateEnglish: currentDate.format('MMMM D,YYYY'),
            dateHebrew: hebDateString,
            parasha: parashaName
        });
        currentDate.add(7, 'days');
    }
    return shabbats;
};