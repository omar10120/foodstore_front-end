import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Products from "./Products";
import Catogery from "./Catogery";

function ListProducts() {
    const [productsArray, setProductsArray] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Fetch all products from the backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/products");
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