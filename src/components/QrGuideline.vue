<template>
  <div class="p-fluid grid formgrid">
    <div class="field col-12 text-center">
      <h5><b>{{ $t('mgov.guidelineLabel') }}</b></h5>
    </div>
    <div class="col-12 lg:col-4">
      <div>
        <img src="../assets/layout/images/mgov_1.png" alt="mgov_1" style="width: 100%; height: 100%"/>
      </div>
      <div class="text-center">
        <b>{{ $t('mgov.stepOne') }}</b>
      </div>
    </div>
    <div class="col-12 lg:col-4">
      <div>
        <img src="../assets/layout/images/mgov_2.png" alt="mgov_2" style="width: 100%; height: 100%"/>
      </div>
      <div class="text-center">
        <b>{{ $t('mgov.stepTwo') }}</b>
      </div>
    </div>
    <div class="col-12 lg:col-4">
      <div>
        <img src="../assets/layout/images/mgov_3.png" alt="mgov_3" style="width: 100%; height: 100%"/>
      </div>
      <div class="text-center">
        <b>{{ $t('mgov.stepThree') }}</b>
      </div>
    </div>
    <div class="field col-12">
      <hr>
    </div>
    <div class="field col-12 text-center">
      <b style="color: royalblue"><em>{{ $t('mgov.mobileAppNotInstalled') }}:</em></b>
    </div>
    <div class="field col-12">
      <hr>
    </div>
    <div class="col-12 lg:col-4">
      <div class="p-fluid text-center">
        <b>eGov Mobile</b>
      </div>
      <div class="p-fluid text-center">
        <qrcode-vue size="200" render-as="svg" margin="2" :value="eGovMobileLink"></qrcode-vue>
      </div>
    </div>
    <div class="col-12 lg:col-4">
      <div class="p-fluid text-center">
        <b>eGov Business (App Store)</b>
      </div>
      <div class="p-fluid text-center">
        <qrcode-vue size="200" render-as="svg" margin="2" :value="eGovBusinessAppStoreLink"></qrcode-vue>
      </div>
    </div>
    <div class="col-12 lg:col-4">
      <div class="p-fluid text-center">
        <b>eGov Business (Play Market)</b>
      </div>
      <div class="p-fluid text-center">
        <qrcode-vue size="200" render-as="svg" margin="2" :value="eGovBusinessAndroidLink"></qrcode-vue>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: this.isVisible,
      eGovMobileLink: "https://egovmobile.page.link/install",
      eGovBusinessAppStoreLink: "https://apps.apple.com/kz/app/egov-business/id1597880144",
      eGovBusinessAndroidLink: "https://play.google.com/store/apps/details?id=kz.mobile.mgov.business",
    }
  },
}
</script>

<style scoped>

</style>
<script setup>
import QrcodeVue from "qrcode.vue";
</script>
