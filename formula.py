import math
import random

# User Inputs
currentAge = 35
retirementAge = 65
desiredSpending = 25000000
inflation = 3 / 100
currentAsset = 200000000
interestRate = 5 / 100
monthlyRate = interestRate / 12
savePerMonth = 8000000
annualIncrease = 7 / 100
insuranceCost = 1000000      

riskAllocation = 50 / 100
riskFreeReturn = 3 / 100
riskReturn = 10 / 100
riskyRisk = 15 / 100

accidentAge = 45
wealthLoss = 100000000
insuranceCoverage = 50/100
shock = wealthLoss * (1 - insuranceCoverage)

fv_saving = currentAsset
wr_saving = currentAsset
expectedWealth = currentAsset
lowerPercentileWealth = currentAsset
monthlySaving = savePerMonth

withdrawalRate = 4.0805 / 100

# Calculate Required Savings for Retirement
fv_des = desiredSpending * 12 * pow(1 + inflation, retirementAge - currentAge)
retirement_corpus = fv_des / withdrawalRate

print("\nRequired saving for retirement: {:,.3f}".format(retirement_corpus))

financialFreedomAge = None
financialFreedomNoRiskAge = None

wealth_data = []

for i in range(currentAge, retirementAge + 1):
    annualSaving = 0

    for j in range(12):
        annualSaving += monthlySaving

        if riskAllocation > 0:
            Z = math.sqrt(-2 * math.log(random.random())) * math.cos(2 * math.pi * random.random())
            riskyReturnCalc = math.exp((riskReturn - riskyRisk ** 2 / 2) / 12 + (riskyRisk / math.sqrt(12)) * Z) - 1
            totalReturn = riskAllocation * riskyReturnCalc + (1 - riskAllocation) * (math.pow(1 + riskFreeReturn, 1 / 12) - 1)
        else:
            totalReturn = monthlyRate

        fv_saving = fv_saving * (1 + totalReturn) + monthlySaving - insuranceCost
        wr_saving = wr_saving * (1 + monthlyRate) + monthlySaving - insuranceCost
        expectedWealth = expectedWealth * (1 + (riskAllocation * riskReturn + (1 - riskAllocation) * riskFreeReturn) / 12) + monthlySaving - insuranceCost
        downsideReturn = riskAllocation * (riskReturn - riskyRisk) + (1 - riskAllocation) * riskFreeReturn
        lowerPercentileWealth = lowerPercentileWealth * (1 + downsideReturn / 12) + monthlySaving - insuranceCost

    monthlySaving = monthlySaving * (1 + annualIncrease)

    if wr_saving > retirement_corpus and financialFreedomAge is None:
        financialFreedomAge = i

    if fv_saving > retirement_corpus and financialFreedomNoRiskAge is None:
        financialFreedomNoRiskAge = i

    wealth_data.append((i, wr_saving, fv_saving, annualSaving, expectedWealth, lowerPercentileWealth))

    # Print wealth information at each age
    print("\nAt age {}: ".format(i))
    print("  Accumulated Wealth:       {:,.3f}".format(fv_saving))
    print("  Without Risk Assets:      {:,.3f}".format(wr_saving))
    print("  Financial Savings:        {:,.3f}".format(annualSaving))
    print("  Expected Wealth:          {:,.3f}".format(expectedWealth))
    print("  Lower Percentile Wealth:  {:,.3f}".format(lowerPercentileWealth))

# Print Financial Freedom Summary
if financialFreedomAge:
    print("\n✅ Financial freedom achieved WITHOUT risk at age:", financialFreedomAge)
else:
    print("\n❌ With risk, you will NOT achieve financial freedom by retirement age.")

if financialFreedomNoRiskAge:
    print("\n✅ Financial freedom achieved WITH risk at age:", financialFreedomNoRiskAge)
else:
    print("\n❌ Without risk, you will NOT achieve financial freedom by retirement age.")

print("\nRequired saving for retirement: {:,.3f}".format(retirement_corpus))

# Ask if the accident scenario should be applied
apply_accident = input("\nDo you want to apply the accident scenario? (yes/no): ").strip().lower()

if apply_accident == "yes" and (accidentAge in range(currentAge, retirementAge + 1)):
    print("\n🚨 Applying accident impact at age {}! Wealth reduced by {:,.3f} 🚨".format(accidentAge, shock))

    financialFreedomAge = None
    financialFreedomNoRiskAge = None  # Reset financial freedom tracking

    for index in range(accidentAge - currentAge, len(wealth_data)):
        age, wr_saving, fv_saving, annualSaving, expectedWealth, lowerPercentileWealth = wealth_data[index]

        wr_saving -= shock
        fv_saving -= shock
        expectedWealth -= shock
        lowerPercentileWealth -= shock

        wealth_data[index] = (age, wr_saving, fv_saving, annualSaving, expectedWealth, lowerPercentileWealth)

        # Print updated wealth data after accident
        print("\nAfter accident at age {}: ".format(age))
        print("  Accumulated Wealth:       {:,.3f}".format(fv_saving))
        print("  Without Risk Assets:      {:,.3f}".format(wr_saving))
        print("  Financial Savings:        {:,.3f}".format(annualSaving))
        print("  Expected Wealth:          {:,.3f}".format(expectedWealth))
        print("  Lower Percentile Wealth:  {:,.3f}".format(lowerPercentileWealth))

        if wr_saving > retirement_corpus and financialFreedomAge is None:
            financialFreedomAge = age

        if fv_saving > retirement_corpus and financialFreedomNoRiskAge is None:
            financialFreedomNoRiskAge = age

    if financialFreedomAge:
        print("\n✅ After accident, financial freedom achieved WITHOUT risk at age:", financialFreedomAge)
    else:
        print("\n❌ After accident, with risk, you will NOT achieve financial freedom by retirement age.")

    if financialFreedomNoRiskAge:
        print("\n✅ After accident, financial freedom achieved WITH risk at age:", financialFreedomNoRiskAge)
    else:
        print("\n❌ After accident, without risk, you will NOT achieve financial freedom by retirement age.")

elif apply_accident == "yes":
    print("\n⚠️ Invalid accident age. No changes applied.") 