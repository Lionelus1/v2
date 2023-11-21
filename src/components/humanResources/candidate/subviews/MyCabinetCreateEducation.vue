<template>
    <div class="card def-border">

      <p><b>{{ $t('hr.edu.institution') }}: </b><em><InputText :value="props.value.institution_name"></InputText></em></p>
      <p><b>{{ $t('hr.edu.institutionAddress') }}: </b> <em><InputText :value="props.value.location"></InputText></em></p>
      <p><b>{{ $t('common.speciality') }}: </b><em><InputText :value="props.value.profession"></InputText></em></p>
      <p><b>{{ $t('common.diplomNumber') }}: </b> <em><InputText :value="props.value.certificate_number"></InputText></em></p>
      <p><b>{{ $t('hr.edu.receiptDate') }}: </b><em><InputText :value="formatDate(props.value.start_date)"></InputText></em></p>
      <p><b>{{ $t('hr.edu.expirationDate') }}: </b> <em><InputText :value="formatDate(props.value.final_date)"></InputText></em></p>

      <Button :label="$t('common.edit')" class="p-button-text" :onclick="update"/>
      <Button :label="$t('common.delete')" class="p-button-secondary p-button-text" :onclick="deleteValue"/>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps(['value'])
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
  
    const dateObject = new Date(dateString);
    
    return dateObject.toLocaleDateString();
  };
  
  // export default {
  //   name: "MyCabinetIdentificationDetail",
  //   props: {
  //     modelValue: null,
  
  //   },
  //   data() {
  //     return {
  //       value: this.modelValue,
  //     }
  //   }
    // methods: {
    //   deleteValue() {
    //     axios
    //         .post(smartEnuApi + "/candidate/id/delete", {id: this.value.id}, {headers: getHeader(),})
    //         .then(res => {
    //           this.emitter.emit("id", true);
    //         }).catch(error => {
    //       this.$toast.add({
    //         severity: "error",
    //         summary: error,
    //         life: 3000,
    //       });
    //     });
    //   },
    //   update() {
    //     this.emitter.emit("idUpdate", this.value);
    //   }
    // }
  // }
  </script>
  
  <style scoped>
  .def-border {
    border: 1px solid #dee2e6;
  
    border-radius: 0;
  }
  </style>
