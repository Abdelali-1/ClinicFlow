import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Layout({children}){
    const  {user, logout} = useAuth();
    const navItems = [
        { label: "Tableau de bord", path: "/" },
        { label: "Patients", path: "/patients" },
        { label: "Rendez-vous", path: "/appointments" }
    ];
    return(
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{fontWeight:"bold", mr:4}}>
                        ClinicFlow
                    </Typography>
                    <Box sx={{display: "flex", gap:2, flexGrow : 1}}>
                        {navItems.map((item) => {
                            <Button 
                            key={item.path}
                            component={NavLink}
                            to={item.path}
                            color="inherit"
                            sx={{
                                "&.active":{
                                    borderBottom:"2px solid white",
                                    borderRadius: 0
                                }
                            }}>
                            {item.label}     
                            </Button>
                        })}
                    </Box>
                    <Typography variant="h5" sx={{mr:2}}>
                        {user?.fullName}
                    </Typography>
                    <Button
                        startIcon={<LogoutIcon/>} 
                        onClick={logout}>
                        Déconnexion
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{mt:4}}>
                {children}
            </Container>
        </>
    )
}