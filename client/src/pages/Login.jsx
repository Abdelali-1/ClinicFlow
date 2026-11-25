import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {errMsg} from "../api/client.js";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import logo from "../assets/logo_flow.webp"

export default function login(){
    const {user, login} = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if(user){
        return <Navigate to="/" replace/>
    }

    const submit = async (e)=> {
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            await login(email, password);
             navigate("/", { replace: true });
        }
        catch(err){
            setError(errMsg(err));
        }
        finally{
            setLoading(false);
        }
    }
    return(
        <Box
            sx={{
                minHeight:"100vh",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                bgcolor:"grey.100",
                p: 2
            }}
        >
            <Card sx={{ width:"100%", maxWidth:420, borderRadius: 3, boxShadow: 4}}>
                <CardContent sx={{p: 4}}>
                    <Stack spacing={2.5} alignItems="center">
                        <img
                            src={logo}
                            alt="logo"
                            style={{
                                width: 90,
                                height: 90,
                                objectFit: "contain",
                            }}
                        />
                        <Typography variant="body2" color="text.secandary">
                            Connectez-vous à votre compte
                        </Typography>
                        {error && (
                                <Alert security="error" sx={{width:"100%" }}>
                                    {error}
                                </Alert>
                        )}
                        <Box component="form" onSubmit={submit} sx={{width:"100%"}}>
                            <Stack spacing={2}>
                                <TextField 
                                    label="Address e-mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    fullWidth
                                />
                                
                                <TextField
                                    label="Mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    fullWidth
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit"/>)
                                        : ("Se connecter")
                                    }
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}
