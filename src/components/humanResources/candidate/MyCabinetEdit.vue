<template>
    <div class="card">
      <div class="field">
      </div>
      <div v-if="props.section===chapter.id">
          <MyCabinetIdentificationDetail v-if="props.modelValue && props.modelValue.IIN !== undefined" :modelValue="props.modelValue"/>
      </div>
      <div v-if="props.section===chapter.education">
          <MyCabinetCreateEducation :modelValue="props.modelValue" />
      </div>
      <div v-if="props.section===chapter.createEducation">
          <MyCabinetCreateEducation :modelValue="props.modelValue"/>
      </div>
      <div v-if="props.section===chapter.requisite">
          <MyCabinetRequisite :modelValue="props.modelValue"/>
      </div>
    </div>
</template>

<script setup>
  import MyCabinetIdentificationDetail from "./subviews/MyCabinetIdentificationDetail";
  import MyCabinetCreateEducation from "./subviews/MyCabinetCreateEducation";
  import MyCabinetRequisite from "./subviews/MyCabinetRequisite";


  const props = defineProps(['modelValue', 'section', 'titleValue']);

  const chapter = {
      education: 'education',
      id: 'id',
      createEducation: 'createEducation',
      requisite: 'requisite'
    }

  const check = (msg) => {
    console.log(msg, 'test')
  }

</script>
