import api from './api';
import { getHeader } from '../config/config';

export default class RegistryService {
  createRegistry(data) {
    return api.post(`/registry/create`, data, { headers: getHeader() });
  }
  getRegistry(data) {
    return api.post(`/registry/get`, data, { headers: getHeader() });
  }
  deleteRegistry(data) {
    return api.post(`/registry/delete`, data, { headers: getHeader() });
  }
  getRegistryParameters(data) {
    return api.post(`/registry/parameter`, data, { headers: getHeader() });
  }

  createRegistryParameter(data) {
    return api.post(`/registry/parameter/create`, data, { headers: getHeader() });
  }

  updateRegistryParameters(data) {
    return api.post(`/registry/parameter/update`, data, { headers: getHeader() });
  }

  deleteRegistryParameters(data) {
    return api.post(`/registry/parameter/delete`, data, { headers: getHeader() });
  }

  createApplication(data) {
    return api.post(`/registry/application/create`, data, { headers: getHeader() });
  }
  getApplication(data) {
    return api.post(`/registry/application`, data, { headers: getHeader() });
  }
  updateApplication(data) {
    return api.post(`/registry/application/update`, data, { headers: getHeader() });
  }
  deleteApplication(data) {
    return api.post(`/registry/application/delete`, data, { headers: getHeader() });
  }
  getReservation(data){
    return api.post(`/registry/reservation`, data, { headers: getHeader() });
  }
  importRegistry(data) {
    return api.post(`/registry/import`, data, { headers: getHeader() });
  }
  addNewRole(data) {
    return api.post(`/registry/role/create`, data, { headers: getHeader() });
  }
  updateRole(data){
    return api.post(`/registry/role/update`, data, { headers: getHeader() });
  }
  deleteRole(data) {
    return api.post(`/registry/role/delete`, data, { headers: getHeader() });
  }
  getUserRole(data) {
    return api.post(`/registry/role/getUserRole`, data, { headers: getHeader() });
  }
  getUsers(data){
    return api.post(`/registry/user`, data, { headers: getHeader() });
  }
}
