import api from "@/service/api";
import {getHeader} from "@/config/config";

export class EduService {

    getEduFields() {
        return api.post(`/web/getEduFieldClassifications`, {}, {headers: getHeader()})
    }

}