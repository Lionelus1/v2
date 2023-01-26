import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";
import api from "@/service/api";

export class EnuWebService {
    getAllMenus() {
        return api.get("/web/getMenus", {headers: getHeader()});
        
    }

    addMenu(data){
        return api.post("/web/addMenu", data, {headers: getHeader()});
    }

    editMenu(data){
        return api.post("/web/editMenu", data, {headers: getHeader()});
    }

    getAllPages(){
        return api.get("/web/getPages", {headers: getHeader()});
    }

    addPage(data){
        return api.post("/web/addPage", data, {headers: getHeader()})
    }

    editPage(editData){
        return api.post("/web/editPage", editData, {headers: getHeader()})
    }

    getMenusTree(data) {
        return api.post('/web/getMenusTree', data, {headers: getHeader()});
    }

    deletePage(id) {
        return api.post(`/web/deletePage/${id}`, {}, {headers: getHeader()});
    }

}