import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class ManualService {
    manualSave(data) {
        return api.post("/manual/save", data, {headers: getHeader()});
    }

    getManuals(data) {
        return api.post("/manual/getManuals", data, {headers: getHeader()});
    }

    getContent(data) {
        return api.post("/manual/getContent", data, {headers: getHeader()});
    }

    delManual(data) {
        return api.post("/manual/delManual", data, {headers: getHeader()});
    }
}