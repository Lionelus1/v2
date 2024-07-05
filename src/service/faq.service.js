import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class FaqService {
    forwardFaq(data) {
        return api.post("/faq/forwardFaq", data, {headers: getFileHeader()});
    }

    getAllFaq(data) {
        return api.post("/faq/getAllFaq", data, {headers: getFileHeader()});
    }
    getDepartmentList() {
        return api.get("/faq/getDepartmentList", {headers: getFileHeader()});
    }
    addFaqRequest(data) {
        return api.post("/faq/addFaqRequest", data, {headers: getFileHeader()});
    }

    downloadFile(data) {
        return api.post("/faq/downloadFile", data, {headers: getFileHeader()});
    }
    addAnswer(data) {
        return api.post("/faq/addAnswer", data, {headers: getFileHeader()});
    }
    getById(data) {
        return api.post("/faq/getById", data, {headers: getFileHeader()});
    }
}