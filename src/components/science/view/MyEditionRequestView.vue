<template>
    <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
    <h3>{{ this.$t('science.myRequests') }}</h3>
    <div class="card">
        <DataTable :value="editionsRequest" :paginator="true" @page="editionTableOnPageEditionRequest($event)" 
        :rows="10" :totalRecords="totalRequest" :lazy="true">
            <Column :field="'name_'+($i18n.locale)" :header="$t('science.edition')"></Column>
            
            <Column field="create_date" :header="$t('common.date')"></Column>
            
            <Column :field="'status.name_'+($i18n.locale)" :header="$t('contracts.columns.status')">
            </Column>

        </DataTable>
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
            }).catch(_ => {
                this.loading = false
            })
        },

        editionTableOnPageEditionRequest(event) {
            this.lazyParamsEditionRequest = event;
            this.getScienceEditionsRequest();
        }
    }
  };

</script>
