import moment from "moment/moment";

export function getShortDateString(date) {
    if (!date) {
        return ""
    }

    return moment(new Date(date)).utc().format("DD.MM.YYYY")
}

export function getLongDateString(date) {
    if (!date) {
        return ""
    }
    
    return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm")
}

export function isMobile() {
    return window.innerWidth <= 768;
}