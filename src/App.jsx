import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

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
    insuranceCost: 200000,

    riskAllocation: 50,
    riskFreeReturn: 2,
    riskyReturn: 8,
    riskyRisk: 15,

    accidentAge: 40,
    wealthLoss: 100000000,
    insuranceCoverage: 50,
  });

  const labels = {
    currentAge: 'Your Current Age',
    retirementAge: 'Desired Retirement Age',
    desiredSpending: 'Desired Expected Spending (VND)',
    inflationRate: 'Inflation (%)',
    currentBankAsset: 'Current Bank Asset (VND)',
    interestRate: 'Average Interest Rate (%)',
    savePerMonth: 'Save Per Month (VND)',
    annualIncrease: 'Annual Increase (%)',
    insuranceCost: 'Monthly Insurance Cost (VND)',

    riskAllocation: 'Percentage of Risky Asset (u%)',
    riskFreeReturn: 'Return of Risk-free Asset (R_f%)',
    riskyReturn: 'Expected Return of Risky Asset (μ%)',
    riskyRisk: 'Risk of Risky Asset (σ%)',

    accidentAge: 'Age at Accident',
    wealthLoss: 'Wealth Loss (VND)',
    insuranceCoverage: 'Insurance Coverage (%)',
  };

  const mainInputs = ['currentAge', 'retirementAge', 'desiredSpending', 'inflationRate', 'currentBankAsset', 'interestRate', 'savePerMonth', 'annualIncrease', 'insuranceCost', 'riskAllocation', 'riskFreeReturn', 'riskyReturn', 'riskyRisk'];
  const accidentInputs = ['accidentAge', 'wealthLoss', 'insuranceCoverage'];
  const percentageInputs = ['inflationRate', 'interestRate', 'annualIncrease', 'riskAllocation', 'riskFreeReturn', 'riskyReturn', 'riskyRisk', 'insuranceCoverage'];

  const numberInputs = ['currentAge', 'retirementAge', 'desiredSpending', 'currentBankAsset', 'savePerMonth', 'insuranceCost', 'accidentAge', 'wealthLoss'];

  // Store simulation data and results
  const [chartData, setChartData] = useState([]);
  const [baseChartData, setBaseChartData] = useState([]);
  const [result, setResult] = useState(null);

  // Main simulation calculation (without accident conditions)
  const calculateFinancialFreedom = () => {
    const { currentAge, retirementAge, desiredSpending, inflationRate, currentBankAsset, interestRate, savePerMonth, annualIncrease, insuranceCost, riskFreeReturn, riskyReturn, riskyRisk, riskAllocation } = inputs;
    const yearsToRetirement = retirementAge - currentAge;

    const IR = inflationRate / 100;
    const AIR = interestRate / 100;
    const AI = annualIncrease / 100;
    const withdrawalRate = 0.040805;

    const u = riskAllocation > 0 ? riskAllocation / 100 : 0;
    const RF = riskFreeReturn / 100 || AIR; // Default to overall interest rate if risk-free return is missing
    const RR = riskyReturn / 100 || AIR; // Default to overall interest rate if risky return is missing
    const sigma = riskyRisk / 100 || 0; // Default to 0 risk if no risk is applied

    const fv_des = desiredSpending * 12 * Math.pow(1 + IR, yearsToRetirement);
    const retirement_corpus = fv_des / withdrawalRate;

    let fv_savings = currentBankAsset;
    let wr_savings = currentBankAsset;
    let expectedWealth = currentBankAsset;
    let lowerPercentileWealth = currentBankAsset;
    let monthlySavings = savePerMonth;
    let data = [];
    let financialFreedomAge = null;
    let withoutRiskFinancialFreedomAge = null;

    const monthlyRate = AIR / 12;

    for (let age = currentAge; age <= retirementAge; age++) {
      let annualSavings = 0;
      for (let month = 1; month <= 12; month++) {
        annualSavings += monthlySavings;

        // Deduct monthly insurance cost
        fv_savings -= insuranceCost;
        wr_savings -= insuranceCost;
        expectedWealth -= insuranceCost;
        lowerPercentileWealth -= insuranceCost;

        // Generate a random return using Box-Muller only if risk is applied
        const Z = u > 0 ? Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()) : 0;
        const riskyReturnCalc = u > 0 ? Math.exp((RR - sigma ** 2 / 2) / 12 + (sigma / Math.sqrt(12)) * Z) - 1 : 0;
        const totalReturn = u > 0 ? u * riskyReturnCalc + (1 - u) * (Math.pow(1 + RF, 1 / 12) - 1) : monthlyRate;

        fv_savings = fv_savings * (1 + totalReturn) + monthlySavings;
        wr_savings = wr_savings * (1 + monthlyRate) + monthlySavings;
        expectedWealth = expectedWealth * (1 + (u * RR + (1 - u) * RF) / 12) + monthlySavings;

        const downsideReturn = u * (RR - sigma) + (1 - u) * RF;
        lowerPercentileWealth = lowerPercentileWealth * (1 + downsideReturn / 12) + monthlySavings;
      }

      monthlySavings *= 1 + AI;
      data.push({
        age,
        accumulatedWealth: fv_savings,
        requiredSavings: retirement_corpus,
        financialSavings: annualSavings,
        without_risk_assets: wr_savings,
        expectedWealth,
        lowerPercentileWealth,
      });

      if (!financialFreedomAge && fv_savings >= retirement_corpus) {
        financialFreedomAge = age;
      }
      if (!withoutRiskFinancialFreedomAge && wr_savings >= retirement_corpus) {
        withoutRiskFinancialFreedomAge = age;
      }
    }

    setResult({
      fv_des: fv_des.toLocaleString(),
      retirement_corpus: retirement_corpus.toLocaleString(),
      fv_savings: fv_savings.toLocaleString(),
      total_assets: fv_savings.toLocaleString(),
      financialFreedomAge,
      withoutRiskFinancialFreedomAge,
      accidentApplied: false,
    });
    // Save the base simulation data
    setBaseChartData(data);
    setChartData(data);
  };

  // Accident simulation: apply accident shock and update financial freedom ages
  const simulateAccident = () => {
    if (!baseChartData.length) return;
    const { accidentAge, wealthLoss, insuranceCoverage } = inputs;
    const shock = wealthLoss * (1 - insuranceCoverage / 100);

    const accidentData = baseChartData.map((d) => {
      if (d.age < accidentAge) {
        return d;
      } else {
        return {
          ...d,
          accumulatedWealth: d.accumulatedWealth - shock,
          without_risk_assets: d.without_risk_assets - shock,
          expectedWealth: d.expectedWealth - shock,
          lowerPercentileWealth: d.lowerPercentileWealth - shock,
        };
      }
    });

    // Recalculate financial freedom ages for accident simulation
    let accidentFinancialFreedomAge = null;
    let accidentWithoutRiskFinancialFreedomAge = null;
    for (const d of accidentData) {
      if (accidentFinancialFreedomAge === null && d.accumulatedWealth >= d.requiredSavings) {
        accidentFinancialFreedomAge = d.age;
      }
      if (accidentWithoutRiskFinancialFreedomAge === null && d.without_risk_assets >= d.requiredSavings) {
        accidentWithoutRiskFinancialFreedomAge = d.age;
      }
    }

    setChartData(accidentData);
    setResult((prevResult) => ({
      ...prevResult,
      financialFreedomAge: accidentFinancialFreedomAge,
      withoutRiskFinancialFreedomAge: accidentWithoutRiskFinancialFreedomAge,
      accidentApplied: true,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (percentageInputs.includes(name)) {
      setInputs({ ...inputs, [name]: value === '' ? '' : parseFloat(value) });
    } else {
      setInputs({ ...inputs, [name]: value === '' ? '' : parseNumber(value) });
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const parseNumber = (value) => {
    return parseFloat(value.replace(/,/g, '')) || '';
  };

  return (
    <div className="bg-indigo-900 min-h-screen flex flex-col items-center p-6 text-white">
      <div className="flex w-full">
        <div className="bg-white text-black rounded-3xl p-6 shadow-lg w-1/6 mr-6">
          <h2 className="text-center font-bold text-xl mb-4">What-If Scenario</h2>

          {/* Main Simulation Inputs */}
          {mainInputs.map((key) => (
            <div key={key} className="mb-2">
              {key === 'riskAllocation' && <h3 className="text-center font-bold text-lg mb-2">Risk Simulation</h3>}
              <label className="block text-sm font-medium">{labels[key]}:</label>
              <input type={percentageInputs.includes(key) ? 'number' : 'text'} name={key} value={numberInputs.includes(key) ? formatNumber(inputs[key]) : inputs[key]} onChange={handleChange} className="w-full border-b-2 border-gray-300 outline-none p-1 bg-transparent" />
            </div>
          ))}
          {/* Calculate button placed right after main simulation inputs */}
          <button onClick={calculateFinancialFreedom} className="bg-black text-white px-4 py-2 rounded mt-4 w-full">
            Calculate
          </button>

          {/* Accident Simulation Section */}
          <h3 className="text-center font-bold text-lg mt-6 mb-2">Accident Simulation</h3>
          {accidentInputs.map((key) => (
            <div key={key} className="mb-2">
              <label className="block text-sm font-medium">{labels[key]}:</label>
              <input type={percentageInputs.includes(key) ? 'number' : 'text'} name={key} value={numberInputs.includes(key) ? formatNumber(inputs[key]) : inputs[key]} onChange={handleChange} className="w-full border-b-2 border-gray-300 outline-none p-1 bg-transparent" />
            </div>
          ))}
          <button onClick={simulateAccident} className="bg-red-600 text-white px-4 py-2 rounded mt-4 w-full">
            Simulate Accident
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg w-5/6">
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
              <ReferenceLine x={inputs.accidentAge} stroke="red" label={{ value: 'Accident', position: 'top', fill: 'red' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {result && (
        <div className="bg-white text-black p-4 rounded-3xl shadow-lg w-2/3 mt-6 text-center">
          {result.accidentApplied ? (
            <>
              <p className="font-bold">After accident, with risk, you will achieve Financial Freedom Point at age {result.financialFreedomAge ? result.financialFreedomAge : 'N/A'}</p>
              <p className="font-bold">After accident, without risk, you will achieve Financial Freedom Point at age {result.withoutRiskFinancialFreedomAge ? result.withoutRiskFinancialFreedomAge : 'N/A'}</p>
            </>
          ) : (
            <>
              <p className="font-bold">With risk, you will achieve Financial Freedom Point at age {result.financialFreedomAge ? result.financialFreedomAge : 'N/A'}</p>
              <p className="font-bold">Without risk, you will achieve Financial Freedom Point at age {result.withoutRiskFinancialFreedomAge ? result.withoutRiskFinancialFreedomAge : 'N/A'}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
