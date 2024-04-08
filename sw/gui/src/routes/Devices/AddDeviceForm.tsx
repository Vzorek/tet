import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button, FormHelperText, SelectChangeEvent } from '@mui/material';
import { type IDeviceType } from '@tet/devices';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { getDeviceTypes } from '../../features/client/middleware';

type DeviceDefinitionProps = {
    definition: IDeviceType;
};

const DeviceDefinition: React.FC<DeviceDefinitionProps> = ({ definition }) => {
    return (
        <JsonView
            shouldExpandNode={(level: number, value: unknown, field?: string): boolean => {
                if (level === 0)
                    return true;
                if (level === 1)
                    switch (field) {
                    case 'stateDefinition':
                    case 'events':
                        return true;
                    default:
                        return false;
                    }
                return true;
            }}
            data={{
                tag: definition.tag,
                fwVersion: definition.fwVersion,
                stateDefinition: definition.definition.commands.updateState,
                events: definition.definition.events,
                initialState: definition.initialState,
                commands: definition.definition.commands,
            }}
        />
    );
};

type AddDeviceFormProps = {
    onSubmit: (data: {
        tag: string;
        id: string;
        initial?: Record<string, unknown>;
    }) => void;
};

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onSubmit }) => {
    const deviceTypes = getDeviceTypes();
    const [selectedDeviceType, setSelectedDeviceType] = useState('');
    const [error, setError] = useState(false);

    const handleSelectDevice = (event: SelectChangeEvent) => {
        setSelectedDeviceType(event.target!.value);
        setError(false);
    };

    const handleSubmit = () => {
        if (!selectedDeviceType) {
            setError(true);
            return;
        }
        onSubmit({
            tag: selectedDeviceType,
            id: Math.random().toString(36).substring(7),
        });
    };

    return (
        <form>
            <FormControl fullWidth error={error}>
                <InputLabel id="device-select-label">Select a Device</InputLabel>
                <Select
                    labelId="device-select-label"
                    value={selectedDeviceType}
                    label="Select a Device"
                    onChange={handleSelectDevice}
                >
                    {Object.entries(deviceTypes).map(([tag, type]) => (
                        <MenuItem key={tag} value={tag}>{type.tag}</MenuItem>
                    ))}
                </Select>
                {error && <FormHelperText>Please select a device</FormHelperText>}
            </FormControl>
            {selectedDeviceType && <DeviceDefinition definition={deviceTypes[selectedDeviceType]!} />}
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
                Add Device
            </Button>
        </form>
    );
};

export default AddDeviceForm;
