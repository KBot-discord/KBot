<script lang="ts">
	import Meta from '$components/Meta.svelte';
	import LegalSection from '$components/LegalSection.svelte';
	import LegalSubsection from '$components/LegalSubsection.svelte';
</script>

<Meta title="Privacy Policy" />

<main class="flex h-fit flex-col">
	<div class="flex grow flex-col lg:items-center p-7">
		<div class="flex grow flex-col gap-4 lg:w-6/12">
			<h2 class="text-4xl font-bold">Privacy Policy</h2>
			<div class="flex flex-col gap-4">
				<p>
					This policy is effective as of May 20, 2022 and was last updated on October 04,
					2022.
				</p>
				<p>
					Your privacy is important to us. It is KBot&#39;s policy to respect your privacy
					and comply with any applicable law and regulation regarding any personal
					information we may collect about you, including across our website, <a href="/"
						>https://kbot.ca</a
					>, and other sites we own and operate.
				</p>
			</div>
			<LegalSection title="Information from Discord">
				<p>
					Information we collect includes both information you knowingly and actively
					provide us when using or participating in any of our services, and any
					information automatically sent by your devices in the course of accessing our
					products and services. Information including, but not limited to:
				</p>
				<ol class="list-decimal pl-10">
					<li>
						Any information provided through the requested
						<a
							href="https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes"
							target="_blank"
							rel="noreferrer">OAuth2 scopes</a
						>.
					</li>
					<li>Mutual servers that you may share with the bot.</li>
				</ol>
				<LegalSubsection title="Log Data">
					<p>
						In the event that an error occurs with the bot, log data will be collected
						which may include your Discord information. This data is only stored for
						internal uses to troubleshoot issues.
					</p>
				</LegalSubsection>
			</LegalSection>
			<LegalSection title="Information from use of kbot.ca">
				<LegalSubsection title="Log Data">
					<p>
						{"When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your device's Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, other details about your visit, and technical details that occur in conjunction with any errors you may encounter."}
					</p>
					<p>
						Please be aware that while this information may not be personally
						identifying by itself, it may be possible to combine it with other data to
						personally identify individual persons.{' '}
					</p>
				</LegalSubsection>
				<LegalSubsection title="Security of Your Personal Information">
					<p>
						When we collect and process personal information, and while we retain this
						information, we will protect it within commercially acceptable means to
						prevent loss and theft, as well as unauthorized access, disclosure, copying,
						use, or modification.{' '}
					</p>
					<p>
						Although we will do our best to protect the personal information you provide
						to us, we advise that no method of electronic transmission or storage is
						100% secure, and no one can guarantee absolute data security.
					</p>
				</LegalSubsection>
				<LegalSubsection title={"Children's Privacy"}>
					<p>
						We do not aim any of our products or services directly at children under the
						age of 13, and we do not knowingly collect personal information about
						children under 13. In the case we discover that a child under 13 has
						provided us with personal information, we immediately delete this from our
						servers. If you are a parent or guardian and you are aware that your child
						has provided us with personal information, please contact us so that we will
						be able to do necessary actions.
					</p>
				</LegalSubsection>
				<LegalSubsection title="Disclosure of Personal Information to Third Parties">
					<p>We may disclose personal information to:</p>
					<ul class="pl-4 list-disc">
						<li>a parent, subsidiary, or affiliates</li>
						<li>
							third party service providers for the purpose of enabling them to
							provide their services, for example, IT service providers, data storage,
							hosting and server providers, advertisers, or analytics platforms
						</li>
						<li>
							third parties, including agents or sub-contractors, who assist us in
							providing information, products, services, or direct marketing to you
							third parties to collect and process data
						</li>
					</ul>
				</LegalSubsection>
				<LegalSubsection title="Use of Cookies">
					<p>
						{"Cookies contain data which is stored in your browser's memory, and holds authentication info for the site."}
					</p>
				</LegalSubsection>
			</LegalSection>
			<LegalSection title="Limits of Our Policy">
				<p>
					Our website may link to external sites that are not operated by us. Please be
					aware that we have no control over the content and policies of those sites, and
					cannot accept responsibility or liability for their respective privacy
					practices.
				</p>
			</LegalSection>
			<LegalSection title="Changes to This Policy">
				<p>
					The contents of this privacy policy may occasionally be updated. It is
					recommended to check this periodically in case of any changes. Any changes to
					this policy will be made known at the top of the page.
				</p>
			</LegalSection>
			<LegalSection title="Contact Us">
				<p>
					For any questions or concerns regarding your privacy, you may contact us using
					the following links:
				</p>
				<p class="flex flex-col">
					<a href="mailto: support@kbot.ca">support@kbot.ca</a>
					<a href="/discord">Support server</a>
				</p>
			</LegalSection>
		</div>
	</div>
</main>
