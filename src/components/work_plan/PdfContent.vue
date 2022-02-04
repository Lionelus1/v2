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
            <th>Наименование мероприятия</th>
            <th>Ответственный исполнитель</th>
            <th>Квартал</th>
            <th>Планируемый результат</th>
            <th>Примечание</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ item.index }}</td>
            <td>{{ item.event_name }}</td>
            <td><p v-for="(userItem, userIndex) in item.user" :key="userIndex"> {{ userItem.fullName }} </p></td>
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
        margin: 15,
        image: {
          type: 'jpeg',
          quality: 1,
        },
        html2canvas: {scale: 3},
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'p',
        },
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
        let ind = 1;
        let parentIndex = 0;
        res.data.map(e => {
          this.items.push(e);
          if (e.parent_id) {
            e.index = `${parentIndex}.${ind++}`
          } else {
            e.index = ind++;
            parentIndex = e.index
          }
          if (e.children) {
            let chInd = 1;
            e.children.forEach(ec => {
              ec.index = `${e.index}.${chInd++}`
              if (ec.quarter) {
                ec.quarter = this.initQuarter(ec.quarter.String);
              }
              this.items.push(ec);
            });
          }
          if (e.quarter) {
            e.quarter = this.initQuarter(e.quarter.String);
          }
        });
      }).catch(error => {
        if (error.response.status === 401) {
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
  border: 1px solid #dee2e6;
  border-collapse: collapse;

  th {
    font-weight: bold;
  }

  td,
  th {
    padding: 8px;
    border: 1px solid #dee2e6;
  }
}

</style>