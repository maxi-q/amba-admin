import { createTheme } from "@mui/material";

const listItemTextTheme = createTheme({
  components: {
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: 16,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
    },
  },
});

export default listItemTextTheme;