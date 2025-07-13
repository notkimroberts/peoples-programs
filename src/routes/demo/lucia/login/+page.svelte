<script lang="ts">
	import { enhance } from '$app/forms'
	import type { ActionData } from './$types'

	let { form }: { form: ActionData } = $props()
</script>

<h1>Login/Register</h1>
<form method="post" action="?/login" use:enhance>
	<label>
		Username
		<input name="username" class="input input-lg" />
	</label>
	<label>
		Password
		<input type="password" name="password" class="input input-lg" />
	</label>
	<button class="btn btn-lg">Login</button>
	<button formaction="?/register" class="btn btn-lg">Register</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
