import api from "@/service/api";
import {getHeader} from "@/config/config";

export class EduScoreService {

    getScoreCategories(params){
        return api.post(`/web/getEduPassingScoreCategories`, params, {headers: getHeader()});
    }

    getDoctoralScoreCategories(params){
        return api.post(`/web/getEduDoctoralPassingScoreCategories`, params, {headers: getHeader()});
    }

    getScoreCategoryById(id){
        return api.get(`/web/getEduPassingScoreCategoryById/${id}`, {headers: getHeader()});
    }

    getScoreCategoryByDegreeType(degreeType){
        return api.post(`/web/getEduPassingScoreCategoriesByDegree`, {degree_type: degreeType}, {headers: getHeader()})
    }

    addScoreCategory(data){
        return api.post(`/web/addPassingScoreCaregory`, data, {headers: getHeader()});
    }

    editScoreCategory(data) {
        return api.post(`/web/editPassingScoreCategory`, data, {headers: getHeader()});
    }

    deleteScoreCategory(id) {
        return api.post(`/web/deletePassingScoreCategory`, {id: id}, {headers: getHeader()});
    }
    getEduScoreBlock() {
        return api.post(`/web/getEduScoreListBlockPlugin`, {}, {headers: getHeader()});
    }
    getEduScoresByCategoryId(categoryId){
        return api.post(`/web/getEduProgramsScoreByCategoryID`, {score_category_id: categoryId}, {headers: getHeader()})
    }
    addScore(data){
        return api.post(`/web/addPassingScore`, data, {headers: getHeader()});
    }
    editScore(data){
        return api.post(`/web/editPassingScore`, data, {headers: getHeader()});
    }
    deleteScore(id){
        return api.post(`/web/deletePassingScore`, {id: id}, {headers: getHeader()});
    }

}