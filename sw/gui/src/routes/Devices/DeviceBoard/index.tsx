import React, { MouseEventHandler, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, ButtonGroup, IconButton, Paper } from '@mui/material';
import { Add, Home, Remove } from '@mui/icons-material';

import Background from './Background';
import { State } from '../../../features/store';
import Device from './Device';

type DeviceBoardProperties = Record<string, never>;

const BASE_GRID_SIZE = 20;
const DEFAULT_SCALE = 1.8;

const DeviceBoard: React.FC<DeviceBoardProperties> = ({ }) => {
    const [scale, setScale] = useState(DEFAULT_SCALE);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPosition = useRef({ x: 0, y: 0 });
    const scrollStartPosition = useRef({ x: 0, y: 0 });
    const scrollBoxRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleMouseDown: MouseEventHandler = e => {
        if (!scrollBoxRef.current)
            return;
        setIsDragging(true);
        dragStartPosition.current = { x: e.pageX, y: e.pageY };
        scrollStartPosition.current = {
            x: scrollBoxRef.current.scrollLeft,
            y: scrollBoxRef.current.scrollTop,
        };
    };

    const handleMouseMove: MouseEventHandler = e => {
        e.preventDefault();

        if (!scrollBoxRef.current)
            return;
        if (!isDragging)
            return;
        const deltaX = e.pageX - dragStartPosition.current.x;
        const deltaY = e.pageY - dragStartPosition.current.y;
        scrollBoxRef.current.scrollLeft = scrollStartPosition.current.x - deltaX;
        scrollBoxRef.current.scrollTop = scrollStartPosition.current.y - deltaY;
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const zoomIn = () => {
        setScale(scale * 1.1);
    };

    const zoomOut = () => {
        setScale(Math.max(scale * 0.9, 1.001));
    };

    const resetZoom = () => {
        setScale(DEFAULT_SCALE);
    };

    const { devices } = useSelector((state: State) => state.devices);
    const handleEvent = (event: unknown) => {
        console.log(`Device: Event: ${event}`);
    };

    return (
        <>
            <Paper
                style={{
                    position: 'absolute',
                    top: '2em',
                    right: '1vw',
                    zIndex: 10,
                }}
            >
                <ButtonGroup orientation='vertical'>
                    <IconButton onClick={zoomIn}>
                        <Add />
                    </IconButton>
                    <IconButton onClick={resetZoom}>
                        <Home />
                    </IconButton>
                    <IconButton onClick={zoomOut}>
                        <Remove />
                    </IconButton>
                </ButtonGroup>
            </Paper>
            <Box
                ref={scrollBoxRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                }}
            >
                <svg
                    width={`${scale * 100}%`}
                    height={`${scale * 100}%`}
                    overflow='auto'
                >
                    <Background gridSize={BASE_GRID_SIZE * scale} />
                    <g>
                        {Object.entries(devices)
                            .map(([, device]) => {
                                return (
                                    <Device
                                        key={device.id}
                                        {...device}
                                        scale={scale}
                                        handleEvent={handleEvent}
                                    />
                                );
                            })
                        }
                    </g>
                </svg>
            </Box>
        </>
    );
};

export default DeviceBoard;
