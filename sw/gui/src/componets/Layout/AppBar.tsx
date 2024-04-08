import { useTheme, AppBar as MuiAppBar, IconButton, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';

export type Props = {
    left?: {
        width: number;
        setOpen: (open: boolean) => void;
    };
    right?: {
        width: number;
        setOpen: (open: boolean) => void;
    };
    children?: React.ReactNode;
};

const AppBar: React.FC<Props> = ({ left, right, children }) => {
    const theme = useTheme();
    const widthReduction = (left ? left.width : 0) + (right ? right.width : 0);

    const appBarStyle = {
        ...({
            width: `calc(100% - ${widthReduction}px)`,
            marginLeft: left?.width ? left.width : 0,
            marginRight: right?.width ? right.width : 0,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
    };

    return (
        <MuiAppBar style={appBarStyle}>
            <Toolbar>
                {left && <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={() => { left?.setOpen(!left.width); }}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>}
                {children}
                <div style={{ flexGrow: 1 }}></div> {/* Spacer */}
                {right && <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={() => { right?.setOpen(!right.width); }}
                    edge="end"
                    sx={{ ml: 2, justifySelf: 'flex-end' }}
                >
                    <MenuIcon />
                </IconButton>
                }
            </Toolbar>
        </MuiAppBar>
    );
};

export default AppBar;
