import { Box, Button, Typography } from "@mui/material";
import React from "react";

const TestComponent = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Component
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Nếu bạn thấy component này, nghĩa là ứng dụng đang hoạt động bình
        thường.
      </Typography>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </Box>
  );
};

export default TestComponent;
