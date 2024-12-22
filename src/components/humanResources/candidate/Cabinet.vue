<template>
    <h3>{{ $t("common.cabinet") }}</h3>
<div class="card">
  <TabView>
    <TabPanel :header="$t('common.cabinet')">
      <PersonPage v-if="userView" :person="user" :sidebar="true" customType="myAccount"/>
    </TabPanel>
    <TabPanel :header="$t('common.myResume')">
      <Resume/>
    </TabPanel>
    <TabPanel :header="$t('common.myVacancy')">
      <CandidateVacancy/>
    </TabPanel>
    <TabPanel :header="$t('common.actionLog')">
      <ActionLog />
    </TabPanel>
  </TabView>
</div>
</template>

<script setup>
  import CandidateVacancy from "./CandidateVacancy";
  import Resume from "./Resume";
  import PersonPage from '../../contragent/v2/PersonPage.vue';
  import ActionLog from "../../contragent/v2/ActionLog.vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import { inject, ref, onMounted } from "vue";
  import {findRole} from "@/config/config";
  import {UserService} from "@/service/user.service"

  const { t } = useI18n()
  const toast = useToast()
  const user = ref({})
  const emitter = inject("emitter");

  const userService = new UserService
  const fileData = ref(null)
  const userView = ref(false)

  const props = defineProps({
    userID: {
      type: Number,
      default: null,
    },
    modelValue: {
      type: null,
      default: null
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    customType: {
      type: String,
      default: ''
    }
  });

  const userID = ref(props.userID)

  const getUserAccount= () => {
    const req = {
      userID: userID.value
    }

    userService.getUserAccount(req).then(response=>{

      user.value = response.data.user
      userView.value = true
    }).catch(error => {
      toast.add({
        severity: "error",
        summary: t('message.actionError'),
        life: 3000,
      })
    })
  }

  onMounted(() => {
      getUserAccount()
  })

</script>

<style scoped>

</style>
