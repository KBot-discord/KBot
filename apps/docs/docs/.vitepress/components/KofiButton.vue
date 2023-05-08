<template>
	<a
		class="kofi-button"
		title="Support Me on Ko-fi"
		href="https://ko-fi.com/killbasa"
		target="_blank"
		rel="noreferrer"
	>
		<span class="kofitext">
			<img src="https://ko-fi.com/img/cuplogo.svg" class="kofiimg" alt="Kofi cup" />
			Support Me on Ko-fi
		</span>
	</a>
</template>

<style>
img.kofiimg {
	vertical-align: middle;
	margin-right: 5px;
	margin-bottom: 4px;
}

span.kofitext {
	letter-spacing: -0.15px;
	vertical-align: middle;
	line-height: 33px;
	text-shadow: 0 1px 1px rgba(34, 34, 34, 0.3);
}

a.kofi-button {
	background-color: #488eb1;
	box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.2);
	line-height: 32px;
	display: inline-block;
	padding: 2px 11px;
	border-radius: 3px;
	color: #fff;
	font-family: 'Quicksand', Helvetica, Century Gothic, sans-serif !important;
	font-weight: 700;
	font-size: 14px;
}

a.kofi-button:hover {
	opacity: 0.85;
	text-decoration: none;
}

.kofitext img.kofiimg {
	width: 20px;
	display: initial;
}
</style>
