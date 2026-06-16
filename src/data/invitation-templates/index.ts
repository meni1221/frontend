import { EventTheme, TemplateKey } from '../types';

export const invitationDefaults: Record<EventTheme, Record<TemplateKey, string>> = {
  brit: {
    classic: 'בשמחה גדולה אנחנו מזמינים אתכם לחגוג איתנו את הברית של {eventName}. נשמח לראותכם איתנו ב-{venueName}.',
    warm: 'משפחה וחברים יקרים, הלב מתרחב ואנחנו נשמח שתהיו חלק מהרגע המרגש שלנו ב-{eventName}.',
    elegant: 'הנכם מוזמנים להשתתף בשמחתנו לרגל {eventName}. האירוע יתקיים ב-{venueName}.',
    casual: 'היי, נשמח שתגיעו לחגוג איתנו את {eventName}. יהיה מרגש, קרוב ומשמח.',
  },
  wedding: {
    classic: 'אנחנו מתרגשים להזמין אתכם לחגוג איתנו את {eventName} ב-{venueName}.',
    warm: 'אהובים שלנו, נשמח שתהיו איתנו ביום הגדול שלנו ותחגגו איתנו את {eventName}.',
    elegant: 'בהתרגשות רבה הנכם מוזמנים לחגוג עמנו את {eventName}.',
    casual: 'אנחנו מתחתנים, ואתם לגמרי צריכים להיות שם. {eventName}, {venueName}.',
  },
  bar_mitzvah: {
    classic: 'נשמח להזמין אתכם לחגיגת {eventName} שתתקיים ב-{venueName}.',
    warm: 'משפחה וחברים, נשמח שתבואו לשמוח איתנו ברגע מיוחד של {eventName}.',
    elegant: 'הנכם מוזמנים להשתתף בשמחתנו לרגל {eventName}.',
    casual: 'חוגגים {eventName}, ואתם מוזמנים להצטרף לשמחה.',
  },
  birthday: {
    classic: 'נשמח לחגוג איתכם את {eventName} ב-{venueName}.',
    warm: 'איזה כיף לחגוג יחד. נשמח לראות אתכם ב-{eventName}.',
    elegant: 'הנכם מוזמנים לחגיגת {eventName} שתיערך ב-{venueName}.',
    casual: 'יש חגיגה, יש מצב רוח, ואתם מוזמנים ל-{eventName}.',
  },
  corporate: {
    classic: 'אנו מזמינים אתכם להשתתף ב-{eventName} שיתקיים ב-{venueName}.',
    warm: 'נשמח לראותכם איתנו ב-{eventName}, מפגש מקצועי עם אנשים טובים ואווירה מצוינת.',
    elegant: 'הנכם מוזמנים לאירוע {eventName}. האירוע יתקיים ב-{venueName}.',
    casual: 'שמחים להזמין אתכם ל-{eventName}. נתראה ב-{venueName}.',
  },
};
