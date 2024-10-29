<template>
  <div>
    <!-- TOOLBAR -->
    <div class="mb-3"
      style="display: flex; justify-content: space-between; margin-bottom: 20px"
    >
      <Button
        :label="$t('roleControl.givePosRoleRel')"
        icon="pi pi-plus"
        class="p-button-success p-mr-2"
        v-on:click="open('create', nil)"
      />
      <span class="p-input-icon-left mr-2">
        <InputText
          type="search"
          v-model="searchText"
          :placeholder="$t('common.search')"
          @keyup.enter="initRolePositionRels"
          @click="clearData"
        />
        <Button
          icon="pi pi-search"
          class="p-ml-1"
          @click="initRolePositionRels()"
        />
      </span>
    </div>
    <DataTable
      :lazy="true"
      :value="rolePositionRels"
      @page="onPage($event)"
      :totalRecords="count"
      :paginator="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[10, 25, 50]"
      :currentPageReportTemplate="
        $t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        })
      "
      :rows="10"
      :rowHover="true"
      :loading="loading"
      responsiveLayout="scroll"
    >
      <!-- EMPTY -->
      <template #empty> {{ $t("common.noData") }}</template>
      <!-- ON LOADING -->
      <template #loading> {{ $t("common.loading") }}</template>
      <!-- COLUMNS -->
      <Column :header="$t('contact.position')">
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.position.name +
              " - " +
              slotProps.data.position["name" + $i18n.locale]
            }}
          </span>
        </template>
      </Column>
      <!-- COLUMNS -->
      <Column :header="$t('roleControl.roleName')">
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.role.name +
              " - " +
              slotProps.data.role[$i18n.locale]
            }}
          </span>
        </template>
      </Column>
      <!-- COLUMNS -->
      <Column>
        <template #body="slotProps">
          <Button
            icon="pi pi-times"
            class="p-button-danger"
            @click="open('delete', slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
    <!--  БОКОВАЯ ПАНЕЛЬ ДОБАВЛЕНИЯ ДАННЫХ  -->
    <Sidebar
      v-model:visible="view.create"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll"
    >
      <h5>
        {{ $t("roleControl.addSidebar") }}
      </h5>

      <div>
        <Menubar
          :model="menu"
          style="
            height: 36px;
            margin-top: -7px;
            margin-left: -14px;
            margin-right: -14px;"></Menubar>
      </div>
      <div style="padding: 1em">
        <div style="margin-bottom: 1rem">
          <label>{{ $t("contact.position") }}</label>
          <br />
          <Dropdown
		  	:placeholder="$t('roleControl.selectPosition')"
            v-model="position"
            :filter="true"
            :showClear="true"
            :emptyFilterMessage="$t('roleControl.noResult')"
            :optionLabel="positionLabel"
            :options="positions"
            class="w-full md:w-full"
          ></Dropdown>
        </div>
        <div>
          <label>{{ $t("roleControl.roleName") }}</label>
          <br />
          <Dropdown
		  	:placeholder="$t('common.message.selectRole')"
            v-model="role"
            :optionLabel="roleLabel"
            :options="roles"
            :filter="true"
            :showClear="true"
            :emptyFilterMessage="$t('roleControl.noResult')"
            class="w-full md:w-full"
          ></Dropdown>
        </div>
      </div>
      <!-- <div>
				<Button :label="$t('common.save')" icon="pi pi-check" :disabled="position === null || role === null"
								@click="saveRolePositionRel" style="margin-top: 10px"/>
			</div> -->
    </Sidebar>
    <!--  ДИАЛОГОВОЕ ОКНО ДЛЯ УДАЛЕНИЯ ЗАПИСИ В ТАБЛИЦЕ  -->
    <Dialog
      v-model:visible="view.delete"
      :style="{ width: '450px' }"
      :modal="true"
      :closable="false"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
        <span> {{ $t("common.doYouWantDelete") }}? </span>
      </div>
      <template #footer>
        <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button p-component p-button-success p-mr-2"
          @click="deletePositionRoleRelation"
        />
        <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button p-component p-button-danger p-mr-2"
          @click="close('delete')"
        />
      </template>
    </Dialog>
  </div>
</template>
<script>
import { smartEnuApi, getHeader } from "@/config/config";
import api from '@/service/api';

export default {
  data() {
    return {
      view: {
        create: false,
        delete: false,
      },
      rolePositionRels: [],
      forDeleting: null,
      loading: true,
      count: 0,
      getParams: {
        page: 0,
        rows: 10,
        searchText: null,
      },

      role: null,
      roles: [],
      position: null,
      positions: [],
      orgParams: {
        searchText: null,
      },
      searchText: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => this.isDisabled(),
          command: () => this.saveRolePositionRel(),
        },
      ],
    };
  },
  methods: {
    initRolePositionRels() {
      this.loading = true;
      if (this.searchText) {
        this.getParams.searchText = this.searchText;
      }
      api
        .post("/positionRoleRel", this.getParams, {
          headers: getHeader(),
        })
        .then((res) => {
          this.rolePositionRels = res.data.positionRoleRel;
          this.count = res.data.total;
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
      this.getParams.searchText = null;
    },
    isDisabled() {
      return this.position === null || this.role === null;
    },
    clearData() {
      if (!this.searchText) {
        return;
      }
      this.searchText = null;
      this.initRolePositionRels();
    },
	closeSidebar(){
		this.position = null
  		this.role = null
		this.initPositions();
	},
    open(name, data) {
      this.view[name] = true;
      this.forDeleting = data;
    },
    close(name) {
      this.view[name] = false;
    },
    onPage(event) {
      this.getParams.page = event.page;
      this.getParams.rows = event.rows;
      this.initRolePositionRels();
    },
    saveRolePositionRel() {
      if (this.position === null || this.role === null) {
        return;
      }

      this.loading = true;

      api
        .post(
          "/positionRoleRel/create",
          {
            positionId: this.position.id,
            roleId: this.role.id,
          },
          {
            headers: getHeader(),
          }
        )
        .then((res) => {
		  this.closeSidebar()
          this.close("create");
          this.initRolePositionRels();
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("common.message.saveError"),
            life: 3000,
          });

          this.loading = false;
        });
    },
    deletePositionRoleRelation() {
      if (!this.forDeleting) {
        return;
      }

      this.loading = true;

      api
        .post(
          "/positionRoleRel/delete",
          {
            id: this.forDeleting.positionRoleRelId,
          },
          {
            headers: getHeader(),
          }
        )
        .then((res) => {
          this.close("delete");
          this.initRolePositionRels();
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("roleControl.failedToDelete"),
            life: 3000,
          });

          this.close("delete");
          this.loading = false;
        });
    },
    initPositions() {
      api
        .get("/positionRoleRel/positions", {
          headers: getHeader(),
        })
        .then((res) => {
          this.positions = res.data;
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("roleControl.failedToLoad"),
            life: 3000,
          });
        });
    },
    initRoles() {
        api.get("/positionRoleRel/roles", {
          headers: getHeader(),
        })
        .then((res) => {
          this.roles = res.data;
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("roleControl.failedToLoad"),
            life: 3000,
          });
        });
    },
    positionLabel(item) {
      return item.name + " - " + item["name" + this.$i18n.locale];
    },
    roleLabel(item) {
      return item.name + " - " + item[this.$i18n.locale];
    },
  },
  mounted() {
    this.initRolePositionRels();
    this.initPositions();
    this.initRoles();
  },
};
</script>

<style>
.p-dropdown-full {
  width: 100%;
}
</style>
