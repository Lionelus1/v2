<template>
    <div>
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em" />
        <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
        <div class="p-fluid">
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
                    <b v-if="doc != null && doc.docHistory != null && doc.docHistory.setDate != null">{{doc.docHistory.setDate.replace("T", " ").replace("Z","")}}</b>
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
import axios from "axios";
import { getHeader, smartEnuApi, b64toBlob } from "@/config/config";

export default {
    name: "DocSignaturesInfo",
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
        }
    },
    created() {
        if (!this.docID) {
            this.docID = this.ID
        }
        this.getData();
    },
    methods: {
        getData() {
        let url = "/agreement/get";
        var req = { id: this.docID };
        this.loading = true
        axios
            .post(smartEnuApi + url, req, { headers: getHeader() })
            .then((res) => {
                this.loading = false
                this.doc = res.data;
            })
            .catch((error) => {
            this.loading = false
            if (error.response && error.response.status == 401) {
                this.$store.dispatch("logLout");
            }
            });
        }
    }
}
</script>
