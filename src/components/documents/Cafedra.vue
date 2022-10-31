<template>
    <div>
        <div class="p-col-12">
            <h3>{{$t('cafedra.title', {name: loginedUser.mainPosition.department['name'+$i18n.locale[0].toUpperCase() + $i18n.locale.slice(1)]})}}</h3>
            <Accordion   :activeIndex="0">
                <AccordionTab v-if="findRole(loginedUser, 'dephead')" :header="$t('cafedra.practiceResponsibles')">
                    <DataTable :value="responsibles" editMode="row" :loading="respLoading"  class="p-datatable-sm" dataKey="id" v-model:editingRows="editingRows" @row-edit-init="users=[]" @row-edit-save="onRowEditSave" responsiveLayout="scroll">
                        <Column v-if="$i18n.locale=='kz'" field="nameKz" :styles="{width:'20%'}"></Column>
                        <Column v-if="$i18n.locale=='ru'" field="nameRu" :styles="{width:'20%'}"></Column>
                        <Column v-if="$i18n.locale=='en'" field="nameEn" :styles="{width:'20%'}"></Column>
                   
                       
                        <Column field="responsible" :header="$t('cafedra.responsible')" :styles="{width:'20%'}">
                            <template #editor="slotProps">
                                <FindUser  :disabled="localReadonly" v-model="users" v-model:first="slotProps.data.responsible"  :max="1"/>
                            </template>
                            <template #body="slotProps">
                                {{slotProps.data.responsible != null ? slotProps.data.responsible.fullName : ""}}
                            </template>
                        </Column>
                        <Column :rowEditor="true" :styles="{width:'10%', 'min-width':'8rem'}" :bodyStyle="{'text-align':'center'}"></Column>
                    </DataTable>
                </AccordionTab>
                <AccordionTab :header="$t('cafedra.practiceManager')">
                    

                </AccordionTab>
                
            </Accordion>
        </div>
    </div>
    
</template>

<script>
import axios from 'axios';
import {getHeader, findRole, smartEnuApi} from "@/config/config";

export default {
  data() {
    return {
        responsibles: [],
        loginedUser: null,
        editingRows:[],
        users: [],
        respLoading: false,
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
        }
        if(this.findRole(this.loginedUser, 'dephead')) {
            this.getPracticeResponsibles()
        }
    },
    getPracticeResponsibles() {
        this.respLoading = true;
        axios
        .post(
          smartEnuApi + "/dic/getPracticeResponsibles",{},
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
            alert(error)
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
        }
      });
      
    },
    setPracticeResponsible(responsibleID, eduLevelID) {
        var req = {
            cafedraID: this.loginedUser.mainPosition.department.id,
            responsibleID: responsibleID,
            eduLevelID: eduLevelID
        }
        axios
        .post(
          smartEnuApi + "/dic/updatePracticeResponsible",
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

