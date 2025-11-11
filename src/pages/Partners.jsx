import {
  Add as AddIcon,
  Business,
  LocalShipping,
  Person,
  Store,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Partners = () => {
  const { t } = useTranslation();

  const partnerTypes = [
    {
      label: t("partners.partner_types.supplier"),
      count: 45,
      icon: Store,
      color: "#4caf50",
    },
    {
      label: t("partners.partner_types.customer"),
      count: 128,
      icon: Person,
      color: "#2196f3",
    },
    {
      label: t("partners.partner_types.carrier"),
      count: 12,
      icon: LocalShipping,
      color: "#ff9800",
    },
    {
      label: t("partners.partner_types.vendor"),
      count: 8,
      icon: Business,
      color: "#9c27b0",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {t("partners.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("partners.partner_list")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ px: 3 }}>
          {t("partners.new_partner")}
        </Button>
      </Box>

      {/* Partner Types Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {partnerTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <CardContent>
                  <Icon sx={{ fontSize: 40, mb: 1, color: type.color }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {type.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Partners List Placeholder */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("partners.partner_list")}
        </Typography>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Business sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("common.loading")}...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách đối tác sẽ được hiển thị ở đây
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Partners;
