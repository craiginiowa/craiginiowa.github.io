import data from "../data/data.json";

export async function load() {
  return {
    ...data,
  };
}

export const prerender = true;
