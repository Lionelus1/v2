<template>
  <div>
    <div class="col-12" v-if="!loading">
      <div class="card"
           v-if="isPlanApproved && (isPlanCreator || (isApproval || isApproved)) && !(plan.doc_info.docHistory.stateId === 2)">
        <Button v-if="isPlanCreator && plan" :label="$t('common.action.reApprove')" icon="pi pi-check"
                @click="reapproveConfirmDialog"
                class="p-button ml-2"/>
        <Button :label="$t('common.signatures')" icon="pi pi-file"
                v-if="isPlanApproved && isPlanCreator || (isApproval || isApproved)"
                @click="viewSignatures"
                class="p-button ml-2"/>
      </div>
      <div class="card" v-if="isApproval && plan.doc_info.docHistory.stateId === 2">
        <Button :label="isLast ? $t('common.action.approve') : $t('common.action.approve') " icon="pi pi-check"
                 @click="openApprovePlan"
                class="p-button p-button-success ml-2"/>
        <Button :label="$t('workPlan.toCorrect')" icon="pi pi-times"
                @click="openRejectPlan"
                class="p-button p-button-danger ml-2"/>
      </div>

      <div class="card">
        <h5><TitleBlock :title="plan.work_plan_name" :show-back-button="true" />&nbsp;
         <span :class="'status-badge status-' + plan.doc_info.docHistory.stateId" style="position: relative; top: -3px;">
         {{ getDocStatus(plan.doc_info.docHistory.stateEn) }}
          </span></h5>
        <Timeline :value="approvals">
          <template #content="slotProps">
            <div v-for="(item, index) of slotProps.item" :key="index">
              {{ item.user.fullName }}
              <i v-if="item.is_success" class="pi pi-check-circle ml-2 p-message-success"
                 style="font-size: 1.2rem;color: #3eaf7c"></i>
              <i v-if="!item.is_success" class="pi pi-spinner ml-2" style="font-size: 1.2rem;color: #c63737"></i>
            </div>
          </template>
        </Timeline>
      </div>
      <div class="card">
        <embed :src="sourceb64" style="width: 100%; height: 1000px" v-if="sourceb64" type="application/pdf"/>
      </div>
    </div>

    <Dialog :header="$t('workPlan.toCorrect')" v-model:visible="showRejectPlan" :style="{width: '450px'}"
            class="p-fluid">
      <div class="field">
        <label>{{ $t('common.comment') }}</label>
        <Textarea inputId="textarea" rows="3" cols="30" v-model="rejectComment"></Textarea>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
                @click="rejectPlan"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import {runNCaLayer} from "../../helpers/SignDocFunctions";
import {WorkPlanService} from "@/service/work.plan.service";

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
      sourceb64: null,
      isCurrentUserApproved: false,
      planService: new WorkPlanService(),
      docStatus: [
        { name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created" },
        { name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval" },
        { name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved" },
        { name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision" },
        { name_kz: "қайтарылды", name_en: "rejected", name_ru: "отклонен", code: "rejected" },
        { name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing" },
        { name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed" },
        { name_kz: "қайта бекітуге жіберілді", name_en: "sent for re-approval", name_ru: "отправлен на переутверждение", code: "sent for re-approval" },
        { name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated" },
        { name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued" },
      ],
      selectedDocStatus: null,
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.user = JSON.parse(localStorage.getItem("loginedUser"));
    this.loginedUserId = this.user.userID;
    this.getPlan();
  },
  methods: {
    getDocStatus(code) {
      const foundStatus = this.docStatus.find(status => status.code === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
    getFile() {
      this.planService.getPlanFile(this.plan.doc_id).then(res => {
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
    b64toBlob(b64Data, sliceSize = 512) {
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
      this.planService.getPlanById(this.work_plan_id).then(res => {
        if (res.data) {
          this.plan = res.data;
          if (this.plan && this.plan.user.id === this.loginedUserId) {
            this.isPlanCreator = true;
          }
          this.getFile();
          //this.getSignatures();
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
      this.planService.getWorkPlanApprovalUsers(parseInt(this.work_plan_id)).then(res => {
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
      });
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
    openApprovePlan() {
      runNCaLayer(this.$t, this.$toast, this.document, 'cms', null, false, this.$i18n.locale)
          .then(sign => {
            if (sign !== undefined) {
              this.CMSSignature = sign;
              this.sendSignature();
            }
          }).catch(error => {
        this.$toast.add({severity: 'error', summary: error, life: 3000});
      });
    },
    rejectPlan() {
      this.loading = true;
      let data = {
        comment: this.rejectComment,
        work_plan_id: parseInt(this.work_plan_id),
        doc_id: this.plan.doc_id,
        work_plan_name: this.plan.work_plan_name
      };
      this.planService.rejectPlan(data).then(res => {
        if (res.data.is_success) {
          this.loading = false;
          this.showRejectPlan = false;
          this.emitter.emit("planRejected", true);
          this.$router.push({name: 'WorkPlanEvent', params: {id: this.plan.work_plan_id}});
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
      let data = {
        uuid: this.plan.doc_id,
        sign: this.CMSSignature,
        work_plan_id: parseInt(this.work_plan_id),
        is_last: this.isLast
      };
      this.planService.signPlan(data).then((response) => {
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('ncasigner.success.signSuccess'),
            life: 3000,
          });
          this.getPlan();
          //this.getSignatures();
          this.getWorkPlanApprovalUsers();
        }
      }).catch(error => {
        if (error.response.status === 405) {
          this.CMSSignature = null;
          this.$toast.add({
            severity: "error",
            summary: this.$t(error.response.data),
            life: 3000,
          });
        }
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
      let data = {
        work_plan_id: parseInt(this.work_plan_id),
        doc_id: this.plan.doc_id,
        work_plan_name: this.plan.work_plan_name
      };
      this.planService.reApprovePlan(data).then((response) => {
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
      this.$router.push({name: 'DocSignaturesInfo', params: {docIdParam: this.plan.doc_id}})
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
}
</style>
