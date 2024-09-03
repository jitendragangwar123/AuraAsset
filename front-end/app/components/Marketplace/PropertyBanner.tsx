'use client';
import React from 'react';

type TokenizationBannerProps = {
    backgroundImage: string;
    heading: string;
    subheading: string;
};

const TokenizationBanner: React.FC<TokenizationBannerProps> = ({ backgroundImage, heading, subheading }) => {
    return (
        <div
            className="relative h-96 bg-cover bg-center mt-14"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div className="relative z-0 max-w-3xl">
                    <h1 className="text-4xl font-extrabold mb-6 leading-tight text-gradient">
                        {heading}
                    </h1>
                    <p className="text-2xl font-light sm:text-3xl text-gray-200">
                        {subheading}
                    </p>
                </div>
            </div>
        </div>
    );
};

const PropertyBanner: React.FC = () => {
    return (
        <div>
            <TokenizationBanner
                backgroundImage="/img2.jpg"
                heading="Tokenizing Real Estate Assets"
                subheading="Unlocking liquidity and new investment opportunities in Real Estate"
            />
        </div>
    );
};

export default PropertyBanner;
