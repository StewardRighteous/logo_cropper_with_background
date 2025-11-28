import { ImageUploadCard, LogoGenerator } from "./ui/barrel";
import { useState } from "react";

function App() {
  const [imageCropped, setImageCropped] = useState(null);
  const [cropShape, setCropShape] = useState("round");

  return (
    <>
      <div className="app">
        <header>
          <h1>Circle Profile Generator</h1>
        </header>
        <ImageUploadCard
          setImageCropped={setImageCropped}
          cropShape={cropShape}
          setCropShape={setCropShape}
        ></ImageUploadCard>
        <LogoGenerator imageCropped={imageCropped} />
      </div>
    </>
  );
}

export default App;
