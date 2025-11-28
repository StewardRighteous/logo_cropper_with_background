import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import getDominantColor from "../utils/getDominantColor";

export default function LogoGenerator({ imageCropped }) {
  const [imageSize, setImageSize] = useState(10.2);
  const [blurLevel, setBlurLevel] = useState(5);
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    if (!imageCropped) return;

    async function loadDominantColor() {
      const result = await getDominantColor(imageCropped);
      setColor(result.hex);
    }

    loadDominantColor();
  }, [imageCropped]);

  const imagePrintable = useRef();

  const handlePrint = useReactToPrint({
    contentRef: imagePrintable,
    documentTitle: "Print Copy",
    pageStyle: `
      @page{
        size: 10.842cm 10.842cm;
        margin: 0;
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
      }
    `,
  });

  return (
    <>
      <div className="logo-generator">
        <h1>Customize Logo</h1>
        <label htmlFor="border-size">
          Border:
          <input
            type="range"
            name="border-size"
            id="border-size"
            min={10.001}
            max={10.842}
            step={0.001}
            value={imageSize}
            onChange={(e) => setImageSize(Number(e.target.value))}
          />
        </label>
        <label htmlFor="blur-level">
          Blur:
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
            <div
              className="circle"
              style={{
                backgroundColor: color,
              }}
            ></div>
            <img className="circle-front" src={imageCropped} alt="" />
            <img
              className="circle-back"
              src={imageCropped}
              alt=""
              style={{
                filter: `blur(${blurLevel}px)`,
                width: `${imageSize}cm`,
                height: `${imageSize}cm`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
