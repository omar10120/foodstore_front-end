import { useState } from 'react';
import '../css/viewProduct.css';
import { maxWidth, width } from '@mui/system';

function ViewProduct() {
    return (
        <div className="view-container" style={{marginTop:'50px',maxWidth:'5000px'}}>
            <div className="row g-1">
                <div className="col-md-6">
                    <div className='card_pro' style={{marginTop:'10px',height:'400px'}}>
                        <div className='c'>
                        <h5 className="title2">Name Product</h5>
                        <p className="title2">Details about Product</p>
                        <p className="title2">Expiration Date</p>
                        <div className="row1">
                        <p className="col-md-2" style={{ display: 'inline-block', marginRight: '110px' }}>After_Discount: $XX.XX</p>
                        <p className="col-md-3" style={{ display: 'inline-block', marginRight: '40px' }}>Before_Discount: $XX.XX</p>
                        </div>
                        <p className="title2">Category</p>
                        <p className="title2">Availability</p>
                    </div></div>
                </div>
                <div className="col-md-6">
                    <div className='card_pro2'>
                        <div className="image-container2">
                            <img 
                                src="https://th.bing.com/th/id/OIP.jRvpBzSahyFGJcotYVHgCwHaHa?rs=1&pid=ImgDetMain" 
                                alt="Product" 
                                style={{ width: '100%', height: 'auto', borderRadius: '10px' }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewProduct;