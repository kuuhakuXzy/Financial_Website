import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const App = () => {
  const [inputs, setInputs] = useState({
    currentAge: 18,
    retirementAge: 65,
    desiredSpending: 30000000, // Adjusted spending value
    inflationRate: 3.43,
    currentBankAsset: 100000000,
    interestRate: 4.7,
    savePerMonth: 7000000,
    annualIncrease: 10,
  });
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  const calculateFinancialFreedom = () => {
    const { currentAge, retirementAge, desiredSpending, inflationRate, currentBankAsset, interestRate, savePerMonth, annualIncrease } = inputs;
    const monthsInYear = 12;
    const yearsToRetirement = retirementAge - currentAge;
    
    // Convert percentages to decimals
    const IR = inflationRate / 100;
    const AIR = interestRate / 100;
    const AI = annualIncrease / 100;
    const withdrawalRate = 0.040805;

    // Step 1: Future Value of Desired Spending (FV_DES)
    const fv_des = desiredSpending * 12 * Math.pow(1 + IR, yearsToRetirement);

    // Step 2: Retirement Corpus Required
    const retirement_corpus = fv_des / withdrawalRate;

    // Step 3: Future Value of Savings (FV_Savings)
    let fv_savings = currentBankAsset;
    let monthlySavings = savePerMonth;
    let data = [];
    let financial_savings = currentBankAsset; // Track raw savings without interest

    const monthlyRate = AIR / 12; // Monthly interest rate
    let financialFreedomAge = null;
    
    for (let age = currentAge; age <= retirementAge; age++) {
      for (let month = 1; month <= 12; month++) {
        financial_savings += monthlySavings; // Only add monthly savings
        fv_savings = fv_savings * (1 + monthlyRate) + monthlySavings;
      }
      monthlySavings *= (1 + AI); // Apply annual increase in savings
      data.push({ age, accumulatedWealth: fv_savings, requiredSavings: retirement_corpus, financialSavings: financial_savings});
      
      if (!financialFreedomAge && fv_savings >= retirement_corpus) {
        financialFreedomAge = age;
      }
    }

    setResult({
      fv_des,
      retirement_corpus,
      fv_savings,
      total_assets: fv_savings,
      financialFreedomAge,
    });
    setChartData(data);
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="bg-indigo-900 min-h-screen flex flex-col items-center p-6 text-white">
      <div className="flex w-full">
        <div className="bg-white text-black rounded-3xl p-6 shadow-lg w-1/4 mr-6">
          <h2 className="text-center font-bold text-xl mb-4">What-If Scenario</h2>
          {Object.keys(inputs).map((key) => (
            <div key={key} className="mb-2">
              <label className="block text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
              <input
                type="number"
                name={key}
                value={inputs[key]}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 outline-none p-1 bg-transparent"
              />
            </div>
          ))}
          <button onClick={calculateFinancialFreedom} className="bg-black text-white px-4 py-2 rounded mt-4 w-full">Calculate</button>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-lg w-3/4 ">
          <ResponsiveContainer width="100%" height={1200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickCount={9} domain={['auto', 'auto']}/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accumulatedWealth" stroke="#ff7300" name="Accumulate Wealth"/>
              <Line type="monotone" dataKey="requiredSavings" stroke="#4dc94d" name="Required Savings"/>
              <Line type="monotone" dataKey="financialSavings" stroke="#FFD700" name="Financial savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {result && (
        <div className="bg-white text-black p-4 rounded-3xl shadow-lg w-2/3 mt-6 text-center">
          {result.financialFreedomAge ? (
            <p className="font-bold">You will achieve Financial Freedom Point at age {result.financialFreedomAge}</p>
          ) : (
            <p className="font-bold">You will not achieve Financial Freedom Point at the desired age</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
