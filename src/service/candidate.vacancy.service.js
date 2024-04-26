import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class CandidateVacancyService {
    getVacancies(data) {
        return api.post("/vacancy/user", data, {headers: getHeader()});
    }

    getPetition(data) {
        return api.post("/vacancy/petition", data, {headers: getHeader()}); 
    }
}