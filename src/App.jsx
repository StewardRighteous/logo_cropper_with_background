import { ImageUploadCard, ColorChooser, LogoGenerator } from "./ui/barrel";
import { useState } from "react";

function App() {
  const [imageCropped, setImageCropped] = useState(null);

  return (
    <>
      <div className="app">
        <header>
          <h1>Circle Profile Generator</h1>
        </header>
        <ImageUploadCard setImageCropped={setImageCropped}></ImageUploadCard>
        <ColorChooser imageCropped={imageCropped}></ColorChooser>
      </div>
    </>
  );
}

export default App;
