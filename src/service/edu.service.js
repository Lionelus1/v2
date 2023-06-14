import api from "@/service/api";
import {getHeader} from "@/config/config";

export class EduService {

    getEduFields() {
        return api.post(`/web/getEduFieldClassifications`, {}, {headers: getHeader()})
    }
    getEduTrainingDirectionsByFieldId(fieldID){
        return api.post(`/web/getDirectionByFieldID`, {field_id: fieldID}, {headers: getHeader()})
    }
    getEduProgramGroupsByDirectionId(directionID){
        return api.post(`/web/getEduProgramsByDirectionIdAdmin`, {direction_id: directionID}, {headers: getHeader()})
    }

}