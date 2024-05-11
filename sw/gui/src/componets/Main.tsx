import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Divider, IconButton, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

import { State } from '../features/store';
import NavBar from './NavBar';
import Layout from './Layout';

import DeviceList, { DeviceListProperties } from './DeviceList/DeviceList';
import AddDeviceForm from './DeviceList/AddDeviceForm';
import DeviceBoard from './DeviceBoard';
import ControlPanel from './ControlPanel';

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

            <AddDeviceForm open={isModalOpen} setOpen={setModalOpen} onSubmit={handleAddDevice} />
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
                right: {
                    defaultOpen: false,
                    variant: 'persistent',
                    minWidth: '25vw',
                    children: <ControlPanel />,
                },
            }}

            appBar={{
                children: <NavBar links={[]} />,
            }}
        >
            <DeviceBoard />
        </Layout>
    );
};

export default Devices;
