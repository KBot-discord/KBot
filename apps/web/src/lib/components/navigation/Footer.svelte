<script lang="ts">
	import logo from '$lib/images/logo.png';
</script>

<div class="bg-surface-100-800-token text-xs md:text-base mx-auto px-4 py-8 md:p-10 space-y-10">
	<section
		class="flex flex-col md:flex-row justify-between items-center md:items-start space-y-5 md:space-y-0"
	>
		<div
			class="grid grid-cols-1 gap-2 place-content-center place-items-center md:place-items-start"
		>
			<img height={60} width={60} src={logo} alt="Main logo" />
			<p class="!text-sm opacity-80">A Multi-feature Discord bot.</p>
		</div>
		<div class="hidden md:grid grid-cols-[auto_auto_auto] gap-10">
			<div class="space-y-4">
				<h6>Community</h6>
				<ul class="space-y-2">
					<li>
						<a href="/discord" target="_blank" rel="noreferrer">Join Discord</a>
					</li>
				</ul>
			</div>
			<div class="space-y-4">
				<h6>Project</h6>
				<ul class="space-y-2">
					<li>
						<a href="https://github.com/KBot-discord" target="_blank" rel="noreferrer">
							Github Organization
						</a>
					</li>
					<li>
						<a href="https://ko-fi.com/killbasa" target="_blank" rel="noreferrer">
							Donations
						</a>
					</li>
				</ul>
			</div>
			<div class="space-y-4">
				<h6>Legal</h6>
				<ul class="space-y-2">
					<li>
						<a href="/terms"> Terms of Use </a>
					</li>
					<li>
						<a href="/privacy"> Privacy Policy </a>
					</li>
				</ul>
			</div>
		</div>
	</section>
</div>
