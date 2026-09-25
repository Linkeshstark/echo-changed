import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { Eyebrow } from "./primitives";
import { Button } from "@/components/ui/button";

/* Employee photos are kept at a fixed 4:5 passport ratio.
   The stage below is what the operator frames; the canvas is what gets stored. */

const STAGE = { w: 320, h: 400 };
const OUT = { w: 480, h: 600 };
const K = STAGE.w / OUT.w;

type CropState = { zoom: number; rotation: number; dx: number; dy: number };

const reset: CropState = { zoom: 1, rotation: 0, dx: 0, dy: 0 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* Cover scale, accounting for rotation so the frame is never left with empty corners. */
function coverScale(iw: number, ih: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const rotW = iw * cos + ih * sin;
  const rotH = iw * sin + ih * cos;
  return Math.max(OUT.w / rotW, OUT.h / rotH);
}

function draw(canvas: HTMLCanvasElement, img: HTMLImageElement, s: CropState) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = coverScale(iw, ih, s.rotation) * s.zoom;
  canvas.width = OUT.w;
  canvas.height = OUT.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUT.w, OUT.h);
  ctx.save();
  ctx.translate(OUT.w / 2 + s.dx, OUT.h / 2 + s.dy);
  ctx.rotate((s.rotation * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
  ctx.restore();
}

export function PassportCropper({
  src,
  onCancel,
  onSave,
}: {
  src: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [state, setState] = useState<CropState>(reset);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);

  useEffect(() => {
    setState(reset);
    const el = new Image();
    el.onload = () => setImg(el);
    el.src = src;
    return () => {
      el.onload = null;
    };
  }, [src]);

  useEffect(() => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    draw(canvas, img, state);
    setPreview(canvas.toDataURL("image/jpeg", 0.9));
  }, [img, state]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, dx: state.dx, dy: state.dy };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = drag.current.dx + (e.clientX - drag.current.x) / K;
    const dy = drag.current.dy + (e.clientY - drag.current.y) / K;
    setState((s) => ({
      ...s,
      dx: clamp(dx, -OUT.w, OUT.w),
      dy: clamp(dy, -OUT.h, OUT.h),
    }));
  };

  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const rotate = (by: number) =>
    setState((s) => ({ ...s, rotation: (s.rotation + by + 360) % 360, dx: 0, dy: 0 }));

  const iw = img?.naturalWidth ?? 0;
  const ih = img?.naturalHeight ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-5 backdrop-blur-md animate-fade"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-enter w-full max-w-[520px] bg-background"
      >
        <div className="border-b border-border pb-5">
          <Eyebrow className="mb-3">Profile photo</Eyebrow>
          <h2 className="glyph-serif text-3xl text-foreground">Crop photo</h2>
        </div>

        <div className="py-8">
          <div className="grid gap-8 sm:grid-cols-[1fr_96px]">
            <div>
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="relative mx-auto select-none overflow-hidden border border-border bg-surface"
                style={{
                  width: STAGE.w,
                  height: STAGE.h,
                  maxWidth: "100%",
                  touchAction: "none",
                  cursor: dragging ? "grabbing" : "grab",
                }}
              >
                {img && (
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                    style={{
                      width: iw * K,
                      height: ih * K,
                      transform: `translate(-50%, -50%) translate(${state.dx * K}px, ${
                        state.dy * K
                      }px) rotate(${state.rotation}deg)`,
                    }}
                  />
                )}
                {/* rule-of-thirds guides */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-y-0 left-1/3 w-px bg-foreground/15" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-foreground/15" />
                  <div className="absolute inset-x-0 top-1/3 h-px bg-foreground/15" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-foreground/15" />
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Drag to position · fixed 4:5 passport ratio
              </p>
            </div>

            <div>
              <span className="eyebrow">Preview</span>
              <div
                className="mt-2 w-24 overflow-hidden border border-border bg-surface"
                style={{ aspectRatio: "4 / 5" }}
              >
                {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
              </div>
              <span className="eyebrow mt-6 block">4:5</span>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Zoom</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {state.zoom.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={state.zoom}
              onChange={(e) => setState((s) => ({ ...s, zoom: Number(e.target.value) }))}
              className="mt-3 w-full accent-foreground"
              aria-label="Zoom"
            />

            <div className="mt-6 flex items-center gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => rotate(-90)}>
                <RotateCcw className="size-4" />
                Left
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => rotate(90)}>
                <RotateCw className="size-4" />
                Right
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setState(reset)}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={!preview} onClick={() => preview && onSave(preview)}>
            Save Photo
          </Button>
        </div>
      </div>
    </div>
  );
}
