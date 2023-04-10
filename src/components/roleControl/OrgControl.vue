<template>
	<TabView>
		<TabPanel :header="$t('roleControl.roleTitle')">
			<RoleControl></RoleControl>
		</TabPanel>
		<TabPanel :header="$t('roleControl.rolePosRelTitle')">
			<RolePositionRel></RolePositionRel>
		</TabPanel>
	</TabView>
</template>
<script>
import RoleControl from './RoleControl.vue';
import RolePositionRel from './RolePositionRel.vue';

export default {
	components: { RoleControl, RolePositionRel },
}
</script>