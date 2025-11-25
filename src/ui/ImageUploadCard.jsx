import { useState } from "react";

export default function ImageUploadCard() {
  const [image, setImage] = useState(null);

  if (image != null) {
    return (
      <>
        <button onClick={() => setImage(null)}>Remove Image</button>
        <img src={image} alt="" />
      </>
    );
  } else {
    return (
      <>
        <h1>Step 1: Upload your Image</h1>
        <label htmlFor="image-upload">
          <p>Drag & Drop Image Here</p>
          <p>Or click the button below to browse your files</p>
        </label>
        <input
          type="file"
          name="image-upload"
          id="image-upload"
          onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
        />
      </>
    );
  }
}
