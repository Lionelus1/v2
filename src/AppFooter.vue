<template>
  <div class="layout-footer">
    <div class="block sm:flex justify-content-between">
      <span class="footer-text no-print" style="margin-right: 5px">&copy; {{ $t("common.orgname") }}</span>
      <a class="flex align-items-center mt-2 sm:mt-0" href="https://t.me/smartenu_chat" target="_blank">
        <i class="fa-brands fa-telegram mr-2" style="font-size: 22px;cursor: pointer"></i>
        <span>Smart.ENU Chat</span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppFooter"
}
</script>

<style scoped>

@media print {
  .no-print, .no-print * {
    display: none !important;
  }
}

@media print {
  .show-print, .show-print * {
    display: block !important;
    width: 100% !important;
  }
}

</style>
