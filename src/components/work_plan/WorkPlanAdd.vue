<template>
  <Dialog :header="$t('workPlan.addPlan')" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid" @hide="closeBasic">
    <div class="field">
      <label>{{ $t('workPlan.planName') }}</label>
      <InputText v-model="work_plan_name" v-on:keyup.enter="createPlan"/>
    </div>
    <div class="field">
      <label>{{ $t('common.lang') }}</label>
      <Dropdown v-model="lang" :options="languages" optionLabel="name" optionValue="id" :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && !lang">{{ $t('workPlan.errors.langError') }}</small>
    </div>
    <div class="field">
      <label>{{ $t('workPlan.planType') }}</label>
      <Dropdown v-model="selectedType" :options="types" :optionLabel="'name_' + $i18n.locale" optionValue="id" :placeholder="$t('common.select')"/>
      <small class="p-error" v-if="submitted && !selectedType">{{ $t('common.requiredField') }}</small>
    </div>
    <template v-if="selectedType === 3">
      <div class="field" v-for="(param, index) of params" :key="index">
        <template v-if="param.type === 'text'">
          <label>{{ $t('workPlan.' + param.name) }}</label>
          <InputText v-model="param.value" />
        </template>
        <template v-if="param.type === 'date'">
          <label>{{ $t('workPlan.' + param.name) }}</label>
          <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
        </template>
        <small class="p-error" v-if="submitted && !param.value">{{ $t('common.requiredField') }}</small>
      </div>
      <div class="field">
        <label>{{ $t('contracts.contract') }}</label>
        <CustomFileUpload @upload="uploadFile($event, 'contractFiles')" v-model="contractFiles" :multiple="false" :button="true" />
        <small class="p-error" v-if="submitted && !contractFiles">{{ $t('common.requiredField') }}</small>
      </div>
      <div class="field">
        <label>{{ $t('common.doc') }}</label>
        <CustomFileUpload @upload="uploadFile($event, 'documentFiles')" v-model="documentFiles" :multiple="false" :button="true" />
        <small class="p-error" v-if="submitted && !documentFiles">{{ $t('common.requiredField') }}</small>
      </div>
    </template>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeBasic"/>
      <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              :disabled="!isDisabled" @click="createPlan"/>
    </template>
  </Dialog>

</template>

<script>
import {WorkPlanService} from "@/service/work.plan.service";
import CustomFileUpload from "@/components/CustomFileUpload.vue";

export default {
  name: 'WorkPlanAdd',
  components: {CustomFileUpload},
  props: ['visible', 'isAdded', 'isSub'],
  emits: ['hide'],
  data() {
    return {
      showModal: this.visible,
      position: 'center',
      work_plan_name: null,
      documentID: null,
      isDocCreated: false,
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
      isOper: false,
      planService: new WorkPlanService(),
      types: [],
      selectedType: null,
      contractFiles: null,
      documentFiles: null,
      params: [
        {
          name: "plancontractname",
          value: null,
          description: "Contract name",
          type: "text"
        },
        {
          name: "plancontractnumber",
          value: null,
          description: "Contract number",
          type: "text"
        },
        {
          name: "plancontractdate",
          value: null,
          description: "Contract date",
          type: "date"
        },
        {
          name: "plancontractprioruty",
          value: null,
          description: "Contract priority",
          type: "text"
        },
        {
          name: "plancontracttopic",
          value: null,
          description: "Contract topic",
          type: "text"
        },
      ],
    }
  },
  mounted() {
    this.getWorkPlanTypes();
  },
  computed: {
    isDisabled() {
      return this.validate()
    }
  },
  methods: {
    closeBasic() {
      this.$emit('hide')
    },
    createPlan() {
      this.submitted = true;
      if (!this.validate())
        return

      const fd = new FormData()
      let data = {
        work_plan_name: this.work_plan_name,
        lang: this.lang,
        plan_type: this.selectedType,
        science_params: this.selectedType === 3 ? this.params : null
      }
      fd.append("workplan", JSON.stringify(data))
      if (this.contractFiles) {
        for (let file of this.contractFiles) {
          fd.append("contract_files[]", file)
        }
      }

      if (this.documentFiles) {
        for (let file of this.contractFiles) {
          fd.append("document_files[]", file)
        }
      }
      this.planService.createPlan(fd).then(res => {
        if (res.data.is_success) {
          this.$toast.add({severity: 'success', summary: this.$t('common.success'), detail: this.$t('workPlan.message.planCreated'), life: 3000});
        } else {
          this.$toast.add({
            severity: "error",
            summary: "Create plan error",
            life: 3000,
          });
        }
        this.showModal = false;
        this.submitted = false;
        this.closeBasic()
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
    uploadFile(event, name) {
      this[name] = event.files
    },
    validate() {
      let paramValidation = false
      let filesValidation = false
      if (this.selectedType === 3) {
        this.params.forEach(param=> {
          if (param.value === null || param.value === '') {
            paramValidation = true
          }
        })

        filesValidation = !((this.contractFiles && this.contractFiles.length !== 0) && (this.documentFiles && this.documentFiles.length !== 0))
      }
      return this.work_plan_name && this.lang && this.selectedType && !paramValidation && !filesValidation;
    },
    getWorkPlanTypes() {
      this.types = []
      this.planService.getWorkPlanTypes().then(res => {
        this.types = res.data
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      })
    },
  }
}
</script>
