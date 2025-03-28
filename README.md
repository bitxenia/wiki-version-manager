# Wiki Version Manager
Library for managing the different versions that make up each article in bitxenia's astraWiki. It allows the libraries implementing their version of the wiki to create and manage versions, as well as compile the resulting text. The user can also select from different branches within the version tree.

## Installation
```bash
npm install wiki-version-manager
```

## Usage
The library revolves around instancing a VersionManager, which keeps track of all the versions an article has.
```typescript
const initialText = "Text text text";
const initialVersion = newVersion("", initialText);
const versionManager = new VersionManager();
versionManager.addVersion(initialVersion);
const followUpText = "Text text test";
const followUpVersion = newVersion(initialText, followUpText, initialVersion.id);
versionManager.addVersion(followUpVersion);

const mainBranch = versionManager.getMainBranch();
const articleText = compileTextFromVersions(mainBranch);
```

The VersionManager class also supports being instanced with an existing set of versions, which is useful for when loading an existing article.

```typescript 
const versionManager = new VersionManager(versions);

const mainBranch = versionManager.getMainBranch();
const articleText = compileTextFromVersions(mainBranch);
```

Lastly, the library supports loading and compiling any branch in the version tree by specifying the version from which to get the branch from.

```typescript 
const versionManager = new VersionManager(versions);

const branch = versionManager.getMainBranch(versionID);
const articleText = compileTextFromVersions(branch);
```