import api from "./api";
import {getHeader, smartEnuApi} from "../config/config";

export class QueueService {
    allQueues(data) {
        return api.post("/queue/allQueues", data,  { headers: getHeader()});
    }

    getneigbors(data) {
        return api.post("/queue/getneigbors", data,  { headers: getHeader()});
    }
    callCustomer(data) {
        return api.post("/queue/callCustomer", data,  { headers: getHeader()});
    }
    statusChange(data) {
        return api.post("/queue/statusChange", data,  { headers: getHeader()});
    }
    delQueue(data) {
        return api.post("/queue/delQueue", data,  { headers: getHeader()});
    }
    save(data) {
        return api.post("/queue/save", data,  { headers: getHeader()});
    }
    queueReport(data) {
        return api.post("/queue/queueReport", data,  { headers: getHeader()});
    }
    registerService(data) {
        return api.post("/queue/registerService", data,  { headers: getHeader()});
    }
}