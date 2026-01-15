import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function Loading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CircularProgress size={24} sx={{ color: "white" }} />
    </Box>
  );
}

export default Loading;