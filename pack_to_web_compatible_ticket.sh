#!/usr/bin/env bash
node release.js
cp release/boost.js /Users/lvsheng/work/ticket/ticket_tpl_from_trunk/static/o2o/lib/boost.js

cd /Users/lvsheng/work/ticket/ticket_tpl_from_trunk/static/o2o/
sh pack.sh
cd -
