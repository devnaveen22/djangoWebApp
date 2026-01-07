import { Alert, Snackbar } from "@mui/material";

export const AlertComp = ({ open, type, message, onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert
                severity={type}
                onClose={onClose}
                sx={{ 
                    borderRadius: 2,
                    minWidth: { xs: '90vw', sm: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};
