import React, { useEffect, useRef, useState } from 'react';
import AppBar from './AppBar';
import Main from './Main';
import Sidebar from './Sidebar';

type SidebarProps = {
    defaultOpen?: boolean;
    children?: React.ReactNode;
    variant?: 'persistent' | 'temporary';
    minWidth?: string;
};

export type LayoutProps = {
    children?: React.ReactNode; // Main content
    appBar?: {
        children?: React.ReactNode;
    };
    sideBars?: {
        left?: SidebarProps;
        right?: SidebarProps;
    };
};

const Layout: React.FC<LayoutProps> = ({
    children,
    appBar,
    sideBars,
}) => {
    const { left, right } = sideBars || {};
    const [leftOpen, setLeftOpen] = useState(left?.defaultOpen || false);
    const [rightOpen, setRightOpen] = useState(right?.defaultOpen || false);
    const [leftWidth, setLeftWidth] = useState(0);
    const [rightWidth, setRightWidth] = useState(0);

    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (leftRef.current) {
            setLeftWidth(leftOpen
                ? (leftRef.current.children[0]! as HTMLDivElement).offsetWidth
                : 0);
        }
    }, [leftWidth, leftRef, leftOpen]);

    useEffect(() => {
        if (rightRef.current) {
            setRightWidth(rightOpen
                ? (rightRef.current.children[0]! as HTMLDivElement).offsetWidth
                : 0);
        }
    }, [rightWidth, rightRef, rightOpen]);

    const appBarProps = {
        left: left && {
            width: leftWidth,
            setOpen: setLeftOpen,
        },
        right: right && {
            width: rightWidth,
            setOpen: setRightOpen,
        },
    };

    return (
        <>
            <AppBar {...appBarProps}>
                {appBar?.children}
            </AppBar>
            <Main width={{ left: leftWidth, right: rightWidth }}>
                {children}
            </Main>
            {left && (
                <Sidebar
                    open={leftOpen}
                    anchor="left"
                    ref={leftRef}
                    variant={left.variant}
                    minWidth={left.minWidth}
                >
                    {left.children}
                </Sidebar>
            )}
            {right && (
                <Sidebar
                    open={rightOpen}
                    anchor="right"
                    ref={rightRef}
                    variant={right.variant}
                    minWidth={right.minWidth}
                >
                    {right.children}
                </Sidebar>
            )}
        </>
    );
};

export default Layout;
