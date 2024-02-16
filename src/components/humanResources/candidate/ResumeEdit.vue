<template>
  <div class="card">
    <div class="field" v-if="section === chapter.education">
      <EducationView v-for="education in educations" :key="education.id" :model-value="education"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="educationEdit"></Button>
    </div>
    <div class="grid formgrid" v-if="section === chapter.degreeAndTitle">
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <AcademicDegreeView v-for="academicDegree in academicDegrees" :key="academicDegree.id"
                            :model-value="academicDegree"/>
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="academicDegreeEdit"></Button>
      </div>
      <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
        <AcademicTitleView v-for="academicTitle in academicTitles" :key="academicTitle.id"
                           :model-value="academicTitle"/>
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="academicTitleEdit"></Button>
      </div>
    </div>
    <div class="field" v-if="section === chapter.language">
      <LanguageView v-for="language in languages" :key="language.id" :model-value="language"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="languageEdit"></Button>
    </div>
    <div class="field" v-if="section === chapter.experience">
      <WorkExperienceView v-for="experience in experiences" :key="experience.id" :model-value="experience"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="experienceEdit"></Button>
    </div>
    <div class="field" v-if="section === chapter.refresherCourse">
      <RefresherCourseView v-for="course in refresherCourses" :key="course.id" :model-value="course"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="refresherCourseEdit"></Button>
    </div>
    <div class="field" v-if="section === chapter.referee">
      <RefereeView v-for="referee in referees" :key="referee.id" :model-value="referee"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="refereeEdit"></Button>
    </div>
    <div class="field" v-if="section === chapter.id">
      <IdentificationDetailView v-if="identificationDetail && identificationDetail.iin !== undefined" :model-value="identificationDetail"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить"
              v-if="!identificationDetail || identificationDetail.iin === undefined" :onclick="idEdit"></Button>
    </div>
    <div class="field" v-if="section === chapter.academicDetail">
      <AcademicDetailView v-if="academicDetail !== null" :model-value="academicDetail"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить"
              v-if="academicDetail === null" :onclick="academicDetailEdit"></Button>
    </div>
    <div class="field" v-if="section === chapter.info">
      <InfoView v-if="candidate.info" :model-value="candidate"/>
      <Button icon="pi pi-plus" class="p-button-link" label="Добавить"
              v-if="candidate.info === null" :onclick="infoEdit"></Button>
    </div>
    <Sidebar
        v-model:visible="isView.education"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <EducationEdit
          :model-value=education
          :candidate-id=candidate.id
      ></EducationEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.academicDegree"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <AcademicDegreeEdit
          :model-value=academicDegree
      ></AcademicDegreeEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.academicTitle"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <AcademicTitleEdit
          :model-value=academicTitle
      ></AcademicTitleEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.language"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <LanguageEdit
          :model-value=language
      ></LanguageEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.experience"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <ExperienceEdit
          :model-value=experience
      ></ExperienceEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.refresherCourse"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <RefresherCourseEdit
          :model-value=refresherCourse
      ></RefresherCourseEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.referee"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <RefereeEdit
          :model-value=referee
      ></RefereeEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.id"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <IdentificationDetailEdit
          :model-value=identificationDetail
      ></IdentificationDetailEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.academicDetail"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <AcademicDetailEdit
          :model-value=academicDetail
      ></AcademicDetailEdit>
    </Sidebar>
    <Sidebar
        v-model:visible="isView.info"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <InfoEdit
          :model-value=candidate
      ></InfoEdit>
    </Sidebar>
  </div>
</template>

<script>
import EducationEdit from "./subedits/EducationEdit";
import AcademicDegreeEdit from "./subedits/AcademicDegreeEdit";
import AcademicTitleEdit from "./subedits/AcademicTitleEdit";
import LanguageEdit from "./subedits/LanguageEdit";
import ExperienceEdit from "./subedits/ExperienceEdit";
import RefresherCourseEdit from "./subedits/RefresherCourseEdit";
import RefereeEdit from "./subedits/RefereeEdit";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import EducationView from "./subviews/EducationView";
import AcademicDegreeView from "./subviews/AcademicDegreeView";
import AcademicTitleView from "./subviews/AcademicTitleView";
import WorkExperienceView from "./subviews/WorkExperienceView";
import RefresherCourseView from "./subviews/RefresherCourseView";
import RefereeView from "./subviews/RefereeView";
import IdentificationDetailEdit from "./subedits/IdentificationDetailEdit";
import IdentificationDetailView from "./subviews/IdentificationDetailView";
import LanguageView from "./subviews/LanguageView";
import ResumeService from "./ResumeService";
import AcademicDetailEdit from "./subedits/AcademicDetailEdit";
import AcademicDetailView from "./subviews/AcademicDetailView";
import InfoEdit from "./subedits/InfoEdit";
import InfoView from "./subviews/InfoView";

export default {
  name: "ResumeEdit",
  components: {
    InfoView,
    InfoEdit,
    AcademicDetailView,
    AcademicDetailEdit,
    LanguageView,
    IdentificationDetailView,
    IdentificationDetailEdit,
    RefereeView,
    RefresherCourseView,
    WorkExperienceView,
    AcademicTitleView,
    AcademicDegreeView,
    EducationView,
    EducationEdit,
    AcademicDegreeEdit,
    AcademicTitleEdit,
    LanguageEdit,
    ExperienceEdit,
    RefresherCourseEdit,
    RefereeEdit
  },
  props: {
    value: null,
    titleValue: null,
    section: null,
  },
  data() {
    return {
      candidate: {},
      educations: this.value,
      academicDegrees: this.value,
      academicTitles: this.titleValue,
      languages: this.value,
      experiences: this.value,
      refresherCourses: this.value,
      referees: this.value,
      academicDegree: null,
      academicTitle: null,
      education: null,
      language: null,
      experience: null,
      refresherCourse: null,
      referee: null,
      identificationDetail: this.value,
      academicDetail: this.value,
      isView: {
        resume: true,
        education: false,
        academicDegree: false,
        academicTitle: false,
        language: false,
        experience: false,
        refresherCourse: false,
        referee: false,
        id: false,
        academicDetail: false,
        info: false,
      },
      chapter: {
        education: 'education',
        degreeAndTitle: 'degreeAndTitle',
        language: 'languages',
        experience: 'experience',
        refresherCourse: 'refresherCourse',
        referee: 'referee',
        id: 'id',
        academicDetail: 'academicDetail',
        info: 'info'
      }
    }
  },
  created() {
    this.resumeService = new ResumeService()
  },
  methods: {
    educationEdit() {
      this.education = {}
      this.education.candidate = this.candidate
      this.isView.education = true
    },
    academicDegreeEdit() {
      this.academicDegree = {}
      this.academicDegree.candidate = this.candidate
      this.isView.academicDegree = true
    },
    academicTitleEdit() {
      this.academicTitle = {}
      this.academicTitle.candidate = this.candidate
      this.isView.academicTitle = true
    },
    languageEdit() {
      this.language = {}
      this.language.candidate = this.candidate
      this.isView.language = true
    },
    experienceEdit() {
      this.experience = {}
      this.experience.candidate = this.candidate
      this.isView.experience = true
    },
    refresherCourseEdit() {
      this.refresherCourse = {}
      this.refresherCourse.candidate = this.candidate
      this.isView.refresherCourse = true
    },
    refereeEdit() {
      this.referee = {}
      this.referee.candidate = this.candidate
      this.isView.referee = true
    },
    idEdit() {
      this.identificationDetail = {}
      this.identificationDetail.candidate = this.candidate
      this.isView.id = true
    },
    academicDetailEdit() {
      this.academicDetail = {}
      this.academicDetail.candidate = this.candidate
      this.isView.academicDetail = true
    },
    infoEdit() {
      this.isView.info = true
    },
    createCandidate() {
      axios
          .post(smartEnuApi + "/candidate/create", {}, {headers: getHeader(),})
          .then(res => {
            this.$toast.add({severity: 'success', summary: 'Success', detail: 'Резюме успешно создано', life: 3000});
            this.candidate = {}
            this.candidate = res.data
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    deleteCandidate() {
      axios
          .post(smartEnuApi + "/candidate/delete", {}, {headers: getHeader(),})
          .then(res => {
            this.$toast.add({severity: 'success', summary: 'Success', detail: 'Резюме успешно удалено', life: 3000});
            this.candidate = null
          }).catch(error => {
        if (error.response.status === 404) {
          this.candidate = null
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    getCandidateEducations() {
      this.resumeService.getCandidateEducations(this.candidate.id).then(response => {
        this.educations = response.data
      }).catch(error => {
        if (error.data.status !== 404) {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      })
    },
    getCandidateAcademicDegrees() {
      this.resumeService.getCandidateAcademicDegrees(this.candidate.id).then(response => {
        this.academicDegrees = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateAcademicTitles() {
      this.resumeService.getCandidateAcademicTitles(this.candidate.id).then(response => {
        this.academicTitles = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateLanguages() {
      this.resumeService.getCandidateLanguages(this.candidate.id).then(response => {
        this.languages = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateWorkExperiences() {
      this.resumeService.getCandidateWorkExperiences(this.candidate.id).then(response => {
        this.experiences = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateRefresherCourses() {
      this.resumeService.getCandidateRefresherCourses(this.candidate.id).then(response => {
        this.refresherCourses = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateReferees() {
      this.resumeService.getCandidateReferees(this.candidate.id).then(response => {
        this.referees = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },
    getCandidateIdentificationDetail() {
      this.resumeService.getCandidateIdentificationDetail(this.candidate.id).then(response => {
        this.identificationDetail = response.data
      }).catch(error => {
        if (error.response.status === 404) {
          this.identificationDetail = null
        }
      })
    },
    getCandidateAcademicDetail() {
      this.resumeService.getCandidateAcademicDetail(this.candidate.id).then(response => {
        this.academicDetail = response.data
      }).catch(error => {
        if (error.response.status === 404) {
          this.academicDetail = null
        }

      })
    },
    getCandidate() {
      this.resumeService.getCandidate().then(response => {
        this.candidate = response.data
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    }
  },
  mounted() {
    this.getCandidate()
    this.emitter.on('education', (data) => {
      if (data === true) {
        this.getCandidateEducations();
        this.isView.education = false
      }
    });
    this.emitter.on('educationUpdate', (data) => {
      if (data !== null) {
        this.education = data
        this.isView.education = true
      }
    });
    this.emitter.on('academicDegree', (data) => {
      if (data === true) {
        this.getCandidateAcademicDegrees();
        this.isView.academicDegree = false
      }
    });
    this.emitter.on('academicDegreeUpdate', (data) => {
      if (data !== null) {
        this.academicDegree = data
        this.isView.academicDegree = true
      }
    });
    this.emitter.on('academicTitle', (data) => {
      if (data === true) {
        this.getCandidateAcademicTitles();
        this.isView.academicTitle = false
      }
    });
    this.emitter.on('academicTitleUpdate', (data) => {
      if (data !== null) {
        this.academicTitle = data
        this.isView.academicTitle = true
      }
    });
    this.emitter.on('experience', (data) => {
      if (data === true) {
        this.getCandidateWorkExperiences();
        this.isView.experience = false
      }
    });
    this.emitter.on('experienceUpdate', (data) => {
      if (data !== null) {
        this.experience = data
        this.isView.experience = true
      }
    });
    this.emitter.on('refresherCourse', (data) => {
      if (data === true) {
        this.getCandidateRefresherCourses();
        this.isView.refresherCourse = false
      }
    });
    this.emitter.on('refresherCourseUpdate', (data) => {
      if (data !== null) {
        this.refresherCourse = data
        this.isView.refresherCourse = true
      }
    });
    this.emitter.on('referee', (data) => {
      if (data === true) {
        this.getCandidateReferees();
        this.isView.referee = false
      }
    });
    this.emitter.on('refereeUpdate', (data) => {
      if (data !== null) {
        this.referee = data
        this.isView.referee = true
      }
    });
    this.emitter.on('id', (data) => {
      if (data === true) {
        this.getCandidateIdentificationDetail();
        this.isView.id = false
      }
    });
    this.emitter.on('idUpdate', (data) => {
      if (data !== null) {
        this.identificationDetail = data
        this.isView.id = true
      }
    });
    this.emitter.on('language', (data) => {
      if (data === true) {
        this.getCandidateLanguages();
        this.isView.language = false
      }
    });
    this.emitter.on('languageUpdate', (data) => {
      if (data !== null) {
        this.language = data
        this.isView.language = true
      }
    });
    this.emitter.on('academicDetail', (data) => {
      if (data === true) {
        this.getCandidateAcademicDetail();
        this.isView.academicDetail = false
      }
    });
    this.emitter.on('academicDetailUpdate', (data) => {
      if (data !== null) {
        this.academicDetail = data
        this.isView.academicDetail = true
      }
    });
    this.emitter.on('info', (data) => {
      if (data === true) {
        this.getCandidate();
        this.isView.info = false
      }
    });
    this.emitter.on('infoUpdate', (data) => {
      if (data !== null) {
        this.isView.info = true
      }
    });
  },
}
</script>

<style scoped>

</style>