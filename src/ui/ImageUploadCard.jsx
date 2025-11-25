import { useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/getCroppedImage";

export default function ImageUploadCard({ setImageCropped }) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      const croppedImageURL = URL.createObjectURL(croppedImageBlob);

      setImageCropped(croppedImageURL);
    } catch (err) {
      console.error(err);
    }
  };

  if (image != null) {
    return (
      <>
        <button onClick={() => setImage(null)}>Remove Image</button>

        <div
          className="crop-container"
          style={{ height: "500px", width: "500px", position: "relative" }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round"
          />
        </div>
        <button onClick={handleCrop} style={{ marginTop: "20px" }}>
          Crop & Save
        </button>
      </>
    );
  }

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
        accept="image/*"
        onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
      />
    </>
  );
}
