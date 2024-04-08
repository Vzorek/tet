import GameControls from '../componets/ConnectonSettings';
import React from 'react';
import Layout from '../componets/Layout';
import NavBar from '../componets/NavBar';
import { routes } from '.';

const Root: React.FC = () => {
    return (
        <Layout
            appBar={{
                children: <NavBar links={routes} />,
            }}

            sideBars={{
                right: {
                    minWidth: '20vw',
                    defaultOpen: true,
                    children: <GameControls />,
                },
            }}
        >

        </Layout>
    );
};

export default Root;
