# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.0.1](https://github.com/tribally-games/game-base/compare/v3.0.0...v3.0.1) (2025-12-19)


### Code Refactoring

* **recording:** switch from brotli to lzma compression ([b08b0c4](https://github.com/tribally-games/game-base/commit/b08b0c47699445f865c6b371b2578a288a16722c))

## [3.0.0](https://github.com/tribally-games/game-base/compare/v2.4.0...v3.0.0) (2025-12-18)


### ⚠ BREAKING CHANGES

* **recording:** Compressed recording format now includes size header,
existing compressed recordings need re-compression

### Bug Fixes

* **build:** target browser for esm bundle to avoid node-specific imports ([35df4bc](https://github.com/tribally-games/game-base/commit/35df4bc7ba192826678e31c5231a6051dbd1dd06))


### Code Refactoring

* **recording:** switch from brotli-wasm to brotli.js ([d1426fe](https://github.com/tribally-games/game-base/commit/d1426fe39ce6a5e305d03918dd38d52afc51ec3c))

## [2.4.0](https://github.com/tribally-games/game-base/compare/v2.3.2...v2.4.0) (2025-12-18)


### Features

* **recording:** add brotli compression/decompression for game recordings ([1f4795f](https://github.com/tribally-games/game-base/commit/1f4795f838f158ee92124ec1046b7ba9ba3ecb87))

## [2.3.2](https://github.com/tribally-games/game-base/compare/v2.3.1...v2.3.2) (2025-12-14)

## [2.3.1](https://github.com/tribally-games/game-base/compare/v2.3.0...v2.3.1) (2025-12-13)


### Code Refactoring

* migrate to clockwork-engine monorepo packages ([#5](https://github.com/tribally-games/game-base/issues/5)) ([1b501d7](https://github.com/tribally-games/game-base/commit/1b501d72e44159de53b0f7e2138a04179b6768fd))

## [2.3.0](https://github.com/tribally-games/game-base/compare/v2.2.0...v2.3.0) (2025-12-01)


### Features

* **demo-template:** filter snapshots for validation using extractor function ([689e855](https://github.com/tribally-games/game-base/commit/689e855a91509b2345acb9182ea11963b2f6e2a5))

## [2.2.0](https://github.com/tribally-games/game-base/compare/v2.1.3...v2.2.0) (2025-11-30)


### Features

* **demo-template:** add headless validation for game recordings ([d387e0e](https://github.com/tribally-games/game-base/commit/d387e0e1f54d5ce674aae1b1c8e96d77b13d93c3))

## [2.1.3](https://github.com/tribally-games/game-base/compare/v2.1.2...v2.1.3) (2025-11-29)

## [2.1.2](https://github.com/tribally-games/game-base/compare/v2.1.1...v2.1.2) (2025-11-27)


### Bug Fixes

* **demo-loader:** improve content type detection for asset loading ([c4e6088](https://github.com/tribally-games/game-base/commit/c4e6088052326c9b9d278f4e2acf5cb0e4bf035e))

## [2.1.1](https://github.com/tribally-games/game-base/compare/v2.1.0...v2.1.1) (2025-11-27)


### Code Refactoring

* update to latest clockwork engine api ([#4](https://github.com/tribally-games/game-base/issues/4)) ([2270d93](https://github.com/tribally-games/game-base/commit/2270d9377585efc26a54c3edbd9c3d5b69beaa60))

## [2.1.0](https://github.com/tribally-games/game-base/compare/v0.5.17...v2.1.0) (2025-11-17)


### Features

* add audio manager system with web audio api support ([2aa6cd4](https://github.com/tribally-games/game-base/commit/2aa6cd47b3870d444d1a8fc9f41289451ccd47ec))


### Code Refactoring

* use real audio manager for replay mode ([6d796ba](https://github.com/tribally-games/game-base/commit/6d796ba98212421885923efa841644515e9a6ea0))

## [2.0.0](https://github.com/tribally-games/game-base/compare/v0.5.17...v2.0.0) (2025-11-17)

## [1.0.0](https://github.com/tribally-games/game-base/compare/v0.5.17...v1.0.0) (2025-11-17)

## [0.5.17](https://github.com/tribally-games/game-base/compare/v0.5.16...v0.5.17) (2025-11-16)


### Features

* add http headers to demo server asset endpoint ([8d8abc6](https://github.com/tribally-games/game-base/commit/8d8abc6c8f1b89f2435ef7ef87c25623e1c54629))

## [0.5.16](https://github.com/tribally-games/game-base/compare/v0.5.15...v0.5.16) (2025-11-16)

## [0.5.15](https://github.com/tribally-games/game-base/compare/v0.5.14...v0.5.15) (2025-11-16)


### Features

* add comprehensive asset loader system with spritesheets ([b3ec461](https://github.com/tribally-games/game-base/commit/b3ec461613baa9b09807df3a37745510410b28fe))

## [0.5.14](https://github.com/tribally-games/game-base/compare/v0.5.13...v0.5.14) (2025-11-16)


### Features

* export replay manager in game module exports ([3effe2f](https://github.com/tribally-games/game-base/commit/3effe2fafe79883982db210a7755d31ffbf81dac))

## [0.5.13](https://github.com/tribally-games/game-base/compare/v0.5.12...v0.5.13) (2025-11-15)


### Code Refactoring

* optimize input manager updates and remove redundant state tracking ([0f60f8d](https://github.com/tribally-games/game-base/commit/0f60f8de745dc1a54fcda2c9e34d19717e1b9c44))

## [0.5.12](https://github.com/tribally-games/game-base/compare/v0.5.11...v0.5.12) (2025-11-15)


### Features

* export keystrokes input manager with optional reset/pause bindings ([636a3cc](https://github.com/tribally-games/game-base/commit/636a3cc835a129f9143496c2f06e42984324b910))

## [0.5.11](https://github.com/tribally-games/game-base/compare/v0.5.10...v0.5.11) (2025-11-15)


### Features

* add asset copying to demo cli build mode and comprehensive tests ([df0cdbf](https://github.com/tribally-games/game-base/commit/df0cdbf944b5a1dcc8040ac81f7ea1ac79ffacd4))

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
