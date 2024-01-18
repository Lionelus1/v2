<template>
    <h3>{{ $t("queue.title") }}</h3>
	<div class="card">
    <div class="mb-4 ">
        <Button
          :label="$t('common.add')"
          :title="$t('queue.creatQueue')"          
          icon="pi pi-plus"
          class="p-button-success mr-2"
          v-on:click="createQueue(null)"
        />
    </div>
    <TreeTable :value="queues" :lazy="true" :paginator="true" :rows="lazyParams.rows" :loading="loading"
      @nodeExpand="onExpand" @page="onPage" :totalRecords="totalRecords" selectionMode="single" v-model:selectionKeys="currentNode">
      <template #header>
        <div class="table-header">
          {{$t("queue.queues")}}
        </div>
      </template> 

      <Column field="queueName" :header="$t('common.name')" :expander="true">
        <template #body="slotProps">
           {{slotProps.node["queueName"+$i18n.locale]}}
        </template>
      </Column>
       <Column field="responsibles" v-bind:header="$t('queue.responsible')" sortable>
        <template #body="slotProps">            
          <div>
            <span display="chip" v-for="responsible in slotProps.node.responsibles" :key="responsible.userID">
              <Chip class="mr-2 custom-chip" :label="responsible.fullName"/>
            </span>
          </div>

        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button
            v-if="slotProps.node.createdUserId === loginedUser.userID || isOperator(slotProps.node)"
            icon="pi pi-plus" 
            v-tooltip.bottom="$t('common.add')"            
            class="p-button-rounded p-button-success mr-2"  
            @click="createQueue(slotProps.node)" />            
          <Button 
            v-if="slotProps.node.createdUserId === loginedUser.userID || isOperator(slotProps.node)"
            icon="pi pi-pencil"
            v-tooltip.bottom="$t('common.edit')"
            class="p-button-rounded p-button-warning mr-2"  
            @click="editQueue(slotProps.node)" />
          <Button 
            v-if="slotProps.node.createdUserId === loginedUser.userID || isOperator(slotProps.node)"
            icon="pi pi-trash" 
            v-tooltip.bottom="$t('common.delete')"  
            class="p-button-rounded p-button-danger mr-4" 
            @click="delQueue(slotProps.node)"/>
          <Button 
            icon="pi pi-user" 
            v-if="slotProps.node.createdUserId === loginedUser.userID || isOperator(slotProps.node)"
            v-tooltip.bottom="$t('queue.operator')"  
            class="p-button-rounded p-button-info mr-2"  
            @click="$router.push('/queue/operator/'+ slotProps.node.key+ '/' +  slotProps.node.parentId)" />
          <Button 
            icon="pi pi-desktop" 
            v-if="findRole(null, 'queue_tv')"
            v-tooltip.bottom="$t('queue.tv')"  
            class="p-button-rounded p-button-help mr-2"  
            @click="$router.push('/queue/tv/'+ slotProps.node.key )" />
           <Button 
            icon="pi pi-ticket" 
            v-tooltip.bottom="$t('queue.terminal')"  
            v-if="findRole(null, 'queue_terminal')"
            class="p-button-rounded p-button-help mr-2"  
            @click="$router.push('/queue/terminal/'+ slotProps.node.key )" />
            <Button 
            icon="pi pi-chart-line" 
            v-tooltip.bottom="$t('common.report')"  
            v-if="slotProps.node.parentId ===null && slotProps.node.createdUserId === loginedUser.userID "
            class="p-button-rounded p-button-help mr-2"  
            @click="$router.push('/queue/queueReport/'+ slotProps.node.key )" />
        </template>
      </Column>              
    </TreeTable> 
   

    <Dialog
      v-model:visible="editVisible"
      :closable="false"
      :style="{ width: '450px' }"
      :header="$t('queue.createQueue')"
      :modal="true"
      class="p-fluid"
    >
      <div class="field" style="margin: 1.5rem 0 1.5rem 0">
        <span class="p-float-label">
          <InputText id="kz-title" v-model="queue.queueNamekz" />
          <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
        </span>
        <small class="p-error" v-if="!validation.nameKz && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="ru-title" v-model="queue.queueNameru" />
          <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
        </span>
        <small class="p-error" v-if="!validation.nameRu && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="en-title" v-model="queue.queueNameen" />
          <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
        </span>
        <small class="p-error" v-if="!validation.nameEn && submitted">{{ $t("common.requiredField") }}</small>
      </div>
      <div class="field">
          <label for="name">{{$t('common.fullName')}}</label>
          <FindUser v-model="queue.responsibles" :userType="2"></FindUser>
          <small class="p-error" v-if="!validation.responsibles && submitted">{{ $t("common.requiredField") }}</small>
      </div>
              
      <template #footer>
        <Button
          v-bind:label="$t('common.save')"
          icon="pi pi-check"
          class="p-button p-component p-button-success mr-2"
          v-on:click="addQueue"
        />
        <Button
          v-bind:label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="hideDialog"
        />
      </template>
    </Dialog>
      
    <Dialog
      v-model:visible="deleteVisible"
      :closable="false"
      header=""
      :style="{ width: '450px' }"
      :modal="true"
      >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="queue"
          >{{ $t("common.doYouWantDelete") }}
          <b>{{
            $i18n.locale === "kz"
              ? queue.queueNamekz
              : $i18n.locale === "ru"
              ? queue.queueNameru
              : queue.queueNameen
          }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button p-component p-button-success mr-2"
          @click="deleteQueue"
        />
        <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="deleteVisible = false"
        />
      </template>
    </Dialog>
	</div>
</template>

<script>
import api from "@/service/api";
import {  getHeader, smartEnuApi, findRole } from "@/config/config";
export default {
  name: "Queue",
  data() {
    return {
      editVisible: false,
      deleteVisible: false,
      queue:{
        responsibles:[]
      },
      currentNode:null,
      submitted: false, 
      queues: [],   

      rows: 100,   
      totalRecords: 100,        
      selectedQueue: null,
      loading: true,
      userRoles: null,
      roles: {
        isAdmin: false,
        isModer: false,
        isPublisher: false,
        isUser: true,
        isStudent: false,
      },
      
      lazyParams: {
        first: 0,
        rows: 10,
        parentID: null,
      },
      validation: {
        nameKz: false,
        nameRu: false,
        nameEn: false,
        responsible: false,
      },
      loginedUser: null,

    }
  },
   
  methods: {    
    getQueue(parentID, parent) {  
      this.submitted = true 
      this.lazyParams.parentID = parentID
      api
      .post("/queue/allQueues", this.lazyParams, {
        headers: getHeader(),
      })
      .then((response) => {

        if (parentID !== null) {
          parent.children = response.data.queues
        }  
        else {
          this.queues = response.data.queues;
          this.totalRecords = response.data.total;
        }
        this.loading = false;
      })
      .catch((error) => {
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.loadError") + ":\n" + error,
          life: 3000,
        });
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },
    isOperator(queue) {
      var result = false
      queue.responsibles.forEach(operator=> {
        if (operator.userID === this.loginedUser.userID) {
          result = true
        }
      })
      return result
    },
    findRole: findRole,
    validate() {
      this.validation.nameKz = this.notEmpty(this.queue.queueNamekz)
      this.validation.nameRu = this.notEmpty(this.queue.queueNameru)
      this.validation.nameEn = this.notEmpty(this.queue.queueNameen)
      this.validation.responsible = !(this.queue.responsibles === null || this.queue.responsibles === undefined || (this.queue.responsibles !== null && this.queue.responsibles.length <=0))
      return this.validation.nameKz && this.validation.nameRu && this.validation.nameEn && this.validation.responsible
    },
    notEmpty(variable) {
      return !(variable=== undefined ||  variable === null  || variable === "")
    },
    onExpand(node) {
      this.getQueue(node.key, node)
    },
    onPage(event) {
      this.lazyParams = event;
      this.getQueue(null,null)
    },
    deleteQueue() {  
      api
        .post(
          "/queue/delQueue",
          {
            id: this.currentNode.key,
          },
          {
            headers: getHeader(),
          }
        )
        .then(_ => {
          this.getQueue(null, null)
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.delNewsCategoryError") + ":\n" + error,
            life: 3000,
          });
        });
      this.deleteVisible = false;
      this.queue = {};
    },

    editQueue(node) {
      // alert(resId);
      this.queue = JSON.parse(JSON.stringify(node))
      this.editVisible = true;
      this.submitted = false;   
    },

    addQueue() { 
      this.submitted = true;
      var node = this.queue
      if (!this.validate())
        return           
        api
        .post("/queue/save", this.queue, {
          headers: getHeader(),          
        })        
        .then((response) => {
          if (response.data !== null) {
            this.$toast.add({
              severity: "success",
              summary: this.$t("smartenu.saveSuccess"),
              life: 3000,
            });
            var addedQueue = response.data
            if (node.key===null || node.key === undefined) {
              if (this.currentNode === null) 
              {
                this.queues.push(addedQueue)
              } 
              else 
              {
              if (this.currentNode.children === null) {
                  this.currentNode.children = []
                  }
                this.currentNode.children.push(addedQueue)
              }
            } else {
                this.currentNode = response.data
                for (var i = 0; i < this.queues.length; i++) {
                  if (this.queues[i].key === this.currentNode.key) {
                    this.queues[i] = response.data
                    return
                  } else {
                    this.findQueue(this.queues[i], response.data)
                  }
                }
            }
          }
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.saveCategoryError") + ":\n" + error,
            life: 3000,
          });
        });
      this.editVisible = false;
      this.queue = {};
      
    },
    createQueue(node) {
      this.submitted = false
      this.currentNode = node;    
      if (node !== null) {
        this.queue.parentId = this.currentNode.key
      }
      this.editVisible = true;
      this.submitted = false;
      this.queue.key = null;
    },

    findQueue(queue, node) {
      if (queue.key === node.key) {
        queue = node
        return 
      }
      if (queue.children !== null) {
        for (var i = 0; i < queue.children.length; i++) {
          if (queue.children[i].key === node.key) {
            queue.children[i] = node
            return
          }
          this.findQueue(queue.children[i], node)
        }
      }
    },

    hideDialog() {
      this.queue = {};
      this.editVisible = false;
      this.submitted = false;
    },
    
    delQueue(node) { 
      this.currentNode = node
      this.deleteVisible = true;
    },
     
  },
  created() {
    this.loginedUser = this.$store.state.loginedUser;
    this.getQueue(null, null); 
  },

}
</script>

<style lang="scss" scoped>
.product-image {
    width: 50px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)
}

.orders-subtable {
    padding: 1rem;
}
.table-header {
  display: flex;
  flex-order-: space-between;
}
::v-deep(.p-datatable.p-datatable-customers) {
  .p-datatable-header {
    padding: 1rem;
    text-align: left;
    font-size: 1.5rem;
  }

  .p-paginator {
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    text-align: left;
  }

  .p-datatable-tbody > tr > td {
    cursor: auto;
  }

  .p-dropdown-label:not(.p-placeholder) {
    text-transform: uppercase;
  }
}
</style>                    