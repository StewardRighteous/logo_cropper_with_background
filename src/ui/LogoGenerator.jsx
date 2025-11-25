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
      <div ref={imagePrintable} className="logo">
        <img
          className="circle"
          src={image}
          alt=""
          style={{
            backgroundColor: color,
            borderColor: color,
            borderWidth: border,
          }}
        />
        <div
          className="circle"
          style={{
            backgroundColor: color,
            borderColor: color,
            borderWidth: border,
          }}
        ></div>
      </div>

      <button onClick={handlePrint} id="printbutton">
        Print
      </button>
    </>
  );
}
