<template>
    <div>
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em" />
        <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
        <div v-if="accessDenied" class="p-fluid">
            <h5>{{$t('common.message.accessDenied')}}</h5>
        </div>
        <div v-if="!accessDenied" class="p-fluid">
            <h5>{{$t('common.doc')}}</h5>
            <div class="field">
                <label for="state">{{$t('common.state')}}:</label>
                <div>
                    <span v-if="doc != null && doc.docHistory != null" :class="'customer-badge status-' + doc.docHistory.stateEn">{{$t('common.states.' +doc.docHistory.stateEn)}}</span> 
                </div>
            </div>
            <div class="field">
                <label>{{$t('contracts.assigner')}}:</label>
                <div>
                    <b v-if="doc != null && doc.docHistory != null && doc.docHistory.lastChanger != null">{{doc.docHistory.lastChanger.fullName}}</b>
                </div>
            </div>
            <div class="field">
                <label>{{$t('common.date')}}:</label>
                <div>
                    <b v-if="doc != null && doc.docHistory != null && doc.docHistory.setDate != null">{{getLongDateString(doc.docHistory.setDate)}}</b>
                </div>
            </div>
             <div class="field">
                <label>{{$t('common.comment')}}:</label>
                <div>
                    <Message :closable="false" v-if="doc != null && doc.docHistory != null && doc.docHistory.comment != null" severity="warn">{{doc.docHistory.comment}}</Message>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from "@/service/api";
import { getHeader, smartEnuApi, b64toBlob } from "@/config/config";
import { getLongDateString } from "@/helpers/helper";

export default {
    name: "DocInfo",
    props: {
        ID: {
            type: Number,
            default: null
        },
    },
    data() {
        return {
            docID: Number(this.$route.params.id),
            doc: null,
            loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
            loading: false,
            accessDenied: false,
        }
    },
    created() {
        if (!this.docID) {
            this.docID = this.ID
        }
        this.getData();
    },
    methods: {
        getLongDateString: getLongDateString,
        getData() {
        let url = "/agreement/get";
        var req = { id: this.docID };
        this.loading = true
        api
            .post(url, req, { headers: getHeader() })
            .then((res) => {
                this.loading = false
                this.doc = res.data;
            })
            .catch((error) => {
                this.loading = false
                if (error.response && error.response.status == 401) {
                    this.$store.dispatch("logLout");
                } else if (error.response && error.response.status == 405 && error.response.data && error.response.data.error === 'accessDenied') {
                    this.accessDenied = true
                }
            });
        }
    }
}
</script>
