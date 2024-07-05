<template>
<div class="header">
  <img src="path_to_your_photo.jpg" alt="Фото" class="photo">
  <div class="resume-data">
    <h1>{{ candidate?.user.fullName}}</h1>
    <p style="padding-top: 10px">{{ $i18n.locale === "ru" ? candidate?.user.mainPosition.nameru : $i18n.locale === "kz" ? candidate?.user.mainPosition.namekz : candidate?.user.mainPosition.nameen}}</p>
    <div style="display: flex; padding-top: 10px">
      <p>87718492877</p>
      <p style="margin-left: 10px">{{candidate?.user.email}}</p>
    </div>
  </div>
</div>
<div class="content">
  <div class="column">
    <div class="section">
      <h2>Образование</h2>
      <div class="entry">
        <div class="year">2018-2022</div>
        <div class="details">
          <p>ЕНУ им.Л.Н.Гумилева, г.Астана ул.К.Сатпаева 2.</p>
          <p>Факультет информационных технологии</p>
          <p>Специальность: Информатика</p>
        </div>
      </div>
      <div class="entry">
        <div class="year">2024-2026</div>
        <div class="details">
          <p>ЕНУ им.Л.Н.Гумилева, г.Астана ул.К.Сатпаева 2.</p>
          <p>Факультет информационных технологии</p>
          <p>Специальность: Информатика</p>
        </div>
      </div>
    </div>
  </div>
  <div class="column">
    <div class="section">
      <h2>Языки</h2>
      <p>Казахский</p>
      <div>
        <p class="p_language">Уровень чтения: .</p>
        <p class="p_language">Уровень речи: .</p>
        <p class="p_language">Уровень письма: .</p>
      </div>
      <p>Английский</p>
      <div>
        <p class="p_language">Уровень чтения: .</p>
        <p class="p_language">Уровень речи: .</p>
        <p class="p_language">Уровень письма: .</p>
      </div>
      <p>Немецкий</p>
      <div>
        <p class="p_language">Уровень чтения: .</p>
        <p class="p_language">Уровень речи: .</p>
        <p class="p_language">Уровень письма: .</p>
      </div>
    </div>
  </div>
</div>
<div class="content">
  <div class="section">
    <h2>Опыт работы</h2>
    <div class="entry">
      <div class="year">01.09.2022-23.12.2022</div>
      <div class="details">
        <p>CyberHub</p>
        <p>Преподаватель по робототехнике</p>
      </div>
    </div>
    <div class="entry">
      <div class="year">26.12.2022-До настоящего времени</div>
      <div class="details">
        <p>ЕНУ им.Л.Н.Гумилева</p>
        <p>Бизнес-аналитик-тестировщик</p>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>

import {ref, computed, onMounted} from 'vue';
import ResumeService from "../humanResources/candidate/ResumeService";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()
const toast = useToast()
const resumeService = new ResumeService()
const candidate = ref(null)

const getCandidate = () => {
  resumeService.getCandidate().then(response => {
    candidate.value = response.data
    console.log(candidate.value)
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  })
}
const getCandidateEducations = () => {
  this.resumeService.getCandidateEducations(this.candidate.id).then(response => {
    this.educations = response.data
    this.iter++
  }).catch(error => {
    if (error.data.status !== 404) {
      this.$toast.add({
        severity: "error",
        summary: error,
        life: 3000,
      });
    }
  })
}
const getCandidateAcademicDegrees = () => {
  this.resumeService.getCandidateAcademicDegrees(this.candidate.id).then(response => {
    this.academicDegrees = response.data
    this.iter++
  }).catch(error => {
    this.$toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  })
}
const getCandidateAcademicTitles = () => {
  this.resumeService.getCandidateAcademicTitles(this.candidate.id).then(response => {
    this.academicTitles = response.data
    this.iter++
  }).catch(error => {
    this.$toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  })
}
const getCandidateLanguages = () => {
  this.resumeService.getCandidateLanguages(this.candidate.id).then(response => {
    this.languages = response.data
    this.iter++
  }).catch(error => {
    this.$toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  })
}
const getCandidateWorkExperiences = () => {
  this.resumeService.getCandidateWorkExperiences(this.candidate.id).then(response => {
    this.experiences = response.data
    this.iter++
  }).catch(error => {
    this.$toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  })
}
const getCandidateRefresherCourses = () => {
  this.resumeService.getCandidateRefresherCourses(this.candidate.id).then(response => {
    this.refresherCourses = response.data
    this.iter++
  }).catch(error => {
    this.$toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    });
  })
}
const getCandidateReferees = () => {
  this.resumeService.getCandidateReferees(this.candidate.id).then(response => {
    this.referees = response.data
    this.iter++
  }).catch(error => {
    console.log(error)
  })
}
const getCandidateIdentificationDetail = () => {
  this.resumeService.getCandidateIdentificationDetail(this.candidate.id).then(response => {
    this.identificationDetail = response.data
    this.iter++
  }).catch(error => {
    if (error.response.status === 404) {
      this.identificationDetail = null
      this.iter++
    }
  })
}
const getCandidateAcademicDetail = () => {
  this.resumeService.getCandidateAcademicDetail(this.candidate.id).then(response => {
    this.academicDetail = response.data
    this.iter++
  }).catch(error => {
    if (error.response.status === 404) {
      this.academicDetail = null
      this.iter++
    }
  })
}
const editEducation = () => {
  this.exchange.value = this.educations
  this.exchange.section = this.section.education
  this.exchange.editMode = true
  this.exchange.title = this.titles.education
}
const editDegreesAndTitles = () => {
  this.exchange.value = this.academicDegrees
  this.exchange.titleValue = this.academicTitles
  this.exchange.section = this.section.degreeAndTitle
  this.exchange.editMode = true
  this.exchange.title = this.titles.degreeAndTitle
}
const editWorkExperiences = () => {
  this.exchange.value = this.experiences
  this.exchange.section = this.section.experience
  this.exchange.editMode = true
  this.exchange.title = this.titles.experience
}
const editLanguages = () => {
  this.exchange.value = this.languages
  this.exchange.section = this.section.language
  this.exchange.editMode = true
  this.exchange.title = this.titles.language
}
const editRefresherCourses = () => {
  this.exchange.value = this.refresherCourses
  this.exchange.section = this.section.refresherCourse
  this.exchange.editMode = true
  this.exchange.title = this.titles.refresherCourse
}
const editReferees = () => {
  this.exchange.value = this.referees
  this.exchange.section = this.section.referee
  this.exchange.editMode = true
  this.exchange.title = this.titles.referee
}
const editIdentificationDetail = () => {
  this.exchange.value = this.identificationDetail
  this.exchange.section = this.section.id
  this.exchange.editMode = true
  this.exchange.title = this.titles.id
}
const editAcademicDetail = () => {
  this.exchange.value = this.academicDetail
  this.exchange.section = this.section.academicDetail
  this.exchange.editMode = true
  this.exchange.title = this.titles.academicDetail
}
const editInfo = () => {
  this.exchange.section = this.section.info
  this.exchange.editMode = true
  this.exchange.title = this.titles.info
}

onMounted(() => {
  getCandidate()
});
</script>

<style scoped>
.header {
  background-color: #414754;
  color: white;
  width: 1035px;
  height: auto;
  padding: 20px;
  display: flex;
  align-items: center;
}
.photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
}
.resume-data h1 {
  margin: 0;
  font-size: 24px;
}
.resume-data p {
  margin: 5px 0;
}
.content {
  width: 1035px;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.column {
  width: 48%;
}
.section {
  margin-bottom: 20px;
}
.section h2 {
  border-bottom: 2px solid #414754;
  padding-bottom: 5px;
}
.entry {
  margin-bottom: 15px;
}
.year {
  font-weight: bold;
}
.details {
  margin-left: 20px;
}
.languages {
  text-align: right;
}
.p_language {
  margin-left: 20px
}
</style>