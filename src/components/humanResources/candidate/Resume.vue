<template>
  <!-- РЕЗЮМЕ ҚҰРУ -->
  <Toolbar class="p-mb-4" style="height:42px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
    <template #start>
      <Button v-if="toolbar.start" style="margin-top:-10px" :label="$t('hr.resume.create')" icon="pi pi-plus" :onclick="createCandidate"/>
    </template>
    <template #end>
      <Button v-if="toolbar.end"
              icon="pi pi-times"
              class="p-button-danger"
              style="margin-top:-10px"
              :label="$t('hr.resume.delete')"
              :onclick="deleteCandidate"/>
    </template>
  </Toolbar>
  <!-- РЕЗЮМЕ  -->
  <div class="card" v-if="candidate !== null && candidate !== {}">
    <div class="card">
      <div class="p-grid p-formgrid">
        <div class="p-col-12 p-lg-9 card-border">
          <ResumeView  v-if="view" :value="candidate" :readonly="false"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import ResumeService from "./ResumeService";
import ResumeView from "./ResumeView";

export default {
  name: "Resume",
  components: {
    ResumeView,
  },
  data() {
    return {
      candidate: {},
      view: false,
      toolbar: {
        start: false,
        end: false
      }
    }
  },
  created() {
    this.resumeService = new ResumeService()
  },
  methods: {
    createCandidate() {
      this.resumeService.createCandidate().then(response => {
        this.candidate = {}
        this.candidate = response.data
        this.toolbar.start = false
        this.toolbar.end = true
        this.view = true
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    deleteCandidate() {
      this.resumeService.deleteCandidate(this.candidate.id).then(response => {
        this.candidate = null
        this.toolbar.start = true
        this.toolbar.end = false
      }).catch(error => {
        if (error.response.status === 404) {
          this.candidate = null
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
  },
  mounted() {
    this.resumeService.getCandidate().then(response => {
      this.candidate = response.data
      this.view = true
      this.toolbar.start = false
      this.toolbar.end = true
    }).catch(error => {
      if (error.response.status === 404) {
        this.candidate = null
        this.toolbar.start = true
        this.toolbar.end = false
      }
      if (error.response.status === 401) {
        this.$store.dispatch("logLout");
      }
      this.$toast.add({
        severity: "error",
        summary: error,
        life: 3000,
      });
    })
  },
}
</script>

<style>
.card-border {
  border-right: 2px solid #dee2e6;
  border-radius: 0;
}
</style>