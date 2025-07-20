import { createTheme } from "@mui/material";

const createRoomButtonTheme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "createroom" },
          style: {
            paddingTop: 8,
            paddingBottom: 8,
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 4,
            borderColor: "#e0e0e0",
            backgroundColor: "white",
            '&.Mui-disabled': {
              backgroundColor: "#f5f5f5",
              opacity: 0.5,
              cursor: "not-allowed",
              pointerEvents: "none",
            },
            '&:hover': {
              backgroundColor: "#f0f0f0",
            },
          },
        },
      ],
    },
  },
});

export default createRoomButtonTheme;