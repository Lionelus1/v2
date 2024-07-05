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
    <InputText v-if="!param.component" v-model="param.value"
               :placeholder="param?.placeholder ? $t(param?.placeholder) : ''"/>
  </div>
</template>

<script setup>
import CustomFileUpload from "@/components/CustomFileUpload.vue";

const props = defineProps(['params'])

const uploadFile = (event, name) => {
  props.params.forEach((param) => {
    if (param.name === name) {
      param.value = event.files
    }
  })
}
</script>