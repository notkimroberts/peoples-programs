<script lang="ts">
	import '../app.css'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'

	let { children } = $props()

	injectAnalytics()
	injectSpeedInsights()
</script>

{@render children()}
