import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const App = () => {
  const [inputs, setInputs] = useState({
    currentAge: 18,
    retirementAge: 65,
    desiredSpending: 30000000,
    inflationRate: 3.43,
    currentBankAsset: 100000000,
    interestRate: 4.7,
    savePerMonth: 7000000,
    annualIncrease: 10,

    riskAllocation: 50,
    riskFreeReturn: 2,
    riskyReturn: 8,
    riskyRisk: 15,
  });

  const labels = {
    currentAge: "Your Current Age",
    retirementAge: "Desired Retirement Age",
    desiredSpending: "Desired Expected Spending (VND)",
    inflationRate: "Inflation (%)",
    currentBankAsset: "Current Bank Asset (VND)",
    interestRate: "Average Interest Rate (%)",
    numberOfStages: "Number of Stages",
    savePerMonth: "Save Per Month (VND)",
    annualIncrease: "Annual Increase (%)",
    riskAllocation: "Percentage of Risky Asset (u%)",
    riskFreeReturn: "Return of Risk-free Asset (R_f%)",
    riskyReturn: "Expected Return of Risky Asset (μ%)",
    riskyRisk: "Risk of Risky Asset (σ%)",
  };

  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  const calculateFinancialFreedom = () => {
    const { currentAge, retirementAge, desiredSpending, inflationRate, currentBankAsset, interestRate, savePerMonth, annualIncrease, riskFreeReturn, riskyReturn, riskyRisk, riskAllocation} = inputs;
    const yearsToRetirement = retirementAge - currentAge;
    
    const IR = inflationRate / 100;
    const AIR = interestRate / 100;
    const AI = annualIncrease / 100;
    const withdrawalRate = 0.040805;

    
    const RF = riskFreeReturn / 100; //Risk management
    const RR = riskyReturn / 100;
    const sigma = riskyRisk / 100;
    const u = riskAllocation / 100;

    const fv_des = desiredSpending * 12 * Math.pow(1 + IR, yearsToRetirement);
    const retirement_corpus = fv_des / withdrawalRate;

    let fv_savings = currentBankAsset;
    let wr_savings = currentBankAsset;
    let expectedWealth = currentBankAsset;
    let lowerPercentileWealth = currentBankAsset;
    let monthlySavings = savePerMonth;
    let data = [];
    let financialFreedomAge = null;
    
    const monthlyRate = AIR / 12;
    
    for (let age = currentAge; age <= retirementAge; age++) {
      let annualSavings = 0;
      for (let month = 1; month <= 12; month++) {
        annualSavings += monthlySavings;
// Box-Muller transform for normal distribution
const Z = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());

// Log-normal return calculation
const riskyReturn = Math.exp((RR - (Math.pow(sigma, 2) / 2)) / 12 + (sigma / Math.sqrt(12)) * Z) - 1;
const totalReturn = u * riskyReturn + (1 - u) * (Math.pow(1 + RF, 1 / 12) - 1);

fv_savings = fv_savings * (1 + totalReturn) + monthlySavings;


        wr_savings = wr_savings * (1 + monthlyRate) + monthlySavings;


        // Calculate Expected Wealth [E(W)]
        expectedWealth = expectedWealth * (1 + (u * RR + (1 - u) * RF) / 12) + monthlySavings;

        // Calculate Lower Percentile Wealth [Q(W)] - Conservative Estimate
        const downsideReturn = u * (RR - sigma) + (1 - u) * RF;
        lowerPercentileWealth = lowerPercentileWealth * (1 + downsideReturn / 12) + monthlySavings;
      }
      monthlySavings *= (1 + AI);
      data.push({ age, accumulatedWealth: fv_savings, requiredSavings: retirement_corpus, financialSavings: annualSavings, without_risk_assets: wr_savings, expectedWealth, lowerPercentileWealth });
      
      if (!financialFreedomAge && fv_savings >= retirement_corpus) {
        financialFreedomAge = age;
      }
    }

    setResult({
      fv_des: fv_des.toLocaleString(),
      retirement_corpus: retirement_corpus.toLocaleString(),
      fv_savings: fv_savings.toLocaleString(),
      total_assets: fv_savings.toLocaleString(),
      financialFreedomAge,
    });
    setChartData(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;
    setInputs({ ...inputs, [name]: numericValue });
  };

  const formatNumber = (num) => num.toLocaleString();

  return (
    <div className="bg-indigo-900 min-h-screen flex flex-col items-center p-6 text-white">
      <div className="flex w-full">
        <div className="bg-white text-black rounded-3xl p-6 shadow-lg w-1/6 mr-6">
          <h2 className="text-center font-bold text-xl mb-4">What-If Scenario</h2>
          {Object.keys(inputs).map((key, index) => (
            <div key={key} className="mb-2">
              {key === "riskAllocation" && <h3 className="text-center font-bold text-lg mb-2">Risk Management</h3>}
              <label className="block text-sm font-medium">{labels[key]}:</label>
              <input
                type="text"
                name={key}
                value={
                  ["desiredSpending", "currentBankAsset", "savePerMonth"].includes(key)
                    ? formatNumber(inputs[key])
                    : inputs[key]
                }
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 outline-none p-1 bg-transparent"
              />
            </div>
          ))}
          <button onClick={calculateFinancialFreedom} className="bg-black text-white px-4 py-2 rounded mt-4 w-full">Calculate</button>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-lg w-5/6 ">
          <ResponsiveContainer width="100%" height={1200}>
            <LineChart data={chartData} margin={{ top: 20, right: 0, left: 75, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickCount={10} domain={['auto', 'auto']} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="accumulatedWealth" stroke="#8B5CF6" name="Accumulated Wealth" />
              <Line type="monotone" dataKey="without_risk_assets" stroke="#387908" name="Without-risk Wealth" />
              <Line type="monotone" dataKey="requiredSavings" stroke="#4dc94d" name="Required Savings" />
              <Line type="monotone" dataKey="financialSavings" stroke="#FFD700" name="Financial Savings" />
              <Line type="monotone" dataKey="expectedWealth" stroke="#60A5FA" name="E[W] (Expected Wealth)" />
              <Line type="monotone" dataKey="lowerPercentileWealth" stroke="#FF0000" name="Q[W] (Lower Percentile Wealth)" />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {result && (
      <div className="bg-white text-black p-4 rounded-3xl shadow-lg w-2/3 mt-6 text-center">
        {result.financialFreedomAge ? (
          <p className="font-bold">You will achieve Financial Freedom Point at age {result.financialFreedomAge}</p>) : 
          (<p className="font-bold">You will not achieve Financial Freedom Point at the desired age</p>)
          }
      </div>
      )}
    </div>
  );
};

export default App;
