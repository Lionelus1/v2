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
                }).catch(error => {
                    console.log("to url error", error)
                });
            }).catch(error => {
                console.log("from url error", error)
            });
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
    fd.append("files", blobInfo.blob(), blobInfo.filename());
    new FileService().uploadFile(fd).then(res => {
        if (res.data) {
            res.data.map(e => {
                e.filePath = smartEnuApi + fileRoute + e.filePath;
            });
            success(res.data[0].filePath)
        }
    }).catch(error => {
        failure(error)
    });
}
