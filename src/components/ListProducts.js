// ListProducts.js
import { useEffect, useState } from "react";
import Products from "./Products";
import Category from "./Catogery";
import { useSelector } from "react-redux";
import axios from 'axios';

function ListProducts() {
    const [productsArray, setProductsArray] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const itemsPerPage = 9;
    const token = useSelector((state) => state.auth.token);
    const [subscriptionStatus, setSubscriptionStatus] = useState(false);

    useEffect(() => {
        const source = axios.CancelToken.source();
        let isMounted = true;
        
        const fetchUserData = async () => {
          try {
            const response = await axios.get(
              "http://localhost:8080/api/users/me", 
              {
                headers: { Authorization: `Bearer ${token}` },
                cancelToken: source.token
              }
            );
            if(response.status === 200) {
                setSubscriptionStatus(response.data.subscriptionStatus);
            }
          } catch (err) {
            if (isMounted) {
              setError(axios.isCancel(err) 
                ? "Request canceled" 
                : err.response?.data || err.message
              );
            }
          }
        };
    
        if (token) {
          fetchUserData();
        } else {
            setError("No authentication token found");
        }
    
        return () => {
          isMounted = false;
          source.cancel("Component unmounted, canceling request");
        };
    }, [token]);

    useEffect(() => {
        const fetchProducts = async () => {
            let baseurl;
            try {
                // If category is selected, use category-specific endpoint
                if (selectedCategory) {
                    baseurl = `http://localhost:8080/api/products/category/${selectedCategory}`;
                } 
                // Otherwise, use normal products endpoint
                else {
                    if (subscriptionStatus) {
                        baseurl = "http://localhost:8080/api/products/nearby";
                    } else {
                        baseurl = "http://localhost:8080/api/products";
                    }
                }
                
                const response = await fetch(baseurl, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                
                const data = await response.json();
                console.log(data);
                setProductsArray(data);
                setLoading(false);
                
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [subscriptionStatus, selectedCategory, token]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1); // Reset to first page when category changes
    };

    const totalProducts = productsArray.length || 0;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;

    const uniqueProducts = Array.from(new Set(productsArray.map(product => product.productId)))
        .map(id => productsArray.find(product => product.productId === id));

    const currentProducts = uniqueProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div className="container">
            <div>
                <Category onCategorySelect={handleCategorySelect} />
            </div>
            
            <div className="products-grid-container">
                <div className="row">
                {currentProducts.map((product) => (
                    <div className="col-md-4 col-sm-6 mb-4" key={product.productId}>
                    <Products product={product} />
                    </div>
                ))}
                </div>
            </div>

            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`page-button ${currentPage === pageNumber ? "active" : ""}`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default ListProducts;