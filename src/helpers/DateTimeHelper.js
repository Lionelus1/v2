class DateTimeHelper {
    static qazaqMonths = [
        'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
        'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
    ];

    static russianMonths = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    static getQazaqMonth(date) {
        const monthIndex = date.getMonth();
        return this.qazaqMonths[monthIndex];
    }
    static getRussianMonth(date) {
        const monthIndex = date.getMonth();
        return this.russianMonths[monthIndex];
    }

    static getEnglishMonth(date) {
        return date.toLocaleString('en-US', { month: 'long' });
    }

    static getMonthNames(dateString, lang) {
        const date = new Date(dateString);
        switch (lang) {
            case 'kz':
                return this.getQazaqMonth(date);
            case 'ru':
                return this.getRussianMonth(date);
            case 'en':
                return this.getEnglishMonth(date);
            default:
                return '';
        }
    }

    static getFormattedDate(dateString, lang) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = this.getMonthNames(dateString, lang);

        return `${month} ${day}, ${year}`;
    }
}
export default DateTimeHelper;