<template>
    <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
    <div id="carddiv" class="grid">
        <div class="card">
            <div class="grid formgrid">
                <DataTable :value="editionsRequest" :paginator="true" @page="editionTableOnPageEditionRequest($event)" 
                :rows="10" :totalRecords="totalRequest" :lazy="true">
                    <Column :field="'name_'+($i18n.locale)" :header="$t('science.edition')"></Column>
                    
                    <Column field="create_date" :header="$t('common.date')"></Column>
                    
                    <Column :field="'status.name_'+($i18n.locale)" :header="$t('contracts.columns.status')">
                    </Column>

                </DataTable>
            </div>
        </div>
    </div>

    
</template>

<script>
  import {ScienceService} from "@/service/science.service"

  export default {
    components: {},
    data() {
      return {
        lazyParamsEditionRequest: {
          page: 0,
          rows: 10,
        },
        totalRequest: null,
        scienceService: new ScienceService(),
        editionsRequest: [],
        loginedUserId: JSON.parse(localStorage.getItem("loginedUser")) ? JSON.parse(localStorage.getItem("loginedUser")).userID : null,
    };
    },
    mounted() {
        this.getScienceEditionsRequest()
    },
    methods: {
        getScienceEditionsRequest() {
            const req = {
                userId: this.loginedUserId,
                page: this.lazyParamsEditionRequest.page,
                rows: this.lazyParamsEditionRequest.rows,
            }
            this.loading = true
            this.scienceService.getScienceEditionsRequest(req).then(res => {
                this.editionsRequest = res.data.editions
                this.totalRequest = res.data.total
                this.loading = false
            }).catch(err => {
                this.loading = false
                if (err.response && err.response.status == 401) {
                this.$store.dispatch("logLout");
                } else if (err.response && err.response.data && err.response.data.localized) {
                    this.showMessage('error', this.$t(err.response.data.localizedPath), null);
                } else {
                    this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
                }
            })
        },

        editionTableOnPageEditionRequest(event) {
            this.lazyParamsEditionRequest = event;
            this.getScienceEditionsRequest();
        }
    }
  };

</script>
