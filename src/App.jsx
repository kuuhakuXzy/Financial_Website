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
    numberOfStages: 1,
    savePerMonth: 7000000,
    annualIncrease: 10,
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
  };

  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  const calculateFinancialFreedom = () => {
    const { currentAge, retirementAge, desiredSpending, inflationRate, currentBankAsset, interestRate, savePerMonth, annualIncrease } = inputs;
    const yearsToRetirement = retirementAge - currentAge;
    
    const IR = inflationRate / 100;
    const AIR = interestRate / 100;
    const AI = annualIncrease / 100;
    const withdrawalRate = 0.040805;

    const fv_des = desiredSpending * 12 * Math.pow(1 + IR, yearsToRetirement);
    const retirement_corpus = fv_des / withdrawalRate;

    let fv_savings = currentBankAsset;
    let monthlySavings = savePerMonth;
    let data = [];
    let financialFreedomAge = null;
    
    const monthlyRate = AIR / 12;
    
    for (let age = currentAge; age <= retirementAge; age++) {
      let annualSavings = 0;
      for (let month = 1; month <= 12; month++) {
        annualSavings += monthlySavings;
        fv_savings = fv_savings * (1 + monthlyRate) + monthlySavings;
      }
      monthlySavings *= (1 + AI);
      data.push({ age, accumulatedWealth: fv_savings, requiredSavings: retirement_corpus, financialSavings: annualSavings });
      
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
          {Object.keys(inputs).map((key) => (
            <div key={key} className="mb-2">
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
              <Line type="monotone" dataKey="accumulatedWealth" stroke="#ff7300" name="Accumulated Wealth" />
              <Line type="monotone" dataKey="requiredSavings" stroke="#4dc94d" name="Required Savings" />
              <Line type="monotone" dataKey="financialSavings" stroke="#FFD700" name="Annual Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {result && (
        <div className="bg-white text-black p-4 rounded-3xl shadow-lg w-2/3 mt-6 text-center">
          {result.financialFreedomAge ? (
            <p className="font-bold">You will achieve Financial Freedom at age {result.financialFreedomAge}</p>
          ) : (
            <p className="font-bold">You will not achieve Financial Freedom by the desired age</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;