<template>
  <div>
    <div class="p-col-12">
      <div class="card" v-if="isApproval && !isApproved">
        <Button v-if="isApproval && !isRejected" label="Согласовать" icon="pi pi-check" @click="openApprovePlan"
                class="p-button p-button-success p-ml-2"/>
        <Button v-if="isApproval && !isRejected" label="Отменить" icon="pi pi-check" @click="openRejectPlan"
                class="p-button p-button-danger p-ml-2"/>
      </div>
      <div class="card">
        <object src="#toolbar=0" style="width: 100%; height: 1000px" v-if="source" type="application/pdf"
                :data="source"></object>
      </div>
    </div>

    <Dialog header="Отправить на корректировку" v-model:visible="showRejectPlan" :style="{width: '450px'}"
            class="p-fluid">
      <div class="p-field">
        <label>Комментарий</label>
        <Textarea inputId="textarea" rows="3" cols="30" v-model="rejectComment"></Textarea>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
                @click="rejectPlan"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "WorkPlanReportView",
  props: ['id'],
  data() {
    return {
      source: null,
      document: null,
      work_plan_id: 0,
      isApproval: false,
      isRejected: false,
      loginedUserId: 0,
      plan: null,
      rejectComment: "",
      showRejectPlan: false,
      CMSSignature: null,
      documentByteArray: null,
      isApproved: false,
      reportType: this.type,
      quarter: null
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.quarter = this.$route.params.quarter;
    console.log(this.work_plan_id)
    console.log("quarter:", this.quarter ? this.quarter : "year")
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.plan = JSON.parse(localStorage.getItem("workPlan"));
  },
  methods: {
  }
}
</script>

<style scoped>

</style>