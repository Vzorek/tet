import React from 'react';
import { useLocation, Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import { ButtonGroup, Container } from '@mui/material';

// Define the props for NavBar component
interface NavBarProps {
    links: {
        name: string;
        path: string;
    }[];
}

interface NavButtonProps {
    to: string;
    label: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ to, label }) => {
    const loc = useLocation();
    const isActive = loc.pathname === to;
    const variant = isActive ? 'contained' : 'contained';
    const color = isActive ? 'inherit' : 'primary';

    return (
        <Link to={to}>
            <Button variant={variant} color={color}>
                {label}
            </Button>
        </Link>
    );
};

const NavBar: React.FC<NavBarProps> = ({ links }) => {
    return (
        <Container style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
        }}>
            <ButtonGroup>
                {links.map(({ name, path }) => (
                    <NavButton key={name} to={path} label={name} />
                ))}
            </ButtonGroup>
        </Container>
    );
};

export default NavBar;
