<script lang="ts">
	// import Theme from '$lib/general/components/Theme.svelte'
	import '../app.css'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'

	let { children } = $props()

	injectAnalytics()
	injectSpeedInsights()
</script>

<!-- <Theme /> -->
{@render children()}
