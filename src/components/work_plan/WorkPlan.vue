<template>
  <div class="p-col-12">
    <div class="card">
      <WorkPlanAdd v-model="isAdded"/>
    </div>

    <div class="card">
      <DataTable :lazy="true" :value="data"
                 class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:filters="filters"
                 filterDisplay="menu"
                 :loading="loading" responsiveLayout="scroll"
                 :globalFilterFields="['question','recipient','status', 'sendDate', 'createDate']"
                 @sort="onSort($event)">
        <template #header>
          <div class="p-d-flex p-jc-between p-ai-center">
            <h5 class="p-m-0">Планы</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="searchText" :placeholder="$t('common.search')"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getData"/>
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="content" header="Название плана" sortable>
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToEvent(data)">{{ data.work_plan_name }}</a>
          </template>
        </Column>
<!--        <Column field="status" header="Статус">
          <template #body="{ data }">
            <span :class="'customer-badge status-' + data.status.work_plan_status_id">{{ data.status.name_ru }}</span>
          </template>
        </Column>-->
        <Column field="actions" header="Действие">
          <template #body="{ data }">
            <WorkPlanApprove :data="data" v-if="data.status.work_plan_status_id !== 2"/>
            <Button type="button" v-if="isCurrentUserApprove && data.status.work_plan_status_id === 2" icon="pi pi-check" class="p-button-success p-mr-2"
                    label="Подписать" @click="openAcceptModal(data.id)"></Button>
            <Button type="button" v-if="isCurrentUserApprove && data.status.work_plan_status_id === 2" icon="pi pi-times-circle" class="p-button-danger p-mr-2"
                    label="Отказать" @click="openRejectModal(data.id)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog header="Принять" v-model:visible="isAcceptModal" :style="{width: '450px'}" class="p-fluid">
      <div class="p-field">
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button label="Подписать" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2" @click="approve"/>
      </template>
    </Dialog>

    <Dialog header="На доработку" v-model:visible="isRejectModal" :style="{width: '450px'}" class="p-fluid">
      <div class="p-field">
        <label>Комментарий</label>
        <Textarea v-model="comment" rows="3" style="resize: vertical"/>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button label="Отправить" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
                @click="rejectPlan"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import WorkPlanAdd from "./WorkPlanAdd";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import WorkPlanApprove from "@/components/work_plan/WorkPlanApprove";

export default {
  components: {WorkPlanApprove, WorkPlanAdd},
  data() {
    return {
      data: [],
      searchText: null,
      isAdded: null,
      isCurrentUserApprove: false,
      isAcceptModal: false,
      isRejectModal: false,
      comment: null,
      currentWorkPlanId: 0
    }
  },
  mounted() {
    this.emitter.on('workPlanIsAdded', (data) => {
      if (data === true) {
        this.getPlans();
      }
    });
    console.log(this.selected)
  },
  created() {
    this.getPlans();
  },
  methods: {
    onSort() {

    },
    getPlans() {
      axios.post(smartEnuApi + `/workPlan/getPlans`, {}, {headers: getHeader()})
          .then(res => {
            this.data = res.data;
            let localUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
            this.data.forEach(d => {
              /*d.approval_users.forEach(e => {
                console.log(e)
                if (e.id === localUserId) {
                  this.isCurrentUserApprove = true
                }
              });*/
            });
          }).catch(error => {
        if (error.response.status === 401) {
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
    rejectPlan() {
      axios.post(smartEnuApi + `/workPlan/reject`, {
        work_plan_id: this.currentWorkPlanId,
        comment: this.comment
      }, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: "План отправлен на доработку",
            life: 3000,
          });
        }
        this.isRejectModal = false;
        this.getPlans();
      }).catch(error => {
        if (error.response.status === 401) {
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
      localStorage.setItem('workPlan', JSON.stringify(event));
      this.$router.push({ name: 'WorkPlanEvents', params: { id: event.work_plan_id }});
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

  &.status-3 {
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