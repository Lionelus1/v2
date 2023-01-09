import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class EnuWebService {
  
    getAllMenus() {
        return axios.get(smartEnuApi + "/enuwebsite");
    }


    
}