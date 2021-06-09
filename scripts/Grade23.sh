#!/bin/bash
mkdir output/
echo "START OF LOGGING INFO" > LOG
echo "Date of run attempt: " $(date +%m/%d/%y) >> LOG
for f in *.py
do 
    echo "Processing $f " >> LOG
    basename=${f%.py}
    #echo "Filename is $t"
    pylint $f >> $basename
    mv $basename output
done

/usr/bin/python3 /home/jforden/Coding/AutoGrader/LinkFinder.py

exit 0