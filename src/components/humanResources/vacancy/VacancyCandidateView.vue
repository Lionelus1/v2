<template>
  <h3>{{ $t('hr.candidates') }}</h3>
  <div>
    <DataTable :value="candidates" responsiveLayout="scroll">
      <Column field="candidate.user.fullName" :header="$t('common.fullName')"></Column>
      <Column v-bind:header="$t('common.status')">
        <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.history.status.id">
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.history.status.nameKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.history.status.nameRu
                      : slotProps.data.history.status.nameEn
            }}
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button icon="pi pi-id-card"
                  @click="view(slotProps.data)"/>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button v-if="slotProps.data.history.status.id === 10 && vacancy.organization.id === 1"
                  class="p-button-secondary"
                  icon="pi pi-folder-open"
                  @click="viewDocs(slotProps.data)"/>
        </template>
      </Column>
    </DataTable>
    <Sidebar
        v-model:visible="sidebar"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <div id="carddiv" class="grid">
        <div class="col-12">
          <h3>{{ $t('hr.candidateResume') }}</h3>
          <div>
            <Menubar :model="menu" :key="active"
                     style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
            </Menubar>
          </div>
        </div>
        <div class="col-12 md:col-12 p-fluid"
             v-if="vacancy.organization.id === 1">
          <Button :label="$t('hr.doc.signedResumeDownload')"
                  class="p-button-secondary"
                  :onclick="downloadSignedResume"/>
        </div>
        <div class="col-12 md:col-12 p-fluid">
          <ResumeView ref="pdf" :value="candidateRelation.candidate" :readonly="true"/>
        </div>
      </div>
    </Sidebar>
    <Sidebar
        v-model:visible="sendMessage"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <ApplyActionEdit :readonly="false" :candidate-relation="this.candidateRelation" :path="path" :vacancy="vacancy"/>
    </Sidebar>
    <Sidebar
        v-model:visible="docs"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <div class="grid">
        <div class="col-12">
          <h3>{{ $t('hr.doc.up') }}</h3>
          <div>
            <Menubar style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"/>
          </div>
        </div>
        <div class="col-12 md:col-12 p-fluid">
          <DocDownload :paths="documentsPath"/>
        </div>
      </div>
    </Sidebar>
    <Sidebar
        v-model:visible="resumeView"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <DocSignaturesInfo :docIdParam="docId"></DocSignaturesInfo>
    </Sidebar>
  </div>
</template>

<script>
import ResumeView from "../candidate/ResumeView";
import VacancyService from "./VacancyService";
import DocDownload from "./DownloadCandidateDocuments";
import ApplyActionEdit from "./ApplyActionEdit";
import html2pdf from "html2pdf.js";
import api from "@/service/api";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";
import DocSignaturesInfo from "@/components/DocSignaturesInfo"


export default {
  name: "VacancyCandidateView",
  components: {ApplyActionEdit, DocDownload, ResumeView, DocSignaturesInfo},
  data() {
    return {
      sidebar: false,
      sendMessage: false,
      docs: false,
      candidateRelation: null,
      active: null,
      action: null,
      actionReject: null,
      actionReserve: null,
      path: null,
      documentsPath: {
        employmentHistoryPath: null,
        employmentHistoryName: null,
        diplomaPath: null,
        diplomaName: null,
        certsPath: null,
        certsName: null,
        pensionPath: null,
        pensionName: null,
        medCertPath: null,
        medCertName: null,
        narcoCertPath: null,
        narcoCertName: null,
        psychoCertPath: null,
        psychoCertName: null,
        gcCertPath: null,
        gcCertName: null,
        mIdPath: null,
        mIdName: null
      },
      menu: [
        {
          label: 'action',
          icon: "pi pi-fw pi-caret-up",
          visible: false,
          command: () => {
            this.applyAction(this.action.alias)
          },
        },
        {
          label: 'action',
          icon: "pi pi-fw pi-caret-up",
          visible: false,
          command: () => {
            this.applyAction(this.actionReject.alias)
          },
        },
        {
          label: 'action',
          icon: "pi pi-fw pi-caret-up",
          visible: false,
          command: () => {
            this.applyAction(this.actionReserve.alias)
          },
        },
        {
          label: this.$t('common.download'),
          icon: "pi pi-fw pi-download",
          visible: true,
          items: [
            {
              label: this.$t('hr.motivationLetter'),
              icon: "pi pi-fw pi-file",
              visible: true,
              command: () => {
                this.downloadLetter()
              },
            },
            {
              label: this.$t('common.theResume'),
              icon: "pi pi-fw pi-file-pdf",
              visible: true,
              command: () => {
                this.downloadResume()
              },
            },
          ]
        },
      ],
      resumeFile: null,
      docId: null,
      resumeView: false,
    }
  },
  methods: {

    downloadSignedResume() {
      api.post(
          '/candidate/resume/download',
          {
            vacancyId: this.vacancy.id,
            candidateId: this.candidateRelation.candidate.id
          },
          {headers: getHeader()}).then(response => {
        console.log(response.data)
        if (response.data.docId !== null) {
          this.docId = response.data.docId
          this.resumeView = true
        } else {
          var link = document.createElement('a');
          link.innerHTML = 'Download file';
          link.download = response.data.fileName;
          link.href = response.data.fileData;
          link.click();
        }
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    view(data) {
      this.candidateRelation = data
      this.checkAction(data)
      this.sidebar = true
    },
    viewDocs(data) {
      api.post(
         '/candidate/documents/existence',
          {
            vacancyId: this.vacancy.id,
            candidateId: data.candidate.id
          },
          {headers: getHeader()}).then(response => {
        console.log(response.data)
        this.documentsPath = response.data
        this.docs = true
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    downloadLetter() {
      this.vacancyService.downloadLetter(this.candidateRelation.vacancyId,
          this.candidateRelation.candidate.user.userID).then(response => {
        console.log(response.data)
        var link = document.createElement('a');
        link.innerHTML = 'Download file';
        link.download = response.data.name;
        link.href = response.data.file;
        link.click();
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    downloadResume() {
      let pdfOptions = {
        margin: 15,
        image: {
          type: 'jpeg',
          quality: 1,
        },
        html2canvas: {scale: 3},
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'p',
        },
        filename: "file.pdf"
      };
      const pdfContent = this.$refs.pdf.$refs.htmlToPdf
      const worker = html2pdf().set(pdfOptions).from(pdfContent);
      worker.toPdf().output("blob").then((pdf) => {
        var reader = new FileReader();
        reader.readAsDataURL(pdf);
        reader.onloadend = function () {
          var base64data = reader.result;
          console.log(base64data)
          var link = document.createElement('a');
          link.innerHTML = 'Download PDF file';
          link.download = 'Resume.pdf';
          link.href = base64data;
          console.log(link.href)
          link.click();
        }
      });
    },
    applyAction(path) {
      this.path = path
      this.sendMessage = true
    },
    checkAction(data) {
      if (data.history !== undefined) {
        this.vacancyService.checkApplyAction(data.history.status.id).then(response => {
          if (response.data === 'hiring') {
            this.action = this.vacancyService.applyActions.find(action => action.alias === 'hire')
            this.menu[0].label = this.$t(this.action.label)
            this.menu[0].visible = this.action.visible
            this.actionReject = this.vacancyService.applyActions.find(action => action.alias === 'not-hire')
            this.menu[1].label = this.$t(this.actionReject.label)
            this.menu[1].visible = this.actionReject.visible
            this.actionReserve = this.vacancyService.applyActions.find(action => action.alias === 'reserve')
            this.menu[2].label = this.$t(this.actionReserve.label)
            this.menu[2].visible = this.actionReserve.visible
          } else if (response.data !== "") {
            this.action = this.vacancyService.applyActions.find(action => action.alias === 'interview')
            this.menu[0].label = this.$t(this.action.label)
            this.menu[0].visible = this.action.visible
            this.menu[1].visible = false
            this.menu[2].visible = false
          }
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      }
    }
  },
  props: {
    candidates: [],
    vacancy: null,
  },
  created() {
    this.vacancyService = new VacancyService()
  }
}
</script>

<style lang="scss" scoped>
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-8 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-9 {
    background: #eccfff;
    color: #694382;
  }

  &.status-10 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-11 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-12 {
    background: #ffd8b2;
    color: #805b36;
  }
}
</style>