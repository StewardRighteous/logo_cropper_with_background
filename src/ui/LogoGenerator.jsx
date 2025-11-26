import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useState } from "react";

export default function LogoGenerator({ image, color }) {
  const [imageSize, setImageSize] = useState(400);
  const [blurLevel, setBlurLevel] = useState(5);

  const imagePrintable = useRef();

  const handlePrint = useReactToPrint({
    contentRef: imagePrintable,
    documentTitle: "Logo",
  });

  return (
    <>
      <div className="logo-generator">
        <h1>Customize Logo</h1>
        <label htmlFor="border-size">
          Border:{" "}
          <input
            type="range"
            name="border-size"
            id="border-size"
            min={50}
            max={500}
            value={imageSize}
            onChange={(e) => setImageSize(Number(e.target.value))}
          />
        </label>
        <label htmlFor="blur-level">
          Blur:{" "}
          <input
            type="range"
            name="blur-level"
            id="blur-level"
            value={blurLevel}
            onChange={(e) => setBlurLevel(Number(e.target.value))}
            min={1}
            max={20}
          />
        </label>
        <button onClick={handlePrint} id="printbutton">
          Print
        </button>
        <div className="printable" ref={imagePrintable}>
          <div className="logo">
            <img
              className="circle-front"
              src={image}
              alt=""
              style={{
                width: imageSize,
                height: imageSize,
              }}
            />
            <img
              className="circle-back"
              src={image}
              alt=""
              style={{ filter: `blur(${blurLevel}px)` }}
            />
          </div>
          <div
            className="circle"
            style={{
              backgroundColor: color,
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
