import React from 'react';

export const EscolaLogo = ({ className }) => (
    <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
        </defs>
        <text x="100" y="30" textAnchor="middle" fill="#1e3a8a" fontSize="22" fontWeight="900" fontFamily="sans-serif">EEFM</text>
        <path d="M 40 160 Q 10 100 45 40" fill="none" stroke="#166534" strokeWidth="4" />
        <path d="M 40 160 Q 20 130 15 110 Q 30 110 42 125" fill="#166534" />
        <path d="M 45 125 Q 20 90 25 70 Q 40 80 47 100" fill="#166534" />
        <path d="M 47 95 Q 30 60 40 40 Q 55 55 50 75" fill="#166534" />
        <path d="M 160 160 Q 190 100 155 40" fill="none" stroke="#166534" strokeWidth="4" />
        <path d="M 160 160 Q 180 130 185 110 Q 170 110 158 125" fill="#166534" />
        <path d="M 155 125 Q 180 90 175 70 Q 160 80 153 100" fill="#166534" />
        <path d="M 153 95 Q 170 60 160 40 Q 145 55 150 75" fill="#166534" />
        <path d="M 50 45 L 150 45 L 150 130 Q 150 190 100 210 Q 50 190 50 130 Z" fill="url(#shieldGrad)" />
        <path d="M 50 140 L 150 45 L 150 130 Q 150 190 100 210 Q 50 190 50 130 Z" fill="#ffffff" />
        <path d="M 50 45 L 150 45 L 150 130 Q 150 190 100 210 Q 50 190 50 130 Z" fill="none" stroke="#1e3a8a" strokeWidth="4" />
        <text x="75" y="110" textAnchor="middle" fill="#ffffff" fontSize="55" fontWeight="bold" fontStyle="italic" fontFamily="serif">A</text>
        <text x="125" y="160" textAnchor="middle" fill="#1e3a8a" fontSize="55" fontWeight="bold" fontStyle="italic" fontFamily="serif">T</text>
        <path d="M 20 180 Q 100 215 180 180 L 185 200 Q 100 240 15 200 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
        <text x="100" y="212" textAnchor="middle" fill="#1e3a8a" fontSize="14" fontWeight="900" fontFamily="sans-serif">ANÍSIO TEIXEIRA</text>
        <text x="100" y="235" textAnchor="middle" fill="#1e3a8a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">DESDE 1954</text>
    </svg>
);
