import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function LogoGenerator({ image }) {
  const imagePrintable = useRef();

  const handlePrint = useReactToPrint({
    contentRef: imagePrintable,
    documentTitle: "Logo",
  });

  return (
    <>
      <div ref={imagePrintable} className="flex flex-col justify-items-center">
        <img className="circle" src={image} alt="" />
        <div className="circle"></div>
      </div>

      <button onClick={handlePrint}>Print</button>
    </>
  );
}
