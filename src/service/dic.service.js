import api from "./api";
import {getHeader} from "@/config/config";

export class DicService {
    setPracticeManager(data) {
        return api.post("/dic/setPracticeManager", data, { headers: getHeader()});
    }
    getPracticeResponsibles() {
        return api.get("/dic/getPracticeResponsibles", { headers: getHeader()});
    }
    getPracticeManagers(data) {
        return api.post("/dic/getPracticeManagers", data, { headers: getHeader()});
    }
    updatePracticeResponsible(data) {
        return api.post("/dic/updatePracticeResponsible", data, { headers: getHeader()});
    }
    getDictionary(data) {
        return api.post("/auth/getDictionary", data, { headers: getHeader()});
    }
    getLanguages() {
        return api.get("/languages", { headers: getHeader()});
    }

    getSpecialities() {
        return api.get("/specialities", { headers: getHeader()});
    }
    getInstitutions() {
        return api.get("/institutions", { headers: getHeader()});
    }

    knowledgeLevels(data) {
        return api.post("/auth/getDictionary", data, { headers: getHeader()});
    }

    getspecialities(data, cancelToken) {
        return api.post("/getspecialities", data, { headers: getHeader(), cancelToken: cancelToken});
    }
}