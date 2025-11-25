export default function getCroppedImgCircle(imageSrc, pixelCrop) {
  const canvas = document.createElement("canvas");
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const diameter = Math.min(pixelCrop.width, pixelCrop.height);
      canvas.width = diameter;
      canvas.height = diameter;

      const ctx = canvas.getContext("2d");

      // Create circular clipping mask
      ctx.beginPath();
      ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Draw cropped square inside circular mask
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        diameter,
        diameter,
        0,
        0,
        diameter,
        diameter
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject("Canvas empty");
          return;
        }
        blob.name = "circle.png";
        resolve(blob);
      }, "image/png"); // PNG supports transparency
    };

    image.onerror = () => reject("Failed to load image");
    image.src = imageSrc;
  });
}
