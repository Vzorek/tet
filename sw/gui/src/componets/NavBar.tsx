import React from 'react';

import Button from '@mui/material/Button';
import { Container } from '@mui/material';
import { Download } from '@mui/icons-material';
import { useDispatch } from 'react-redux';

// Define the props for NavBar component
interface NavBarProps {
}

const NavBar: React.FC<NavBarProps> = () => {
    const dispatch = useDispatch();
    const handleDownload = () => {
        dispatch({
            type: 'client/sendCommand',
            payload: {
                targetId: '__server__',
                command: 'dumpGame',
                data: null,
            },
        });
    };

    return (
        <Container style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
        }}>

            <Button
                variant='contained'
                color='secondary'
                onClick={handleDownload}
                startIcon={<Download />}>
                Download game data
            </Button>

        </Container>
    );
};

export default NavBar;
