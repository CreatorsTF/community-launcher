## Version 0.2.1 - (ALPHA)
### 28/12/2020 - 16:25 (GMT)
- Added version display to settings page
- Added "Open Log Folder" button to settings page to help with finding logs on linux.
- Updated server mod list to be more flexable.
- Server list for Creators.TF content now includes BalanceMod servers.
- Events servers can now be seen on the server list when viewed from the "Creators.TF Events Servers" mod.
- Updated events content logo.
- Fixed bug preventing mod installation using new mod list data.
- Changed Events server content install location to `/download/` (existing installations are unaffected).
- Added cache work around to ensure launcher can get latest mod information sooner.


## Version 0.2 - (ALPHA)
### 29/11/2020 - 21:00 (GMT)
- Added Creators.TF Events Servers content to launcher. (Thanks Kaya for the artwork!)
- Added Ultimate TF2 fixes to the launcher. (Thanks agrastiOs!)
- Better error handling for Cloudflare issues
- Fixed bug with mod removal failing.
- Added support to cancel downloads and installs.
- Should have fixed error of download never finishing. (Please open an Issue if you get this still).
- Main window content is better centered.
- Fixed issue with failing to write zip file contents
- Fixed file name retrieval from downloaded files.
- Fixed some main page styling issues.


## Version 0.1.32 - (ALPHA)
### 25/10/2020 - 14:35 (GMT)
- Updated Electron, @mdi/font and marked to its latest versions (v10.1.5, v5.7.55 and v1.2.0 respectively).
- Fixed the button to update the launcher to the newest version not showing in some cases (Hopefully this time it's fixed for real).
- Mods now display their version on the top left corner of their pages.
- Applied dynamic resizing to all windows.
- Small style changes.
- Settings page:
 - Tweaked page a bit.
 - Added "Copy to Clipboard" button to easier get the config contents.


## Version 0.1.31 - (ALPHA)
### 24/09/2020 - 20:49 (GMT)
- Steam path can now be correctly located again on Linux.
- Added handle and error dialog to better explain JSON parse error.
- Added ability to re auto locate TF2 directory if a Steam path is given. (Thanks eisbaer66!).


## Version 0.1.30 - (ALPHA)
### 08/09/2020 - 22:20 (GMT)
- Updated Electron to v10.1.1.
- Improved auto locating for the Steam folder (thanks brucelay!).
- Changed server page so it can be refreshed and loaded correctly without needing to be reopened.
- Changed server page's style a bit.


## Version 0.1.20 - (ALPHA)
### 30/08/2020 - 20:04 (GMT)
- This version only applies to Windows installer users. Linux and unpacked ZIP users with v0.1.2 should not worry about updating to this version.
 - Fixed a bug where auto-update users didn't get the launcher's newest version.


## Version 0.1.2 - (ALPHA)
### 30/08/2020 - 18:16 (GMT)
- Added G-Man Announcer pack.
- Launcher's main window now dynamically adjusts itself in relation to user's monitor size on launch.
- Improved update warning for non auto-updater users when connection to the GitHub API fails.
- Improved logged data.


## Version 0.1.11 - (ALPHA)
### 27/08/2020 - 23:25 (GMT)
- Definitive bugfix to solve mod installation hanging on `Starting...` for some users.
- Fixed "Downloading" button not disappearing when an update finished download.
- Updated Electron to v10.0.1.
- Improved logged data.


## Version 0.1.1 - (ALPHA)
### 24/08/2020 - 22:32 (GMT)
- Small bugfix to solve mod installation hanging on `Starting...` for some users
- Improved logged data


## Version 0.1.0 - (ALPHA)
### 22/08/2020 - 19:33 (GMT)
- [WINDOWS INSTALLER USERS ONLY]
 - Fixed a rare case where the launcher wouldn't return update status. (Launcher update, not mod-related).
- Updated Electron to v9.2.1.
- Added server list page.
- Fixed a bug causing the TF2 directory to not be found (thanks brucelay!).
- Fixed various bugs related to path finding on Linux.
- Implemented better patch notes system for the launcher.
- Added warning for non auto-update users so they can know when a new version is available.
- Small layout changes.


## Version 0.0.5 - (ALPHA)
### 08/08/2020 - 00:28 (GMT)
- Released launcher's alpha version
