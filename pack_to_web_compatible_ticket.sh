#!/usr/bin/env bash
sh release.sh
cp release/boost.js /Users/lvsheng/work/ticket/ticket_tpl_from_trunk/static/o2o/lib/boost.js

cd /Users/lvsheng/work/ticket/ticket_tpl_from_trunk/static/o2o/
sh pack.sh
cd -
