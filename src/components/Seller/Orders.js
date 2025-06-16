import React, { useState } from 'react';
import '../css/Order.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

function Orders() {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [inputAmounts, setInputAmounts] = useState({});
    const [errorMessages, setErrorMessages] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [invoice, setInvoice] = useState(null); // لتخزين الفاتورة
    
    const { order_id } = useParams();
    const navigate = useNavigate();

    const products = [
        {
            id: 1,
            image: 'https://th.bing.com/th/id/OIP.jRvpBzSahyFGJcotYVHgCwHaHa?rs=1&pid=ImgDetMain',
            name: 'حليب المراعي',
            details: 'حليب كامل الدسم من المراعي، لذيذ ومغذي.',
            expirationDate: '2023-12-31',
            category: 'المشروبات',
            amount: 100,
            beforeDiscount: 10,
            afterDiscount: 8,
            availability: true,
        },
        {
            id: 2,
            image: 'https://example.com/image2.jpg', // Replace with actual image URL
            name: 'منتج آخر',
            details: 'وصف المنتج الآخر.',
            expirationDate: '2024-01-01',
            category: 'المشروبات',
            amount: 50,
            beforeDiscount: 15,
            afterDiscount: 12,
            availability: true,
        },
        // Add more products as needed
    ];

    const handleMakeOrder = () => {
        setShowModal(true);
    };

    const handleSaveOrder = () => {
        const invoiceData = selectedProducts.map(id => {
            const product = products.find(p => p.id === id);
            const amount = inputAmounts[id] || 0;
            return {
                name: product.name,
                amount,
                price: product.afterDiscount,
                total: product.afterDiscount * amount,
            };
        });
    
        const totalInvoiceAmount = invoiceData.reduce((sum, item) => sum + item.total, 0);
    
        const invoice = {
            order_id,
            items: invoiceData,
            total: totalInvoiceAmount,
        };
    
        console.log("تفاصيل الفاتورة:", invoice); 
    
        setShowModal(false);
        navigate(`/ViewBillsBuyer/${order_id}`, { state: { invoice } }); 
    };

    const GetAmount = (productId, value) => {
        const product = products.find(p => p.id === productId);
        const amount = parseInt(value, 10) || 0;

        let error = '';
        if (product) {
            if (amount > product.amount) {
                error = `Error: The amount entered (${amount}) exceeds available amount (${product.amount}) for ${product.name}.`;
            } else if (amount < 1) {
                error = `Error: Please enter a valid amount for ${product.name}.`;
            }
        }

        setErrorMessages(prev => ({
            ...prev,
            [productId]: error,
        }));

        setInputAmounts(prev => ({
            ...prev,
            [productId]: amount,
        }));
    };

    const toggleSelect = (productId) => {
        setSelectedProducts(prevSelected => (
            prevSelected.includes(productId) 
                ? prevSelected.filter(id => id !== productId) 
                : [...prevSelected, productId]
        ));
    };

    return (
        <div className="container_orders">
            <div className="row g-2">
                <div className="col-md-6">
                    <div className="card_products">
                        <h2>Products</h2>
                        <div className="table-responsive" style={{ margin: '7px', width: '100%' }}>
                            <table className="table table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Image</th>
                                        <th scope="col">Name Product</th>
                                        <th scope="col">Details</th>
                                        <th scope="col">Expiration Date</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Before Discount</th>
                                        <th scope="col">After Discount</th>
                                        <th scope="col">Availability</th>
                                        <th scope="col">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>
                                                <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px' }} />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.details}</td>
                                            <td>{product.expirationDate}</td>
                                            <td>{product.category}</td>
                                            <td>{product.amount}</td>
                                            <td>{product.beforeDiscount}</td>
                                            <td>{product.afterDiscount}</td>
                                            <td>
                                                {product.availability ? (
                                                    <i className="bi bi-check-circle-fill" style={{ color: 'green' }}></i>
                                                ) : (
                                                    ' Not Available'
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    className={`btn ${selectedProducts.includes(product.id) ? 'btn-success' : 'btn-secondary'}`} 
                                                    onClick={() => toggleSelect(product.id)} 
                                                    style={{ backgroundColor: selectedProducts.includes(product.id) ? 'green' : 'gray' }}>
                                                    {selectedProducts.includes(product.id) ? 'Selected' : 'Select'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card4" style={{ height: '300px', transition: 'height 0.3s', overflow: 'auto' }}>
                        <h2 style={{ textAlign: 'center' }}>Order</h2>
                        <h4>Selected Products:</h4>
                        {selectedProducts.length > 0 ? (
                            selectedProducts.map(id => {
                                const product = products.find(p => p.id === id);
                                return product ? (
                                    <div key={id} className="card" style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
                                        <h5>{product.name}</h5>
                                        <p>After Discount: {product.afterDiscount}</p>
                                        <label htmlFor={`amount-${id}`} className="form-label">Amount</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errorMessages[id] ? 'is-invalid' : ''}`}
                                            id={`amount-${id}`}
                                            placeholder='Enter Amount'
                                            style={{ width: '100px' }}
                                            value={inputAmounts[id] || ''}
                                            onChange={(e) => GetAmount(id, e.target.value)}
                                            required
                                        />
                                        {errorMessages[id] && <div className="invalid-feedback">{errorMessages[id]}</div>}
                                    </div>
                                ) : null;
                            })
                        ) : (
                            <p>No products selected.</p>
                        )}
                        {selectedProducts.length > 0 && (
                            <>
                                <button onClick={handleMakeOrder} className="btn btn-primary">Create Order</button>
                                <Modal show={showModal} onHide={() => setShowModal(false)} aria-labelledby="staticBackdropLabel">
                                    <Modal.Header closeButton>
                                        <Modal.Title id="staticBackdropLabel">Confirm Order</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        Are you sure you want to create a new order?
                                    </Modal.Body>
                                    <Modal.Footer style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                        <button 
                                            type="button" 
                                            className="btn btn-primary" 
                                            onClick={handleSaveOrder} 
                                            style={{ width: '100px', marginRight: '10px' }}
                                        >
                                            Yes
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={() => setShowModal(false)} 
                                            style={{ width: '100px' }}
                                        >
                                            No
                                        </button>
                                    </Modal.Footer>
                                </Modal>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Orders;