import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class ClubService {

    getClubs(params) {
        return axios.post(smartEnuApi + "/allClubs", params, {headers: getHeader()});
    }

    
}