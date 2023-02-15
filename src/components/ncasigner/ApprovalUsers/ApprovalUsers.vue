<template>
  <div class="field">
    <label>{{ $t('common.select') }}</label>
    <StepComponent v-model="approval_users" :stages="stages" @clearStages="clearStages"></StepComponent>
    <Toolbar style="border:none;background:none">
      <template #end>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger mr-2" @click="close" />
        <Button :disabled="disabled" :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded" @click="sendToApprove" />
      </template>
    </Toolbar>
  </div>
</template>

<script>
import StepComponent from "./StepComponent.vue";

export default {
  name: "ApprovalUsers",
  components: {StepComponent},
  props: {
    modelValue: null,
    approving: null,
    stages: null,
  },
  emits: ['closed', 'approve'],
  data() {
    return {
      approval_users: this.modelValue,
      disabled: this.approving ?? false,
      stageList: this.stages
    }
  },
  setup(props, context) {
    function updateValue(e) {
      if (e.value) {
        context.emit("update:modelValue", e.value);
      }
    }

    return {
      updateValue,
    };
  },
  methods: {
    
    close() {
      this.$emit('closed', null);
    },
    sendToApprove(){
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
        if (apu.users === null || apu.users.length<1 || apu.sertificate === null) {
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