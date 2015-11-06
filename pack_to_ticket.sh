#!/usr/bin/env bash
cp -rf base ~/work/ticket/tpl_ticket_1.0.3/static/o2o
cp -rf boost ~/work/ticket/tpl_ticket_1.0.3/static/o2o
cd ~/work/ticket/tpl_ticket_1.0.3/static/o2o
sh pack.sh
fis3 release
cd -
