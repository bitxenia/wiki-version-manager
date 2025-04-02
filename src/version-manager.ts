import { Version, VersionID } from "./version";

type ErrorName = "NOT_FOUND" | "ALREADY_EXISTS";

export class VersionError extends Error {
  name: ErrorName;
  message: string;
  version: VersionID;
  cause?: unknown;
  constructor(
    name: ErrorName,
    message: string,
    version: VersionID,
    cause?: any,
  ) {
    super();
    this.name = name;
    this.message = message;
    this.version = version;
    this.cause = cause;
  }
}

/**
 * Class for managing an article's versions, making version tree operations
 * simpler.
 */
export class VersionManager {
  private versions: Map<VersionID, Version>;
  private lastVersion: VersionID | null;
  private cachedMainBranch: Version[] | null;

  /**
   * @param versions Unordered array of versions for initializing a
   * VersionManager with an already existing article. This is the preferred way
   * to do that, as addVersion assumes the parent is already present, which
   * might not be the case in an unordered array.
   */
  constructor(versions?: Version[]) {
    this.versions = new Map();
    if (versions) {
      for (const version of versions) {
        this.addVersionRaw(version);
      }
    }
    this.lastVersion = this.getLastVersion();
    this.cachedMainBranch = null;
  }

  /**
   * Adds a version to the tree and calculates latest version again.
   * @throws VersionError of name ALREADY_EXISTS.
   */
  public addVersion(version: Version) {
    this.addVersionRaw(version);
    this.lastVersion = this.getLastVersion();
    this.cachedMainBranch = null;
  }

  /**
   * Returns all versions in an unordered array.
   */
  public getAllVersions(): Version[] {
    return Array.from(this.versions.values());
  }

  /**
   * Gets the main branch of the article. The main branch is determined by:
   * 1. Which branch is the longest, and
   * 2. If two or more branches are the longest, the one with the oldest latest
   * version (leaf) is chosen.
   *
   * @returns the main branch as an array of versions, from the root version to
   * the latest version.
   */
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
      if (!version) {
        throw new VersionError(
          "NOT_FOUND",
          "Version not found while walking main version branch",
          currentVersion,
        );
      }
      ret.push(version);
      currentVersion = version.parent;
    }
    ret.reverse();
    return ret;
  }

  private addVersionRaw(version: Version) {
    if (this.versions.has(version.id)) {
      throw new VersionError(
        "ALREADY_EXISTS",
        "Version with the same ID already exists",
        version.id,
      );
    }
    this.versions.set(version.id, version);
  }

  private getLastVersion(): string | null {
    const leavesIds = this.getLeaves(this.versions);
    if (leavesIds.size === 0) {
      return null;
    }
    const longestLeaves = this.getLongestBranchLeaf(
      leavesIds,
      this.versions,
    ).map((leafId) => this.versions.get(leafId)!);
    longestLeaves.sort((a, b) => (a.date < b.date ? 1 : -1));
    return longestLeaves.pop()!.id;
  }

  private getLeaves(versions: Map<VersionID, Version>): Set<VersionID> {
    const leaves: Set<VersionID> = new Set();
    const seen: Set<VersionID> = new Set();
    for (const [id, version] of versions) {
      if (seen.has(id)) continue;
      if (version.parent) {
        seen.add(version.parent);
        leaves.delete(version.parent);
      }
      leaves.add(id);
    }
    return leaves;
  }

  private getLongestBranchLeaf(
    leaves: Set<VersionID>,
    versions: Map<VersionID, Version>,
  ): VersionID[] {
    const rootDistanceByVersion: Map<VersionID, number> = new Map();
    let maxDistance = 0;
    const leafDistances: { leaf: VersionID; distance: number }[] = [];

    for (const leaf of leaves) {
      const distance = this.getVersionRootDistance(
        leaf,
        rootDistanceByVersion,
        versions,
      );
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
    allVersions: Map<VersionID, Version>,
  ): number {
    if (rootDistanceByVersion.has(versionId)) {
      return rootDistanceByVersion.get(versionId)!;
    }
    const version = allVersions.get(versionId);
    if (!version) {
      throw new VersionError(
        "NOT_FOUND",
        "Version not found while getting version distance",
        versionId,
      );
    }
    if (!version.parent) {
      rootDistanceByVersion.set(versionId, 0);
      return 0;
    }
    const distance =
      this.getVersionRootDistance(
        version.parent,
        rootDistanceByVersion,
        allVersions,
      ) + 1;
    rootDistanceByVersion.set(versionId, distance);
    return distance;
  }
}
