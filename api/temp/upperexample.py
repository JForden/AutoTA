# Chp.4 - Radioactive Growth/Decay
# Benjamin Ahyun, 10/1/21

# To calculate decay and growth of radioactive material

import math
Days = 0
loop = True
GrowthDecayDone = input("Would you like to calculate radioactive growth or decay? ")
while loop:

    while (GrowthDecayDone != "growth") and (GrowthDecayDone != "decay") and (GrowthDecayDone != "done"):
        print("Invalid choice! Try again")
        GrowthDecayDone = input("Would you like to calculate radioactive growth or decay? ")

    if GrowthDecayDone == "decay":

        RateOfDecay = int(input("What is the percent rate of decay? "))
        NumberOfAtomsDecay = int(input("What is the initial number of atoms? "))
        RateOfDecay = RateOfDecay/100
        while NumberOfAtomsDecay > 10:
            NumberOfAtomsDecay = NumberOfAtomsDecay - (NumberOfAtomsDecay*RateOfDecay)
            Days = Days + 1
        FinalDecay = math.floor(NumberOfAtomsDecay)
        print("The radioactive decay took", Days, "days.")
        print("The number atoms decayed to only about", FinalDecay, "atoms.")
        GrowthDecayDone = input("Would you like to calculate radioactive growth or decay again? ")
        Days = 0

    if GrowthDecayDone == "growth":
        RateOfGrowth = int(input("What's the percent rate of growth? "))
        InitialAtoms = int(input("What is the initial number of atoms? "))
        GrowthDays = int(input("How much time do you have (in days)? "))
        RateOfGrowth = RateOfGrowth/100
        RateOfGrowth = RateOfGrowth*1
        for x in range(GrowthDays):
            InitialAtoms = InitialAtoms + (InitialAtoms*RateOfGrowth)

        FinalAtoms = math.ceil(InitialAtoms)
        print("The radioactive growth took", GrowthDays, "days.")
        print("The number atoms grew to about", FinalAtoms, "atoms.")
        GrowthDecayDone = input("Would you like to calculate radioactive growth or decay again? ")

    if GrowthDecayDone == "done":
        loop = False