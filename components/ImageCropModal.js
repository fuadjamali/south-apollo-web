"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";
import { ASPECT_RATIOS } from "@/lib/photoAspectRatios";

const RATIO_KEYS = Object.keys(ASPECT_RATIOS);

// Crop + rotate step shown before a selected file is uploaded (see
// components/ProductPhotoManager.js) — only the final cropped/rotated result ever reaches the
// server. One file at a time: `onDone` is called with the resulting Blob and the chosen ratio
// key, `onSkip` cancels just this file (multi-file selections move on to the next one).
export default function ImageCropModal({ imageSrc, fileName, onDone, onSkip }) {
  const [ratioKey, setRatioKey] = useState("1:1");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function changeRatio(key) {
    setRatioKey(key);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation);
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
            rotation={rotation}
            aspect={ASPECT_RATIOS[ratioKey].value}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-foreground">
              Rotate
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-alt"
          >
            Skip this photo
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
