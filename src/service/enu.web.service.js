import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";
import api from "@/service/api";
import {useRouter} from "vue-router";
export class EnuWebService {

    getAllMenus() {
        return api.get("/web/getMenus", {headers: getHeader()});

    }

    addMenu(data){
        return api.post("/web/addMenu", data, {headers: getHeader()});
    }

    editMenu(data){
        return api.post("/web/editMenu", data, {headers: getHeader()});
    }

    getAllPages(params){
        return api.post("/web/getPages", params, {headers: getHeader()});
    }

    getAllPagesBySlug(params){
        return api.post("/web/getPagesBySlug", params, {headers: getHeader()});
    }

    getPageById(pageId) {
        return api.get(`/web/getPageAdmin/${pageId}`, {headers: getHeader()});
    }

    getPageFiles(pageId, isGallery) {
        return api.post(`/web/getPageFiles`, {page_id: pageId, is_gallery: isGallery}, {headers: getHeader()});
    }

    addPage(data){
        console.log("rest files", data.files)
        return api.post("/web/addPage", data, {headers: getHeader()})
    }

    editPage(editData){
        return api.post("/web/editPage", editData, {headers: getHeader()})
    }

    getMenusTree(data) {
        return api.post('/web/getMenusTree', data, {headers: getHeader()});
    }

    deleteMenu(id) {
        return api.post(`/web/deleteMenu`, {id: id}, {headers: getHeader()});
    }

    deletePage(id) {
        return api.post(`/web/deleteMenuPage`, {id: id}, {headers: getHeader()});
    }

    deletePageFile(id) {
        return api.post(`/web/deletePageFile`, {id: id}, {headers: getHeader()});
    }

    getBlockList(params) {
        return api.post(`/web/getBlocks`, params, {headers: getHeader()});
    }

    getBlockById(id) {
        return api.get(`/web/getBlock/${id}`, {headers: getHeader()});
    }

    getBlockContentByBlockId(blockId) {
        return api.get(`/web/getBlockContentsByBlockId/${blockId}`, {headers: getHeader()});
    }

    getBlockListByBlockId(blockId) {
        return api.get(`/web/getBlockListsByBlockId/${blockId}`, {headers: getHeader()});
    }

    addBlock(data) {
        return api.post(`/web/addBlock`, data, {headers: getHeader()});
    }

    addBlockContent(data) {
        return api.post(`/web/addBlockContent`, data, {headers: getHeader()});
    }

    addBlockContentListElement(data) {
        return api.post(`/web/addBlockList`, data, {headers: getHeader()});
    }

    addBlockToPage(data) {
        return api.post(`/web/addPageBlock`, data, {headers: getHeader()});
    }

    deleteBlockListElement(id) {
        return api.post(`/web/deleteBlockList`, {id: id}, {headers: getHeader()});
    }

    deleteBlock(id) {
        return api.post(`/web/deleteBlock`, {id: id}, {headers: getHeader()});
    }

    editBlock(data) {
        return api.post(`/web/editBlock`, data, {headers: getHeader()});
    }

    editBlockListElement(data) {
        return api.post(`/web/editBlockList`, data, {headers: getHeader()});
    }

    editBlockContent(data) {
        return api.post(`/web/editBlockContent`, data, {headers: getHeader()});
    }

    deleteBlockFromPage(id) {
        return api.post(`/web/deletePageBlock`, {id: id}, {headers: getHeader()});
    }

    orderBlockIntoPage(data) {
        return api.post(`/web/swapPageBlockPosition`, data,  {headers: getHeader()});
    }

    orderMenuList(data){
        return api.post(`/web/swapMenuPosition`, data,  {headers: getHeader()});
    }

    getBlockParamsByBlockId(id) {
        return api.post(`/web/getBlockParamValuesByBlockID`, {block_id: id}, {headers: getHeader()});
    }

    getBlockContentFiles(id) {
        return api.post(`/web/getBlockContentFiles`, {block_content_id: id}, {headers: getHeader()});
    }

    deleteBlockContentFile(id) {
        return api.post(`/web/deleteBlockContentFile`, {id: id}, {headers: getHeader()});
    }

    getSiteSettings(slugId) {
        return api.post(`/web/getSiteSettings`, {}, {headers: getHeader()})
    }

    setSiteSettings(params) {
        return api.post(`/web/updateSiteSettings`, params, {headers: getHeader()})
    }
    getSiteLogs(params) {
        return api.post(`/web/getTableLogs`, params, {headers: getHeader()})
    }
    getWebSiteLogs(params) {
        return api.post(`/web/getTableLogsByTableName`, params, {headers: getHeader()})
    }
    getBlockListTypes() {
        return api.get("/web/getBlockListTypes", {headers: getHeader()});
    }
    getBlockListViewTypes() {
        return api.get("/web/getBlockListViewTypes", {headers: getHeader()});
    }

    getBlockListFiles(id) {
        return api.post(`/web/getBlockListFiles`, {id: id}, {headers: getHeader()});
    }

    deleteBlockListFile(id) {
        return api.post(`/web/deleteBlockListFile`, {id: id}, {headers: getHeader()});
    }

    getSlugs() {
        return api.get(`/web/getSlugs`, {headers: getHeader()})
    }

    getSlugById(id) {
        return api.post(`/web/getSlug`, {slug_id: id}, {headers: getHeader()})
    }

    getSlugBySlug(slug) {
        return api.post(`/web/getSlug`, {slug: slug}, {headers: getHeader()})
    }

    getSlugByUserId(params) {
        return api.post(`/web/getSlugByUser`, params, {headers: getHeader()})
    }

    setFacultyAdmin(slugId, userId) {
        return api.post(`/web/setFacultyAdmin`, {slug_id: slugId, user_id: userId}, {headers: getHeader()})
    }

    setSiteInfo(params) {
        return api.post(`/web/setSiteInfo`, params, {headers: getHeader()})
    }

    navigateToPlugin(componentName) {
        switch (componentName) {
            case 'DocsListBlock':
                return "AdmissionInfoList";
            case 'PriceEducation':
                return 'EduPriceCategoryList'
            case 'ScoreListBlock':
                return 'EduScoreCategoryList'
            case 'DrScoreListBlock':
                return 'EduDoctoralScoreCategoryList'
        }

        return "";
    }
}
