<<<<<<< HEAD
import api from "./api";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";
=======
import axios from "axios";
import {getHeader, getFileHeader, smartEnuApi} from "@/config/config";
>>>>>>> 41177381f26cf89f0dc8ba685cbb18d1068530b2

export class WorkPlanService {

    getEventsTree(lazyParams) {
        return api.post(`/workPlan/getEventsTree`, lazyParams, {headers: getHeader()});
    }

    getWorkPlanApprovalUsers(work_plan_id) {
        return api.get(`/workPlan/getApprovalUsers/${work_plan_id}`);
    }

    getPlanById(planId) {
        return api.get(`/workPlan/getWorkPlanById/${planId}`, {headers: getHeader()});
    }

    finishEvent(planId) {
        return api.post('/workPlan/finishEvent', {work_plan_id: parseInt(planId)}, {headers: getHeader()});
    }

    removeEvent(eventId) {
        return api.post(`/workPlan/removeEvent/${eventId}`, {}, {headers: getHeader()})
    }

    getWorkPlanData(data) {
        return api.post(`/workPlan/getWorkPlanReportData`, data, {headers: getHeader()});
    }

    getPlans(searchText) {
        return api.post(`/workPlan/getPlans`, {search_text: searchText}, {headers: getHeader()});
    }

    rejectPlan(data) {
        return api.post(`/workPlan/reject`, data, {headers: getHeader()});
    }

    deletePlan(planId) {
        return api.post(`/workPlan/deletePlan/${event.work_plan_id}`, null, {headers: getHeader()});
    }

    createPlan(planName, lang, isOper) {
        return api.post(`/workPlan/addPlan`, {work_plan_name: planName, lang: lang, is_oper: isOper}, {headers: getHeader()});
    }

    savePlanFile(fd) {
<<<<<<< HEAD
        return api.post(`/workPlan/savePlanFile`, fd, {headers: getMultipartHeader()});
=======
        return axios.post(smartEnuApi + `/workPlan/savePlanFile`, fd, {headers: getFileHeader()});
>>>>>>> 41177381f26cf89f0dc8ba685cbb18d1068530b2
    }

    generatePdf(pdfContent) {
        return api.post(`/workPlan/generatePdf`, {text: pdfContent}, {headers: getHeader()});
    }

    createEvent(data) {
        return api.post(`/workPlan/addEvent`, data, {headers: getHeader()})
    }

    editEvent(editData) {
        return api.post(`/workPlan/editEvent`, editData, {headers: getHeader()})
    }

    getEventById(id) {
        return api.get(`/workPlan/getWorkPlanEventById/${id}`, {headers: getHeader()});
    }

    getEventResult(eventId) {
        return api.get(`/workPlan/getWorkPlanEventResult/${eventId}`, {headers: getHeader()})
    }

    saveEventResult(fd) {
<<<<<<< HEAD
        return api.post(`/workPlan/saveResult`, fd, {headers: getMultipartHeader()});
=======
        return axios.post(smartEnuApi + `/workPlan/saveResult`, fd, {headers: getFileHeader()});
>>>>>>> 41177381f26cf89f0dc8ba685cbb18d1068530b2
    }

    sendResultToVerify(data) {
        return api.post(`/workPlan/sendEventResultForVerify`, data, {headers: getHeader()});
    }

    getEventResultHistory(eventResultId) {
        return api.get(`/workPlan/getWorkPlanEventResultHistory/${eventResultId}`, {headers: getHeader()})
    }

    verifyEventResult(data) {
        return api.post(`/workPlan/verifyEventResult`, data, {headers: getHeader()});
    }

    editEventResult(fd) {
        return api.post(`/workPlan/editResult`, fd, {headers: getHeader()});
    }

    deleteEventResult(id) {
        return api.post(`/workPlan/deleteResult/${id}`, null, {headers: getHeader()});
    }

    deleteResultFile(id) {
        return api.post(`/workPlan/deleteResultFile/${id}`, null, {headers: getHeader()});
    }

    getWorkPlanReports(planId) {
        return api.get(`/workPlan/getWorkPlanReports/${planId}`, {headers: getHeader()});
    }

    deletePlanReport(id) {
        return api.post(`/workPlan/deleteReport/${id}`, null, {headers: getHeader()});
    }

    approvePlan(fd) {
<<<<<<< HEAD
        return api.post(`/workPlan/savePlanReportFile`, this.fd, {headers: getMultipartHeader()});
=======
        return axios.post(smartEnuApi + `/workPlan/savePlanReportFile`, fd, {headers: getFileHeader()});
>>>>>>> 41177381f26cf89f0dc8ba685cbb18d1068530b2
    }

    getDepartments(planId) {
        return api.post(`/workPlan/getDepartments`, {work_plan_id: planId}, {headers: getHeader()});
    }

    getRespUsers(planId) {
        return api.post(`/workPlan/getRespUsers`, {work_plan_id: planId}, {headers: getHeader()});
    }

    createWorkPlanReport(data) {
        return api.post(`/workPlan/createReport`, data, {headers: getHeader()});
    }

    getPlanReportById(id) {
        return api.get(`/workPlan/getWorkPlanReportById/${id}`, {headers: getHeader()});
    }

    getPlanReportFile(docId) {
        return api.post(`/workPlan/getWorkPlanReportFile`,
            {doc_id: docId}, {headers: getHeader()});
    }

    getReportApprovalUsers(id) {
        return api.get(`/workPlan/getReportApprovalUsers/${id}`, {headers: getHeader()});
    }

    getSignatures(data) {
        return api.post(`/workPlan/getSignatures`, data, {headers: getHeader()});
    }

    signPlanReport(data) {
        return api.post('/workPlan/reportSignature', data, {headers: getHeader()});
    }

    rejectReport(data) {
        return api.post('/workPlan/rejectReport', data, {headers: getHeader()});
    }

    getPlanFile(docId) {
        return api.post(`/workPlan/getWorkPlanFile`, {doc_id: docId}, {headers: getHeader()});
    }

    signPlan(data) {
        return api.post('/workPlan/signature', data, {headers: getHeader()});
    }

    reApprovePlan(data) {
        return api.post('/workPlan/reapprove', data, {headers: getHeader()});
    }

}