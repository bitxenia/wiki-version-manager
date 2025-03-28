import { Version, VersionManager } from "../src";

function createTestVersion(i: number, parent?: number): Version {
  return {
    id: `v${i}`,
    date: i.toString(),
    patch: [],
    parent: parent ? `v${parent}` : null,
  };
}

describe("VersionManager tests", () => {
  it("Empty main branch", () => {
    const versionManager = new VersionManager();
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(0);
  });

  it("Main branch with one version added", () => {
    const versionManager = new VersionManager();
    const version = createTestVersion(1);
    versionManager.addVersion(version);
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(1);
    expect(mainBranch.at(0)!).toEqual(version);
  });

  it("Main branch with one version added at constructor", () => {
    const version = createTestVersion(1);
    const versionManager = new VersionManager([version]);
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(1);
    expect(mainBranch.at(0)!).toEqual(version);
  });

  it("Main branch with two versions", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    const versionManager = new VersionManager(versions);
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(2);
    expect(mainBranch).toEqual(versions);
  });

  it("error on non existent versionID for branch", () => {
    const versionManager = new VersionManager();
    const call = () => versionManager.getBranch("nonsense");
    expect(call).toThrow(Error);
  });

  it("linear three version main branch", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    versions.push(createTestVersion(3, 2));
    const versionManager = new VersionManager(versions);
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(3);
    expect(mainBranch).toEqual(versions);
  });

  it("forked three version main branch", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    versions.push(createTestVersion(3, 1));
    const versionManager = new VersionManager(versions);
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(2);
    expect(mainBranch).toEqual([versions[0], versions[1]]);
  });

  it("forked four version main branch", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    versions.push(createTestVersion(3, 1));
    versions.push(createTestVersion(4, 2));
    const versionManager = new VersionManager(versions);
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(3);
    expect(mainBranch).toEqual([versions[0], versions[1], versions[3]]);
  });

  it("get version branch twice", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    versions.push(createTestVersion(3, 1));
    versions.push(createTestVersion(4, 2));
    const versionManager = new VersionManager(versions);
    const ret1 = versionManager.getMainBranch();
    const ret2 = versionManager.getMainBranch();
    expect(ret1).toEqual(ret2);
  });

  it("get shortest branch from forked four version tree", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    versions.push(createTestVersion(3, 1));
    versions.push(createTestVersion(4, 2));
    const versionManager = new VersionManager(versions);
    const branch = versionManager.getBranch(versions[2].id);
    expect(branch).toEqual([versions[0], versions[2]]);
  });

  it("root branch from forked four version tree", () => {
    const versions: Version[] = [];
    versions.push(createTestVersion(1));
    versions.push(createTestVersion(2, 1));
    versions.push(createTestVersion(3, 1));
    versions.push(createTestVersion(4, 2));
    const versionManager = new VersionManager(versions);
    const branch = versionManager.getBranch(versions[0].id);
    expect(branch).toEqual([versions[0]]);
  });
});
