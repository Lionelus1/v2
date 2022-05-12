<template>
    <div class="card">
      
      <Sidebar  v-model:visible="visible" :baseZIndex="10000" :showCloseIcon="!findRole(null, 'queue_terminal')" position="full">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em;" />
        <div class="p-w-100 p-text-center" style="min-height:100%;v-align:middle">
          <SelectButton v-model="selectedlanguage" :options="languages" optionLabel="name" @click="selected"  />
          <br>
          <div class="card primary-box p-ripple p-w-100" style="margin-top:auto" v-for="queue of queues" :key="queue.key">
            <Button  :label="queue['queueName' + $i18n.locale]" class="p-button-info p-button-lg" @click="registerQueue(queue.key)" style="width:90%;height:100px" />
          </div>
        </div>
      </Sidebar>
      <Sidebar v-model:visible="printVisisble">
        <div id="ticket">
          <h4>2253</h4>
        </div>
      
      </Sidebar>
    </div>
</template>

<script>
import { authHeader, getHeader, smartEnuApi, findRole } from "@/config/config";
import axios from "axios";

export default {
 
  data() {
    return {
      visible: false,
      printVisisble: true,
      lazyParams: {
        first: 0,
        rows: 100,
        parentID: null,
      },
      queues: [],
      loading: false,
      languages: [
				{name: 'Қазақ тілі', code: 'kz'},
				{name: 'Русский язык', code: 'ru'},
				{name: 'English', code: 'en'}
			],
      selectedlanguage: {name: 'Қазақ тілі', code: 'kz'},
      
    }
  },
  methods: {   
    findRole : findRole,
    selected() {
      this.$i18n.locale = this.selectedlanguage.code
    },
    getQueue(parentID) {
        this.loading = true  
        this.lazyParams.parentID = parentID
        axios
        .post(smartEnuApi + "/queue/allQueues", this.lazyParams, {
          headers: getHeader(),
        })
        .then((response) => {
          this.queues = response.data.queues;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.loadError") + ":\n" + error,
            life: 3000,
          });
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    registerQueue(queueID) {
      this.loading = true
      axios
      .post(smartEnuApi + "/queue/registerService", {id: queueID},  {
          headers: getHeader(),
        })
      .then(response => {
        console.log(response.data)
      })
      .catch((error) => {
        this.loading = false;
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.loadError") + ":\n" + error,
          life: 3000,
        });
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
    });
    }
  },
  created() {
      var parentID = parseInt(this.$route.params.id) ;
      this.getQueue(parentID)

  },    
 
};
</script>

<style scoped>
.font-style {    
    width:300px;
    height:300px;
    font-size:220px;
}

</style>