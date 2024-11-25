<template>
  <div ref="qrToPdf" class="grid">
    <h5 class="col-6 p-offset-3 text-center bold">{{ title }}</h5>
    <br/>
    <div class="col-12">
      <h5 v-if="signatures && signatures.length > 0">
        {{ $t('common.signers') }}
      </h5>
      <div id="qr" v-for="(item, index) of signatures" :key="index"
           style="border: 1px solid #000; padding: 5px; margin: 5px;display: block;">
        <p v-if="item.user"><b>{{ item.user.fullName }}</b> <!--({{ $t('ncasigner.IIN') }} <em>{{ item.user.IIN }}</em>)-->
          <br/> {{ item.sign && item.sign.length > 0 ? $t('ncasigner.signed') + ": " + new Date(item.signDate).toLocaleDateString() + ", " + new Date(item.signDate).toLocaleTimeString()  : $t('ncasigner.signingexpected') }}
        </p>
        <div class="field">
          <Button v-if="item.sign && item.sign.length > 0" :label="$t('common.downloadCms')" icon="pi pi-download" @click="this.emitter.emit('downloadCMS', item.id)"
                  class="p-button-secondary ml-1"/>
        </div>
        <div style="width: 100%;text-align: left;">
          <qrcode-vue v-for="(i, ind) of item.sign" :key="ind" size="300" render-as="svg" margin="2" :value="i"></qrcode-vue>
        </div>   
      </div>
      <div v-if="showSign">
        <h5 v-if="approvalStages">
          {{ $t('common.approvals') }}
        </h5>
        <div id="stage" v-for="(stage, stageInd) of approvalStages" :key="stageInd">
          <h5> {{ stage.stage.toString() + '. ' + (stage['title'+$i18n.locale[0].toUpperCase() + $i18n.locale.slice(1)] ? 
            stage['title'+$i18n.locale[0].toUpperCase() + $i18n.locale.slice(1)] : '')}} </h5>
          <div id="qr" v-for="(user, userInd) of stage.users" :key="userInd"
            style="border: 1px solid #000; padding: 5px; margin: 5px;display: block;">
            <p>
              <b> {{ user.fullName }} </b>
              <br/> {{ stage.usersApproved && stage.usersApproved[userInd] == 1 ? stage.certificate.value === "no_signature"  ? $t('ncasigner.confirmed') : $t('ncasigner.approved')  + getStageSignaturesDate(stage.signatures, userInd) :   stage.certificate.value === "no_signature"
                ? $t('ncasigner.approvingСonfirmation')
                : (stage.usersApproved && stage.usersApproved[userInd] == 1
                    ? $t('ncasigner.approved') + getStageSignaturesDate(stage.signatures, userInd)
                    : $t('ncasigner.approvingExpected')) }}
            </p>
            <div v-if="stage.signatures" style="width: 100%;text-align: left;">
              <qrcode-vue v-for="(i, ind) of stage.signatures[userInd].sign" :key="ind" size="300" render-as="svg" margin="2" :value="i"></qrcode-vue>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";

export default {
  name: "SignatureQrPdf",
  components: {QrcodeVue},
  props: {
    title: null,
    signatures: null,
    approvalStages: null,
    showSign: null,
  },
  methods: {
    getStageSignaturesDate(signatures, userInd) {
      if (signatures) {
        return ": " + new Date(signatures[userInd].signDate).toLocaleDateString() + ", " + new Date(signatures[userInd].signDate).toLocaleTimeString()
      }

      return ""
    }
  }
}
</script>

<style scoped>

</style>
