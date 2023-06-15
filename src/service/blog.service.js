import api from "@/service/api";
import {getHeader} from "@/config/config";

export class BlogService {

    getBlogs() {
        return api.get(`/web/getBlog`, {headers: getHeader()});
    }

    getBlogRequests(params) {
        return api.post(`/web/getBlogRequestByBlogID`, params, {headers: getHeader()});
    }

    getBlogRequestById(id) {
        return api.get(`/web/getBlogRequestById/${id}`, {headers: getHeader()});
    }

    addBlog(data) {
        return api.post(`/web/addBlog`, data, {headers: getHeader()})
    }

    editBlog(data) {
        return api.post(`/web/editBlog`, data, {headers: getHeader()})
    }

    deleteBlog(id) {
        return api.post(`/web/deleteBlog`, {id: id}, {headers: getHeader()})
    }

    deleteBlogRequest(id) {
        return api.post(`/web/deleteBlogRequest`, {id: id}, {headers: getHeader()})
    }

    sendBlogRequestAnswer(data) {
        return api.post(`/web/sendBlogRequestAnswer`, data, {headers: getHeader()});
    }

}
