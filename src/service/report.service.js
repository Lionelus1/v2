import api from './api';
import {getHeader} from "@/config/config";

export class ReportService {

    getReports(data) {
        return api.post("/report/get", data, {headers: getHeader()})
    }

    getHikvisions(data) {
        return api.post("/report/hikvision/get", data, {headers: getHeader()})
    }
    createReport(data) {
        return api.post("/report/create", data, {headers: getHeader()})
    }

}
