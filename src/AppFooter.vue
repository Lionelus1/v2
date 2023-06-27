<template>
	<div class="layout-footer">
    <span class="footer-text no-print" style="margin-right: 5px">&copy; {{$t("common.orgname")}}</span>
    <span class="footer-text center tg"><a href="https://t.me/smartenu_chat" target="_blank"><i class="fa-brands fa-telegram ml-2" style="font-size: 22px;cursor: pointer"></i> Smart.ENU Chat</a></span>

	</div>
</template>

<script>
	export default {
		name: "AppFooter"
	}
</script>

<style scoped>

  .tg {
    float: right;
  }
  
  @media (max-width: 540px) {
    .tg {
      float: none;
      display: block;
    }
  }

 	@media print
    {    
        .no-print, .no-print *
        {
            display:none !important;
        }
    }
     @media print
    {    
        .show-print, .show-print *
        {
            display: block !important;
            width:100% !important;
        }
    }

</style>