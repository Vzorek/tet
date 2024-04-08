import React from 'react';
import { useTheme, Box } from '@mui/material';

export type Props = {
    width: {
        left: number;
        right: number;
    };
    children?: React.ReactNode;
};

const Main: React.FC<Props> = ({ width, children }) => {
    const theme = useTheme();

    return (
        <Box component="main" style={{
            flexGrow: 1,
            marginTop: '4em',
            height: 'calc(99vh - 4em)',
            position: 'relative',
            overflow: 'hidden',
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: width.left,
            marginRight: width.right,
            ...(width.left || width.right) && {
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        }}>
            {children}
        </Box>
    );
};

export default Main;
