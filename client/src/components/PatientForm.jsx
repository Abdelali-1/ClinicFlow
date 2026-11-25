import { useState } from "react";
import api, {errMsg} from "../api/client.js";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress,
  IconButton 
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

export default function PatientForm({patient, onClose, onSaved}){
    const  [form, setForm] = useState({
        fullName: patient?.fullName || '',
        cin: patient?.cin || '',
        phone: patient?.phone || '',
        birthDate: patient?.birthDate || '',
        address: patient?.address || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const set = (k) => (e) =>{ 
        setForm((prev) => ({
                ...prev,
                [k] : e.target.value
            }));
        }

    const submit = async (e)=> {
        e.preventDefault();
        setError('');
        setLoading(true);
        const payload = {...form, address: form.address || ''};
        try{
            if (patient?.id) {
                await api.put(`/patients/${patient.id}`, payload);
            } 
            else {
                await api.post("/patients", payload);
            }
            onSaved();
        }
        catch(err){
            setError(errMsg(err));
        }
        finally{
            setLoading(false);
        }
    }

    return(
        <Dialog
            open={true}
            onClose={(_, reason) => {
                if (reason !== "backdropClick") {
                onClose();
                }
            }}
            fullWidth
            maxWidth="sm">
                <form onSubmit={submit}>
                    <DialogTitle>
                       <Stack 
                            direction="row"
                            sx={{alignItems: "center", justifyContent:"space-between"}}
                            >
                                {patient?.id ? "Modifier le patient" : "Ajouter patient"}
                                <IconButton onClick={onClose} aria-label="Fermer">
                                    <CloseIcon />
                                </IconButton>
                       </Stack>
                    </DialogTitle>
                    
                    <DialogContent>
                        <Stack spacing={2} sx={{mt:1}}>
                            {error && (
                                <Alert security="error">
                                    {error}
                                </Alert>
                            )}

                            <TextField 
                                label="CIN"
                                value={form.cin}
                                onChange={set("cin")}
                                required
                                fullWidth
                                />
                            <TextField 
                                label="Nom complet"
                                value={form.fullName}
                                onChange={set("fullName")}
                                required
                                fullWidth
                                />
                            <TextField 
                                label="Télephone"
                                value={form.phone}
                                onChange={set("phone")}
                                required
                                fullWidth
                                />
                            <TextField 
                                label="Date de naissance"
                                type="date"
                                value={form.birthDate}
                                onChange={set("birthDate")}
                                required
                                fullWidth
                                slotProps={{
                                    inputLabel:{shrink:true}
                                }}
                                />
                            <TextField 
                                label="Address"
                                value={form.address}
                                onChange={set("address")}
                                rows={2}
                                multiline
                                fullWidth
                                />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{p:3}}>
                        <Button
                            onClick={onClose}
                            color="inherit"
                            disabled={loading}>
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}>
                            { 
                                loading ? (<CircularProgress size={22} color="inherit" />
                                ) : ("Enregistrer")
                            }
                        </Button>
                    </DialogActions>
                </form>
        </Dialog>
    )
}