import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import getDominantColor from "../utils/getDominantColor";
import downloadLogoPDF from "../utils/downloadLogoPDF";

export default function LogoGenerator({ imageCropped, cropShape }) {
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

  const handleDownload = () => {
    downloadLogoPDF(imagePrintable.current, cropShape, imageCropped, blurLevel);
  };

  const handlePrint = useReactToPrint({
    contentRef: imagePrintable,
    documentTitle: "Print Copy",
    pageStyle:
      cropShape == "round"
        ? `
      @page{
        size: 10.842cm 10.842cm;
        margin: 0;
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
      } `
        : `@page{
        size: 105.833mm 105.833mm;
        margin: 0;
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
      } ;
    `,
  });

  return (
    <>
      <div className="logo-generator">
        <h1>Customize Logo</h1>
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
        <button onClick={handleDownload} id="downloadbutton">
          Download
        </button>
        <div className="printable" ref={imagePrintable}>
          <div
            className="logo"
            style={{
              width: cropShape === "round" ? "10.842cm" : "105.833mm",
              height: cropShape === "round" ? "10.842cm" : "105.833mm",
            }}
          >
            <div
              className="circle"
              style={{
                backgroundColor: color,
              }}
            ></div>
            <img
              className="front"
              src={imageCropped}
              alt=""
              style={{
                borderRadius: cropShape == "round" ? "283px" : "6.194mm",
                height: cropShape == "round" ? "10cm" : "90mm",
                width: cropShape == "round" ? "10cm" : "90mm",
              }}
            />
            <img
              className="back"
              src={imageCropped}
              alt=""
              style={{
                filter: `blur(${blurLevel}px)`,
                borderRadius: cropShape == "round" ? "307px" : "6.194mm",
                height:
                  cropShape == "round" ? "calc(10.842cm - 1pt)" : "98.42mm",
                width:
                  cropShape == "round" ? "calc(10.842cm - 1pt)" : "98.42mm",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
