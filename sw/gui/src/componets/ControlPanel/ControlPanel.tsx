import { Container, Divider, Typography } from '@mui/material';
import { FC } from 'react';
import ConnectionControls from './ConnectionControls';
import GameControls from './GameControls';

const ControlPanel: FC = () => {
    return (
        <Container>
            <Typography variant='h4' textAlign='center' >Control Panel</Typography>
            <Divider orientation='horizontal' />
            <ConnectionControls />
            <Divider orientation='horizontal' />
            <GameControls />
            <Divider orientation='horizontal' />
        </Container>
    );
};

export default ControlPanel;
