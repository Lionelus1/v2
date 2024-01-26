<template>
	<h3>{{ $t("roleControl.menuTitle") }}</h3>
	<div class="card">
	<TabView>
		<TabPanel :header="$t('roleControl.roleTitle')">
			<RoleControl></RoleControl>
		</TabPanel>
		<TabPanel :header="$t('roleControl.rolePosRelTitle')">
			<RolePositionRel></RolePositionRel>
		</TabPanel>
		<TabPanel :header="$t('roleControl.departmentRoleRel')">
			<RoleDepartmentRel></RoleDepartmentRel>
		</TabPanel>
	</TabView>
	</div>
</template>
<script>
import RoleControl from './RoleControl.vue';
import RolePositionRel from './RolePositionRel.vue';
import RoleDepartmentRel from './RoleDepartmentRel.vue'

export default {
	components: { RoleControl, RolePositionRel, RoleDepartmentRel },
}
</script>