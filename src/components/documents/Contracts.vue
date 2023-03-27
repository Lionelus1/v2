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
    <SelectButton :disabled="!this.$store.state.loginedUser.organization || !this.$store.state.loginedUser.organization.id || 
      this.$store.state.loginedUser.organization.id !== 1 || this.findRole(null, 'student')" 
      v-model="selectedDocSourceType" :options="docSourceType" class="mb-3 mr-3">
      <template #option="slotProps">
        <div v-if="slotProps.option == Enum.DocSourceType.Template">{{$t('contracts.fromtemplate')}}</div>
        <div v-else>{{$t('contracts.fromdoc')}}</div>
	    </template>
    </SelectButton>
    <SelectButton @change="changeLanguage" v-model="selectedDocLanguage" :options="languages" class="mb-3"
      :disabled="selectedDocSourceType != Enum.DocSourceType.Template">
      <template #option="slotProps">
        <div v-if="slotProps.option == 'kz'">{{$t('common.language.kz')}}</div>
        <div v-else>{{$t('common.language.ru')}}</div>
	    </template>
    </SelectButton>
  </div>
    <div v-if="selectedDocSourceType == Enum.DocSourceType.Template" style="overflow-y:hidden" >
      <div class="flex">
        <DocTemplate ref="templateComponent" @languageChanged="templateLanguageChanged" v-model:currentLang="selectedDocLanguage" @onselect="createDocByTemplate($event)" selectMode="true" v-model:windowOpened="dialogOpenState.createDocDialog" :v-model="selectedTemplate"></DocTemplate>
      </div>
    </div>
    <Card v-else>
      <template #content>
        <PostFile :fileUpload="true" :modelValue="file" directory="readyMadeContract" @updated="fileUpdated"></PostFile>
      </template>
    </Card>
  </Sidebar>
</div>
</template>
<script>
  import { smartEnuApi, getHeader, findRole } from "@/config/config";
  import axios from 'axios';
  import Enum from "@/enum/docstates/index";
  import DocTemplate from "@/components/documents/DocTemplate.vue"
  import PostFile from "./PostFile.vue"

  export default {
    components: { PostFile, DocTemplate},
    data() {
      return {
        dialogOpenState: {
          createDocDialog: false,
        },
        saving: false,
        docTemplates:[],
        selectedTemplate: null,
        Enum: Enum,
        selectedDocSourceType : Enum.DocSourceType.Template,
        docSourceType: [Enum.DocSourceType.Template, Enum.DocSourceType.FilledDoc],
        languages: ["kz", "ru"],
        selectedDocLanguage : "kz",
        lazyParams: {
          page: 0,
          rows: 10,
          userType: Number(this.$route.params.type),
          sortLang: this.$i18n.locale,
        },
        findRole: findRole,
        file: {
          namekz: '',
          nameru: '',
          nameen: '',
          id: null,
          lang: null,
          docType: Enum.DocType.Contract,
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
          sourceType : Enum.DocSourceType.Template,
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
      fileUpdated(event) {
        this.$router.push({ path: '/documents/contract/' + event.id });
      },
    },
    mounted() {
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