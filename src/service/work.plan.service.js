import axios from "axios";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";

export class WorkPlanService {

    getEventsTree(lazyParams) {
        return axios.post(smartEnuApi + `/workPlan/getEventsTree`, lazyParams, {headers: getHeader()});
    }

    getWorkPlanApprovalUsers(work_plan_id) {
        return axios.get(smartEnuApi + `/workPlan/getApprovalUsers/${work_plan_id}`);
    }

    getPlanById(planId) {
        return axios.get(smartEnuApi + `/workPlan/getWorkPlanById/${planId}`, {headers: getHeader()});
    }

    finishEvent(planId) {
        return axios.post(smartEnuApi + '/workPlan/finishEvent', {work_plan_id: parseInt(planId)}, {headers: getHeader()});
    }

    removeEvent(eventId) {
        return axios.post(smartEnuApi + `/workPlan/removeEvent/${eventId}`, {}, {headers: getHeader()})
    }

    getWorkPlanData(data) {
        return axios.post(smartEnuApi + `/workPlan/getWorkPlanReportData`, data, {headers: getHeader()});
    }

    getPlans(searchText) {
        return axios.post(smartEnuApi + `/workPlan/getPlans`, {search_text: searchText}, {headers: getHeader()});
    }

    rejectPlan(data) {
        return axios.post(smartEnuApi + `/workPlan/reject`, data, {headers: getHeader()});
    }

    deletePlan(planId) {
        return axios.post(smartEnuApi + `/workPlan/deletePlan/${event.work_plan_id}`, null, {headers: getHeader()});
    }

    createPlan(planName, lang, isOper) {
        return axios.post(smartEnuApi + `/workPlan/addPlan`, {work_plan_name: planName, lang: lang, is_oper: isOper}, {headers: getHeader()});
    }

    savePlanFile(fd) {
        return axios.post(smartEnuApi + `/workPlan/savePlanFile`, fd, {headers: getMultipartHeader()});
    }

    generatePdf(pdfContent) {
        return axios.post(smartEnuApi + `/workPlan/generatePdf`, {text: pdfContent}, {headers: getHeader()});
    }

    createEvent(data) {
        return axios.post(smartEnuApi + `/workPlan/addEvent`, data, {headers: getHeader()})
    }

    editEvent(editData) {
        return axios.post(smartEnuApi + `/workPlan/editEvent`, editData, {headers: getHeader()})
    }

    getEventById(id) {
        return axios.get(smartEnuApi + `/workPlan/getWorkPlanEventById/${id}`, {headers: getHeader()});
    }

    getEventResult(eventId) {
        return axios.get(smartEnuApi + `/workPlan/getWorkPlanEventResult/${eventId}`, {headers: getHeader()})
    }

    saveEventResult(fd) {
        return axios.post(smartEnuApi + `/workPlan/saveResult`, fd, {headers: getMultipartHeader()});
    }

    sendResultToVerify(data) {
        return axios.post(smartEnuApi + `/workPlan/sendEventResultForVerify`, data, {headers: getHeader()});
    }

    getEventResultHistory(eventResultId) {
        return axios.get(smartEnuApi + `/workPlan/getWorkPlanEventResultHistory/${eventResultId}`, {headers: getHeader()})
    }

    verifyEventResult(data) {
        return axios.post(smartEnuApi + `/workPlan/verifyEventResult`, data, {headers: getHeader()});
    }

    editEventResult(fd) {
        return axios.post(smartEnuApi + `/workPlan/editResult`, fd, {headers: getHeader()});
    }

    deleteEventResult(id) {
        return axios.post(smartEnuApi + `/workPlan/deleteResult/${id}`, null, {headers: getHeader()});
    }

    deleteResultFile(id) {
        return axios.post(smartEnuApi + `/workPlan/deleteResultFile/${id}`, null, {headers: getHeader()});
    }

    getWorkPlanReports(planId) {
        return axios.get(smartEnuApi + `/workPlan/getWorkPlanReports/${planId}`, {headers: getHeader()});
    }

    deletePlanReport(id) {
        return axios.post(smartEnuApi + `/workPlan/deleteReport/${id}`, null, {headers: getHeader()});
    }

    approvePlan(fd) {
        return axios.post(smartEnuApi + `/workPlan/savePlanReportFile`, this.fd, {headers: getMultipartHeader()});
    }

    getDepartments(planId) {
        return axios.post(smartEnuApi + `/workPlan/getDepartments`, {work_plan_id: planId}, {headers: getHeader()});
    }

    getRespUsers(planId) {
        return axios.post(smartEnuApi + `/workPlan/getRespUsers`, {work_plan_id: planId}, {headers: getHeader()});
    }

    createWorkPlanReport(data) {
        return axios.post(smartEnuApi + `/workPlan/createReport`, data, {headers: getHeader()});
    }

    getPlanReportById(id) {
        return axios.get(smartEnuApi + `/workPlan/getWorkPlanReportById/${id}`, {headers: getHeader()});
    }

    getPlanReportFile(docId) {
        return axios.post(smartEnuApi + `/workPlan/getWorkPlanReportFile`,
            {doc_id: docId}, {headers: getHeader()});
    }

    getReportApprovalUsers(id) {
        return axios.get(smartEnuApi + `/workPlan/getReportApprovalUsers/${id}`, {headers: getHeader()});
    }

    getSignatures(data) {
        return axios.post(smartEnuApi + `/workPlan/getSignatures`, data, {headers: getHeader()});
    }

    signPlanReport(data) {
        return axios.post(smartEnuApi + '/workPlan/reportSignature', data, {headers: getHeader()});
    }

    rejectReport(data) {
        return axios.post(smartEnuApi + '/workPlan/rejectReport', data, {headers: getHeader()});
    }

    getPlanFile(docId) {
        return axios.post(smartEnuApi + `/workPlan/getWorkPlanFile`, {doc_id: docId}, {headers: getHeader()});
    }

    signPlan(data) {
        return axios.post(smartEnuApi + '/workPlan/signature', data, {headers: getHeader()});
    }

    reApprovePlan(data) {
        return axios.post(smartEnuApi + '/workPlan/reapprove', data, {headers: getHeader()});
    }

}