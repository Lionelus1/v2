<template>
    <div id="print-container">
        <div class="row" style="background:#fff;">
            <div class="col-12 col-s-12">
                <Button
                    id="printPageButton"
                    icon="pi pi-print"
                    class="p-button-success p-mb-0 p-mr-2"
                    @click="print()"/>
            </div>
                
                <div class="col-12 col-s-12">
                    <div class="col-6 col-s-12 ">
                    <img src="../../assets/layout/images/image1.png"  style="width:85.12px;height:85.12px;float:right">
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
                <div class="col-12 col-s-12" style="padding:0;">
                    <div class="col-6 col-s-12" style="text-align:center; padding:0;">
                        <strong>
                            А Н Ы Қ Т А М А
                        </strong>
                    </div>
                </div>
                <div class="col-12 col-s-12">
                    <div class="col-6 col-s-12">
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Азамат(ша) <strong>{{reference.fullName}}</strong> , іс жүзінде КЕАҚ Л.Н. Гумилев атындағы Еуразия ұлттық университетінде  жұмыс істейді.</p>

                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Құрылымдық бөлімше: Цифрлық даму және қашықтықтан оқыту департаменті / цифрлық даму секторы.</p>

                    <p style="padding-left:30px;">Лауазымы: <strong>{{reference.positionKz}}.</strong></p>

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
</template>
<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import moment from 'moment'
export default {
    name:"JobDescription",
    data(){
        return {
            reference: {
                userId:0,
                fullName:"",
                positionKz:"",
                positionRu:"",
                positionEn:""
            }
        }
    },
    methods:{
        currentDate(){
            return moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD hh:ss');
        },
        print(){
            this.popUp(document.getElementById("print-container").innerHTML);
        },
        popUp(data) {
            var mywindow = window.open('', 'new div', 'height=800,width=800');
            mywindow.document.write('<html><head><title></title>');
            mywindow.document.write('<style rel="stylesheet" type="text/css" >');
            mywindow.document.write(`
            @media print
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
                padding: 15px;
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
            }`);
            mywindow.document.write('</style>');
            
            
            mywindow.document.write('</head><body onload="mywindow.print();mywindow.close()">');
            mywindow.document.write(data);
            mywindow.document.write('</body></html>');
            mywindow.document.close();
            setTimeout(function(){mywindow.print();mywindow.close();},100);
            return true;
        },
        ref(){
            axios.post(smartEnuApi+"/userref", {}, {headers: getHeader()})
            .then(res => {
                this.reference=res.data;
            }).catch(error => {
                alert(error.message);
            });
        }
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
        padding: 15px;
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

