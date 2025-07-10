import React from "react";
import MediaContentCards from "./MediaContentCards";

const MediaGrid = ({ mediaItems }) => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {mediaItems.map((item) => (
                    <MediaContentCards key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default MediaGrid;