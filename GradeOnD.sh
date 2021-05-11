#!/bin/sh

filename=$1
pylint $filename >> $filename.txt

exit 0