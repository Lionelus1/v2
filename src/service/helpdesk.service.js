import api from "./api";
// import camunda_api from "./camunda_api";
// import axios from "axios";
import { getHeader } from "@/config/config";
import { ref } from "vue";
export class HelpDeskService {
  helpDeskTicketCreate(data) {
    return api.post("/helpdesk/ticket/create", data, { headers: getHeader() });
  }

  helpDeskTicketGet(data) {
    return api.post("/helpdesk/ticket/get", data, { headers: getHeader() });
  }

  helpDeskDeleteTicket(data) {
    return api.post("/helpdesk/ticket/delete", data, { headers: getHeader() });
  }

  helpDeskCategoryGet(params) {
    return api.post(`/helpdesk/category/get`, params, { headers: getHeader() });
  }

  helpDeskDocApproval(data) {
    return api.post(`/helpdesk/doc/approval`, data, { headers: getHeader() });
  }
  helpDeskDocumentRevision(data) {
    return api.post(`/helpdesk/doc/revision`, data, { headers: getHeader() });
  }
  helpDeskStudentInfo(data) {
    return api.post(`/helpdesk/studentInfo`, data, { headers: getHeader() });
  }
    helpDeskTicketForm(data){
        return api.post(`helpdesk/ticketForm`, data, {headers: getHeader()});
    }
    helpDeskUpdateCategory(data) {
        return api.post(`/helpdesk/update/category`, data, {headers: getHeader()})
    }
    helpDeskUpdateCategoryLine(data){
        return api.post(`/helpdesk/update/categoryLine`, data, {headers: getHeader()})
    }
    helpDeskGetCategoryLine(data){
        return api.post(`/helpdesk/get/categoryLine`,data, {headers: getHeader()})
    }
}

export class CamundaService {
  constructor() {
    // if (CamundaService.instance) {
    //   return CamundaService.instance;
    // }
    this.processInstanceKey = "";
    this.processDefinitionKey = "";
    this.currentFormId = "";
    this.currentSchema = "";
    this.isProccessStarted = false;
    this.here = "";
    this.uuid = "";
    this.order = null;
    this.flowNodeBpmnId = null;
    this.isEdit = false;
    this.docUUID = "";
  }
  async startProcess(key, value) {
    this.here = "yeah";
    const response = await api.post(
      "/camunda/start/process",
      {
        // params: {
        key: key,
        value: JSON.stringify(value),
        // },
      },
      { headers: getHeader() }
    );
    this.processInstanceKey = response.data["processInstanceKey"];
    this.processDefinitionKey = response.data["processDefinitionKey"];
    this.isProccessStarted = true;
    // CamundaService.instance = this;
  }
  async initBasics() {
    const response = await api.get("/camunda/uuid/forms", {
      headers: getHeader(),
      params: {
        processInstanceKey: this.processInstanceKey,
        processDefinitionKey: this.processDefinitionKey,
        uuid: this.uuid,
      },
    });
    this.uuid = response.data.hits.hits[0]["_source"].uuid;
    this.processDefinitionKey =
      response.data.hits.hits[0]["_source"].processDefinitionKey;
    this.processInstanceKey =
      response.data.hits.hits[0]["_source"].processInstanceKey;
  }
  async initCurrentForm(forceGet = null) {
    const response = await api.get("/camunda/form/current", {
      headers: getHeader(),
      params: {
        processInstanceKey: this.processInstanceKey,
        processDefinitionKey: this.processDefinitionKey,
      },
    });
    const arrayToSort = response.data.hits.hits;

    // Sort the array by the id property within the _source object
    if (arrayToSort.length && arrayToSort[0]._source.order) {
      arrayToSort.sort((a, b) => {
        return a._source.order - b._source.order;
      });
    }
    this.currentFormId =
      arrayToSort[forceGet ?? arrayToSort.length - 1][
      "_source"
      ]["currentForm"];
    this.flowNodeBpmnId = this.currentFormId;
  }
  async setCurrentSchema() {
    const response = await api.get("/camunda/form", {
      headers: getHeader(),
      params: { form_id: this.currentFormId },
    });
    this.currentSchema = response.data.schema;
    for (var i = 0; i < this.currentSchema.components.length; i++) {
      if (
        this.currentSchema.components[i].key ||
        this.currentSchema.components[i].type == "table"
      ) {
        this.currentSchema.components[i].value = {
          [this.currentSchema.components[i].key ??
            this.currentSchema.components[i].id]: null,
        }; // Initialize an empty array for 'values'
      } else {
        this.currentSchema.components[i].value = ref(null);
      }
      this.currentSchema.components[i].incorrect = ref(false);
    }
  }
  async initTableInf(component, page) {
    if ("url" in component.properties) {
      const response = await api.post(
        component.properties.url,
        {
          // user_id: userId,
          page: page,
          rows: component.rowCount,
          searchText: null,
          dic_course_type: "not_formal_education",
          courses_ids: null,
        },
        { headers: getHeader() }
      );

      component.items = response.data[component.properties.items_key];
      component.totalRecords = ref(response.data["total"]);
    }
  }
  async initProperties() {
    for (var i = 0; i < this.currentSchema.components.length; i++) {
      if (this.currentSchema.components[i].type == "table") {
        // this.currentSchema.components. = ref([]); // Initialize an empty array for 'values'
        // if ("url" in this.currentSchema.components[i].properties) {
        //   const response = await api.post(
        //     this.currentSchema.components[i].properties.url,
        //     {
        //       // user_id: userId,
        //       page: 0,
        //       rows: this.currentSchema.components[i].rowCount,
        //       searchText: null,
        //       dic_course_type: "not_formal_education",
        //       courses_ids: null,
        //     },
        //     { headers: getHeader() }
        //   );

        //   this.currentSchema.components[i].items =
        //     response.data[
        //       this.currentSchema.components[i].properties.items_key
        //     ];
        //   this.currentSchema.components[i].totalRecords = ref(
        //     response.data["total"]
        //   );
        // }
        this.initTableInf(this.currentSchema.components[i], 0);
      }
    }
  }
  // isExist(obj, key, value) {
  //   // Check if the key exists in the object
  //   if (key in obj) {
  //     // Check if the value associated with the key matches the given value
  //     return obj[key] === value;
  //   } else {
  //     // If the key doesn't exist in the object, return false
  //     return false;
  //   }
  // }
  async setVarInProccess(key, value, processInstanceKey) {
    const response = await api.post(
      "/camunda/variable",
      {
        key: key,
        processInstanceKey: processInstanceKey,
        value: value,
      },
      { headers: getHeader() }
    );
  }
  async finishStep(variables) {
    const body = {
      processDefinitionKey: this.processDefinitionKey,
      processInstanceKey: this.processInstanceKey,
      variables: variables,
    };
    body["flow"] = this.flowNodeBpmnId;
    const response = await api.patch("/camunda/finish/active/task", body, {
      headers: getHeader(),
    });
    const repo = await api.get("/camunda/actived/tasks", {
      params: { process_instance_key: this.processInstanceKey },
      headers: getHeader(),
    });
    this.flowNodeBpmnId = response.data.flowNodeBpmnId;
    // var variables = {};
    // for (const [index, obj] of Object.entries(this.currentSchema.components)) {
    //   if ("valuesKey" in obj) {
    //     // await this.setVarInProccess(
    //     //   obj.valuesKey,
    //     //   obj.value,
    //     //   this.processInstanceKey
    //     // );
    //     variables[obj.valuesKey] = obj.value;
    //   }
    // }
    // var data = JSON.stringify({
    //   variables: variables,
    // });

    // var config = {
    //   method: "post",
    //   maxBodyLength: Infinity,
    //   url: "http://localhost:8080/v1/user-tasks/:userTaskKey/completion",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   data: data,
    // };

    // camunda_api(config)
    //   .then(function (response) {
    //   })
    //   .catch(function (error) {
    //   });
  }
  async getApplications() {
    const response = await api.get("/camunda/applications", {
      headers: getHeader(),
    });
    return response.data;
  }
  async setDocUUID() {
    const response = await api.get("/camunda/proccess/variable", {
      headers: getHeader(),
      params: {
        processInstanceKey: this.processInstanceKey,
        processDefinitionKey: this.processDefinitionKey,
        name: "docid",
      },
    });
    if (response.data.hits.hits.length != 0) {
      this.docUUID = JSON.parse(
        response.data.hits.hits[0]["_source"].value
      ).body.uuid;
    }
  }
  async getProcessVariable() {
    const response = await api.get("/camunda/proccess/variable", {
      headers: getHeader(),
      params: {
        processInstanceKey: this.processInstanceKey,
        processDefinitionKey: this.processDefinitionKey,
        name: this.flowNodeBpmnId,
      },
    });
    if (
      response.data.hits.hits[0] === undefined ||
      !("_source" in response.data.hits.hits[0])
    )
      return undefined;
    this.flowNodeBpmnId = response.data.hits.hits[0]["_source"]["name"];
    return JSON.parse(response.data.hits.hits[0]["_source"]["value"]);
  }
  async setVars() {
    for (const [index, obj] of Object.entries(this.currentSchema.components)) {
      if ("valuesKey" in obj) {
        // await new Promise((resolve) => setTimeout(resolve, 10000));
        const response = await api.get("/camunda/variable", {
          headers: getHeader(),
          params: {
            variable_name: obj.valuesKey,
            processDefinitionKey: this.processDefinitionKey,
            processInstanceKey: this.processInstanceKey,
          },
        });
        const value = JSON.parse(
          response.data.hits.hits[0]["_source"]["value"]
        );
        this.currentSchema.components[index]["values"].value =
          value["category"];
      }
    }
  }
}
const camundaServiceInstance = new CamundaService();
// Object.freeze(camundaServiceInstance);

export default camundaServiceInstance;
