import DiffMatchPatch from "diff-match-patch";
import { Version } from "./version";

/**
 * Compiles an article's text from an array of versions.
 * @param versions Array of versions, ordered from oldest to newest.
 * @returns Compiled article text.
 */
export function compileTextFromVersions(versions: Version[]): string {
  const dmp = new DiffMatchPatch();
  const patches = versions.flatMap((version) => version.patch);
  const [ret, results] = dmp.patch_apply(patches, "");
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) {
      throw new Error("Failed to apply patch");
    }
  }
  return ret;
}
