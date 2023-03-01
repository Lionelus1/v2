<template>
  <div class="col-12">
    <h3>{{ $t('workPlan.plans') }}</h3>
    <div class="card">
      <WorkPlanAdd v-model="isAdded"/>
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="data" :rows="10" dataKey="id" :rowHover="true" v-model:filters="filters"
                 filterDisplay="menu"
                 :loading="loading" responsiveLayout="scroll"
                 :globalFilterFields="['question','recipient','status', 'sendDate', 'createDate']"
                 @sort="onSort($event)">
        <template #header>
          <div class="table-header flex justify-content-end align-items-center">
            <span class="p-input-icon-left"><i class="pi pi-search"/>
              <InputText type="search" v-model="searchText" @keyup.enter="getPlans" :placeholder="$t('common.search')"
                         @search="getPlans"/>
              <Button icon="pi pi-search" class="ml-1" @click="getPlans"/>
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="content" :header="$t('workPlan.planName')" sortable>
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToEvent(data)">{{ data.work_plan_name }}</a>
          </template>
        </Column>
        <Column field="status" :header="$t('common.status')">
          <template #body="{ data }">
            <span :class="'customer-badge status-' + data.status.work_plan_status_id">{{
                $i18n.locale === "kz" ? data.status.name_kk : $i18n.locale === "ru" ? data.status.name_ru : data.status.name_en
              }}</span>
          </template>
        </Column>
        <Column field="user" :header="$t('common.created')">
          <template #body="{ data }">
            {{ data.user.fullName }}
          </template>
        </Column>
        <Column field="create_date" :header="$t('faq.createDate')">
          <template #body="{ data }">
            {{ formatDate(data.create_date) }}
          </template>
        </Column>
        <Column field="actions" header="">
          <template #body="{ data }">
            <Button type="button"
                    v-if="data.user.id === loginedUserId && (data.status.work_plan_status_id === 1 || data.status.work_plan_status_id === 3 || data.status.work_plan_status_id === 5)"
                    icon="pi pi-trash" class="p-button-danger mr-2"
                    label="" @click="deleteConfirm(data)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!--    <Dialog :header="$t('common.action.accept')" v-model:visible="isAcceptModal" :style="{width: '450px'}" class="p-fluid">
          <div class="field">
          </div>
          <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="closeModal"/>
            <Button :label="$t('ncasigner.sign')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="approve"/>
          </template>
        </Dialog>

        <Dialog header="На доработку" v-model:visible="isRejectModal" :style="{width: '450px'}" class="p-fluid">
          <div class="field">
            <label>Комментарий</label>
            <Textarea v-model="comment" rows="3" style="resize: vertical"/>
          </div>
          <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="closeModal"/>
            <Button label="Отправить" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
                    @click="rejectPlan"/>
          </template>
        </Dialog>-->
  </div>
</template>

<script>
import WorkPlanAdd from "./WorkPlanAdd";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";

export default {
  components: {WorkPlanAdd},
  data() {
    return {
      data: [],
      searchText: null,
      isAdded: null,
      isCurrentUserApprove: false,
      isAcceptModal: false,
      isRejectModal: false,
      comment: null,
      currentWorkPlanId: 0,
      loading: false,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      planService: new WorkPlanService()
    }
  },
  mounted() {
    this.emitter.on('workPlanIsAdded', (data) => {
      if (data === true) {
        this.getPlans();
      }
    });
    this.emitter.on('planSentToReapprove', (data) => {
      if (data === true) {
        this.getPlans();
      }
    });

  },
  created() {
    this.getPlans();
  },
  methods: {
    onSort() {

    },
    getPlans() {
      this.loading = true;
      this.planService.getPlans(this.searchText).then(res => {
        this.data = res.data;
        this.loading = false;
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
        this.loading = false;
      });
    },
    rejectPlan() {
      let data = {
        work_plan_id: this.currentWorkPlanId,
        comment: this.comment
      }
      this.planService.rejectPlan(data).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('workPlan.message.planSentToApprove'),
            life: 3000,
          });
        }
        this.isRejectModal = false;
        this.getPlans();
      }).catch(error => {
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
    deleteConfirm(event) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.delete(event);
        },
      });
    },
    delete(event) {
      this.planService.deletePlan(event.work_plan_id).then(response => {
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getPlans();
        }
      }).catch(error => {
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
    navigateToEvent(event) {
      //localStorage.setItem('workPlan', JSON.stringify(event));
      this.$router.push({name: 'WorkPlanEvent', params: {id: event.work_plan_id}});
    },
    formatDate(value) {
      let result = "";
      if (value == null) {
        return result;
      }
      let date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
    openAcceptModal(id) {
      this.isAcceptModal = true;
      this.currentWorkPlanId = id;
    },
    openRejectModal(id) {
      this.isRejectModal = true;
      this.currentWorkPlanId = id;
    },
    closeModal() {
      this.isAcceptModal = false;
      this.isRejectModal = false;
    }
  }
}
</script>

<style scoped lang="scss">
.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-5 {
    background: #B48B7D;
    color: #fff;
  }

  &.status-4 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.status-1 {
    background: #B3E5FC;
    color: #23547B;
  }
}
</style>