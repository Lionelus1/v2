<template>
  <div ref="qrToPdf" class="grid">
    <h5 class="col-6 p-offset-3 p-text-center p-text-bold">{{ title }}</h5>
    <br/>
    <div class="col-12">
      <div id="qr" v-for="(item, index) of signatures" :key="index"
           style="border: 1px solid #000; padding: 5px; margin: 5px;display: block;">
        <p v-if="item.user"><b>{{ item.user.fullName }}</b> <!--({{ $t('ncasigner.IIN') }} <em>{{ item.user.IIN }}</em>)-->
          <br/> {{ item.sign && item.sign.length > 0 ? $t('ncasigner.signed') + ": " + new Date(item.signDate).toLocaleDateString() + ", " + new Date(item.signDate).toLocaleTimeString()  : $t('ncasigner.signingexpected') }}
        </p>
        <div style="width: 100%;text-align: left;">
          <qrcode-vue v-for="(i, ind) of item.sign" :key="ind" size="300" render-as="svg" margin="2" :value="i"></qrcode-vue>
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
  props: ['title', 'signatures']
}
</script>

<style scoped>

</style>