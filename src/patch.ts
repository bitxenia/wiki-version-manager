import DiffMatchPatch from "diff-match-patch";
import { Version } from "./version";

export type Patch = (new () => DiffMatchPatch.patch_obj)[];

export function compileTextFromVersions(versions: Version[]): string {
  const dmp = new DiffMatchPatch();
  const patches = versions.flatMap((version) => version.patch);
  const [ret, results] = dmp.patch_apply(patches, "");
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) {
      throw new Error(`Failed to apply patch ${i}`);
    }
  }
  return ret;
}

export function getPatchFromTexts(oldText: string, newText: string): Patch {
  const dmp = new DiffMatchPatch();
  return dmp.patch_make(oldText, newText);
}
