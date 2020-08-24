# [Creators.TF](https://creators.tf) [Community Launcher](https://creators.tf/launcher) (Alpha)

## This repository contains the source code and releases for [Creators.TF](https://creators.tf) [Community Launcher](https://creators.tf/launcher)

### Core features:
* Launcher auto-updating (Only via installer)
* Custom mod support
* Github release mod support
* More details on our [website page](https://creators.tf/launcher)

### Useful links for this repository:
* [Changelogs](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/changelog.md)
* [License](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/LICENSE)
* [Code of conduct](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/master/CODE_OF_CONDUCT.md) (TL;DR; common sense)

### Maintainers
* [Jota](https://github.com/jota11) - jota@creators.tf - UI and UX Lead
* [rob5300](https://github.com/rob5300) - rob5300@creators.tf - Core Feature Lead

### Contributing
If you have something to contribute then please open a pull request! Make sure your PR tries to solve/improve one thing at a time and isn't messy. It should have a specific goal to accomplish.

If you have a bug or a suggestion, open an issue! Try to use the templates and give good information.
The launcher is currently in an alpha state so any help is appreciated.

## Launching and Building from Source
If you want to build the launcher yourself, you need to have [Node.JS](https://nodejs.org/en/download/) installed, which should also include npm.
Clone the repository using git (or download from this page) and then do `npm install` in the main repository directory to download the required packages.

You can start the launcher without building via `npm run start`. 
You can build for Windows or Linux via the included build scripts using `npm run buildwindows` and `npm run buildlinux`.
If you need, you can edit these in [*package.json*](https://github.com/ampersoftware/Creators.TF-Community-Launcher/blob/7f7c202fa949aae20579d1d7c51e5cdcaa33c4bc/package.json#L8) to build to your liking, but changes made to these should not be committed if you plan to make a PR.
