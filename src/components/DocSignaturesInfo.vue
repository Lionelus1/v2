<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 0.5em" />
    <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  </div>
  <div>
    <ProgressBar v-if="signing" mode="indeterminate" style="height: 0.5em" />
    <BlockUI :blocked="signing" :fullScreen="true"></BlockUI>
  </div>
  <div v-if="!loading">
    <DocInfo :document="docInfo" v-if="!incorrect" :docID="doc_id" />
    <TabView v-model:activeIndex="active" @tab-change="tabChanged">
      <TabPanel v-bind:header="$t('ncasigner.signatureListTitle')">
        <div class="col-12" v-if="isShow">
          <Button v-if="(signatures && signatures.length > 0) ||
      (approvalStages && showSign())
      " :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download" @click="downloadSignatures" class="p-button ml-2" />
          <SignatureQrPdf ref="qrToPdf" :showSign="showSign()" :signatures="signatures" :title="docInfo.name" :approvalStages="approvalStages"></SignatureQrPdf>
        </div>
        <div class="col-12" v-else>
          <div class="card">
            <Message severity="error">{{
      $t("common.message.accessDenied")
    }}</Message>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('ncasigner.goToDoc')" :disabled="!isShow">
        <div class="card" v-for="(item, index) of files" :key="index">
          <embed :src="item" style="width: 100%; height: 1000px" v-if="files.length > 0" type="application/pdf" />
        </div>
      </TabPanel>
      <TabPanel v-if="docInfo && docInfo.docHistory.stateId == 2 && docInfo.folder && docInfo.folder.type === Enum.FolderType.Agreement
      && docInfo.docType === Enum.DocType.Contract" :header="$t('ncasigner.sign')">
        <div class="flex justify-content-center">
          <Button icon="fa-solid fa-check" class="p-button-success md:col-3" @click="approve" :label="$t('common.action.approve')" :loading="loading" :disabled="hideDocApprove" />
        </div>
      </TabPanel>
      <TabPanel v-if="docInfo && docInfo.docHistory.stateId == 2 && !(docInfo.folder && docInfo.folder.type === Enum.FolderType.Agreement
      && docInfo.docType === Enum.DocType.Contract) || docInfo && docInfo.docHistory.stateId == 6" :disabled="hideDocSign" :header="$t('ncasigner.sign')">
        <div class="mt-2">
          <Panel v-if="!$isMobile">
            <template #header>
              <InlineMessage severity="info">{{
      $t("ncasigner.noteMark")
    }}</InlineMessage>
            </template>
            <div class="flex justify-content-center">
              <Button icon="pi pi-user-edit" :disabled="hideDocSign" class="p-button-primary md:col-5" @click="sign" :label="$t('ncasigner.sign')" :loading="signing" />
            </div>
          </Panel>
          <div class="mt-2">
            <Panel>
              <template #header>
                <div class="d-flex justify-content-center">
                  <InlineMessage v-if="$isMobile" severity="info" class="mb-1">{{ $t("ncasigner.noteMark") }}</InlineMessage>
                  <InlineMessage class="" severity="info">{{
      $t("ncasigner.qrSinging")
    }}</InlineMessage>
                </div>
              </template>
              <div class="text-center">
                <h6>
                  <b>{{ $t("mgov.inApp") }}</b>
                  <b style="color: red">{{ mobileApp }}</b>
                </h6>
              </div>
              <div v-if="mgovMobileRedirectUri && isIndivid">
                <hr />
              </div>
              <div v-if="mgovMobileRedirectUri && isIndivid" class="text-center">
                <Button class="p-button-outlined" :label="$t('common.mgovMobile')" @click="redirectToMgovMobile" />
              </div>
              <div v-if="mgobBusinessRedirectUri && !isIndivid">
                <hr />
              </div>
              <div v-if="mgobBusinessRedirectUri && !isIndivid" class="text-center">
                <Button class="p-button-outlined" :label="$t('common.mgovBusiness')" @click="redirectToMgovBusiness" />
              </div>
              <div v-if="mgovSignUri && !$isMobile" class="d-flex justify-content-center">
                <qrcode-vue size="350" render-as="svg" margin="2" :value="mgovSignUri"></qrcode-vue>
              </div>
              <QrGuideline class="mt-2" />
            </Panel>
          </div>
        </div>
      </TabPanel>
      <TabPanel v-if="docInfo && docInfo.docHistory.stateId === Enum.INAPPROVAL.ID && ((docInfo.sourceType === Enum.DocSourceType.FilledDoc ||
      (docInfo.docType && (docInfo.docType === Enum.DocType.Contract))) || docInfo.docType === Enum.DocType.WorkPlan
      || docInfo.docType === Enum.DocType.DocTemplate || docInfo.docType === Enum.DocType.DT_Request || docInfo.docType === Enum.DocType.ScienceWorksList)" :header="$t('common.revision')" :disabled="hideDocRevision">
        <div class="card">
          <label> {{ this.$t("common.comment") }} </label>
          <InputText v-model="revisionComment" style="width: 100%; margin-bottom: 2rem"></InputText>
          <div class="flex justify-content-center">
            <Button icon="fa-regular fa-circle-xmark" class="p-button-danger md:col-3" @click="revision" :label="$t('common.revision')" :loading="loading" />
          </div>
        </div>
      </TabPanel>
      <TabPanel v-if="docInfo && (docInfo.docHistory.stateId == 2 || docInfo.docHistory.stateId == 6)
      && docInfo.folder && docInfo.folder.type === Enum.FolderType.Agreement &&
      isSciadvisor()" :header="$t('common.deny')">
        <label> {{ this.$t('common.comment') }} </label>
        <InputText v-model="denyComment" style="width: 100%; margin-bottom: 2rem;"></InputText>
        <div class="flex justify-content-center">
          <Button icon="fa-regular fa-circle-xmark" class="p-button-danger md:col-3" @click="deny" :label="$t('common.deny')" :loading="loading" />
        </div>
      </TabPanel>
      <TabPanel v-if="docInfo && docInfo.docHistory.stateId == 2
      && docInfo.folder && docInfo.folder.type === Enum.FolderType.Agreement &&
      isSciadvisor()" :header="$t('common.changeApprovals')" :disabled="currentApprovalUsersLoading">
        <div class="p-fluid mb-3">
          <FindUser :userType="0" searchMode="local" v-model="currentApprovalUsers"></FindUser>
        </div>
        <div class="flex justify-content-center">
          <Button icon="fa-solid fa-user-check" class="p-button-success md:col-3" @click="changeApprovals" :label="$t('common.change')" :loading="loading"
            :disabled="currentApprovalUsers.length < 1" />
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script>
import SignatureQrPdf from "@/components/ncasigner/SignatureQrPdf";
import {
  runNCaLayer,
  makeTimestampForSignature,
} from "@/helpers/SignDocFunctions";

import api from "@/service/api";
import {
  getHeader,
  smartEnuApi,
  socketApi,
  b64toBlob,
  findRole,
} from "@/config/config";
import html2pdf from "html2pdf.js";
import DocInfo from "@/components/ncasigner/DocInfo";
import QrcodeVue from "qrcode.vue";
import Enum from "@/enum/docstates/index";
import RolesEnum from "@/enum/roleControls/index";
import QrGuideline from "./QrGuideline.vue";
import { DocService } from "@/service/doc.service";
import {isArray} from "chart.js/helpers";

export default {
  name: "DocSignaturesInfo",
  components: { QrGuideline, SignatureQrPdf, DocInfo, QrcodeVue },
  props: {
    docIdParam: {
      type: String,
      default: null,
    },
    signerIinParam: {
      type: String,
      default: null,
    },
    showAllSignsParam: {
      type: Boolean,
      default: false,
    },
    /**
     * Парамер метки времени
     * default - false. Метка времени отключена.
     * Для того, чтобы поставить метку времени надо задать значение true.
     */
    tspParam: {
      type: Boolean,
      default: false,
    },
  },
  // emits: ['sentToRevision'],
  data() {
    return {
      service: new DocService(),

      signatures: null,
      approvalStages: null,
      plan: null,
      doc_id: null,
      isTspRequired: Boolean,
      signerIin: null,
      docInfo: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser"))
        ? JSON.parse(localStorage.getItem("loginedUser")).userID
        : null,
      loginedUserForMgovws: JSON.parse(localStorage.getItem("loginedUser")),
      isShow: false,
      showAllSigns: false,
      loading: false,
      signing: false,
      file: null,
      files: [],
      active: 0,
      hideDocSign: true,
      mgovSignUri: null,
      mgovMobileRedirectUri: null,
      mgobBusinessRedirectUri: null,
      Enum: Enum,
      RolesEnum: RolesEnum,

      hideDocRevision: true,
      hideDocApprove: true,
      revisionComment: null,
      denyComment: null,
      mobileApp: null,
      isIndivid: null,

      currentApprovalStage: -1,
      currentApprovalUsers: [],
      currentApprovalUsersLoading: true,
    }
  },
  created() {
    console.log("ERHERHSKJFBN");
    if (this.docIdParam) {
      this.doc_id = this.docIdParam;
    } else {
      this.doc_id = this.$route.params.uuid;
    }

    const tokenData = JSON.parse(window.localStorage.getItem("authUser"));
    if (tokenData !== null) {
      let signUri =
        smartEnuApi +
        "/mobileSignParams/" +
        this.doc_id +
        "/" +
        tokenData.access_token;
      this.mgovSignUri = "mobileSign:" + signUri;
      this.mgovMobileRedirectUri =
        "https://mgovsign.page.link/?link=" +
        signUri +
        "?mgovSign&apn=kz.mobile.mgov&isi=1476128386&ibi=kz.egov.mobile";
      this.mgobBusinessRedirectUri =
        "https://egovbusiness.page.link/?link=" +
        signUri +
        "?mgovSign&apn=kz.mobile.mgov.business&isi=1597880144&ibi=kz.mobile.mgov.business";
    }
    this.isTspRequired = this.tspParam;
    this.signerIin = this.signerIinParam;
    this.showAllSigns = this.showAllSignsParam;
    this.getData();
  },
  mounted() {
    console.log("HERE1");
    this.wsconnect();
    console.log("HERE2");
    this.emitter.on("downloadCMS", (data) => {
      if (data !== null) {
        api
          .post(
            smartEnuApi + "/doc/downloadCms",
            { documentUuid: this.doc_id, signatureId: data },
            { headers: getHeader() }
          )
          .then((res) => {
            console.log(res.data);
            let result = res.data;
            var link = document.createElement("a");
            link.innerHTML = "Download file";
            link.download = result.fileName;
            link.href = result.data;
            link.click();
          })
          .catch((error) => {
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          });
      }
    });
  },
  methods: {
    findRole: findRole,
    b64toBlob: b64toBlob,
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000,
      });
    },
    redirectToMgovMobile() {
      window.open(this.mgovMobileRedirectUri);
    },
    redirectToMgovBusiness() {
      window.open(this.mgobBusinessRedirectUri);
    },
    tabChanged() {
      if (this.active == 1 && this.files.length < 1) {
        // showFileTab
        if (this.docInfo.isManifest === true) {
          api
            .post(
              "/downloadManifestFiles",
              {
                docId: this.docInfo.id,
              },
              {
                headers: getHeader(),
              }
            )
            .then((response) => {
              let filesBase64Array = response.data;
              for (let i = 0; i < filesBase64Array.length; i++) {
                this.files.push(this.b64toBlob(filesBase64Array[i]));
              }
            });
        } else {
          api
            .post(
              "/downloadFile",
              {
                filePath: this.docInfo.filePath,
              },
              {
                headers: getHeader(),
              }
            )
            .then((response) => {
              this.files.push(this.b64toBlob(response.data.file));
            });
        }
      } else if (this.active == 2 && this.loginedUserId === null) {
        this.$store.dispatch("solveAttemptedUrl", this.$route);
        this.$router.push({ path: "/login" });
      }
    },
    getData() {
      this.loading = true;
      api
        .post(
          `/agreement/getSignInfo`,
          {
            doc_uuid: this.doc_id,
          },
          {
            headers: getHeader(),
          }
        )
        .then((res) => {
          if (res.data) {
            this.docInfo = res.data;
            this.signatures = res.data.signatures;

            if (this.showAllSignsParam) {
              this.isShow = true;
            } else {
              this.isShow =
                this.findRole(null, RolesEnum.roles.CareerModerator) ||
                this.findRole(null, RolesEnum.roles.UMKAdministrator) ||
                this.findRole(null, RolesEnum.roles.Accountant) ||
                  this.findRole(null, RolesEnum.roles.DormitoryAdministration) ||
                (this.findRole(null, RolesEnum.roles.Teacher) &&
                  this.docInfo.docType === Enum.DocType.Contract) ||
                (this.signatures &&
                  this.signatures.some(
                    (x) => x.userId === this.loginedUserId
                  )) ||
                (this.findRole(
                  null,
                  RolesEnum.roles.OnlineCourseAdministrator
                ) &&
                  this.docInfo.docType === Enum.DocType.DT_Request) ||
                this.docInfo.docHistory.setterId === this.loginedUserId ||
                this.docInfo.creatorID === this.loginedUserId;
            }

            if (this.signatures) {
              this.hideDocSign = !this.signatures.some(
                (x) =>
                  x.userId === this.loginedUserId &&
                  (!x.signature || x.signature === "")
              );
              this.hideDocRevision = !this.signatures.some(
                (x) =>
                  x.userId === this.loginedUserId &&
                  (!x.signature || x.signature === "")
              );

              let usersign = this.signatures.filter(
                (x) =>
                  x.userId === this.loginedUserId &&
                  (!x.signature || x.signature === "") &&
                  x.signRight &&
                  x.signRight !== ""
              );
              if (usersign.length !== 0) {
                if (usersign[0].signRight === "individual") {
                  this.mobileApp = "eGov Mobile";
                  this.isIndivid = true;
                } else {
                  this.mobileApp = "eGov Business";
                  this.isIndivid = false;
                }
              }
              this.signatures.map((e) => {
                e.sign = this.chunkString(e.signature, 1200);
              });
            }

            if (
              this.docInfo.needApproval ||
              this.docInfo.sourceType === this.Enum.DocSourceType.FilledDoc
            ) {
              this.approvalStages = res.data.approvalStages;

              if (
                !this.showAllSignsParam &&
                !this.isShow &&
                this.approvalStages
              ) {
                for (let element of this.approvalStages) {
                  this.isShow =
                    this.isShow ||
                    (element.users &&
                      element.users.some(
                        (x) => x.userID === this.loginedUserId
                      ));
                  if (this.isShow) {
                    break;
                  }
                }
              }

              if (this.approvalStages) {
                for (let element of this.approvalStages) {
                  if (!element.signatures) {
                    continue;
                  }

                  if (this.hideDocSign) {
                    this.hideDocSign = !element.signatures.some(
                      (x) =>
                        x.userId === this.loginedUserId &&
                        (!x.signature || x.signature === "")
                    );
                  }

                  if (this.hideDocRevision) {
                    this.hideDocRevision = !element.signatures.some(
                      (x) =>
                        x.userId === this.loginedUserId &&
                        (!x.signature || x.signature === "")
                    );
                  }
                }
              }

              if (this.approvalStages)
                this.approvalStages.map((stage) => {
                  if (stage.signatures)
                    stage.signatures.map((e) => {
                      e.sign = this.chunkString(e.signature, 1200);
                    });
                });
            }

            if (
              this.docInfo.docType ===
              this.Enum.DocType.PostAccreditationMonitoringReport
            ) {
              this.isShow = true;
            }

            if (this.docInfo.docType === this.Enum.DocType.ScienceWorks || this.docInfo.folder && this.docInfo.folder.type === Enum.FolderType.Agreement) {
              this.getDocNew();
            }
          }

          this.loading = false;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.$store.dispatch("logLout");
          } else if (error.response && error.response.status === 403) {
            this.$store.dispatch("solveAttemptedUrl", this.$route);
            this.$router.push({ path: "/login" });
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
    showSign() {
      let showSign = false;

      if (
        this.docInfo &&
        this.docInfo.docHistory &&
        this.docInfo.docHistory.stateId &&
        this.docInfo.docHistory.stateId > this.Enum.CREATED.ID
      ) {
        showSign = true;
      }

      return showSign;
    },
    sign() {
      this.signing = true;
      api
        .post(
          "/downloadFile",
          {
            filePath: this.docInfo.filePath,
          },
          {
            headers: getHeader(),
          }
        )
        .then((response) => {
          runNCaLayer(
            this.$t,
            this.$toast,
            response.data.file,
            "cms",
            this.signerType,
            this.isTspRequired,
            this.$i18n.locale
          )
            .then((sign) => {
              if (sign !== undefined && isArray(sign)) {
                this.sendRequest(sign[0]);
              }
            })
            .catch((e) => {
              console.log(e);
              this.signing = false;
            });
        })
        .catch((error) => {
          this.signing = false;
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    sendRequest(signature) {
      var req = {
        docUUID: this.docInfo.uuid,
        sign: signature,
        signerIin: this.signerIin,
        isTspRequired: this.isTspRequired,
      };
      this.signing = true;

      api
        .post("/doc/sign", req, { headers: getHeader() })
        .then((response) => {
          this.signing = false;
          this.getData();
          this.showMessage(
            "success",
            this.$t("ncasigner.signDocTitle"),
            this.$t("ncasigner.success.signSuccess")
          );
        })
        .catch((error) => {
          this.signing = false;
          if (error.response.status == 405) {
            this.$toast.add({
              severity: "error",
              summary: this.$t(error.response.data),
              life: 3000,
            });
          }
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else this.signing = false;
        });
    },
    getSignatures() {
      api
        .post(
          `/workPlan/getSignatures`,
          { doc_id: this.plan.doc_id },
          { headers: getHeader() }
        )
        .then((res) => {
          if (res.data) {
            this.signatures = res.data;
            const signUser = res.data.find(
              (x) => x.userId === this.loginedUserId
            );
            if (signUser) {
              this.isApproved = true;
            }
          }
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    downloadSignatures() {
      let pdfOptions = {
        margin: 10,
        image: {
          type: "jpeg",
          quality: 0.95,
        },
        html2canvas: { scale: 3, letterRendering: true },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          hotfixes: ["px_scaling"],
        },
        pagebreak: { avoid: ["#qr"] },
        filename: this.docInfo.name + ".pdf",
      };
      const pdfContent = this.$refs.qrToPdf.$refs.qrToPdf;
      html2pdf().set(pdfOptions).from(pdfContent).save();
    },
    chunkString(str, n) {
      const arr = [];
      for (let index = 0; index < str.length; index += n) {
        arr.push(str.slice(index, index + n));
      }
      return arr;
    },
    wsconnect() {
      let t = this;
      this.connection = new WebSocket(socketApi + "/mgovws");
      this.connection.onmessage = function (data) {
        let response = JSON.parse(data.data);
        if (response.result === "error") {
          t.$toast.add({
            severity: "error",
            summary: response.errorMessage,
            life: 3000,
          });
        } else if (response.result === "success") {
          t.getData();
          t.showMessage(
            "success",
            t.$t("ncasigner.signDocTitle"),
            t.$t("ncasigner.success.signSuccess")
          );
        } else if (response.result === "unsigned") {
          this.$toast.add({
            severity: "error",
            summary: t.$t(response.errorMessage),
            life: 3000,
          });
        }
      };
      this.connection.onopen = function (event) {
        t.connection.send(JSON.stringify(t.loginedUserForMgovws));
      };
    },
    revision() {
      if (this.revisionComment === null || this.revisionComment.length < 1) {
        this.$toast.add({
          severity: "error",
          detail: this.$t("common.noComment"),
          life: 3000,
        });
        return;
      }

      this.loading = true;
      api
        .post(
          `/doc/sendtorevision`,
          {
            comment: this.revisionComment,
            docID: this.docInfo.id,
          },
          {
            headers: getHeader(),
          }
        )
        .then((res) => {
          this.loading = false;
          // this.$emit('sentToRevision', this.revisionComment)
          location.reload();
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("common.message.saveError"),
            life: 3000,
          });

          this.loading = false;
        });
    },
    getDocNew() {
      this.loading = true;

      this.service.getDocumentV2({
        uuid: this.docInfo.uuid,
      }).then(res => {
        if (res.data.approvalStages) {
          for (let element of res.data.approvalStages) {
            if (this.hideDocApprove) {
              for (let i = 0; i < element.users.length; i++) {
                if (element.users[i].userID === this.loginedUserId && element.usersApproved[i] == 0) {
                  this.hideDocApprove = false;
                  break;
                }
              }
            }
          }

          for (let element of res.data.approvalStages) {
            console.log(element)
            if (!element.signatures) {
              continue;
            }

            if (this.hideDocRevision) {
              this.hideDocRevision = !element.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === ''));
            }

            if (!element.users) {
              continue;
            }

            if (this.hideDocRevision) {
              for (let i = 0; i < element.users.length; i++) {
                if (element.users[i].userID === this.loginedUserId && element.usersApproved[i] == 0) {
                  this.hideDocRevision = false;
                  break;
                }
              }
            }
          }

          for (let element of res.data.approvalStages) {
            let allUsersApproved = true;

            for (let appr of element.usersApproved) {
              if (appr === 0) {
                allUsersApproved = false;
                break;
              }
            }

            if (allUsersApproved) {
              continue;
            }

            for (let i = 0; i < element.usersApproved.length; i++) {
              if (element.usersApproved[i] === 0) {
                this.currentApprovalUsers.push(element.users[i]);
              }
            }

            this.currentApprovalStage = element.stage;
            break;
          }

          this.currentApprovalUsersLoading = false;
        }

        this.loading = false;
      })
        .catch((err) => {
          this.loading = false;

          if (err.response && err.response.status == 401) {
            this.$store.dispatch("logLout");
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath));
          } else {
            console.log(err)
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
          }
        });
    },
    approve() {
      this.$confirm.require({
        message: this.$t("common.doYouWantApprove"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          this.loading = true;

          this.service.documentApproveV2({
            uuid: this.docInfo.uuid,
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            location.reload()

            this.loading = false;
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false;
          })
        },
      });
    },
    deny() {
      if (this.denyComment === null || this.denyComment.length < 1) {
        this.$toast.add({
          severity: "error",
          detail: this.$t("common.noComment"),
          life: 3000,
        })
        return
      }

      this.loading = true
      this.service.documentDenyV2({
        comment: this.denyComment,
        uuid: this.docInfo.uuid,
      }).then(res => {
        this.loading = false
        // this.$emit('sentToRevision', this.revisionComment)
        location.reload()
      }).catch(err => {
        if (err.response.status == 401) {
          this.$store.dispatch("logLout");
        }

        this.$toast.add({
          severity: "error",
          detail: this.$t("common.message.saveError"),
          life: 3000,
        })

        this.loading = false
      })
    },
    isSciadvisor() {
      for (let id in this.docInfo.params) {
        let param = this.docInfo.params[id]
        if (param.description === 'sciadvisor') {
          if (param.value && param.value.data && param.value.data.userID === this.loginedUserId) {
            return true
          }
          break
        }
      }
      return false
    },
    changeApprovals() {
      if (this.currentApprovalUsers.length < 1) {
        return
      }

      let users = [];
      for (let i = 0; i < this.currentApprovalUsers.length; i++) {
        users.push(this.currentApprovalUsers[i].userID)
      }

      this.loading = true;

      this.service.changeCurrentStageApprovals({
        uuid: this.docInfo.uuid,
        stage: this.currentApprovalStage,
        users: users,
      }).then(res => {
        this.loading = false;

        location.reload();
      }).catch(err => {
        this.loading = false;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath));
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }
      });
    },
  }
}
</script>
<style scoped>
@media print {

  .no-print,
  .no-print * {
    display: none !important;
  }
}

@media print {

  .show-print,
  .show-print * {
    display: block !important;
    width: 100% !important;
  }
}
</style>
