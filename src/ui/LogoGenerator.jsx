import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function LogoGenerator({ image, border, color }) {
  const imagePrintable = useRef();

  const handlePrint = useReactToPrint({
    contentRef: imagePrintable,
    documentTitle: "Logo",
  });

  return (
    <>
      <div className="logo-generator">
        <div ref={imagePrintable} className="logo">
          <img className="circle-front" src={image} alt="" />
          <img className="circle-back" src={image} alt="" />
        </div>
        <div
          className="circle"
          style={{
            backgroundColor: color,
            borderColor: color,
            borderWidth: border,
          }}
        ></div>
        <button onClick={handlePrint} id="printbutton">
          Print
        </button>
      </div>
    </>
  );
}
