import { Navigate, Outlet } from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx';
import {
    Box,
    CircularProgress,
    Typography,
} from "@mui/material";
import Layout from "./Layout.jsx";

export default function ProtectedRoute(){
    const {user, loading} = useAuth();
    if(loading){
        return(
            <Box
                sx={{
                    display:"flex",
                    flexDirection: "column",
                    alignItems:"center",
                    justifyContent:"center",
                    minHeight:"100vh",
                    gap:2
                }}>
                    <CircularProgress/>
                    <Typography variant="body2" color="text.secondary">
                        Chargement…
                    </Typography>
            </Box>
        );
    }

    if(!user){
        return <Navigate to="/login" replace/>;
    }

    return(
        <Layout>
            <Outlet/>
        </Layout>
    );
}