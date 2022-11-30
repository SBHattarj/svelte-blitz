# Svelte Blitz

A svelte port for blitzjs

If you want to injoy blitzjs features within sveltekit then this is right for you!

If you want to install this you can do so using the following:
```properties
npm i svelte-blitz
```
*Note:* You must start a sveltekit skeleton ts project before you use this 
You can start using this by first creating the default sveltekit typescript barebones project and then following these steps:

1. change contents of vite.config.ts to the following
```ts
import type { UserConfig } from 'vite';
import { svelteBlitz } from 'svelte-blitz/plugin';

const config: UserConfig = {
	plugins: [
		svelteBlitz({
			exclude: ["@prisma/client"]
		})
	]
};

export default config;

```

2. Run ```npm run dev``` and some files will be added to your skeleton project to allow using blitz

This should allow you to use prisma. to use invoke you'll be importing it from svelte-blitz

you can transform sveltekit handler to next like handler by using the createHandler method.

If you want to help you can contact me directly.

Happy coding.


Later I would like to add a bin that allows a svelte-blitz container over blitz cli, though I'll like some help with that.