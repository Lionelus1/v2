<template>
  <div>
    <div v-if="!selectMode" class="content-section introduction">
      <div class="feature-intro">
        <h3>{{$t('doctemplate.title')}}</h3>
      </div>
    </div>
    <div class="content-section implementation">
      <ProgressBar v-if="signing" mode="indeterminate" style="height: .5em" />
      <BlockUI :blocked="signing" :fullScreen="true"></BlockUI>

      <div class="card p-0">
        <TabView ref="templateView" v-model:activeIndex="active" class="p-0">
          <TabPanel v-bind:header="$t('doctemplate.templates')" class="p-0">
            <template #left>
            </template>
            <!-- Жаңа қалта құру диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('common.newCatalog')" :contentStyle="{overflow: 'visible'}" v-model:visible="dialogOpenState.addFolder" :style="{width: '50vw'}">
              <div class="p-fluid">
                  <label for="foldername" >{{$t('common.nameInQazaq')}}</label>
                  <InputText id="fodernamekaz" v-model="createdFolder.namekz" type="text" />
                  <label for="foldernamerus">{{$t('common.nameInRussian')}}</label>
                  <InputText id="foldernamerus" v-model="createdFolder.nameru"  type="text"  />
                  <label for="foldernameen">{{$t('common.nameInEnglish')}}</label>
                  <InputText id="foldernameen" v-model="createdFolder.nameen"  type="text" />
                  <label for="foldercode">{{$t('common.code')}}</label>
                  <InputText id="foldercode" v-model="createdFolder.code"  type="text" />
                  <label for="foldergroup">{{$t('common.userGroup')}}</label>
                  <MultiSelect v-model="createdFolder.groups" :options="groupsData" :optionLabel="'name'+$i18n.locale" v-bind:placeholder="$t('common.selectGroup')" :filter="true" display="chip"/>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('addFolder')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="createNewFolder" autofocus />
              </template>
            </Dialog>
            <!-- Жаңа үлгі құру диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('doctemplate.newTemplate')" v-model:visible="dialogOpenState.addTemplate" :style="{width: '50vw'}">
              <div class="p-fluid">
                <div class="field">
                    <label for="dtdescriptionkz">{{$t('doctemplate.description')}} ({{$t('common.language.kz')}})</label>
                    <InputText id="dtdescriptionkz" class="mb-2" v-bind:placeholder="$t('common.description')" v-model="createdTemplate.descriptionKaz" type="text" />
                    <label for="dtdescriptionru">{{$t('doctemplate.description')}}  ({{$t('common.language.ru')}})</label>
                    <InputText id="dtdescriptionru" class="mb-2" v-bind:placeholder="$t('common.description')" v-model="createdTemplate.descriptionRus" type="text" />
                    <div class="field-checkbox">
                      <!-- <Checkbox id="financial" class="mr-2" v-model="createdTemplate.financial" :binary="true"/>
                      <label for="financial">{{$t('hr.doc.financial')}}</label> -->
                      <Checkbox id="needApproval" class="mr-2" v-model="createdTemplate.needApproval" :binary="true"/>
                      <label for="needApproval">{{$t('doctemplate.needsApproval')}}</label>
                    </div>
                    <div class="field" v-if="createdTemplate.needApproval">
                      <ApprovalUsers :mode="'doc_template_creating'" v-model="initialApprovalStages"
                        @update:modelValue="updateModel($event)"></ApprovalUsers>
                    </div>
                </div>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('addTemplate')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="createNewDocTemplate" autofocus />
              </template>
            </Dialog>

            <TreeTable :loading="loading"  :value="templates" class="p-treetable-responsive p-treetable-sm" selectionMode="single" @node-select="onNodeSelect" v-model:selectionKeys="currentNode" style="margin-bottom: 2rem">
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
                  <!-- <span class="sm-visible"> /{{slotProps.node.data.typeText}}</span> -->
                  <!-- <span  v-if="slotProps.node.data.state!=null" class="sm-visible"> /{{slotProps.node.data.state}}</span> -->
                  <!-- <span v-if="slotProps.node.data.financial" class="sm-visible">/ <i class="fa-regular fa-money-bill-1"></i></span>  -->
                  <!-- <span v-if="slotProps.node.data.needApproval" class="sm-visible">/ <i class="fa-solid fa-list-check"></i></span> -->
                  <!-- <span v-if="slotProps.node.data.updatedDate!=null" class="sm-visible"> /{{slotProps.node.data.updatedDate}}</span> -->
                </template>
              </Column>
              <Column field="code" v-bind:header="$t('common.code')" headerClass="sm-invisible" bodyClass="sm-invisible"></Column>
              <Column v-if="!selectMode" field="createdDate" v-bind:header="$t('common.created')"  headerClass="sm-invisible" bodyClass="sm-invisible">
                <template #body="slotProps">
                    {{slotProps.node.data.createdDate ? slotProps.node.data.createdDate.replace('Z', '').replace('T', ' '): ''}}
                </template>
              </Column>
              <!-- <Column field="financial"  headerStyle="width: 2em"  headerClass="sm-invisible" bodyClass="sm-invisible">
                <template #body="slotProps">
                  <span v-if="slotProps.node.data.financial"> <i class="fa-solid fa-money-bill fa-xl"></i></span>
                </template>
              </Column> -->
              <!-- <Column field="needApproval"  headerStyle="width: 2em"  headerClass="sm-invisible" bodyClass="sm-invisible">
                <template #body="slotProps">
                  <span v-if="slotProps.node.data.needApproval"> <i class="fa-solid fa-list-check fa-xl"></i></span>
                </template>
              </Column> -->
              <Column v-if="!selectMode" field="state" v-bind:header="$t('common.state')" headerClass="sm-invisible" bodyClass="sm-invisible">
                <template #body="slotProps">
                  <span :class="'template-status ' + slotProps.node.data.stateEn"> {{slotProps.node.data.state}}</span>
                </template>

              </Column>

              <!-- <Column field="updatedDate" v-bind:header="$t('common.updated')" headerClass="sm-invisible" bodyClass="sm-invisible">
               <template #body="slotProps">
                    {{slotProps.node.data.updatedDate ? slotProps.node.data.updatedDate.replace('Z', '').replace('T', ' ') : ''}}
                </template>
              </Column> -->
              <Column headerStyle="width: 8em" headerClass="text-center" bodyClass="text-center">
              <template #header>
                  <Button v-if="!selectMode" icon="pi pi-plus" class="p-button-blue" @click="openForm('addFolder');clearCreatedFolder();" v-tooltip.bottom="$t('common.newCatalog')"  />
              </template>
              <template #body="slotProps">
                  <Button v-if="slotProps.node.data.type==1 && !selectMode" type="button" icon="pi pi-plus" @click="clearCreatedTemplate();initTemplateApprovalInfo(true, slotProps.node);" class="p-button-success" v-tooltip.bottom="$t('doctemplate.newTemplate')"></Button>
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
            <div class="formgroup-inline">
              <span class="buttonset">
                <Button style="margin-right: 0.5rem;" v-if="(selectedNode.data.stateEn == DocState.CREATED.Value || selectedNode.data.stateEn == DocState.REVISION.Value)" :label="$t('common.save')" icon="pi pi-save" @click="saveDocTemplate"/>
                <Button style="margin-right: 0.5rem;" v-bind:label="$t('common.download')" icon="pi pi-file-pdf" @click="downloadDocTemplatePdf" />
                <Button style="margin-right: 0.5rem;" v-if="selectedNode.data.needApproval && ((selectedNode.data.stateEn == DocState.INAPPROVAL.Value && findRole(null, RolesEnum.roles.LegalServiceHead)) || selectedNode.data.stateEn == DocState.REVISION.Value || selectedNode.data.stateEn == DocState.APPROVED.Value)"
                  class="p-button-warning" :label="$t('doctemplate.approvalUsers')" icon="fa-solid fa-users-gear" @click="initApprovalInfo(true);"></Button>
                <Button style="margin-right: 0.5rem;" v-if="selectedNode.data.stateEn == DocState.CREATED.Value || selectedNode.data.stateEn == DocState.REVISION.Value" :label="$t('common.toapprove')" icon="pi pi-send" @click="openForm('toApproval')" />
                <Button style="margin-right: 0.5rem;" v-if="selectedNode.data.stateEn == DocState.INAPPROVAL.Value && findRole(null, RolesEnum.roles.LegalServiceHead)" class="p-button-success" :label ="$t('common.approve')" icon="pi pi-check" @click="approve()"/>
                <Button style="margin-right: 0.5rem;" v-if="selectedNode.data.stateEn == DocState.INAPPROVAL.Value && findRole(null, RolesEnum.roles.LegalServiceHead)" class="p-button-warning" :label ="$t('common.revision')" icon="pi pi-times" @click="openForm('revision')"/>
                <Button style="margin-right: 0.5rem;" v-if="selectedNode.data.stateEn == DocState.APPROVED.Value" class="p-button-primary" :label ="$t('common.approvalList')" icon="pi pi-user-edit" @click="openForm('signerInfo')"/>
              </span>

              <SelectButton @change="languageChanged" v-model="templateLanguage" :options="language" class="mb-3">
                <template #option="slotProps">
                  <div v-if="slotProps.option === 'kz'">{{$t('common.language.kz')}}</div>
                  <div v-else-if="slotProps.option === 'ru'">{{$t('common.language.ru')}}</div>
                  <div v-else>{{$t('common.language.en')}}</div>
                </template>
              </SelectButton>
              <Button v-if="selectMode && selectedNode.data.type!=1" icon="pi pi-check-circle" class="p-button-success ml-2" @click="select($event,selectedNode)" v-tooltip.bottom="$t('common.choose')"></Button>
            </div>
              <template v-if="onEditorTabSelected">
                  <div v-if="templateLanguage ==='kz'">
                      <TinyEditor v-model="selectedNode.data.mainTextKaz" :readonly="!readonly" :contract-elements="true" :height="800"/>
                  </div>
                  <div v-else>
                      <TinyEditor v-model="selectedNode.data.mainTextRus" :readonly="!readonly" :contract-elements="true" :height="800"/>
                  </div>
              </template>
<!--            <RichEditor ref="kzEditor" :readonly="editorReadOnly" v-if="templateLanguage =='kz'" v-model="selectedNode.data.mainTextKaz" editorStyle="height:500px;max-width:700px;min-width:500px">
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
            <RichEditor  ref="ruEditor" :readonly="editorReadOnly" v-else v-model="selectedNode.data.mainTextRus" editorStyle="height:500px;max-width:700px;min-width:500px">
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
            </RichEditor>-->
            <!-- Келісімге жіберу диалогы -->
            <Dialog :modal="true"  v-bind:header="$t('common.toapprove')" v-model:visible="dialogOpenState.toApproval" :style="{width: '50vw'}">
              <div class="p-fluid">
                <div class="field">
                    <label for="dialognote">{{$t('common.comment')}}</label>
                    <InputText id="dialognote" class="mb-2" v-bind:placeholder="$t('common.comment')" v-model="dialogNote" type="text" />
                    <label for="approvingusers">{{$t('doctemplate.approvingUsers')}}</label>
                    <FindUser v-model="selectedUsers" :userType="2" :roles="'legal_service_head'" id="approvingusers"></FindUser>
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
                <div class="field">
                    <label for="dialognote">{{$t('common.comment')}}</label>
                    <InputText id="dialognote" class="mb-2" v-bind:placeholder="$t('common.comment')" v-model="revisionComment" type="text" />
                </div>
              </div>
              <template #footer>
                <Button v-bind:label="$t('common.no')" icon="pi pi-times" @click="closeForm('toApproval')" class="p-button-text"/>
                <Button v-bind:label="$t('common.yes')" icon="pi pi-check" @click="revisionTemplate" autofocus />
              </template>
            </Dialog>
            <!-- Список согласующих лиц -->
            <Dialog :header="$t('doctemplate.approvalUsers')" v-model:visible="dialogOpenState.approvalUsers"
                    :style="{width: '50vw'}" class="p-fluid">
              <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
              <div class="field">
                <ApprovalUsers :approving="approving" :mode="'doc_template'" v-model="currentApprovalStages" :readonly="selectedNode.data.stateEn == DocState.INAPPROVAL.Value || selectedNode.data.stateEn == DocState.APPROVED.Value"
                              @closed="closeForm('approvalUsers')" @save="saveApprovalUser($event)"></ApprovalUsers>
              </div>
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
         <Sidebar
              v-model:visible="dialogOpenState.signerInfo"
              position="right"
              class="p-sidebar-lg"
              style="overflow-y: scroll"
          >
            <DocSignaturesInfo :docIdParam="selectedNode.data.docID" :isInsideSidebar="true"></DocSignaturesInfo>
          </Sidebar>
      </div>

    </div>


  </div>
</template>

<script>
  import {smartEnuApi, findRole, getHeader} from "@/config/config";
  import {runNCaLayer} from "@/helpers/SignDocFunctions"
  import axios from 'axios';
  import DocState from "@/enum/docstates/index";
  import RolesEnum from "@/enum/roleControls/index";
  import DocSignaturesInfo from "@/components/DocSignaturesInfo"
  import Enum from "@/enum/docstates/index"
  import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
  import TinyEditor from "@/components/TinyEditor.vue";

  export default {
    emits: ['onselect', 'languageChanged'],
    components: { TinyEditor, DocSignaturesInfo, ApprovalUsers },
    data() {
      return {
        readonly : false,
        currentNode: null,
        selectedUsers: null,
        dialogNote: "",
        revisionComment: "",
        selectedNode: {
          data : {},
        },
        editorReadOnly :true,
        signing : false,
        DocState: DocState,
        RolesEnum: RolesEnum,
        templateLanguage: this.currentLang != null ? this.currentLang : 'kz',
        dialogOpenState: {
          addFolder : false,
          addTemplate : false,
          toApproval : false,
          revision :false,
          dialogComment: false,
          signerInfo: false,
          approvalUsers: false,
        },
        active: 0,
        templates: null,
        groupsData: [
          {namekz: 'білім алушы', nameru: 'обучающиеся', nameen:'students', id: 0},
          {namekz: 'профессор-оқытушылар құрамы', nameru: 'профессорско-преподавательский состав', nameen:'teaching staff', id: 1},
          {namekz: 'қызметкерлер', nameru: 'сотрудники', nameen:'staff', id: 2},
        ],

        language: ['kz', 'ru'],
        createdFolder: {
          groups: null,
          namekz: '',
          nameru: '',
          nameen: '',
          id: null,
          createdDate: null,
          updatedDate: null,
          type: Enum.FolderType.Journals

        },
        createdTemplate: {
          creatorId: 1,
          mainTextKaz: '',
          mainTextRus: '',
          descriptionKaz: '',
          descriptionRus: '',
          folderID: -1,
          // financial: false,
          needApproval: false,
          approvalStages: null,
        },
        loading: false,
        approving: false,
        initialApprovalStages: null,
        currentApprovalStages: null,
      }
    },
     props: {
      selectMode: Boolean,
      modelValue: null,
      windowOpened: Boolean,
      currentLang: null,

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
      clearCreatedTemplate() {
        this.createdTemplate = {
          creatorId: 1,
          mainTextKaz: '',
          mainTextRus: '',
          descriptionKaz: '',
          descriptionRus: '',
          folderID: -1,
          // financial: false,
          needApproval: false,
          approvalStages: null,
        }
      },
      clearCreatedFolder() {
        this.createdFolder = {
          groups: null,
          namekz: '',
          nameru: '',
          nameen: '',
          id: null,
          createdDate: null,
          updatedDate: null,
          type: Enum.FolderType.Journals
        }
      },
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
                axios.post(smartEnuApi + "/downloadFile",
                { filePath: this.selectedNode.data.filePath},
                { headers: getHeader() }).then(
                  response => {
                    runNCaLayer(this.$t, this.$toast, response.data, 'cms', 'ul', false, this.$i18n.locale).then(sign=>{
                      this.signing = true
                      if (sign != undefined) {

                        var req = {
                          docUUID: this.selectedNode.data.docID,
                          sign: sign
                        };
                        axios.post(smartEnuApi+"/doc/sign", req, { headers: getHeader() }).then(response=>{
                        this.selectedNode.data.stateID = this.DocState.APPROVED.ID;
                        this.selectedNode.data.state =  this.$t('common.states.approved');
                        this.selectedNode.data.stateEn =  this.DocState.APPROVED.Value;
                        this.showMessage('success', this.$t('doctemplate.title'), this.$t('common.message.succesSendToApproval'));
                        this.signing = false;
                      }).catch(error => {
                          this.signing = false;
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
                    }
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
          if (error.response && error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else
          console.log(error);
        })

        this.dialogOpenState.revision = false;


      },
      sendToApproval() {
        this.signing = true
        this.dialogOpenState.toApproval = false;

        let url = "/doctemplate/toapproval";

        if (this.selectedNode == null || this.selectedNode.data.type != 0 || this.selectedUsers == null || this.dialogNote == null) {
          this.showMessage('error', this.$t('doctemplate.title'), this.$t('common.message.sendToApprovalError'));
          this.signing = false
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
          console.log(user)
          isLegalHead = this.findRole(user, RolesEnum.roles.LegalServiceHead)
        });

        if (isLegalHead ===false) {
          this.showMessage('error', this.$t('doctemplate.title'), this.$t('common.message.notPermissionForApprove'));
          this.signing = false
          return;
        }
        this.signing = true

        axios.post(smartEnuApi+url, req, { headers: getHeader() }).then(response=>{
          this.selectedNode.data.docID = response.data.docUUID
          this.selectedNode.data.filePath = response.data.filePath
          this.selectedNode.data.stateID = this.DocState.INAPPROVAL;
          this.selectedNode.data.state =  this.$t('common.states.inapproval');
          this.selectedNode.data.stateEn =  "inapproval";
          this.dialogOpenState.toApproval = false;
          this.selectedUsers = null;
          this.showMessage('success', this.$t('doctemplate.title'), this.$t('common.message.succesSendToApproval'));
          this.signing = false

        })
        .catch(error => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else
          console.log(error);
          this.signing = false

        })
      },

      downloadDocTemplatePdf() {
        this.signing = true

          if ((this.selectedNode.data == null) || (this.selectedNode.data.type == null) || (this.selectedNode.data.type == 1)) {
          this.showMessage('error', this.$t('doctemplate.download'), this.$t('doctemplate.message.downloadError'));
          this.signing = false
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
          var link = document.createElement('a');
          link.innerHTML = 'Download PDF file';
          link.download = this.selectedNode.data.name + '.pdf';
          link.href = 'data:application/octet-stream;base64,' + pdf;
          link.click();
          this.signing = false

        })
        .catch(error => {
          console.log(error);
          this.signing = false
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
        this.signing = true
        axios.post(smartEnuApi+url, req, { headers: getHeader() })
        .then(()=>{
          this.showMessage('success', this.$t('doctemplate.updateTemplate'), this.$t('doctemplate.message.succesUpdated'));
          this.signing = false
        })
        .catch(error => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else
          console.log(error);
          this.signing = false
        })

      },
      changeLanguage(lang) {
        this.templateLanguage = lang
      },
      languageChanged() {
        this.$emit("languageChanged", this.templateLanguage )
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
        // check approval users
        if (this.createdTemplate.needApproval) {
          if (!this.initialApprovalStages || this.initialApprovalStages.length < 1) {
            this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.selectUsers'), life: 3000});
            return
          }

          let filled = true;
          this.initialApprovalStages.forEach(au => {
            if (au.users === null || au.users.length < 1 || au.certificate === null) {
              filled = false;
              return;
            }
          })

          if (!filled) {
            this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.fillError'), life: 3000});
            return;
          }
        }

        this.createdTemplate.folderID = this.selectedNode.key;
        this.createdTemplate.approvalStages = [...this.initialApprovalStages]
        let url = "/doctemplate/create";
        axios.post(smartEnuApi+url, this.createdTemplate, { headers: getHeader() })
        .then(response=>{
          this.templates.forEach(folder=>{
            if (folder.key == response.data.folderID) {
              var newNode = this.addTemplateNode(folder.children, response.data, folder.key);
              this.closeForm('addTemplate');
              this.editDocTemplate(newNode);
              // this.dialogOpenState['addTemplate'] = false;
              this.clearCreatedTemplate();
              this.showMessage('success', this.$t('doctemplate.newTemplate'), this.$t('doctemplate.message.succesFilled'));
            }
          })
        })
        .catch(error => {
          if (error.response && error.response.status == 401) {
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
        if (this.createdFolder.namekz == null || this.createdFolder.namekz == "") {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.qazNameNotfilled'));
          return
        }
        if (this.createdFolder.nameru == null || this.createdFolder.nameru == "") {
          this.showMessage('error',this.$t('common.message.catCreateError'),this.$t('common.message.rusNameNotfilled'));
          return
        }
        if (this.createdFolder.nameen == null || this.createdFolder.nameen == "") {
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
            node.key= response.data.id;
            let nodeData = new Object();
            nodeData.name=response.data.namekz;
            nodeData.type= 1;
            nodeData.typeText= this.$t('common.catalog');
            nodeData.createdDate = response.data.createDate;
            nodeData.updatedDate = response.data.updateDate;
            nodeData.code = response.data.code;
            node.children = []
            node.data = nodeData;
            if (this.templates == null)
            {
              this.templates = []
            }
            this.templates.push(node)
          this.createdFolder = {
            groups: null,
            namekz: '',
            nameru: '',
            nameen: '',
            id: null,
            createdDate: null,
            updatedDate: null,
          };
          this.closeForm('addFolder')
          this.showMessage('success', this.$t('common.message.title.docCreation'),this.$t('common.message.catSuccesCreated'));

        })
        .catch(error =>{
          if (error.response.status == 405) {
              this.$toast.add({
                severity: "error",
                summary: this.$t("common.message.notAllowed"),
                life: 3000,
              });
          }
          else if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else
            console.error(error)
        })
      },
      editDocTemplate(node){
        this.active = 1;
        this.onNodeSelect(node)

      },
      onNodeSelect(node) {
        this.selectedNode = node;
        this.currentNode = node
        this.readonly = this.selectedNode.data.stateEn === DocState.CREATED.Value || this.selectedNode.data.stateEn === DocState.REVISION.Value || (this.selectedNode.data.stateEn === DocState.INAPPROVAL.Value && this.findRole(null, RolesEnum.roles.LegalServiceHead))
        this.$emit("languageChanged", this.templateLanguage )
          /*if (this.$refs.kzEditor) {
            this.$refs.kzEditor.setReadOnly(this.readonly);
          } else {
            this.$refs.ruEditor.setReadOnly(this.readonly);
          }*/
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
        // childData.financial = node.financial
        childData.needApproval = node.needApproval
        childData.name= this.$i18n.locale == "ru" ? node.descriptionRus : node.descriptionKaz;
        childData.docID = node.docID
        childData.filePath = node.filePath
        childData.createdDate = node.createDate
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
        let url = "/doctemplates?";
        var stateFilter = "stateID=-1"
        if (this.selectMode) {
          stateFilter = "stateID=" + this.DocState.APPROVED.ID
        }
        this.loading = true;
        url+= stateFilter
        axios (smartEnuApi+url, { headers: getHeader() })
        .then(res=>{
          let treeData = [];
          res.data.forEach(el => {
            let node = new Object();
            node.key=el.id;
            let nodeData = new Object();
            nodeData.name=el.namekz;
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
          this.loading = false;
        }).catch(error => {
          this.loading = false;
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else
            console.error(error)
        })

        this.initTemplateApprovalInfo();
      },
      initTemplateApprovalInfo(openForm, node) {
        axios.post(smartEnuApi + "/approvalList/getDefault", {
          type: Enum.DefaultApprovalListType.DocTemplate,
        }, {
          headers: getHeader(),
        }).then(response => {
          this.initialApprovalStages = []
          response.data.forEach((res) => {
            this.initialApprovalStages.push(res)
          })

          if (openForm) {
            this.openForm('addTemplate', node);
          }
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          }
        })
      },
      initApprovalInfo(openForm) {
        axios.post(smartEnuApi + "/doctemplate/getApprovalStages", {
          docTemplateId: this.selectedNode.id,
        }, {
          headers: getHeader(),
        }).then(response => {
          this.currentApprovalStages = response.data

          if (openForm) {
            this.openForm('approvalUsers')
          }
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          }
        })
      },
      updateModel(event) {
        this.initialApprovalStages = event
      },
      saveApprovalUser(event) {
        axios.post(smartEnuApi + "/doctemplate/updateApprovalStages", {
          docTemplateId: this.selectedNode.id,
          approvalStages: event,
        }, {
          headers: getHeader(),
        }).then(response => {
          this.$toast.add({
            severity: "success",
            summary: this.$t("common.save"),
            detail: this.$t("common.message.succesSaved"),
            life: 3000,
          });

          this.closeForm('approvalUsers');
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          }
        })
      }
    },
    mounted() {
      this.initApiCall();
      this.templateLanguage = this.currentLang != null ? this.currentLang : 'kz'
    },
      computed: {
        onEditorTabSelected() {
            return !(this.selectedNode.data.type == null || this.selectedNode.data.type == 1)
        }
      }
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
@media (max-width: 500px) {
  .buttonset button{
    margin-bottom: 10px;
    margin-right: 10px!important;
  }
}

</style>
