<template>
    <div >
        <div class="p-fluid justify-content-center" style="min-width:80%">
            <div v-if="mode !== 'short'" class="col-12 mt-0 p-xl:mt-0 text-center mb-0">
                <img src="assets/layout/images/logo.svg" style="width:140px; ">
            </div>
            <div class="col-12 p-xl:col-6 mb-0" >
                <div class=" w-full m-0 py-0 px-4" >
                    <div class="flex-wrap justify-content-center text-center">
                        <h1 class="text-900 font-bold text-4xl lg:text-5xl">{{$t("common.accessDenied")}}</h1><br/>
                        <span v-if="mode !== 'short'" class="text-600 text-center">{{$t("common.message.accessDeniedAdmin")}}</span><br/>
                        <span v-if="mode === 'short'" class="text-600 text-center">{{$t("common.message.accessDenied")}}</span><br/>
                        <img src="assets/layout/images/asset-access.svg" :alt="$t('common.accessDenied')" class="mt-2 w-100">
                        <div class="col-12 mt-1 text-center">
                            <i class="pi pi-fw pi-arrow-left text-blue-500 mr-2" style="vertical-align:center;"></i>
                            <router-link v-if="!returnLink || mode !== 'short'" to="/" class="blue-500">{{$t('common.home')}}</router-link>
                            <router-link v-else :to="returnLink" class="blue-500">{{$t('common.returnLink')}}</router-link>
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
    props: {
        mode: null, // 'standard' (or null), 'short'
        returnLink: null,
    }
}
</script>
