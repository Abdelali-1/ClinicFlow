
import { useCallback, useState, useEffect } from "react";
import api, { errMsg } from "../api/client.js";

import {
  Snackbar,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Stack,
  CircularProgress,
  Select, FormControl
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EventIcon from "@mui/icons-material/Event";

const STATUS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "cancelled", label: "Annulé" }
];
const emptyForm = {
  patientId: "",
  appointmentDate: "",
  reason: "",
  notes: "",
  status: "pending"
};

export default function Appointments() {
    const [items, setItems] = useState([]);
    const [patients, setPatients] = useState([]);

    const [filters, setFilters] = useState({
        date: "",
        status: ""
    });

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };
    const load = useCallback(async () => {
        setLoading(true);
        try {
        const { data } = await api.get("/appointments", {
            params: {
                date: filters.date || undefined,
                status: filters.status || undefined
            }
        });
        setItems(data.items || []);
        } catch (err) {
            showSnackbar(errMsg(err), "error");
        } 
        finally {
            setLoading(false);
        }
    }, [filters]);

    // Reload when filters change
    useEffect(() => {
        load();
    }, [load]);

    // Load patients
    useEffect(() => {
        const loadPatients = async () => {
            try {
                const { data } = await api.get("/patients", {
                    params: { limit: 100 }
                });

                setPatients(data.items || []);
            } 
            catch (err) {
                showSnackbar(errMsg(err), "error");
            }
        };

        loadPatients();
    }, []);

    // Update form fields
    const set = (key) => (e) => {
        setForm((prev) => ({
        ...prev,
        [key]: e.target.value
        }));
    };

    // Create appointment
    const create = async (e) => {
        e.preventDefault();

        const date = new Date(form.appointmentDate);

        if (!form.appointmentDate || Number.isNaN(date.getTime())) {
             showSnackbar("Veuillez saisir une date de rendez-vous valide.", "warning");
        return;
        }

        const payload = {
            ...form,
            appointmentDate: date.toISOString(),
            notes: form.notes || null
        };

        setSaving(true);

        try {
            await api.post("/appointments", payload);

            setForm(emptyForm);
            await load();
            showSnackbar("Rendez-vous créé avec succès.","success")
        } 
        catch (err) {
            showSnackbar(errMsg(err),"error");
        } 
        finally {
            setSaving(false);
        }
    };

    // Change appointment status
    const changeStatus = async (id, status) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            await load();
            showSnackbar("Statut du rendez-vous mis à jour avec succès.","success")
        } 
        catch (err) {
            showSnackbar(errMsg(err),"error");
        }
    };

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
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

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 3, alignItems:"center"}}
            >
                <EventIcon color="primary" fontSize="large" />

                <Typography variant="h5" fontWeight="bold">
                    Rendez-vous 
                </Typography>
            </Stack>

            {/* Create appointment form */}
            <Paper
                component="form"
                onSubmit={create}
                elevation={0}
                sx={{
                p: 2.5,
                mb: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Créer un rendez-vous
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)"
                        },
                        gap: 2
                    }}
                >
                    <TextField
                        select
                        label="Patient"
                        value={form.patientId}
                        onChange={set("patientId")}
                        required
                        fullWidth
                        size="small"
                    >
                        {patients.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.fullName} ({p.cin})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Date du rendez-vous"
                        type="datetime-local"
                        value={form.appointmentDate}
                        onChange={set("appointmentDate")}
                        required
                        fullWidth
                        size="small"
                        slotProps={{
                        inputLabel: { shrink: true }
                        }}
                    />

                    <TextField
                        label="Motif"
                        value={form.reason}
                        onChange={set("reason")}
                        required
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Notes (optionnelles)"
                        value={form.notes}
                        onChange={set("notes")}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        select
                        label="Status"
                        value={form.status}
                        onChange={set("status")}
                        fullWidth
                        size="small"
                    >
                        {STATUS.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                                {s.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled={saving}
                        sx={{ minHeight: 40 }}
                    >
                        {saving ? "Création..." : "Créer un rendez-vous"}
                    </Button>
                </Box>
            </Paper>

            {/* Filters */}
            <Paper
                elevation={0}
                sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    sx={{alignItems:"center"}}
                >
                    <TextField
                        label="Filtrer par date"
                        type="date"
                        value={filters.date}
                        sx={{
                            minWidth: { xs: "100%", sm: 170 },
                            width: { xs: "100%", sm: "auto" },
                            flex: { xs: "unset", sm: 5 }
                        }}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                date: e.target.value
                            }))
                        }
                        size="small"
                        slotProps={{
                        inputLabel: { shrink: true }
                        }}
                    />

                    <TextField
                        select
                        label="Filtrer par statut"
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: e.target.value
                            }))
                        }
                        size="small"
                        sx={{ 
                            minWidth: 170 ,
                            minWidth: { xs: "100%", sm: 170 },
                            width: { xs: "100%", sm: "auto" },
                            flex: { xs: "unset", sm: 5 }
                        }}
                    >
                        <MenuItem value="">Tous les statuts</MenuItem>

                        {STATUS.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                                {s.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="outlined"
                        color="inherit"
                        sx={{
                            minWidth: { xs: "100%", sm: 170 },
                            width: { xs: "100%", sm: "auto" },
                            flex: { xs: "unset", sm: 5 }
                        }}
                        startIcon={<RestartAltIcon />}
                        onClick={() => setFilters({ date: "", status: "" })}
                    >
                        Réinitialiser
                    </Button>
                </Stack>
            </Paper>

            {/* Appointments table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflowX: "auto"
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                            <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Patient</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Motif</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                <CircularProgress size={28} />
                            </TableCell>
                        </TableRow>
                        ) : (
                        <>
                            {items.map((a) => (
                                <TableRow key={a.id} hover>
                                    <TableCell>
                                        {new Date(a.appointmentDate).toLocaleString("fr-FR")}
                                    </TableCell>

                                    <TableCell>{a.patientName}</TableCell>

                                    <TableCell>{a.reason}</TableCell>

                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 125 }}>
                                            <Select
                                                value={a.status}
                                                onChange={(e) => {
                                                        const newStatus = e.target.value;

                                                        const selectedStatus = STATUS.find(
                                                        (s) => s.value === newStatus
                                                        );

                                                        const confirmed = window.confirm(
                                                        `Voulez-vous vraiment modifier le statut en "${selectedStatus.label}" ?`
                                                        );

                                                        if (confirmed) {
                                                        changeStatus(a.id, newStatus);
                                                    }
                                                }}
                                                displayEmpty
                                                sx={{
                                                    borderRadius: 5,
                                                    "& .MuiSelect-select": {
                                                    py: 0.5,
                                                    px: 1
                                                    },
                                                    "& fieldset": {
                                                    border: "none"
                                                    },
                                                    bgcolor: "action.hover"
                                                }}
                                            >
                                            {STATUS.map((s) => (
                                                <MenuItem key={s.value} value={s.value}>
                                                <Chip
                                                    label={s.label}
                                                    color={getStatusColor(s.value)}
                                                    size="small"
                                                    sx={{
                                                    minWidth: 90,
                                                    fontWeight: 600
                                                    }}
                                                />
                                                </MenuItem>
                                            ))}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!items.length && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">
                                    Aucun rendez-vous trouvé
                                </Typography>
                                </TableCell>
                            </TableRow>
                            )}
                        </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() =>
                    setSnackbar((prev) => ({ ...prev, open: false }))
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() =>
                        setSnackbar((prev) => ({ ...prev, open: false }))
                    }
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
