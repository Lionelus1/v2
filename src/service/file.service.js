import api from "@/service/api";
import {getHeader} from "@/config/config";

export class FileService {

    uploadFile(data) {
        return api.post("/upload", data, {headers: getHeader()});
    }

}