<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ $t("contracts.contract") }}</h4>
  </div>
  <BlockUI v-if="haveAccess" :blocked="loading" class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
    <TabView v-model:activeIndex="activeTab" @tab-change="tabChanged" class="flex flex-column flex-grow-1">
      <TabPanel :header="$t('common.params')">
        <div v-if="contract" class="flex flex-column flex-grow-1">
          <div class="md:col-6 mt-3">
            <p> {{ $t('common.state') + ": " }}
              <span :class="'customer-badge status-' + contract.docHistory.code">
                {{ contract.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}
              </span>
              <span v-if="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID)" class="ml-1 customer-badge status-status_signed">
                {{ $t('contracts.contragentRequest') }}
              </span>
            </p>
          </div>
          <div class="md:col-6" v-if="contract.docHistory.stateId === DocEnum.REVISION.ID || contract.docHistory.stateId === DocEnum.REJECTED.ID">
            <InlineMessage severity="error">{{ contract.docHistory.comment }}</InlineMessage>
          </div>
          <div class="md:col-6" v-if="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID)">
            <p class="mb-0">{{ $t('contracts.contragentMessage') }}</p>
            <div class="p-inputgroup p-input-filled">
              <Share :data="apiDomain + '/documents/contracts/' + this.contract.uuid + '/request'"
                     :disabled="true" :param="true" :label="$t('ncasigner.copy')" @copy="onCopy()" @error="onFail()"/>
            </div>
          </div>
          <Panel class="md:col-6 p-2" v-if="contract.sourceType === DocEnum.DocSourceType.FilledDoc"
                 :header="$t('contracts.listOfApprovals')" toggleable>
            <StepComponent v-if="selectedUsers.length > 0 && stages.length > 0" v-model="selectedUsers"
                           mode="standard" :stages="stages" @update:modelValue="approvalsUpdated($event)"
                           :readonly="contract.docHistory.stateId > DocEnum.CREATED.ID"></StepComponent>
          </Panel>
          <div class="md:col-6" v-if="contract.sourceType === DocEnum.DocSourceType.FilledDoc">
            <SelectButton v-model="notused.selectedContragent"  :options="[0, 1]"
                          :disabled="contract.docHistory.stateId > DocEnum.CREATED.ID"
                          :unselectable='false' style="margin-bottom: 0.75rem"
                          @update:modelValue="updateContragentType">
              <template #option="slotProps">
                <div v-if="slotProps.option === 0">{{$t('common.organization')}}</div>
                <div v-else>{{$t('common.individualEntrepreneur')}}</div>
              </template>
            </SelectButton>
          </div>
          <div class="flex-grow-1" style="overflow: scroll; height: 150px;" v-if="contractParams">
            <div v-for="(param, id) in contractParams" :key="param.uuid">
              <div class="p-fluid md:col-6 pb-0">
                <template v-if="['number', 'date', 'ourside', 'contragent', 'individualEntrepreneur', 'student', 'period',
                  'практика түрі', 'Вид практики', 'Білім беру бағдарламасы', 'Образовательные программы',
                  'sciadvisor', 'mnvo', 'agreement_end_date', 'project_position', 'irn', 'theme',
                  'mnvo_agreement', 'agreement_sum', 'agreement_sum_text', 'executor_work_place',
                  'priority', 'subpriority', 'work_types'].includes(param.description)">
                  <label v-if="['number', 'date', 'ourside', 'contragent', 'individualEntrepreneur', 'student', 'period'].includes(param.description)">{{ $t("doctemplate.editor." + param.name) }}</label>
                  <label v-else-if="['практика түрі', 'Вид практики'].includes(param.description)">{{ $t('doctemplate.editor.practiceType') }}</label>
                  <label v-else-if="['Білім беру бағдарламасы', 'Образовательные программы'].includes(param.description)">{{ $t('doctemplate.editor.educationProgram') }}</label>
                  <label v-else>{{ $t('contracts.labels.' + param.description) }}</label>
                </template>
                <label v-else>{{ param.description }}</label>
              </div>
              <div class="p-fluid md:col-6" v-if="['text', 'number'].includes(param.name)">
                <InputText v-model="param.value" type="text" @input="input()"
                           :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                              contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID
                              || param.name == 'number'"
                           :placeholder="param.name == 'number' ? $t('contracts.autogenerate') : ''"></InputText>
              </div>
              <div class="p-fluid md:col-6" v-if="param.name == 'date'">
                <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" :disabled="param.description === 'date' ||
                                contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"
                               :placeholder="param.description === 'date' ? $t('contracts.autogenerate') : ''"></PrimeCalendar>
              </div>
              <div class="p-fluid md:col-6" v-if="param.name == 'period'">
                <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" showIcon
                               selectionMode="range" :manualInput="false" @update:modelValue="input()"
                               :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                                  contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID">
                </PrimeCalendar>
              </div>
              <div class="p-fluid md:col-6" v-if="['ourside', 'individualEntrepreneur'].includes(param.name)">
                <ContragentSelectV2 :contragent="param.value" @contragentUpdated="(event) => contragentUpdated(event, param)"
                                    :disable="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                  contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></ContragentSelectV2>
              </div>
              <div class="p-fluid md:col-6" v-if="['contragent'].includes(param.name)">
                <div class="flex flex-wrap gap-3 mb-2" v-if="contract.sourceType === DocEnum.DocSourceType.Template">
                  <div class="flex align-items-center" v-if="!(contract.folder && contract.folder.type === DocEnum.FolderType.Agreement)">
                    <RadioButton v-model="contragentOption" value="email" @update:modelValue="contragentOptionChanged"
                                 :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                      contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></RadioButton>
                    <label class="ml-2">{{ $t('contracts.contragentEmail') }}</label>
                  </div>
                  <div class="flex align-items-center">
                    <RadioButton v-model="contragentOption" value="organization" @update:modelValue="contragentOptionChanged"
                                 :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                      contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></RadioButton>
                    <label class="ml-2">{{ $t('doctemplate.editor.contragent') }}</label>
                  </div>
                  <div class="flex align-items-center">
                    <RadioButton v-model="contragentOption" value="individual" @update:modelValue="contragentOptionChanged"
                                 :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                      contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></RadioButton>
                    <label class="ml-2">{{ $t('doctemplate.editor.individualEntrepreneur') }}</label>
                  </div>
                </div>
                <InputText v-if="contragentOption === 'email'" v-model="contragentEmail"
                           :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                  contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></InputText>
                <ContragentSelectV2 v-else :contragent="param.value"
                                    @contragentUpdated="(event) => contragentUpdated(event, param)"
                                    :disable="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                  contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></ContragentSelectV2>
              </div>
              <div class="p-fluid md:col-6" v-if="param.name == 'student'">
                <FindUser v-model:first="param.value" searchMode="ldap" :max="1" v-model="notused.users"
                          :disabled="(contragentRequest && contract.docHistory.stateId == DocEnum.CREATED.ID) ||
                  contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"
                          :userType="1" @input="input()" @remove="input()"></FindUser>
              </div>
              <div class="p-fluid md:col-6" v-if="param.name === 'person'">
                <ContragentSelectV2 :contragent="param.value" @contragentUpdated="(event) => contragentUpdated(event, param)"
                                    :disable="contract.docHistory.stateId > DocEnum.CREATED.ID && contract.docHistory.stateId != DocEnum.REVISION.ID"></ContragentSelectV2>
              </div>
              <div class="col-12" v-if="param.description === 'work_types'">
                <DataTable :value="param.value" class="p-datatable-small w-full" :editMode="contract.docHistory.stateId > DocEnum.CREATED.ID ? '' : 'cell'"
                           :pt="{column: {bodycell: ({ state }) => ({ class: [{ 'pt-0 pb-0': state['d_editing'] }] })}}">
                  <template v-if="contract.docHistory.stateId === DocEnum.CREATED.ID || contract.docHistory.stateId === DocEnum.REVISION.ID" #header>
                    {{ $t('contracts.work_type_note') }}
                  </template>
                  <template v-if="contract.docHistory.stateId === DocEnum.CREATED.ID || contract.docHistory.stateId === DocEnum.REVISION.ID
                      && (param.value === null || param.value.length < 12)" #footer>
                    <Button :label="$t('contracts.newWork')" @click="newWork(id)" class="p-button-link" style="width: fit-content;" />
                  </template>
                  <Column v-for="col in param.properties.columns" :field="col"
                          :header="$t('contracts.columns.'+col)" :key="col">
                    <template #body="{ data, field }">
                      <template v-if="['start_date', 'end_date'].includes(col)">
                        {{ getShortDateString(data[field]) }}
                      </template>
                      <template v-else>
                        {{ data[field] }}
                      </template>
                    </template>
                    <template v-if="contract.docHistory.stateId === DocEnum.CREATED.ID || contract.docHistory.stateId === DocEnum.REVISION.ID"
                              #editor="{ data, field, index}">
                      <Textarea v-if="['task_code', 'work_name', 'result'].includes(col)"
                                v-model="data[field]" autofocus autoResize rows="5" class="w-full"
                                @update:model-value="param.value[index][field]=data[field]; input()"/>
                      <PrimeCalendar v-if="['start_date', 'end_date'].includes(col)"
                                     v-model="data[field]" dateFormat="dd.mm.yy"
                                     @update:model-value="param.value[index][field]=data[field]; input()"></PrimeCalendar>
                      <InputNumber v-if="['percentage'].includes(col)"
                                   v-model="data[field]" :min="0" :max="100"
                                   @update:model-value="param.value[index][field]=data[field]; input()"/>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.show')" :disabled="!contract || !contract.filePath || contract.filePath.length < 1">
        <div class="flex-grow-1 flex flex-row align-items-stretch">
          <embed :src="pdf" style="width: 100%;" v-if="pdf" type="application/pdf"/>
        </div>
      </TabPanel>
    </TabView>
  </BlockUI>
  <div v-else class="card">
    <Access textMode="short" :showLogo="false" returnMode="back"></Access>
  </div>
  <!-- documentNumberDialog -->
  <Dialog :header="$t('common.registration')" modal="true" v-model:visible="visibility.documentNumberDialog" style="width: 30vw;">
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("contracts.journal") }}</label>
      <div class="col-12 md:col-10">
        <InputText :disabled="true" :modelValue="contract.folder['name'+$i18n.locale]" style="width: 100%;"></InputText>
      </div>
    </div>
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("common.date") }}</label>
      <div class="col-12 md:col-10">
        <InputText :disabled="true" :modelValue="contract.registerDate ? getShortDateString(contract.registerDate) : getShortDateString(new Date())" style="width: 100%;"></InputText>
      </div>
    </div>
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("contracts.regnum") }}</label>
      <div class="col-8 md:col-6">
        <InputText :disabled="true" :modelValue="reserveNumber" style="width: 100%;"></InputText>
      </div>
      <i class="col-4" v-if="!contract.number">-{{ $t("contracts.preliminary") }}</i>
    </div>
    <template #footer>
      <Button :disabled="contract.number" :label="$t('common.registration')" @click="registerContract()" />
      <Button :label="$t('common.cancel')" @click="close('documentNumberDialog')" />
    </template>
  </Dialog>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
    <DocSignaturesInfo :docIdParam="contract.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import { apiDomain, b64toBlob, findRole } from "@/config/config";
import { getShortDateString } from "@/helpers/helper";
import DocEnum from "@/enum/docstates/index";
import RolesEnum from "@/enum/roleControls/index";

import { DocService } from "@/service/doc.service";
import Access from "@/pages/Access";
import ContragentSelectV2 from "@/components/contragent/v2/ContragentSelectV2";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import FindUser from "@/helpers/FindUser";
import StepComponent from "@/components/ncasigner/ApprovalUsers/StepComponent";
import Share from "@/components/Share.vue";

export default {
  name: 'ContractV2',
  components: {Share, Access, ContragentSelectV2, DocSignaturesInfo, FindUser, StepComponent },
  props: { },
  data() {
    return {
      apiDomain: apiDomain,
      service: new DocService(),
      DocEnum: DocEnum,
      RolesEnum: RolesEnum,
      findRole: findRole,
      getShortDateString: getShortDateString,

      visibility: {
        documentNumberDialog: false,
        documentInfoSidebar: false,
        newDocumentDialog: false,
      },

      loading: false,
      haveAccess: true,
      activeTab: 0,
      changed: false,

      contract: null,
      contractParams: [],
      pdf: null,
      reserveNumber: null,
      contragentEmail: null,
      contragentOption: "organization",
      contragentRequest: false,

      selectedUsers: [],
      stages: [],

      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => (this.contract && this.contract.docHistory.stateId > DocEnum.CREATED.ID) || !this.changed ||
              (this.contragentRequest && this.contract.docHistory.stateId == this.DocEnum.CREATED.ID),
          command: () => { this.saveDocument() }
        },
        {
          label: this.$t("common.download"),
          icon: "pi pi-fw pi-download",
          disabled: () => !this.contract || !this.contract.filePath || this.contract.filePath.length < 1,
          command: () => {
            this.downloadContract(true);
          },
        },
        {
          label: this.$t("common.registration"),
          icon: "pi pi-fw pi-paperclip",
          disabled: () => (this.contragentRequest && this.contract.docHistory.stateId == this.DocEnum.CREATED.ID) ||
              (this.contract && this.contract.docHistory.stateId > DocEnum.CREATED.ID) ||
              (this.contract && this.contract.folder && this.contract.folder.type === DocEnum.FolderType.Agreement),
          items: [
            {
              label: this.$t("contracts.setnumber"),
              icon: "pi pi-fw pi-list",
              command: () => {
                this.open("documentNumberDialog");
              },
            }
          ]
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          disabled: () => this.contract && (this.contract.docHistory.stateId === DocEnum.SIGNING.ID ||
              (this.contragentRequest && this.contract.docHistory.stateId === this.DocEnum.CREATED.ID)),
          items: [
            {
              label: this.$t("common.toapprove"),
              icon: "fa-regular fa-handshake",
              visible: () => this.contract && (this.contract.sourceType === DocEnum.DocSourceType.FilledDoc ||
                      (this.contract.template && this.contract.template.needApproval)) &&
                  (this.contract.docHistory.stateId === DocEnum.CREATED.ID || this.contract.docHistory.stateId === DocEnum.REVISION.ID),
              command: () => { this.sendToApprove() }
            },
            {
              label: this.$t("contracts.menu.tocontragent"),
              icon: "fa-solid fa-square-envelope",
              visible: () => this.contract && (this.contract.sourceType === DocEnum.DocSourceType.Template &&
                  !this.contract.template.needApproval && this.contract.docHistory.stateId === DocEnum.CREATED.ID),
              disabled: () => this.contragentOption !== 'email',
              command: () => { this.sendToContragent() }
            },
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => this.contract && ((this.contract.sourceType === DocEnum.DocSourceType.Template &&
                  !this.contract.template.needApproval && (this.contract.docHistory.stateId === DocEnum.CREATED.ID ||
                      this.contract.docHistory.stateId === DocEnum.INAPPROVAL.ID)) || this.contract.docHistory.stateId === DocEnum.APPROVED.ID),
              disabled: () => this.contragentOption === 'email',
              command: () => { this.sendToSign() }
            },
          ]
        },
        {
          label: this.$t('common.approvalList'),
          icon: "pi pi-user-edit",
          disabled: () => !this.contract || !this.contract.docHistory || this.contract.docHistory.stateId < this.DocEnum.INAPPROVAL.ID,
          command: () => {
            this.open('documentInfoSidebar')
          }
        },
        {
          label: this.$t('contracts.menu.relatedDocument'),
          icon: "fa-solid fa-folder-tree",
          disabled: () => false && this.contract && this.contract.docHistory.stateId !== this.DocEnum.SIGNED.ID,
          visible: () => this.contract && this.contract.folder && this.contract.folder.type === this.DocEnum.FolderType.Agreement,
          items: [
            {
              disabled: () => true,
              label: this.$t('contracts.menu.newDocument'),
              command: () => { this.newAct() }
            },
            {
              label: this.$t('contracts.menu.journal'),
              command: () => { this.$router.push('/documents/contracts/' + this.contract.uuid + '/related') }
            }
          ]
        }
      ],

      notused: {
        users: [],
        selectedContragent: 0,
      }
    }
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.getContract();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    open(name) {
      if (name === 'documentNumberDialog' && !this.reserveNumber) {
        this.registerContract(true);
      }

      this.visibility[name] = true;
    },
    close(name) {
      this.visibility[name] = false
    },
    tabChanged() {
      if (this.activeTab === 1) {
        if (!this.contract || !this.contract.filePath || this.contract.filePath.length < 1) return;

        this.downloadContract(false);
      }
    },
    getContract() {
      this.loading = true;

      this.service.getDocumentV2({
        uuid: this.$route.params.uuid
      }).then(res => {
        this.contract = res.data;

        if (this.contract.number) {
          this.reserveNumber = this.contract.number;
        }

        if (this.contract.requests) {
          for (let i = 0; i < this.contract.requests.length; i++) {
            if (this.contract.requests[i].type === this.DocEnum.DocumentRequestType.CounterpartyInfoRequest &&
                this.contract.requests[i].status === 0) {
              this.contragentRequest = true;
              this.contragentOption = "email";
            }
          }
        }

        this.getParams();

        if (this.contract.sourceType === this.DocEnum.DocSourceType.FilledDoc && (!this.contract.approvalStages ||
            this.contract.approvalStages.length < 1)) {
          this.getDefaultApprovalList();
        } else if (this.contract.sourceType === this.DocEnum.DocSourceType.FilledDoc) {
          this.selectedUsers = JSON.parse(JSON.stringify(this.contract.approvalStages));
          this.stages = JSON.parse(JSON.stringify(this.contract.approvalStages));
        }

        if (this.contract.sourceType === this.DocEnum.DocSourceType.FilledDoc && (!this.contractParams ||
            this.contractParams.length < 1)) {
          this.contractParams.push({
            name: 'ourside',
            description: 'ourside',
            value: {
              data: null,
              type: this.DocEnum.ContragentType.Organization,
            },
          });
          this.contractParams.push({
            name: 'contragent',
            description: 'contragent',
            value: {
              data: null,
              type: this.DocEnum.ContragentType.Organization,
            },
          });
        } else if (this.contract.sourceType === this.DocEnum.DocSourceType.FilledDoc) {
          this.contractParams.forEach((param) => {
            if (param.description === 'contragent') {
              if (param.value.type === this.DocEnum.ContragentType.Organization) {
                this.notused.selectedContragent = 0;
              } else {
                this.notused.selectedContragent = 1;
              }
            }
          });
        }

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    getParams() {
      this.contractParams = [];
      this.notused.users = [];

      let param = this.contract.newParams['number'];
      if (param) {
        param.value = this.contract.number;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['date'];
      if (param) {
        param.value = this.contract.registerDate;
        param.value = param.value ? new Date(param.value) : null;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['практика түрі'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['Вид практики'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['ourside'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['contragent'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);

        if (this.contragentOption !== 'email' && !this.contragentRequest) {
          this.contragentOption = "organization";

          if (param.value && param.value.type === this.DocEnum.ContragentType.Person) {
            this.contragentOption = "individual";
          }
        }
      }

      param = this.contract.newParams['individualEntrepreneur'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['student'];
      if (param) {
        if (param.value && param.value.userID < 1) {
          param.value = null;
        }

        if ((!param.value || !param.value.userID) && this.findRole(null, 'student')) {
          param.value = this.$store.state.loginedUser;
        }

        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['Білім беру бағдарламасы'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['Образовательные программы'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['period'];
      if (param) {
        if (param.value)
          for (let i = 0; i < param.value.length; i++) {
            param.value[i] = param.value[i] ? new Date(param.value[i]) : null;
          }
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['sciadvisor'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['mnvo'];
      if (param) {
        param.value = param.value ? new Date(param.value) : null;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['agreement_end_date'];
      if (param) {
        param.value = param.value ? new Date(param.value) : null;
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['project_position'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['irn'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['theme'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['mnvo_agreement'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['agreement_sum'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['agreement_sum_text'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['executor_work_place'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['priority'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['subpriority'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }

      param = this.contract.newParams['work_types'];
      if (param) {
        param.uuid = this.generateUUID();
        this.contractParams.push(param);
      }
    },
    getDefaultApprovalList() {
      this.service.getDefaultApprovalList({
        type: 1,
      }).then(res => {
        this.selectedUsers = JSON.parse(JSON.stringify(res.data));
        this.stages = JSON.parse(JSON.stringify(res.data));
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
          if (err.response.status == 403) {
            this.haveAccess = false;
          }
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
    downloadContract(saveFile) {
      if (!this.contract || !this.contract.filePath || this.contract.filePath.length < 1) return;

      if (this.pdf) {
        if (saveFile) this.saveFile();

        return;
      }

      this.loading = true;

      this.service.downloadDocumentV2({
        uuid: this.contract.uuid
      }).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false;

        if (saveFile) this.saveFile();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    saveFile() {
      var link = document.createElement("a");
      link.innerHTML = "Download PDF file";
      link.download = this.contract.id + ".pdf";
      link.href =  this.pdf;
      link.click();
    },
    saveDocument() {
      for (let i = 0; i < this.contractParams.length; i++) {
        this.contract.newParams[this.contractParams[i].description] = this.contractParams[i];
      }

      this.loading = true;

      this.service.saveDocumentV2(this.contract).then(res => {
        this.contract = res.data;

        if (this.contract.number) {
          this.reserveNumber = this.contract.number;
        }

        this.getParams();

        this.loading = false;
        this.changed = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    registerContract(anticipatorily) {
      if (!this.contract) return;

      this.loading = true;

      this.service.registerDocumentV2({
        uuid: this.contract.uuid,
        anticipatorily: anticipatorily, //предварительно
      }).then(res => {
        this.reserveNumber = res.data;

        if (!anticipatorily) {
          this.contract.number = res.data;
          this.showMessage("success", this.$t("common.save"), this.$t("common.message.succesRegistered"));
        }

        this.loading = false;
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    sendToApprove() {
      if (this.changed) {
        this.showMessage("warn", this.$t("common.tosign"), this.$t("common.message.saveChanges"));
        return;
      }

      if (!this.validate()) {
        this.showMessage("error", this.$t("common.tosign"), this.$t("common.message.fillError"));
        return;
      }

      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.approve'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true;

          this.service.sendDocumentToApprovalV2({
            uuid: this.contract.uuid,
          }).then(res => {
            this.loading = false;

            this.getContract();
          }).catch(err => {
            this.loading = false;

            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }
          })
        }
      });
    },
    sendToSign() {
      if (this.changed) {
        this.showMessage("warn", this.$t("common.tosign"), this.$t("common.message.saveChanges"));
        return;
      }

      if (!this.validate()) {
        this.showMessage("error", this.$t("common.tosign"), this.$t("common.message.fillError"));
        return;
      }

      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.approve'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true;

          this.service.sendDocumentToSignV2({
            uuid: this.contract.uuid,
          }).then(res => {
            this.loading = false;

            this.getContract();
          }).catch(err => {
            this.loading = false;

            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }
          })
        }
      });
    },
    sendToContragent() {
      if (this.changed) {
        this.showMessage("warn", this.$t("common.tosign"), this.$t("common.message.saveChanges"));
        return;
      }

      if (!this.validate()) {
        this.showMessage("error", this.$t("common.tosign"), this.$t("common.message.fillError"));
        return;
      }

      this.loading = true;

      this.service.createNewDocumentRequest({
        requestType: this.DocEnum.DocumentRequestType.CounterpartyInfoRequest,
        docId: this.contract.id,
        contragentEmail: this.contragentEmail,
      }).then(res => {
        this.loading = false;

        this.getContract();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    input() {
      this.changed = true;
    },
    contragentUpdated(contr, param) {
      for (let i = 0; i < this.contractParams.length; i++) {
        if (this.contractParams[i].description === param.description) {
          this.contractParams[i].value = contr;
        }
      }

      this.input();
    },
    updateContragentType() {
      for (let i = 0; i < this.contractParams.length; i++) {
        if (this.contractParams[i].description === 'contragent') {
          this.contractParams[i].uuid = this.generateUUID();
          this.contractParams[i].value.data = null;
          this.contractParams[i].value.type = this.notused.selectedContragent === 0 ? this.DocEnum.ContragentType.Organization : this.DocEnum.ContragentType.Person;
          this.input();
        }
      }
    },
    validate() {
      for (let prop in this.contract.newParams) {
        if (['student', 'period', 'практика түрі', 'Вид практики', 'Білім беру бағдарламасы', 'Образовательные программы'].includes(prop)) {
          if (this.isNull(this.contract.newParams[prop].value)) {
            return false;
          }
        } else if (prop === 'ourside' || (['contragent', 'individualEntrepreneur'].includes(prop) && this.contragentOption !== 'email')) {
          if (this.isNull(this.contract.newParams[prop].value) || this.isNull(this.contract.newParams[prop].value.data)) {
            return false;
          }

          if (this.contract.newParams[prop].value.type === this.DocEnum.ContragentType.Organization &&
              this.isNull(this.contract.newParams[prop].value.data.signer)) {
            return false;
          }
        }
      }

      if (this.contract.sourceType === this.DocEnum.DocSourceType.FilledDoc) {
        if (!this.contract.approvalStages || this.contract.approvalStages.length < 1) {
          return false;
        }

        let filled = true;
        this.contract.approvalStages.forEach((au) => {
          if (au.users === null || au.users.length < 1 || au.certificate === null) {
            filled = false;
            return;
          }
        });

        if (!filled) {
          return false;
        }
      }

      if (this.contract && this.contract.folder && this.contract.folder.type === this.DocEnum.FolderType.Agreement) {
        for (let pId in this.contractParams) {
          let param = this.contractParams[pId];
          if (param.description === 'work_types') {
            let sum = 0;
            for (let rId in param.value) {
              let row = param.value[rId];
              if (row.start_date > row.end_date) {
                this.showMessage("warn", this.$t('contracts.warnStartBigEnd'), getShortDateString(row.start_date) + ' > ' + getShortDateString(row.end_date));
                return false;
              }

              sum += row.percentage;
            }

            if (sum !== 100) {
              this.showMessage("warn", this.$t('contracts.persentageNot100'), sum);
              return false;
            }
          }
        }
      }

      return true;
    },
    isNull(param) {
      if (param === null || param === undefined || param === 'null' || param === '') {
        return true;
      }

      return false;
    },
    onCopy() {
      this.showMessage("success", this.$t('ncasigner.successCopy'));
    },
    onFail() {
      this.showMessage("warn", this.$t('ncasigner.failCopy'));
    },
    approvalsUpdated(event) {
      this.input();

      this.contract.approvalStages = JSON.parse(JSON.stringify(event));
    },
    contragentOptionChanged() {
      for (let i = 0; i < this.contractParams.length && this.contragentOption !== 'email'; i++) {
        if (this.contractParams[i].description === 'contragent') {
          this.contractParams[i].uuid = this.generateUUID();
          this.contractParams[i].value.data = null;
          this.contractParams[i].value.type = this.contragentOption === 'organization' ? this.DocEnum.ContragentType.Organization : this.DocEnum.ContragentType.Person;
          this.input();
        }
      }
    },
    newAct() {
      this.loading = true;

      this.service.documentTemplatesV2({
        page: 0,
        rows: 10,
        folderType: this.DocEnum.FolderType.RelatedDocumentTemplates,
      }).then(res => {
        let templates = res.data.doctemplates;

        this.service.createDocumentV2({
          templateId: templates[0].id,
          docType: this.DocEnum.DocType.RelatedDoc,
          parent: this.contract.uuid,
        }).then(res => {
          this.loading = false;

          this.showMessage('success', this.$t('contracts.title'), this.$t('contracts.message.created'));

          this.$router.push('/documents/contracts/' + this.contract.uuid + '/related/' + res.data.uuid);
        }).catch(err => {
          this.loading = false;

          if (err.response && err.response.status == 401) {
            this.$store.dispatch("logLout")
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null)
          } else {
            console.log(err)
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
          }
        })
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      })
    },
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    newWork(id) {
      if (!this.contractParams[id].value) {
        this.contractParams[id].value = [];
      }

      let newWork = {};

      for (let colId in this.contractParams[id].properties.columns) {
        let prop = this.contractParams[id].properties.columns[colId];

        if (['start_date', 'end_date', 'percentage'].includes(prop)) {
          newWork[prop] = null
        } else {
          newWork[prop] = "null";
        }
      }

      this.contractParams[id].value.push(newWork);

      this.input();
    },
  }
}
</script>
<style scoped>
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
}
.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}
.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}
.status-status_created {
  background: #6c757d;
  color: #fff;
}
.status-status_signing {
  background: #17a2b8;
  color: #fff;
}
.status-status_signed {
  background: #28a745;
  color: #fff;
}
.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}
.status-status_approved {
  background: #007bff;
  color: #ffffff;
}
.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}
.status-status_rejected {
  background: #fdfdfd;
  color: #ff0000;
}
:deep(.p-tabview-panels) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0rem;
}
:deep(.p-tabview-panel) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>