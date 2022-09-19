<template>
  <div>
    <div ref="htmlToPdf" class="p-grid" v-if="plan && !plan.is_oper">
      <h5 style="width: 100%;text-align: center;font-size: 14.0pt;text-transform: uppercase;font-weight: bold;">{{ plan.work_plan_name }}</h5>
      <br/>
      <div class="p-col-12">
        <table style="width: 100%; font-size: 12.0pt; text-align: center;border-collapse: collapse;border: 1px solid grey">
          <tbody>
          <tr>
            <td class="header" style="font-weight: bold;">№</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Іс-шараның атауы' : plan.lang === 2 ? 'Наименование мероприятия' : 'Name of the event' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Жауапты орындаушы' : plan.lang === 2 ? 'Ответственный исполнитель' : 'Responsible executor' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Квартал' : plan.lang === 2 ? 'Квартал' : 'Quarter' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Жоспарланған нәтиже' : plan.lang === 2 ? 'Планируемый результат' : 'Planned result' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Ескерту' : plan.lang === 2 ? 'Примечание' : 'Note' }}</td>
          </tr>
          <tr v-for="(item, index) in items" :key="index">
            <td class="td-va text-center">{{ item.row_number }}</td>
            <td class="td-va" style="text-align: start;">{{ item.event_name }}</td>
<!--            <td class="td-va"><p v-for="(userItem, userIndex) in item.user" :key="userIndex"> {{ userItem.fullName }} </p></td>-->
            <td class="td-va text-center">{{ item.userList }}</td>
            <td class="td-va text-center">{{ item.quarter }}</td>
            <td class="td-va text-center">{{ item.result }}</td>
            <td class="td-va text-center">{{ item.comment }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div ref="htmlToPdf" class="p-grid" v-if="plan && plan.is_oper">
      <h5 style="width: 100%;text-align: center;font-size: 14.0pt;text-transform: uppercase;font-weight: bold;">{{ plan.work_plan_name }}</h5>
      <br/>
      <div class="p-col-12">
        <table>
          <tbody>
          <tr>
            <td class="header" style="font-weight: bold;">№</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Нәтиже көрсеткіші' : plan.lang === 2 ? 'Показатель прямых результатов' : 'Indicator of direct results' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Өлшем бірлігі' : plan.lang === 2 ? 'Ед. изм.' : 'Unit' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Жоспар' : plan.lang === 2 ? 'План' : 'Plan' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Жауапты орындаушылар' : plan.lang === 2 ? 'Ответственные исполнители' : 'Responsible performers' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Жинақтаушы/Растау' : plan.lang === 2 ? 'Свод/подтверждение' : 'Summary/Confirmation' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Квартал' : plan.lang === 2 ? 'Квартал' : 'Quarter' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Растайтын құжаттар' : plan.lang === 2 ? 'Подтверждающие документы' : 'Supporting documents' }}</td>
            <td class="header" style="font-weight: bold;">{{ plan.lang === 1 ? 'Қосымша ақпарат' : plan.lang === 2 ? 'Дополнительная информация ' : 'Additional Information' }}</td>
          </tr>
          <tr v-for="(item, index) in items" :key="index">
            <td class="td-va text-center">{{ item.row_number }}</td>
            <td class="td-va" style="text-align: start;">{{ item.event_name }}</td>
            <td class="td-va text-center">{{ item.unit }}</td>
            <td class="td-va text-center">{{ item.plan_number }}</td>
            <td class="td-va text-center">{{ item.responsible_executor }}</td>
            <!--            <td class="td-va"><p v-for="(userItem, userIndex) in item.user" :key="userIndex"> {{ userItem.fullName }} </p></td>-->
            <td class="td-va text-center">{{ item.userList }}</td>
            <td class="td-va text-center">{{ item.quarter }}</td>
            <td class="td-va text-center">{{ item.supporting_docs }}</td>
            <td class="td-va text-center">{{ item.result }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import treeToList from "@/service/treeToList";

export default {
  name: "PdfContent",
  props: ['planId', 'type', 'isReport', 'data'],
  data() {
    return {
      items: [],
      work_plan_id: this.planId,
      plan: this.data,
      pdfType: this.isReport,
      pdfOptions: {
        margin: 10,
        image: {
          type: 'jpeg',
          quality: 1,
        },
        html2canvas: {scale: 1},
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
          hotfixes: ["px_scaling"]
        },
        pagebreak: {avoid: 'tr'},
      },
      loginedUserId: 0
    }
  },
  created() {
    this.getData();
    this.year = new Date().getFullYear();
    //this.data.push({index: 1, name: "Test name", resp: 'User Name', quarter: 1, result: '', comment: 'Comment'})
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.filename = 'flname.pdf'
  },
  methods: {
    getData() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanReportData`, {
        work_plan_id: this.work_plan_id
      }, {headers: getHeader()}).then(res => {
        this.items = treeToList(res.data, 'children', this.plan.lang);
        this.items.map(e => {
          if (e.user)
            e.userList = Object.keys(e.user).map(key => `${e.user[key].fullName}`).join(", ");
        });
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: "ERROR: " + error,
            life: 3000,
          });
        }
      });
    },
    initQuarter(quarter) {
      let res = '';
      switch (quarter) {
        case "1":
          res = 'I';
          break;
        case "2":
          res = 'II';
          break;
        case "3":
          res = 'III';
          break;
        case "4":
          res = 'IV';
          break;
        case "5":
          res = '';
          break;
      }
      return res;
    }
  }
}
</script>

<style scoped lang="scss">
table {
  width: 100%;
  font-size: 14px;
  text-align: center;
  border: 1px solid black;
  border-collapse: collapse;

  th {
    font-weight: bold;
  }

  td,
  th {
    padding: 8px;
    border: 1px solid black;
  }
  td {
    text-align: center;
    border-collapse: collapse;
    vertical-align: top;
  }
}

</style>