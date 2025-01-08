import api from './api';
import {getHeader} from "@/config/config";

export class ReportService {

    getReports(data) {
        return api.post("/report/get", data, {headers: getHeader()})
    }

    getReportsByCatID(data) {
        return api.post("/report/getReportsByCatID", data, {headers: getHeader()})
    }

    getHikvisions(data) {
        return api.post("/report/hikvision/get", data, {headers: getHeader()})
    }
    createReport(data) {
        return api.post("/report/create", data, {headers: getHeader()})
    }
    deleteReport(data) {
        return api.post("/report/delete", data, {headers: getHeader()})
    }
    generateReport(data) {
        return api.post("/report/generateReport", data, {headers: getHeader()})
    }
    getReportData(data) {
        return api.post("/report/getReportData", data, {headers: getHeader()})
    }
    saveReport(data) {
        return api.post("/report/saveReport", data, {headers: getHeader()})
    }
}
