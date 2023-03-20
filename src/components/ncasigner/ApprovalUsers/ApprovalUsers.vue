<template>
  <div class="field">
    <label>{{ $t('common.select') }}</label>
    <StepComponent v-if="approval_users" v-model="approval_users" :stages="stageList" :mode="mode" :readonly="readMode"
      @clearStages="clearStages" @update:modelValue="updateModel($event)"></StepComponent>
    <Toolbar style="border:none;background:none">
      <template #end>
        <Button v-if="!readMode && (mode == 'standard' || mode == 'doc_template')" :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger mr-2" @click="close" />
        <Button v-if="!readMode && mode == 'standard'" :disabled="disabled" :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded" @click="sendToApprove"/>
        <Button v-if="!readMode && mode == 'doc_template'" :disabled="disabled" :label="$t('common.save')" icon="pi pi-check" class="p-button-rounded" @click="save"/>
      </template>
    </Toolbar>
  </div>
</template>

<script>
import axios from "axios";
import StepComponent from "./StepComponent.vue";
import {smartEnuApi, getHeader} from "@/config/config";

export default {
  name: "ApprovalUsers",
  components: { StepComponent },
  props: {
    modelValue: null,
    approving: null,
    stages: null,
    mode: null, // 'standard', 'doc_template', 'doc_template_creating'
    readonly: null,
  },
  emits: ['closed', 'approve', 'save'],
  data() {
    return {
      approval_users: this.modelValue,
      disabled: this.approving ?? false,
      stageList: this.stages,
      readMode: this.readonly ? this.readonly : false,
    }
  },
  setup(props, context) {
    function updateValue(e) {
      if (e) {
        context.emit("update:modelValue", e);
      }
    }

    return {
      updateValue,
    };
  },
  mounted() {
    if (this.approval_users === null) {
      this.close()
    }
  },
  methods: {
    updateModel(event) {
      this.updateValue(event);
      // this.$emit('update:modelValue', event);
    },
    close() {
      this.$emit('closed', null);
    },
    sendToApprove() {
      let filled = true;
      if (this.approval_users && this.approval_users.length<1) {
				this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.selectUsers'), life: 3000});
        return
      }
      if (this.stageList != null && this.approval_users != null && this.stageList.length !== this.approval_users.length) {
        this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.selectUsers'), life: 3000});
        return;
      }
      this.approval_users.forEach(apu=>{
        if (apu.users === null || apu.users.length<1 || apu.certificate === null) {
          filled = false;
          return;
        }
      })
      if (!filled) {
        this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.fillError'), life: 3000});
        return;
      }
      this.$emit('approve', this.approval_users);
      this.approval_users = null;
    },
    save() {
      if (!this.approval_users || this.approval_users.length < 1) {
        this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.selectUsers'), life: 3000});
        return
      }

      let filled = true;
      this.approval_users.forEach(au => {
        if (au.users === null || au.users.length < 1 || au.certificate === null) {
          filled = false;
          return;
        }
      })

      if (!filled) {
        this.$toast.add({severity:'warn', summary: this.$t('common.attention'), detail:this.$t('common.message.fillError'), life: 3000});
        return;
      }

      this.$emit('save', this.approval_users);
    },
    clearStages(state) {
      if (state) {
        this.stageList = null;
      }
    }
  }
}
</script>

<style scoped>

</style>