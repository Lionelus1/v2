import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class DocService {
    uploadRelatedDocs(data) {
        return api.post("/doc/uploadRelatedDocs", data, {headers: getFileHeader()});
    }
    getRelatedDocs(data) {
        return api.post("/doc/getRelatedDocs", data, {headers: getHeader()});
    }
}