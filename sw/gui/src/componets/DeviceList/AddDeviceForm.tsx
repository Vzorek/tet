import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button, FormHelperText, SelectChangeEvent, TextField, Dialog, DialogActions, DialogContent } from '@mui/material';
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

type FormProps = {
    onSubmit: (data: {
        tag: string;
        id: string;
        initial?: Record<string, unknown>;
    }) => void;
};

type AddDeviceFormProps = FormProps & {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ open, setOpen, onSubmit }) => {
    const deviceTypes = getDeviceTypes();
    const [selectedDeviceType, setSelectedDeviceType] = useState('');
    const [deviceId, setDeviceId] = useState('');
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
            id: deviceId,
        });
        setSelectedDeviceType('');
        setDeviceId('');
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedDeviceType('');
        setDeviceId('');
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent>
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

                    <FormControl fullWidth style={{ marginTop: 16 }}>
                        <TextField
                            id="device-id"
                            type="text"
                            value={deviceId}
                            label="Device ID"
                            onChange={e => setDeviceId(e.target.value)}
                        />
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Add Device
                </Button>
            </DialogActions>
        </Dialog >
    );
};

export default AddDeviceForm;
