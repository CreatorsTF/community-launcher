#!/usr/bin/env bash

echo "[INSTALL] ========== Installing a package in order to build the launcher in a distributable format for Linux =========="
sudo apt-get install --no-install-recommends -y libopenjp2-tools

echo "[BUILDING] ========== Compiling lanucher for Linux =========="
npm run buildLinux