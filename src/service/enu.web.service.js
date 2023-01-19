import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class EnuWebService {
    getAllMenus() {
        return axios.get(smartEnuApi + "/web/getMenus", {headers: getHeader()});
        
    }

    addMenu(data){
        return axios.post(smartEnuApi + "/web/addMenu", data, {headers: getHeader()});
    }

    editMenu(data){
        return axios.post(smartEnuApi + "/web/editMenu", data, {headers: getHeader()});
    }

    getAllPages(){
        return axios.get(smartEnuApi + "/web/getPages", {headers: getHeader()});
    }

    addPage(data){
        return axios.post(smartEnuApi + "/web/addPage", data, {headers: getHeader()})
    }

    editPage(editData){
        return axios.post(smartEnuApi + "/web/editPage", editData, {headers: getHeader()})
    }







}

//const baseURL = "http://localhost:8090/getAllMenus"
//return axios.post(smartEnuApi + "/getAllMenus", data, {headers: getHeader()});