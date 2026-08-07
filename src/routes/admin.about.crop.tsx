import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/admin/about/crop")({ component: AdminAboutCrop });

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function AdminAboutCrop() {
  const [imageUrl, setImageUrl] = useState("");
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [displayWidth, setDisplayWidth] = useState(0);
  const [displayHeight, setDisplayHeight] = useState(0);
  const [cropCenterX, setCropCenterX] = useState(50);
  const [cropCenterY, setCropCenterY] = useState(50);
  const [cropSizePercent, setCropSizePercent] = useState(80);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ left: number; top: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const image = params.get("image") || "";
    const x = Number(params.get("x") ?? "50");
    const y = Number(params.get("y") ?? "50");

    setImageUrl(image);
    setCropCenterX(clamp(Number.isFinite(x) ? x : 50, 0, 100));
    setCropCenterY(clamp(Number.isFinite(y) ? y : 50, 0, 100));
  }, []);

  const cropDimensions = useMemo(() => {
    const width = displayWidth;
    const height = displayHeight;
    const side = Math.min(width, height) * (cropSizePercent / 100);
    const left = clamp((cropCenterX / 100) * width - side / 2, 0, width - side);
    const top = clamp((cropCenterY / 100) * height - side / 2, 0, height - side);
    return { width: side, height: side, left, top };
  }, [cropCenterX, cropCenterY, cropSizePercent, displayWidth, displayHeight]);

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) return;

    setNaturalWidth(image.naturalWidth);
    setNaturalHeight(image.naturalHeight);
    setDisplayWidth(image.clientWidth);
    setDisplayHeight(image.clientHeight);
    setImageLoaded(true);
  };

  const updateBoxFromPointer = (clientX: number, clientY: number) => {
    if (!dragOrigin || !imageRef.current) return;
    const imageRect = imageRef.current.getBoundingClientRect();
    const dx = clientX - dragStart!.x;
    const dy = clientY - dragStart!.y;
    const nextLeft = clamp(dragOrigin.left + dx, 0, displayWidth - cropDimensions.width);
    const nextTop = clamp(dragOrigin.top + dy, 0, displayHeight - cropDimensions.height);
    const nextCenterX = ((nextLeft + cropDimensions.width / 2) / displayWidth) * 100;
    const nextCenterY = ((nextTop + cropDimensions.height / 2) / displayHeight) * 100;
    setCropCenterX(nextCenterX);
    setCropCenterY(nextCenterY);
  };

  const handleBoxPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageLoaded) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setDragStart({ x: event.clientX, y: event.clientY });
    setDragOrigin({ left: rect.left - imageRef.current!.getBoundingClientRect().left, top: rect.top - imageRef.current!.getBoundingClientRect().top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleBoxPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart || !dragOrigin) return;
    event.preventDefault();
    updateBoxFromPointer(event.clientX, event.clientY);
  };

  const handleBoxPointerUp = () => {
    setDragStart(null);
    setDragOrigin(null);
  };

  const handleCrop = async () => {
    if (!imageLoaded || !naturalWidth || !naturalHeight) return;

    const canvas = document.createElement("canvas");
    const previewSide = 600;
    canvas.width = previewSide;
    canvas.height = previewSide;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imageRef.current) return;

    const naturalSide = Math.min(naturalWidth, naturalHeight) * (cropSizePercent / 100);
    const cropX = clamp(Math.round((cropCenterX / 100) * naturalWidth - naturalSide / 2), 0, naturalWidth - naturalSide);
    const cropY = clamp(Math.round((cropCenterY / 100) * naturalHeight - naturalSide / 2), 0, naturalHeight - naturalSide);

    ctx.drawImage(imageRef.current, cropX, cropY, naturalSide, naturalSide, 0, 0, previewSide, previewSide);
    const croppedImageDataUrl = canvas.toDataURL("image/png");

    window.opener?.postMessage(
      {
        type: "about-crop-result",
        croppedImageDataUrl,
        profile_image_position_x: 50,
        profile_image_position_y: 50,
      },
      window.location.origin,
    );

    window.close();
  };

  if (!imageUrl) {
    return (
      <PageLayout>
        <section style={{ padding: "40px 5% 96px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="section-label">Crop images</div>
            <h1 className="section-title">Crop Image</h1>
            <div style={{ padding: 24, borderRadius: 20, background: "var(--dusk)", border: "1px solid var(--border)" }}>
              <p style={{ margin: 0, color: "var(--muted)" }}>No image URL provided. Open the crop window from the admin About page.</p>
            </div>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section style={{ padding: "40px 5% 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 24 }}>
          <div>
            <div className="section-label">Crop images</div>
            <h1 className="section-title">Crop About Profile Image</h1>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <strong style={{ color: "var(--forest)" }}>Drag the square to choose your final crop</strong>
                <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Release to update position.</span>
              </div>
              <div style={{ display: "grid", gap: 12, width: "100%" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: 820, margin: "0 auto" }}>
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Image to crop"
                    onLoad={handleImageLoad}
                    style={{ width: "100%", display: "block", borderRadius: 24, filter: imageLoaded ? "none" : "blur(1px)" }}
                  />
                  {imageLoaded ? (
                    <div
                      ref={boxRef}
                      style={{
                        position: "absolute",
                        left: cropDimensions.left,
                        top: cropDimensions.top,
                        width: cropDimensions.width,
                        height: cropDimensions.height,
                        border: "3px solid rgba(255,255,255,0.95)",
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                        borderRadius: 18,
                        cursor: "grab",
                        touchAction: "none",
                      }}
                      onPointerDown={handleBoxPointerDown}
                      onPointerMove={handleBoxPointerMove}
                      onPointerUp={handleBoxPointerUp}
                      onPointerLeave={handleBoxPointerUp}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14, maxWidth: 720 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontWeight: 600, color: "var(--forest)" }}>Crop size</label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={cropSizePercent}
                  onChange={(event) => setCropSizePercent(Number(event.target.value))}
                />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontWeight: 600, color: "var(--forest)" }}>Horizontal position</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cropCenterX}
                  onChange={(event) => setCropCenterX(Number(event.target.value))}
                />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontWeight: 600, color: "var(--forest)" }}>Vertical position</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cropCenterY}
                  onChange={(event) => setCropCenterY(Number(event.target.value))}
                />
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn-primary" onClick={handleCrop}>
                  Apply cropped image
                </button>
                <button type="button" className="btn-outline" onClick={() => window.close()}>
                  Cancel
                </button>
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
                This window creates a cropped square image and sends it back to the parent admin page with the final selection.
              </div>
            </div>
          </div>
          {error ? <div style={{ color: "var(--red)", fontWeight: 600 }}>{error}</div> : null}
        </div>
      </section>
    </PageLayout>
  );
}
