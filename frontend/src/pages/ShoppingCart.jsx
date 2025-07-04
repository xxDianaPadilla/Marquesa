// frontend/src/pages/ShoppingCart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import "../styles/ShoppingCart.css"; // Importar estilos específicos del carrito

// Imágenes de ejemplo (usando las mismas del proyecto)
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

const ShoppingCart = () => {
    const navigate = useNavigate();

    const handlePaymentProcessClick = (e) => {
        e.preventDefault();
        navigate('/paymentProcess');
    };

    // Estado del carrito
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Ramo de flores secas lavanda",
            description: "Arreglos con flores secas",
            price: 10.00,
            quantity: 1,
            image: Flower1
        },
        {
            id: 2,
            name: "Cuadro sencillo de hogar",
            description: "Cuadros decorativos",
            price: 34.00,
            quantity: 1,
            image: Flower2
        },
        {
            id: 3,
            name: "Ramo de rosas frescas",
            description: "Arreglos con flores naturales",
            price: 23.00,
            quantity: 1,
            image: Flower3
        }
    ]);

    // Calcular subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Función para actualizar cantidad de un producto
    const handleUpdateQuantity = (itemId, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Función para eliminar un producto del carrito
    const handleRemoveItem = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    // Función para aplicar descuento
    const handleApplyDiscount = (code, amount) => {
        console.log(`Descuento aplicado: ${code} - Monto: ${amount}$`);
    };

    // Función para continuar comprando
    const handleContinueShopping = () => {
        navigate('/');
    };

    // Componente para carrito vacío
    const EmptyCart = () => (
        <div className="empty-cart">
            <div className="mb-6">
                <svg
                    className="w-20 h-20 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6m-2 0V9a3 3 0 00-3-3H9a3 3 0 00-3 3v4"
                    />
                </svg>
            </div>
            <h3>Tu carrito está vacío</h3>
            <p>Agrega algunos productos para comenzar</p>
            <button
                className="pay-btn"
                onClick={handleContinueShopping}
                style={{ maxWidth: '300px', margin: '0 auto' }}
            >
                Explorar productos
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white-50">
            <Header />
            <br />
            <br />

            <div className="text-center mb-8">
                <h1
                    className="text-3xl font-bold text-gray-800 mb-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Mi carrito
                </h1>
            </div>

            <div className="shopping-cart-container">
                {cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>
                        <section
                            className="cart-items-section"
                            aria-label="Lista de productos en el carrito"
                        >
                            {cartItems.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                />
                            ))}
                        </section>

                        <OrderSummary
                            subtotal={subtotal}
                            shipping={10.00}
                            onApplyDiscount={handleApplyDiscount}
                            onProceedToPay={handlePaymentProcessClick}
                            onContinueShopping={handleContinueShopping}
                        />
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ShoppingCart;