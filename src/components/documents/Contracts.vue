<template>
<div>
  <div class="content-section">
    <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
    <div class="feature-intro ml-3">
      <h3>{{$t('contracts.title')}}</h3>
    </div>
    <ProgressBar v-if="saving" mode="indeterminate" style="height: .5em"/>
    <div class="card">
      <div class="p-col">
        <div class="box">
          <span><i class="pi pi-copy subtitle">&nbsp;{{$t('contracts.documents')}}</i></span>
          <div class="fieldmenu-item pb-3">
            <Button :label="$t('common.newDoc')" @click="openForm('createDocDialog')" class="p-button-link" /><br>
            <i class="mx-3">{{$t('contracts.create')}}</i>
          </div>
          <div class="fieldmenu-item pb-3">
            <router-link to="/documents/journal"  class="p-button p-button-link">{{$t('contracts.list')}}</router-link><br>
            <i class="mx-3">{{$t('contracts.listdesc')}}</i>
          </div>
        </div>

        <div class="box">
          <span><i class="pi pi-id-card subtitle" >&nbsp;{{$t('common.refinf')}}</i></span>
          <div class="fieldmenu-item pb-3">
            <Button :label="$t('common.organization')" class="p-button-link" /><br>
            <i class="mx-3">{{$t('contracts.orgdesc')}}</i>
          </div>
          <div class="fieldmenu-item pb-3">
           <Button :label="$t('common.person')" class="p-button-link" /><br>
            <i class="mx-3">{{$t('contracts.person')}}</i>
          </div>
        </div>
      </div>
    </div>

  </div>
  <Sidebar v-model:visible="dialogOpenState.createDocDialog" position="right"
  :modal="true" :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '760px', overflow:'hidden'}">
  <div class="flex">
    <SelectButton disabled="true" v-model="selectedDocSourceType" :options="docSourceType" class="mb-3 mr-3">
      <template #option="slotProps">
        <div v-if="slotProps.option == DocState.DocSourceType.Template">{{$t('contracts.fromtemplate')}}</div>
        <div v-else>{{$t('contracts.fromdoc')}}</div>
	    </template>
    </SelectButton>
    <SelectButton  @change="changeLanguage" v-model="selectedDocLanguage" :options="languages" class="mb-3">
      <template #option="slotProps">
        <div v-if="slotProps.option == 'kz'">{{$t('common.language.kz')}}</div>
        <div v-else>{{$t('common.language.ru')}}</div>
	    </template>
    </SelectButton>
  </div>
    <div v-if="selectedDocSourceType == DocState.DocSourceType.Template" style="overflow-y:hidden" >
      <div class="flex">
<!-- <DataTable
              class="p-datatable-sm"
              v-model:selection="selectedTemplate"
              selectionMode="single"
              :value="docTemplates"
              :paginator="true"
              :rowHover="true"
              :filters="filters"
              :loading="loading"
              :lazy="true"
              :totalRecords="count"
              @page="onPage($event)"
              @sort="onSort($event)"
              :rows="lazyParams.rows"
              dataKey="id"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[10, 25, 50]"
              :currentPageReportTemplate="
                $t('common.showingRecordsCount', {
                  first: '{first}',
                  last: '{last}',
                  totalRecords: '{totalRecords}',
                })
              "
              responsiveLayout="scroll"
            >
              <template #empty>
                {{ this.$t("common.recordsNotFound") }}
              </template>

              <template #loading>
                {{ this.$t("common.recordsLoading") }}
              </template>
              <Column
                :field="('kz' ? 'nameKaz' : 'nameRus')"
                :header="$t('hdfs.fileName')"
                :sortable="true"
              ></Column>
              <Column>

              </Column>
             
            </DataTable> -->
      <DocTemplate ref="templateComponent" @languageChanged="templateLanguageChanged" v-model:currentLang="selectedDocLanguage" @onselect="createDocByTemplate($event)" selectMode="true" v-model:windowOpened="dialogOpenState.createDocDialog" :v-model="selectedTemplate"></DocTemplate>
     
 
      </div>
    </div>
    <Card v-else>
      <template #content>
        <HdfsUpload></HdfsUpload>
      </template>  
      <template #footer>
        <Button v-bind:label="$t('common.createNew')" icon="pi pi-check" autofocus @click="createDoc" />
      </template>
    </Card>

    
      
  </Sidebar>
         <Sidebar :visible="false" position="right"
  :modal="true" :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '760px', overflow:'hidden'}">
        <div v-if="selectedTemplate != null">
          <RichEditor v-if="selectedDocLanguage === 'kz'" :readonly="true"  v-model="selectedTemplate.mainTextKaz" editorStyle="height:300px;width:400px;max-width:700px">
            <template v-slot:toolbar></template>
          </RichEditor>
          <RichEditor v-else :readonly="true"  v-model="selectedTemplate.mainTextRus" editorStyle="height:300px;width:400px;max-width:700px">
            <template v-slot:toolbar></template>
          </RichEditor>
        </div>
        </Sidebar>
</div>
</template>
<script>
  import {smartEnuApi, getHeader} from "@/config/config";
  import axios from 'axios';
  import DocState from "@/enum/docstates/index";
  import RichEditor from "./editor/RichEditor.vue";
  import HdfsUpload from "@/components/hdfs/HdfsUpload";
  import DocTemplate from "@/components/documents/DocTemplate.vue"
  export default {
    components: { RichEditor, HdfsUpload, DocTemplate},
    data() {
      return {
        dialogOpenState: {
          createDocDialog: false,
        },
        saving: false,
        docTemplates:[],
        selectedTemplate: null,
        DocState: DocState,
        selectedDocSourceType : DocState.DocSourceType.Template,
        docSourceType: [DocState.DocSourceType.Template, DocState.DocSourceType.FilledDoc],
        languages: ["kz", "ru"],
        selectedDocLanguage : "kz",
        lazyParams: {
          page: 0,
          rows: 10,
          userType: Number(this.$route.params.type),
          sortLang: this.$i18n.locale,
      },

      }
    },
    methods: {
      changeLanguage() {
        this.$refs.templateComponent.changeLanguage(this.selectedDocLanguage)
      },
      templateLanguageChanged(lang) {
        this.selectedDocLanguage = lang
      },
      openForm(formName,node) {
        this.dialogOpenState[formName] = true;
        if (node != null) {
          this.selectedNode = node;
        }
      },
      closeForm(formName) {
        this.dialogOpenState[formName] = false;
      },
      showMessage(msgtype,message,content) {
        this.$toast.add({severity:msgtype, summary: message, detail:content, life: 3000});
      },
      createDoc() {
        
        let url ="/agreement/create";
        var req = {
          sourceType : this.selectedDocSourceType,
          templateId: this.selectedTemplate != null ? this.selectedTemplate.id : null,
          creatorId: 1,
          filePath: "",
          lang: this.selectedDocLanguage == "kz" ? 0 : 1
        }
        if (this.selectedTemplate != null) {
          req.lang = this.selectedTemplate.templateLanguage == "kz" ? 0 : 1
        }
        this.saving=true;
        axios.post(smartEnuApi+url, req, { headers: getHeader() }).then(responce=>{
          this.showMessage('success', this.$t('contracts.title'), this.$t('contracts.message.created'));
          this.saving =false;
          this.$router.push({ path: '/documents/contract/' + responce.data});


        })
        .catch(error => {
          this.saving =false;
          console.log(error);
        })
      },
      createDocByTemplate(event) {
        let url ="/agreement/create";
        var req = {
          sourceType : DocState.DocSourceType.Template,
          templateId: event.value.id,
          creatorId: this.$store.state.loginedUser.userID,
          filePath: "",
          lang: this.selectedDocLanguage == "kz" ? 0 : 1,
          byParams: true
        }
        this.saving = true;
        
        axios.post(smartEnuApi+url, req, { headers: getHeader() }).then(responce=>{
          this.saving = false;
          this.showMessage('success', this.$t('contracts.title'), this.$t('contracts.message.created'));
          this.$router.push({ path: '/documents/contract/' + responce.data.id});
        })
        .catch(_ => {
          this.saving = false;
        })
      },
      addTemplateNode(nodeDataChildren,node) {
        let childData = new Object();
        childData.id=node.id;
        if (node.History != null) {
          childData.stateID = node.History[0].id;
          childData.state =  this.$i18n.locale == "kz" ? node.History[0].stateKaz : this.$i18n.locale == "ru" ?  node.History[0].stateRus : node.History[0].stateEn;
          childData.stateEn =  node.History[0].stateEn;

        }
        childData.namekz= node.descriptionKaz;
        childData.nameru= node.descriptionRus;
        childData.createdDate = node.createDate;
        childData.mainTextKaz = node.mainTextKaz
        childData.mainTextRus = node.mainTextRus
        childData.type = 0;
        childData.typeText= this.$t('common.doc');
        nodeDataChildren.push(childData);
        return childData;
      },
      initApiCall(){
        let url = "/doctemplates?groupID=1";
        this.saving = true;
        axios.get(smartEnuApi+url, { headers: getHeader() })
        .then(res=>{
          res.data.forEach(el => {
            if(el.DocTemplates){
              el.DocTemplates.forEach((child)=>{
                this.addTemplateNode(this.docTemplates, child)
              })
            }
          });
          this.saving= false;
        })
        .catch(_ => {
          this.saving=false;
        })
      }
    },
    mounted() {
      this.initApiCall(
      );
    },
  }
</script>

<style scoped lang="scss">
  .subtitle {
    font-size: 20px;
    letter-spacing: .3px;
  }
  .menu-item {
    margin-bottom: 3px;
    padding-left: 15px;
  }
  .menu-item:hover {
    background-color:#edf0f5;
  }
</style>