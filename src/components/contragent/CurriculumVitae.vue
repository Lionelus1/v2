<template>
  <div v-if="candidate" class="resume-container">
    <div class="header">
      <img class="card_img round" v-if="candidate?.user?.photo" :src="'data:image/jpeg;base64,' + candidate?.user?.photo"/>
      <img class="card_img round" v-else src="assets/layout/images/default-user.jpg"/>

      <div class="resume-data">
        <h1>{{ candidate?.user.fullName }}</h1>
        <p>{{ $i18n.locale === 'ru' ? candidate?.user.mainPosition.nameru : $i18n.locale === 'kz' ? candidate?.user.mainPosition.namekz : candidate?.user.mainPosition.nameen }}</p>
        <div class="contact-info">
          <p v-if="candidate?.user?.phoneNumber"><i class="fas fa-phone"></i> {{ candidate?.user.phoneNumber }}</p>
          <p v-if="candidate?.user?.email"><i class="far fa-envelope"></i> {{ candidate?.user.email }}</p>        </div>
      </div>
    </div>

    <div class="content">
      <div class="column">
        <div class="section" v-if="educations?.length > 0">
          <h2>Образование</h2>
          <div class="entry" v-for="edu in educations" :key="edu.id">
            <div class="year">{{ formatYear(edu.receiptDate) }} - {{ formatYear(edu.expirationDate) }} {{ edu.isStillStudying ? 'Учится' : '' }}</div>
            <div class="details">
              <p>{{ edu.institution }}</p>
              <p>{{ edu.faculty }}</p>
              <p>{{$t('common.speciality')}}: {{ edu.speciality }}</p>
            </div>
          </div>
        </div>
        <div class="section" v-if="experiences?.length > 0">
          <h2>Опыт работы</h2>
          <div class="entry" v-for="exp in experiences" :key="exp.id">
            <div class="year">{{ formatDate(exp.startDate) }} - {{ exp.isStillWorking ? 'До настоящего времени' : formatDate(exp.endDate) }}</div>
            <div class="details">
              <p>{{ exp.organizationName }}</p>
              <p>{{ exp.position }}</p>
            </div>
          </div>
        </div>

      </div>

      <div class="section" v-if="languages?.length > 0">
      <h2>{{t('hr.title.language')}}</h2>
      <div class="language-container" v-for="lang in languages" :key="lang.language.nameKz">
        <p class="level-title">{{ lang.language.nameKz }}</p>
        <div class="progress-bar">
          <div class="level-item">
            <p class="level-name">{{t('hr.lang.rl')}}</p>
            <div class="border_lang">
            <svg width="89" height="7" viewBox="0 0 89 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect :width="calculateProgressWidth(lang.readingLevel.value)" height="7" fill="#414754"/>
            </svg>
            </div>
          </div>
          <div class="level-item">
            <p class="level-name">{{t('hr.lang.sl')}}</p>
            <div class="border_lang">
            <svg width="89" height="7" viewBox="0 0 89 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect :width="calculateProgressWidth(lang.speakingLevel.value)" height="7" fill="#414754"/>
            </svg>
          </div>
          </div>
          <div class="level-item">
            <p class="level-name">{{t('hr.lang.wl')}}</p>
            <div class="border_lang">
            <svg width="89" height="7" viewBox="0 0 89 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect :width="calculateProgressWidth(lang.writingLevel.value)" height="7" fill="#414754"/>
            </svg>
          </div>
          </div>
        </div>
      </div>
    </div>

    </div>
  </div>
  <div v-else>
    <p>Данные кандидата не найдены или не могут быть загружены.</p>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import ResumeService from "../humanResources/candidate/ResumeService";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import CryptoJS from 'crypto-js';

const route = useRoute();
const {t, locale} = useI18n();
const toast = useToast();
const resumeService = new ResumeService();
const candidate = ref(null);
const educations = ref([]);
const languages = ref([]);
const experiences = ref([]);

const userID = computed(() => {
  try {
    const encrypted = CryptoJS.enc.Base64.parse(route.params.uuid).toString(CryptoJS.enc.Utf8);
    const bytes = CryptoJS.AES.decrypt(encrypted, "secretKey");
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Ошибка расшифровки:', error);
    return '';
  }
});

const getCandidate = () => {
  resumeService.getCandidate(Number(userID.value)).then(response => {
    candidate.value = response.data;
    getCandidateWorkExperiences(candidate.value.id);
    getCandidateLanguages(candidate.value.id);
    getCandidateEducations(candidate.value.id);
  }).catch(error => {
    if (error?.response?.status !== 404) {
    toast.add({
      severity: "error",
      summary: error.message,
      life: 3000,
    });
    }
  });
};

const getCandidateEducations = (id) => {
  resumeService.getCandidateEducations(Number(id)).then(response => {
    educations.value = response.data;
  }).catch(error => {
    if (error?.response?.status !== 404) {
      toast.add({
        severity: "error",
        summary: error.message,
        life: 3000,
      });
    }
  });
};

const getCandidateLanguages = (id) => {
  resumeService.getCandidateLanguages(Number(id)).then(response => {
    languages.value = response.data;
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error.message,
      life: 3000,
    });
  });
};

const getCandidateWorkExperiences = (id) => {
  resumeService.getCandidateWorkExperiences(Number(id)).then(response => {
    experiences.value = response.data;
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error.message,
      life: 3000,
    });
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const formatYear = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  return year
}

const calculateProgressWidth = (level) => {
  const maxWidth = 100; // Maximum width in percentage
  const scaledWidth = (level / 5) * maxWidth; // Scale level to a 0-100% range
  return `${scaledWidth}%`;
};

onMounted(() => {
  getCandidate();
});
</script>

<style scoped lang="scss">
.border_lang {
  border: 1px solid #ccc;
  position: relative;
  height: 7.5px;
  width: 90px;
  svg{
    position: absolute;
  }
}
.resume-container {
  width: 100%;
  max-width: 1035px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  background-color: #414754;
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  border-radius: 8px 8px 0 0;
}

.card_img.round {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
}

.resume-data {
  flex: 1;
}

.resume-data h1 {
  margin: 0;
  font-size: 24px;
}

.resume-data p {
  margin: 5px 0;
  font-size: 16px;
}

.contact-info {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.content {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.column {
  width: 48%;
}

.section {
  margin-bottom: 50px;
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
  font-size: 14px;
}

.details {
  margin-left: 20px;
  font-size: 14px;
}
.language-container {
  margin-bottom: 0.1px;
}

.progress-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-item {
  display: flex;
  align-items: center;
}

.level-name {
  width: 100px;
  margin-right: 10px;
  margin-bottom: 1px;
}

.progress {
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}
.level-title {
  font-weight: bold;
  margin-bottom: 1px;
}
</style>
