import { createBrowserRouter } from 'react-router-dom';

import Root from './Root';
import Devices from './Devices';

export const routes = [
    {
        name: 'Home',
        path: '/',
        element: <Root />,
    },
    {
        name: 'Devices',
        path: '/devices',
        element: <Devices />,
    },
];

export const router = createBrowserRouter(routes);
