import { useEffect, useState } from "react";
import {
  Alert, Avatar, Box, Card, CardContent, Chip, Paper, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api, { errMsg } from "../api/client";

const STATUS_COLOR = { pending: "warning", confirmed: "success", cancelled: "error" };
const STATUS_LABEL = { pending: "En attente", confirmed: "Confirmé", cancelled: "Annulé" };

function StatCard({ label, value, icon, color }) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 52, height: 52 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4">{value ?? <Skeleton width={40} />}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const date = new Date().toLocaleDateString("en-CA"); 
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/appointments", { params: { date } }),
    ])
      .then(([s, a]) => {
        setStats(s.data);
        setToday(a.data.items);
      })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const cards = [
    { label: "Total patients", value: stats?.totalPatients, icon: <PeopleIcon />, color: "primary" },
    { label: "Rendez-vous du jour", value: stats?.todayAppointments, icon: <TodayIcon />, color: "info" },
    { label: "En attente", value: stats?.pending, icon: <HourglassTopIcon />, color: "warning" },
    { label: "Confirmés", value: stats?.confirmed, icon: <CheckCircleIcon />, color: "success" },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Aperçu de l'activité de la clinique
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 4,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>Rendez-vous d'aujourd'hui</Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              
              <TableCell>Heure</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell>Statut</TableCell>
            
            </TableRow>
          </TableHead>
          <TableBody>
            {today.map((a) => (
              <TableRow key={a.id} hover>
                
                <TableCell>
                  {new Date(a.appointmentDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell>{a.patientName}</TableCell>
                <TableCell>{a.reason}</TableCell>
                <TableCell>
                  <Chip size="small" label={STATUS_LABEL[a.status]} color={STATUS_COLOR[a.status]} />
                </TableCell>
              
              </TableRow>
            ))}
            {!today.length && (
              <TableRow>
               
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Aucun rendez-vous aujourd'hui
                </TableCell>
              
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}