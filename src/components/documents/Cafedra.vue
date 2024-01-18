<template>
    <div>
        <div class="col-12">
            <h3>{{$t('cafedra.title', {name: loginedUser.mainPosition.department['name'+$i18n.locale[0].toUpperCase() + $i18n.locale.slice(1)]})}}</h3>
            <Accordion   :activeIndex="0">
                <AccordionTab v-if="findRole(loginedUser, 'dephead')" :header="$t('cafedra.practiceResponsibles')">
                    <DataTable :value="responsibles" editMode="row" :loading="respLoading"  class="p-datatable-sm" dataKey="id" v-model:editingRows="editingRows"  @row-edit-save="onRowEditSave" responsiveLayout="scroll" @cell-edit-cancel="cancelEdit" >
                        <Column v-if="$i18n.locale=='kz'" field="nameKz" :styles="{width:'20%'}"></Column>
                        <Column v-if="$i18n.locale=='ru'" field="nameRu" :styles="{width:'20%'}"></Column>
                        <Column v-if="$i18n.locale=='en'" field="nameEn" :styles="{width:'20%'}"></Column>
                        <Column field="responsible" :header="$t('cafedra.responsible')" :styles="{width:'20%'}">
                            <template #editor="slotProps">
                                <FindUser  :disabled="localReadonly" v-model="slotProps.data.users" v-model:first="slotProps.data.responsible"  :max="1"/>
                            </template>
                            <template #body="slotProps">
                                {{slotProps.data.responsible != null ? slotProps.data.responsible.fullName : ""}}
                            </template>
                        </Column>
                        <Column :rowEditor="true" :styles="{width:'10%', 'min-width':'8rem'}" :bodyStyle="{'text-align':'center'}"></Column>
                    </DataTable>
                </AccordionTab>
                <AccordionTab :header="$t('cafedra.practiceManager')">
                    <TreeTable  :scrollable="true" :expandedKeys="expandedKeys" :scrollHeight="windowHeight + 'px'" class="p-treetable-sm" :value="managers" :lazy="true" :loading="managersLoading"
                        @nodeExpand="onExpand($event, true)"  selectionMode="single" v-model:selectionKeys="selected">
                        <Column field="name" :header="$t('common.name')" :expander="true">
                            <template #body="slotProps">{{slotProps.node.name}}</template>
                        </Column>
                        <Column field="practiceManager" :header="$t('cafedra.practiceManager')">
                            <template #body="slotProps">
                                <span v-if="!slotProps.node.editing">{{slotProps.node.practiceManager != null ? slotProps.node.practiceManager.fullName : ""}}</span>
                                <FindUser v-else v-model="slotProps.node.users" v-model:first="slotProps.node.practiceManager" :max="1"></FindUser>
                            </template>
                        </Column>
                        <Column filed="editing">
                            <template #body="slotProps">
                                <div v-if="slotProps.node.editing">
                                    <Button icon="pi pi-check" class="p-button-rounded p-button-secondary p-button-text" @click="setManager(slotProps.node)"/>
                                    <Button icon="pi pi-times" class="p-button-rounded p-button-secondary p-button-text" @click="slotProps.node.editing=false;slotProps.node.users=null;"/>
                                </div>
                                <div v-else>
                                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-secondary p-button-text" @click="slotProps.node.editing=true" />
                                </div>
                            </template>
                        </Column>
                        </TreeTable>
                </AccordionTab>
                
            </Accordion>
        </div>
    </div>
    
</template>

<script>
import api from '@/service/api';
import {getHeader, findRole, smartEnuApi} from "@/config/config";

export default {
  data() {
    return {
        responsibles: [],
        windowHeight: window.innerHeight - 270,
        managers: [],
        loginedUser: null,
        editingRows:[],
        users: [],
        respLoading: false,
        managersLoading: false,
        selected: null,


    }
  },
  created() {
    this.init(),
    this.loginedUser = this.$store.state.loginedUser;
  },
  methods: {
    findRole: findRole,
    init() {
        if (!(this.findRole(this.loginedUser, "dephead") || this.findRole(this.loginedUser,"practice_responsible"))) {
            this.$router.push('/access') 
        } else {
            this.getPracticeManagers(null)
        }
        if(this.findRole(this.loginedUser, 'dephead')) {
            this.getPracticeResponsibles()
        }
    },
    getPracticeResponsibles() {
        this.respLoading = true;
        api
        .post(
          "/dic/getPracticeResponsibles",{},
          {
            headers: getHeader(),
          }
        )
        .then(res => {
          this.responsibles = res.data
          this.respLoading = false;
        })
        .catch(error => {
            this.respLoading = false;
        if (error.response == null || error.response == undefined) {
            console.log(error)
        }
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: "Dictionary load error:\n" + error,
              life: 3000,
            });
          }
        });
        
    },
    onExpand(node) {
        this.getPracticeManagers(node)
    },
    getPracticeManagers(node) {
        this.managersLoading = true;
        api
        .post(
          "/dic/getPracticeManagers",{groupID: node !=null ? Number(node.key) : null},
          {
            headers: getHeader(),
          }
        )
        .then(res => {
            if (node == null) {
                this.managers = res.data
            } else {
                node.children = res.data
            }
          this.managersLoading = false;
        })
        .catch(error => {
            this.managersLoading = false;
        if (error.response == null || error.response == undefined) {
            console.log(error)
        }
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: "Dictionary load error:\n" + error,
              life: 3000,
            });
          }
        });

    },
    onRowEditSave(event) {
        this.users = []
        this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
            let { newData, index } = event;
            this.responsibles[index] = newData;
            this.setPracticeResponsible(this.responsibles[index].responsible.userID, this.responsibles[index].id)
            this.responsibles[index].users = []
        }
      });
      
    },
    setManager(node) {
        node.editing = false;
        var req = {}
        if (node.practiceManager != null) {
            req.managerID = node.practiceManager.userID
        }
        if (node.isStudent) {
            req.studentID = node.id
        } else {
            req.groupID = node.id
        }
      
        api
        .post(
          "/dic/setPracticeManager",
         req,
          {
            headers: getHeader(),
          }
        )
        .then(res => {
            if (node.isStudent) {
                node.children = res.data
            }
         
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: "Dictionary load error:\n" + error,
              life: 3000,
            });
          }
        });
        node.users = []

    },
    cancelEdit(event) {
        let { newData, index } = event;
        this.responsibles[index].users = [];
    },
    setPracticeResponsible(responsibleID, eduLevelID) {
        var req = {
            cafedraID: this.loginedUser.mainPosition.department.id,
            responsibleID: responsibleID,
            eduLevelID: eduLevelID
        }
        api
        .post(
          "/dic/updatePracticeResponsible",
         req,
          {
            headers: getHeader(),
          }
        )
        .then(res => {
          console.log(res.data)
         
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: "Dictionary load error:\n" + error,
              life: 3000,
            });
          }
        });
    }
  }
}

</script>

