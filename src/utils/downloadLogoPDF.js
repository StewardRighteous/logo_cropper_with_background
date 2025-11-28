import html2canvas from "html2canvas";
import jsPDF from "jspdf";
/**
 * Helper: Pre-processes an image to bake in a Gaussian blur.
 * Uses native canvas filter if supported, falls back to a pixel-blur (downscale/upscale).
 * Adjusts blur radius based on image resolution to ensure visual consistency.
 *
 * @param {string} src - Image source
 * @param {number} blurAmount - Desired blur in CSS pixels (e.g., 5)
 * @param {number} displayWidth - The rendered width of the element (to scale blur correctly)
 * @returns {Promise<string>} DataURL of the blurred image
 */
const getBlurredImage = async (src, blurAmount, displayWidth) => {
  if (!blurAmount || blurAmount <= 0) return src;
  return new Promise((resolve) => {
    const img = new Image();
    // CRITICAL: Must set crossOrigin to 'anonymous' to avoid tainting the canvas,
    // which allows canvas.toDataURL() to be called. The server hosting the image
    // must return 'Access-Control-Allow-Origin: *' for the true Gaussian blur to work.
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;
        // Calculate scale: If image is high-res, blur needs to be scaled up.
        // This ensures a 5px blur looks like 5 CSS pixels of blur regardless of the source image size.
        const scale = displayWidth ? naturalWidth / displayWidth : 1;
        const scaledBlur = blurAmount * scale;
        const canvas = document.createElement("canvas");
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        const ctx = canvas.getContext("2d");
        // --- 1. Try native canvas filter (true Gaussian blur effect) ---
        if (ctx.filter !== undefined) {
          ctx.filter = `blur(${scaledBlur}px)`;
          // Draw image with the filter active
          ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        } else {
          // --- 2. Fallback: Pixel-blur (downscale + upscale) ---
          // This ensures a blur is still achieved even if ctx.filter is unsupported or fails.
          // Downscale factor (smaller = blurrier). Adjusted heuristic for smoother small blurs.
          const downscaleFactor = Math.max(
            0.03,
            Math.min(0.5, 1 / (1 + scaledBlur / 20))
          );
          const smallW = Math.max(
            1,
            Math.round(naturalWidth * downscaleFactor)
          );
          const smallH = Math.max(
            1,
            Math.round(naturalHeight * downscaleFactor)
          );
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = smallW;
          smallCanvas.height = smallH;
          const sctx = smallCanvas.getContext("2d");
          // Draw scaled down image
          sctx.drawImage(img, 0, 0, smallW, smallH);
          // Upscale into final canvas with smoothing enabled
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(smallCanvas, 0, 0, naturalWidth, naturalHeight);
        }
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        // If the canvas is tainted (due to CORS violation) after drawing, we can't extract data. Return original.
        console.warn(
          "downloadLogoPDF: Blur failed (likely CORS security error on toDataURL), using original.",
          err
        );
        resolve(src);
      }
    };
    img.onerror = () => {
      console.warn("downloadLogoPDF: Image failed to load.");
      resolve(src);
    };
  });
};
/**
 * Main utility: captures an element as PDF using html2canvas + jsPDF.
 * Bakes blur into the image data to ensure it appears in the PDF.
 *
 * @param {HTMLElement} element - The container / .printable DOM node to capture
 * @param {"round"|"square"} cropShape - used to set PDF page size (mm)
 * @param {string} imageSrc - original image source for the back layer
 * @param {number} blurLevel - blur amount in px
 * @returns {Promise<void>}
 */
export default async function downloadLogoPDF(
  element,
  cropShape,
  imageSrc,
  blurLevel = 5
) {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error("downloadLogoPDF: invalid element provided");
  }
  // 1. PDF PAGE SIZE (mm)
  const pageSizeMM = cropShape === "round" ? 108.42 : 105.833;
  // 2. Pre-calculate blurred image
  // html2canvas often ignores CSS filters, so we generate a blurred version of the image
  // manually and inject that into the screenshot.
  let finalBackSrc = imageSrc;
  if (blurLevel > 0) {
    try {
      // Use element width as proxy for display size
      finalBackSrc = await getBlurredImage(
        imageSrc,
        blurLevel,
        element.offsetWidth
      );
    } catch (e) {
      console.warn("Blur generation failed, proceeding with original", e);
    }
  }
  // 3. Capture with html2canvas
  try {
    const canvas = await html2canvas(element, {
      scale: 4, // High resolution
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        // html2canvas creates a clone of the document.
        // We find the .back element within this clone to swap the source.
        let backImg = clonedDoc.querySelector(".back");
        // If .back doesn't exist (e.g. transparent card), create it so we have a background
        if (!backImg) {
          const container =
            clonedDoc.querySelector(
              `.${element.className.split(" ").join(".")}`
            ) || clonedDoc.body.firstElementChild;
          if (container) {
            backImg = clonedDoc.createElement("img");
            backImg.className = "back";
            backImg.style.position = "absolute";
            backImg.style.top = "50%";
            backImg.style.left = "50%";
            backImg.style.transform = "translate(-50%, -50%)";
            backImg.style.objectFit = "cover";
            backImg.style.width = "100%";
            backImg.style.height = "100%";
            backImg.style.zIndex = "-1";
            container.insertBefore(backImg, container.firstChild);
          }
        }
        // Swap the source with our pre-blurred Data URL
        if (backImg) {
          backImg.src = finalBackSrc;
          // Ensure no CSS filter conflicts (since pixels are already blurred)
          backImg.style.filter = "none";
          backImg.style.webkitFilter = "none";
        }
      },
    });
    const imgData = canvas.toDataURL("image/png");
    // 4. Generate PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageSizeMM, pageSizeMM],
    });
    pdf.addImage(imgData, "PNG", 0, 0, pageSizeMM, pageSizeMM);
    pdf.save("PrintCopy.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Could not generate PDF. Please try again.");
  }
}
