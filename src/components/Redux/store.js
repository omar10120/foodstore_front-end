import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slices/AuthSlice"; 
import  charityReducer  from "./Slices/CharitySlice";
import  cartReducer  from "./Slices/CartSlice";
import  productReducer  from "./Slices/ProductSlice";
import  catogeryReducer from "./Slices/CatogerySlice";


export const store=configureStore({
    reducer:{
        auth:authReducer,
        productSlice:productReducer,
        categorySlice:catogeryReducer,
        charitySlice:charityReducer,
        cartSlice:cartReducer
        
    }
})

