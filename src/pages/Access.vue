<template>
    <div >
        <div class="p-fluid p-formgrid grid p-jc-center p-pt-2" style="min-width:80%">
            <div class="col-12 p-mt-5 p-xl:mt-0 text-center">
                <img src="assets/layout/images/logo.svg" class="p-mb-5" style="width:140px; ">
            </div>
            <div class="col-12 p-xl:col-6" >
                <div class="p-h-100 p-w-100 p-m-0 py-7 px-4" >
                    <div class="grid p-jc-center text-center">
                        
                        <h1 class="text-900 font-bold text-4xl lg:text-5xl mb-2">{{$t("common.accessDenied")}}</h1>
                        <span class="text-600 text-center">{{$t("common.message.accessDeniedAdmin")}}</span><br/>
                        <img src="assets/layout/images/asset-access.svg" :alt="$t('common.accessDenied')" class="mt-5" width="80%">
                        <div class="col-12 mt-5 text-center">
                            <i class="pi pi-fw pi-arrow-left text-blue-500 mr-2" style="vertical-align:center;"></i>
                            <router-link to="/" class="blue-500">{{$t('common.home')}}</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Avatar from 'primevue/avatar';

export default {
    //components: {Avatar}   
}
</script>
