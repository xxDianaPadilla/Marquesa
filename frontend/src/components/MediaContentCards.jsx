import React from "react";
import playIcon from "../assets/playIcon.png";
import likeIcon from "../assets/likeIcon.png";
import calendarIcon from "../assets/calendar.png";

const MediaContentCards = ({ mediaItems }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
            {mediaItems.map((item, index) => (
                <div style={{cursor: 'pointer'}} key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Image Container */}
                    <div className="relative">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                        />
                        {/* Play/Book Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full p-4 shadow-lg" style={{cursor: 'pointer'}}>
                                <img
                                    src={playIcon}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Date */}
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                            <img src={calendarIcon} alt="Calendar" className="w-4 h-4 mr-2" />
                            <span>Fecha de publicación: {item.date}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-gray-800 font-medium text-lg mb-4 line-clamp-2">
                            {item.title}
                        </h3>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <button style={{cursor: 'pointer'}} className="bg-pink-200 text-pink-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-300 transition-colors">
                                {item.type === 'video' ? 'Ver Video' : 'Ver Contenido'}
                            </button>

                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" style={{cursor: 'pointer'}}>
                                <img src={likeIcon} alt="Like" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MediaContentCards;