import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

function ViewBillsSeller() {
    const { id } = useParams();
    const location = useLocation();
    const { bills } = location.state || { bills: [] }; 

    
    if (!bills) {
        return <p>لا توجد فواتير متاحة.</p>;
    }

    
    const invoice = bills.find(bill => bill.id === parseInt(id));

    return (
        <div className="view-container">
            <div className='card_pro5'>
                <h2>تفاصيل الفاتورة</h2>
                {invoice ? (
                    <div>
                        <h4>رقم الطلب: {invoice.order_id}</h4>
                        <h4>المبلغ الإجمالي: {invoice.total} ر.س</h4>
                        <h5>العناصر:</h5>
                        <ul>
                            {invoice.items.map((item, index) => (
                                <li key={index}>
                                    {item.name} - الكمية: {item.amount}, السعر: {item.price} ر.س, الإجمالي: {item.total} ر.س
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>لا توجد بيانات فاتورة متاحة.</p>
                )}
            </div>
        </div>
    );
}

export default ViewBillsSeller;