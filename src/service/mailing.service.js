import api from "./api";
import {getHeader, smartEnuApi} from "../config/config";


export class MailingService {

    getMailing(params) {
        return api.post("/mailing", params, {headers: getHeader()});
    }
}
