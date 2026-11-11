/**
 * ==============================================================================
 * JAVASCRIPT: THE CALCULATOR BRAIN & LOGIC
 * ==============================================================================
 * Welcome to the JavaScript code! 
 * As a beginner, think of JavaScript as the "nervous system":
 *  1. It listens for user events (mouse clicks or keyboard presses).
 *  2. It updates our internal memory (variables / state).
 *  3. It writes the new results back to the HTML screen (DOM manipulation).
 */

// ==============================================================================
// STEP 1: SELECTING HTML ELEMENTS (CONNECTING JS TO HTML)
// ==============================================================================
// We grab references to our HTML elements using document.getElementById and querySelectorAll.
const previousOperandText = document.getElementById('previous-operand');
const currentOperandText = document.getElementById('current-operand');

const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const actionButtons = document.querySelectorAll('[data-action]');

// ==============================================================================
// STEP 2: CALCULATOR CLASS (STATE & OPERATIONS)
// ==============================================================================
// Using a Class is a modern best practice. It bundles the calculator's data 
// and its actions neatly together.
class Calculator {
  constructor(previousOperandText, currentOperandText) {
    this.previousOperandText = previousOperandText;
    this.currentOperandText = currentOperandText;
    this.clear(); // Set default values when calculator starts
  }

  /**
   * Resets all values back to starting state (AC button).
   */
  clear() {
    this.currentOperand = '0';   // Number currently being entered
    this.previousOperand = '';  // Stored number waiting for calculation
    this.operation = undefined; // The operator chosen (+, -, ×, ÷)
    this.shouldResetScreen = false; // Flag to clear screen on next digit after calculation
  }

  /**
   * Toggles positive / negative sign (± button).
   * Example: 5 becomes -5, and -5 becomes 5.
   */
  negate() {
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
    this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
  }

  /**
   * Converts the current number to a percentage (% button).
   * Example: 50 becomes 0.5.
   */
  percent() {
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
    const current = parseFloat(this.currentOperand);
    this.currentOperand = (current / 100).toString();
  }

  /**
   * Appends a number or decimal point when clicked.
   * @param {string} number - The digit or '.' clicked.
   */
  appendNumber(number) {
    // If user just finished calculating (=), typing a new digit starts a new number
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // EDGE CASE 1: Prevent typing multiple decimals (e.g., "5.2.1")
    if (number === '.' && this.currentOperand.includes('.')) return;

    // EDGE CASE 2: Replace initial '0' with the first pressed number
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
      return;
    }

    // Limit length so numbers don't overflow screen
    if (this.currentOperand.length >= 10) return;

    // Concatenate strings: e.g. "1" + "2" becomes "12"
    this.currentOperand += number;
  }

  /**
   * Stores the selected operator (+, −, ×, ÷) and shifts numbers.
   * @param {string} operation - The chosen math operator.
   */
  chooseOperation(operation) {
    if (this.currentOperand === 'Error') return;

    // If there is already a previous operand waiting, compute it first
    // Example: User types 5 + 3 and then presses "+" -> computes 8 first!
    if (this.previousOperand !== '') {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '0';
  }

  /**
   * Computes the math result based on previousOperand, currentOperand, and operation.
   */
  compute() {
    let result;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    // If either value is not a valid number, stop here
    if (isNaN(prev) || isNaN(current)) return;

    // Check which math operator was selected
    switch (this.operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        // EDGE CASE 3: Division by zero is mathematically undefined
        if (current === 0) {
          this.currentOperand = 'Error';
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    // EDGE CASE 4: JavaScript floating-point bug fix!
    // In JS, 0.1 + 0.2 equals 0.30000000000000004. We round to 8 decimal places:
    result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

    // Store result back into currentOperand
    this.currentOperand = result.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  /**
   * Helper function: Adds commas to large numbers for readability.
   * Example: turns "1000000" into "1,000,000"
   */
  formatDisplayNumber(number) {
    if (number === 'Error') return 'Error';

    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      // Formats the integer part with local thousand-separators
      integerDisplay = integerDigits.toLocaleString('en', {
        maximumFractionDigits: 0,
      });
    }

    // If user typed a decimal point, re-attach it with whatever follows
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  /**
   * Updates the HTML elements on screen with current values.
   */
  updateDisplay() {
    this.currentOperandText.innerText = this.formatDisplayNumber(this.currentOperand);

    // If an operator is selected, show "5 +" on top line
    if (this.operation != null) {
      this.previousOperandText.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandText.innerText = '';
    }
  }
}

// ==============================================================================
// STEP 3: INITIALIZE & WIRE UP EVENT LISTENERS
// ==============================================================================

// Create a new instance of our Calculator class
const calculator = new Calculator(previousOperandText, currentOperandText);

// 1. Number Buttons (0 - 9, .)
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.getAttribute('data-number'));
    calculator.updateDisplay();
  });
});

// 2. Operator Buttons (+, −, ×, ÷)
operatorButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.getAttribute('data-operator'));
    calculator.updateDisplay();
  });
});

// 3. Action Buttons (AC, ±, %, =)
actionButtons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    
    if (action === 'clear') {
      calculator.clear();
    } else if (action === 'negate') {
      calculator.negate();
    } else if (action === 'percent') {
      calculator.percent();
    } else if (action === 'calculate') {
      calculator.compute();
    }
    
    calculator.updateDisplay();
  });
});

// ==============================================================================
// STEP 4: KEYBOARD SUPPORT (BONUS FEATURE)
// ==============================================================================
// Lets the user type on their physical computer keyboard
window.addEventListener('keydown', e => {
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    calculator.appendNumber(e.key);
  } else if (e.key === '+') {
    calculator.chooseOperation('+');
  } else if (e.key === '-') {
    calculator.chooseOperation('-');
  } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
    calculator.chooseOperation('×');
  } else if (e.key === '/') {
    calculator.chooseOperation('÷');
  } else if (e.key === '%') {
    calculator.percent();
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault(); // Prevents page reload / button focus trigger
    calculator.compute();
  } else if (e.key === 'Backspace') {
    // Delete one character
    if (calculator.currentOperand.length > 1) {
      calculator.currentOperand = calculator.currentOperand.slice(0, -1);
    } else {
      calculator.currentOperand = '0';
    }
  } else if (e.key === 'Escape') {
    calculator.clear();
  }

  calculator.updateDisplay();
});
