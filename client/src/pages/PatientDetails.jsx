import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api, { errMsg } from "../api/client.js";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
export default function PatientDetails(){
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [appts, setAppts] = useState([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadDetails = async () => {
            setLoading(true);
            setError("");

            try {
                const [patientResponse, appointmentsResponse] =
                await Promise.all([
                    api.get(`/patients/${id}`),
                    api.get("/appointments", {
                    params: { patientId: id }
                    })
                ]);

                if (!active) return;

                setPatient(patientResponse.data.patient ?? patientResponse.data);
                const appointmentsData = appointmentsResponse.data;

                const appointments = Array.isArray(appointmentsData)
                    ? appointmentsData
                    : Array.isArray(appointmentsData.items)
                        ? appointmentsData.items
                        : [];

                setAppts(appointments);
            } catch (err) {
                if (active) {
                setError(errMsg(err));
                }
            } finally {
                if (active) {
                setLoading(false);
                }
            }
            };

            loadDetails();

            return () => {
            active = false;
        };
    }, [id]);

    if(loading){
        return (
            <Box
                sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh"
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    if(error){
        return(
            <Box>
                <Alert severity="error" sx={{mb:2}}>
                    {error}
                </Alert>
                <Button
                    component={Link}
                    to="/patients"
                    startIcon={<ArrowBackIcon />}
                >
                    Retour aux patients
                </Button>
            </Box>
        );
    }
    
    if(!patient){
        return(
            <Alert severity="warning">
                Patient introuvable.
            </Alert>
        );
    }
    const formatDate = (date) =>{
        if(!date) return "-";
        return new Date(date).toLocaleString('fr-FR');
    } 
    const getStatusColor = (status) =>{
        switch(status?.toLowerCase()){
            case "confirmed":
                return "success";
            case "pending":
                return "warning";
            case "cancelled":
                return "error";
            default:
                return "default";
        }
    };

    return(
        <Box>
            <Button
                component={Link}
                to="/patients"
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 3 }}
            >
                Retour aux patients
            </Button>

            <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 3, alignItems:"center" }}
            >
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />

                <Box>
                <Typography variant="h4" fontWeight="bold">
                    {patient.fullName}
                </Typography>

                <Typography color="text.secondary">
                    Informations du patient
                </Typography>
                </Box>
            </Stack>

            {/* { patients } */}
            <Card
                sx={{
                    borderRadius: 2,
                    mb: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
                }}
                >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <PersonIcon color="primary" fontSize="small" />

                    <Typography variant="subtitle1" fontWeight="bold">
                        Informations personnelles
                    </Typography>
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                        gap: 1
                    }}
                    >
                    {[
                        { label: "Nom complet", value: patient.fullName, icon: <PersonIcon fontSize="small" /> },
                        { label: "CIN", value: patient.cin, icon: <PersonIcon fontSize="small" /> },
                        { label: "Téléphone", value: patient.phone, icon: <PhoneIcon fontSize="small" /> },
                        { label: "Date de naissance", value: patient.birthDate || "-", icon: <CalendarMonthIcon fontSize="small" /> },
                        { label: "Adresse", value: patient.address || "-", icon: <LocationOnIcon fontSize="small" /> },
                        { label: "Date de création", value: formatDate(patient.createdAt), icon: <AccessTimeIcon fontSize="small" /> }
                    ].map((item) => (
                        <Box
                        key={item.label}
                        sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: "action.hover",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minWidth: 0
                        }}
                        >
                        <Box sx={{ color: "primary.main", display: "flex" }}>
                            {item.icon}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary">
                            {item.label}
                            </Typography>
                            <Typography
                            variant="body2"
                            fontWeight="600"
                            noWrap
                            title={String(item.value)}
                            >
                            {item.value}
                            </Typography>
                        </Box>
                        </Box>
                    ))}
                    </Box>
                </CardContent>
                </Card>

            {/* Appointments */}

            <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 2 , alignItems:"center"}}
            >
                <EventIcon color="primary" />

                <Typography variant="h5" fontWeight="bold">
                    Rendez-vous ({appts.length})
                </Typography>
            </Stack>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Motif</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {appts.map((a) => (
                            <TableRow key={a.id} hover>

                                <TableCell>
                                    {formatDate(a.appointmentDate)}
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        label={a.status}
                                        color={getStatusColor(a.status)}
                                        size="small"
                                    />
                                </TableCell>

                                <TableCell>
                                    {a.reason || "-"}
                                </TableCell>

                                <TableCell>
                                    {a.notes || "-"}
                                </TableCell>

                            </TableRow>
                        ))}

                        {!appts.length && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    Aucun rendez-vous trouvé
                                </TableCell>
                            </TableRow>
                        )}

                    </TableBody>
                </Table>
            </TableContainer>
    </Box>
    );
}