import { writable } from "svelte/store";

export const showWelcome = writable(true);
export const showHowToPlay = writable(false);
export const showStatistics = writable(false);
export const showSettings = writable(false);