import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import {
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, useMediaQuery, useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LogoutIcon from "@mui/icons-material/Logout";

const DRAWER_WIDTH = 240;

const ROLE_LABEL = { admin: "Administrateur", staff: "Personnel" };

export default function Layout({ children }) {
  const { user, logOut } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Tableau de bord", path: "/", icon: <DashboardIcon /> },
    { label: "Patients", path: "/patients", icon: <PeopleIcon /> },
    { label: "Rendez-vous", path: "/appointments", icon: <EventIcon /> },
  ];

  const sidebar = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar />
      <List sx={{ p: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === "/"}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&.active": {
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
                "& .MuiListItemIcon-root": { color: "white" },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* TOP BAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "white",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          {isMobile && (
            <IconButton
                onClick={() => setMobileOpen((prev) => !prev)}
                edge="start"
                sx={{ mr: 2 }}
            >
                <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h5" fontWeight="bold" color="primary">
            ClinicFlow
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* USER (bigger) */}
         <Box>
            <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                    maxWidth: { xs: 90, sm: 140 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}
            >
                {user?.fullName}
            </Typography>

            {!isMobile && (
                <Typography variant="body2" color="text.secondary">
                    {ROLE_LABEL[user?.role] || user?.role}
                </Typography>
            )}
        </Box>

          <Button
            color="inherit"
            size="large"
            startIcon={<LogoutIcon />}
            onClick={() => {
                const confirmed = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
                if(confirmed){
                    logOut();
                }
            }}
            sx={{ "& .MuiButton-startIcon": { mr: isMobile ? 0 : 1 } }}
          >
            {!isMobile && "Déconnexion"}
          </Button>
        </Toolbar>
      </AppBar>

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      {/* MOBILE SIDEBAR */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          {sidebar}
        </Drawer>
      )}

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 9, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}