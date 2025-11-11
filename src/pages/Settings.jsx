import {
  Edit as EditIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: "light",
    language: "vi",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    autoSave: true,
    dataRetention: "1year",
  });

  const [editingField, setEditingField] = useState(null);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    setSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }));
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // Logic save settings sẽ được implement sau
    setEditingField(null);
  };

  const settingSections = [
    {
      id: "appearance",
      title: "Giao diện",
      icon: <PaletteIcon />,
      settings: [
        {
          key: "theme",
          label: "Chế độ tối",
          type: "switch",
          value: settings.theme === "dark",
        },
      ],
    },
    {
      id: "language",
      title: "Ngôn ngữ",
      icon: <LanguageIcon />,
      settings: [
        {
          key: "language",
          label: "Ngôn ngữ hệ thống",
          type: "select",
          value: settings.language,
          options: [
            { value: "vi", label: "Tiếng Việt" },
            { value: "en", label: "English" },
          ],
        },
      ],
    },
    {
      id: "notifications",
      title: "Thông báo",
      icon: <NotificationsIcon />,
      settings: [
        {
          key: "email",
          label: "Thông báo qua email",
          type: "switch",
          value: settings.notifications.email,
          parent: "notifications",
        },
        {
          key: "push",
          label: "Thông báo push",
          type: "switch",
          value: settings.notifications.push,
          parent: "notifications",
        },
        {
          key: "sms",
          label: "Thông báo SMS",
          type: "switch",
          value: settings.notifications.sms,
          parent: "notifications",
        },
      ],
    },
    {
      id: "data",
      title: "Dữ liệu",
      icon: <StorageIcon />,
      settings: [
        {
          key: "autoSave",
          label: "Tự động lưu",
          type: "switch",
          value: settings.autoSave,
        },
        {
          key: "dataRetention",
          label: "Thời gian lưu trữ dữ liệu",
          type: "select",
          value: settings.dataRetention,
          options: [
            { value: "6months", label: "6 tháng" },
            { value: "1year", label: "1 năm" },
            { value: "2years", label: "2 năm" },
            { value: "forever", label: "Vĩnh viễn" },
          ],
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Cài đặt hệ thống
        </Typography>

        <Grid container spacing={3}>
          {settingSections.map((section, sectionIndex) => (
            <Grid item xs={12} md={6} key={section.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
              >
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box sx={{ mr: 2, color: "primary.main" }}>
                        {section.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <List>
                      {section.settings.map((setting, settingIndex) => (
                        <ListItem key={setting.key} sx={{ px: 0 }}>
                          <ListItemText
                            primary={setting.label}
                            secondary={
                              setting.type === "select" && setting.options
                                ? setting.options.find(
                                    (opt) => opt.value === setting.value,
                                  )?.label
                                : undefined
                            }
                          />
                          <ListItemSecondaryAction>
                            {setting.type === "switch" ? (
                              <Switch
                                checked={setting.value}
                                onChange={(e) => {
                                  if (setting.parent) {
                                    handleNestedSettingChange(
                                      setting.parent,
                                      setting.key,
                                      e.target.checked,
                                    );
                                  } else {
                                    handleSettingChange(
                                      setting.key,
                                      e.target.checked,
                                    );
                                  }
                                }}
                              />
                            ) : setting.type === "select" ? (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {editingField === setting.key ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <TextField
                                      select
                                      size="small"
                                      value={setting.value}
                                      onChange={(e) => {
                                        if (setting.parent) {
                                          handleNestedSettingChange(
                                            setting.parent,
                                            setting.key,
                                            e.target.value,
                                          );
                                        } else {
                                          handleSettingChange(
                                            setting.key,
                                            e.target.value,
                                          );
                                        }
                                      }}
                                      sx={{ minWidth: 120 }}
                                    >
                                      {setting.options.map((option) => (
                                        <MenuItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    <IconButton
                                      size="small"
                                      onClick={handleSave}
                                    >
                                      <SaveIcon />
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingField(setting.key)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                )}
                              </Box>
                            ) : null}
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={2} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Lưu cài đặt
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lưu tất cả các thay đổi cài đặt
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Lưu cài đặt
            </Button>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Settings;
