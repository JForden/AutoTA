#!/bin/bash
# Automated grading script

. ../config
. config

DIFFO="-w -i -B -a" #Options for diff...
OUTDIR=output
INDIR=input
if [ $# != 1 ]; then
    echo "Usage: grade.sh <filename>"
    exit 1;
fi

tcounter=`ls tests/ | sort | wc -l`
if [ -d tests ]; then
    TESTS=`ls tests/ | sort`
else
    echo "ERROR: Testcase directory 'tests' not found!"
    exit 1;
fi

NAME=$1
TEMP="temp-${NAME}"

myroot=`pwd`

# BRYLOW: Why does this do this?
chmod -R 0700 ${TEMP} &> /dev/null
rm -rf ${TEMP} &> /dev/null
if [ -d ${OUTDIR} ]; then
	rm ${OUTDIR}/${NAME}.* &> /dev/null
else
	mkdir ${OUTDIR}
fi

OUTFILE=${myroot}/${OUTDIR}/${NAME}.out

mkdir ${TEMP}
cd ${TEMP}

##################
# Find tar ball. #
##################
if [ -s ${myroot}/${INDIR}/${NAME}.tar ]; then
    FILENAME=${NAME}.tar
    tar xf ../${INDIR}/${FILENAME}
elif [ -s ${myroot}/${INDIR}/${NAME}.tar.gz ]; then
    FILENAME=${NAME}.tar.gz
    tar xzf ../${INDIR}/${FILENAME}
elif [ -s ${myroot}/${INDIR}/${NAME}.tgz ]; then
    FILENAME=${NAME}.tgz
    tar xzf ../${INDIR}/${FILENAME}
else
    FILENAME=`find ${myroot}/${INDIR} -name ${NAME}\* -print | head -1`
    if [ -z "${FILENAME}" ]; then
		${myroot}/output.py error ${OUTFILE} "Could not find input - ${INDIR}/${NAME}\*"
		exit 1;
    else
		FILENAME=`basename ${FILENAME}`
		cp ../${INDIR}/${FILENAME} .
    fi
fi

# determine if a single directory or files was submitted
ls *.py
if [ $? -ne 0 ]; then
	ls -F | grep '/$' > /dev/null
	if [ $? -eq 0 ]; then
   	 	# a directory was submitted, change to it
    		cd `ls -F | grep '/$'`
	fi
fi

echo "Grading $NAME"

#################
# Print header. #
#################
EXE=`ls -1 -F | tr -d '*'`

#####################
# Grading the file. #
#####################
for problem in $TESTS
  do
  cp $myroot/tests/${problem}/* . &> /dev/null

  for tcase in `ls *.test | sort`
    do
        mv ${tcase}.info ${problem}.${tcase}.info
        . ${problem}.${tcase}.info
        TESTOUT=${problem}.${tcase}.testoutput
        ../execute.py ${EXE} ${tcase} ${tcase}.sol ${problem}
    done

  rm *.test *.sol comment 2> /dev/null

done
lint=${OUTFILE}.pylint
pylint ${EXE} --output-format=json >> ${lint}

# End of grading stuff.
cd $myroot
chmod -R 0700 ${TEMP}

#TODO: Call output.py
${myroot}/output.py ${TEMP} ${NAME}

#rm -rf ${TEMP}
