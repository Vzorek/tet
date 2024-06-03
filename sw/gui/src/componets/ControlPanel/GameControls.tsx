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
        dispatch({
            type: 'client/sendCommand',
            payload: {
                targetId: '__server__',
                command: 'startGame',
                data: null,
            },
        });
    };

    const stopGame = () => {
        dispatch({
            type: 'client/sendCommand',
            payload: {
                targetId: '__server__',
                command: 'pauseGame',
                data: null,
            },
        });
    };

    const loadGame = (data: string) => {
        const parsed = JSON.parse(data);
        if (!parsed.serverData || !parsed.layoutData)
            throw new Error('Invalid game data');

        dispatch({
            type: 'client/sendCommand',
            payload: {
                targetId: '__server__',
                command: 'loadGame',
                data: parsed.serverData,
            },
        });

        dispatch({
            type: 'devices/loadLayout',
            payload: parsed.layoutData,
        });
    };

    const uploadGameCode = (data: string) => {
        dispatch({
            type: 'client/sendCommand',
            payload: {
                targetId: '__server__',
                command: 'uploadGameCode',
                data: data,
            },
        });
    };

    const handleUploadSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async event => {
            const contents = event.target?.result;
            if (typeof contents !== 'string') return;
            switch (file.name.split('.').at(-1)) {
            case 'js':
                return uploadGameCode(contents);
            case 'json':
                return loadGame(contents);
            }
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
                        onChange={handleUploadSubmit}
                        inputProps={{ accept: '.js,.json' }}
                    />
                </Button>
            </ButtonGroup>
        </Stack>
    );
};

export default GameControls;
