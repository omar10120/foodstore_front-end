import React from "react";
import "./App.css";
import BarSide from "./components/BarSide";
import Home from "./components/Home";
import NavBar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Footer from "./components/Footer";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AboutUs from "./components/AboutUs";
import Products from "./components/Products";
import ListProducts from "./components/ListProducts";
import DetailsProduct from "./components/DetailsProduct";
import Welcome from "./components/Weclome";
import Profile from "./components/Profile";
import ProductSellers from "./components/Seller/ProductsSeller";
import AddProducts from "./components/Seller/AddProducts";
import EditProduct from "./components/Seller/EditProduct";
import ViewProduct from "./components/Seller/ViewProduct";
import Charity from "./components/Charity";
import { useSelector } from "react-redux";
import Orders from "./components/Seller/Orders";
import AddProToOrder from "./components/Seller/AddProToOrder";
import BillsSeller from "./components/Seller/BillsSeller";
import ViewBillsBuyer from "./components/ViewBillsBuyer";
import BillsBuyer from "./components/BillsBuyer";
import ViewBillsSeller from "./components/Seller/ViewBillsSeller";
import Cart from "./components/Seller/Cart";
import Message from "./components/Seller/Message";
import Discounts from "./components/Discounts";
import ProfileSeller from "./components/ProfileSeller";
import Catogery from "./components/Catogery";
import CartButton from "./components/CartButton";
import Complaint from "./components/Complaints";
import Advices from "./components/advices";
import Checkout from "./components/Checkout";
import Subscribe from "./components/Seller/Subscribe";
import DashboardAdmin from "./components/DashboardAdmin";

function App() {
  const location = useLocation();
  const roleName = useSelector((state) => state.auth.roleName);
  const showBarSidePaths = ["/"];
  const showNavbar = !["/login", "/register", "/weclome"].includes(
    location.pathname
  );
  console.log("Current Path:", location.pathname);
  console.log("Show Navbar:", showNavbar);
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/weclome" element={<Welcome />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/advices" element={<Advices />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/subscribe" element={<Subscribe />} />
        
        <Route
          path="/*"
          element={
            <>
              {showNavbar && <NavBar />}
              <div className="d-flex">
                {showBarSidePaths.includes(location.pathname) && (
                  <div className="col-2">
                    <BarSide />
                  </div>
                )}
                <div
                  className={`col-${
                    showBarSidePaths.includes(location.pathname) ? "10" : "12"
                  }`}
                >
                  <div
                    className={`content ${
                      showBarSidePaths.includes(location.pathname)
                        ? "with-sidebar"
                        : "full-width"
                    }`}
                  >
                    <Routes>
                      {(roleName === "seller" ) && (
                        <>
                          <Route path="/dashboard" element={<Dashboard />} />
                        </>
                      )}

                      {(roleName === "admin" ) && (
                        <>
                          <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
                        </>
                      )}
                      

                      {roleName === "buyer" && (
                        <>
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/home" element={<Home />} />
                        </>
                      )}
                   
                      <Route path="/products" element={<Products />} />
                      <Route path="/advices" element={<Advices />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/login" element={<Login />} />
                    
                      

                      <Route
                        path="/AddProToOrder"
                        element={<AddProToOrder />}
                      />
                      <Route path="/catogery" element={<Catogery />} />
                      <Route path="/listproducts" element={<ListProducts />} />
                      <Route
                        path="/detailsproducts/:productId"
                        element={<DetailsProduct />}
                      />
                      <Route path="/about" element={<AboutUs />} />
                      <Route
                        path="/ProductSellers"
                        element={<ProductSellers />}
                      />
                      <Route path="/AddProduct" element={<AddProducts />} />
                      <Route
                        path="/EditProduct/:productId"
                        element={<EditProduct />}
                      />
                      <Route
                        path="/viewProduct/:productId"
                        element={<ViewProduct />}
                      />
                      <Route path="/BillsSeller" element={<BillsSeller />} />
                      <Route
                        path="/ViewBillsSeller/:bId"
                        element={<ViewBillsSeller />}
                      />
                      <Route path="/BillsBuyer" element={<BillsBuyer />} />
                      <Route
                        path="/ViewBillsBuyer/:billId"
                        element={<ViewBillsBuyer />}
                      />
                      <Route path="/D/:DId" element={<DetailsProduct />} />
                      
                      <Route path="/profile" element={<Profile />} />
                      
                      <Route
                        path="/profileSeller"
                        element={<ProfileSeller />}
                      />
                      <Route path="/charity" element={<Charity />} />
                      <Route path="/complaint" element={<Complaint />} />
                      <Route path="/Discounts" element={<Discounts />} />
                      <Route path="/CartButton" element={<CartButton />} />
                      <Route path="/CartButton" element={<Checkout/>} />
                      <Route path="/subscribe" element={<Subscribe />} />
                    
                    </Routes>
                  </div>
                </div>
              </div>
            </>
          }
        />
      </Routes>
      <Footer />
      
    </div>
  );
}

export default App;
