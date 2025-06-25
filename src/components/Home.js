import React, { useState, useEffect } from "react";
import "./css/Home.css";
import ListProducts from "./ListProducts";

function Home() {
  const carouselItems = [
    {
      src: process.env.PUBLIC_URL + "/images/OIP (2).jfif",
      label: "Welcome to Our Store",
      text: "Discover amazing deals on overstocked products and save money!",
    },
    {
      src: process.env.PUBLIC_URL + "/images/Inventory-Management-System-Pic.jpg",
      label: "Fresh Products Every Day",
      text: "Shop our latest arrivals and enjoy fresh products delivered to your door.",
    },
    {
      src: process.env.PUBLIC_URL + "/images/OIP (3).jfif",
      label: "Exclusive Offers",
      text: "Sign up for our newsletter and get exclusive discounts and offers.",
    },
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const merchantReviews = [
    {
      name: "Merchant 1",
      img: process.env.PUBLIC_URL + "/images/OIP (4).jfif",
      review: "Using this app to sell overstocked products has been a game changer for my business.",
    },
    {
      name: "Merchant 2",
      img: process.env.PUBLIC_URL + "/images/businessman-portrait.png",
      review: "This application has streamlined my inventory management.",
    },
    {
      name: "Merchant 3",
      img: process.env.PUBLIC_URL + "/images/OIP (5).jfif",
      review: "As a merchant, I appreciate how this app helps me clear out products nearing expiration.",
    },
  ];

  const features = [
    {
      title: "Inventory Management",
      description: "Our application provides real-time inventory tracking, ensuring you never run out of stock.",
      imgSrc: process.env.PUBLIC_URL + "/images/Inventory-Management-System-Pic.jpg",
    },
    {
      title: "Sales Optimization",
      description: "Utilize our analytics tools to identify best-selling products and optimize your sales strategies.",
      imgSrc: process.env.PUBLIC_URL + "/images/OIP (6).jfif",
    },
    {
      title: "Customer Engagement",
      description: "Engage your customers with personalized offers and notifications about their favorite products.",
      imgSrc: process.env.PUBLIC_URL + "/images/OIP (7).jfif",
    },
  ];

  return (
    <div className="home-container">
           <section className="brand-showcase">
              <div className="brand-content">
                <div className="logo-container">
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/Naema Logo-04.png`} 
                    alt="Naema Logo" 
                    className="brand-logo"
                  />
                </div>
                <div className="brand-text">
                  <h1 className="brand-title">نعمة</h1>
                  <p className="brand-tagline">Redefining Quality and Savings</p>
                </div>
              </div>
            </section>
      {/* Hero Carousel */}
      <div className="modern-carousel">
        {carouselItems.map((slide, index) => (
          <div
            className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            key={index}
          >
            <div 
              className="carousel-image" 
              style={{ backgroundImage: `url('${slide.src}')` }}
            />
            <div className="carousel-content">
              <h2>{slide.label}</h2>
              <p>{slide.text}</p>
              <button className="carousel-btn linkhref" ><a href="#products" >Shop Now</a></button>
            </div>
          </div>
        ))}

        <div className="carousel-dots">
          {carouselItems.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        <button
          className="carousel-arrow left"
          onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : carouselItems.length - 1))}
        >
          &lt;
        </button>
        <button
          className="carousel-arrow right"
          onClick={() => setCurrentSlide((prev) => (prev < carouselItems.length - 1 ? prev + 1 : 0))}
        >
          &gt;
        </button>
      </div>
      
      {/* Search Section */}
      <div className="modern-search-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search products..."
            className="modern-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn-home">
            <i className="search-icon-home" >🔍</i>
          </button>
        </div>
      </div>
      
      {/* Product List Section */}
      <section className="products-section" id="products">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Browse our collection of quality goods</p>
        </div>
        <ListProducts searchQuery={searchQuery} />
      </section>
      
      {/* Merchant Reviews */}
      <section className="merchant-section">
        <div className="section-header">
          <h2 className="section-title">What Our Merchants Say</h2>
          <p className="section-subtitle">Hear from sellers using our platform</p>
        </div>
        <div className="merchant-grid">
          {merchantReviews.map((merchant, index) => (
            <div className="merchant-card" key={index}>
              <div 
                className="merchant-avatar" 
                style={{ backgroundImage: `url('${merchant.img}')` }}
              ></div>
              <div className="merchant-info">
                <h3>{merchant.name}</h3>
                <p className="merchant-review">"{merchant.review}"</p>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Our platform offers powerful features for buyers and sellers</p>
        </div>
        {features.map((feature, index) => (
          <div className={`feature-card ${index % 2 === 0 ? "" : "reverse"}`} key={index}>
            <div className="feature-text">
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
              <button className="primary-btn">Learn More</button>
            </div>
            <div className="feature-image">
              <img
                src={feature.imgSrc}
                alt={feature.title}
              />
            </div>
          </div>
        ))}
      </section>
      
      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive deals and updates</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;