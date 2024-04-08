import { FC, useState, ReactNode, useEffect, useRef } from 'react';
import { Drawer, Paper } from '@mui/material';
import { ArrowLeft, ArrowRight, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import shadows from '@mui/material/styles/shadows';

type Side = 'left' | 'right' | 'top' | 'bottom';

const inverseSide = {
    left: 'right' as Side,
    right: 'left' as Side,
    top: 'bottom' as Side,
    bottom: 'top' as Side,
};

const secondAxis = {
    left: 'top' as Side,
    right: 'top' as Side,
    top: 'left' as Side,
    bottom: 'left' as Side,
};

type ArrowProps = {
    side: Side;
    sidebarOpen: boolean;
    onClick: () => void;
    width: string;
};

const Arrow: FC<ArrowProps> = ({ side, sidebarOpen, onClick, width }) => {
    const positionStyle = {
        position: 'absolute' as const,
        [side]: sidebarOpen ? width : 0,
        [secondAxis[side]]: '15vh',
        zIndex: 1000,
        minWidth: '1vw',
        shadows: shadows[4],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    };

    const ArrowIcon = {
        right: ArrowLeft,
        left: ArrowRight,
        bottom: ArrowUpward,
        top: ArrowDownward,
    }[sidebarOpen ? inverseSide[side] : side];

    return (
        <Paper style={positionStyle} onClick={onClick}>
            <ArrowIcon style={{ fontSize: '2em' }} />
        </Paper>
    );
};

const SIDEBAR_WIDTH = '15vw';

interface SidebarProps {
    side: Side;
    children?: ReactNode;
    minWidth?: string;
    defaultOpen?: boolean;
}

const Sidebar: FC<SidebarProps> = ({ side, children, minWidth, defaultOpen }) => {
    const [open, setOpen] = useState(defaultOpen || false);
    const [sidebarWidth, setSidebarWidth] = useState(minWidth || SIDEBAR_WIDTH);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const toggle = () => setOpen(!open);

    useEffect(() => {
        if (sidebarRef.current) {
            setSidebarWidth(`${(sidebarRef.current.children[0]! as HTMLDivElement).offsetWidth}px`);
        }
    }, [open, sidebarRef]);

    return (
        <>
            <Arrow side={side} sidebarOpen={open} onClick={toggle} width={sidebarWidth} />
            <Drawer ref={sidebarRef} variant="persistent" anchor={side} open={open} PaperProps={{
                style: {
                    minWidth: minWidth || SIDEBAR_WIDTH,
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'flex-start',
                },
                elevation: 0,
            }}>
                {children}
            </Drawer>
        </>
    );
};

export default Sidebar;
