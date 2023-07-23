export const load = async ({ fetch }) => {
  const response = await fetch("/api/portfolio?target=developer");
  const files = await response.json();
  return { files };
};
