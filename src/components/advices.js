import React from "react";
import "./css/advices.css";
import NavBar from "./Navbar";
import { FaLeaf, FaUtensils, FaShieldAlt, FaPlus, FaYoutube } from "react-icons/fa";

const Advices = () => {
  return (
    <div className="page-container">
      <NavBar />
      <div className="advices">
        <div className="advices__inner">
          <div className="advices-header">
            <h1 className="advices-main-title">Food Preservation & Safety Guide</h1>
            <p className="advices-subtitle">Expert tips to reduce waste and enjoy food safely</p>
          </div>
          
          <div className="advice-card">
            <div className="card-header">
              <FaLeaf className="card-icon" />
              <h2 className="advices__title">General Preservation Tips</h2>
            </div>
            <div className="card-content">
              <div className="tip-grid">
                <div className="tip-item">
                  <div className="tip-badge">1</div>
                  <div>
                    <h3>Freeze Them</h3>
                    <p>Many food items can be frozen to extend their shelf life</p>
                    <ul>
                      <li>Bread can be sliced and frozen for easy use later</li>
                      <li>Meat can be portioned and frozen for future meals</li>
                    </ul>
                  </div>
                </div>
                
                <div className="tip-item">
                  <div className="tip-badge">2</div>
                  <div>
                    <h3>Cook and Store</h3>
                    <p>Prepare food for easy meal prep</p>
                    <ul>
                      <li>Cooked meats can be frozen in portions</li>
                      <li>Grains like rice or quinoa can be stored for quick meals</li>
                    </ul>
                  </div>
                </div>
                
                <div className="tip-item">
                  <div className="tip-badge">3</div>
                  <div>
                    <h3>Check for Quality</h3>
                    <p>Always inspect food before consumption</p>
                    <ul>
                      <li>Look for off smells or discoloration</li>
                      <li>Check for mold even if close to expiration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="advice-card">
            <div className="card-header">
              <FaUtensils className="card-icon" />
              <h2 className="advices__title">Specific Food Handling</h2>
            </div>
            <div className="card-content">
              <div className="food-grid">
                <div className="food-item">
                  <div className="food-icon dairy">D</div>
                  <h3>Dairy Products</h3>
                  <p>Use milk in smoothies, baking, or for making homemade yogurt</p>
                  <div className="recipe-tip">
                    <strong>Recipe:</strong> Blend yogurt, milk, and fruits for a quick breakfast smoothie
                  </div>
                </div>
                
                <div className="food-item">
                  <div className="food-icon bread">B</div>
                  <h3>Bread</h3>
                  <p>Make breadcrumbs, croutons, or freeze for later use</p>
                  <div className="recipe-tip">
                    <strong>Recipe:</strong> Blend stale bread for coating meats or topping casseroles
                  </div>
                </div>
                
                <div className="food-item">
                  <div className="food-icon vegetable">V</div>
                  <h3>Vegetables</h3>
                  <p>Use in soups, stews, or stir-fries. Blanch and freeze them</p>
                  <div className="recipe-tip">
                    <strong>Recipe:</strong> Sauté mixed vegetables with soy sauce for stir-fry
                  </div>
                </div>
                
                <div className="food-item">
                  <div className="food-icon fruit">F</div>
                  <h3>Fruits</h3>
                  <p>Make smoothies, fruit salads, or bake into desserts</p>
                  <div className="recipe-tip">
                    <strong>Recipe:</strong> Mash overripe bananas for banana bread
                  </div>
                </div>
                
                <div className="food-item">
                  <div className="food-icon meat">M</div>
                  <h3>Meat & Fish</h3>
                  <p>Cook and freeze in portions for future meals</p>
                  <div className="recipe-tip">
                    <strong>Recipe:</strong> Combine cooked chicken with veggies for casserole
                  </div>
                </div>
                
                <div className="food-item">
                  <div className="food-icon can">C</div>
                  <h3>Canned Goods</h3>
                  <p>Incorporate into chili, soups, or casseroles</p>
                  <div className="recipe-tip">
                    <strong>Recipe:</strong> Mix canned beans and tomatoes for quick chili
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="advice-card">
            <div className="card-header">
              <FaShieldAlt className="card-icon" />
              <h2 className="advices__title">Food Safety Essentials</h2>
            </div>
            <div className="card-content">
              <div className="safety-grid">
                <div className="safety-item">
                  <div className="safety-number">!</div>
                  <h3>Follow Storage Instructions</h3>
                  <p>Always store food according to packaging to maintain quality and safety</p>
                </div>
                
                <div className="safety-item critical">
                  <div className="safety-number">!</div>
                  <h3>Respect Use-By Dates</h3>
                  <p>Never consume food past its use-by date as it could be unsafe</p>
                </div>
                
                <div className="safety-item">
                  <div className="safety-number">!</div>
                  <h3>Understand Best Before Dates</h3>
                  <p>Foods are usually safe after this date but may not be at peak quality</p>
                </div>
                
                <div className="safety-item">
                  <div className="safety-number">!</div>
                  <h3>Thaw Properly</h3>
                  <p>Thaw frozen food in the refrigerator to prevent bacterial growth</p>
                </div>
                
                <div className="safety-item">
                  <div className="safety-number">!</div>
                  <h3>Store Leftovers Correctly</h3>
                  <p>Use airtight containers and consume within a few days</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="advice-card">
            <div className="card-header">
              <FaPlus className="card-icon" />
              <h2 className="advices__title">Additional Food Preservation</h2>
            </div>
            <div className="card-content">
              <div className="additional-tips">
                <div className="additional-item">
                  <h3>Grains (Rice & Pasta)</h3>
                  <p>Store uncooked grains in a cool, dry place. Cooked grains can be refrigerated or frozen.</p>
                  <div className="tip-highlight">
                    <strong>Pro Tip:</strong> Cook extra rice or pasta and freeze in portions for easy meals
                  </div>
                </div>
                
                <div className="additional-item">
                  <h3>Herbs & Spices</h3>
                  <p>Fresh herbs can be used immediately, while dried herbs should be stored in a cool, dark place.</p>
                  <div className="tip-highlight">
                    <strong>Pro Tip:</strong> Freeze herbs in ice cube trays with olive oil for easy flavoring
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="resources-section">
            <div className="resources-header">
              <FaYoutube className="youtube-icon" />
              <h2>Helpful Video Resources</h2>
            </div>
            <div className="video-links">
              <div className="video-category">
                <h3>Food Preservation Techniques</h3>
                <div className="video-link">
                  <FaYoutube className="link-icon" />
                  <a href="https://www.youtube.com/watch?v=3K0b8V8W6T0" target="_blank" rel="noopener noreferrer">
                    Food Preservation Basics
                  </a>
                </div>
                <div className="video-link">
                  <FaYoutube className="link-icon" />
                  <a href="https://www.youtube.com/watch?v=6U3h8HjTgE4" target="_blank" rel="noopener noreferrer">
                    How to Freeze Food Properly
                  </a>
                </div>
              </div>
              
              <div className="video-category">
                <h3>Cooking Tips & Meal Prep</h3>
                <div className="video-link">
                  <FaYoutube className="link-icon" />
                  <a href="https://www.youtube.com/watch?v=3m2v2v8B2H4" target="_blank" rel="noopener noreferrer">
                    Meal Prep for Beginners
                  </a>
                </div>
                <div className="video-link">
                  <FaYoutube className="link-icon" />
                  <a href="https://www.youtube.com/watch?v=4kWQ9f8d4qU" target="_blank" rel="noopener noreferrer">
                    Easy Cooking Tips for Beginners
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advices;