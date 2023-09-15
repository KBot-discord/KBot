<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import SettingsRow from '$components/dashboard/SettingsRow.svelte';
	import ChannelList from '$components/dashboard/ChannelList.svelte';
	import { getCurrentGuildContext } from '$stores';
	import Label from '$components/forms/Label.svelte';
	import SettingsForm from '$components/dashboard/SettingsForm.svelte';
	import type { ModerationSettings } from '@kbotdev/proto';

	export let data: PageData;
	const { settings } = data;

	const currentGuild = getCurrentGuildContext();

	let defaults: Partial<ModerationSettings> = {
		enabled: settings.enabled,
		antihoistEnabled: settings.antihoistEnabled,
		reportChannelId: settings.reportChannelId,
		minageReq: settings.minageReq,
		minageMessage: settings.minageMessage
	};

	let values: Partial<ModerationSettings> = {
		...defaults
	};

	let uc = {
		module: false,
		antihoist: false,
		report: false,
		minageReq: false,
		minageMessage: false
	};
</script>

<Meta title="Moderation" guildName={data.guild.name} />

<section>
	<h2 id="main">Moderation</h2>
	<div class="space-y-6">
		<SettingsForm title="Module" action="?/module" unsavedChanges={uc.module}>
			<p>
				Prevent users from adding random characters to the front of their name to appear at
				the top of the member list.
			</p>
			<Label id="module-enabled" title="Enable/Disable">
				<SlideToggle
					label="module-enabled"
					name="module-enabled"
					size="sm"
					value="true"
					bind:checked={values.enabled}
					on:change={() => {
						uc.module = defaults.enabled !== values.enabled;
					}}
				/>
			</Label>
		</SettingsForm>

		<SettingsRow>
			<SettingsForm title="Anti-Hoist" action="?/antihoist" unsavedChanges={uc.antihoist}>
				<p>
					Prevent users from adding random characters to the front of their name to appear
					at the top of the member list.
				</p>
				<Label id="anti-hoist" title="Enable/Disable">
					<SlideToggle
						label="anti-hoist"
						name="anti-hoist"
						size="sm"
						value="true"
						bind:checked={values.antihoistEnabled}
						on:change={() => {
							uc.antihoist = defaults.antihoistEnabled !== values.antihoistEnabled;
						}}
					/>
				</Label>
			</SettingsForm>

			<SettingsForm title="Report" action="?/report" unsavedChanges={uc.report}>
				<p>The channel to send message reports to.</p>
				<Label id="report-channel" title="Report channel">
					<ChannelList
						id="report-channel"
						bind:selected={values.reportChannelId}
						channels={$currentGuild?.textChannels}
						on:change={() => {
							uc.report = defaults.reportChannelId !== values.reportChannelId;
						}}
					/>
				</Label>
			</SettingsForm>
		</SettingsRow>

		<SettingsForm
			title="Minage"
			action="?/minage"
			unsavedChanges={uc.minageReq || uc.minageMessage}
		>
			{uc.minageReq}
			{settings.minageReq ?? null}
			{values.minageReq}
			<div>
				{values.minageMessage}
			</div>
			<input
				id="minage-req"
				name="minage-req"
				type="number"
				class="input"
				bind:value={values.minageReq}
				on:change={() => {
					uc.minageReq = (defaults.minageReq ?? null) !== values.minageReq;
				}}
			/>
			<textarea
				name="minage-message"
				class="textarea"
				rows={4}
				placeholder={settings.minageMessage}
				bind:value={values.minageMessage}
				on:change={() => {
					uc.minageMessage = defaults.minageMessage !== values.minageMessage;
				}}
			/>
		</SettingsForm>
	</div>
</section>
