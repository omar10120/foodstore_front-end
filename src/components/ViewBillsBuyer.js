import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './css/BillsBuyer.css'
function ViewBillsBuyer() {
    const location = useLocation();
    const { invoice } = location.state || {};
    const overallTotal = invoice ? invoice.items.reduce((sum, item) => sum + item.total, 0) : 0;

    return (
        <div className="view-container">
            <div className='card_pro5'>
                <h2>Invoice Details</h2>
                {invoice ? (
                    <div>
                        <h3 style={{frontSize:'10px'}}>Order ID: {invoice.order_id}</h3>
                        
                        <h5>Items:</h5>
                        <ul>
                            {invoice.items.map((item, index) => (
                                <li key={index}>
                                    {item.name} - Amount: {item.amount}, Price: {item.price}, Total: {item.total}
                                </li>
                            ))}
                        </ul>
                        <h4>Overall Total: {overallTotal}</h4>
                        <Link to={'/charity'}className='btn btn-info' style={{marginLeft:'100px'}}>Donation</Link>
                        <button >Buy</button>
                    </div>
                ) : (
                    <p>No .</p>
                )}
            </div>
        </div>
    );
}

export default ViewBillsBuyer;