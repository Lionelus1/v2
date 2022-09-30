<template>
	<div class="layout-footer">
		<span class="footer-text no-print" style="margin-right: 5px">@ {{$t("common.orgname")}}</span>


	</div>
</template>

<script>
	export default {
		name: "AppFooter"
	}
</script>

<style scoped>

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