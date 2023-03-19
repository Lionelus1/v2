import api from "@/service/api";
import {getHeader} from "@/config/config";

export class BlogService {

    getBlogs() {
        return api.get(`/web/getBlog`, {headers: getHeader()});
    }

    getBlogRequests(id) {
        return api.post(`/web/getBlogRequestByBlogID`, {id: id}, {headers: getHeader()});
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

    sendQuestion(data) {
        return api.post(`/web/addBlogRequest`, data, {headers: getHeader()});
    }

}