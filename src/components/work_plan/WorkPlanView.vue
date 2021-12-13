<template>
  <div>
    <div class="p-col-12">
      <div class="card">
        <Button v-if="isApproval && !isRejected" label="Согласовать" icon="pi pi-check" @click="openApprovePlan"
                class="p-button p-button-success p-ml-2"/>
        <Button v-if="isApproval && !isRejected" label="Отменить" icon="pi pi-check" @click="openRejectPlan"
                class="p-button p-button-danger p-ml-2"/>
      </div>
      <div class="card">
        <object src="#toolbar=0" style="width: 100%; height: 700px" v-if="source" type="application/pdf" :data="source"></object>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanView",
  data() {
    return {
      source: null,
      work_plan_id: 0,
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.getFile();
  },
  methods: {
    getFile() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanFile`,
          {work_plan_id: parseInt(this.work_plan_id)},
          {headers: getHeader()}).then(res => {
        this.source = `data:application/pdf;base64,${res.data}`;
        console.log(this.source)
      }).catch(error => {

      });
    }
  }
}
</script>

<style scoped>

</style>