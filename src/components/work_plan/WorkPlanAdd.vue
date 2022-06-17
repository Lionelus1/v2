<template>
  <Button :label="$t('workPlan.addPlan')" icon="pi pi-plus" @click="openBasic" class="p-ml-2"/>

  <Dialog :header="$t('workPlan.addPlan')" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="p-field">
      <label>{{ $t('workPlan.planName') }}</label>
      <InputText v-model="work_plan_name" @input="input" v-on:keyup.enter="createPlan"/>
    </div>
    <div class="p-field">
      <label>{{ $t('common.lang') }}</label>
      <Dropdown v-model="lang" :options="languages" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
      <small class="p-error" v-if="submitted && !lang">{{ $t('workPlan.errors.langError') }}</small>
    </div>
    <div class="field-checkbox p-mt-4">
      <Checkbox v-model="isOper" id="oper" :binary="true" />
      <label class="p-ml-2" for="oper">Операционный план</label>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              :disabled="isDisabled && lang" @click="createPlan"/>
    </template>
  </Dialog>

</template>

<script>
import axios from "axios";
import {getHeader, signerApi, smartEnuApi} from "@/config/config";

export default {
  name: 'WorkPlanAdd',
  data() {
    return {
      showModal: false,
      position: 'center',
      work_plan_name: null,
      documentID: null,
      isDocCreated: false,
      isDisabled: true,
      lang: null,
      languages: [
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
      submitted: false,
      isOper: false
    }
  },
  props: ['isAdded', 'isSub'],
  methods: {
    openBasic() {
      this.showModal = true;
    },
    closeBasic() {
      this.showModal = false;
    },
    createPlan() {
      this.submitted = true;
      if (!this.validate())
        return
      axios.post(smartEnuApi + `/workPlan/addPlan`, {work_plan_name: this.work_plan_name, lang: this.lang, is_oper: this.isOper}, {
        headers: getHeader(),
      }).then(res => {
        if (res.data.is_success) {
          this.emitter.emit("workPlanIsAdded", true);
          this.$toast.add({severity: 'info', summary: this.$t('common.success'), detail: this.$t('workPlan.message.planCreated'), life: 3000});
        } else {
          this.$toast.add({
            severity: "error",
            summary: "Create plan error",
            life: 3000,
          });
        }
        this.showModal = false;
        this.submitted = false;
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
        this.submitted = false;
      });
    },
    input(event) {
      this.isDisabled = event.target.value.length <= 0;
    },
    validate() {
      return this.work_plan_name && this.lang;
    }
  }
}
</script>
