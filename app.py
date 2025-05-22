from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    
    num1_str = data.get('num1')
    num2_str = data.get('num2')
    op = data.get('operator')

    try:
        num1 = float(num1_str)
        num2 = float(num2_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Numbers must be numeric.'}), 400

    if op == '+':
        result = num1 + num2
    elif op == '-':
        result = num1 - num2
    elif op == '*':
        result = num1 * num2
    elif op == '/':
        if num2 == 0:
            return jsonify({'error': 'Cannot divide by zero.'}), 400
        result = num1 / num2
    else:
        return jsonify({'error': 'Invalid operator.'}), 400

    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/algebra/solve_linear', methods=['POST'])
def solve_linear_equation_route():
    data = request.get_json()
    a_str = data.get('a')
    b_str = data.get('b')
    c_str = data.get('c')

    try:
        a = float(a_str)
        b = float(b_str)
        c = float(c_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Coefficients must be numeric.'}), 400

    if a == 0:
        if c - b == 0: # 0x = 0, or b = c
            return jsonify({'error': 'Infinite solutions (since a=0 and c-b=0).'}), 400
        else: # 0x = k (k!=0)
            return jsonify({'error': 'No solution (since a=0 and c-b!=0).'}), 400
    
    x = (c - b) / a
    return jsonify({'x': x})

@app.route('/algebra/solve_quadratic', methods=['POST'])
def solve_quadratic_equation_route():
    data = request.get_json()
    a_str = data.get('a')
    b_str = data.get('b')
    c_str = data.get('c')

    try:
        a = float(a_str)
        b = float(b_str)
        c = float(c_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Coefficients must be numeric.'}), 400

    if a == 0:
        # This is a linear equation: bx + c = 0
        if b == 0:
            if c == 0: # 0x + 0 = 0
                return jsonify({'message': 'Infinite solutions (a=0, b=0, c=0).'}), 200
            else: # 0x + c = 0 (c!=0)
                return jsonify({'message': 'No solution (a=0, b=0, c!=0).'}), 200
        x = -c / b
        return jsonify({'message': f'This is a linear equation (a=0). Solution: x = {x}'}), 200

    discriminant = (b**2) - (4*a*c)

    if discriminant > 0:
        x1 = (-b + math.sqrt(discriminant)) / (2*a)
        x2 = (-b - math.sqrt(discriminant)) / (2*a)
        return jsonify({'roots': [x1, x2]})
    elif discriminant == 0:
        x = -b / (2*a)
        return jsonify({'roots': [x]}) # Return as a list for consistency, or just {'x': x}
    else:
        # For complex roots, we'd use cmath. If sticking to real, just message.
        # x1_complex = (-b + cmath.sqrt(discriminant)) / (2*a)
        # x2_complex = (-b - cmath.sqrt(discriminant)) / (2*a)
        # return jsonify({'roots_complex': [str(x1_complex), str(x2_complex)], 'message': 'Complex roots found.'})
        return jsonify({'message': 'No real roots (discriminant is negative).'}), 200

@app.route('/geometry/rectangle_area', methods=['POST'])
def rectangle_area_route():
    data = request.get_json()
    length_str = data.get('length')
    width_str = data.get('width')

    try:
        length = float(length_str)
        width = float(width_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Length and width must be numeric.'}), 400

    if length < 0 or width < 0:
        return jsonify({'error': 'Dimensions cannot be negative.'}), 400
    
    area = length * width
    return jsonify({'area': area})

@app.route('/geometry/circle_area', methods=['POST'])
def circle_area_route():
    data = request.get_json()
    radius_str = data.get('radius')

    try:
        radius = float(radius_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Radius must be numeric.'}), 400

    if radius < 0:
        return jsonify({'error': 'Radius cannot be negative.'}), 400
    
    area = math.pi * (radius**2)
    return jsonify({'area': area})

@app.route('/geometry/rectangle_perimeter', methods=['POST'])
def rectangle_perimeter_route():
    data = request.get_json()
    length_str = data.get('length')
    width_str = data.get('width')

    try:
        length = float(length_str)
        width = float(width_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Length and width must be numeric.'}), 400

    if length < 0 or width < 0:
        return jsonify({'error': 'Dimensions cannot be negative.'}), 400
    
    perimeter = 2 * (length + width)
    return jsonify({'perimeter': perimeter})

@app.route('/geometry/circle_circumference', methods=['POST'])
def circle_circumference_route():
    data = request.get_json()
    radius_str = data.get('radius')

    try:
        radius = float(radius_str)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input. Radius must be numeric.'}), 400

    if radius < 0:
        return jsonify({'error': 'Radius cannot be negative.'}), 400
    
    circumference = 2 * math.pi * radius
    return jsonify({'circumference': circumference})
