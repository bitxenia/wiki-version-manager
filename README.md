# Wiki Version Manager

Manage the different versions that make up each article in bitxenia's
astraWiki. It supports creating and managing versions, and compiling
the resulting text. The user can also select from different branches within the
version tree.

This library fills the need to find a solution for parallel edits in articles.
Creating a version tree, as opposed to a version list, ensures multiple
versions can have the same parent version, avoiding invalid states altogether.

## Installation

```bash
npm install @bitxenia/wiki-version-manager
```

## Usage

The library revolves around instancing a VersionManager, which keeps track of
all the versions an article has. The VersionManager then can calculate a main
branch based on the heuristic explained later.

```typescript
const initialText = "Text text text";
const initialVersion = newVersion("", initialText);
const versionManager = new VersionManager();
versionManager.addVersion(initialVersion);
const followUpText = "Text text test";
const followUpVersion = newVersion(
  initialText,
  followUpText,
  initialVersion.id,
);
versionManager.addVersion(followUpVersion);

const mainBranch = versionManager.getMainBranch();
const articleText = compileTextFromVersions(mainBranch);
```

The user can create a VersionManager with an existing set of versions, which is
useful for when loading an existing article.

```typescript
const versionManager = new VersionManager(versions);

const mainBranch = versionManager.getMainBranch();
const articleText = compileTextFromVersions(mainBranch);
```

Lastly, the library supports loading and compiling any branch in the version
tree by specifying the version from which to get the branch from.

```typescript
const versionManager = new VersionManager(versions);

const branch = versionManager.getMainBranch(versionID);
const articleText = compileTextFromVersions(branch);
```

## Development

### Clone and install dependencies

```bash
git clone git@github.com:bitxenia/wiki-version-manager.git
cd wiki-version-manager
npm install
```

### Run tests

```bash
npm t
```

### Build

```bash
npm run build
```

## Contribute

You can check out the active issues or create new ones to contribute.
