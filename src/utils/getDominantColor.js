export default function getDominantColor(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 40;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);

      const { data } = ctx.getImageData(0, 0, size, size);

      const colorCount = {};
      let r, g, b, a;

      for (let i = 0; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];

        // ❗ skip transparent pixels (common in circular-cropped images)
        if (a === 0) continue;

        const key = `${r},${g},${b}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
      }

      let dominant = null;
      let maxCount = 0;

      for (const color in colorCount) {
        if (colorCount[color] > maxCount) {
          maxCount = colorCount[color];
          dominant = color;
        }
      }

      if (!dominant) {
        // fallback: use center pixel
        resolve({ r: 128, g: 128, b: 128, hex: "#808080" });
        return;
      }

      const [dr, dg, db] = dominant.split(",").map(Number);

      const hex = `#${((1 << 24) + (dr << 16) + (dg << 8) + db)
        .toString(16)
        .slice(1)}`;

      resolve({ r: dr, g: dg, b: db, hex });
    };

    img.onerror = () => reject("Error loading image.");
    img.src = imageSrc;
  });
}
