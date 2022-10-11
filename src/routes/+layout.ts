import type { LayoutLoad } from "./$types";
import { loadWithBlitz } from "app/blitz-client";

export const load = loadWithBlitz<LayoutLoad>()