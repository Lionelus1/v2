<template>
    <div>
        <div class="col-12 col-s-12">
            <Button
                id="printPageButton"
                icon="pi pi-book"
                class="p-button-info mb-0 mr-3"
                :label="$t('ref.createQr')"
                @click="ref(1)"/>

            
            <Button
            id="printPageButton"
            icon="pi pi-book"
            class="p-button-danger mb-0 mr-3"
            @click="openMail()"
            :label="$t('ref.sendMail')"/>

            <Button
                v-if="imgData.length>0"
                id="printPageButton"
                icon="pi pi-print"
                class="p-button-success mb-0 ml-6"
                @click="printRef()"/>

            <div class="p-inputgroup p-input-filled ml-0 pl-0 lg:col-4 md:col-6 p-sm-12" v-if="blobSource!=null">
                <InputText :disabled="true" :value="blobSource"/>
                <Button v-bind:label="$t('ncasigner.copy')" v-clipboard:copy="blobSource" v-clipboard:success="onCopy" v-clipboard:error="onFail" class="p-button-secondary"/>
            </div>
        </div>
        <div class="col-12 col-s-12" style="margin-left:0 !important;" v-if="writeMail">
            <BlockUI >
            <div class="lg:col-4 md:col-6 p-sm-12 text-right" style="margin-left:0 !important;">
                
                <textarea class="col-12 mb-2" 
                style="min-height:130px;"
                v-model="mailText"
                :placeholder="$t('ref.correction')"></textarea>

                <Button icon="pi pi-pencil" @click="sendMail()" 
                v-if="this.mailText.length>0"
                :loading="sending"
                :label="!sending ? $t('ref.sendMail1') : $t('ref.sendingMail')" class="p-button-success mb-0 "/>

                <Button icon="pi pi-trash" v-if="!sending" @click="clearMail()" class="p-button-danger mb-0 ml-2"/>
            </div>
            </BlockUI>
        </div>
        
        
        <div id="print-container" >
            <div class="row" style="background:#fff;">
                <div class="col-12 col-s-12">
                    <div class="col-6 col-s-12 "  style="text-align:right;"  id="qrContainer2" >
                        <img id="img" style="width:85.2px" :src="imgData" alt="QR Code" ref="image" />
                    </div>
                </div>
                <div class="col-12 col-s-12">
                    <div class="col-6 col-s-12" style="text-align:right;">
                    Бірегей нөмір {{reference.userId}}<br>
                    Берілген күні мен уақыты {{currentDate()}}
                    </div>
                </div>
                <div class="col-12 col-s-12" >
                    <div class="col-6 col-s-12" style="text-align:center;">
                        <img src="../../assets/layout/images/image2.jpg"  style="width:160.12px;height:65.12px;">
                        
                    </div>
                </div>
                <!-- <div class="col-12 col-s-12" style="padding:0;">
                    <div class="col-6 col-s-12" style="text-align:center; padding:0;">
                        <strong>
                            А Н Ы Қ Т А М А
                        </strong>
                    </div>
                </div> -->
                <div class="col-12 col-s-12">
                    <div class="col-6 col-s-12">
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Азамат(ша) <strong id="fullName">{{reference.fullName}}</strong> , іс жүзінде КЕАҚ Л.Н. Гумилев атындағы Еуразия ұлттық университетінде  жұмыс істейді.</p>

                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Құрылымдық бөлімше: Цифрлық даму және қашықтықтан оқыту департаменті / цифрлық даму секторы.</p>

                    <p style="padding-left:30px;">Лауазымы: <strong id="positionName">{{reference.positionKz}}.</strong></p>

                    <p style="padding-left:30px;">Анықтама талап етілген жерге ұсыну үшін берілді.</p>
                    </div>
                </div>
                <div class="col-12 col-s-12" style="font-size:0.7rem !important;">
                    <div class="col-6 col-s-12">
                    Осы құжат «Электрондық құжат және электрондық цифрлық қолтаңба туралы» Қазақстан Республикасының 2003 жылғы 7
                        қаңтардағы N370-ІІ Заңы 7 бабының 1 тармағына сәйкес қағаз тасығыштағы құжатпен бірдей.
                    <br><br><br>
                    Құжатқа қол қойылған: Білім алушыларға қызмет көрсету секторының эксперті 
                        Канагатова Р.Н. Л.Н. Гумилев атындағы Еуразия ұлттық университеті, Нұр-Сұлтан қаласы, тел +7(7172) 709500 ішкі 31-196.
                    </div>
                </div>
            </div>
        </div>
        <!-- <div class="card" v-if="blobSource!=null">
            <div class="grid">
                <div class="col-12">

                </div>
            </div>
            <embed :src="blobSource" style="width: 100%; height: 1000px" v-if="blobSource" type="application/pdf" />
        </div> -->
    </div>
</template>
<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import moment from 'moment'
import QRCode from "qrcode";
export default {
    name:"JobDescription",
    data(){
        return {
            css: `@media print
            {    
                #printPageButton
                {
                    display: none !important;
                }
            }
            * {
                box-sizing: border-box;
            }

            .row::after {
                content: "";
                clear: both;
                display: table;
            }

            [class*="col-"] {
                float: left;
                padding: 10px;
            }

            /* For mobile phones: */
            [class*="col-"] {
            width: 100%;
            }

            @media only screen and (min-width: 600px) {
            /* For tablets: */
            .col-s-1 {width: 8.33%;}
            .col-s-2 {width: 16.66%;}
            .col-s-3 {width: 25%;}
            .col-s-4 {width: 33.33%;}
            .col-s-5 {width: 41.66%;}
            .col-s-6 {width: 50%;}
            .col-s-7 {width: 58.33%;}
            .col-s-8 {width: 66.66%;}
            .col-s-9 {width: 75%;}
            .col-s-10 {width: 83.33%;}
            .col-s-11 {width: 91.66%;}
            .col-s-12 {width: 100%;}
            }
            @media only screen and (min-width: 768px) {
            /* For desktop: */
            .col-1 {width: 8.33%;}
            .col-2 {width: 16.66%;}
            .col-3 {width: 25%;}
            .col-4 {width: 33.33%;}
            .col-5 {width: 41.66%;}
            .col-6 {width: 50%;}
            .col-7 {width: 58.33%;}
            .col-8 {width: 66.66%;}
            .col-9 {width: 75%;}
            .col-10 {width: 83.33%;}
            .col-11 {width: 91.66%;}
            .col-12 {width: 100%;}
            }`,
            reference: {
                userId:0,
                fullName:"",
                positionKz:"",
                positionRu:"",
                positionEn:"",
                qrCode:"",
                html:"",
                css:"",
                mailText:"",
                filePath:""
            },
            imgData: "",
            isHidden:false,
            blobSource: null,
            writeMail:false,
            mailText:"",
            sending:false
            
        }
    },
    methods:{
        printRef(){
            let data = document.getElementById("print-container").innerHTML;
            var mywindow = window.open('', 'new div', 'height=500,width=800');
            mywindow.document.write('<html><head><title></title>');
            mywindow.document.write('<style type="text/css">');
            mywindow.document.write(this.css);
            mywindow.document.write('</style>');
            mywindow.document.write('</head><body >');
            mywindow.document.write(data);
            mywindow.document.write('</body></html>');
            mywindow.document.close();
            mywindow.focus();
            mywindow.print();
            return false;
        },
        clearMail(){
            this.mailText = "";
            this.writeMail = false;
            this.sending=false;
        },
        openMail(){
            this.writeMail = true;
        },
        sendMail(){
            if(this.mailText.length > 0){
                this.sending = true;
                this.reference.mailText=this.mailText;
                axios.post(smartEnuApi+"/sendmail", this.reference, {headers: getHeader()})
                .then(res => {
                    if (res.data=="success"){
                        this.$toast.add({severity: 'success', summary: this.$t('ref.mailSent'), life: 3000});    
                    }else{
                        this.$toast.add({severity: 'warn', summary: this.$t('ref.mailFailed'), life: 3000});
                    }
                    this.sending=false;
                }).catch(() => {
                    this.$toast.add({severity: 'warn', summary: this.$t('ref.mailFailed'), life: 3000});
                });
            }
            
        },
        onCopy() {
            this.$toast.add({severity: 'success', summary: this.$t('ncasigner.successCopy'), life: 3000});
        },

        onFail() {
            this.$toast.add({severity: 'warn', summary: this.$t('ncasigner.failCopy'), life: 3000});
        },
        apiUrl(){
            return smartEnuApi
        },
        currentDate(){
            return moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD hh:ss');
        },
        print(){
            
        },
        //popUp(data) {
            
        //},
        ref(isBuild=0){
            this.writeMail = false;
            this.reference.isBuild = isBuild;
            axios.post(smartEnuApi+"/userref", this.reference, {headers: getHeader()})
            .then(res => {
                this.reference=res.data;
                document.getElementById("fullName").innerHTML=(this.reference.fullName);
                document.getElementById("positionName").innerHTML=(this.reference.positionKz);

                if(isBuild==1){
                    const data = {
                        errorCorrectionLevel: "H",
                        type: "image/jpeg",
                        quality: 0.3,
                        margin: 1,
                        color: {
                            dark: "#010599FF",
                            light: "#FFBF60FF",
                        },
                    };
                    if(this.reference.qrCode.length>0){
                        this.makeQrCode(this.reference.qrCode,data)
                    }
                        
                }
                
                


            }).catch(error => {
                alert(error.message);
            });
        },
        buildPdf(html){
            this.reference.html=html;
            this.reference.css=this.css;
            this.reference.isBuild=1;
            axios.post(smartEnuApi+"/viewuserref", this.reference, {headers: getHeader()})
            .then(() => {
                //alert("came");
            }).catch(error => {

                alert(error.message);
            });
        },
        makeQrCode(url, opts) {
            url = this.apiUrl()+"/refqr?qrcode="+url;
            this.blobSource=url;
            QRCode.toDataURL(url, opts, (err, imgData) => {
                this.imgData=imgData;
                document.getElementById("img").src=imgData;
                let html = document.getElementById("print-container").innerHTML;
                this.buildPdf(html);
            });
        },
    },
    created(){
        this.ref();
        
    }
}
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    .row::after {
        content: "";
        clear: both;
        display: table;
    }

    [class*="col-"] {
        float: left;
        padding: 10px;
    }

    /* For mobile phones: */
    [class*="col-"] {
    width: 100%;
    }

    @media only screen and (min-width: 600px) {
    /* For tablets: */
    .col-s-1 {width: 8.33%;}
    .col-s-2 {width: 16.66%;}
    .col-s-3 {width: 25%;}
    .col-s-4 {width: 33.33%;}
    .col-s-5 {width: 41.66%;}
    .col-s-6 {width: 50%;}
    .col-s-7 {width: 58.33%;}
    .col-s-8 {width: 66.66%;}
    .col-s-9 {width: 75%;}
    .col-s-10 {width: 83.33%;}
    .col-s-11 {width: 91.66%;}
    .col-s-12 {width: 100%;}
    }
    @media only screen and (min-width: 768px) {
    /* For desktop: */
    .col-1 {width: 8.33%;}
    .col-2 {width: 16.66%;}
    .col-3 {width: 25%;}
    .col-4 {width: 33.33%;}
    .col-5 {width: 41.66%;}
    .col-6 {width: 50%;}
    .col-7 {width: 58.33%;}
    .col-8 {width: 66.66%;}
    .col-9 {width: 75%;}
    .col-10 {width: 83.33%;}
    .col-11 {width: 91.66%;}
    .col-12 {width: 100%;}
    }
</style>

