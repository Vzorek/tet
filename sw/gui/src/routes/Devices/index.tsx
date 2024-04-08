import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Container, Dialog, DialogActions, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

import { State } from '../../features/store';
import NavBar from '../../componets/NavBar';
import Layout from '../../componets/Layout';
import { routes } from '../index';

import DeviceList, { DeviceListProperties } from './DeviceList';
import AddDeviceForm from './AddDeviceForm';
import DeviceBoard from './DeviceBoard';

const SidebarContent: React.FC<DeviceListProperties> = props => {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const dispatch = useDispatch();
    const handleAddDevice = (deviceData: unknown) => {
        dispatch({ type: 'devices/createDevice', payload: deviceData });
        handleCloseModal();
    };

    return (
        <Container>
            <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Typography variant='h6'>Devices</Typography>
                <IconButton onClick={handleOpenModal}>
                    <Add />
                </IconButton>
            </Box>
            <Divider />
            <DeviceList {...props} />

            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogContent>
                    <AddDeviceForm {...props} onSubmit={handleAddDevice} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

const Devices = () => {
    const { devices, types } = useSelector((state: State) => state.devices);

    return (
        <Layout
            sideBars={{
                left: {
                    defaultOpen: false,
                    variant: 'persistent',
                    minWidth: '20vw',
                    children: <SidebarContent devices={devices} deviceTypes={types} />,
                },
            }}

            appBar={{
                children: <NavBar links={routes} />,
            }}
        >
            <DeviceBoard />
        </Layout>
    );
};

export default Devices;
