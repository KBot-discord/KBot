<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import SettingsCard from '$components/dashboard/SettingsCard.svelte';
	import SettingsRow from '$components/dashboard/SettingsRow.svelte';
	import ChannelList from '$components/dashboard/ChannelList.svelte';
	import Meta from '$components/Meta.svelte';
	import { getCurrentGuildContext } from '$lib/stores/currentGuild';
	import InputSection from '$components/dashboard/SettingsSection.svelte';

	export let data: PageData;
	const { settings } = data;

	let currentGuild = getCurrentGuildContext();

	let antiHoistEnabled: boolean = settings.antihoistEnabled ?? false;
	let minageMessage: string = settings.minageMessage ?? '';
</script>

<Meta title="Moderation" guildName={data.guild.name} />

<h2 id="main">Moderation</h2>

<form method="POST" use:enhance class="space-y-6">
	<SettingsRow>
		<SettingsCard id="anti-hoist" title="Anti-Hoist" documentation>
			<p>Insert description here.</p>
			<InputSection title="Enable/Disable">
				<SlideToggle name="anti-hoist-enabled" size="sm" bind:checked={antiHoistEnabled} />
			</InputSection>
		</SettingsCard>
		<SettingsCard id="report" title="Report" documentation>
			<p>Send a copy of the reported message to the designated channel.</p>
			<InputSection title="Report channel">
				<ChannelList name="report-channel" channels={$currentGuild?.textChannels ?? []} />
			</InputSection>
		</SettingsCard>
	</SettingsRow>

	<SettingsCard id="minage" title="Minage" documentation>
		<input name="minage-req" type="number" class="input" />
		<textarea
			name="minage-message"
			class="textarea"
			rows={4}
			placeholder={settings.minageMessage}
			bind:value={minageMessage}
		/>
	</SettingsCard>
</form>
