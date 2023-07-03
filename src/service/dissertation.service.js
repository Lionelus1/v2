import api from "@/service/api";
import {getHeader} from "@/config/config";

export class DissertationService {

    getMemberCouncils(userId) {
        return api.post(`/dissertation/getMemberCouncils`, {user_id: userId}, {headers: getHeader()})
    }

}