import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBody = styled("div")({
  textAlign: "center",
  padding: 2,
  backgroundColor: "#f9f9f9",
  minHeight: "100vh",
});

const StyledHeader = styled("header")({
  backgroundColor: "#ffffff",
  padding: 2,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  marginBottom: 4,
});

const StyledTitle = styled(Typography)({
  marginBottom: 2,
  color: "#333333",
  fontWeight: 600,
});

const StyledDescription = styled(Typography)({
  marginBottom: 2,
  color: "#666666",
});

const StyledImage = styled("img")({
  width: "100%",
  height: "auto",
  maxWidth: "500px",
  marginTop: 2,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
});

const StyledInput = styled("input")({
  display: "none",
});

const StyledButton = styled(Button)({
  margin: 10,
  backgroundColor: "blue",
  // Add hover effect
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const StyledFooter = styled("footer")({
  marginTop: 4,
  color: "#666666",
});

function App() {
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("image", selectedImage);

    // fetch the image from the backend via localhost
    fetch("/object_detection", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setImage(imageUrl);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <StyledBody>
      <StyledHeader>
        <StyledTitle variant="h4">Object Detection App</StyledTitle>
        <StyledDescription variant="subtitle1">
          Select an image and detect objects in it.
        </StyledDescription>
      </StyledHeader>
      <StyledInput
        accept="image/*"
        id="image-input"
        type="file"
        onChange={handleImageChange}
        hidden={true}
      />
      <label htmlFor="image-input">
        <StyledButton variant="contained" color="primary" component="span">
          Select Image
        </StyledButton>
      </label>
      {selectedImage && (
        // show image preview here
        <div variant="block">
          <StyledImage
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            variant="block"
          />
          <div variant="block">
            <StyledButton
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!selectedImage}
            >
              Detect!
            </StyledButton>
          </div>
        </div>
      )}
      {image && selectedImage && (
        <Box display="flex" justifyContent="center">
          <StyledImage src={image} alt="Uploaded" />
        </Box>
      )}
      <StyledFooter>
        <Typography variant="caption">Powered by React and MUI.</Typography>
      </StyledFooter>
    </StyledBody>
  );
}
export default App;
