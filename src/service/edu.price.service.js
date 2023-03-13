import api from "@/service/api";
import {getHeader} from "@/config/config";

export class EduPriceService {

    getPrices(categoryId) {
        return api.post(`/web/getEduPrices`, {category_id: categoryId}, {headers: getHeader()})
    }

    addPrice(data) {
        return api.post(`/web/addEduPrice`, data, {headers: getHeader()});
    }

    getPriceById(id) {
        return api.get(`/web/getEduPriceById/${id}`, {headers: getHeader()});
    }

    editPrice(data) {
        return api.post(`/web/editEduPrice`, data, {headers: getHeader()});
    }

    deletePrice(id) {
        return api.post(`/web/deleteEduPrice`, {id: id}, {headers: getHeader()});
    }

    addPriceCategory(data) {
        return api.post(`/web/addEduPriceCategory`, data, {headers: getHeader()});
    }

    editPriceCategory(data) {
        return api.post(`/web/getEduPriceCategories`, data, {headers: getHeader()});
    }

    getPriceCategories(params) {
        return api.post(`/web/getEduPriceCategoriesAdmin`, params, {headers: getHeader()});
    }

    getPricesByCategoryId(id) {
        return api.post(`/web/getEduPriceById/${id}`, {headers: getHeader()});
    }
}