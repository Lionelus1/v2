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
		<TabPanel :header="$t('roleControl.rolePosTitle')">
			<RolePosition></RolePosition>
		</TabPanel>
	</TabView>
	</div>
</template>
<script>
import RoleControl from './RoleControl.vue';
import RolePositionRel from './RolePositionRel.vue';
import RolePosition from './RolePosition.vue'

export default {
	components: { RoleControl, RolePositionRel,RolePosition },
}
</script>