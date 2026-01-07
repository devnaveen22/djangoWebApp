import { useTheme, useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getGridColumns = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };

  return { isMobile, isTablet, columns: getGridColumns() };
};