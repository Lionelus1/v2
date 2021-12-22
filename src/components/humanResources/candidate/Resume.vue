<template>
  <div class="card">
    <div class="p-field">
      <Fieldset legend="Образование" :toggleable="true">
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить" :onclick="add"></Button>
      </Fieldset>
    </div>
    <div class="p-grid p-formgrid">
      <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
        <Fieldset legend="Ученая степень" :toggleable="true">
          <Button icon="pi pi-plus" class="p-button-link" label="Добавить"></Button>
        </Fieldset>
      </div>
      <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
        <Fieldset legend="Ученое звание" :toggleable="true">
          <Button icon="pi pi-plus" class="p-button-link" label="Добавить"></Button>
        </Fieldset>
      </div>
    </div>
    <div class="p-field">
      <Fieldset legend="Знания языков" :toggleable="true">
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить"></Button>
      </Fieldset>
    </div>
    <div class="p-field">
      <Fieldset legend="Опыт работы" :toggleable="true" collapsed>
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить"></Button>
      </Fieldset>
    </div>
    <div class="p-field">
      <Fieldset legend="Курсы повышения квалификации, семинары и стажировки" :toggleable="true">
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить"></Button>
      </Fieldset>
    </div>
    <div class="p-field">
      <Fieldset legend="Список людей, которые могут вас порекомендовать" :toggleable="true">
        <Button icon="pi pi-plus" class="p-button-link" label="Добавить"></Button>
      </Fieldset>
    </div>
    <Sidebar
        v-model:visible="isView"
        position="top"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <EducationEdit
          :model-value=education
      ></EducationEdit>
    </Sidebar>
  </div>
</template>

<script>
import EducationEdit from "./subedits/EducationEdit";

export default {
  name: "Resume",
  components: {EducationEdit},
  data() {
    return {
      educations: [],
      education: null,
      isView: false,
    }
  },
  methods: {
    add() {
      this.education = {}
      this.isView = true
    },
  }
}
</script>

<style scoped>

</style>