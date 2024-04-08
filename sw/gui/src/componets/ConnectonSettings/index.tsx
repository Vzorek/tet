import { Button, ButtonGroup, Container, Typography, Divider, TextField, Switch, Stack, Box, IconButton, InputAdornment } from '@mui/material';
import { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type State } from '@/features/store';
import { SetUrl } from '@/features/slices/config';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Header = () => {
    return (
        <Container>
            <Typography variant='h4'>
                Game Controls
            </Typography>
        </Container>
    );
};

const MQTTControls = () => {
    const dispatch = useDispatch();
    const { url, username, password } = useSelector((state: State) => state.config.mqtt);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <TextField label='URL' style={{ marginTop: '1em' }} value={url} onChange={event => { dispatch<SetUrl>({ type: 'config/setUrl', payload: event.target.value }); }} />
            <Box style={{ marginTop: '0.5em' }}>
                <TextField label='Username (Optional)' value={username} />
                <TextField label='Password (Optional)' style={{ marginLeft: '0.5em' }} value={password} type={showPassword ? 'text' : 'password'} InputProps={{
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
            </Box>
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

const Body: FC = () => {
    const state = useSelector((state: State) => state.client.state);
    const currentType = useSelector((state: State) => state.config.currentType);
    const dispatch = useDispatch();
    const isMock = currentType === 'mock';
    const isMqtt = currentType === 'mqtt';

    return (
        <Stack>
            <Typography variant='h6' textAlign='center'>Connection</Typography>
            <Stack direction='row' justifyContent='center'>
                <Typography display='inline'> Mock </Typography>
                <Switch checked={isMqtt} onChange={event => dispatch({ type: 'config/setConnectionType', payload: (event.target.checked ? 'mqtt' : 'mock') })} />
                <Typography display='inline'> MQTT </Typography>
            </Stack>
            <Divider orientation='horizontal' />
            {isMock && <MockControls />}
            {isMqtt && <MQTTControls />}
            <ButtonGroup style={{ alignSelf: 'center', marginTop: '1em' }}>
                <ConnectButton state={state} />
            </ButtonGroup>
        </Stack>
    );
};

const GameControls: FC = () => {
    return (
        <Container>
            <Header />
            <Divider orientation='horizontal' />
            <Body />
        </Container>
    );
};

export default GameControls;
