import { CssBaseline } from '@mui/material';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';
import Main from './componets/Main';
import { Provider as StateProvider } from 'react-redux';
import store from './features/store';
const config = store.getState().config;

// FIXME: This is a hack to autostart server if saved connection type is mock, it need s to be moved to somewhat more "systematic" place
store.dispatch({ type: 'config/setConnectionType', payload: config.currentType });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <StateProvider store={store}>
                <Main />
            </StateProvider>
        </ThemeProvider>
    </React.StrictMode>,
);
