import api from "./api";
import {getHeader} from "@/config/config";

export class OnlineCourseService {
    saveSertificateTemplate(data) {
        return api.post('/sertificate/update', data, {headers: getHeader()});
    }
    getSertificateTemplateJournal(data) {
        return api.post('/sertificate/journal', data, {headers:getHeader()});
    }
}