#!/bin/bash

cd /users/home/agebhard/ta-bot/
. /etc/profile.d/xinu.sh
. config

MYROOT=`pwd`
LOGFILE="${MYROOT}/tabot.log"
TURNIN="/usr/local/bin/turnin"
NEEDED="config rungrades.sh grade.sh"
CREATE="output input"
OPTIONAL="given xinu-grade.exp batchgrade.sh"
WINDOW=86400

usage () {
	echo "usage: $0 [--auto | <project>] [--nightly | --final | --prep]"
	exit 1
}

if [ $# -ne 2 ]; then
	usage
fi
PROJECT=$1
CYCLE=$2
if [ "${PROJECT}" = "--auto" ]; then
	PROJECT=`${TURNIN} -l -c ${TURNIN_COURSE} | grep current | awk '{print $1}'`
fi

if [ -z "${PROJECT}" ]; then
	echo "ERROR: No current assignment" >> ${LOGFILE}
	echo "ERROR: No current assignment"
	exit 1
fi
if [ ! -e "${MYROOT}/templates/${PROJECT}" ]; then
	echo "ERROR: No project template for \"${PROJECT}\"" >> ${LOGFILE}
	echo "ERROR: No project template for \"${PROJECT}\""
	exit 1
else
	TEMPLATEDIR="${MYROOT}/templates/${PROJECT}"
fi

if [ "${CYCLE}" = "--nightly" ]; then
	WINDOW=86400
elif [ "${CYCLE}" = "--final" ]; then
	WINDOW=""
elif [ "${CYCLE}" = "--prep"  ]; then
	WINDOW=""
else
	usage
fi

echo "=======================" >> ${LOGFILE}
echo "= Starting TA-bot run =" >> ${LOGFILE}
echo "=======================" >> ${LOGFILE}
date >> ${LOGFILE}

STAGEDIR=grading-tabot-${PROJECT}
if [ -d "$STAGEDIR" ]; then
    rm -rf $STAGEDIR
fi


echo "Building ${STAGEDIR} for assignment \"${PROJECT}\"" >> ${LOGFILE}


mkdir ${STAGEDIR}
chmod -R 2770 ${STAGEDIR} &> /dev/null
cd ${MYROOT}/${STAGEDIR}
for i in ${NEEDED}
	do
	if [ -e "${TEMPLATEDIR}/${i}" ]; then
		ln -s "${TEMPLATEDIR}/${i}" .
	else
		echo "ERROR: Could not find NEEDED ${i}" >> ${LOGFILE}
		echo "ERROR: Could not find NEEDED ${i}"
		exit 1
	fi
	done
for i in ${CREATE}
	do
	mkdir ${i}
	done
for i in ${OPTIONAL}
	do
	if [ -e "${TEMPLATEDIR}/${i}" ]; then
		ln -s "${TEMPLATEDIR}/${i}" .
	fi
	done

if [ "${CYCLE}" = "--nightly" ]; then
	if [ -e "${TEMPLATEDIR}/tests-${PROJECT}-nightly" ]; then
		ln -s ${TEMPLATEDIR}/tests-${PROJECT}-nightly tests
	elif [ -e "${TEMPLATEDIR}/tests-nightly" ]; then
		ln -s ${TEMPLATEDIR}/tests-nightly tests
	else
		echo "ERROR: Could not find tests-${PROJECT}-nightly" >> ${LOGFILE}
		echo "ERROR: Could not find tests-${PROJECT}-nightly"
		exit 1
	fi
else
	if [ -e "${TEMPLATEDIR}/tests-${PROJECT}-final" ]; then
		ln -s ${TEMPLATEDIR}/tests-${PROJECT}-final tests
	elif [ -e "${TEMPLATEDIR}/tests-final" ]; then
		ln -s ${TEMPLATEDIR}/tests-final tests
	else
		echo "ERROR: Could not find tests-${PROJECT}-final" >> ${LOGFILE}
		echo "ERROR: Could not find tests-${PROJECT}-final"
		exit 1
	fi
fi


cd ${MYROOT}/${STAGEDIR}/input
# Fill input directory
if [ -z "${WINDOW}" ]; then
	for i in `find ${MYROOT}/${INPUTDIR}/${PROJECT} -name \*.tgz`
		do
		ln -s ${i} .
		done
else
	TIME=`date +%s`
	TARGET=`expr ${TIME} - ${WINDOW}`
	for i in `find ${MYROOT}/${INPUTDIR}/${PROJECT} -newermt @${TARGET} -name \*.tgz`
		do
		ln -s ${i} .
		done
fi
cd ${MYROOT}/${STAGEDIR}/
if [ "${CYCLE}" = "--prep" ]; then
	exit 0
fi
echo "Grading." >> ${LOGFILE}
./rungrades.sh &> /dev/null

cd ${MYROOT}/${STAGEDIR}/output
ln -s ${MYROOT}/mailbot.sh .
ln -s ${MYROOT}/lookup.sh .
ln -s ${MYROOT}/mailbot-message-final.txt .
ln -s ${MYROOT}/mailbot-message-nightly.txt .

if [ "${CYCLE}" = "--nightly" ]; then
	echo "Mailing:" >> ${LOGFILE}
	./mailbot.sh ${CYCLE} >> ${LOGFILE}
	cd ${MYROOT}
	rm -Rf ${STAGEDIR}
else
	echo "TA-bot has completed grading run."
	echo "Resulting output is stored in"
       	echo "     ${MYROOT}/${STAGEDIR}/output/"
	echo "When manual point assignment is completed, run ./mailbot.sh --final"
fi

