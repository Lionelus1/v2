<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em" />
    <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  </div>
  <div v-if="haveAccess" class="content-section">
    <div @click="$router.back()" class="inline-block">
      <i class="fa-solid fa-arrow-left ml-2" style="font-size: 16px;cursor: pointer"></i>
    </div>
    <h4 class="ml-3 inline-block"> {{ $t("contracts.contract") }}</h4>
    <Menubar
      :model="menu"
      :key="active"
      style="height: 36px; margin-top: -7px; margin-left: -14px"
    ></Menubar>
    <TabView @TabChange="tabChanged" v-model:activeIndex="activeTab">
      <TabPanel v-if="!this.contract || this.contract.sourceType !== Enum.DocSourceType.FilledDoc" :header="$t('common.params')">
        <div class="grid">
          <div class="lg:col-8 md:col-12 p-sm-12">
            <p v-if="contract">{{ $t("common.state") + ": " }}
            <span :class="'customer-badge status-' + contract.docHistory.stateEn">{{$t("common.states." + contract.docHistory.stateEn)}}</span>
            </p>
            <div
              v-if="contract != null && contract.sourceType === 0"
              class="p-fluid"
            >
              <div
                v-for="param in contract.params"
                :key="param.id"
                class="fieldgrid"
              >
                <label
                  v-if="param.name == 'contragent' || param.name == 'ourside' || param.name == 'individualEntrepreneur'"
                  :for="param.name + param.id"
                  class="col-12 mb-12 md:col-12 mb-md-0 uppercase"
                  >{{ $t("doctemplate.editor." + param.name) }}</label
                >
                <label
                  v-else-if="param.name !== 'text'"
                  :for="param.name + param.id"
                  class="col-12 mb-2 md:col-2 mb-md-0"
                  >{{ $t("doctemplate.editor." + param.name) }}</label
                >
                <label
                  v-else
                  :for="param.name + param.id"
                  class="col-12 mb-2 md:col-2 mb-md-0"
                  >{{ param.description }}</label
                >

                <div
                  v-if="param.name == 'contragent' || param.name == 'ourside' || param.name == 'individualEntrepreneur'"
                  class="col-12 md:col-12"
                >
                  <ContragentSelect @updated="correct" v-model="param.value"></ContragentSelect>
                </div>
                <!-- <div v-else-if="param.name == 'individualEntrepreneur'" class="col-12 md:col-12"> -->
                  <!-- here -->
                <!-- </div> -->
                <div v-else class="col-12 md:col-10">
                   <!-- студент болса -->
                  <FindUser
                    v-if="param.name == 'student'"
                    v-model:first="param.value"
                    v-model="users"
                    :max="1"
                    :userType="1"
                    @input="correct" @remove="correct"
                  ></FindUser>
           
                  <!-- <PrimeCalendar v-else-if="param.name == 'period'" v-model="param.value" selectionMode="range" :manualInput="false" ></PrimeCalendar> -->
   
                  <div v-else-if="param.name == 'period'" >
                    <PrimeCalendar @date-select	="correct" v-model="param.value" selectionMode="range" :manualInput="false" dateFormat="dd.mm.yy" hideOnDateTimeSelect="true"></PrimeCalendar>
                  </div>
                  <InputText
                    v-model="contract.number"
                    v-else-if="param.name === 'number'"
                    :id="param.name + param.id"
                    type="text"
                    :readonly="param.name == 'number' || param.name == 'date'"
                    :placeholder="
                      param.name == 'number' || param.name == 'date'
                        ? $t('contracts.autogenerate')
                        : ''
                    "
                    @input="correct"
                  />
                  <InputText
                    v-model="param.value"
                    v-else
                    :id="param.name + param.id"
                    type="text"
                    :readonly="param.name == 'number' || param.name == 'date'"
                    :placeholder="
                      param.name == 'number' || param.name == 'date'
                        ? $t('contracts.autogenerate')
                        : ''
                    "
                    @input="correct"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel v-else :header="$t('common.params')">
        <div v-if="contract.docHistory.stateId !== Enum.REVISION.ID">
          <Button class="p-button-success" :label="$t('doctemplate.approvalUsers')" @click="openForm('approvalUsers')" 
            style="margin-bottom: 1.5rem"/>
          <SelectButton v-model="selectedDocParams" :options="docParamsType" :disabled="selectedDocParamsDisabled"
            :unselectable='false' style="margin-bottom: 0.75rem">
            <template #option="slotProps">
              <div v-if="slotProps.option === 0">{{$t('common.organization')}}</div>
              <div v-else>{{$t('common.individualEntrepreneur')}}</div>
            </template>
          </SelectButton>
          <div class="grid">
            <div class="lg:col-8 md:col-12 p-sm-12">
              <div class="p-fluid" v-if="this.contract && this.filledDocParams.length === 2">
                <div v-if="this.selectedDocParams === 0">
                  <div v-for="param in this.filledDocParams[0]"
                    :key="param.id"
                    class="fieldgrid">
                    <label v-if="param.name == 'contragent' || param.name == 'ourside' || param.name == 'individualEntrepreneur'"
                      :for="param.name + param.id"
                      class="col-12 mb-12 md:col-12 mb-md-0 uppercase">
                      {{ $t("doctemplate.editor." + param.name) }}
                    </label>
                    <div v-if="param.name == 'contragent' || param.name == 'ourside' || param.name == 'individualEntrepreneur'"
                      class="col-12 md:col-12">
                      <ContragentSelect @updated="filledDocParamsUpdated" v-model="param.value"></ContragentSelect>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div v-for="param in this.filledDocParams[1]"
                    :key="param.id"
                    class="fieldgrid">
                    <label v-if="param.name == 'contragent' || param.name == 'ourside' || param.name == 'individualEntrepreneur'"
                      :for="param.name + param.id"
                      class="col-12 mb-12 md:col-12 mb-md-0 uppercase">
                      {{ $t("doctemplate.editor." + param.name) }}
                    </label>
                    <div v-if="param.name == 'contragent' || param.name == 'ourside' || param.name == 'individualEntrepreneur'"
                      class="col-12 md:col-12">
                      <ContragentSelect @updated="filledDocParamsUpdated" v-model="param.value"></ContragentSelect>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <PostFile :fileUpload="true" :modelValue="file" directory="readyMadeContract" @updated="fileUpdated"></PostFile>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.show')">
        <div class="card">
          <embed :src="pdf+'#toolbar=0&navpanes=0&scrollbar=0'" style="width: 100%; height: 1000px" v-if="pdf" type="application/pdf" />
        </div>
      </TabPanel>
    </TabView>
    <Dialog
      :header="$t('common.registration')"
      modal="true"
      v-model:visible="dialog.setNumber"
    >
      <div class="grid formgrid">
        <div class="col-12 mb-2 lg:col-3 mb-lg-1">
          <label for="catalog">{{ $t("contracts.journal") }}</label>
        </div>
        <div class="col-12 mb-2 lg:col-9 mb-lg-1 pr-2">
          <InputText readonly="true" :modelValue="folderName" style="width: 100%;"></InputText>
        </div>
        <div class="col-12 mb-2 lg:col-3 mb-lg-1">
          <label for="catalog">{{ $t("common.date") }}</label>
        </div>
        <div class="col-12 mb-2 lg:col-9 mb-lg-1 pr-2">
          <i class="mt-2"> {{ reserveDate ? reserveDate.split('T')[0] : '' }} </i>
        </div>
        <div class="col-12 mb-2 lg:col-3 mb-lg-0">
          <label for="regnum">{{ $t("contracts.regnum") }}</label>
        </div>
        <div class="col-6 mb-2 lg:col-4 mb-lg-2 pr-2">
          <InputText
            v-model="reserveNumber"
            readonly="true"
            id="regnum"
            class=""
            style="width: 100%"
          ></InputText>
        </div>
        <div class="col-3 mb-2 lg:col-5 mb-lg-0">
          <i v-if="!(this.contract.number && this.contract.number !== '')">-{{ $t("contracts.preliminary") }}</i>
        </div>
      </div>

      <template #footer>
        <Button :disabled= "(this.contract.number && this.contract.number !== '')"
          	:label="$t('common.registration')"
          	@click="registrateContract()" />
        <Button :label="$t('common.cancel')" @click="closeForm('setNumber')" />
      </template>
    </Dialog>
    <!-- Список согласующих лиц -->
    <Dialog :header="$t('doctemplate.approvalUsers')" v-model:visible="dialog.approvalUsers"
            :style="{width: '50vw'}" class="p-fluid" @hide="dialogHidden()">
      <div class="field">
        <ApprovalUsers :mode="'doc_template'" v-model="this.approvalStagesDialog" :readonly="this.contract.docHistory.stateId > this.Enum.CREATED.ID"
                      @closed="closeForm('approvalUsers')" @save="saveApprovalUser($event)"></ApprovalUsers>
      </div>
    </Dialog>
    <Sidebar
      v-model:visible="signerInfo"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll"
    >
     <DocSignaturesInfo :docIdParam="contract.uuid"></DocSignaturesInfo>
    </Sidebar>
  </div>
  <div v-else class="content-section">
    <div @click="$router.back()" class="inline-block">
      <i class="fa-solid fa-arrow-left ml-2" style="font-size: 16px;cursor: pointer"></i>
    </div>
    <Access mode="short" returnLink="/documents/journal"></Access>
  </div>
</template>
<script>
import axios from "axios";
import {
  incline,
  inclineFirstname,
  inclineLastname,
  inclineMiddlename,
} from "lvovich";
import { constantizeGenderInRules } from "lvovich/lib/inclineRules";

import { smartEnuApi, getHeader, b64toBlob, findRole } from "@/config/config";
import Enum from "@/enum/docstates/index";

import Access from "@/pages/Access.vue";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import ContragentSelect from "@/components/contragent/ContragentSelect.vue";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import PostFile from "./PostFile.vue"

export default {
  name: "Contract",
  components: {  Access, ApprovalUsers, ContragentSelect, DocSignaturesInfo, PostFile },
  data() {
    return {
      contract: null,
      period: [ new Date("2018-05-01"), new Date("2018-05-01")],
      students: null,
      organization: null,
      users:[],
      pdf: null,
      activeTab: 0,
      Enum: Enum,
      tabs: {
        Parameters: 0,
        Preview: 1,
      },
      corrected: false,
      signerInfo : false,
      reserveDate: null,
	    reserveNumber: null,
      range: {
        start: new Date(2020, 0, 1),
        end: new Date(2020, 0, 5),
      },
      loading: false,
      haveAccess: true,
      language: {
        kz: 0,
        ru: 1,
        en: 2,
      },
      approvalStages: null,
      approvalStagesDialog: null,
      filledDocParams: [],
      ourside: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.corrected ,
          command: () => {
            this.saveContract();
          },
        },
        {
          label: this.$t("common.download"),
          icon: "pi pi-fw pi-download",
          command: () => {
            this.downloadContract(true);
          },
        },
        {
          label: this.$t("common.registration"),
          icon: "pi pi-fw pi-paperclip",
          items: [
            {
              label: this.$t("contracts.setnumber"),
              icon: "pi pi-fw pi-list",
              command: () => {
                this.openForm("setNumber");
              },
            },
          ],
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          items: [
            {
              label: this.$t("common.toapprove"),
              icon: "pi pi-check",
              visible: () => 
                this.contract &&
                this.findRole(null, 'student'),
              command: () => {
                this.sendToApprove(1)
              },
            },
            {
              label: this.$t("common.toapprove"),
              icon: "fa-regular fa-handshake",
              visible: () => 
                this.contract && ((this.contract.needApproval || 
                this.contract.sourceType === Enum.DocSourceType.FilledDoc) &&
                this.contract.docHistory.stateId < Enum.APPROVED.ID) &&
                !this.findRole(null, 'student'),
              command: () => {
                this.sendToApprove(2)
              },
            },
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => 
                this.contract && ((!this.contract.needApproval && 
                this.contract.sourceType === Enum.DocSourceType.Template) || 
                (this.contract.docHistory.stateId === Enum.APPROVED.ID)) &&
                !this.findRole(null, 'student'),
              command: ()=> {
                this.sendToSign()
              },
            },
          ],
        },
        {
          label: this.$t('common.approvalList'),
          icon: "pi pi-user-edit",
          command: () => {
            this.signerInfo = true
        }
        },
      ],
      dialog: {
        setNumber: false,
        approvalUsers: false,
      },

      folderName: '',
      selectedDocParams: 0,
      selectedDocParamsDisabled: false,
      docParamsType: [0, 1],
      file: null,
    };
  },
  computed: {
    previewText() {
      if (!this.contract) return "";
      var result = this.contract.text;
      var ourside = null;
      var contragents = null;
      this.contract.params.forEach((param) => {
        if (param.name == "ourside")
          result = result.replace(
            "{" +
              param.name +
              (param.description != null && param.description != ""
                ? ":" + param.description + "}"
                : "}"),
            this.paramToString(param)
          );
      });
      return result;
    },
  },
  methods: {
    findRole: findRole,
    showMessage(msgtype,message,content) {
      this.$toast.add({severity:msgtype, summary: message, detail:content, life: 3000});
    },
    correct() {
      if (this.contract.docHistory.stateId === this.Enum.CREATED.ID || !this.findRole(null, "student")) {
        this.corrected = true
      }
    },
    openForm(formName) {
      this.dialog[formName] = true;
      if (formName === "setNumber" && (!this.contract.number  || this.contract.number === "" )) {
        this.registrateContract(true);
        this.reserveDate = (new Date()).toJSON().slice(0, 10).replace(/-/g, ".");
      }
    },
    //Қол қою
    sendToSign() {
      if (!this.formsValidate()) {
        this.$toast.add({
          severity: "error",
          summary: this.$t("common.tosign"),
          detail: this.$t("common.message.fillError"),
          life: 3000,
        });
        return
      }

      if (this.corrected) {
        this.$toast.add({
          severity: "warn",
          summary: this.$t("common.tosign"),
          detail: this.$t("common.message.saveChanges"),
          life: 3000,
        });
        return
      }

      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.approve'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          var req = { 
            id: this.contract.id, 
            lang: 'kaz',
          };

          if (this.contract.lang != 0) {
            req.lang = 'rus';
          }

          this.loading = true
          axios.post(smartEnuApi + "/agreement/sendtosign", req, { 
            headers: getHeader(),
          }).then(response => {
            this.loading = false
            this.contract.docUUID = response.data.docUUID
            this.contract.filePath = response.data.filePath
            this.contract.docHistory = response.data.docHistory
            this.menu[3].items[2].disabled = true
            this.$toast.add({
              severity: "success",
              summary: this.$t("common.tosign"),
              detail: this.$t("ncasigner.successSentToSign"),
              life: 3000,
            });
          }).catch(error => {
            this.loading = false;
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else 
              console.log(error);
          })
        }
      })
    },
    sendToApprove(type) {
      if (!this.formsValidate()) {
        this.$toast.add({
          severity: "error",
          summary: this.$t("common.approve"),
          detail: this.$t("common.message.fillError"),
          life: 3000,
        });
        return
      }

      if (this.corrected) {
        this.$toast.add({
          severity: "warn",
          summary: this.$t("common.approve"),
          detail: this.$t("common.message.saveChanges"),
          life: 3000,
        });
        return
      }

      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.approve'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          var req = { 
            id: this.contract.id, 
            type: type,
            lang: 'kaz',
          };
          if (this.contract.lang != 0) {
            req.lang = 'rus';
          }
          this.loading = true
          axios.post(smartEnuApi + "/agreement/sendtoapprove", req, { 
            headers: getHeader() 
          }).then(response => {
            this.loading = false
            if (type === 1) {
              this.menu[3].items[0].disabled = true
            } else {
              this.menu[3].items[1].disabled = true
            }
            this.contract.docUUID = response.data.docUUID
            this.contract.filePath = response.data.filePath
            this.contract.docHistory = response.data.docHistory
            this.$toast.add({
              severity: "success",
              summary: this.$t("common.tosign"),
              detail: this.$t('common.message.succesSendToApproval'),
              life: 3000,
            });
          }).catch(error => {
            this.loading = false;
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else 
              console.log(error);
          })
        }
      })
    },
    formsValidate() {
      var result = true
      if (this.contract == null) {
        result = false
        return result
      }

      if (this.contract.params != null)
        this.contract.params.forEach((param)=> {
          if ((param.value == null || param.value == "null" || param.value == "") && ((param.name !== "number") && (param.name !=="date"))) {
            result = false
            return result
          }
          if ((param.name == "contragent" || param.name == "ourside") && (param.value.signer == null) ) {
            result = false
            return result
          }
          if (param.name == "individualEntrepreneur" && param.value == null) {
            result = false
            return result
          }
        });

      if (this.contract.sourceType === this.Enum.DocSourceType.FilledDoc) {
        if (!this.approvalStages || this.approvalStages.length < 1) {
          result = false
          return result
        }

        let filled = true;
        this.approvalStages.forEach(au => {
          if (au.users === null || au.users.length < 1 || au.certificate === null) {
            filled = false;
            return;
          }
        })

        if (!filled) {
          result = false
          return result
        }

        this.filledDocParams[this.selectedDocParams].forEach((param)=> {
          if (param.value == null || param.value == "null" || param.value == "") {
            result = false
            return result
          }
          if ((param.name == "contragent" || param.name == "ourside") && (param.value.signer == null) ) {
            result = false
            return result
          }
        });
      }

      return result
    },
    closeForm(formName) {
      this.dialog[formName] = false;
    },
    tabChanged() {
      if (this.activeTab === this.tabs.Preview) {
        if (!this.contract) return;
        this.downloadContract(false);
      }
    },
    initApiCall() {
      let url = "/agreement/get";
      var req = { id: parseInt(this.$route.params.id) };
      this.loading = true
      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((res) => {
          this.contract = res.data;
          this.contract.params.forEach((param) => {
            if (param.name == "period") {
              param.value  = param.value.map(d => new Date(d));
            }
            if (param.name == "student" && (param.value.userID == 0 || param.value.userID == null)) {
              if (this.findRole(null, 'student')) {
                param.value = this.$store.state.loginedUser
              }
            }
          });

		      this.reserveNumber = this.contract.number
          if (this.contract.docHistory.stateId >= this.Enum.INAPPROVAL.ID) {
            if (this.contract.docHistory.stateId >= this.Enum.SIGNING.ID) {
              this.menu[3].items[2].disabled = true
            }
            this.menu[3].items[0].disabled = true
          } 

          if (this.contract.sourceType == this.Enum.DocSourceType.Template) {
            this.contract.text =
              this.contract.lang == this.language.kz
                ? this.contract.template.mainTextKaz
                : this.contract.template.mainTextRus;
            
            this.folderName = this.$i18n.locale === 'kz' ? this.contract.template.folder.namekz
                : this.$i18n.locale === 'ru' ? this.contract.template.folder.nameru : this.contract.template.folder.nameen
          } else {
            this.getReadyDocCatalog();
          }

          if (this.contract.docHistory.stateId === this.Enum.REVISION.ID) {
            this.initFileUpdate()
          }

          this.initApprovalStages();
          this.initOurside();
          this.loading = false;
        }).catch((error) => {
          console.log(error)
          this.loading = false
          if (error.response && error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else if (error.response && error.response.status == 405) {
            this.haveAccess = false;
          }
        });
    },
    initApprovalStages() {
      if (!this.contract.needApproval && this.contract.sourceType !== this.Enum.DocSourceType.FilledDoc) {
        return
      }
      
      axios.post(smartEnuApi + "/agreement/getApprovalStages", {
        docId: this.contract.id,
      }, {
        headers: getHeader(),
      }).then(response => {
        if (response.status === 200) {
          this.approvalStages = response.data

          if (this.approvalStages) {
            this.approvalStagesDialog = [...this.approvalStages]
          }
          
          if (this.approvalStages && this.contract.sourceType === this.Enum.DocSourceType.Template ||
          this.contract.sourceType === this.Enum.DocSourceType.FilledDoc && this.contract.docHistory.stateId === this.Enum.INAPPROVAL.ID) {
            this.menu[3].items[1].disabled = true
          }
        } else if (this.approvalStages == null && this.contract.sourceType === this.Enum.DocSourceType.FilledDoc) {
          this.initDefaultApprovalInfo();
        }
      }).catch((error) => {
        if (error.response && error.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          console.log(error)
        }

        if (this.approvalStages == null && this.contract.sourceType === this.Enum.DocSourceType.FilledDoc) {
          this.initDefaultApprovalInfo();
        }
      });
    },
    paramToString(param) {
      var result = "";
      if (!param || !param.name) return result;

      switch (param.name) {
        case "text":
          result = param.value;
          break;
        case "number":
          result = "№ " + (param.value ?? "________");
          break;
        case "date":
          result = this.getDate(param.value ?? new Date());
          break;
        case "contragent":
          result =
            result + this.getContragentName(param.value, this.contract.lang);
          break;
        case "individualEntrepreneur":
          // here
          break;
        default:
          result = param.name;
      }
      return result;
    },
    getContragentName(agent, lang) {
      if (!agent) {
        return "";
      }
      switch (agent.type) {
        case this.Enum.ContragentType.Organization:
          var orgName =
            lang != this.language.ru
              ? '"' + agent.data.name + '" ' + agent.data.form.shortname
              : agent.data.form.shortnameru + ' "' + agent.data.nameru + '"';
          if (lang === this.language.kz) {
            orgName += " в лице " + inclineFirstname("директор", "genitive");
          }
          orgName +=
            " " +
            agent.data.chief.lname +
            " " +
            agent.data.chief.fname +
            " " +
            (agent.data.chief.sname ?? "");
          if (lang === this.language.ru) {
            orgName += " тұлғасында";
          }
          return orgName;
        case this.Enum.ContragentType.Person:
          return (
            this.value.data.lname +
            " " +
            agent.data.fname +
            " " +
            (agent.data.sname ?? "")
          );
        case this.Enum.ContragentType.Bank:
          return lang != this.language.ru
            ? '"' +
                agent.data.organization.name +
                '" ' +
                agent.data.organization.form.shortname
            : agent.data.organization.form.shortnameru +
                ' "' +
                agent.data.organization.nameru +
                '"';
      }
    },
    getDate(date) {
      var dd = date.getDate();
      var mm = date.getMonth() + 1;
      var yyyy = date.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      return dd + "." + mm + "." + yyyy;
    },
    saveContract() {
      if (!this.contract) return;
      let url = "/agreement/updatedocparams";
      var req = this.contract;
      req.params = this.filledDocParams[this.selectedDocParams]
      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((res) => {
          this.corrected = false
          this.contract.params = res.data.params
          this.selectedDocParamsDisabled = true

          if (this.contract.sourceType === this.Enum.DocSourceType.Template) {
            this.pdf = null
          }

          this.$toast.add({
            severity: "success",
            summary: this.$t("common.save"),
            detail: this.$t("common.message.succesSaved"),
            life: 3000,
          });
        })
        .catch((error) => {
          console.log(error)
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
          if (error.response.status == 400) {
            this.$toast.add({
              severity: "error",
              summary: this.$t('common.message.' + error.response.data.error),
              life: 3000,
          });
        }
      })
      
    },
    downloadContract(saveFile) {
      if (!this.contract)
        return;

      if (this.pdf) {
        if (saveFile) {
          var link = document.createElement("a");
          link.innerHTML = "Download PDF file";
          link.download = this.contract.id + ".pdf";
          link.href =  this.pdf;
          link.click();
        }
          
        return;
      }

      let url = "/agreement/getpdf";
      var req = { 
        id: this.contract.id, 
        lang: "kaz",
      };
      
      if (this.contract.lang != 0) {
        req.lang = "rus";
      }

      this.loading = true
      axios.post(smartEnuApi + url, req, { 
        headers: getHeader() 
      }).then((response) => {
        this.loading = false
        this.pdf = b64toBlob(response.data);
        if (saveFile) {
          var link = document.createElement("a");
          link.innerHTML = "Download PDF file";
          link.download = this.contract.id + ".pdf";
          link.href =  this.pdf;
          link.click();
        }
      }).catch((error) => {
        this.loading = false
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },
    registrateContract(next = false) {
      if (!this.contract) return;
      let url = "/agreement/setnumber";
      var req = {
        id: this.contract.id,
        next: next,
      };
      this.loading = true
      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((res) => {
          this.loading = false
		      this.reserveNumber = res.data;
          if (!next) {
            this.contract.number = res.data;

            this.$toast.add({
              severity: "success",
              summary: this.$t("common.save"),
              detail: this.$t("common.message.succesRegistered"),
              life: 3000,
            });

            this.pdf = null
          }
        })
        .catch((error) => {
          this.loading = false
          console.log(error);
          if (error.response.status == 401) {
            this.$store.dispatch("logout");
          }
        });
    },
    initDefaultApprovalInfo() {
      axios.post(smartEnuApi + "/approvalList/getDefault", {
        type: this.Enum.DefaultApprovalListType.ReadyAgreement,
      }, {
        headers: getHeader(),
      }).then(response => {
        this.approvalStages = response.data

        if (this.approvalStages) {
          this.approvalStagesDialog = [...this.approvalStages]
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
    initOurside() {
      axios.post(smartEnuApi + '/contragent/get', {
        bin: '010140003594',
        agenttype: this.Enum.ContragentType.Organization,
      }, {
        headers: getHeader()
      }).then(res => {
        if (res.status === 200) {
          this.ourside = res.data.data
        }

        this.initFilledDocParams();
      }).catch(error => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }

        this.initFilledDocParams();
      })
    },
    initFilledDocParams() {
      if (this.contract.params && this.contract.params.length > 0) {       
        this.contract.params.forEach(e => {
          if (e.name === 'contragent') {
            this.selectedDocParams = 0
            this.filledDocParams[this.selectedDocParams] = [...this.contract.params]
          } else if (e.name === 'individualEntrepreneur') {
            this.selectedDocParams = 1
            this.filledDocParams[this.selectedDocParams] = [...this.contract.params]
          }
        })
        this.selectedDocParamsDisabled = true
        return
      }

      this.filledDocParams[0] = [
        {
          id: null,
          docID: this.contract.id,
          name: 'ourside',
          value: this.ourside,
        },
        {
          id: null,
          docID: this.contract.id,
          name: 'contragent',
          value: {},
        }
      ]
      this.filledDocParams[1] = [
        {
          id: null,
          docID: this.contract.id,
          name: 'ourside',
          value: this.ourside,
        },
        {
          id: null,
          docID: this.contract.id,
          name: 'individualEntrepreneur',
          value: {
            type: 4,
          },
        }
      ]
      this.corrected = true
    },
    dialogHidden() {
      this.approvalStagesDialog = [...this.approvalStages]
    },
    saveApprovalUser(event) {
      this.loading = true
      
      axios.post(smartEnuApi + '/agreement/updateApprovalStages', {
        docId: this.contract.id,
        approvalStages: event,
      }, {
        headers: getHeader()
      }).then(res => {
        this.approvalStages = event
        this.approvalStagesDialog = event

        this.closeForm('approvalUsers')
        this.loading = false
      }).catch(error => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: this.$t('common.message.saveError'),
            life: 3000,
          });
        }

        this.closeForm('approvalUsers')
        this.loading = false
      })

    },
    filledDocParamsUpdated() {
      if (this.contract.docHistory.stateId > this.Enum.CREATED.ID) {
        return
      }
      
      this.corrected = true
    },
    getReadyDocCatalog() {
      axios.post(smartEnuApi + '/doc/getFoldersByType', {
        type: Enum.FolderType.FilledDoc,
        showDocs: false,
      }, {
        headers: getHeader()
      }).then(res => {
        res.data.forEach(el => {
          if (el.id === this.contract.folderID) {
            this.folderName = el['name' + this.$i18n.locale]
          }
        })
      }).catch(err => {
        if (err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          console.log(err)
        }
      })
    },
    fileUpdated() {
      location.reload()
    },
    initFileUpdate() {
      this.file = {
        namekz: this.contract.namekz,
        nameru: this.contract.nameru,
        nameen: this.contract.nameen,
        id: this.contract.id,
        lang: {
          value: this.contract.lang,
        },
        docType: this.contract.docType,
        sourceType: this.contract.sourceType,
      }
    },
  },
  mounted() {
    this.initApiCall();
  },
};
</script>
<style scoped lang="scss">
.border-indigo-300 {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.border {
  border-width: 1px;
}
.rounded {
  border-radius: 0.25rem;
}
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus\:border-indigo-300:focus {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.w-4 {
  width: 1rem;
}
.h-4 {
  height: 1rem;
}
.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.embed-cover {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;


  right: 0;


  margin-right: 20px;
}

.wrapper {
  position: relative;
  overflow: hidden;
}

/* Not Important*/
img {
  width: 300px; 
}

</style>
