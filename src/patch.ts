import DiffMatchPatch from "diff-match-patch";

export type Patch = (new () => DiffMatchPatch.patch_obj)[];

export function getPatchFromTexts(oldText: string, newText: string): Patch {
  const dmp = new DiffMatchPatch();
  return dmp.patch_make(oldText, newText);
}
