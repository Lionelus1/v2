<template>
<div>
  <div class="content-section">
    <div class="feature-intro">
      <h1>{{$t('contracts.title')}}</h1>
    </div>
    <div class="p-grid card">
      <div class="p-col">
        <div class="box">
          <span><i class="pi pi-copy subtitle">&nbsp;{{$t('contracts.documents')}}</i></span>
          <div class="p-field menu-item p-pb-3">
            <Button :label="$t('common.newDoc')" @click="openForm('createDocDialog')" class="p-button-link" /><br>
            <i class="p-mx-3">{{$t('contracts.create')}}</i>
          </div>
          <div class="p-field menu-item p-pb-3">
            <Button :label="$t('contracts.list')" class="p-button-link" /><br>
            <i class="p-mx-3">{{$t('contracts.listdesc')}}</i>
          </div>
        </div>

        <div class="box">
          <span><i class="pi pi-id-card subtitle" >&nbsp;{{$t('common.refinf')}}</i></span>
          <div class="p-field menu-item p-pb-3">
            <Button :label="$t('common.organization')" class="p-button-link" /><br>
            <i class="p-mx-3">{{$t('contracts.orgdesc')}}</i>
          </div>
          <div class="p-field menu-item p-pb-3">
           <Button :label="$t('common.person')" class="p-button-link" /><br>
            <i class="p-mx-3">{{$t('contracts.person')}}</i>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-bind:header="$t('common.newDoc')" v-model:visible="dialogOpenState.createDocDialog" :modal="true" :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '760px', overflow:'hidden'}">
  <div class="p-d-flex">
    <SelectButton v-model="selectedDocSourceType" :options="docSourceType" class="p-mb-3 p-mr-3">
      <template #option="slotProps">
        <div v-if="slotProps.option == DocState.DocSourceType.Template">{{$t('contracts.fromtemplate')}}</div>
        <div v-else>{{$t('contracts.fromdoc')}}</div>
	    </template>
    </SelectButton>
    <SelectButton v-model="selectedDocLanguage" :options="languages" class="p-mb-3">
      <template #option="slotProps">
        <div v-if="slotProps.option == 'kz'">{{$t('common.language.kz')}}</div>
        <div v-else>{{$t('common.language.ru')}}</div>
	    </template>
    </SelectButton>
  </div>
    <div v-if="selectedDocSourceType == DocState.DocSourceType.Template" style="overflow-y:hidden" >
      <div class="p-d-flex">
        <div class="p-mr-2" style="width:300px">
          <Listbox v-model="selectedTemplate" :options="docTemplates" optionLabel="name" :filter="true" listStyle="max-height:300px" style="width:300px;height:320px" :filterPlaceholder="$t('hdfs.search')"/>
        </div>
        <div v-if="selectedTemplate != null">
          <RichEditor v-if="selectedDocLanguage == 'kz'" :readonly="true"  v-model="selectedTemplate.mainTextKaz" editorStyle="height:300px;width:400px;max-width:700px">
            <template v-slot:toolbar></template>
          </RichEditor>
          <RichEditor v-else :readonly="true"  v-model="selectedTemplate.mainTextRus" editorStyle="height:300px;width:400px;max-width:700px">
            <template v-slot:toolbar></template>
          </RichEditor>
        </div>
      </div>
    </div>
    <div v-else>
      <HdfsUpload></HdfsUpload>
    </div>

    <template #footer>
      <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('createDocDialog')" class="p-button-text"/>
      <Button v-bind:label="$t('common.yes')" icon="pi pi-check" autofocus @click="createDoc" />
    </template>
  </Dialog>
</div>
</template>
<script>
  import {apiDomain} from "@/config/config";
  import axios from 'axios';
  import DocState from "@/enum/docstates/index";
  import RichEditor from "./editor/RichEditor.vue";
  import HdfsUpload from "@/components/hdfs/HdfsUpload";

  export default {
    components: { RichEditor, HdfsUpload},
    data() {
      return {
        dialogOpenState: {
          createDocDialog: false,
        },
        docTemplates:[],
        selectedTemplate: null,
        DocState: DocState,
        selectedDocSourceType : DocState.DocSourceType.Template,
        docSourceType: [DocState.DocSourceType.Template, DocState.DocSourceType.FilledDoc],
        languages: ["kz", "ru"],
        selectedDocLanguage : "kz",

      }
    },
    methods: {
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
        console.log(req);
        axios.post(apiDomain+url, req).then(responce=>{
          this.showMessage('success', this.$t('contracts.title'), this.$t('contracts.message.created'));
          this.$router.push({ path: '/documents/contract/' + responce.data});

        })
        .catch(error => {
          console.log(error);
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
        childData.name=node.description;
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
        axios.get(apiDomain+url)
        .then(res=>{
          res.data.forEach(el => {
            if(el.DocTemplates){
              el.DocTemplates.forEach((child)=>{
                this.addTemplateNode(this.docTemplates, child)              })
            }
          });
        })
        .catch(error => {
            console.error(error)
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