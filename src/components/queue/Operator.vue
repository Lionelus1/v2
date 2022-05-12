<template>
	<div>
    <Toolbar class="p-mb-4 ">
      <template #start>
        <Button
          :label="$t('common.add')"          
          icon="pi pi-plus"
          class="p-button-success p-mr-2"
          v-on:click="createQueueCategory"
        />
      </template>
    </Toolbar>
    <Toast />

    <DataTable
      :lazy="true"  
      :value="queueCats" 
      v-model:expandedRows="expandedRows" 
      dataKey="id"
      class="p-datatable-customers"
      @rowExpand="onRowExpand" 
      @rowCollapse="onRowCollapse" 
      responsiveLayout="scroll"     
      > 
      <template #header>
        <div class="table-header">
          {{$t("queue.addService")}}
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters"
              v-bind:placeholder="$t('hdfs.search')"
            />
          </span>
        </div>
      </template>  
      <Column :expander="true" headerStyle="width: 3rem"></Column>
      <Column field="catNameKz" v-bind:header="$t('common.nameInQazaq')"  sortable></Column>        
      <Column field="catNameRu" v-bind:header="$t('common.nameInRussian')" sortable></Column>
      <Column field="catNameEn" v-bind:header="$t('common.nameInEnglish')" sortable></Column> 
      <Column headerStyle="width">
        <template  #body="slotProps">
            <Button 
              icon="pi pi-user-plus" 
              class="p-button-rounded p-button-success p-mr-1"  
              @click="createDesk(slotProps.data.catId)"
            />
            <Button 
              icon="pi pi-pencil" 
              class="p-button-rounded p-button-warning p-mr-1"  
              @click="editCategory(slotProps.data.catId)"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-danger"
              @click="delQueueCat(slotProps.data.catId)" 
            />
        </template>
      </Column> 

      <!-- <template #expansion="slotProps">
        <QueueCategories :child="slotProps.data.queueCatDesks"></QueueCategories>
      </template> -->
      
      <template  #expansion="slotProps">
        <div class="orders-subtable">
          <h5>{{$t('queue.secretary')}}</h5> 
          <DataTable :queueCatDesks="slotProps.data.queueCatDesks" responsiveLayout="scroll">                          
            <Column field="deskName" v-bind:header="$t('queue.desks')" sortable>
              <template #body="slotProps">            
                <div>{{slotProps.data.queueCatDesks.deskName}}</div>
              </template>
            </Column>            
          </DataTable>
        </div>
      </template>
    </DataTable>

    <Dialog
      v-model:visible="editVisible"
      :closable="false"
      :style="{ width: '450px' }"
      :header="$t('queue.queueType')"
      :modal="true"
      class="p-fluid"
    >
      <div class="p-field" style="margin: 1.5rem 0 1.5rem 0">
        <span class="p-float-label">
          <InputText id="kz-title" v-model="queueCat.CatNameKz" />
          <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
        </span>
      </div>
      <div class="p-field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="ru-title" v-model="queueCat.CatNameRu" />
          <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
        </span>
      </div>
      <div class="p-field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="en-title" v-model="queueCat.CatNameEn" />
          <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
        </span>
      </div>
      
      <template #footer>
        <Button
          v-bind:label="$t('common.save')"
          icon="pi pi-check"
          class="p-button p-component p-button-success p-mr-2"
          v-on:click="addQueueCat"
        />
        <Button
          v-bind:label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="editVisible=false"
        />
      </template>
    </Dialog>
    <Dialog
      v-model:visible="edit"
      :closable="false"
      :style="{ width: '450px' }"
      :header="$t('queue.regiterSecretory')"
      :modal="true"
      class="p-fluid"
    >
      <div class="p-field" style="margin: 1.5rem 0 1.5rem 0">
        <span class="p-float-label">
          <InputText id="kz-title" v-model="desk.deskName" />
          <label for="kz-title">{{ $t("queue.deskNumber") }}</label>
        </span>
      </div>
      
      <div class="p-field">
          <label for="name">{{$t('common.fullName')}}</label>
          <FindUser v-model="selectedMembers" :max="1" :editMode="true" ></FindUser>
          <small class="p-error" v-if="submitted && validationErrors.members">{{$t('dissertation.validationErrors.selectSecretary')}}</small>
      </div>
              
      <template #footer>
        <Button
          v-bind:label="$t('common.save')"
          icon="pi pi-check"
          class="p-button p-component p-button-success p-mr-2"
          v-on:click="addDesk"
        />
        <Button
          v-bind:label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="edit=false"
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
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
        <span v-if="queueCat">{{ $t("common.doYouWantDelete")}}
          <b>{{
            $i18n.locale === "kz"
              ? queueCat.catNameKz
              : $i18n.locale === "ru"
              ? queueCat.catNameRu
              : queueCat.catNameEn
          }}
          </b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button p-component p-button-success p-mr-2"
          @click="deleteQueueCat(queueCat.catId)"
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

import { authHeader, getHeader, smartEnuApi } from "@/config/config";
import FindUser from "@/helpers/FindUser";
import axios from "axios";
export default {
  name: "QueueCategories",
  components:{FindUser},
  data() {
    return {
      editVisible: false,
      deleteVisible: false,
      submitted: false,
      queueCat:null, 
      queueCats: [],           
      selectedQueue: null,
      loading: true,       
      edit: false, 
      selectedMembers:[],
      desk:{
        catId:null
      } 
    }
  }, 
  
  methods: {     
    // getQueueCat() {         
    //   this.queueCats = [];
    //   axios
    //   .get(smartEnuApi + "/queue/allQueueCats", {
    //     headers: getHeader(),
    //   })
    //   .then((response) => {
    //     this.queueCats = response.data;  
    //     // alert(JSON.stringify(response.data))    
    //     this.queueCats = this.queueCats.reverse();
    //     this.loading = false;
    //   })
    //   .catch((error) => {
    //     this.$toast.add({
    //       severity: "error",
    //       summary: this.$t("smartenu.loadAllCategoriesError") + ":\n" + error,
    //       life: 3000,
    //     });
    //     if (error.response.status == 401) {
    //       this.$store.dispatch("logLout");
    //     }
    //   });
    // }, 
    deleteQueueCat(id) {
      axios
        .post(
          smartEnuApi + "/queue/delQueueCat",
          {
            id: id,
          },
          {
            headers: getHeader(),
          }
        )
        .then((response) => {
          if (response.status === 200) {
            this.getQueueCat();
          }
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.delNewsCategoryError") + ":\n" + error,
            life: 3000,
          });
        });
      this.deleteVisible = false;
      this.queueCat = {};
    },
    
    addQueueCat() {          
      this.submitted = true;
      axios
        .post(smartEnuApi + "/queue/addQueueCats", this.queueCat, {
          headers: getHeader(),          
        })        
        .then((response) => {
          if (response.data !== null) {
            this.$toast.add({
              severity: "success",
              summary: this.$t("smartenu.saveSuccess"),
              life: 3000,
            });
            this.getQueueCat();
          }
        })
        .catch((error) => {
          alert(JSON.stringify(error));
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.saveCategoryError") + ":\n" + error,
            life: 3000,
          });
        });
      this.editVisible = false;
      this.queueCat = {};
    },
    addDesk() {      
      var request = {userID: this.selectedMembers[0].userID} 
      this.desk.responsibleId=request.userID;
      // this.desk.catId=id;        
      this.submitted = true;
      this.desk.deskName;
      axios
        .post(smartEnuApi + "/queue/addQueueCatDesk", this.desk, {
          headers: getHeader(),          
        })        
        .then((response) => {
          if (response.data !== null) {
            this.$toast.add({
              severity: "success",
              summary: this.$t("smartenu.saveSuccess"),
              life: 3000,
            });
            // this.getQueue();
          }
        })
        .catch((error) => {
          alert(JSON.stringify(error));
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.saveCategoryError") + ":\n" + error,
            life: 3000,
          });
        });
      this.edit = false;
      this.desk = {};
      
    },      
    createQueueCategory() {    
    this.queueCat = {};
    this.editVisible = true;      
    this.queueCat.id = null;
    },   
    editCategory(id) {      
    this.queueCat = {};
    this.editVisible = true;      
    this.queueCat.catId = null;     
    let queueCat = this.queueCats.find((x) => x.catId === id);
    this.queueCat.catId = queueCat.catId;
    this.queueCat.CatNameKz = queueCat.catNameKz;
    this.queueCat.CatNameRu = queueCat.catNameRu;
    this.queueCat.CatNameEn = queueCat.catNameEn;    
    },
    delQueueCat(id) {      
      this.queueCat = {};
      this.queueCat = this.queueCats.find((x) => x.catId === id);      
      this.deleteVisible = true;
    },  
    
    createDesk(id) { 
      // alert(id)  
      this.desk = {};
      this.edit = true;      
      this.submitted = false;
      this.desk.catId = id;
    },
    editDesk() {
      this.category = {};
      this.edit = true;
      this.submitted = false;
      
    },      
  },
  created() {
    this.getQueueCat();
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
  justify-content: space-between;
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