import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class EnuWebService {
  
    getAllMenus(data) {
        //const baseURL = "http://localhost:8090/getAllMenus"
        //return axios.post(smartEnuApi + "/getAllMenus", data, {headers: getHeader()});
        return axios.post("http://localhost:8090" + "/getAllMenus", data, {headers: getHeader()});
        
    }
    getAllPages(data){
        return axios.post("http://localhost:8090" + "/getAllPages", data, {headers: getHeader()});
    }

}