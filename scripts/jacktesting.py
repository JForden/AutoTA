import os

#all this is hard coded, I just wanted to push this to kinda show you something cool we might be able to use for some behind the scene stuff, idk i thought it was cool. The header one doesnt work but everything else does :)


num=20
snum=str(num)
lnum=1
value2="text.txt"
'\\n Total:\t\tout of ${POINTS}\n\n\"'
#this annoys me since this works print("HEADER=\"\\n"+"Total:\\t"+"\\tout of ${POINTS}\\n"+"\\n"+"\"")
points="POINTS="+"\""+snum+"\""
labnum="LABNUM="
#header=(r"HEADER=\"\\n"+"Total:\\t"+"\\tout of ${POINTS}\\n"+"\\n"+"\"")
GetCacheToken="GCC=\"gcc\""
CacheTokenFlags="GCCFLAGS=\"-lm\""
#value2="test.txt"
cmd  = "echo %s >> %s"%(points,value2)
cmd2 = "echo %s%d >> %s"%(labnum,lnum,value2)
#cmd3 = "echo %s >> %s"%(header,value2)
cmd4 = "echo %s >> %s"%(GetCacheToken,value2)
cmd5 = "echo %s >> %s"%(CacheTokenFlags,value2)

os.system(cmd)
os.system(cmd2)
#os.system(cmd3)
os.system(cmd4)
os.system(cmd5)
