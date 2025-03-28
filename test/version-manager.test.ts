import { VersionManager } from "../src";

describe("VersionManager tests", () => {
  it("Empty main branch", () => {
    const versionManager = new VersionManager();
    const mainBranch = versionManager.getMainBranch();
    expect(mainBranch.length).toBe(0);
  });
});
