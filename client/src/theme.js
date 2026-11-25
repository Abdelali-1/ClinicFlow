import { createTheme } from "@mui/material/styles";

export default createTheme({
  palette: {
    primary: { main: "#2563eb" },
    background: { default: "#f4f6f8" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    h4: { fontWeight: 700 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(0,0,0,.08)" } } },
  },
});