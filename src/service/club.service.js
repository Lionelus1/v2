import api from "@/service/api";
import {getHeader, smartEnuApi} from "../config/config";

export class ClubService {

    getClubs(params) {
        return api.post( "/allClubs", params, {headers: getHeader()});
    }

    
}