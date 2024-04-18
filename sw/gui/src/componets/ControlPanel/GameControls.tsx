import { Stack, Typography, Button, ButtonGroup, Input } from '@mui/material';
import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type State } from '@/features/store';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const GameControls: FC = () => {
    const currentType = useSelector((state: State) => state.config.currentType);
    const connected = useSelector((state: State) => state.client.state);

    const disabled = connected !== 'connected' && currentType !== 'mock';

    const dispatch = useDispatch();

    const startGame = () => {
        dispatch({ type: 'client/startGame' });
    };

    const stopGame = () => {
        dispatch({ type: 'client/stopGame' });
    };

    const uploadGameCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async event => {
            const contents = event.target?.result;
            if (typeof contents !== 'string') return;
            dispatch({ type: 'client/sendCommand', payload: {
                targetId: '__server__',
                command: 'uploadGameCode',
                data: contents,
            } });
        };
        reader.readAsText(file);
    };

    return (
        <Stack justifyContent='center' paddingBottom='1em' paddingTop='1em'>
            <Typography variant='h6' textAlign='center'>Game Controls</Typography>
            <ButtonGroup orientation='vertical'>
                <ButtonGroup disabled={disabled} fullWidth>
                    <Button onClick={startGame}>Start</Button>
                    <Button onClick={stopGame}>Stop</Button>
                </ButtonGroup>
                <Button
                    component="label"
                    role={undefined}
                    disabled={disabled}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload file
                    <Input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={uploadGameCode}
                        inputProps={{ accept: '.js' }}
                    />
                </Button>
            </ButtonGroup>
        </Stack>
    );
};

export default GameControls;
