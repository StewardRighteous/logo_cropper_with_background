import { useState, useEffect } from "react";
import LogoGenerator from "./LogoGenerator";
import getDominantColor from "../utils/getDominantColor";

export default function ColorChooser({ imageCropped }) {
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    if (!imageCropped) return;

    async function loadDominantColor() {
      const result = await getDominantColor(imageCropped);
      setColor(result.hex);
    }

    loadDominantColor();
  }, [imageCropped]);

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
      <div className="color-choose">
        <h1>Customize your Border</h1>
        <div className="border-options">
          <div className="option">
            <label htmlFor="border-color">Border Color: </label>
            <input
              type="color"
              name="border-color"
              id="border-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <button onClick={handlePick}>Pick Color</button>
        </div>
      </div>

      <LogoGenerator image={imageCropped} color={color} />
    </>
  );
}
