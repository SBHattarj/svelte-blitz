import {createHandler} from '@blitzjs/sveltekit/server';
import { api } from 'app/blitz-server';
import { rpcHandler } from '@blitzjs/rpc';

const handler = createHandler(api(rpcHandler(console.info as any)));

export const GET = createHandler((req, res) => res.send('<h1>this works</h1><h2>this is actually cool</h2><p>this worked more easily</p>'));
export const POST = handler
export const HEADER = handler