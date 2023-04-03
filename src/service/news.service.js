import api from "./api";
import {getHeader, smartEnuApi} from "../config/config";

export class NewsService {

    getNews(params) {
        return api.post("/allNews", params, {headers: getHeader()});
    }

    addNews(data) {
        return api.post("/addNews", data, {headers: getHeader()});
    }

    sendNews(id, userId) {
        return api.post("/send", {id: id, userId: userId}, {headers: getHeader()});
    }

    publishNews(id, userId) {
        return api.post("/publish", {id: id, userId: userId}, {headers: getHeader()});
    }

    rejectNews(data) {
        return api.post("/reject", data, {headers: getHeader()});
    }

    getRoles() {
        return api.get("/getroles", {headers: getHeader()});
    }

    deleteNews(id) {
        return api.post("/delNews",{id: id,},{headers: getHeader()});
    }

    getCategories() {
        return api.get("/allCategories", {headers: getHeader()});
    }

    deleteNewsFile(id) {
        return api.post(`/deleteNewsFile`, {id: id}, {headers: getHeader()});
    }
}