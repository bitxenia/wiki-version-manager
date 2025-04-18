import { getPatchFromTexts, Patch } from "./patch";

export type VersionID = string;

export type Version = {
  id: VersionID;
  date: string;
  patch: Patch;
  parent: string | null;
};

/**
 * Creates a new version from comparing old and new article text, taking into
 * consideration the parent of the new version.
 */
export function newVersion(
  oldText: string,
  newText: string,
  parent?: VersionID,
): Version {
  const id = crypto.randomUUID();
  const date = Date.now().toString();
  const patch = getPatchFromTexts(oldText, newText);
  return {
    id,
    date,
    patch,
    parent: parent ?? null,
  };
}
