import api from "@/service/api";
import {getHeader} from "@/config/config";

export class ApprovalListService {
    getDefault(data) {
        return api.post("/approvalList/getDefault", data, {headers: getHeader()});
    }

    approvalListGet() {
        return api.get("/approvalList/get", {headers: getHeader()});
    }

    defaultUsers(data) {
        return api.post("/approvalList/defaultUsers", data, {headers: getHeader()});
    }

    create(data) {
        return api.post("/approvalList/create", data, {headers: getHeader()});
    }

    update(data) {
        return api.post("/approvalList/update", data, {headers: getHeader()});
    }
}