import * as imageResizeCompress from "image-resize-compress";

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