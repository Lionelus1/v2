import api from "@/service/api";
import {getHeader, smartEnuApi} from "../config/config";

export class ClubService {

    getClubs(params) {
        return api.post(smartEnuApi + "/allClubs", params, {headers: getHeader()});
    }

    
}