import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout({ setIsAuthenticated }) {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <Box
                component="main"
                sx={{
                    marginLeft: '250px',
                    width: 'calc(100% - 250px)'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default Layout;