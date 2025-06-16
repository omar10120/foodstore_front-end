import { Link } from 'react-router-dom';
import React, { useState } from 'react';

function ProductSellers() {
    const [products, setProducts] = useState(Array.from({ length: 15 }, (_, index) => ({
        id: index + 1001,
        image: 'random-image.jpg',
        name: `Product ${index + 1}`,
        details: `Details about Product ${index + 1}`,
        expirationDate: '2023-12-31',
        category: `Category ${index + 1}`,
        amount: Math.floor(Math.random() * 100),
        beforeDiscount: Math.floor(Math.random() * 100),
        afterDiscount: Math.floor(Math.random() * 80),
        availability: index % 2 === 0,
    })));

    const handleDelete = (id) => {
        setProducts(products.filter(product => product.id !== id));
    };

    const handleUpdate = (updatedProduct) => {
        setProducts(products.map(product => 
            product.id === updatedProduct.id ? updatedProduct : product
        ));
    };

    return (
        <div className='card-p' style={{ margin: '7px' ,width:'100%' ,marginTop:'70px'}}>
            <div className="text-right mb-3"style={{ fontSize: '16px', padding: '5px 10px',marginLeft:'100px' ,marginTop:'-10px' }}>
                <Link 
                    to="/AddProduct" 
                    className="btn btn-success" 
                    style={{ fontSize: '16px', padding: '5px 10px',marginLeft:'900px' ,marginTop:'10px' }}
                >
                    <i className="bi bi-plus-circle-fill" style={{ }}></i>
                    Add New Product
                </Link>
            </div>
            <h2>Products</h2>
            <div className="table-responsive"style={{ margin: '7px' ,width:'100%' }}>
                <table className="table table-striped table-sm">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Image</th>
                            <th scope="col">Name Product</th>
                            <th scope="col">Details about Product</th>
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
                                    <Link 
                                        to={`/viewProduct/${product.id}`} 
                                        className="btn btn-info btn-sm mt-2" 
                                        style={{ fontSize: '12px', padding: '5px 10px', marginLeft: '4px',backgroundColor:'gray' }}
                                    >
                                        <i className="bi bi-info-circle"></i> View
                                    </Link>

                                    <button 
                                        className="btn btn-danger btn-sm mt-2" 
                                        style={{ fontSize: '12px', padding: '5px 10px', marginLeft: '5px' }}
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <i className="bi bi-file-earmark-x"></i> Delete
                                    </button>

                                    <Link 
                                        to={`/EditProduct/${product.id}`} 
                                        className="btn btn-info btn-sm mt-2" 
                                        style={{ fontSize: '12px', padding: '5px 10px', marginLeft: '4px' ,backgroundColor:'gray' }}
                                    >
                                        <i className="bi bi-pencil-fill"></i> Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductSellers;