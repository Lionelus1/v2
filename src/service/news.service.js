import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class NewsService {

    getNews(params) {
        return axios.post(smartEnuApi + "/allNews", params, {headers: getHeader()});
    }

    addNews(data) {
        return axios.post(smartEnuApi + "/addNews", data, {headers: getHeader()});
    }

    sendNews(id, userId) {
        return axios.post(smartEnuApi + "/send", {id: id, userId: userId}, {headers: getHeader()});
    }

    publishNews(id, userId) {
        return axios.post(smartEnuApi + "/publish", {id: id, userId: userId}, {headers: getHeader()});
    }

    rejectNews(data) {
        return axios.post(smartEnuApi + "/reject", data, {headers: getHeader()});
    }

    getRoles() {
        return axios.get(smartEnuApi + "/getroles", {headers: getHeader()});
    }

    deleteNews(id) {
        return axios.post(smartEnuApi + "/delNews",{id: id,},{headers: getHeader()});
    }

    getCategories() {
        return axios.get(smartEnuApi + "/allCategories", {headers: getHeader()});
    }
}