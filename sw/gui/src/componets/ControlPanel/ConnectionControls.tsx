import { Button, ButtonGroup, Typography, Divider, TextField, Switch, Stack, IconButton, InputAdornment } from '@mui/material';
import { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type State } from '@/features/store';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const MQTTControls = () => {
    const dispatch = useDispatch();
    const { url, username, password } = useSelector((state: State) => state.config.mqtt);
    const state = useSelector((state: State) => state.client.state);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Divider orientation='horizontal' />
            <TextField label='URL' style={{ marginTop: '1em' }} value={url} onChange={event => { dispatch({ type: 'config/setUrl', payload: event.target.value }); }} />
            <TextField label='Username (Optional)' value={username} style={{ marginTop: '0.5em' }} />
            <TextField label='Password (Optional)' value={password} style={{ marginTop: '0.5em' }} type={showPassword ? 'text' : 'password'} InputProps={{
                endAdornment:
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={event => { event.preventDefault(); }}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>,
            }} />
            <ButtonGroup style={{ alignSelf: 'center', marginTop: '1em' }}>
                <ConnectButton state={state} />
            </ButtonGroup>
        </>
    );
};

const MockControls = () => {
    return (
        <>
        </>
    );
};

const ConnectButton = ({ state }: { state: State['client']['state'] }) => {
    const dispatch = useDispatch();

    const colors: {
        [key in State['client']['state']]: 'success' | 'primary' | 'error';
    } = {
        connected: 'success',
        disconnected: 'primary',
        error: 'error',
    };

    const variants: {
        [key in State['client']['state']]: 'contained' | 'outlined';
    } = {
        connected: 'contained',
        disconnected: 'outlined',
        error: 'contained',
    };

    const contents = {
        connected: 'Disconnect',
        disconnected: 'Connect',
        error: 'Reconnect',
    };

    const onClick = () => {
        if (state === 'connected') {
            dispatch({ type: 'client/disconnectMQTT' });
        }
        else {
            dispatch({ type: 'client/connectMQTT' });
        }
    };

    return (
        <Button
            variant={variants[state]}
            color={colors[state]}
            onClick={onClick}>
            {contents[state]}
        </Button>
    );
};

const ConnectionControls: FC = () => {
    const currentType = useSelector((state: State) => state.config.currentType);
    const dispatch = useDispatch();
    const isMock = currentType === 'mock';
    const isMqtt = currentType === 'mqtt';

    return (
        <Stack padding='1em'>
            <Typography variant='h6' textAlign='center'>Connection</Typography>
            <Stack direction='row' justifyContent='center'>
                <Typography display='inline'> Mock </Typography>
                <Switch checked={isMqtt} onChange={event => dispatch({ type: 'config/setConnectionType', payload: (event.target.checked ? 'mqtt' : 'mock') })} />
                <Typography display='inline'> MQTT </Typography>
            </Stack>
            {isMock && <MockControls />}
            {isMqtt && <MQTTControls />}
        </Stack>
    );
};

export default ConnectionControls;
