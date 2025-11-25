export default function getCornerColor(imageSrc) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, 1, 1);

      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;

      resolve({ r, g, b, a, hex });
    };

    image.onerror = () => reject("Failed to read image.");
    image.src = imageSrc;
  });
}
