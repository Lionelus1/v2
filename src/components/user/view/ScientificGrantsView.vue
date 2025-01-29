<template>
  <Menubar :model="menu" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>

  <DataTable selectionMode="single" v-model="grant" :lazy="true" :value="grants" :loading="loading" v-model:selection="grant"
             :paginator="true" :rows="10" :totalRecords="total" @page="onPageChange">

    <Column field="start_date" :header="t('common.startDate')">
      <template #body="slotProps">
        {{ formatDate(slotProps.data.start_date) }}
      </template>
    </Column>

    <Column field="final_date" :header="t('common.endDate')">
      <template #body="slotProps">
        {{ formatDate(slotProps.data.finish_date) }}
      </template>
    </Column>

    <Column field="contract_sum" :header="t('science.contract_sum_'+locale)"></Column>

    <Column :header="t('science.project_position')">
      <template #body="slotProps">
        <p>{{ t(slotProps.data.position['name_'+locale]) }}</p>
      </template>
    </Column>

    <Column :header="t('web.exampleTitle')">
      <template #body="slotProps">
        <p>{{ t(slotProps.data['name_'+locale]) }}</p>
      </template>
    </Column>

    <Column :header="t('science.customerAndSource')">
      <template #body="slotProps">
        <p>{{ t(slotProps.data['customer_and_sourse_'+locale]) }}</p>
      </template>
    </Column>

    <Column v-if="!readonly" :header="t('dissertation.dissReportActions')">
      <template #body="slotProps">
        <Button icon="fa-solid fa-pencil fa-xl" class="p-button-text p-button-warning p-1 mr-2" @click="grant=slotProps.data;updateGrant()"></Button>
        <Button icon="fa-solid fa-trash-can fa-xl" class="p-button-text p-button-danger p-1 mr-2" @click="grant=slotProps.data;deleteGrant()"></Button>
      </template>
    </Column>
  </DataTable>

  <Sidebar v-model:visible="isView.scientificGrants"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <ScientificGrantsEdit :modelValue=grant :userID="userID" :readonly="readonly" typeCustom="scientists"/>
  </Sidebar>

</template>

<script setup>

  import ToolbarMenu from "@/components/ToolbarMenu.vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import { inject, ref, onMounted } from "vue";
  import {findRole} from "@/config/config";
  import ExperienceEdit from "@/components/humanResources/candidate/subedits/ExperienceEdit.vue";
  import ScientificGrantsEdit from "@/components/user/edit/ScientificGrantsEdit.vue";
  import {ScienceService} from "@/service/science.service"
  import moment from "moment/moment";
  import {useConfirm} from "primevue/useconfirm";

  const {t, locale} = useI18n()
  const toast = useToast()
  const scientificGrants = ref([])
  const scientificGrant = ref(null)
  const total = ref(0)
  const emitter = inject("emitter");
  const loading = ref(false)
  const scienceService = new ScienceService

  const lazyParams = ref(
      {
        page: 0,
        rows: 10,
      }
  )
  const isView = ref({
    check: false,
    scientificGrants: false,
  })
  const menu= ref([
    {
      label: t('common.add'),
      icon: "pi pi-plus",
      command: () => {
        createScientificGrants()
      },
    },
  ])

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
  const grants = ref([])
  const grant = ref(null)
  const confirm = useConfirm()

  const createScientificGrants = () => {
    grant.value = {}
    grant.value.user_id = props.userID
    isView.value.scientificGrants = true
  }

  const getScientificGrants = () => {

    loading.value = true
    const req = {
      user_id: props.userID,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
    }

    scienceService.getScientificGrants(req).then(response=>{

      grants.value = response.data.scientific_grants
      total.value = response.data.total

      loading.value = false
    }).catch(_ => {
      loading.value = false
    })
  }

  const onPageChange = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.rows = event.rows;
    getScientificGrants();
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    const dateObject = new Date(dateString);
    return moment(new Date(dateObject)).utc().format("DD.MM.YYYY")
  }

  const updateGrant = () => {
    if (grant.value != null) {
      isView.value.scientificGrants = true
    }
  }

  const deleteGrant = () => {
    confirm.require({
      message: t('common.doYouWantDelete'),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button p-button-success',
      rejectClass: 'p-button p-button-danger',
      accept: () => {
        const data = {
          id: Number(grant.value.id),
        }

        scienceService.deleteScientificGrant(data).then(res  => {
          toast.add({severity: "success", summary: t('common.success'), life: 3000});
          getScientificGrants()
        }).catch(_ => {
        })
      },
    });
  }


  onMounted(() => {
    getScientificGrants()

    emitter.on('scienceSchool', (data) => {
      if (data === true) {
        isView.value.scientificGrants = false
        getScientificGrants()
      }
    });
  })
</script>
