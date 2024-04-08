import { Drawer } from '@mui/material';
import React, { forwardRef } from 'react';

export type Props = {
    open: boolean;
    anchor: 'left' | 'right';
    minWidth?: string;
    children?: React.ReactNode;
    variant?: 'persistent' | 'temporary';
};

const Sidebar = forwardRef<HTMLDivElement, Props>(function Sidebar({ open, children, anchor, minWidth = '0px', variant = 'persistent' }: Props, ref) {
    return (
        <Drawer
            ref={ref}
            sx={{
                flexShrink: 0,
            }}
            PaperProps={{
                style: {
                    minWidth,
                },
            }}
            variant={variant}
            anchor={anchor}
            open={open}
        >
            {children}
        </Drawer>
    );
});

export default Sidebar;
