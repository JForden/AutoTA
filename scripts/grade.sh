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

if [ -d given ]; then
    GIVEN=`ls given/`
else
    GIVEN=""
fi

NAME=$1
TEMP="temp-${NAME}"

myroot=`pwd`

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
		echo "ERROR: Could not find input - ${INDIR}/${NAME}\*"
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

echo "Grading $NAME"tr -d '*'

#################
# Print header. #
#################
echo "{" > ${OUTFILE}
EXE=`ls -1 -F | tr -d '*'`
echo "\"result\": [ " >> ${OUTFILE}

#####################
# Grading the file. #
#####################
for problem in $TESTS
  do
  cp $myroot/tests/${problem}/* . &> /dev/null

  TESTOUT=${problem}.testoutput
  echo    "     $problem"
  echo "{" >> ${OUTFILE}
  echo "\"Suite\": \"$problem\"," >> ${OUTFILE} 
  echo "\"Points\" : \"`cat comment`\"," >> ${OUTFILE}
  echo "\"Tests\": [" >> ${OUTFILE}
  counter=`ls *.test | sort | wc -l`
  for tcase in `ls *.test | sort`
    do
        echo "{" >> ${OUTFILE} 
        printf "    + %-30s \t" ${tcase}
        echo "\"Testcase\": \"${tcase}\"," >> ${OUTFILE}
        TESTOUT=${problem}.${tcase}.testoutput

        trap "echo Trapped CTRL-C; echo 'Error': 'Infinite Loop Detected' >> ${OUTFILE}; break" SIGINT SIGKILL SIGXCPU
        ulimit -t 2 -f 1024

        if [ "${tcase}" = "tail.test" ]; then
            ./${tcase} | ./${EXE} | tail > ${TESTOUT}
        else
        echo ${EXE}
        python ${EXE} < ${tcase} > ${TESTOUT} 2>&1
        fi
        if [ -s "${TESTOUT}" ]; then

            diff ${DIFFO} ${tcase}.sol ${TESTOUT} > diffout.txt
            if [ $? -eq 0 ]; then
                echo "PASSED"
                echo "\"Status\": \"PASSED\"," >> ${OUTFILE}
                desc=$( cat ${tcase}.desc )
		        echo "\"description\": \"${desc}\"," >> ${OUTFILE}
                echo "\"Diff\": \"\"" >> ${OUTFILE}
            else
                echo ""
                echo "\"Status\": \"FAILED\"," >> ${OUTFILE}
                sed -E ':a;N;$!ba;s/\r{0,1}\n/\\n/g' diffout.txt > diffout1.txt
                holder=$( cat diffout1.txt )
                desc=$( cat ${tcase}.desc )
		        echo "\"description\": \"${desc}\"," >> ${OUTFILE}
                echo "\"Diff\": \"${holder}\"" >> ${OUTFILE}
                rm diffout1.txt
            fi
        else
            echo "    ERROR: No output"
            echo "\"Error\": \"No output"\" >> ${OUTFILE}
        fi
        if [ $counter -ne 1 ]; then
            echo "}," >> ${OUTFILE}
            counter=$((counter-1))
        else
            echo "}" >> ${OUTFILE}
        fi
    done

  
  
  if [ $tcounter -ne 1 ]; then
    echo "]}," >> ${OUTFILE}
    tcounter=$((tcounter-1))
  else
    echo "]}" >> ${OUTFILE}
  fi  



  rm *.test *.sol comment 2> /dev/null

done
echo "]}" >> ${OUTFILE}
lint=${OUTFILE}.pylint
pylint ${EXE} --output-format=json >> ${lint}



arcfile=${OUTFILE}-`date +%F-%T.%N`.archive
cat ${OUTFILE} >> ${arcfile}
mv ${arcfile} ../archivefolder/
arcpylint=${OUTFILE}-`date +%F-%T.%N`.pyarchive
pylint ${EXE} --output-format=json >> ${arcpylint}
mv ${arcpylint} ../archivefolder/






# End of grading stuff.
cd $myroot
chmod -R 0700 ${TEMP}
rm -rf ${TEMP}