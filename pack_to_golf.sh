#!/usr/bin/env bash
sh release.sh
cp release/boost.js /Users/lvsheng/work/clouda/golf/lib/boost.js

cd /Users/lvsheng/work/clouda/golf/
sh build.sh
cd -
