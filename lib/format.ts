export function displayMetric(value: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }
  return value;
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return parsed.toLocaleString("en-US");
}

export function formatMetric(value: number | string | null | undefined): string {
  return formatNumber(value);
}

export function withUnit(value: string | null, unit: string): string;
export function withUnit(value: string, unit: string): string;
export function withUnit(value: string | null, unit: string): string {
  if (!value || value === "N/A") {
    return "N/A";
  }
  return `${value} ${unit}`;
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  const date = value.length === 10 ? new Date(`${value}T00:00:00.000Z`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatMonth(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(`${value}-01T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function compactAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortAddress(address: string): string {
  return compactAddress(address);
}

export function compactHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}
