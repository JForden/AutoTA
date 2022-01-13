#!/bin/bash

set -m # Enable Job Control

for f in `find input/ -name \*.tar.gz`; do
	./execute.py `basename $f .tar.gz` &
	done
for f in `find input/ -name \*.tgz`; do
    ./execute.py `basename $f .tgz` &
    done
for f in `find input/ -name \*.tar`; do
    ./execute.py `basename $f .tar` &
    done
for f in `find input/ -name \*.py`; do
    ./execute.py `basename $f .py` &
    done

# Wait for all parallel jobs to finish
while [ 1 ]; do fg 2> /dev/null; [ $? == 1 ] && break; done


