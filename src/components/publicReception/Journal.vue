<template>
  <div class="p-col-12">
    <h5>{{$t("publicReception.title")}}</h5>
    <BlockUI :blocked="loading" :fullScreen="true">
      <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    </BlockUI>
    <!--    <h4>Сұрақ-жауап</h4>-->
    <div class="card">
      <DataView :lazy="true" :loading="loading" responsiveLayout="scroll" :value="data" :rows="10" :paginator="true" @page="onPage($event)" :totalRecords="total">
        <!-- <template #header>
          <div class="grid grid-nogutter">
              <div class="col-6" style="text-align: left">
                  <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By Price" @change="onSortChange($event)"/>
              </div>
          </div>
      </template> -->
      <template #list="slotProps">
        <div class="product-grid-item card">
          <div class="product-grid-item-top p-mb-2">
            <div class="p-col-12 p-grid">
              <div class="p-lg-3 p-md-3 p-sm-6">
                  <i class="fa-solid fa-tags product-category-icon"></i>
                  <small class="product-category">{{slotProps.data.category['name' + $i18n.locale].split("(")[0]}}</small>
              </div>
              <div class="p-lg-3  p-md-3 p-sm-6  p-text-right">
                <span v-if="adminMode" :class="'customer-badge status-' + slotProps.data.state.id">{{$t("common.states." + slotProps.data.state.code)}}</span>
              </div>
              <div class="p-lg-3  p-md-3 p-sm-6">

              <small>№&nbsp;{{slotProps.data.id}}</small>
              </div>
              <div class="p-lg-3  p-md-3 p-sm-6 p-text-right">
                  <i class="fa-solid fa-calendar-days product-category-icon"></i>
                  <small class="product-category">{{moment(new Date(slotProps.data.createdDate)).utc().format("DD.MM.YYYY")}}</small>
              </div>
            </div>
          </div>
          <div class="product-grid-item-content">
            <p class="block-with-text">{{slotProps.data.question}}</p>
          </div>
          <div class="product-grid-item-bottom">
            <div class="p-col-12 p-grid">
              <div class="p-lg-3 p-md-3 p-sm-6">
                <span>
                  <i class="fa-solid fa-at product-category-icon"></i>
                  <small class="product-category">{{slotProps.data.lastName + " " + slotProps.data.firstName}}</small>
                </span>
              </div>
            <div class="p-lg-3 p-md-3 p-sm-6 p-text-right">
              <div v-if="adminMode">
              <span v-if="slotProps.data.replier">
                <i class="fa-solid fa-user-tag product-category-icon"></i>
                <small class="product-category">{{slotProps.data.replier.fullName}}</small>
              </span>
              <Button v-else :label="$t('common.send')" icon="pi pi-send"  class="p-button-outlined p-button-warning" @click="currentQuestion=slotProps.data.id;sendDialog=true"></Button>
              </div>
            </div>
            <div class="p-lg-3 p-md-3 p-sm-6">
              <Button v-if="slotProps.data.filePath" :label="$t('faq.attachments')" icon="pi pi-download" @click="downloadFile(slotProps.data.filePath)"></Button>
            </div>
            <div class="p-lg-3 p-md-3 p-sm-6  p-text-right">
              <router-link :to="{ name: 'ReceptionQuestion', params: { id: slotProps.data.id } }" tag="a">
                  <Button :label="$t('common.more')"  class="p-button-outlined p-button-info"></Button>
              </router-link>
            </div>

            </div>
					</div>
        </div>
        
        
      </template>
      </DataView>
      </div>
      <Dialog @hide="currentQuestion=-1;responsible=null" :header="$t('common.sendToResponsible')" v-model:visible="sendDialog" :modal="true" :style="{width: '75vw'}">
        <div class="p-field">
          <label>{{ this.$t("queue.responsible") }}</label>
          <FindUser v-model="responsible" :max="1" :editMode="false" style="width:100%"/>
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" @click="sendDialog=false" />
          <Button :label="$t('common.yes')" autofocus @click="sendToResponsible"/>
      </template>
      </Dialog>

  </div>
</template>

<script>
import axios from "axios";
import {FilterMatchMode, FilterOperator} from 'primevue/api';
import {getHeader, smartEnuApi, findRole} from "@/config/config";
import moment from "moment";
import { boolean } from "yargs";
import FindUser from "@/helpers/FindUser";



export default {
  components: {FindUser}, 
  props: {
    adminMode: {
      type: boolean,
      default: true
    }
  },
  data() {
    return {
      data: [],
      currentQuestion: -1,
      responsible: null,
      sendDialog: false,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'replier': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'state': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sender': {value: null, matchMode: FilterMatchMode.EQUALS},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      loading: true,
      statuses: {
        new: 1,
        inWork: 2,
        completed: 3,
        expired: 4,
      },
      lazyParams: {
        page: 0,
        rows: 10,
        countMode: null,
      },
      request: {
        questionID: -1,
        replierID: -1,
      },
      total: 0
    };
  },
  created() {
    this.getData();
  },
  methods: {
    moment: moment,
    getData() {
      this.loading = true;
      axios
          .post(smartEnuApi + "/reception/questions", this.lazyParams,  {
            headers: getHeader(),
          })
          .then((response) => {
            this.data = response.data.items;
            this.total = response.data.total;
            this.loading = false;
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: error,
                life: 3000,
              });
            }
          });
    },
    sendToResponsible() {
      this.loading = true;
      if (this.currentQuestion <0 || this.responsible === null || this.responsible.length < 0) {
        this.$toast.add({
          severity: "error",
          summary:  this.$t('common.message.fillError'),
          life: 3000,
        });
        this.loading = false;
        return
      }
      this.request.questionID = this.currentQuestion
      this.request.replierID = this.responsible[0].userID
      console.log(this.request)
      axios
      .post(smartEnuApi + "/reception/setRequestResponsible", 
        this.request,
        { headers: getHeader()}
        )
      .then(_=> {
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].id === this.currentQuestion) {
            this.data[i].replier = JSON.parse(JSON.stringify(this.responsible[0]))
          }
        }
        this.currentQuestion = -1;
        this.responsible = null
        this.loading =false;
        this.sendDialog = false;
        this.$toast.add({
            severity: "success",
            summary: this.$t("common.message.successCompleted"),
            life: 3000,
          });
      })
      .catch((error) => {
        this.loading =false;
        if (error.response && error.response.status === 405) {
        {
          this.$toast.add({
            severity: "error",
            summary: this.$t("common.message.notAllowed"),
            life: 3000,
          });
        }
        }
      });

    },
    downloadFile(filePath) {
      this.loading = true;
      axios.post(
        smartEnuApi + "/downloadFile", {
            filePath: filePath
        }, {
            headers: getHeader()
        }
      )
      .then(response => {
          const link = document.createElement("a");
          link.href = "data:application/octet-stream;base64," + response.data;
          link.setAttribute("download", filePath);
          link.download = filePath;
          link.click();
          URL.revokeObjectURL(link.href);
          this.loading = false;
      })
      .catch((error) => {
          this.$toast.add({
              severity: "error",
              summary: "downloadFileError:\n" + error,
              life: 3000,
          });
          this.loading = false;
      });
      
    },
    onSort(event) {
      this.lazyParams = event
      this.getData();
    },
    onPage(event) {
      this.lazyParams = event
      this.getData();
    },
  }
};
</script>

<style lang="scss" scoped>
  ::v-deep(.product-list-item) {
	display: flex;
	align-items: center;
	padding: 1rem;
	width: 100%;

	img {
		width: 150px;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
		margin-right: 2rem;
	}

	.product-list-detail {
		flex: 1 1 0;
	}

	.p-rating {
		margin: 0 0 .5rem 0;
	}

	.product-price {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: .5rem;
		align-self: flex-end;
	}

	.product-list-action {
		display: flex;
		flex-direction: column;
	}

	.p-button {
		margin-bottom: .5rem;
	}

}
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-7 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-3 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-1 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-8 {
    background: #eccfff;
    color: #694382;
  }

  &.status-proposal {
    background: #ffd8b2;
    color: #805b36;
  }

  &.online {
    background: #c8e6c9;
    color: #256029;
  }

  &.offline {
    background: #ffcdd2;
    color: #c63737;
  }
}
::v-deep(.product-grid-item) {
	margin: .5em;
	border: 1px solid #dee2e6;
  width: 100%;

	.product-grid-item-top,
	.product-grid-item-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}



	.product-grid-item-content {
		text-align: center;
	}

	.product-price {
		font-size: 1.5rem;
		font-weight: 600;
	}
  .product-category-icon {
	vertical-align: middle;
	margin-right: .5rem;
  }
  .block-with-text {
    overflow: hidden;
    position: relative;
    line-height: normal;
    max-height: 3.5em;
    text-align: justify;
    margin-right: -1em;
    padding-right: 1em;
}
}
</style>
