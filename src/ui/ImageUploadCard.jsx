export default function ImageUploadCard() {
  return (
    <>
      <h1>Step 1: Upload your Image</h1>
      <label htmlFor="image-upload">
        <p>Drag & Drop Image Here</p>
        <p>Or click the button below to browse your files</p>
      </label>
      <input type="file" name="image-upload" id="image-upload" />
    </>
  );
}
