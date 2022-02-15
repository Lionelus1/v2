<template>
  <!-- РЕЗЮМЕ ҚҰРУ -->
  <div>
    <Toolbar class="p-mb-4">
      <template #start>
        <Button v-if="toolbar.start" :label="$t('hr.resume.create')" icon="pi pi-plus" :onclick="createCandidate"/>
      </template>
      <template #end>
        <Button v-if="toolbar.end"
                icon="pi pi-times"
                class="p-button-danger"
                :label="$t('hr.resume.delete')"
                :onclick="deleteCandidate"/>
      </template>
    </Toolbar>
  </div>
  <!-- РЕЗЮМЕ  -->
  <div class="card" v-if="candidate !== null && candidate !== {}">
    <div class="card">
      <div class="p-grid p-formgrid">
        <div class="p-col-12 p-lg-9">
          <ResumeView v-if="view" :value="candidate" :readonly="false"/>
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
        console.log(error)
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
        console.log(error)
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
      console.log(error)
    })
  },
}
</script>

<style scoped>

</style>