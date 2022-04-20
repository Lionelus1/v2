<template>
  <div>
    <div ref="htmlToPdf" class="p-grid">
      <h5 class="p-col-6 p-offset-3 p-text-center p-text-bold">{{ plan.work_plan_name }}</h5>
      <br/>
      <div class="p-col-12">
        <table>
          <thead>
          <tr>
            <th>№</th>
            <th>{{ plan.lang === 1 ? 'Іс-шараның атауы' : plan.lang === 2 ? 'Наименование мероприятия' : 'Name of the event' }}</th>
            <th>{{ plan.lang === 1 ? 'Жауапты орындаушы' : plan.lang === 2 ? 'Ответственный исполнитель' : 'Responsible executor' }}</th>
            <th>{{ plan.lang === 1 ? 'Квартал' : plan.lang === 2 ? 'Квартал' : 'Quarter' }}</th>
            <th>{{ plan.lang === 1 ? 'Жоспарланған нәтиже' : plan.lang === 2 ? 'Планируемый результат' : 'Planned result' }}</th>
            <th>{{ plan.lang === 1 ? 'Ескерту' : plan.lang === 2 ? 'Примечание' : 'Note' }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ item.row_number }}</td>
            <td>{{ item.event_name }}</td>
<!--            <td><p v-for="(userItem, userIndex) in item.user" :key="userIndex"> {{ userItem.fullName }} </p></td>-->
            <td style="padding: 5px; border-collapse: collapse;">{{ item.userList }}</td>
            <td>{{ item.quarter }}</td>
            <td>{{ item.result }}</td>
            <td>{{ item.comment }}</td>
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
          e.userList = Object.keys(e.user).map(key => `${e.user[key].fullName}`).join(", ");
        });
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
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
}

</style>