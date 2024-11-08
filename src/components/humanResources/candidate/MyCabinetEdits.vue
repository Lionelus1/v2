<template>
    <div class="card" v-if="chapter.researchInterests == props.section">
        <ResearchInterestsView v-for="modelValue in researchInterests" :key="modelValue.id" :modelValue="modelValue" :userID="user.userID" />
        <Button icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="researchInterestEdit"></Button>
    </div>

    <div class="card" v-if="chapter.id == props.section">
        <MyCabinetIdentificationView :modelValue="identificationDetail"></MyCabinetIdentificationView>
        <Button v-if="!identificationDetail" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="idEdit"></Button>
    </div>

    <div class="field" v-if="props.section === chapter.education">
      <MyEducationView v-for="education in educations" :key="education.id" :userID="user.userID" :modelValue="education"/>
      <Button icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="createEducation"></Button>
    </div>

    <div class="field" v-if="props.section === chapter.laborActivity">
      <WorkExperienceView v-for="experience in experiences" :key="experience.id" typeCustom="scientists" :model-value="experience"/>
      <Button icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="experienceEdit"></Button>
    </div>

    <div class="field" v-if="props.section === chapter.awards">
        <AwardView v-for="award in awards" :key="award.id" typeCustom="scientists" :model-value="award"></AwardView>
        <Button icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="awardEdit"></Button>
    </div>

    <div class="field" v-if="props.section === chapter.qualifications">
        <QualificationsView v-for="qualification in qualifications" :key="qualification.id" typeCustom="scientists" :model-value="qualification"></QualificationsView>
        <Button icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="qualificationsEdit"></Button>
    </div>

    <div class="field" v-if="props.section === chapter.requisite">
        <MyCabinetRequisiteView :modelValue="requisites"/>
        <Button v-if="!requisites" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="requisiteEdit"></Button>
    </div>

    <Sidebar v-model:visible="isView.id" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
        <MyCabinetIdentificationDetail :model-value="identificationDetail"></MyCabinetIdentificationDetail>
    </Sidebar>

    <Sidebar v-model:visible="isView.education"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
        <MyCabinetCreateEducation :modelValue=education></MyCabinetCreateEducation>
    </Sidebar>

    <Sidebar v-model:visible="isView.researchInterest" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <ResearchInterestsEdit :modelValue="researchInterest" :userID="user.userID"/>
    </Sidebar>

    <Sidebar v-model:visible="isView.experience" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <ExperienceEdit :model-value=experience typeCustom="scientists"></ExperienceEdit>
    </Sidebar>

    <Sidebar v-model:visible="isView.award" position="right" class="p-sidebar-lg" style="overflow-y: scroll"> 
        <AwardEdit :userID="user.userID" :model-value=award typeCustom="scientists"></AwardEdit>
    </Sidebar>

    <Sidebar v-model:visible="isView.qualification" position="right" class="p-sidebar-lg" style="overflow-y: scroll"> 
        <QualificationsEdit :model-value=qualification typeCustom="scientists"></QualificationsEdit>
    </Sidebar>

    <Sidebar v-model:visible="isView.requisite" position="right" class="p-sidebar-lg" style="overflow-y: scroll"> 
        <MyCabinetRequisite :model-value=requisite typeCustom="scientists"></MyCabinetRequisite>
    </Sidebar>

</template>

<script setup>
    import ResearchInterestsView from "./subviews/ResearchInterestsView"
    import ResearchInterestsEdit from "./subedits/ResearchInterestsEdit"
    import {computed, onMounted, ref, defineProps, inject, popScopeId} from "vue";
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {useRouter} from "vue-router";
    import {useConfirm} from "primevue/useconfirm";
    import {ScienceService} from "@/service/science.service";
    import MyCabinetIdentificationView from "./subviews/MyCabinetIdentificationView";
    import MyCabinetIdentificationDetail from "./subviews/MyCabinetIdentificationDetail";
    import MyCabinetCreateEducation from "./subviews/MyCabinetCreateEducation";
    import MyEducationView from "./subviews/MyEducationView.vue";
    import {AccountService} from "@/service/account.service"
    import WorkExperienceView from "./subviews/WorkExperienceView";
    import ExperienceEdit from "./subedits/ExperienceEdit";
    import  AwardView from "./subviews/AwardView.vue"
    import  AwardEdit from "./subedits/AwardEdit.vue"
    import QualificationsView from "./subviews/QualificationsView.vue"
    import QualificationsEdit from "./subedits/QualificationsEdit.vue"
    import MyCabinetRequisite from "./subviews/MyCabinetRequisite";
    import MyCabinetRequisiteView from "./subviews/MyCabinetRequisiteView.vue"

    const {t, locale} = useI18n()
    const toast = useToast()
    const loading = ref(false)
    const scienceService = new ScienceService()
    const researchInterests = ref(props.modelValue)
    const identificationDetail = ref(props.modelValue)
    const education = ref({})
    const educations = ref(props.modelValue)
    const user = ref(props.user)
    const experiences = ref(props.modelValue)
    const experience = ref({})
    const awards = ref(props.modelValue)
    const award = ref({})
    const qualifications = ref(props.modelValue)
    const qualification = ref({})
    const requisites = ref(props.modelValue)
    const requisite = ref({})
    const accountService = new AccountService()
    const interestResearch = ref({})
    const researchInterest = ref({}) 
    const props = defineProps(['modelValue', 'section', 'titleValue', 'user']);
    const emitter = inject("emitter");

    const chapter = {
        researchInterests: 'researchInterests',
        id: 'id',
        education: 'education',
        createEducation: 'createEducation',
        requisite: 'requisite',
        laborActivity: 'laborActivity',
        awards: 'awards',
        qualifications: 'qualifications',
    }
    
    const isView = ref({
        researchInterest: false,
        id: false,
        education: false,
        experience: false,
        award: false,
        qualification: false,
        requisite: false,
    })
    
    const idEdit=()=>{
      identificationDetail.value = {}
      identificationDetail.value.user = user.value
      isView.value.id = true
    }

    const researchInterestEdit = ()=> {
        interestResearch.value = {}
        isView.value.researchInterest = true
    }

    const createEducation=() => {
        education.value = {}
        isView.value.education = true
    }

    const experienceEdit=()=> {
      experience.value = {}
      experience.value.candidate = {}
      experience.value.candidate.id = user.value.userID
      isView.value.experience = true
    }

    const awardEdit = () => {
        award.value = {}
        award.value.userID = user.value.userID
        isView.value.award = true
    }

    const qualificationsEdit = () => {
        qualification.value = {}
        qualification.value.userID = user.value.userID
        isView.value.qualification = true
    }

    const requisiteEdit = () => {
        requisites.value = {}
        isView.value.requisite = true
    }

    const getScienceInterests = () => {
        const req = {
            userID: user.value.userID || null
        }

        loading.value = true;
        scienceService.getScienceInterests(req).then(res => {
            researchInterests.value = res.data.interests
            loading.value = false
        }).catch(_ => {
            loading.value = false;
        })
    }

    const getMyAccount= () => {
        const req = {
        id: user.value.userID
        }

        accountService.getMyAccount(req).then(response=>{
            user.value = response.data.user
            educations.value = response.data.educations 

            }).catch(_ => {
        })
    } 

    const getLaborActivity=() => {
        const req = {
            userID: user.value.userID
        }

        loading.value = true
            scienceService.getLaborActivity(req).then(res => {
            experiences.value = res.data.laborActivities
            loading.value = false
        }).catch(_ => {
            loading.value=false
        })
    }

    const getScienceAward= () => {
        const req = {
            userID: props.id || user.value.userID
        }

        scienceService.getScienceAward(req).then(res => {
            awards.value = res.data.award
            loading.value = false
        }).catch(_ => {
            loading.value=false
        })
    }

    const getQualificationsScience = () => {
        const req = {
        userID: props.id || user.value.userID
        }
        loading.value = true
        scienceService.getQualificationsScience(req).then(res => {
            qualifications.value = res.data.qualifications
            loading.value = false
        }).catch(_ => {
            loading.value=false
        })

    }

    onMounted(() => {   
        emitter.on('researchInterest', (data) => {
            if (data === true) {
                getScienceInterests()
                isView.value.researchInterest = false
            }
        })

        emitter.on('researchInterestUpdate', (data) => {
            if (data !== null) {
                researchInterest.value = data
                isView.value.researchInterest = true
            }
        });

        emitter.on('idMyAccountUpdate', (data) => {
            if (data !== null) {
                identificationDetail.value = data
                isView.value.id = true
            }
        });

        
        emitter.on('educationMyAccountUpdate', (data) => {
            if (data !== null) {
                education.value = data
                isView.value.education = true
            }
        });

        emitter.on('educationMyAccount', (data) => {
            if (data === true) {
                getMyAccount()
                isView.value.education = false
            }
        });

        emitter.on('experienceScientists', (data) => {
            if (data === true) {
                getLaborActivity();
                isView.value.experience = false
            }
        });

        emitter.on('experienceUpdateScientists', (data) => {
            if (data !== null) {
                experience.value = data
                isView.value.experience = true
            }
        });

        emitter.on('award', (data) => {
            if (data === true) {
                getScienceAward()
                isView.value.award = false
            }
        });

        emitter.on('awardUpdate', (data) => {
            if (data !== null) {
                award.value = data
                isView.value.award = true
            }
        });

        emitter.on('qualifications', (data) => {
            if (data === true) {
                getQualificationsScience()
                isView.value.qualification = false
            }
        });

        emitter.on('qualificationsUpdate', (data) => {
            if (data !== null) {
                qualification.value = data
                isView.value.qualification = true
            }
        });

        emitter.on('requisiteUpdate', (data) => {
            if (data !== null) {
                requisite.value = data
                isView.value.requisite = true
            }
        });

        emitter.on('requisite', (data) => {
            if (data === true) {
                isView.value.requisite = false
            }
        });
    })

</script>