const display = document.getElementById('display');
let currentInput = '';
let operator = '';
let previousInput = '';

function appendToDisplay(value) {
    // Prevent multiple decimal points in current number
    if (value === '.' && currentInput.includes('.')) return;
    currentInput += value;
    display.value = currentInput;
}

function clearDisplay() {
    currentInput = '';
    operator = '';
    previousInput = '';
    display.value = '0'; // Show 0 when cleared
}

function setOperator(op) {
    if (currentInput === '' && previousInput === '') { // No input at all
        return;
    }
    if (currentInput === '' && previousInput !== '' && operator !== '') { // Already have a number and an operator, user is changing operator
        operator = op;
        display.value = previousInput + operator; // Update display to show new operator
        return;
    }

    // If there's an existing operator and previousInput, and new input has been entered, calculate first
    if (operator && previousInput !== '' && currentInput !== '') {
        calculateResult(false); // Calculate but don't reset for a new full operation yet
                                // The result will be in currentInput, ready to be previousInput
    }
    
    // After potential calculation, or if it's the first operator
    if (currentInput !== '') { // If there is a current input, it becomes the previous one
        previousInput = currentInput;
    }
    
    currentInput = '';
    operator = op;
    display.value = previousInput + operator; // Show previous number and new operator
}

async function calculateResult(isFinalCalculation = true) {
    if (previousInput === '' || currentInput === '' || operator === '') {
        // Only show error if it's a final calculation triggered by '='
        if (isFinalCalculation) display.value = 'Error: Incomplete';
        return;
    }

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                num1: previousInput,
                num2: currentInput,
                operator: operator,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            display.value = data.result;
            currentInput = data.result.toString();
            if (isFinalCalculation) {
                previousInput = '';
                operator = '';
            } else {
                // If it's an intermediate calculation (e.g. 1+2+3),
                // the result (currentInput) becomes the new previousInput for the next operation.
                previousInput = currentInput;
                // currentInput will be cleared by the next call to setOperator or when a new digit is pressed.
                // operator is already set by the setOperator function that called this.
            }
        } else {
            display.value = data.error || 'Error';
            if (isFinalCalculation) {
                // Clear state on error for a final calculation
                previousInput = '';
                currentInput = '';
                operator = '';
            }
        }
    } catch (error) {
        display.value = 'Error: Network issue';
        console.error('Fetch error:', error);
        if (isFinalCalculation) {
            previousInput = '';
            currentInput = '';
            operator = '';
        }
    }
}

async function calculateRectanglePerimeter() {
    const length = document.getElementById('rect-length').value;
    const width = document.getElementById('rect-width').value;
    const resultSpan = document.getElementById('rectangle-perimeter-result');

    if (length === '' || width === '') {
        resultSpan.textContent = 'Error: Both length and width are required.';
        return;
    }

    try {
        const response = await fetch('/geometry/rectangle_perimeter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ length: length, width: width }),
        });
        const data = await response.json();
        if (response.ok) {
            resultSpan.textContent = 'Perimeter = ' + data.perimeter;
        } else {
            resultSpan.textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (error) {
        resultSpan.textContent = 'Error: Network issue.';
        console.error('Rectangle perimeter error:', error);
    }
}

async function calculateCircleCircumference() {
    const radius = document.getElementById('circle-radius').value;
    const resultSpan = document.getElementById('circle-circumference-result');

    if (radius === '') {
        resultSpan.textContent = 'Error: Radius is required.';
        return;
    }

    try {
        const response = await fetch('/geometry/circle_circumference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ radius: radius }),
        });
        const data = await response.json();
        if (response.ok) {
            resultSpan.textContent = 'Circumference = ' + data.circumference;
        } else {
            resultSpan.textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (error) {
        resultSpan.textContent = 'Error: Network issue.';
        console.error('Circle circumference error:', error);
    }
}

async function solveQuadraticEquation() {
    const a = document.getElementById('quad-a').value;
    const b = document.getElementById('quad-b').value;
    const c = document.getElementById('quad-c').value;
    const resultSpan = document.getElementById('quadratic-equation-result');

    if (a === '' || b === '' || c === '') {
        resultSpan.textContent = 'Error: All fields (a, b, c) are required.';
        return;
    }

    try {
        const response = await fetch('/algebra/solve_quadratic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ a: a, b: b, c: c }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.roots) {
                if (data.roots.length === 1) {
                    resultSpan.textContent = 'x = ' + data.roots[0];
                } else {
                    resultSpan.textContent = 'x1 = ' + data.roots[0] + ', x2 = ' + data.roots[1];
                }
            } else if (data.message) {
                resultSpan.textContent = data.message;
            } else {
                 resultSpan.textContent = 'x = ' + data.x; // Should align with backend response key for single root
            }
        } else {
            resultSpan.textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (error) {
        resultSpan.textContent = 'Error: Network issue or server error.';
        console.error('Solve quadratic equation error:', error);
    }
}

// Initialize display
clearDisplay();

async function calculateRectangleArea() {
    const length = document.getElementById('rect-length').value;
    const width = document.getElementById('rect-width').value;
    const resultSpan = document.getElementById('rectangle-area-result');

    if (length === '' || width === '') {
        resultSpan.textContent = 'Error: Both length and width are required.';
        return;
    }

    try {
        const response = await fetch('/geometry/rectangle_area', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ length: length, width: width }),
        });
        const data = await response.json();
        if (response.ok) {
            resultSpan.textContent = 'Area = ' + data.area;
        } else {
            resultSpan.textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (error) {
        resultSpan.textContent = 'Error: Network issue.';
        console.error('Rectangle area error:', error);
    }
}

async function calculateCircleArea() {
    const radius = document.getElementById('circle-radius').value;
    const resultSpan = document.getElementById('circle-area-result');

    if (radius === '') {
        resultSpan.textContent = 'Error: Radius is required.';
        return;
    }

    try {
        const response = await fetch('/geometry/circle_area', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ radius: radius }),
        });
        const data = await response.json();
        if (response.ok) {
            resultSpan.textContent = 'Area = ' + data.area;
        } else {
            resultSpan.textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (error) {
        resultSpan.textContent = 'Error: Network issue.';
        console.error('Circle area error:', error);
    }
}

async function solveLinearEquation() {
    const a = document.getElementById('algebra-a').value;
    const b = document.getElementById('algebra-b').value;
    const c = document.getElementById('algebra-c').value;
    const resultSpan = document.getElementById('linear-equation-result');

    if (a === '' || b === '' || c === '') {
        resultSpan.textContent = 'Error: All fields (a, b, c) are required.';
        return;
    }

    try {
        const response = await fetch('/algebra/solve_linear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ a: a, b: b, c: c }),
        });

        const data = await response.json();

        if (response.ok) {
            resultSpan.textContent = 'x = ' + data.x;
        } else {
            resultSpan.textContent = 'Error: ' + (data.error || 'Unknown error');
        }
    } catch (error) {
        resultSpan.textContent = 'Error: Network issue or server error.';
        console.error('Solve linear equation error:', error);
    }
}
