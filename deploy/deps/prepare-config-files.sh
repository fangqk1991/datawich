#!/bin/sh

configSecret="$1"
sourceDir="$2"
targetDir="$3"

echo "sourceDir: ${sourceDir}"
echo "targetDir: ${targetDir}"

openssl enc -d -aes256 -k "${configSecret}" -in "${sourceDir}" | tar xz -C "${targetDir}"
