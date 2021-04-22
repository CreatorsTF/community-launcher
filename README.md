# [Creators.TF](https://creators.tf) [Community Launcher](https://creators.tf/launcher) (Alpha)

## This repository contains the source code and releases for the [Creators.TF](https://creators.tf) [Community Launcher](https://creators.tf/launcher)

### Core features:
* Launcher auto-updating (Only via installer)
* Custom mod support
* GitHub release mod support
* More details on our [website page](https://creators.tf/launcher)

### Useful links for this repository:
* [Releases](https://github.com/ampersoftware/Creators.TF-Community-Launcher/releases) -- [Latest release](https://github.com/ampersoftware/Creators.TF-Community-Launcher/releases/latest)
* [Changelogs](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/changelog.md)
* [License](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/LICENSE)
* [Code of Conduct](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/CODE_OF_CONDUCT.md) (TL;DR; common sense)

### Maintainers
* [Jota](https://github.com/jota11) - jota@creators.tf - UI and UX Lead
* [rob5300](https://github.com/rob5300) - rob5300@creators.tf - Core Feature Lead

### Contributing
If you have something to contribute, please, open a pull request! Make sure your PR tries to solve/improve one thing at a time and isn't messy. Pull requests should always have a specific goal to accomplish.

Please do NOT make a pull request or change that only seeks to change code styling or do "housekeeping" as these will be denied and closed.

If you have a bug report or a suggestion, open an issue! Try to use the templates and give good information.
The launcher is currently in an alpha state so any help is appreciated.

## Launching and Building from Source
If you want to build the launcher yourself, you need to have [Node.JS](https://nodejs.org/en/download/) installed, which should also include [npm](https://www.npmjs.com/get-npm).
Clone the repository using git *(or download from this page)* and do `npm install` in the main repository using your system's CLI to download the required packages.

You can start the launcher for testing purposes without building via `npm run compileAndStart`.

You can build for Windows or Linux via the included build scripts using `npm run buildWindows` or `npm run buildLinux`.
If you need, you can edit these in [package.json](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/package.json#L9) to build to your liking, but changes made to these should not be committed if you plan to make a PR.
