import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

type ModernPageLayoutProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const ModernPageLayout: React.FC<ModernPageLayoutProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          {typeof title === 'string' ? (
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          ) : (
            title
          )}
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Box>

      <Box>{children}</Box>
    </Stack>
  );
};

export { ModernPageLayout };
