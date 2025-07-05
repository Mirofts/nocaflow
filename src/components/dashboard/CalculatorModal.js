// src/components/CalculatorModal.js
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function CalculatorModal({ t, onClose }) {
  const [input, setInput] = useState('0');
  const [currentOperation, setCurrentOperation] = useState(null); // Stores '+', '-', '*', '/', '%'
  const [previousValue, setPreviousValue] = useState(null);
  const [waitingForNewNumber, setWaitingForNewNumber] = useState(true);
  const [history, setHistory] = useState([]); // To store calculation history

  const handleDigitClick = useCallback((digit) => {
    if (waitingForNewNumber) {
      setInput(String(digit));
      setWaitingForNewNumber(false);
    } else {
      setInput(prev => (prev === '0' ? String(digit) : prev + digit));
    }
  }, [waitingForNewNumber]);

  const handleDecimalClick = useCallback(() => {
    if (waitingForNewNumber) {
      setInput('0.');
      setWaitingForNewNumber(false);
    } else if (!input.includes('.')) {
      setInput(prev => prev + '.');
    }
  }, [input, waitingForNewNumber]);

  const handleOperationClick = useCallback((nextOperation) => {
    const inputValue = parseFloat(input);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setHistory(prev => [...prev, `${inputValue}`]);
    } else if (currentOperation) {
      let result;
      let historyEntry = '';

      try {
        switch (currentOperation) {
          case '+': result = previousValue + inputValue; break;
          case '-': result = previousValue - inputValue; break;
          case '*': result = previousValue * inputValue; break;
          case '/': 
            if (inputValue === 0) {
              setInput('Error: Div by 0');
              setPreviousValue(null);
              setCurrentOperation(null);
              setWaitingForNewNumber(true);
              return;
            }
            result = previousValue / inputValue; 
            break;
          default: return;
        }
        setPreviousValue(result);
        setInput(formatScientific(result));
        historyEntry = `${previousValue} ${currentOperation} ${inputValue} = ${formatScientific(result)}`;
      } catch (e) {
        setInput('Error');
        setPreviousValue(null);
        setCurrentOperation(null);
        setWaitingForNewNumber(true);
        console.error("Calculation error:", e);
        return;
      }
      setHistory(prev => [...prev, historyEntry]);
    }

    setCurrentOperation(nextOperation);
    setWaitingForNewNumber(true);
    if (nextOperation === '=') {
        setCurrentOperation(null); // Reset operation after '='
        setHistory(prev => [...prev, "---"]); // Separator for new calculation block
    } else {
        // If not '=', add current operation to history if it's the start of a new calculation block or just after result
        if (history.length === 0 || history[history.length - 1].includes('=')) {
            setHistory(prev => [...prev.slice(0, -1), `${inputValue} ${nextOperation}`]); // Replace last entry with operation
        } else {
            setHistory(prev => [...prev.slice(0, -1), `${previousValue !== null ? previousValue : inputValue} ${nextOperation}`]);
        }
    }
  }, [input, currentOperation, previousValue, history]);

  const handlePercentageClick = useCallback(() => {
    const inputValue = parseFloat(input);
    if (currentOperation === '+' || currentOperation === '-') {
      // For addition/subtraction, % means (previousValue * inputValue / 100)
      const percentageValue = previousValue * (inputValue / 100);
      setInput(formatScientific(percentageValue));
      // You might want to automatically apply this percentage value to previousValue
      // For simplicity, here we just show the percentage value and keep the operation for next number
    } else if (currentOperation === '*' || currentOperation === '/') {
      // For multiplication/division, % means (inputValue / 100)
      setInput(formatScientific(inputValue / 100));
    } else {
      // If no operation, treat it as inputValue / 100
      setInput(formatScientific(inputValue / 100));
    }
    // Don't change waitingForNewNumber immediately, let user decide next action
  }, [input, previousValue, currentOperation]);

  const handleClear = useCallback(() => {
    setInput('0');
    setCurrentOperation(null);
    setPreviousValue(null);
    setWaitingForNewNumber(true);
    setHistory([]);
  }, []);

  const handleToggleSign = useCallback(() => {
    setInput(prev => String(parseFloat(prev) * -1));
  }, []);

  const formatScientific = (num) => {
    if (isNaN(num) || !isFinite(num)) return String(num); // Handle NaN, Infinity
    if (Math.abs(num) >= 1e12 || Math.abs(num) < 1e-6 && num !== 0) { // Large or very small numbers
      return num.toExponential(6); // Scientific notation with 6 decimal places
    }
    if (num.toString().length > 12) { // Limit length for display
        return parseFloat(num.toFixed(8)).toString(); // Fix to 8 decimal places and remove trailing zeros
    }
    return num.toString();
  };

  const buttonStyle = "w-16 h-16 rounded-full text-xl font-bold flex items-center justify-center transition-colors duration-200 shadow-md";
  const digitStyle = "bg-slate-700 text-white hover:bg-slate-600";
  const operationStyle = "bg-violet-600 text-white hover:bg-violet-500";
  const accentStyle = "bg-pink-500 text-white hover:bg-pink-400";
  const equalsStyle = "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600 col-span-2 w-full !rounded-full"; // For the equals button spanning two columns

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: "0", opacity: 1 }}
        exit={{ y: "100vh", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="glass-card p-6 rounded-2xl max-w-sm w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-4 text-center">Flow Calculator</h2>

        {/* History Display */}
        <div className="bg-slate-900/50 rounded-lg p-2 mb-3 text-right text-slate-400 text-sm h-20 overflow-y-auto custom-scrollbar">
            {history.map((entry, index) => (
                <div key={index}>{entry}</div>
            ))}
        </div>

        {/* Calculator Display */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-4 text-right overflow-x-auto whitespace-nowrap text-white text-4xl font-light tracking-wide shadow-inner border border-slate-700">
          {input}
        </div>

        {/* Calculator Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          <button className={`${buttonStyle} ${accentStyle}`} onClick={handleClear}>{t('calculator_clear', 'AC')}</button>
          <button className={`${buttonStyle} ${accentStyle}`} onClick={handleToggleSign}>+/-</button>
          <button className={`${buttonStyle} ${accentStyle}`} onClick={handlePercentageClick}>%</button>
          <button className={`${buttonStyle} ${operationStyle}`} onClick={() => handleOperationClick('/')}>÷</button>

          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(7)}>7</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(8)}>8</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(9)}>9</button>
          <button className={`${buttonStyle} ${operationStyle}`} onClick={() => handleOperationClick('*')}>×</button>

          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(4)}>4</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(5)}>5</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(6)}>6</button>
          <button className={`${buttonStyle} ${operationStyle}`} onClick={() => handleOperationClick('-')}>-</button>

          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(1)}>1</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(2)}>2</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={() => handleDigitClick(3)}>3</button>
          <button className={`${buttonStyle} ${operationStyle}`} onClick={() => handleOperationClick('+')}>+</button>

          <button className={`${buttonStyle} ${digitStyle} col-span-2 w-full !rounded-full`} onClick={() => handleDigitClick(0)}>0</button>
          <button className={`${buttonStyle} ${digitStyle}`} onClick={handleDecimalClick}>.</button>
          <button className={`${buttonStyle} ${equalsStyle}`} onClick={() => handleOperationClick('=')}>=</button>
        </div>
      </motion.div>
    </motion.div>
  );
}