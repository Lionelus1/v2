<template>
    <TitleBlock :title="$t('publicReception.title')" />
    <BlockUI :blocked="loading" :fullScreen="true">
      <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    </BlockUI>
    <div class="">
        <div class="grid">
<!--        <div class="card col-6 shadow-1 gap-1" v-for="i of data" :key="i">
            <div class="flex justify-content-between">
                <div>
                    <i class="fa-solid fa-tags product-category-icon"></i>
                    <small class="product-category">{{ i.category['name' + $i18n.locale].split("(")[0] }}</small>
                </div>
                <div>
                    <span v-if="adminMode" :class="'customer-badge status-' + i.state.id">{{ $t("common.states." + i.state.code) }}</span>
                </div>
                <div>
                    <span v-if="i.expired">
                    <i class="fa-solid fa-calendar-days product-error-icon"></i>
                  </span>
                    <span v-else>
                    <i class="fa-solid fa-calendar-days product-category-icon"></i>
                  </span>
                    <small class="product-category">{{ moment(new Date(i.createdDate)).utc().format("DD.MM.YYYY") }}</small>
                </div>
            </div>
            <div class="flex justify-content-between">
                <div>

                </div>
                <i class="fa-solid fa-at product-category-icon"></i>
                <small class="product-category">{{ slotProps.data.lastName + " " + slotProps.data.firstName }}</small>
            </div>
        </div>-->
        </div>
      <DataView :lazy="true" :loading="loading" :value="data" :rows="10" :paginator="true" :first="pageFirst" @page="onPage($event)"
                :totalRecords="total" layout="grid">
        <template #grid="slotProps">
          <div class="grid">
            <template v-for="(item, index) in slotProps?.items" :key="index">
              <div class="col-12 lg:col-6 p-2">
                <div class="card question_card p-3 shadow-1 m-0">
                  <div class="question_status text-center mt-2 mb-2 sm:m-0">
                          <span class="font-bold mr-2">
                            <small>№&nbsp;{{ item.id }}</small>
                          </span>
                    <span v-if="adminMode" :class="'customer-badge status-' + item.state.id">
                            {{ $t("common.states." + item.state.code) }}
                          </span>
                  </div>
                  <div class="block sm:flex justify-content-between relative">
                    <div class="">
                      <i class="fa-solid fa-tags product-category-icon mr-2"></i>
                      <small class="product-category">{{ item.category['name' + $i18n.locale].split("(")[0] }}</small>
                    </div>
                    <div class="">
                  <span v-if="item.expired">
                    <i class="fa-solid fa-calendar-days product-error-icon mr-2"></i>
                  </span>
                      <span v-else>
                    <i class="fa-solid fa-calendar-days product-category-icon mr-2"></i>
                  </span>
                      <small class="product-category">{{ moment(new Date(item.createdDate)).utc().format("DD.MM.YYYY") }}</small>
                    </div>
                  </div>
                  <div class="product-grid-item-content mt-2 mb-2">
                    <p class="question_text" :title="item.question">{{ item.question }}</p>
                  </div>
                  <div class="product-grid-item-bottom">
                    <div class="block sm:flex justify-content-between align-items-center">
                      <div>
                        <div class="mb-2 sm:m-0">
                          <i class="fa-solid fa-at product-category-icon mr-2"></i>
                          <small class="product-category">{{ item.lastName + " " + item.firstName }}</small>
                        </div>
                        <div v-if="adminMode" class="block sm:flex align-items-center">
                                  <span v-if="item.replier">
                                    <i class="fa-solid fa-user-tag product-category-icon mr-2"></i>
                                    <small class="product-category mb-2 sm:m-0">{{ item.replier.fullName }}</small>
                                  </span>
                        </div>
                      </div>
                      <div class="sm:flex block justify-content-between align-items-center">
                        <div v-if="adminMode">
                          <Button v-if="item.state.id !=7" :label="$t('common.send')" icon="pi pi-send" class="p-button-outlined p-button-warning sm:ml-2 sm:mt-0 ml-0 mt-2 sm:mr-4 mr-0"
                                  @click="currentQuestion=item.id;sendDialog=true"></Button>
                        </div>
                        <Button class="mt-2 sm:mt-0 sm:mr-4 mr-0" v-if="item.filePath" :label="$t('faq.attachments')" icon="pi pi-download"
                                @click="downloadFile(item.filePath)"></Button>
                        <div class="">
                          <router-link :to="{ name: 'ReceptionQuestion', params: { id: item.id } }" tag="a">
                            <Button :label="$t('common.more')" class="p-button-outlined p-button-info mt-2 sm:mt-0 sm:mr-4 mr-0"></Button>
                          </router-link>
                        </div>
                        <div style="text-align: end">
                          <Button v-if="adminMode" class="p-button-danger"
                                  icon="pi pi-trash" label="" @click="deleteVisibleReceptionQuestion(item.id)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </DataView>
    </div>
    <Dialog @hide="currentQuestion=-1;responsible=null" :header="$t('common.sendToResponsible')" v-model:visible="sendDialog" :modal="true"
            :style="{width: '75vw'}">
      <div class="field">
        <label>{{ this.$t("queue.responsible") }}</label>
        <FindUser v-model="responsible" :max="1" :editMode="false" style="width:100%" :user-type="3"/>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" @click="sendDialog=false"/>
        <Button :label="$t('common.yes')" autofocus @click="sendToResponsible"/>
      </template>
    </Dialog>
  <Dialog
      v-model:visible="deleteVisible"
      :closable="false"
      header=""
      :style="{ width: '450px' }"
      :modal="true">
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"/>
      <span>{{ $t("common.doYouWantDelete") }}?</span>
    </div>
    <template #footer>
      <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button p-component p-button-success mr-2"
          @click="deleteReceptionQuestion(questionID)"/>
      <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger"
          @click="deleteVisible = false"/>
    </template>
  </Dialog>
</template>

<script>
import api from "@/service/api";
import {FilterMatchMode, FilterOperator} from 'primevue/api';
import {getHeader, smartEnuApi, findRole} from "@/config/config";
import moment from "moment";
import ReceptionService from "@/service/reception.service";
import TitleBlock from "@/components/TitleBlock.vue";


export default {
    components: {TitleBlock},
  props: {
    adminMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      deleteVisible: false,
      questionID: 0,
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
      currentPage: 0,
      pageFirst: 0,
      lazyParams: {
        page: 0,
        rows: 10,
        countMode: null,
      },
      request: {
        questionID: -1,
        replierID: -1,
      },
      total: 0,
      receptionService: new ReceptionService()
    };
  },
  mounted() {
    this.getData();
  },
  beforeUnmount(){
    if(!this.$route.path.includes('/reception')){
      localStorage.removeItem('currentPage');
      localStorage.removeItem('pageFirst');
    }
  },
  methods: {
    moment: moment,
    getData() {
      this.loading = true;
      const savedPage = localStorage.getItem('currentPage');
      const savedPage2 = localStorage.getItem('pageFirst');
      if (savedPage) {
        this.currentPage = parseInt(savedPage, 10);
        this.pageFirst = parseInt(savedPage2, 10);
        this.lazyParams.page = this.currentPage
        this.lazyParams.first = this.pageFirst
      }
      api.post("/reception/questions", this.lazyParams, {
        headers: getHeader(),
      }).then((response) => {
        this.data = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      }).catch((error) => {
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
      if (this.currentQuestion < 0 || this.responsible === null || this.responsible.length < 0) {
        this.$toast.add({
          severity: "error",
          summary: this.$t('common.message.fillError'),
          life: 3000,
        });
        this.loading = false;
        return
      }
      this.request.questionID = this.currentQuestion
      this.request.replierID = this.responsible[0].userID
      this.receptionService.sendToResponsible(this.request).then(_ => {
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].id === this.currentQuestion) {
            this.data[i].replier = JSON.parse(JSON.stringify(this.responsible[0]))
          }
        }
        this.currentQuestion = -1;
        this.responsible = null
        this.loading = false;
        this.sendDialog = false;
        this.$toast.add({
          severity: "success",
          summary: this.$t("common.message.successCompleted"),
          life: 3000,
        });
      }).catch((error) => {
        this.loading = false;
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
      let data = {filePath: filePath};
      this.receptionService.downloadFile(data).then(response => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + response.data;
        link.setAttribute("download", filePath);
        link.download = filePath;
        link.click();
        URL.revokeObjectURL(link.href);
        this.loading = false;
      }).catch((error) => {
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
      localStorage.setItem('currentPage', event.page);
      localStorage.setItem('pageFirst', event.first);
      this.lazyParams = event
      this.getData();
    },
    truncateQuestion(text) {
      if (text.length <= 70) {
        return text;
      }
        return text.substring(0, 70) + '\u2026'
    },
    deleteReceptionQuestion(data) {
      this.loading = true
      const req ={
        id: Number(data)
      }
      this.receptionService.deleteReceptionQuestion(req).then(_ => {
        this.getData()
        this.loading = false
      }).catch((error) => {
        this.$toast.add({
          severity: "error",
          summary: "downloadFileError:\n" + error,
          life: 3000,
        });
        this.loading = false;
      });
      this.deleteVisible = false;
    },

    deleteVisibleReceptionQuestion(id) {
      this.questionID = id;
      this.deleteVisible = true;
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
    flex-order-: space-between;
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
.product-error-icon {
  vertical-align: middle;
  margin-right: .5rem;
  color: #c63737
}

::v-deep(.p-dataview .p-dataview-content) {
  background: transparent !important;
}
::v-deep(.p-dataview .p-paginator-bottom){
  margin-top: 20px;
}
.question_text{
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  width: 90%;
}
.question_card{
  min-height: 166px;
}
.question_status{
  left: 45%;
}
</style>
