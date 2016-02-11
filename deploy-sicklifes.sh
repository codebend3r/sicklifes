#!/bin/bash

echo 'DEPLOY STARTED'
# mkdir -p ~/git/crivas.github.io/dev
mv ./builds/dev ~/git/crivas.github.io
cd ..
cd crivas.github.io
ls -l
# git status

echo 'DEPLOY COMPLETE'
