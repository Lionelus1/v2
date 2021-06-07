<template>
    <div class="card signer">
                <p><b>{{fullName}}</b> ({{$t('ncasigner.IIN')}} <em>{{identifier}}</em>) {{$t('ncasigner.signed')}} {{signingDate}}</p>
                <p>{{$t('ncasigner.certTemplate')}}<u>{{oid1}}</u>, <u>{{oid2}}</u> </p>
                <p>{{$t('ncasigner.certType')}}:<u>cms</u></p>
                <Button class="p-button-text p-button-plain" type="submit"
                        v-bind:label="$t('ncasigner.exportCMS')"/>

    </div>
</template>

<script>
import {identifyOIDs} from "../../helpers/SignDocFunctions";
import axios from "axios";
import {signerApi, header} from "@/config/config";

export default {
    props:['signature'],
    data() {
        return {
            fullName: null,
            identifier: null,
            signingDate: null,
            oid1: null,
            oid2: null
        }
    },
    created() {
        this.getSignerInfo()
    },
    methods: {
        getSignerInfo() {
            axios.get(signerApi + '/signature/signer/info/' + this.signature.id, {headers: header}).then((response) => {
                if(response.data.serialNumber !== null || response.data.serialNumber !=='') {
                    console.log(response.data)
                    this.identifier = response.data.serialNumber.replace('IIN', '')
                    this.fullName = response.data.CN
                    this.signingDate = new Date(response.data.signingDate).toLocaleDateString() + ", " + new Date(response.data.signingDate).toLocaleTimeString()
                    this.oid1 = identifyOIDs(response.data.oid1)
                    this.oid2 = identifyOIDs(response.data.oid2)
                } else {
                    this.$toast.add({severity: 'warn', summary: this.$t('ncasigner.signNotFoundById'), life: 3000});
                }
            })
        }
    }
}
</script>

<style>
    .signer{
        border: 1px solid #dee2e6;
    }
</style>