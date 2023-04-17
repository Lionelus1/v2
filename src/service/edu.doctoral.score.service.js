import api from "@/service/api";
import {getHeader} from "@/config/config";

export class EduDoctoralScoreService {

  
    getDoctoralScoreCategories(params){
        return api.post(`/web/getEduDoctoralPassingScoreCategories`, params, {headers: getHeader()});
    }
    getDoctoralExams(params){
        return api.post(`/web/getEduDoctoralExams`, params, {headers: getHeader()});
    }
    getEduDoctoralScoresByCategoryId(categoryId){
        return api.post(`/web/getDoctoralProgramByScoreCategoryID`, {score_category_id: categoryId}, {headers: getHeader()})
    }

}