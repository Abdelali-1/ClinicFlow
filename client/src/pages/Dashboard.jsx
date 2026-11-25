import { useEffect, useState } from "react";
import api, {errMsg} from "../api/client.js";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventIcon from "@mui/icons-material/Event";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Dashboard(){
    const [stats, setStats] = useState(null)
    const [error, setError] = useState('');
    
    useEffect(() => {
        api.get('/dashboard/stats')
            .then((r) => setStats(r.data))
            .catch((err) => setError(errMsg(err)));
    }, []);

    if (error) return <Alert severity="error">{error}</Alert>
    if (!stats) return (
        <Box 
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh"
            }}
        >
            <CircularProgress/>
        </Box>
    );

    const cards = [
        {
            label: "Nombre total de patients",
            value: stats.totalPatients,
            icon: <PeopleAltIcon />,
             color: "#1976d2"
        },
        {
            label: "Rendez-vous du jour",
            value: stats.todayAppointments,
            icon: <EventIcon />,
            color: "#0288d1"

        },
        {
            label: "En attente",
            value: stats.totalPatients,
            icon: <PendingActionsIcon />,
            color: "#ed6c02"
        },
        {
            label: "Confirmé",
            value: stats.confirmed,
            icon: <CheckCircleIcon />,
            color :"#2e7d32"
        }
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{mb:3}}>
                Tableau de bord
            </Typography>
            <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.label}>
                        <Card
                            sx={{
                                borderRadius:3,
                                boxShadow:3,
                                height:"100%"
                            }}
                            >
                            <CardContent>
                                <Box
                                    sx={{
                                        display:"flex",
                                        justifyContent:"space-between",
                                        alignItems:"center",
                                        mb:2
                                    }}
                                >
                                    <Typography color="text.secondary" variant="body2">
                                        {card.label}
                                    </Typography>
                                    <Box sx={{color: card.color}}>
                                        {card.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {card.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )

}