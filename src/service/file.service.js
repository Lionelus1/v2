import api from "@/service/api";
import {getHeader} from "@/config/config";

export class FileService {

    uploadFile(data) {
        return api.post("/upload", data, {headers: getHeader(), transformRequest: data});
    }

    webUploadFile(data) {
        return api.post("/webFileUpload", data, {headers: getHeader()});
    }

    getFile(params) {
        return api.post(`/getFile`, params, {headers: getHeader()});
    }

}
