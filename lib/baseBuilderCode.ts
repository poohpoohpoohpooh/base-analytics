import type { Hex } from "viem";

const ERC_8021_MAGIC_SUFFIX = "80218021802180218021802180218021";

export function parseBaseBuilderCodeSuffix(value?: string): Hex | null {
  const normalized = value?.trim().toLowerCase();

  if (
    !normalized ||
    !/^0x(?:[0-9a-f]{2})+$/.test(normalized) ||
    !normalized.endsWith(ERC_8021_MAGIC_SUFFIX)
  ) {
    return null;
  }

  return normalized as Hex;
}

export function appendBaseBuilderCodeSuffix(
  callData: Hex,
  configuredSuffix = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE_SUFFIX
): Hex {
  const suffix = parseBaseBuilderCodeSuffix(configuredSuffix);

  if (!suffix) {
    return callData;
  }

  return `${callData}${suffix.slice(2)}` as Hex;
}
