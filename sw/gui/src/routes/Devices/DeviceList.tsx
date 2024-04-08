import { IconButton, List, ListItem, ListItemText, Tooltip } from '@mui/material';
import React from 'react';
import { DeviceState, DeviceStates, DeviceTypes } from '../../features/slices/devices';
import { JsonView, allExpanded } from 'react-json-view-lite';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../features/store';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type DeviceProps = {
    device: DeviceState;
};

export type DeviceListProperties = {
    devices: DeviceStates;
    deviceTypes: DeviceTypes;
};

const VisibilityToggle: React.FC<{ id: string; }> = ({ id }) => {
    const hidden = useSelector((state: State) => state.devices.devices[id]?.hidden);
    if (hidden === undefined)
        throw new Error(`Device not found: ${id}`);
    const dispatch = useDispatch();
    const handleToggle = () => {
        dispatch({ type: 'devices/toggleVisibility', payload: id });
    };

    return (
        <IconButton onClick={handleToggle}>
            {hidden ? <VisibilityOff /> : <Visibility />}
        </IconButton>
    );
};

const Device: React.FC<DeviceProps> = ({ device }) => {
    return (
        <Tooltip title={<JsonView data={device.state} shouldExpandNode={allExpanded} />}>
            <ListItem secondaryAction={<VisibilityToggle id={device.id} />}>
                <ListItemText primary={device.id} secondary={device.typeTag} />
            </ListItem>
        </Tooltip>
    );
};

const DeviceList: React.FC<DeviceListProperties> = ({ devices }) => {
    return (
        <List>
            {Object.entries(devices).map(([id, device]) => {
                return <Device key={id} device={device} />;
            })}
        </List>
    );
};

export default DeviceList;
