<template>
  <Dialog :header="$t('workPlan.mastersThesisInfo')" v-model:visible="showModal" :style="{width: '600px'}"
          :close-on-escape="true" @hide="$emit('hide')">
    <div v-if="loading" class="flex justify-center">
      <ProgressSpinner style="width: 50px; height: 50px" class="progress-spinner" strokeWidth="5"/>
    </div>
    <div class="p-fluid" v-if="!loading">
      <div class="field" v-for="(current, index) in fields.info" :key="index">
        <label>{{ $t(`${current?.label}`) }}</label>
        <InputText v-if="current?.field === 'InputText' " v-model="current.value"/>
        <Textarea v-if="current?.field === 'Textarea' " rows="3" style="resize: vertical" v-model="current.value"/>
        <FindUser v-if="current?.field === 'FindUser'" :max="1" :user-type="2" :editMode="false" v-model="current.value"
                  :disabled="readonly"/>
        <Dropdown v-if="current?.field === 'Dropdown'" :options="current?.items" optionLabel="name" optionValue="id"
                  :placeholder="$t('common.select')" v-model="current.value" disabled/>
        <small class="p-error" v-if="current.error !== null">{{ $t(current.error) }}</small>
      </div>
    </div>
    <template #footer>
      <div v-if="!loading">
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="$emit('hide')"/>
        <Button :label="$t('common.add')" icon="pi pi-check" class="ml-2 p-button-rounded p-button-success mr-2"
                @click="add"/>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import {ref, reactive, onMounted} from "vue"
import {DocService} from "@/service/doc.service";
import {useToast} from "primevue/usetoast";
import Enum from "@/enum/workplan/index";

const props = defineProps(['plan', 'visible'])
const docService = new DocService()
const showModal = ref(props.visible);
const toast = useToast()
const emit = defineEmits(['hide'])
const fields = reactive({info: null, id: null});
const loading = ref(true);
const data = ref(null);

onMounted(() => {
  docService.getAdditionalInfo(props.plan?.work_plan_id).then(res => {
    if (res.data?.description !== null) {
      fields.info = JSON.parse(res.data?.description)
      fields.id = res.data?.id
    } else {
      data.value = [
        {
          name: "title",
          label: "web.exampleTitle",
          field: "InputText",
          value: null,
          error: null
        },
        {
          name: "sci_advisor",
          label: "contracts.labels.sciadvisor",
          field: "FindUser",
          value: null,
          error: null
        },
        {
          name: "dis_language",
          label: "workPlan.dissertationLanguage",
          field: "Dropdown",
          value: null,
          items: [
            {
              id: 1,
              name: 'Қазақ'
            },
            {
              id: 2,
              name: 'Русский'
            },
            {
              id: 3,
              name: 'English'
            }
          ],
          error: null
        },
        {
          name: "relevance",
          label: "workPlan.relevance",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "goal",
          label: "workPlan.goal",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "main_goals",
          label: "workPlan.mainGoals",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "theoretical_significance",
          label: "workPlan.theoreticalSignificance",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "scientific_novelty",
          label: "workPlan.scientificNovelty",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "practical_significance",
          label: "workPlan.practicalSignificance",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "research_metodology",
          label: "workPlan.researchMetodology",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "expecting_results",
          label: "workPlan.expectingResults",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "publications",
          label: "workPlan.publications",
          field: "Textarea",
          value: null,
          error: null
        },
        {
          name: "planned_testing",
          label: "workPlan.plannedTesting",
          field: "Textarea",
          value: null,
          error: null
        }
      ]
    
      data.value[2].value = props.plan?.lang

      if(props.plan?.plan_type?.code === Enum.WorkPlanTypes.Doctors){
        data.value.splice(3, 0,  {
          name: "foreign_consultant",
          label: "dissertation.foreignConsultantInfo",
          field: "FindUser",
          value: null,
          error: null
        });
      }

      props.plan?.doc_info?.params.forEach(element => {
        if (element.name === "sci_advisor") {
          data.value[1].value = element.value
        }
        if (element.name === "foreign_consultant") {
          data.value[3].value = element.value
        }
      });

      fields.info = data
    }
    loading.value = false
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
})

const add = () => {
  // let validated = true
  // fields.info.forEach(current => {
  //   if (current.value === null) {
  //     current.error = "common.requiredField"
  //     validated = false
  //   }else{
  //     current.error = null
  //   }
  // })
  // if (!validated) {
  //     return
  // }
  loading.value = true
  docService.addAdditionalInfo({value: fields.info, docId: props.plan?.work_plan_id, id: fields.id}).then(res => {
    loading.value = false
    emit('hide')
  }).catch(error => {
    loading.value = false
    toast.add({severity: "error", summary: error, life: 3000});
  })
}
</script>

