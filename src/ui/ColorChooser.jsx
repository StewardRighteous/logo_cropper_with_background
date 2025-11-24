export default function ColorChooser() {
  return (
    <>
      <h1>Step 2: Customize your Border </h1>
      <label htmlFor="border-color">Border Color</label>
      <input type="color" name="border-color" id="border-color" />
      <label htmlFor="border-thickness">Border Thickness</label>
      <input type="range" name="border-thickness" id="border-thickness" />
    </>
  );
}
