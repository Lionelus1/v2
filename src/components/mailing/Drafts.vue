<template>
  <div>
    <DataTable :value="mailingList">
      <Column field="title" :header="$t('mailing.title')">
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.TemplateName
            }}
          </span>
        </template>
      </Column>
      <Column field="categories" :header="$t('mailing.categories')">
        <template #body="slotProps">
          <span v-for="role in slotProps.data.Roles" :key="role.id">{{ role.ru }}</span>
        </template>
      </Column>
      <Column field="author" :header="$t('mailing.author')">
        <template #body="slotProps">
          <span>
            {{
              getFullName(slotProps.data.Notification.senderJSON)
            }}
          </span>
        </template>

      </Column>
      <Column field="dateAndTime" :header="$t('mailing.dateAndTIme')">
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.Notification.createdDate
            }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import api from "@/service/api";
import {getHeader} from "@/config/config";

export default {
  data() {
    return {
      mailingList: [],
      loading: true,
      getParams: {
        pageNum: 1,
        itemsPerPage: 6,
        statusId: 2,
      },
    };
  },
  methods: {
    getFullName(senderJSON) {
      const senderData = JSON.parse(senderJSON);
      return `${senderData.firstName} ${senderData.lastName} ${senderData.thirdName}`;
    },
    initMailing() {
      this.loading = true;
      api
          .post("/mailingList", this.getParams, {
            headers: getHeader()
          })
          .then((res) => {
            this.mailingList = res.data;
            this.count = res.data.NewCount;
            this.loading = false;
          })
          .catch((err) => {
            if (err.response.status == 401) {
              this.$store.dispatch("logLout");
            }

            this.$toast.add({
              severity: "error",
              detail: this.$t("roleControl.noResult"),
              life: 3000,
            });

            this.loading = false;
          });
    }
  },
  mounted() {
    this.initMailing();
  },
};
</script>
