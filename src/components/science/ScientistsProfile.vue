<template>
    <div class="col-12">
      <TitleBlock :title="$t('science.profile')" :show-back-button="true"/>
    </div>

    <div>
      <div class="col-12 md:col-12 p-fluid">
        <PersonPage v-if="userView" :person="user" :sidebar="true" custom-type="scientists"/>
      </div>
    </div>

</template>
  
<script setup>
  import TitleBlock from "@/components/TitleBlock"
  import {computed, onMounted, ref} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {useRouter, useRoute} from "vue-router";
  import {useConfirm} from "primevue/useconfirm";
  import {ScienceService} from "@/service/science.service";
  import PersonPage from "../contragent/v2/PersonPage.vue";
  import {UserService} from "@/service/user.service"

  const {t, locale} = useI18n()
  const toast = useToast()
  const router = useRouter()
  const route = useRoute()
  const confirm = useConfirm()
  const scientist = ref(null)
  const loading = ref(false)
  const scienceService = new ScienceService()
  const id = parseInt(route.params.id) 
  const user = ref({})

  const userService = new UserService
  const fileData = ref(null)
  const userView = ref(false)

  const getUserAccount= () => {
    const req = {
      userID: id
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

  const getScientists = () => {
      loading.value = true;
      const req = {
        userID: id
      }

      scienceService.getScientists(req).then(res => {
        if (res.data.scientists != null) {
          user.value = res.data.scientists[0]
        }
        loading.value = false
        userView.value = true
      }).catch(error => {
          toast.add({severity: 'error', summary: t('common.error'), life: 3000})
          loading.value = false;
          userView.value = true
      })
    }

  onMounted(() => {
    getScientists()
  })
</script>
  