#!/usr/bin/env bash
echo "Since this is a Linux environment, we have to install some things in order to build for Windows."

echo "[INSTALL] ========== Installing gcc-multilib =========="
sudo apt-get install --no-install-recommends -y gcc-multilib g++-multilib

echo "[CHECK] ========== PRINT FOREIGN ARCHITECTURES BEFORE ENABLING i386 (this should print nothing at all) =========="
sudo dpkg --print-foreign-architectures

echo "[INSTALL] ========== Enabling i386 architecture =========="
sudo dpkg --add-architecture i386
sudo apt update

echo "[CHECK] ========== PRINT FOREIGN ARCHITECTURES AFTER ENABLING i386 (this should simply print -> i386) =========="
sudo dpkg --print-foreign-architectures

echo "[INSTALL] ========== Installing Aptitude =========="
sudo apt install aptitude

echo "[INSTALL] ========== Installing Wine =========="
wget -nc https://dl.winehq.org/wine-builds/winehq.key | sudo apt-key add -
sudo apt-add-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ focal main'
sudo apt update
sudo apt install --install-recommends winehq-stable
sudo aptitude install wine32 -y

echo "[CHECK] ========== PRINTING WINE VERSION (if empty, Wine failed to install) =========="
wine --version

echo "[BUILDING] ========== Everything is done, now compiling launcher for Windows =========="
npm run buildWindows