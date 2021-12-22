<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>Создание и редактирование вакансии</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Учебное заведение</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                type="text"
                placeholder="Учебное заведение"
                v-model="value.institution"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Факультет</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                type="text"
                placeholder="Факультет"
                v-model="value.faculty"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Специальность</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                type="text"
                placeholder="Специальность"
                v-model="value.speciality"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Номер диплома</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                type="text"
                placeholder="Номер диплома"
                v-model="value.faculty"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Год поступления</label>
            <PrimeCalendar
                :readonly="readonly"
                view="year"
                class="p-mt-2"
                v-model="value.receiptDate"
                placeholder="Год поступления"
                dateFormat="yy"/>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>Год окончания</label>
            <PrimeCalendar
                :readonly="readonly"
                view="year"
                class="p-mt-2"
                v-model="value.expirationDate"
                placeholder="Год окончания"
                dateFormat="yy"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  data() {
    return {
      value: this.modelValue,
      head: null,
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            this.vacancyAction()
          },
        },
      ],
    };
  },
  methods: {
    vacancyAction() {
      let path = this.value.id === undefined ? "/vacancy/add" : "/vacancy/update"
      this.value.departmentHead = this.head[0]
      axios
          .post(smartEnuApi + path, this.value, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("vacancyAdded", true);
            this.$toast.add({
              severity: 'info',
              summary: 'Success',
              detail: 'Вакансия успешно создана/обнавлена',
              life: 3000
            });
          }).catch(error => {
        console.log(error)
      });
    }
  },
  props: {
    modelValue: null,
    placeholder: String,
    readonly: Boolean,
  },
  created() {
    this.head = this.modelValue.departmentHead === undefined ? null : [this.modelValue.departmentHead]
  }
};
</script>
<style>
#carddiv label {
  position: inherit;
}
</style>
