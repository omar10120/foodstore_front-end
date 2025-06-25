// Category.js (updated)
import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDispatch, useSelector } from "react-redux";
import { fetchGetAllCategories } from "./Redux/Slices/CatogerySlice"; 

function Category({ onCategorySelect }) { 
    const dispatch = useDispatch();
    const { CategoryArray, loading, error } = useSelector(state => state.categorySlice); 

    useEffect(() => {
        dispatch(fetchGetAllCategories());
    }, [dispatch]);

    if (loading) return <p>Loading...</p>; 
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Category">
            <div className="button-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* All Categories button */}
                <button 
                    key="all"
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={() => onCategorySelect(null)}
                    style={{ margin: '5px' }}
                >
                    All Categories
                </button>
                
                {CategoryArray.map(category => (
                    <button 
                        key={category.categoriesId} 
                        type="button" 
                        className="btn btn-outline-primary" 
                        onClick={() => onCategorySelect(category.categoriesId)}
                        style={{ margin: '5px' }}
                    >
                        {category.categoriesName}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Category;