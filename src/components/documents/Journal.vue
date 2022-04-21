<template>
  <div>
    <div class="content-section">
      <div class="feature-intro p-ml-3">
        <h4>{{ $t("contracts.journal") }}</h4>
      </div>
      <div class="content-section implementation">
        <div class="card">
          <div >
            <Menubar
              :model="menu"
              :key="active"
              style="
                height: 36px;
                margin-top: 0px;
                margin-right: -13px;
                margin-left: -13px;
              "
            />
            <!-- {{contracts}} -->
            <DataTable
              selectionMode="single"
              v-model:selection="selectedContract"
              :lazy="true"
              :totalRecords="total"
              :value="contracts"
              @page="onPage($event)"
              :paginator="true"
              :rows="lazyParams.rows"
              dataKey="id"
              :rowHover="true"
              :loading="loading"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[10, 25, 50]"
              :currentPageReportTemplate="
                $t('common.showingRecordsCount', {
                  first: '{first}',
                  last: '{last}',
                  totalRecords: '{totalRecords}',
                })
              "
              responsiveLayout="scroll"
              @sort="onSort($event)"
              @filter="onFilter($event)"
            >
            <Column field="createDate" :header="$t('faq.createDate')"></Column>
            <Column field="owner.fullName" :header="$t('common.createdBy')"></Column>
            <Column field="number" :header="$t('common.number')"></Column>
            <Column field="registerDateS" :header="$t('common.registeredDate')"></Column>
            <Column field="template" :header="$t('common.description')">
              <template #body="slotProps" >
                {{$i18n.locale === 'ru' ? slotProps.data.template.descriptionRus :slotProps.data.template.descriptionKaz}}
              </template>
            </Column>
            <Column field="state" :header="$t('common.state')">
              <template #body="slotProps">
                <span :class="'customer-badge status-' + slotProps.data.docHistory.stateEn">{{$t("common.states." + slotProps.data.docHistory.stateEn)}}</span>
              </template>
            </Column>

            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { smartEnuApi, getHeader, b64toBlob } from "@/config/config";
import axios from "axios";
export default {
  data() {
    return {
      menu: [
        
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
          command: () => {
            if (this.selectedContract != null) {
              this.$router.push('/documents/contract/'+ this.selectedContract.id  )
            }
          }
        },
       
      ],
      
      contracts: [],
      selectedContract: null,
      total: 0,
      lazyParams: {
      page: 0,
      rows: 10,
    },
    };
  },
  methods: {
    initApiCall() {
      let url = "/contract/jounal";
      this.loading = true;
      this.lazyParams.userID =  this.$store.state.loginedUser.userID
      axios
        .post(smartEnuApi + url, this.lazyParams, { headers: getHeader() })
        .then((res) => {
          this.loading = false
          this.total = res.data.total
          this.contracts = res.data.docs
        
          
        })
        .catch((error) => {
          console.log(error)
          this.loading = false
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    }

  },
  created() {
    this.initApiCall();
  },
};
</script>
