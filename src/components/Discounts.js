import React from 'react';
import './css/Discount.css';
import { height } from '@mui/system';
import { useNavigate } from "react-router-dom";

function Discounts() {
    const navigate = useNavigate();
    return (
        <div className="container-dis" style={{ 
            maxWidth: '100%', 
            height:'600px',
            margin: 'auto', 
            backgroundImage: `url(${process.env.PUBLIC_URL}/images/th)`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            
        }}>
            <div className="col">
                <div className="card 00primary" style={{ maxWidth: '300px', margin: 'auto' ,marginTop:'50px' }}>
                    <div className="card-header py-2 text-bg-primary border-primary">
                        <h4 className="my-0 fw-normal">Discount No : 1</h4>
                    </div>
                    <div className="card-body" style={{ padding: '15px' }}>
                        <h1 style={{ fontSize: '2.0rem', marginLeft: '20px' }}>Subscribe Now!</h1>
                        <img
                            style={{ width: '200px', height: '220px', marginLeft: '20px', marginTop: '-20px' }}
                            src={`${process.env.PUBLIC_URL}/images/OIP (10).jfif`}
                            alt="Discount Product" 
                        />
                        <ul className="list-unstyled mt-2 mb-3" style={{ fontSize: '0.9rem' }}>
                            <li>30 users included</li>
                            <li>15 GB of storage</li>
                            <li>Phone and email support</li>
                            <li>Help center access</li>
                        </ul>
                        <img
                            style={{ width: '200px', height: '40px', marginLeft: '20px', marginTop: '10px' }}
                            src={`${process.env.PUBLIC_URL}/images/R (1).png`}
                            alt="Discount Product" 
                        />
                        <button type="button" onClick={() =>navigate("../subscribe")} className="w-100 btn btn-lg btn-primary"  style={{ padding: '10px' }}>
                        Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Discounts;