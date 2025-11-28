import { useState } from "react";
import Cropper from "react-easy-crop";
import {
  getCroppedImgCircle,
  getCroppedImgSquare,
} from "../utils/getCroppedImage";

export default function ImageUploadCard({
  setImageCropped,
  cropShape,
  setCropShape,
}) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCrop = async () => {
    try {
      let croppedImageBlob;
      if (cropShape == "round") {
        croppedImageBlob = await getCroppedImgCircle(image, croppedAreaPixels);
      } else {
        croppedImageBlob = await getCroppedImgSquare(image, croppedAreaPixels);
      }

      const croppedImageURL = URL.createObjectURL(croppedImageBlob);

      setImageCropped(croppedImageURL);
    } catch (err) {
      console.error(err);
    }
  };

  if (image != null) {
    return (
      <>
        <div className="image-upload">
          <label htmlFor="shape">
            Choose Shape:{" "}
            <select
              name="shape"
              id="shape"
              value={cropShape}
              onChange={(e) => setCropShape(e.target.value)}
            >
              <option value="round">Circle</option>
              <option value="rect">Square</option>
            </select>
          </label>
          <button onClick={() => setImage(null)}>Remove Image</button>
          <div className="crop-container">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape={cropShape}
            />
          </div>
          <label htmlFor="zoom-level">
            Zoom:
            <input
              type="range"
              name="zoom-level"
              id="zoom-level"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <button onClick={handleCrop}>Crop & Save</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="image-upload">
        <h1>Upload your Image</h1>
        <div className="upload-drop">
          <label htmlFor="image-upload">
            Click the button below to browse your files
          </label>
          <input
            type="file"
            name="image-upload"
            id="image-upload"
            accept="image/*"
            onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
          />
        </div>
      </div>
    </>
  );
}
