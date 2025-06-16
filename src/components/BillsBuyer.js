import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BillsBuyer(){
       const Navigate=useNavigate();
    const [bills] = useState({
        id: 1, 
        name: 'حليب المراعي',
        image: 'https://th.bing.com/th/id/OIP.jRvpBzSahyFGJcotYVHgCwHaHa?rs=1&pid=ImgDetMain',
        id: 1, 
        name: 'حليب المراعي',
        image: 'https://th.bing.com/th/id/OIP.jRvpBzSahyFGJcotYVHgCwHaHa?rs=1&pid=ImgDetMain',
    });
    
    const navigateToDetails = () => {
        Navigate(`/ViewBillsBuyer/${bills.id}`);
    };
    return(
        <div className="conatiner_Char1">
           
            <div className="row_Char1 g-1">
            <div className="col-12 col-sm-6 col-md-4 mb-4">
                
                    <div className="card_char1"style={{marginLeft:'50px'}} onClick={navigateToDetails} >     
                                   
                    <img 
                            className="card-img41" 
                            style={{width:'250px',height:'150px' ,marginLeft:'20px',marginTop:'10px' }}
                            src={`${process.env.PUBLIC_URL}/images/OIP (9).jfif`}
                            alt="Product" 
                        />
                  
                    <p className="t11" typeof='number'>Total Price:</p>
                    
                   
                    </div>
                </div>
               
                   
               </div>
               
                
           
        </div>
    )
}
export default BillsBuyer