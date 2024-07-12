<template v-if="params != null">
  <div class="field" v-for="(param, index) of params" :key="index">
    <label v-if="(index !== 0 && params[index - 1].description !== param.description )|| index === 0">{{
        $t(param?.description)
      }}</label>
    <FindUser v-if="param?.component === 'finduser'" v-model="param.value" :max="1" :user-type="2" :editMode="false"/>
    <PrimeCalendar v-if="param?.component === 'calendar'" v-model="param.value" dateFormat="dd.mm.yy" showIcon
                   :showButtonBar="true"></PrimeCalendar>
    <div class="field" v-if="param?.component === 'file'">
      <CustomFileUpload @upload="uploadFile($event, param?.name)" v-model="param.value" :multiple="false"
                        :button="true"/>
    </div>

    <!-- Рабочий план график   -->

    <div v-if="param?.description === 'educationalPrograms.name'">
      <Dropdown
          v-model="param.value"
          :options="eduProgByManagerId"
          :optionLabel="'name_' + $i18n.locale"
          :placeholder="$t('common.select')"
      />
    </div>
    <div v-else-if="param?.description === 'doctemplate.editor.practiceType'">
      <Dropdown
          v-model="param.value"
          :options="practiceType"
          :optionLabel="'name_' + $i18n.locale"
          :placeholder="$t('common.select')"
      />
    </div>
    <div v-else>
      <InputText
          v-if="!param.component"
          v-model="param.value"
          :placeholder="param?.placeholder ? $t(param?.placeholder) : ''"
      />
    </div>
  </div>
</template>

<script setup>
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import {WorkPlanService} from "@/service/work.plan.service";
import {onMounted, ref} from "vue";

const planService = new WorkPlanService()
const props = defineProps(['params'])
const practiceType = ref([])
const eduProgByManagerId = ref([])

const getPracticeTypes = () => {
  planService.getPracticeTypes().then(res => {
    practiceType.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const getEduProgByManagerId = () => {
  planService.getEduProgByManagerId().then(res => {
    eduProgByManagerId.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const uploadFile = (event, name) => {
  props.params.forEach((param) => {
    if (param.name === name) {
      param.value = event.files
    }
  })
}

onMounted(() => {
  getPracticeTypes();
  getEduProgByManagerId();
})
</script>