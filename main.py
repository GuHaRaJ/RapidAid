from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import uuid
import json



app = Flask(__name__)
app.secret_key = 'RapidAid@1234567890'  # Required for session management
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orders.db'
db = SQLAlchemy(app)



# Order Model
class Order(db.Model):
    id = db.Column(db.String(8), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    items = db.Column(db.Text, nullable=False) 
    status = db.Column(db.String(20), default='Pending')  


with app.app_context():
    db.create_all()


@app.template_filter('from_json')
def from_json(json_string):
    return json.loads(json_string)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

@app.route('/view_orders', methods=['GET'])
def view_orders():
    # Retrieve order details from sessionStorage (passed via JavaScript)
    order_details = request.args.get('order_details')
    if not order_details:
        return "No order details found.", 400

    # Debug: Print the received order_details
    print("Received order_details:", order_details)

    # Parse the order details
    try:
        order_details = json.loads(order_details)
    except json.JSONDecodeError as e:
        return f"Invalid JSON data: {e}", 400

    # Debug: Print the parsed order_details
    print("Parsed order_details:", order_details)

    # Generate a unique order ID
    order_id = str(uuid.uuid4())[:8]

    # Create a new order record
    new_order = Order(
        id=order_id,
        name=order_details.get('name', ''),
        email=order_details.get('email', ''),
        phone=order_details.get('phone', ''),
        address=order_details.get('address', ''),
        pincode=order_details.get('pincode', ''),
        total_price=float(order_details.get('totalPrice', 0)),  
        items=order_details.get('cartItems', '[]')
    )

    
    db.session.add(new_order)
    db.session.commit()

    
    print("Order details being passed to template:", {
        'order_id': order_id,
        'name': order_details.get('name', ''),
        'email': order_details.get('email', ''),
        'phone': order_details.get('phone', ''),
        'address': order_details.get('address', ''),
        'pincode': order_details.get('pincode', ''),
        'cart_items': json.loads(order_details.get('cartItems', '[]')),
        'total_price': float(order_details.get('totalPrice', 0))  
    })

    
    return render_template('order_confirmation.html', 
                           order_id=order_id, 
                           name=order_details.get('name', ''), 
                           email=order_details.get('email', ''), 
                           phone=order_details.get('phone', ''), 
                           address=order_details.get('address', ''), 
                           pincode=order_details.get('pincode', ''), 
                           cart_items=json.loads(order_details.get('cartItems', '[]')), 
                           total_price=float(order_details.get('totalPrice', 0)))  
                           

@app.route('/delivery_orders')
def delivery_orders():
    search_query = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    per_page = 10

    if search_query:
        orders = Order.query.filter(
            (Order.id.contains(search_query)) | 
            (Order.name.contains(search_query)) | 
            (Order.email.contains(search_query))
        ).paginate(page=page, per_page=per_page)
    else:
        orders = Order.query.paginate(page=page, per_page=per_page)

    
    print("Orders being passed to template:", orders.items)

    return render_template('delivery_orders.html', orders=orders, search_query=search_query)
@app.route('/update_status/<order_id>', methods=['POST'])
def update_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    order.status = data['status']
    db.session.commit()
    return jsonify(success=True)

if __name__ == "__main__":
    app.run(debug=True)