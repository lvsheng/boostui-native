#!/usr/bin/env bash
node release.js
cp release/boost.js /Users/lvsheng/work/clouda/golf/lib/boost.js

cd /Users/lvsheng/work/clouda/golf/
sh build.sh
cd -
