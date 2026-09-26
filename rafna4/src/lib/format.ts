export function formatKES(amount: number): string {
  return `KES ${new Intl.NumberFormat("en-KE").format(Math.round(amount))}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
