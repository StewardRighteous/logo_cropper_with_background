import { ImageUploadCard, ColorChooser, LogoGenerator } from "./ui/barrel";
import { useState } from "react";

function App() {
  const [imageCropped, setImageCropped] = useState(null);

  return (
    <>
      <h1>Circle Profile Generator</h1>
      <ImageUploadCard setImageCropped={setImageCropped}></ImageUploadCard>
      <ColorChooser></ColorChooser>
      <LogoGenerator image={imageCropped}></LogoGenerator>
    </>
  );
}

export default App;
