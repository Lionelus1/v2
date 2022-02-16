<template>
  <div>
    <div v-if="!selectMode" class="content-section introduction">
      <div class="feature-intro p-ml-3">
        <h3>{{$t('doctemplate.title')}}</h3> 
      </div>
    </div>
    <div class="content-section implementation">
      <ProgressBar v-if="signing" mode="indeterminate" style="height: .5em" />
      <div class="card p-p-0">
        <TabView ref="templateView" v-model:activeIndex="active" class="p-p-0">
          <TabPanel v-bind:header="$t('doctemplate.templates')" class="p-p-0">
            <template #left>
            </template>
            <!-- Жаңа қалта құру диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('common.newCatalog')" :contentStyle="{overflow: 'visible'}" v-model:visible="dialogOpenState.addFolder" :style="{width: '50vw'}">
              <div class="p-fluid">
                  <label for="foldername" >{{$t('common.nameInQazaq')}}</label>
                  <InputText id="fodernamekaz" v-model="createdFolder.nameKaz" type="text" />
                  <label for="foldernamerus">{{$t('common.nameInRussian')}}</label>
                  <InputText id="foldernamerus" v-model="createdFolder.nameRus"  type="text"  />
                  <label for="foldernameen">{{$t('common.nameInEnglish')}}</label>
                  <InputText id="foldernameen" v-model="createdFolder.nameEn"  type="text" />
                  <label for="foldercode">{{$t('common.code')}}</label>
                  <InputText id="foldercode" v-model="createdFolder.code"  type="text" />
                  <label for="foldergroup">{{$t('common.userGroup')}}</label>
                  <MultiSelect v-model="createdFolder.groups" :options="groupsData" optionLabel="name" v-bind:placeholder="$t('common.selectGroup')" :filter="true" display="chip"/>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('addFolder')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="createNewFolder" autofocus />
              </template>
            </Dialog>
            <!-- Жаңа үлгі құру диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('doctemplate.newTemplate')" v-model:visible="dialogOpenState.addTemplate" :style="{width: '50vw'}">
              <div class="p-fluid">
                <div class="p-field">
                    <label for="dtdescriptionkz">{{$t('doctemplate.description')}} ({{$t('common.language.kz')}})</label>
                    <InputText id="dtdescriptionkz" class="p-mb-2" v-bind:placeholder="$t('common.description')" v-model="createdTemplate.descriptionKaz" type="text" />
                    <label for="dtdescriptionru">{{$t('doctemplate.description')}}  ({{$t('common.language.ru')}})</label>
                    <InputText id="dtdescriptionru" class="p-mb-2" v-bind:placeholder="$t('common.description')" v-model="createdTemplate.descriptionRus" type="text" />
                </div>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('addTemplate')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="createNewDocTemplate" autofocus />
              </template>
            </Dialog>

            <TreeTable :scrollable="selectMode" :value="templates" class="p-treetable-responsive p-treetable-sm" selectionMode="single" @node-select="onNodeSelect" v-model:selectionKeys="currentNode" style="margin-bottom: 2rem">
              <Column headerStyle="width:6em" :expander="true" bodyStyle="padding: 0">
                <template #body="slotProps">
                  <i v-if="slotProps.node.data.type===1" class="pi pi-folder"></i>
                  <i v-else class="pi pi-file"></i>
                </template>
              </Column>
              
              <Column field="name" v-bind:header="$t('common.name')">
                <template #body="slotProps">
                  <Button class="p-button-link" style="text-align:left" v-if="selectMode && slotProps.node.data.type===0" @click="select($event,slotProps.node)" v-tooltip.bottom="$t('common.choose')">{{slotProps.node.data.name}}</Button>
                  <span v-else>{{slotProps.node.data.name}}</span>
                  <span class="sm-visible"> /{{slotProps.node.data.typeText}}</span>
                  <span  v-if="slotProps.node.data.state!=null" class="sm-visible"> /{{slotProps.node.data.state}}</span>
                  <span v-if="slotProps.node.data.updatedDate!=null" class="sm-visible"> /{{slotProps.node.data.updatedDate}}</span>
                </template>
              </Column>
              <Column field="code" v-bind:header="$t('common.code')" headerClass="sm-invisible" bodyClass="sm-invisible"></Column>
              <Column v-if="!selectMode" field="createdDate" v-bind:header="$t('common.created')"  headerClass="sm-invisible" bodyClass="sm-invisible">
                <template #body="slotProps">
                    {{slotProps.node.data.createdDate ? slotProps.node.data.createdDate.replace('Z', '').replace('T', ' '): ''}}
                </template>
              </Column>
              <Column v-if="!selectMode" field="state" v-bind:header="$t('common.state')" headerClass="sm-invisible" bodyClass="sm-invisible">
                <template #body="slotProps">
                  <span :class="'template-status ' + slotProps.node.data.stateEn"> {{slotProps.node.data.state}}</span>
                </template>

              </Column>
              <Column field="updatedDate" v-bind:header="$t('common.updated')" headerClass="sm-invisible" bodyClass="sm-invisible">
               <template #body="slotProps">
                    {{slotProps.node.data.updatedDate ? slotProps.node.data.updatedDate.replace('Z', '').replace('T', ' ') : ''}}
                </template>
              </Column>
              <Column headerStyle="width: 8em" headerClass="p-text-center" bodyClass="p-text-center">
              <template #header>
                  <Button v-if="!selectMode" icon="pi pi-plus" class="p-button-blue" @click="openForm('addFolder')" v-tooltip.bottom="$t('common.newCatalog')"  />
              </template>
              <template #body="slotProps">
                  <Button v-if="slotProps.node.data.type==1 && !selectMode" type="button" icon="pi pi-plus" @click="openForm('addTemplate',slotProps.node)" class="p-button-success" v-tooltip.bottom="$t('doctemplate.newTemplate')"></Button>
                  <Button v-if="slotProps.node.data.type!=1" type="button" icon="pi pi-search" class="p-button-warning" @click="editDocTemplate(slotProps.node)" v-tooltip.bottom="$t('common.show')"></Button>&nbsp;
                  <Button v-if="slotProps.node.data.type!=1 && slotProps.node.data.stateEn == DocState.REVISION.Value" icon="pi pi-comment" @click="openForm('dialogComment',slotProps.node)" v-tooltip.bottom="$t('common.comment')"></Button>
                  <Button v-if="selectMode && slotProps.node.data.type!=1" icon="pi pi-check-circle" class="p-button-success ml-2" @click="select($event,slotProps.node)" v-tooltip.bottom="$t('common.choose')"></Button>
                  
              </template>
            </Column>
            <!-- <template v-if="selectMode" #footer>
                <Button label="OK" icon="pi pi-check" @click="closeForm('dialogComment')" class="p-button-blue">{{$t('common.select')}}</Button>
            </template> -->
          </TreeTable>
          </TabPanel>
          <TabPanel v-bind:header="$t('doctemplate.selected')" :disabled="(selectedNode.data.type == null || selectedNode.data.type == 1)">
            <div class="p-formgroup-inline">
              <span class="p-buttonset">
                <Button v-if="(selectedNode.data.stateEn == DocState.CREATED.Value || selectedNode.data.stateEn == DocState.REVISION.Value)" v-bind:label="$t('common.save')" icon="pi pi-save" @click="saveDocTemplate"/>
                <Button v-bind:label="$t('common.download')" icon="pi pi-file-pdf" @click="downloadDocTemplatePdf" />
                <Button v-if="selectedNode.data.stateEn == DocState.CREATED.Value || selectedNode.data.stateEn == DocState.REVISION.Value" v-bind:label="$t('common.toapprove')" icon="pi pi-send" @click="openForm('toApproval')" />
                <Button v-if="selectedNode.data.stateEn == DocState.INAPPROVAL.Value && findRole(null, DocState.roles.LegalServiceHead)" class="p-button-success" :label ="$t('common.approve')" icon="pi pi-check" @click="approve()"/>
                <Button v-if="selectedNode.data.stateEn == DocState.INAPPROVAL.Value && findRole(null, DocState.roles.LegalServiceHead)" class="p-button-warning" :label ="$t('common.revision')" icon="pi pi-times" @click="openForm('revision')"/>
              </span>

              <SelectButton v-model="templateLanguage" :options="language" class="p-mb-3">
                <template #option="slotProps">
                  <div v-if="slotProps.option == 'kz'">{{$t('common.language.kz')}}</div>
                  <div v-else-if="slotProps.option == 'ru'">{{$t('common.language.ru')}}</div>
                  <div v-else>{{$t('common.language.en')}}</div>
                </template>
              </SelectButton>
            </div>
            <RichEditor :readonly="selectMode" ref="kzEditor" v-if="templateLanguage =='kz'" v-model="selectedNode.data.mainTextKaz" editorStyle="height:500px;max-width:700px;min-width:500px">
              <template v-slot:toolbar>
                <span class="ql-formats">
                  <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                  <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                  <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-background" v-tooltip.bottom="'Color'"></select>
                </span>
                <span class="ql-formats">
                  <button class="ql-list" value="ordered"></button>
                  <button class="ql-list" value="bullet"></button>
                  <select class="ql-align">
                    <option defaultValue></option>ß
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>

              </template>
            </RichEditor>
            <RichEditor :readonly="selectMode" ref="kzEditor" v-else v-model="selectedNode.data.mainTextRus" editorStyle="height:500px;max-width:700px;min-width:500px">
              <template v-slot:toolbar>
                <span class="ql-formats">
                  <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                  <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                  <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                  <select class="ql-background" v-tooltip.bottom="'Color'"></select>
                </span>
                <span class="ql-formats">
                  <button class="ql-list" value="ordered"></button>
                  <button class="ql-list" value="bullet"></button>
                  <select class="ql-align">
                    <option defaultValue></option>
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                </span>
                
              </template>
            </RichEditor>
            <!-- Келісімге жіберу диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('common.toapprove')" v-model:visible="dialogOpenState.toApproval" :style="{width: '50vw'}">
              <div class="p-fluid">
                <div class="p-field">
                    <label for="dialognote">{{$t('common.comment')}}</label>
                    <InputText id="dialognote" class="p-mb-2" v-bind:placeholder="$t('common.comment')" v-model="dialogNote" type="text" />
                    <label for="approvingusers">{{$t('doctemplate.approvingUsers')}}</label>
                    <FindUser v-model="selectedUsers" id="approvingusers"></FindUser>
                </div>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('toApproval')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="sendToApproval" autofocus />
              </template>
            </Dialog>
            <!-- Қайтару диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('common.revision')" v-model:visible="dialogOpenState.revision" :style="{width: '50vw'}">
              <div class="p-fluid">
                <div class="p-field">
                    <label for="dialognote">{{$t('common.comment')}}</label>
                    <InputText id="dialognote" class="p-mb-2" v-bind:placeholder="$t('common.comment')" v-model="revisionComment" type="text" />
                </div>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('toApproval')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="revisionTemplate" autofocus />
              </template>
            </Dialog>

            <Dialog :header="$t('common.comment')" v-model:visible="dialogOpenState.dialogComment" :style="{width: '50vw'}">
            <p>{{(selectedNode.data.comment && selectedNode.data.comment != '') ? selectedNode.data.comment : $t('common.noComment')}}</p>
           
            <template #footer>
              <div style="text-align:right">
                <Button label="OK" icon="pi pi-check" @click="closeForm('dialogComment')" class="p-button-text"/>
              </div>
            </template>
        </Dialog>

          </TabPanel>
        </TabView>
      </div>

    </div>
    
    
  </div>
</template>

<script>
  import {smartEnuApi, findRole, getHeader} from "@/config/config";
  import {runNCaLayer} from "@/helpers/SignDocFunctions"
  import axios from 'axios';
  import RichEditor from "./editor/RichEditor.vue";
  import FindUser from "@/helpers/FindUser";
  import DocState from "@/enum/docstates/index"

  export default {
    emits: ['onselect'],
    components: { RichEditor, FindUser },
    data() {
      return {
        readonly : true,
        currentNode: null,
        selectedUsers: null,
        dialogNote: "",
        revisionComment: "",
        selectedNode: {
          data : {},
        },
        signing : false,
        DocState: DocState,
        templateLanguage: 'kz',
        dialogOpenState: {
          addFolder : false,
          addTemplate : false,
          toApproval : false,
          revision :false,
          dialogComment: false,
        },
        active: 0,
        templates: null,
        groupsData: [
          {name: 'студент', id: 0},
          {name: 'кафедра меңгерушісі', id: 1},
          {name: 'қызметкер', id: 2},
          {name: 'заңгер', id: 3},
          ],
        language: ['kz', 'ru'],
        createdFolder: {
          groups: null,
          nameKaz: '',
          nameRus: '',
          nameEn: '',
          id: -1,
          createdDate: null,
          updatedDate: null,
        },
        createdTemplate: {
          creatorId: 1,
          mainTextKaz: '',
          mainTextRus: '',
          descriptionKaz: '',
          descriptionRus: '',
          folderID: -1,
        },
      }
    },
     props: {
      selectMode: Boolean,
      modelValue: null,
      windowOpened: Boolean,
    },
    setup(props, context) {
      function updateValue(event, node) {
        context.emit("modelValue", node);
        context.emit("update:windowOpened", false);
        this.$emit('onselect', {
                originalEvent: event,
                value: node
            });
      }
      return {
        updateValue,
      };
  },
    methods: {
      select(event, node) {
        this.updateValue(event,node)
      },
      showMessage(msgtype,message,content) {
        this.$toast.add({severity:msgtype, summary: message, detail:content, life: 3000});
      },
     
      findRole: findRole,
      openForm(formName,node) {

        this.dialogOpenState[formName] = true;
        if (node != null) {
          this.selectedNode = node;
        }
      },
      closeForm(formName) {
        this.dialogOpenState[formName] = false;
      },
      approve() {
        this.$confirm.require({
          message: this.$t('common.confirmation'),
          header: this.$t('common.approve'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
                axios.post(smartEnuApi + "/doctemplate/getbase64",
                { id: this.selectedNode.id},  
                { headers: getHeader() }).then(
                  response => {
                    runNCaLayer(this.$t, this.$toast, response.data).then(sign=>{
                      this.signing = true
                      if (sign != undefined) {

                        var req = {
                          userID : this.$store.state.loginedUser.userID,
                          id: this.selectedNode.id,
                          sign: sign
                        };
                        axios.post(smartEnuApi+"/doctemplate/sign", req, { headers: getHeader() }).then(response=>{
                        this.selectedNode.data.stateID = this.DocState.APPROVED.ID;
                        this.selectedNode.data.state =  this.$t('common.states.approved');
                        this.selectedNode.data.stateEn =  this.DocState.APPROVED.Value;
                        this.showMessage('success', this.$t('doctemplate.title'), this.$t('common.message.succesSendToApproval'));
                        this.signing = false;
                      }).catch(error => {
                          if (error.response.status == 405) {
                            this.$toast.add({
                              severity: "error",
                              summary: this.$t(error.response.data),
                              life: 3000,
                            });
                          }
                          if (error.response.status == 401) {
                            this.$store.dispatch("logLout");
                          } else 
                          this.signing = false;
                      })
                      
                      }
                    });
                  }
                ).catch(error => {
                    if (error.response.status == 401) {
                      this.$store.dispatch("logLout");
                    } else 
                    console.log(error);
                          console.log(error);

                })
                
              }
        });
      },
      revisionTemplate() {
        this.saveDocTemplate();
        let url ="/doctemplate/updatedoсtemplatestate"
         var req = {
          userID : this.$store.state.loginedUser.userID,
          id: this.selectedNode.id,
          state: this.DocState.REVISION.ID,
          comment: this.revisionComment,
        }
        axios.post(smartEnuApi+url, req, { headers: getHeader() }).then(()=>{
          this.selectedNode.data.stateID = this.DocState.REVISION.ID;
          this.selectedNode.data.state =  this.$t('common.states.revision');
          this.selectedNode.data.stateEn =  "revision";
          this.dialogOpenState.revision = false;
        })
        .catch(error => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else 
          console.log(error);
        })

        this.dialogOpenState.revision = false;
       
        
      },
      sendToApproval() {
        let url = "/doctemplate/toapproval";

        if (this.selectedNode == null || this.selectedNode.data.type != 0 || this.selectedUsers == null || this.dialogNote == null) {
          this.showMessage('error', this.$t('doctemplate.title'), this.$t('common.message.sendToApprovalError'));
          return;
        }
        var req = {
          userID : this.$store.state.loginedUser.userID,
          docTemplateID: this.selectedNode.id,
          entities: this.selectedUsers,
          comment: this.dialogNote,
        }
        let isLegalHead = false;
        this.selectedUsers.forEach(user => {
          isLegalHead = this.findRole(user, DocState.roles.LegalServiceHead)
        });
        
        if (isLegalHead ===false) {
          this.showMessage('error', this.$t('doctemplate.title'), this.$t('common.message.notPermissionForApprove'));
          return;
        }
        axios.post(smartEnuApi+url, req, { headers: getHeader() }).then(()=>{
          this.selectedNode.data.stateID = this.DocState.INAPPROVAL;
          this.selectedNode.data.state =  this.$t('common.states.inapproval');
          this.selectedNode.data.stateEn =  "inapproval";
          this.dialogOpenState.toApproval = false;
          this.selectedUsers = null;
          this.showMessage('success', this.$t('doctemplate.title'), this.$t('common.message.succesSendToApproval'));
        })
        .catch(error => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else 
          console.log(error);
        })

      },

      downloadDocTemplatePdf() {
          if ((this.selectedNode.data == null) || (this.selectedNode.data.type == null) || (this.selectedNode.data.type == 1)) {
          this.showMessage('error', this.$t('doctemplate.download'), this.$t('doctemplate.message.downloadError'));
          return
        }
        let url = "/doctemplate/getpdf";
        var req = {"id" : this.selectedNode.id};
        req.lang = "kaz";
        if (this.templateLanguage != "ru") {
          req.lang = "kaz"
        } 
        if (this.templateLanguage != "kz") {
          req.lang = "rus"
        } 
        axios.post(smartEnuApi+url, req, { headers: getHeader() })
        .then(response=>{
          let pdf = response.data;
          // var obj = document.createElement('object');
          // obj.style.width = '100%';
          // obj.style.height = '842pt';
          // obj.type = 'application/pdf';
          // obj.data = 'data:application/pdf;base64,' + pdf;
          // document.body.appendChild(obj);
          // Insert a link that allows the user to download the PDF file
          var link = document.createElement('a');
          link.innerHTML = 'Download PDF file';
          link.download = this.selectedNode.data.name + '.pdf';
          link.href = 'data:application/octet-stream;base64,' + pdf;
          link.click();
        })
        .catch(error => {
          console.log(error);
        })
      },
      saveDocTemplate() {
        if ((this.selectedNode.data == null) || (this.selectedNode.data.type == null) || (this.selectedNode.data.type == 1)) {
          this.showMessage('error', this.$t('doctemplate.saveTemplate'), this.$t('doctemplate.message.notSelected'))
          return
        }

        if (((this.selectedNode.data.mainTextKaz == null) || (this.selectedNode.data.mainTextKaz == "")) && ((this.selectedNode.data.mainTextRus == "") || (this.selectedNode.data.mainTextRus == null))){
          this.showMessage('error', this.$t('doctemplate.saveTemplate'), this.$t('doctemplate.message.textNotFilled'))
          return
        }
        let url = "/doctemplate/update";
        var req = {"id" : this.selectedNode.id};
        if (this.selectedNode.data.mainTextKaz != null) {
          req.textKaz = this.selectedNode.data.mainTextKaz;
        } else {
          req.textKaz = "";
        }

        if (this.selectedNode.data.mainTextRus != null) {
          req.textRus = this.selectedNode.data.mainTextRus;
        } else {
          req.textRus = "";
        }
        axios.post(smartEnuApi+url, req, { headers: getHeader() })
        .then(()=>{
          this.showMessage('success', this.$t('doctemplate.updateTemplate'), this.$t('doctemplate.message.succesUpdated'));

        })
        .catch(error => {
          console.log(error)
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else 
          console.log(error);
        })

      },
      createNewDocTemplate() {
        if (this.createdFolder == null || this.createdTemplate.descriptionKaz.length<1) {
          this.showMessage('error',this.$t('doctemplate.newTemplate'), this.$t('doctemplate.message.descriptionNotFilled'));
          return
        }
          if (this.createdFolder == null || this.createdTemplate.descriptionRus.length<1) {
          this.showMessage('error',this.$t('doctemplate.newTemplate'), this.$t('doctemplate.message.descriptionNotFilled'));
          return
        }
        if (this.selectedNode.key == null) {
          this.showMessage('error',this.$t('doctemplate.newTemplate'), this.$t('common.message.serverError'));
          return
        }
        this.createdTemplate.folderID = this.selectedNode.key;
        let url = "/doctemplate/create";
        axios.post(smartEnuApi+url, this.createdTemplate, { headers: getHeader() })
        .then(response=>{
          this.templates.forEach(folder=>{
            if (folder.key == response.data.folderID) {
                var newNode = this.addTemplateNode(folder.children, response.data, folder.key);
                this.editDocTemplate(newNode);
                this.closeForm('addTemplate');
                this.createdTemplate = {
                creatorId: 1,
                mainTextKaz: '',
                mainTextRus: '',
                descriptionKaz: '',
                descriptionRus: '',
                folderID: -1,
              }
              this.showMessage('success', this.$t('doctemplate.newTemplate'), this.$t('doctemplate.message.succesFilled'));
            }
          })
        })
        .catch(error => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else 
            console.error(error)
        })
      },
      createNewFolder() {
        if (this.createdFolder.groups == null || this.createdFolder.groups.length<1) {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.groupsNotSelected'));
          return
        }
        if (this.createdFolder.nameKaz == null || this.createdFolder.nameKaz == "") {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.qazNameNotfilled'));
          return
        }
        if (this.createdFolder.nameRus == null || this.createdFolder.nameRus == "") {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.rusNameNotfilled'));
          return
        }
        if (this.createdFolder.nameEn == null || this.createdFolder.nameEn == "") {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.engNameNotfilled'));
          return
        }
        if (this.createdFolder.code == null || this.createdFolder.code == "") {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.codeNotFilled'));
          return
        }
        let url = "/doctemplate/createFolder";
        axios.post(smartEnuApi+url, this.createdFolder, { headers: getHeader() })
        .then(response=>{

          let node = new Object();
            console.log(response.data)
            node.key= response.data.id;
            let nodeData = new Object();
            nodeData.name=response.data.nameKaz;
            nodeData.type= 1;
            nodeData.typeText= this.$t('common.catalog');
            nodeData.createdDate = response.data.createDate;
            nodeData.updatedDate = response.data.updateDate;
            nodeData.code = response.data.code;
            node.children = []
            node.data = nodeData;
            this.templates.push(node)
          this.createdFolder = {
            groups: null,
            nameKaz: '',
            nameRus: '',
            nameEn: '',
            id: -1,
            createdDate: null,
            updatedDate: null,
          };
          this.showMessage('success', this.$t('common.message.title.docCreation'),this.$t('common.message.catSuccesCreated'));

        },
        error =>{
          console.log(error);
        });
      },
      editDocTemplate(node){
        this.active = 1;
        this.onNodeSelect(node)
        
      },
      onNodeSelect(node) {
        
        this.selectedNode = node;
        this.currentNode = node
        this.readonly = this.selectedNode.data.stateEn == DocState.CREATED.Value || this.selectedNode.data.stateEn == DocState.REVISION.Value || (this.selectedNode.data.stateEn == DocState.INAPPROVAL.Value && this.findRole(null, DocState.roles.LegalServiceHead))
        this.$refs.kzEditor.setReadOnly(this.readonly);
        
      },
      addTemplateNode(nodeDataChildren,node,fkey) {
        let child=new Object();
        child.key=fkey+"_"+node.id;
        child.id = node.id;
        let childData = new Object();
        if (node.History != null) {
          childData.stateID = node.History[0].id;
          childData.state =  this.$i18n.locale == "kz" ? node.History[0].stateKaz : this.$i18n.locale == "ru" ?  node.History[0].stateRus : node.History[0].stateEn;
          childData.stateEn =  node.History[0].stateEn;
        }
        childData.name= this.$i18n.locale == "ru" ? node.descriptionRus : node.descriptionKaz;
        childData.createdDate = node.createDate;
        childData.mainTextKaz = node.mainTextKaz
        childData.mainTextRus = node.mainTextRus
        if (node.History && node.History.length > 0) {
          childData.comment = node.History[0].comment
        }
        childData.base64 = node.base64
        childData.type = 0;
        childData.typeText= this.$t('common.doc');
        child.data = childData;
        nodeDataChildren.push(child);
        return child;
      },
      initApiCall(){
        let url = "/doctemplates?groupID=1";
        var stateFilter = "&stateID=-1"
        if (this.selectMode) {
          stateFilter = "&stateID=" + this.DocState.APPROVED.ID
        }
        url+= stateFilter
        axios (smartEnuApi+url, { headers: getHeader() })
        .then(res=>{
          let treeData = [];
          res.data.forEach(el => {
            let node = new Object();
            node.key=el.id;
            let nodeData = new Object();
            nodeData.name=el.nameKaz;
            nodeData.type= 1
            nodeData.typeText= this.$t('common.catalog');
            nodeData.createdDate = el.createDate;
            nodeData.updatedDate = el.updateDate;
            nodeData.code = el.code;
            let nodeDataChildren = [];

            if(el.DocTemplates){
              el.DocTemplates.forEach((child)=>{
                this.addTemplateNode(nodeDataChildren, child,node.key)
              })
            }
            node.children = nodeDataChildren;
            node.data=nodeData;
            treeData.push(node);
          });
          if(treeData.length>0)
            this.templates=treeData;

        })
        .catch(error => {
          console.log(error)
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else 
            console.error(error)
        })
      }
    },
    mounted() {
      this.initApiCall(
      );
    },
  };
</script>

<style scoped lang="scss">
  .sm-visible {
      display: none;
  }
  .template-status {
    border-radius: 2px;
    padding: .25em .5rem;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: .3px;
  }
  .template-status.approved {
    background-color: #C8E6C9;
    color: #256029;
  }

  .template-status.revision {
      background-color: #FFCDD2;
      color: #C63737;
  }

  .template-status.inapproval {
      background-color: #FEEDAF;
      color: #8A5340;
  }

  .template-status.created {
      background-color: #B3E5FC;
      color: #23547B;
  }

  .template-status.modificated {
      background-color: #ECCFFF;
      color: #694382;
  }

  .template-status.proposal {
      background-color: #FFD8B2;
      color: #805B36;
  }

  @media screen and (max-width: 40em) {
      ::v-deep(.sm-invisible) {
          display: none;
      }

      ::v-deep(.sm-visible) {
          display: inline;
          margin-right: .5rem;
      }
  }


</style>
