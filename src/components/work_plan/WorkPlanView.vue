<template>
  <div>
    <div class="p-col-12" v-if="!loading">
      <div class="card"
           v-if="isPlanApproved && (isPlanCreator || (isApproval || isApproved)) && plan.status.work_plan_status_id === 4">
        <Button v-if="isPlanCreator" :label="$t('common.action.reApprove')" icon="pi pi-check"
                @click="reapproveConfirmDialog"
                class="p-button p-ml-2"/>
        <Button :label="$t('common.signatures')" icon="pi pi-file"
                v-if="isPlanApproved && isPlanCreator || (isApproval || isApproved)"
                @click="viewSignatures"
                class="p-button p-ml-2"/>
      </div>
      <div class="card" v-if="isApproval && plan.status.work_plan_status_id === 2">
        <Button v-if="isApproval"
                :label="isLast ? $t('common.action.approve') : $t('common.action.approve') " icon="pi pi-check"
                @click="openApprovePlan"
                class="p-button p-button-success p-ml-2"/>
        <Button v-if="isApproval" :label="$t('workPlan.toCorrect')" icon="pi pi-times"
                @click="openRejectPlan"
                class="p-button p-button-danger p-ml-2"/>
      </div>

      <div class="card">
        <h5>{{ plan.work_plan_name }} <span :class="'status-badge status-' + plan.status.work_plan_status_id">{{
            $i18n.locale === "kz" ? plan.status.name_kk : $i18n.locale === "ru" ? plan.status.name_ru : plan.status.name_en
          }}</span></h5>
        <!--        <WorkPlanApproveStep style="height: 200px" now-step="1" direction="vertical" :step-list="approvals" />-->
        <!--        <WorkPlanApproveStatus :options="approvals"></WorkPlanApproveStatus>-->
        <Timeline :value="approvals">
          <template #content="slotProps">
            <div v-for="(item, index) of slotProps.item" :key="index">
              {{ item.user.fullName }}
              <i v-if="item.is_success" class="pi pi-check-circle p-ml-2 p-message-success"
                 style="font-size: 1.2rem;color: #3eaf7c"></i>
              <i v-if="!item.is_success" class="pi pi-spinner p-ml-2" style="font-size: 1.2rem;color: #c63737"></i>
            </div>
          </template>
        </Timeline>
      </div>
      <div class="card">
<!--        <object src="#toolbar=0" style="width: 100%; height: 1000px" v-if="source" type="application/pdf"
                :data="sourceb64"></object>-->
        <embed :src="sourceb64" style="width: 100%; height: 1000px" v-if="sourceb64" type="application/pdf" />
      </div>
    </div>

    <Dialog :header="$t('workPlan.toCorrect')" v-model:visible="showRejectPlan" :style="{width: '450px'}"
            class="p-fluid">
      <div class="p-field">
        <label>{{ $t('common.comment') }}</label>
        <Textarea inputId="textarea" rows="3" cols="30" v-model="rejectComment"></Textarea>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
                @click="rejectPlan"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {NCALayerClient} from "ncalayer-js-client";

export default {
  name: "WorkPlanView",
  data() {
    return {
      source: null,
      document: null,
      work_plan_id: 0,
      isApproval: false,
      isRejected: false,
      loginedUserId: 0,
      plan: null,
      rejectComment: "",
      showRejectPlan: false,
      CMSSignature: null,
      documentByteArray: null,
      isApproved: false,
      isLast: false,
      loading: false,
      user: null,
      approval_users: [],
      approvals: [],
      isPlanApproved: false,
      signatures: null,
      isPlanCreator: false,
      sourceb64: null
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.user = JSON.parse(localStorage.getItem("loginedUser"));
    this.loginedUserId = this.user.userID;
    this.getPlan();
  },
  methods: {
    getFile() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanFile`,
          {doc_id: this.plan.doc_id},
          {headers: getHeader()}).then(res => {
        if (res.data) {
          this.source = `data:application/pdf;base64,${res.data}`;
          this.sourceb64 = this.b64toBlob(res.data);
          this.document = res.data;
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
    b64toBlob(b64Data, sliceSize=512) {
      const byteCharacters = window.atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, {type: "application/pdf"});
      return URL.createObjectURL(blob);
    },
    getPlan() {
      this.loading = true;
      axios.get(smartEnuApi + `/workPlan/getWorkPlanById/${this.work_plan_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.plan = res.data;
              if (this.plan && this.plan.user.id === this.loginedUserId) {
                this.isPlanCreator = true;
              }
              this.getFile();
              this.getSignatures();
              this.getWorkPlanApprovalUsers();
            }
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
    getWorkPlanApprovalUsers() {
      axios.get(smartEnuApi + `/workPlan/getApprovalUsers/${parseInt(this.work_plan_id)}`)
          .then(res => {
            if (res.data) {
              this.approvals = [];
              const d = res.data;
              this.isPlanApproved = d.every(x => x.is_success);
              const unique = [...new Set(d.map(item => item.stage))];
              unique.forEach(r => {
                let f = d.filter(x => x.stage === r);
                this.approvals.push(f);
              });
              this.approval_users = res.data;
              this.init();
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
    getSignatures() {
      axios.post(smartEnuApi + `/workPlan/getSignatures`,
          {doc_id: this.plan.doc_id},
          {headers: getHeader()}).then(res => {
        if (res.data) {
          this.signatures = res.data;
          const signUser = res.data.find(x => x.userId === this.loginedUserId);
          if (signUser) {
            this.isApproved = true;
          }
        }
      }).catch(error => {
        this.$toast.add({
          severity: 'error',
          summary: error,
          life: 3000
        });
      })
    },
    init() {
      const currentUser = this.approval_users.findIndex(x => x.user.id === this.loginedUserId);
      const last = this.approval_users?.at(-1);
      const prevObj = this.approval_users[currentUser - 1];
      const currentObj = this.approval_users[currentUser];
      const findUserFromSignatures = this.signatures && prevObj ? this.signatures.find(x => x.userId === prevObj.user.id) : null;
      if (prevObj == null && currentObj && !currentObj.is_success) {
        this.isApproval = true;
      } else if (prevObj && currentObj && currentObj.stage === prevObj.stage && !findUserFromSignatures) {
        this.isApproval = true;
      } else if (prevObj && prevObj.is_success && currentObj && !currentObj.is_success && prevObj.stage === currentObj.stage) {
        this.isApproval = true;
      } else if (prevObj && currentObj && currentObj.stage !== prevObj.stage && this.approval_users.filter(x => x.stage === 1 && x.is_success === true).length > 0) {
        this.isApproval = true;
      } else {
        this.isApproval = false;
      }

      if (currentObj && last.stage === currentObj.stage) {
        this.isLast = true;
      }
      /*const findApprovalUser = this.approval_users?.find(x => x.user_id === this.loginedUserId);
      const findUserFromSignatures = this.signatures.find(x => x.userId === findApprovalUser.user_id);
      if (!findUserFromSignatures) {
        this.$toast.add({
          severity: 'error',
          summary: "Ошибка",
          life: 3000
        });
        return;
      }*/
    },
    async openApprovePlan() {
      let NCALaClient = new NCALayerClient();

      try {
        await NCALaClient.connect();
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('ncasigner.failConnectToNcaLayer'),
          life: 3000
        });
        return;
      }
      try {
        this.CMSSignature = await NCALaClient.createCAdESFromBase64('PKCS12', this.document, 'SIGNATURE', false)
        this.sendSignature();
      } catch (error) {
        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
      }
    },
    rejectPlan() {
      this.loading = true;
      axios.post(smartEnuApi + '/workPlan/reject',
          {
            comment: this.rejectComment,
            work_plan_id: parseInt(this.work_plan_id),
            doc_id: this.plan.doc_id,
            work_plan_name: this.plan.work_plan_name
          },
          {headers: getHeader()}
      ).then(res => {
        if (res.data.is_success) {
          this.loading = false;
          this.showRejectPlan = false;
          this.emitter.emit("planRejected", true);
          this.$router.push({name: 'WorkPlanEvents', params: {id: this.plan.work_plan_id}});
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
        this.loading = false;
      })
    },
    openRejectPlan() {
      this.showRejectPlan = true;
    },
    closeModal() {
      this.showRejectPlan = false;
    },
    sendSignature() {
      axios.post(smartEnuApi + '/workPlan/signature', {
        uuid: this.plan.doc_id,
        sign: this.CMSSignature,
        work_plan_id: parseInt(this.work_plan_id),
        is_last: this.isLast
      }, {headers: getHeader()}).then((response) => {
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('ncasigner.success.signSuccess'),
            life: 3000,
          });
          this.getPlan();
          this.getSignatures();
          this.getWorkPlanApprovalUsers();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: this.$t(error.response.data),
            life: 3000,
          });
        }
      });
    },
    reapproveConfirmDialog() {
      this.$confirm.require({
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.reapprove();
        }
      });
    },
    reapprove() {
      axios.post(smartEnuApi + '/workPlan/reapprove', {
        work_plan_id: parseInt(this.work_plan_id),
        doc_id: this.plan.doc_id,
        work_plan_name: this.plan.work_plan_name
      }, {headers: getHeader()}).then((response) => {
        if (response.data.is_success) {
          this.emitter.emit("planSentToReapprove", true);
          this.$router.push({name: 'WorkPlan'});
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: this.$t(error.response.data),
            life: 3000,
          });
        }
      });
    },
    viewSignatures() {
      this.$router.push({name: 'DocSignaturesInfo', params: {uuid: this.plan.doc_id}})
    },
  }
}
</script>

<style scoped lang="scss">
::v-deep(.p-timeline-event-opposite) {
  flex: 0;
}

.status-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

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
