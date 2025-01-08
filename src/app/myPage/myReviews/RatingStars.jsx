import React from "react";
import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const RatingStars = ({ rating }) => {
    const totalStars = 5; // 별의 총 개수
    return (
        <Box display="flex" alignItems="center">
        {Array.from({ length: totalStars }).map((_, index) => (
            index < rating ? (
            <StarIcon key={index} style={{ color: "#FFD700" }} /> // 채워진 별
            ) : (
            <StarBorderIcon key={index} style={{ color: "#FFD700" }} /> // 빈 별
            )
        ))}
        <Typography variant="body2" ml={1}>
            {rating} / {totalStars}
        </Typography>
        </Box>
    );
};

export default RatingStars;
