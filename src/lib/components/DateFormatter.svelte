<script>
  export let date = new Date();
  export let format = "dateonly";

  $: if (typeof date.getDate == "undefined") {
    date = new Date(date);
  }

  // date: 2020-10-18 01:50:00 -0600

  function dateonly() {
    return date
      .toDateString()
      .replace(/^\w* /, "")
      .replace(/ (\d{4})/, ", $1");
  }
  function datetime() {
    let dateString = dateonly();
    let timeString = date
      .toLocaleTimeString()
      .replace(/(\d+:\d+):\d+/, "$1")
      .toLowerCase()
      .replace("/m$/", ".m.");
    return dateString + " " + timeString;
  }
  function json() {
    return date.toJSON();
  }
</script>

{#if format == "dateonly"}
  {dateonly()}
{:else if format == "datetime"}
  {datetime()}
{:else if format == "json"}
  {json()}
{:else}
  {date.toString()}
{/if}
