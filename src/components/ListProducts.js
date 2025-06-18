import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Products from "./Products";
import Catogery from "./Catogery";
import { useSelector } from "react-redux";
import axios from 'axios';
function ListProducts() {
    const [productsArray, setProductsArray] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const token = useSelector((state) => state.auth.token);
    // Fetch all products from the backend
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
                if(response.status == "200")
                setSubscriptionStatus(response.data.subscriptionStatus);
                

          } catch (err) {
            if (isMounted) {
              setError(axios.isCancel(err) 
                ? "Request canceled" 
                : err.response?.data || err.message
              );
            }
          } finally {
            // if (isMounted) setLoading(false);
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
            var baseurl ;
            try {
                if (subscriptionStatus)
                     baseurl = "http://localhost:8080/api/products/nearby"
                else
                     baseurl = "http://localhost:8080/api/products"
                const response = await fetch(baseurl,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                
                
                const data = await response.json();
                setProductsArray(data);
                if (data.length === 0) {
                    throw new Error("no products found");
                }
                
                setLoading(false);

                
            } catch (err) {
                
                setError(err.message );
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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
    if (error) return <div>Error : {error} </div>;
    
    
    


    return (
        <div className="container">
            <div >
                <Catogery />
            </div>
            <div className="row">
                {/* {currentProducts.map((product) => (
                    <div style={{marginTop:'100px'}}>
                    <Products key={product.id} product={product} />
                    </div>
                ))} */}
                <Products/>
          
             </div>

            {/* <div className="pagination" style={{ marginLeft: "450px" }}>
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
            </div> */}
        </div>
    );
}

export default ListProducts;