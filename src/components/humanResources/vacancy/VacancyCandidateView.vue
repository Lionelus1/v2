<template>
  <h3>{{ $t('hr.candidates')}}</h3>
  <div>
    <DataTable :value="candidates" responsiveLayout="scroll">
      <Column field="candidate.user.fullName" :header="$t('common.fullName')"></Column>
      <Column v-bind:header="$t('common.status')" >
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
    </DataTable>
    <Sidebar
        v-model:visible="sidebar"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <div id="carddiv" class="p-grid">
        <div class="p-col-12">
          <h3>{{ $t('hr.candidateResume') }}</h3>
          <div>
            <Menubar :model="menu" :key="active"
                     style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
            </Menubar>
          </div>
        </div>
        <div class="p-col-12 p-md-12 p-fluid">
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
  </div>
</template>

<script>
import ResumeView from "../candidate/ResumeView";
import VacancyService from "./VacancyService";
import ApplyActionEdit from "./ApplyActionEdit";
import html2pdf from "html2pdf.js";

export default {
  name: "VacancyCandidateView",
  components: {ApplyActionEdit, ResumeView},
  data() {
    return {
      sidebar: false,
      sendMessage: false,
      candidateRelation: null,
      active: null,
      action: null,
      actionReject: null,
      actionReserve: null,
      path: null,
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
    }
  },
  methods: {
    view(data) {
      this.candidateRelation = data
      this.checkAction(data)
      this.sidebar = true
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