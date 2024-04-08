import React from 'react';

type BackgroundProperties = {
    gridSize: number;
};

const Background: React.FC<BackgroundProperties> = ({ gridSize }) => {
    return (
        <>
            <defs>
                <pattern id="dotPattern" x='0' y='0' width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                    <circle cx={gridSize/2} cy={gridSize/2} r="1.5" fill="rgb(200, 200, 200)" />
                </pattern>
            </defs>
            <rect x='0' y='0' width='100%' height='100%' fill="url(#dotPattern)" />
        </>
    );
};

export default Background;
