<script>
    import "@blitzjs/rpc"
    import getCurrentUser from "app/users/queries/getCurrentUser"
    import { invoke } from "@blitzjs/sveltekit/rpc";
    // console.log(getCurrentUser.toString())
    invoke(getCurrentUser, null).then(console.log)
    // console.log(typeof document === "undefined" ? "hello server" : "hello client")
    let a = 0
</script>
{a}
<button on:click={() => ++a}>a</button>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
