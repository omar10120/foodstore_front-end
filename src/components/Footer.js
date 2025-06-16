import './css/Footer.css'
function Footer() {
    return (
        <footer className="footer">
            <div className='footer-container'>
                <p>&copy; 2024 Naema. All rights reserved.</p>
                <ul className='list-unstyled'>
                    <li><a href="/contact" style={footerLinkStyle}>Contact Us</a></li>
                    <li><a href="/privacy" style={footerLinkStyle}>Privacy Policy</a></li>
                    <li><a href="/terms" style={footerLinkStyle}>Terms and Conditions</a></li>
                </ul>
            </div>
        </footer>
    );

}
const footerLinkItemStyle = {
    display: 'inline',
    margin: '0 15px',
};

const footerLinkStyle = {
    color: 'white',
    textDecoration: 'none',
};
export default Footer