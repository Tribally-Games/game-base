# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.5.10](https://github.com/tribally-games/game-base/compare/v0.5.9...v0.5.10) (2025-11-14)


### Code Refactoring

* remove jackpot fields from base game snapshot interface ([122fb2a](https://github.com/tribally-games/game-base/commit/122fb2ac757675f7bddfd993dace50a536014282))

## [0.5.9](https://github.com/tribally-games/game-base/compare/v0.5.8...v0.5.9) (2025-11-14)


### Features

* add flexible input mapping system with keystrokes integration ([8dc82ce](https://github.com/tribally-games/game-base/commit/8dc82ce1374f63fb5a0d296668d7d8795123725c))

## [0.5.8](https://github.com/tribally-games/game-base/compare/v0.5.7...v0.5.8) (2025-11-13)

## [0.5.7](https://github.com/tribally-games/game-base/compare/v0.5.6...v0.5.7) (2025-11-13)


### Features

* add spritesheet support to demo configurator ([23b833f](https://github.com/tribally-games/game-base/commit/23b833f28d64da3fc6b341dc460333bbc070000f))

## [0.5.6](https://github.com/tribally-games/game-base/compare/v0.5.5...v0.5.6) (2025-11-13)


### Features

* add translucent start overlay to game canvas ([7380af8](https://github.com/tribally-games/game-base/commit/7380af8cdf1fd74f57bb5a9bd1afb3170b8700a3))

## [0.5.5](https://github.com/tribally-games/game-base/compare/v0.5.4...v0.5.5) (2025-11-13)


### Features

* enhance r key reset to match reset button functionality ([697ce9d](https://github.com/tribally-games/game-base/commit/697ce9d504bbf90a8868237f5956b65ff5e12b8e))

## [0.5.4](https://github.com/tribally-games/game-base/compare/v0.5.3...v0.5.4) (2025-11-13)


### Features

* add r key reset functionality to game renderer ([d960435](https://github.com/tribally-games/game-base/commit/d960435018f15af993e7d2539c0231b7a4eb7ef0))

## [0.5.3](https://github.com/tribally-games/game-base/compare/v0.5.2...v0.5.3) (2025-11-11)


### Code Refactoring

* **demo:** remove redundant canvas reset call ([36cf910](https://github.com/tribally-games/game-base/commit/36cf91004721afba83f6532c7a24d49f2bec0e7e))

## [0.5.2](https://github.com/tribally-games/game-base/compare/v0.5.1...v0.5.2) (2025-11-11)


### Code Refactoring

* **demo:** update for clockwork-engine v1.9.5 gamecanvas api changes ([7d10cae](https://github.com/tribally-games/game-base/commit/7d10caece8bb14c64b701666070fc847af22285c))

## [0.5.1](https://github.com/tribally-games/game-base/compare/v0.5.0...v0.5.1) (2025-11-10)


### Code Refactoring

* **demo:** simplify canvas border styling ([449c87a](https://github.com/tribally-games/game-base/commit/449c87a650d7cc5459b90febb256915b620a006a))

## [0.5.0](https://github.com/tribally-games/game-base/compare/v0.4.1...v0.5.0) (2025-11-10)


### ⚠ BREAKING CHANGES

* **demo:** DemoLoader constructor no longer accepts fileSystemLoader
parameter. Asset loading now uses Vite aliases via @assets/* imports.
* **demo:** Game imports now use @game prefix directly instead
of @game-module and @game-demo
* **demo-template:** DemoFileSystemLoader now requires a baseUrl parameter (defaults to /@fs/)
and works in browser environments only. For Node.js environments, use a different approach.

### Features

* **cli:** add --assets-dir option to demo command for dynamic asset aliasing ([0934245](https://github.com/tribally-games/game-base/commit/0934245228923e7349661762a1096993cade14c3))
* **demo-template:** add filesystem asset loader for node.js environments ([d8190dd](https://github.com/tribally-games/game-base/commit/d8190ddb94c121add751878315b4a9af99cd49ac))


### Bug Fixes

* **demo-template:** convert asset loader to use http via vite dev server ([cf95196](https://github.com/tribally-games/game-base/commit/cf951969b7f5abb70ace6c99b5f2b3bc2d03d031))
* **demo:** add /src to [@game](https://github.com/game) imports since alias now points to game root ([e7cb856](https://github.com/tribally-games/game-base/commit/e7cb8562b5b99801861c2135566c080633777720))
* **demo:** replace asset module imports with http middleware serving ([382f88f](https://github.com/tribally-games/game-base/commit/382f88f00f9cdf711994eb49b6d4d8252bd057ef))


### Code Refactoring

* **demo:** revert to multi-alias pattern and add dynamic asset aliasing ([2fcc74b](https://github.com/tribally-games/game-base/commit/2fcc74b49532afe722ffecab82cbf2bbbc8ef92b))
* **demo:** simplify to single [@game](https://github.com/game) alias pointing to game root ([bdbf29d](https://github.com/tribally-games/game-base/commit/bdbf29d9ae7c9e891742465fc5ea584c8472ab7c))

## [0.4.1](https://github.com/tribally-games/game-base/compare/v0.4.0...v0.4.1) (2025-11-10)


### Features

* **cli:** add file size tracking and smart compression to compress command ([16102f4](https://github.com/tribally-games/game-base/commit/16102f458a7a070e1eef617f81139d84956fa2aa))

## [0.4.0](https://github.com/tribally-games/game-base/compare/v0.3.0...v0.4.0) (2025-11-09)


### ⚠ BREAKING CHANGES

* GameModuleConfig now requires all previously optional
properties (customOperators, operatorMetadata, validateCustomObjective,
getProgressValue, setupInitializationData, getMetaConfigSchema).
Additionally, extractGameStats/formatGameStats have been renamed to
extractGameSnapshotInfo/formatGameSnapshotInfo with updated return types
to support non-numeric values.

- Make all GameModuleConfig properties required for API clarity
- Rename extractGameStats → extractGameSnapshotInfo
- Rename formatGameStats → formatGameSnapshotInfo
- Change return types from number to any for richer game state info
- Add createDefaultConfig() test helper to reduce test verbosity
- Include CLAUDE.md in published package files

Migration: Games must provide all config properties and update method
names.

* feat(cli): add interactive demo development server with react template

- Add 'demo' CLI command for running games in development mode
- Include Vite-based dev server with hot module replacement
- Add production build mode for demo distributions
- Provide React 19 template with game controls and state management
- Support recording/replay with variable speed playback
- Add live objectives tracking and completion notifications
- Include meta-configuration modal for game settings
- Display rendering statistics (FPS, tick rate)
- Externalize React/Vite dependencies from CLI bundle
- Add dependencies: vite@^7, react@^19, @vitejs/plugin-react@^4

### Features

* demo scaffolding for games ([#3](https://github.com/tribally-games/game-base/issues/3)) ([eaed9e6](https://github.com/tribally-games/game-base/commit/eaed9e678c44406898f5c6ee80785696956f5d9e))

## [0.3.0](https://github.com/tribally-games/game-base/compare/v0.2.12...v0.3.0) (2025-11-07)


### ⚠ BREAKING CHANGES

* Removed MobileControlScheme enum and simplified
createGameModule function signature. Games using createGameModule should
remove GameInputType and GameIntent parameters from their calls.

### Features

* add clockwise/counter-clockwise intents and simplify game module api ([cef6db2](https://github.com/tribally-games/game-base/commit/cef6db28acc24007b663a8bd92f19d0e6dd95eac))

## [0.2.12](https://github.com/tribally-games/game-base/compare/v0.2.11...v0.2.12) (2025-11-07)


### Bug Fixes

* correct typescript types path in package.json ([de59dc3](https://github.com/tribally-games/game-base/commit/de59dc33340ee14d203279739d834a6f56287243))

## [0.2.11](https://github.com/tribally-games/game-base/compare/v0.2.10...v0.2.11) (2025-11-07)

## [0.2.10](https://github.com/tribally-games/game-base/compare/v0.2.9...v0.2.10) (2025-11-07)


### Features

* cli for converting wav png and jpg to webp etc ([#2](https://github.com/tribally-games/game-base/issues/2)) ([2e65859](https://github.com/tribally-games/game-base/commit/2e658591c8cc927374a4b3d9105fe3fae3c4e1e3))

## [0.2.9](https://github.com/tribally-games/game-base/compare/v0.2.8...v0.2.9) (2025-11-04)

## [0.2.8](https://github.com/tribally-games/game-base/compare/v0.2.7...v0.2.8) (2025-10-22)


### Code Refactoring

* peer dep ([80a6eca](https://github.com/tribally-games/game-base/commit/80a6ecaa6c9e15f7e1abe2f9e081f401601de842))

## [0.2.7](https://github.com/tribally-games/game-base/compare/v0.2.6...v0.2.7) (2025-10-22)


### Code Refactoring

* upgrade clockwork engine ([631d2de](https://github.com/tribally-games/game-base/commit/631d2de35af0863460d4a272c214d2ca21f192e3))

## [0.2.6](https://github.com/tribally-games/game-base/compare/v0.2.5...v0.2.6) (2025-10-22)


### Code Refactoring

* standardize string list field naming to use selected index ([0c3acbd](https://github.com/tribally-games/game-base/commit/0c3acbd0dc562e2f59dd8127a621b46efbe1bf8f))

## [0.2.5](https://github.com/tribally-games/game-base/compare/v0.2.4...v0.2.5) (2025-10-21)


### Features

* add meta config system for admin ui generation ([7b5517e](https://github.com/tribally-games/game-base/commit/7b5517eb6a71ab71ab45affd8dadae0713f896fb))

## [0.2.4](https://github.com/tribally-games/game-base/compare/v0.2.2...v0.2.4) (2025-10-20)


### Features

* add getgamemoduleconfig export to game modules ([fe8d480](https://github.com/tribally-games/game-base/commit/fe8d4802e07e3e9f3554dcf5f4cda4af532cb1e7))

## [0.2.2](https://github.com/tribally-games/game-base/compare/v0.2.1...v0.2.2) (2025-10-20)


### Code Refactoring

* remove game module registry and require config parameter ([8b2e0fe](https://github.com/tribally-games/game-base/commit/8b2e0fe08a316d427c188b3924e3a9c1c3c2c1cd))

## [0.2.1](https://github.com/tribally-games/game-base/compare/v0.1.2...v0.2.1) (2025-10-20)


### Features

* add game types enums and formatgamestats support with comprehensive tests ([caebbf6](https://github.com/tribally-games/game-base/commit/caebbf625d699070a1d0ad80e574facf8ea80378))


### Documentation

* update coverage badge url to match repository organization case ([07d0851](https://github.com/tribally-games/game-base/commit/07d0851732c2efd4f59333002e15abdf3d1660ea))

## [0.1.2](https://github.com/tribally-games/game-base/compare/v0.1.1...v0.1.2) (2025-10-20)


### Code Refactoring

* rename package to [@tribally](https://github.com/tribally).games/game-base and update repository ([7ba7701](https://github.com/tribally-games/game-base/commit/7ba7701f0f6ddd64fce0c1eea719cb0340a0b08f))

## 0.1.1 (2025-10-20)


### Features

* initial arcade-games-base package with objectives system and git hooks ([a39efa2](https://github.com/tribally-games/game-base/commit/a39efa2f6d2b2588f2e533962cd35495e902a930))
