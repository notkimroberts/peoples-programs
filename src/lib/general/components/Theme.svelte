<!-- https://scottspence.com/posts/theme-switching-in-sveltekit-updated-for-daisyui-v5-and-tailwind-v4#theme-select-component -->
<script lang="ts">
	import { THEMES } from '$lib/general/constants'

	let currentTheme = $state('')

	$effect(() => {
		if (typeof window !== 'undefined') {
			const theme = window.localStorage.getItem('theme')
			if (theme && THEMES.includes(theme)) {
				document.documentElement.setAttribute('data-theme', theme)
				currentTheme = theme
			}
		}
	})

	function set(event: Event) {
		const { target } = event
		if (target instanceof HTMLSelectElement) {
			const theme = target.value
			if (THEMES.includes(theme)) {
				console.log('hi')
				const ONE_YEAR = 60 * 60 * 24 * 365
				window.localStorage.setItem('theme', theme)
				document.cookie = `theme=${theme}; max-age=${ONE_YEAR}; path=/; SameSite=Lax`
				document.documentElement.setAttribute('data-theme', theme)
				currentTheme = theme
			}
		}
	}
</script>

<div>
	<select bind:value={currentTheme} class="select select-bordered" onchange={set}>
		<option value="" disabled={currentTheme !== ''}>Choose a theme</option>
		{#each THEMES as theme}
			<option value={theme}>{theme}</option>
		{/each}
	</select>
</div>
