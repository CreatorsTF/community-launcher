#!/usr/bin/env bash

echo "========== Starting zipping of unpacked Windows files =========="
DISTDIR=dist
cd $DISTDIR

echo "========== [ZIPPING] Creating ZIP package for Windows 32bits files =========="
zip -r win-ia32-unpacked.zip win-ia32-unpacked

echo "========== [ZIPPING] Creating ZIP package for Windows 64bits files =========="
zip -r win-unpacked.zip win-unpacked

echo "========== Windows packaging done =========="