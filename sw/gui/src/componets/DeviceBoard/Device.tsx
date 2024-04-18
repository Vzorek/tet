import React, { MouseEventHandler, useEffect, useState } from 'react';

import { DeviceState } from '../../features/slices/devices';
import { getDeviceType } from '../../features/client/middleware';
import { useDispatch } from 'react-redux';
import { EventHandler } from '@tet/devices';

type DeviceProperties = DeviceState & {
    scale: number;
};

const Device: React.FC<DeviceProperties> = ({
    id,
    typeTag,
    hidden,
    position,
    state,
    scale,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [originalPosition, setOriginalPosition] = useState({ x: position[0], y: position[1] });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const dispatch = useDispatch();
    const type = getDeviceType(typeTag);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            // Limit the position within bounds
            let newX = Math.min(Math.max(originalPosition.x + dx / scale, 0), 1000);
            let newY = Math.min(Math.max(originalPosition.y + dy / scale, 0), 1000);

            // Update the device position
            // You might want to update this position in your state or context
            dispatch({
                type: 'devices/setDevicePosition',
                payload: {
                    id,
                    position: [newX, newY],
                },
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, originalPosition, scale, position, dispatch, id]);

    const handleEvent: EventHandler<Record<string, unknown>> = (event: string, payload: unknown) => {
        dispatch({
            type: 'client/sendEvent',
            payload: {
                sourceId: id,
                event,
                payload,
            },
        });
    };

    if (hidden)
        return null;

    const avatarSize = 50;
    const padding = 10;
    const width = padding + avatarSize + padding;
    const fontSize = width * 0.1;
    const linePadding = width * 0.01;
    const lineHeight = fontSize + linePadding;
    const textSectionHeight = 3 * lineHeight;
    const height = width + textSectionHeight;
    const textY = width;

    const borderRadius = 5; // Rounded corner radius is 10% of card width
    const avatarX = padding; // X position of the avatar
    const avatarY = 5; // Y position of the avatar

    const handleMouseDown: MouseEventHandler = e => {
        e.stopPropagation();
        setDragStart({ x: e.clientX, y: e.clientY });
        setOriginalPosition({ x: position[0], y: position[1] });
        setIsDragging(true);
    };

    return (
        <g
            transform={`scale(${scale})\ntranslate(${position[0]} ${position[1]})`}
            cursor='auto'
        >
            <rect
                x='0'
                y='0'
                width={width}
                height={height}
                fill='rgb(240,240,240)'
                stroke='rgb(180,180,180)'
                strokeWidth='2'
                rx={borderRadius}
                ry={borderRadius}
                onMouseDown={handleMouseDown}
                cursor={isDragging ? 'grabbing' : 'grab'}
            />

            <foreignObject
                x={avatarX}
                y={avatarY}
                width={avatarSize}
                height={avatarSize}
                overflow="visible"
                onClick={e => { e.stopPropagation(); }}
            >
                <svg width="100%" height="100%">
                    {type.render(state, handleEvent)}
                </svg>
            </foreignObject>

            <text
                x={width / 2}
                y={textY}
                fontSize={fontSize}
                fill='black'
                textAnchor='middle'
            >
                {id}
                <tspan x={width / 2} dy={lineHeight} textAnchor='middle'>{type.tag.split('#')[0]}</tspan>
                <tspan x={width / 2} dy={lineHeight} textAnchor='middle'>{type.tag.split('#')[1]}</tspan>
            </text>
        </g>
    );
};

export default Device;
