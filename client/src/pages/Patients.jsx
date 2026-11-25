import {useCallback, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import api ,{errMsg} from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PatientForm from "../components/PatientForm";

import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Navigate } from "react-router-dom";

export default function Patients(){
    const {user} = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({
        items:[], total :0, totalPages : 1
    });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('')    
    const [loading, setLoading] = useState(false);


    const load = useCallback(async () => {
         setLoading(true);
        try{
            const {data} = await api.get('/patients', {
                params: { 
                    search : search || undefined , 
                    page, 
                    limit: 10
                }
            });
            setData(data);
            setError('');
        }
        catch(err){
            setError(errMsg(err));
        }
        finally {
            setLoading(false);
        }
    },[search, page]);

    useEffect(() => {
        const t = setTimeout(() =>{
            load();
        },300);
        return () =>clearTimeout(t); 
    }, [load]);

    const handleSaved = async () => {
        setEditing(null);
        await load();
    };

    const remove = async (p) => {
        if(!window.confirm(`Delete ${p.fullName}? their appointment will be  deleted too`)) retrun;
        try{
            await api.delete(`/patients/${p.id}`);
            load();
        }
        catch(err){
            setError(errMsg(err));
        }
    }

    return(
        <Box>
            <Stack 
                direction="row"
                sx={{mb:3 , justifyContent:"space-between", alignItems:"center"}}
            >
                <Typography variant="h4" fontWeight="bold">
                    patients {data.total}
                </Typography>
                <Button 
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={() => setEditing({})}
                >
                    Ajouter un patient
                </Button>
            </Stack>
            <TextField 
                fullWidth
                placeholder="Rechercher par nom ou cin"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1);
                }}
                slotProps={{
                    input: {
                    startAdornment: (
                        <InputAdornment position="start">
                        <SearchIcon color="action" />
                        </InputAdornment>
                    )
                    }
                }}
                sx={{mb: 3}}
            />
            {error && (
                <Alert severity="error" sx={{mb: 2}} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {loading ? (
                    <Box sx={{display:"flex", justifyContent:"center", p:5 }}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{borderRadius: 2}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nom complet</TableCell>
                                    <TableCell>CIN</TableCell>
                                    <TableCell>Téléphone</TableCell>
                                    <TableCell>Date de naissance</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.items.map((p) => (
                                    <TableRow key={p.id} hover>

                                        <TableCell>{p.fullName}
                                        </TableCell>
                                        <TableCell>{p.cin}</TableCell>
                                        <TableCell>{p.phone}</TableCell>
                                        <TableCell>{p.birthDate}</TableCell>

                                        <TableCell align="right">
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{justifyContent:"flex-end"}}
                                            >
                                               
                                                <IconButton
                                                    color="success"
                                                    onClick={() => navigate(`/patients/${p.id}`)}
                                                    title="view"
                                                >
                                                    <VisibilityIcon/>
                                                </IconButton>

                                                <IconButton
                                                    color="primary"
                                                    onClick={() => setEditing(p)}
                                                    title="Modifier"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                
                                                {user?.role ==="admin" && (
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => remove(p)}
                                                        title="Supprimer"
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!data.items.length && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            aucun patient trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Stack
                    direction="row"
                    spacing={3}
                    sx={{mt:3, justifyContent:"space-between", alignItems:"center"}}
                >
                    <Button
                        variant="outlined"
                        disabled={page <=1 || loading}
                        onClick={() => setPage((prev) => prev -1)}
                    >
                        Précédent
                    </Button>
                    
                    <Typography>
                        Page {page} / {data.totalPages}
                    </Typography>
                    
                    <Button
                        variant="outlined"
                        disabled={page >= data.totalPages || loading}
                        onClick={() => setPage((prev) => prev + 1)}
                    >
                        Suivant
                    </Button>
                </Stack>
                {
                    editing !== null && (
                        <PatientForm
                            patient={editing.id ? editing : null}
                            onClose={() => setEditing(null)}
                            onSaved={handleSaved}
                        />
                    )
                }
        </Box>
    );
}