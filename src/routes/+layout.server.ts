import { loadServerWithBlitz } from "app/blitz-server";
import type { LayoutServerLoad } from "./$types";

export const load = loadServerWithBlitz<LayoutServerLoad>()