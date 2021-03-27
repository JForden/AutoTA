#!/bin/bash
mkdir output/
echo "START OF LOGGING INFO" > LOG
echo "Date of run attempt: " $(date +%m/%d/%y) >> LOG
for f in *.py
do 
    echo "Processing $f " >> LOG
    basename=${f%.py}
    #echo "Filename is $t"
    echo "START OF GRADING SCRIPT" > $basename
    pylint $f >> $basename
    echo "END OF GRADING SCRIPT" >> $basename
    mv $basename output

done
