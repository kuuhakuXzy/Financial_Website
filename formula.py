# Get user input for number of stages
num_stages = int(input("Enter the number of stages (1-3): "))
assert 1 <= num_stages <= 3, "Number of stages must be between 1 and 3."

stages = []
for i in range(num_stages):
    print(f"Stage {i+1}:")
    start_age = int(input("  Start age: "))
    end_age = int(input("  End age: "))
    saving_growth_rate = float(input("  Annual savings increase rate (%): ")) / 100
    saving_per_month = float(input("  Monthly savings amount: "))
    
    stages.append((start_age, end_age, saving_growth_rate, saving_per_month))

# Constants
inflation_rate = 0.0343
withdrawal_rate = 0.040805
retirement_age = 65
C_hien_tai = 360_000_000
interest_rate = 0.047
monthly_interest_rate = interest_rate / 12

# Calculate future spending at retirement
C_tuong_lai = C_hien_tai * (1 + inflation_rate) ** (retirement_age - 18)
S = C_tuong_lai / withdrawal_rate

total_savings = 100_000_000  # Assuming an initial bank balance
age_reach_fi = None

for start_age, end_age, saving_growth_rate, saving_per_month in stages:
    for age in range(start_age, end_age + 1):
        for month in range(12):
            total_savings = total_savings * (1 + monthly_interest_rate) + saving_per_month
        
        print(f"Year {age}: {total_savings:,.0f} VND")
        
        if age_reach_fi is None and total_savings >= S:
            age_reach_fi = age
        
        saving_per_month *= (1 + saving_growth_rate) 
        print(f"Saving per month {month}: {saving_per_month:,.0f} VND")# Increase savings each year

print(f"Required retirement savings: {S:,.0f} VND")
print(f"Final savings at {retirement_age}: {total_savings:,.0f} VND")
print(f"Age reached financial independence: {age_reach_fi}")