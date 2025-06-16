import { useDispatch, useSelector } from 'react-redux';
import './css/Charity.css';
import { useState, useEffect } from 'react';
import { fetchGetAllCharities } from './Redux/Slices/CharitySlice';
import CartButton from './CartButton';
import './css/Product.css';
import { useNavigate } from 'react-router-dom';

function Charity() {
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showErrorToast1, setShowErrorToast1] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const { charity, error, loading } = useSelector(state => state.charitySlice);
    const products = useSelector(state => state.productSlice.productsArray); 
    const dispatch = useDispatch();
    const [inputAmount, setInputAmount] = useState(1);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const toggleDropdown = () => {
        setShowCart(prevShow => !prevShow);
    };

    useEffect(() => {
        dispatch(fetchGetAllCharities());
    }, [dispatch]);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const handleButtonClick = () => {
        setShowErrorToast(true);
        setTimeout(() => {
            setShowErrorToast(false);
        }, 3000);
    };

    const addToCart = (charity, product) => {
        if (!charity || !product || !inputAmount || inputAmount < 1) {
            return; 
        }

        const newItem = {
            name: charity.charityName, 
            productName: product.productName, 
            quantity: inputAmount,
        };

        setCartItems(prevItems => [...prevItems, newItem]); 
        setInputAmount(1); 
        handleButtonClick(); 
    };

    const updateQuantity = (index, value) => {
        const updatedItems = [...cartItems];
        updatedItems[index].quantity = Math.max(1, value);
        setCartItems(updatedItems);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container_Char">
            <CartButton cartItems={cartItems} toggleDropdown={toggleDropdown} />
            {showCart && (
                <div className="cart-dropdown">
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                            <div key={index} className="cart-item1 card_char" style={{
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                height: '200px'
                            }}>
                                <p style={{ marginTop: '5px' }}>
                                    Charity:{item.name} - 
                                    Product:{item.productName} 
                                </p>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(index, e.target.value)}
                                    style={{
                                        width: '100px',
                                        marginRight: '5px',
                                        marginTop: '10px'
                                    }}
                                />
                                <button 
                                    style={{ marginLeft: '10px',backgroundColor: 'blue', 
                                        color: 'white', }}
                                    onClick={() => setShowErrorToast1(true)}>+</button>
                            </div>
                        ))
                    ) : (
                        <p>No items in the cart.</p>
                    )}
                </div>
            )}

            {charity.map(ch => (
                <div className="card_char" key={ch.id}>
                    <img 
                        className="card-img4" 
                        src={`${process.env.PUBLIC_URL}/images/OIP (9).jfif`} 
                        alt={`Charity: ${ch.charityName}`} 
                    />
                    <div className="card-body">
                        <h5 className="card-title">{ch.charityName}</h5>
                        <p className="card-text">Phone: {ch.charityInfo}</p>
                        <p className="card-text">Description: {ch.charityDescription}</p>
                        <button className="btn1 btn-info"
                         style={{backgroundColor: 'blue', 
                            color: 'white',}}
                        onClick={() => addToCart(ch, products[0])}> 
                            <div style={{ color: 'white' }}>
                                <i className="bi bi-plus-circle-fill"></i> Donation
                            </div>
                        </button>
                    </div>
                </div>
            ))}

            {showErrorToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="toast-header">
                            <strong className="me-auto">Warning</strong>
                            <small>Now</small>
                            <button type="button" className="btn-close" onClick={() => setShowErrorToast(false)} aria-label="Close"></button>
                        </div>
                        <div className="toast-body">
                            Successful Choice Charity! Thanks!
                        </div>
                    </div>
                </div>
            )}
            {showErrorToast1 && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="toast-header">
                            <strong className="me-auto">Warning</strong>
                            <small>Now</small>
                            <button type="button" className="btn-close" onClick={() => setShowErrorToast1(false)} aria-label="Close"></button>
                        </div>
                        <div className="toast-body">
                            Successful Add Product to Cart! Thanks!
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Charity;