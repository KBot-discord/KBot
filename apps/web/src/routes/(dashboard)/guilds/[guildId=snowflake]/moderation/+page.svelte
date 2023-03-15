<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import SettingsCard from '$components/dashboard/SettingsCard.svelte';
	import SettingsRow from '$components/dashboard/SettingsRow.svelte';
	import ChannelList from '$components/dashboard/ChannelList.svelte';
	import Meta from '$components/Meta.svelte';
	import { getCurrentGuildContext } from '$lib/stores/currentGuild';

	export let data: PageData;
	const { settings, cases } = data;

	let currentGuild = getCurrentGuildContext();

	let antiHoistEnabled: boolean = settings.antihoistEnabled ?? false;
	let minageMessage: string = settings.minageMessage ?? '';
</script>

<Meta title="Moderation" guildName={data.guild.name} />

<form method="POST" use:enhance class="space-y-6">
	<SettingsRow>
		<SettingsCard id="anti-hoist" title="Anti-Hoist">
			<SlideToggle name="anti-hoist-enabled" size="sm" bind:checked={antiHoistEnabled} />
			<p>Insert description here.</p>
		</SettingsCard>
		<SettingsCard id="report" title="Report">
			<ChannelList name="report-channel" channels={$currentGuild?.textChannels ?? []} />
			<p>Insert description here.</p>
		</SettingsCard>
	</SettingsRow>

	<SettingsCard id="minage" title="Minage">
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

<h2 id="cases">Cases</h2>
<ul>
	{#each cases as { caseId, userId, userTag, moderatorId, moderatorTag, action, reason }}
		<li>
			<div class="flex flex-col">
				<span>Case ID: {caseId}</span>
				<span>Action: {action}</span>
				<span>Reason: {reason}</span>
				<span>User ID: {userId}</span>
				<span>User tag: {userTag}</span>
				<span>Moderator ID: {moderatorId}</span>
				<span>Moderator tag: {moderatorTag}</span>
			</div>
		</li>
		<hr />
	{/each}
</ul>
