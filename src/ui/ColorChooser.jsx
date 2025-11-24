import { useState } from "react";

export default function ColorChooser() {
  const [color, setColor] = useState("#ffffff");
  const [borderSize, setBorderSize] = useState(8);

  const handlePick = async () => {
    if (!window.EyeDropper) {
      alert("EyeDropper not supported in this browser");
      return;
    }
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    setColor(result.sRGBHex);
  };

  return (
    <>
      <h1>Step 2: Customize your Border </h1>
      <label htmlFor="border-color">Border Color</label>
      <input
        type="color"
        name="border-color"
        id="border-color"
        value={color}
        onChange={(e) => setColor(e.target.color)}
      />
      <label htmlFor="border-thickness">Border Thickness </label>
      <input
        type="number"
        id="border-thickness-value"
        value={borderSize}
        onChange={(e) => setBorderSize(e.target.value)}
      />
      <input
        type="range"
        name="border-thickness"
        id="border-thickness"
        min={0}
        max={64}
        value={borderSize}
        onChange={(e) => setBorderSize(e.target.value)}
      />
      <button onClick={handlePick}>Pick Color</button>
    </>
  );
}
