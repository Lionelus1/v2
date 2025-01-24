import * as imageResizeCompress from "image-resize-compress";
import moment from "moment/moment";
import {FileService} from "@/service/file.service";
import {fileRoute, smartEnuApi} from "@/config/config";

export function upFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export async function resizeImages(content) {
    let el = document.createElement('div');
    el.innerHTML = content;
    for (let i = 0; i < el.getElementsByTagName('img').length; i++) {
        await imageResizeCompress.fromURL(el.getElementsByTagName('img')[i].src, 90, 720, "auto", "jpeg")
            .then(async (res) => {
                await imageResizeCompress.blobToURL(res).then((result) => {
                    el.getElementsByTagName('img')[i].src = result;
                    if (i === el.getElementsByTagName('img').length - 1) {
                        content = el.innerHTML;
                    }
                }).catch(_ => {});
            }).catch(_ => {});
    }
    return content;
}

export function formatDate(date) {
    return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm")
}

export function generateYears(startYear = 1979) {
    let years = [];
    let max = new Date().getFullYear();
    for (let i = max; i >= startYear; i--) {
        years.push(i);
    }
    return years;
}

export function uploadSingFile(blobInfo, success, failure) {
    const fd = new FormData();
    fd.append("files[]", blobInfo.blob(), blobInfo.filename());
    new FileService().uploadFile(fd).then(res => {
        if (res.data) {
            res.data.map(e => {
                e.filePath = smartEnuApi + fileRoute + e.filepath;
            });
            success(res.data[0].filePath)
        }
    }).catch(error => {
        failure(error)
    });
}


export function isMobile() {
    /* eslint-disable */
    let check = false;
    (function(a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}
export function timeDifference(givenDate) {
    const now = moment()
    const given = moment(givenDate);
    moment.locale('smartEnu', {
        relativeTime: {
            future: this.$i18n.locale === "kz" ? "" : this.$i18n.locale === "en" ? "in %s" : "",
            past: this.$i18n.locale === "kz" ? "%s бұрын" : this.$i18n.locale === "en" ? "%s ago" : "%s назад",
            ss: this.$i18n.locale === "kz" ? "бірнеше секунд бұрын" : this.$i18n.locale === "en" ? "few seconds ago" : "несколько секунд назад",
            m: this.$i18n.locale === "kz" ? "минут бұрын" : this.$i18n.locale === "en" ? "a minute" : "минут назад",
            mm: this.$i18n.locale === "kz" ? "%d минут бұрын" : this.$i18n.locale === "en" ? "%d minutes" : "%d минут назад",
            h: this.$i18n.locale === "kz" ? "бір сағат бұрын" : this.$i18n.locale === "en" ? "an hour" : "час назад",
            hh: this.$i18n.locale === "kz" ? "%d сағат бұрын" : this.$i18n.locale === "en" ? "%d hours" : "%d час. назад",
            d: this.$i18n.locale === "kz" ? "бір күн бұрын" : this.$i18n.locale === "en" ? "a day" : "день назад",
            dd: this.$i18n.locale === "kz" ? "%d күн бұрын" : this.$i18n.locale === "en" ? "%d days" : "%d дн. назад",
            w: this.$i18n.locale === "kz" ? "бір апта бұрын" : this.$i18n.locale === "en" ? "a week" : "неделю назад",
            ww: this.$i18n.locale === "kz" ? "%d апта бұрын" : this.$i18n.locale === "en" ? "%d weeks" : "%d нед.",
            M: this.$i18n.locale === "kz" ? "бір ай бұрын" : this.$i18n.locale === "en" ? "a month" : "месяц назад",
            MM: this.$i18n.locale === "kz" ? "%d ай бұрын" : this.$i18n.locale === "en" ? "%d months" : "%d мес. назад",
            y: this.$i18n.locale === "kz" ? "бір жыл бұрын" : this.$i18n.locale === "en" ? "a year" : "год назад",
            yy: this.$i18n.locale === "kz" ? "%d жыл бұрын" : this.$i18n.locale === "en" ? "%d years" : "%d год. назад",
        }
    });
    return moment.duration(given.diff(now)).humanize();
}
