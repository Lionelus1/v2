<template>
  <div class="grid">
    <div class="col-12">
      <h3>{{ $t('common.verify') }}</h3>
    </div>
  </div>
  <div>
    <Menubar style="height:36px;margin-top:-7px;margin-left:-7px;margin-right:-7px">
      <template #end>
        <Button class="p-button-text"
                :label="$t('verification.new')"
                icon="pi pi-refresh"
                :disabled="verificationEnd === false"
                :onclick="refresh"/>
      </template>
    </Menubar>
  </div>
  <div class="col-12 md:col-12 p-fluid" v-if="verificationEnd === false">
    <div class="field">
      <Panel>
        <template #header>
          <div>
            <h5>
              <b>{{$t('verification.uploadEdoc') }}</b>
            </h5>
            <InlineMessage severity="warn"
                           class="mt-2">
              {{$t('verification.uploadEdocTitle')}}
            </InlineMessage>
          </div>
        </template>
        <FileUpload
            class="mt-2"
            style="display:flex"
            mode="basic"
            :customUpload="true"
            @uploader="uploadCmsOrZip($event)"
            :auto="true"
            :accept="'.cms,.CMS,.zip'"
            v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="cmsOrZip">
          {{ $t('ncasigner.chosenFile', {fn: cmsOrZip ? cmsOrZip.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.cmsOrZip"
        >{{ $t("common.requiredField") }}</small>
      </Panel>
      <hr>
    </div>
    <div v-if="attached === false" class="field" >
      <Panel>
        <template #header>
          <div>
            <h5><b>{{ $t('verification.uploadMainDoc') }}</b></h5>
            <InlineMessage severity="warn"
                           class="mt-2">
              {{$t('verification.notDataAttachedTitle') }}
            </InlineMessage>
          </div>
        </template>
        <FileUpload
            class="mt-2"
            style="display:flex"
            mode="basic"
            :customUpload="true"
            @uploader="uploadFile($event)"
            :auto="true"
            v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="file">
          {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.file"
        >{{ $t("common.requiredField") }}</small>
      </Panel>
      <!--      <hr>-->
    </div>

    <div class="field" v-if="attached === true">
      <InlineMessage severity="success"
                     class="mt-2">
        {{$t('verification.successfulVerifying') }}
      </InlineMessage>
    </div>
    <div class="field">
      <Button class="mt-2 p-button-secondary"
              v-if="attached === undefined"
              :label="$t('verification.checkDataAttaching')"
              icon="pi pi-check"
              :onclick="checkDataAttaching"/>
      <Button class="mt-2 p-button-success"
              v-if="attached !== undefined"
              severity="success"
              :label="$t('ncasigner.verify')"
              icon="pi pi-check"
              :onclick="verify"/>
      <hr>
    </div>
  </div>
  <div class="col-12 md:col-12 p-fluid" v-if="verificationEnd === true">
    <div class="field">
      <TreeTable :value="resultNodes" show-gridlines>
        <Column field="name" expander>
          <template #body="slotProps">
            <b>{{ slotProps.node.data.name }}</b>
          </template>
        </Column>
        <Column field="state">
          <template #body="slotProps">
            <span v-if="slotProps.node.data.status === true
            || slotProps.node.data.status === false
            || slotProps.node.data.status === null" :class="'verify-status ' + slotProps.node.data.status">
              <b>{{ slotProps.node.data.state }}</b>
            </span>
            <span v-if="slotProps.node.data.status === undefined">
              <b>{{ slotProps.node.data.state }}</b>
            </span>
          </template>
        </Column>
      </TreeTable>
    </div>
  </div>
</template>

<script>
import {getHeader, smartEnuApi} from "../config/config";
import { DocService } from "@/service/doc.service";
export default {

  name: "DocSignatureVerification",
  data() {
    return {
      attached: undefined,
      file: null,
      cmsOrZip: null,
      verificationEnd: false,
      resultNodes: [],
      validation: {
        cmsOrZip: false,
        file: false
      },
      docService: new DocService()
    }
  },
  mounted() {
  },
  methods: {
    uploadFile(event) {
      this.file = event.files[0]
    },
    uploadCmsOrZip(event) {
      this.attached = undefined
      this.cmsOrZip = event.files[0]
    },
    refresh() {
      this.file = null
      this.cmsOrZip = null
      this.attached = undefined
      this.verificationEnd = false
    },
    validateForm() {
      if (this.attached === undefined || this.attached === true) {
        this.validation.cmsOrZip = !this.cmsOrZip || this.cmsOrZip == ""
        return (!this.validation.cmsOrZip)
      } else if (this.attached === false) {
        this.validation.cmsOrZip = !this.cmsOrZip || this.cmsOrZip == ""
        this.validation.file = !this.file || this.file == ""
        return (
            !this.validation.cmsOrZip &&
            !this.validation.file
        )
      }
    },
    checkDataAttaching() {
      if (this.validateForm()) {
        const formData = new FormData();
        formData.append("cms", this.cmsOrZip)
        this.docService.checkDataAttaching(formData).then((response) => {
              let result = response.data
              if (result.success) {
                this.attached = true
              } else {
                if (result.errorMessage) {
                  this.$toast.add({
                    severity: "error",
                    summary: this.$t(result.errorMessage),
                    life: 3000,
                  });
                } else {
                  this.attached = false
                }
              }
            }).catch((error) => {
            console.error(error);
        });
      }
    },
    verify() {
      if (this.validateForm()) {
        const formData = new FormData();
        formData.append("mainFile", this.file)
        formData.append("cms", this.cmsOrZip)
        this.docService.docVerify(formData).then((response) => {
              let totalResult = response.data
              console.log(totalResult)
              if (totalResult.success === true) {
                let result = totalResult.verificationResults
                let nodes = []
                for (let key in result) {
                  let certificateVerification = result[key].certificateVerification
                  let tspVerification = result[key].tspVerification
                  let signatureVerification = result[key].signatureVerification
                  let state = certificateVerification.success && signatureVerification.success
                  let totalState = tspVerification.success == null ? state : state && tspVerification.success
                  let node = {
                    key: key.toString(),
                    data: {
                      name: this.$t('verification.signerNameTitle') + result[key].name,
                      state: totalState ? this.$t('verification.statusTitle') + this.$t('verification.trueVerify')
                          : this.$t('verification.statusTitle') + this.$t('verification.falseVerify'),
                      status: totalState,
                    },
                    children: []
                  }
                  let index = 0;
                  let certificateVerificationChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.resultTitle'),
                      state: certificateVerification.success ? this.$t('verification.trueVerify')  : this.$t(certificateVerification.errorMessage),
                      status: certificateVerification.success
                    },
                  }
                  node.children.push(certificateVerificationChild)
                  let tspVerificationChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.tspTitle') ,
                      state: tspVerification.success !== null && tspVerification.success ? this.$t('verification.trueVerify')  : this.$t(tspVerification.errorMessage),
                      status: tspVerification.success
                    },
                  }
                  node.children.push(tspVerificationChild)
                  let signatureVerificationChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.signatureTitle') ,
                      state: signatureVerification.success ? this.$t('verification.trueVerify')  : this.$t(signatureVerification.errorMessage),
                      status: signatureVerification.success
                    },
                  }
                  node.children.push(signatureVerificationChild)
                  let iinChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.iin'),
                      state: result[key].iin,
                      status: undefined
                    },
                  }
                  node.children.push(iinChild)
                  let nameChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.fio'),
                      state: result[key].name,
                      status: undefined
                    },
                  }
                  node.children.push(nameChild)
                  if (result[key].bin !== null) {
                    let binChild = {
                      key: key + '-' + index++,
                      data: {
                        name: this.$t('verification.bin'),
                        state: result[key].bin,
                        status: undefined
                      },
                    }
                    node.children.push(binChild)
                  }

                  if (result[key].companyName !== null) {
                    let companyNameChild = {
                      key: key + '-' + index++,
                      data: {
                        name: this.$t('verification.company'),
                        state: result[key].companyName,
                        status: undefined
                      },
                    }
                    node.children.push(companyNameChild)
                  }
                  let serialNumberChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.serialNumber'),
                      state: result[key].serialNumber,
                      status: undefined
                    },
                  }
                  node.children.push(serialNumberChild)
                  let periodChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.validity'),
                      state: result[key].period,
                      status: undefined
                    },
                  }
                  node.children.push(periodChild)
                  let templateChild = {
                    key: key + '-' + index++,
                    data: {
                      name: this.$t('verification.template'),
                      state: this.$t('verification.' + result[key].right),
                      status: undefined
                    },
                  }
                  node.children.push(templateChild)
                  if (result[key].signDate !== null) {
                    let signDateChild = {
                      key: key + '-' + index++,
                      data: {
                        name: this.$t('verification.signDate'),
                        state: result[key].signDate,
                        status: undefined
                      },
                    }
                    node.children.push(signDateChild)
                  }
                  nodes.push(node)
                }
                this.resultNodes = nodes
                this.verificationEnd = true
                console.log(this.resultNodes)
              } else {
                this.$toast.add({
                  severity: "error",
                  summary: this.$t(totalResult.errorMessage),
                  life: 3000,
                });
              }
            }).catch((error) => {
          console.error(error);
        });
      }
    }
  }
}
</script>

<style scoped lang="scss">
.verify-status {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
}

.verify-status.true {
  background-color: #C8E6C9;
  color: #256029;
}

.verify-status.false {
  background-color: #FFCDD2;
  color: #C63737;
}
.verify-status.null {
  background-color: #fae9b6;
  color: #bb7500;
}
</style>
