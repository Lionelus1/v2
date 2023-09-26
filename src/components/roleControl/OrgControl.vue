<template>
	<TabView>
		<TabPanel :header="$t('roleControl.roleTitle')">
			<RoleControl></RoleControl>
		</TabPanel>
		<TabPanel :header="$t('roleControl.rolePosRelTitle')">
			<RolePositionRel></RolePositionRel>
		</TabPanel>
		<TabPanel :header="$t('roleControl.rolePosRel')">
			<PositionRel></PositionRel>
		</TabPanel>
	</TabView>
</template>
<script>
import RoleControl from './RoleControl.vue';
import RolePositionRel from './RolePositionRel.vue';
import PositionRel from './PositionRel.vue';

export default {
	components: { RoleControl, RolePositionRel, PositionRel },
}
</script>