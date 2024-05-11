import React from 'react';

import Button from '@mui/material/Button';
import { Container } from '@mui/material';
import { Download } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getPersistent } from '../features/store';

// Define the props for NavBar component
interface NavBarProps {
}

const NavBar: React.FC<NavBarProps> = () => {
    const downloadable = useSelector(getPersistent);
    const handleDownload = () => {
        const json = JSON.stringify(downloadable, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
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
