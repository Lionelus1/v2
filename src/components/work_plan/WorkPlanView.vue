<template>
  <div>
    <div class="p-col-12">
      <div class="card" v-if="isApproval && !isApproved">
        <Button v-if="isApproval && !isRejected" label="Согласовать" icon="pi pi-check" @click="openApprovePlan"
                class="p-button p-button-success p-ml-2"/>
        <Button v-if="isApproval && !isRejected" label="Отменить" icon="pi pi-check" @click="openRejectPlan"
                class="p-button p-button-danger p-ml-2"/>
      </div>
      <div class="card">
        <object src="#toolbar=0" style="width: 100%; height: 1000px" v-if="source" type="application/pdf"
                :data="source"></object>
      </div>
    </div>

    <Dialog header="Отправить на корректировку" v-model:visible="showRejectPlan" :style="{width: '450px'}"
            class="p-fluid">
      <div class="p-field">
        <label>Комментарий</label>
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
import {getHeader, signerApi, smartEnuApi} from "@/config/config";
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
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.plan = JSON.parse(localStorage.getItem("workPlan"));
    this.isRejected = this.plan.is_reject;
    this.getFile();
    this.getSignatures();
    this.getWorkPlanApprovalUsers();
  },
  methods: {
    getFile() {
      axios.get(signerApi + `/documents/${this.plan.doc_id}`).then(resp => {
        axios.post(smartEnuApi + `/workPlan/getWorkPlanFile`,
            {file_path: resp.data.filePath},
            {headers: getHeader()}).then(res => {
              if (res.data) {
                this.source = `data:application/pdf;base64,${res.data}`;
                this.document = res.data;
              }
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
    getWorkPlanApprovalUsers() {
      axios.get(smartEnuApi + `/workPlan/getApprovalUsers/${parseInt(this.work_plan_id)}`)
          .then(res => {
            if (res.data) {
              this.approval_users = res.data;
              this.init();
            }
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
    getSignatures() {
      axios.get(signerApi + `/signature/signatures/${this.plan.doc_id}`, {headers: getHeader()}).then(res => {
        if (res.data) {
          this.signatures = res.data;
          const signUser = res.data.find(x => x.userId === this.loginedUserId);
          if (signUser) {
            this.isApproved = true;
          }
          console.log(this.isApproved)
        } else {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('common.noData'),
            life: 3000
          });
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
      const foundIndex = this.approval_users?.findIndex(x => x.user_id === this.loginedUserId);
      const prevObj = this.approval_users[foundIndex - 1];
      const currentObj = this.approval_users[foundIndex];
      const findUserFromSignatures = this.signatures ? this.signatures.find(x => x.userId === currentObj.user_id) : null;
      if (!prevObj) {
        this.isApproval = true;
      } else if (currentObj.stage === prevObj.stage && !findUserFromSignatures) {
        this.isApproval = true;
      } else if (prevObj.is_success) {
        this.isApproval = false;
      } else {
        this.isApproval = true;
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
        console.log("SIGNATURE IS ", this.CMSSignature)
        this.sendSignature();
      } catch (error) {
        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
      }
    },
    rejectPlan() {
      this.loading = true;
      axios.post(smartEnuApi + '/workPlan/reject', {
            work_plan_id: parseInt(this.work_plan_id),
            comment: this.rejectComment
          },
          {headers: getHeader()}
      ).then(res => {
        if (res.data.is_success) {
          this.loading = false;
          this.showRejectPlan = false;
          this.emitter.emit("planRejected", true);
          this.$router.push({ name: 'WorkPlanEvents', params: { id: this.plan.work_plan_id }});
        }
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
        this.loading = false;
      })
    },
    openRejectPlan() {
      this.showRejectPlan = true;
    },
    closeModal() {
      this.showRejectPlan = false;
    },
    sendDoc() {
      axios.post(signerApi + '/documents', {
        id: null,
        name: "test name",
      }, {headers: getHeader()}).then((response) => {
        if (response.data.id !== null || response.data.id !== '') {
          this.documentID = response.data.uuid
          this.setDocHistory(response.data)
        } else {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('ncasigner.failToSendDoc'),
            life: 3000
          });
        }
      });
    },
    setDocHistory(document) {
      axios.post(signerApi + '/documents/history', {
        id: null,
        stateId: 1,
        documentUuid: document.uuid,
        setterId: this.loginedUserId
      }, {headers: getHeader()}).then((response) => {
        if (response.data.id !== null || response.data.id !== '') {
          console.log(response.data)
          this.sendSignature(response.data)
        } else {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('ncasigner.failToSendDoc'),
            life: 3000
          });
        }
      });
    },
    sendSignature() {
      axios.post(signerApi + '/signature', {
        id: null,
        userId: this.loginedUserId,
        documentUuid: this.plan.doc_id,
        signature: this.CMSSignature
      }, {headers: getHeader()}).then((response) => {
        if (response.data === '') {
          this.$toast.add({severity: 'error', summary: this.$t('ncasigner.notEnoughRights'), life: 3000});
        } else if (response.data.id !== null || response.data.id !== '') {
          this.$toast.add({
            severity: "success",
            summary: 'Успешно!',
            life: 3000,
          });
        } else {
          this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
        }
      });
    },
  }
}
</script>

<style scoped>

</style>