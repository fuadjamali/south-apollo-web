"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { IconRotate, IconRotate2 } from "@tabler/icons-react";
import { getCroppedImageBlob, minZoomForRotation } from "@/lib/cropImage";
import { ASPECT_RATIOS } from "@/lib/photoAspectRatios";

const RATIO_KEYS = Object.keys(ASPECT_RATIOS);

function normalizeRotation(deg) {
  return ((deg % 360) + 360) % 360;
}

// Crop + straighten step shown before a selected file is uploaded — used by every admin
// image/photo field (components/ImageFileInput.js for the 11 single-image forms,
// components/ProductPhotoManager.js for the product photo gallery). Only the final
// cropped/rotated result ever reaches the server; `onUseOriginal` bypasses all of this and
// passes the picked file through untouched. `onSkip` is optional — only meaningful for a
// multi-file queue (Products) where "skip" means "don't add this one at all", not "use
// uncropped" (that's what onUseOriginal is for).
export default function ImageCropModal({ imageSrc, fileName, onDone, onUseOriginal, onSkip }) {
  const [ratioKey, setRatioKey] = useState("1:1");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [baseRotation, setBaseRotation] = useState(0); // 0/90/180/270, from the rotate buttons
  const [fineRotation, setFineRotation] = useState(0); // -45..45, from the straighten slider
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const totalRotation = normalizeRotation(baseRotation + fineRotation);
  const aspectValue = ASPECT_RATIOS[ratioKey].value;
  const minZoom = minZoomForRotation(totalRotation, aspectValue);

  // Whenever rotation or the aspect ratio changes, the safe minimum zoom can move — if the
  // current zoom would now leave a gap at the crop box's corners, bump it up to the new
  // minimum. This is what guarantees full coverage at any angle, including the ±45° extreme,
  // rather than just clamping the slider's floor (which wouldn't fix a zoom chosen before the
  // rotation changed).
  useEffect(() => {
    setZoom((prev) => Math.max(prev, minZoom));
  }, [minZoom]);

  const handleCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function changeRatio(key) {
    setRatioKey(key);
    setCrop({ x: 0, y: 0 });
  }

  function rotateBy(delta) {
    setBaseRotation((prev) => normalizeRotation(prev + delta));
  }

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, totalRotation);
      onDone(blob, ratioKey);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-xl bg-surface p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Crop photo</h2>
          <p className="truncate text-xs text-muted" title={fileName}>
            {fileName}
          </p>
        </div>

        <div className="mt-3 flex gap-2">
          {RATIO_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => changeRatio(key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                ratioKey === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-surface-alt"
              }`}
            >
              {ASPECT_RATIOS[key].label}
            </button>
          ))}
        </div>

        <div className="relative mt-3 h-72 w-full overflow-hidden rounded-lg bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={totalRotation}
            aspect={aspectValue}
            minZoom={minZoom}
            maxZoom={4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Rotate</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => rotateBy(-90)}
                  aria-label="Rotate left 90 degrees"
                  className="rounded-md border border-border p-1.5 text-foreground hover:bg-surface-alt"
                >
                  <IconRotate2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => rotateBy(90)}
                  aria-label="Rotate right 90 degrees"
                  className="rounded-md border border-border p-1.5 text-foreground hover:bg-surface-alt"
                >
                  <IconRotate size={16} />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              Straighten
              <span className="text-muted">{fineRotation}°</span>
            </label>
            <input
              type="range"
              min={-45}
              max={45}
              step={1}
              value={fineRotation}
              onChange={(e) => setFineRotation(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              Zoom
            </label>
            <input
              type="range"
              min={minZoom}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Skip this photo
            </button>
          )}
          <button
            type="button"
            onClick={onUseOriginal}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-alt"
          >
            Use original, uncropped
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {processing ? "Processing…" : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
