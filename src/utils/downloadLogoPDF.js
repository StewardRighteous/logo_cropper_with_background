import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Helper: Pre-processes an image to bake in a Gaussian blur.
 * This function relies on the image source being proxied through Vercel,
 * which ensures the necessary 'Access-Control-Allow-Origin: *' header is present.
 *
 * @param {string} src - Image source (expected to be a local or proxied URL)
 * @param {number} blurAmount - Desired blur in CSS pixels (e.g., 5)
 * @param {number} displayWidth - The rendered width of the element (to scale blur correctly)
 * @returns {Promise<string>} DataURL of the blurred image
 */
const getBlurredImage = async (src, blurAmount, displayWidth) => {
  if (!blurAmount || blurAmount <= 0) return src;

  return new Promise((resolve) => {
    const img = new Image();
    // This header is now reliable because the Vercel proxy provides the correct CORS header.
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        // Calculate scale: If image is high-res, blur needs to be scaled up.
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
          // Using the optimized blur factor for visibility.
          const downscaleFactor = Math.max(0.03, 1 / (1 + scaledBlur / 5));

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

        // Because the source is now same-origin (via proxy), this should succeed.
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn(
          "downloadLogoPDF: Blur failed during canvas operation, using original source.",
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

  // 2. CONSTRUCT THE PROXY URL
  // CRITICAL STEP: Route the external image URL through your Vercel function.
  const proxiedImageSrc = `/api/image-proxy?url=${encodeURIComponent(
    imageSrc
  )}`;

  // 3. Pre-calculate blurred image using the proxied source
  let finalBackSrc = proxiedImageSrc;

  if (blurLevel > 0) {
    try {
      // Use the proxied URL for blurring
      finalBackSrc = await getBlurredImage(
        proxiedImageSrc,
        blurLevel,
        element.offsetWidth
      );
    } catch (e) {
      console.warn(
        "Blur generation failed, proceeding with original proxied image.",
        e
      );
    }
  }

  // 4. Capture with html2canvas
  try {
    const canvas = await html2canvas(element, {
      scale: 4, // High resolution
      // We must keep useCORS: true because the proxy sets the CORS header.
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        let backImg = clonedDoc.querySelector(".back");

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
          // Ensure no CSS filter conflicts
          backImg.style.filter = "none";
          backImg.style.webkitFilter = "none";
        }
      },
    });

    const imgData = canvas.toDataURL("image/png");

    // 5. Generate PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageSizeMM, pageSizeMM],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pageSizeMM, pageSizeMM);
    pdf.save("PrintCopy.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Removed alert() as per environment guidelines
  }
}
