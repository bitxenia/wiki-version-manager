import { Version, VersionID } from "./version";

export class VersionManager {
  private versions: Map<VersionID, Version>;
  private lastVersion: VersionID | null;
  private cachedMainBranch: Version[] | null;

  constructor(versions?: Version[]) {
    this.versions = new Map();
    if (versions) {
      for (const version of versions) {
        this.addVersion(version);
      }
    }
    this.lastVersion = this.versions.size > 0 ? this.getLastPatch() : null;
    this.cachedMainBranch = null;
  }

  public addVersion(version: Version) {
    this.addVersionRaw(version);
    this.lastVersion = this.getLastPatch();
    this.cachedMainBranch = null;
  }

  public getMainBranch(): Version[] {
    if (this.cachedMainBranch) return this.cachedMainBranch;
    let leaf: VersionID | null = this.lastVersion;
    if (!leaf) return [];
    const ret = this.getBranch(leaf);
    this.cachedMainBranch = ret;
    return ret;
  }

  /**
   * Get complete branch starting from a given version, down to the root.
   * @param version Version to start the branch from.
   * @returns Array of versions, from root to the given version.
   */
  public getBranch(version: VersionID): Version[] {
    const ret: Version[] = [];
    let currentVersion: VersionID | null = version;
    while (currentVersion) {
      const version = this.versions.get(currentVersion);
      if (!version)
        throw Error("Version not found while walking main version branch");
      ret.push(version);
      currentVersion = version.parent;
    }
    ret.reverse();
    return ret;
  }

  private addVersionRaw(version: Version) {
    if (this.versions.has(version.id)) {
      throw Error("Version with the same ID already exists");
    }
    this.versions.set(version.id, version);
  }

  private getLastPatch(): string {
    const leavesIds = this.getLeaves();
    const longestLeaves = this.getLongestBranchLeaf(leavesIds).map(
      (leafId) => this.versions.get(leafId)!,
    );
    longestLeaves.sort((a, b) => (a.date < b.date ? 1 : -1));
    return longestLeaves.pop()!.id;
  }

  private getLeaves(): Set<VersionID> {
    const leaves: Set<VersionID> = new Set();
    const seen: Set<VersionID> = new Set();
    this.versions.forEach((version, id) => {
      if (seen.has(id)) return;
      if (version.parent) {
        seen.add(version.parent);
        leaves.delete(version.parent);
      }
      leaves.add(id);
    });
    return leaves;
  }

  private getLongestBranchLeaf(leaves: Set<VersionID>): VersionID[] {
    const rootDistanceByVersion: Map<VersionID, number> = new Map();
    let maxDistance = 0;
    const leafDistances: { leaf: VersionID; distance: number }[] = [];

    for (const leaf of Array.from(leaves)) {
      const distance = this.getVersionRootDistance(leaf, rootDistanceByVersion);
      leafDistances.push({ leaf, distance });
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    return leafDistances
      .filter((ld) => ld.distance === maxDistance)
      .map((ld) => ld.leaf);
  }

  private getVersionRootDistance(
    versionId: VersionID,
    rootDistanceByVersion: Map<VersionID, number>,
  ): number {
    if (rootDistanceByVersion.has(versionId)) {
      return rootDistanceByVersion.get(versionId)!;
    }
    const version = this.versions.get(versionId);
    if (!version) throw Error(`Version not found: ${versionId}`);
    if (!version.parent) {
      rootDistanceByVersion.set(versionId, 0);
      return 0;
    }
    const distance =
      this.getVersionRootDistance(version.parent, rootDistanceByVersion) + 1;
    rootDistanceByVersion.set(versionId, distance);
    return distance;
  }
}
