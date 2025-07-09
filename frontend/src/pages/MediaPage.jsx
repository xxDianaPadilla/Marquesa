import React, { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import MediaContentCards from "../components/MediaContentCards";
import flower1 from "../assets/savesFlower1.png";
import flower2 from "../assets/savesFlower2.png";
import flower3 from "../assets/savesFlower3.png";
import flower from "../assets/savesFlower1.png";

const MediaPage = () => {
    const [mediaItems] = useState([
        {
            id: 1,
            title: "Técnicas de relajación y mindfulness a base de flores",
            date: "07/09/2025",
            type: "Blog",
            image: flower1,
        },
        {
            id: 2,
            title: "Guía completa: Como preparar un jardín de flores",
            date: "05/09/2025",
            type: "Tips",
            image: flower2,
        },
        {
            id: 3,
            title: "Ejercicios para cuidar de tus ramos de flores",
            date: "03/09/2025",
            type: "Datos curiosos",
            image: flower3,
        },
        {
            id: 4,
            title: "¿Qué comen las plantas?",
            date: "01/09/2025",
            type: "Datos curiosos",
            image: flower1,
        },
        {
            id: 5,
            title: "Meditando con flores",
            date: "30/08/2025",
            type: "Blog",
            image: flower2,
        },
        {
            id: 6,
            title: "Preparación con flores para bodas",
            date: "28/09/2025",
            type: "Blog",
            image: flower3,
        }
    ])
    return (
        <>
            <Header />

            <main className="min-h-screen bg-white-50">

                {/* Page Header */}
                <section className="relative pt-20 pb-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Media y Contenido
                            </h1>
                            <br />
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Descubre videos, guías y recursos diseñados especialmente para acompañarte en tu hermoso camino hacia la maternidad.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filter Section */}
                <section className="py-8">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <button style={{backgroundColor: '#F2C6C2', cursor: 'pointer'}} className="text-white px-6 py-3 rounded-full font-medium hover:bg-pink-600 transition-colors">
                                Todos
                            </button>
                            <button style={{cursor: 'pointer'}} className="bg-white text-pink-500 border border-pink-500 px-6 py-3 rounded-full font-medium hover:bg-pink-50 transition-colors">
                                Blogs
                            </button>
                            <button style={{cursor: 'pointer'}} className="bg-white text-pink-500 border border-pink-500 px-6 py-3 rounded-full font-medium hover:bg-pink-50 transition-colors">
                                Tips
                            </button>
                            <button style={{cursor: 'pointer'}} className="bg-white text-pink-500 border border-pink-500 px-6 py-3 rounded-full font-medium hover:bg-pink-50 transition-colors">
                                Datos curiosos
                            </button>
                        </div>
                    </div>
                </section>

                {/* Media Cards Grid */}
                <section className="py-8">
                    <div className="container mx-auto">
                        <MediaContentCards mediaItems={mediaItems} />
                    </div>
                </section>

                {/* Load More Button */}
                <section className="py-12 text-center">
                    <button style={{cursor: 'pointer', backgroundColor: '#F2C6C2'}} className="text-white px-8 py-3 rounded-full font-medium hover:bg-pink-600 transition-colors">
                        Cargar más contenido
                    </button>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default MediaPage;