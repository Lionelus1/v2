<template>
    <div id="carddiv" class="grid">
      <div class="col-12">
        <h3>{{ $t('hr.candidateResume') }}</h3>
        <div>
          <Menubar :model="menu" :readonly="false" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
          </Menubar>
        </div>
      </div>
      <div v-if="visible" class="col-12 md:col-12 p-fluid">
        <ResumeView ref="pdf" :value="candidate" :readonly="true"/>
      </div>
      <div v-if="!candidate">
        <p>Резюме не найдено</p>
      </div>
    </div>
  </template>
  
  <script>
  import ResumeView from "@/components/humanResources/candidate/ResumeView.vue";
  import html2pdf from "html2pdf.js";
  import { useI18n } from "vue-i18n";
  import { CandidateService } from "@/service/candidate.service";
  import { ref, onMounted } from "vue";
  
  export default {
    components: { ResumeView },
    props: {
      userID: {
        type: Number,
        default: null,
      },
    },
    data() {
      return {
        pdfContentRef: null,
        candidateService: new CandidateService(),
        candidate: null,
        visible: false,
        menu: [
          {
            label: this.$t('common.download'),
            icon: "pi pi-fw pi-download",
            visible: true,
            disabled: () => this.isDisabled(),
            items: [
              {
                label: this.$t('common.theResume'),
                icon: "pi pi-fw pi-file-pdf",
                visible: true,
                command: this.downloadResume,
              },
            ],
          },
        ],
      };
    },
    methods: {
      downloadResume() {
        if (!this.candidate) {
          return; 
        }
  
        let pdfOptions = {
          margin: 15,
          image: {
            type: 'jpeg',
            quality: 1,
          },
          html2canvas: { scale: 3 },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'p',
          },
          filename: "file.pdf",
        };
        const pdfContent = this.$refs.pdf.$refs.htmlToPdf
        const worker = html2pdf().set(pdfOptions).from(pdfContent);
        worker.toPdf().output("blob").then((pdf) => {
          var reader = new FileReader();
          reader.readAsDataURL(pdf);
          reader.onloadend = () => {
            var base64data = reader.result;
            var link = document.createElement('a');
            link.innerHTML = 'Download PDF file';
            link.download = 'Resume.pdf';
            link.href = base64data;
            link.click();
          };
        });
      },
      getUserCandidate() {
        if (this.userID == null) {
          return;
        }
  
        const req = {
          userId: this.userID,
        };
  
        this.candidateService.getUserCandidate(req).then((res) => {
          this.candidate = res.data;
          this.visible = true;
        }).catch((error) => {
          if (error.response.status === 404) {
            this.candidate = null;
            this.visible.notFound = true;
          } else {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          }
        });
      },
      isDisabled() {
        return !this.candidate
      },
    },
    mounted() {
      this.getUserCandidate();
    },
  };
  </script>
