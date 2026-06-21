/** Use empty string instead of null for controlled text inputs. */
export function controlledFieldValue(
  value: string | number | readonly string[] | null | undefined,
): string | number | readonly string[] {
  return value ?? "";
}
