import { useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { faceSummary } from "../lib/features";
const BASE = "https://storage.googleapis.com/mediapipe-models/";

// Webcam + hand tracking + face tracking. Every frame it calls onFrame({ hand, isRight, face }).
export default function Camera({ onFrame }) {
  const video = useRef(), canvas = useRef(), cb = useRef(onFrame);
  cb.current = onFrame; // always call the newest function (fixes stale values in games)
  useEffect(() => {
    let hands, faces, stream, raf, stop = false, n = 0, face = null;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.current.srcObject = stream;
      await video.current.play();
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
      hands = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: BASE + "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" }, runningMode: "VIDEO", numHands: 1 });
      faces = await FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: BASE + "face_landmarker/face_landmarker/float16/1/face_landmarker.task" }, runningMode: "VIDEO", outputFaceBlendshapes: true, numFaces: 1 });
      const loop = () => {
        if (stop) return;
        const t = performance.now(), r = hands.detectForVideo(video.current, t);
        if (n++ % 3 === 0) { const b = faces.detectForVideo(video.current, t).faceBlendshapes[0]; face = b ? faceSummary(b.categories) : null; } // face is slower, so check every 3rd frame
        const hand = r.landmarks[0], c = canvas.current, ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        if (hand) {
          ctx.fillStyle = "#ffd24a"; ctx.shadowColor = "#ffd24a"; ctx.shadowBlur = 12;
          hand.forEach((p) => { ctx.beginPath(); ctx.arc(p.x * c.width, p.y * c.height, 5, 0, 7); ctx.fill(); });
        }
        // MediaPipe assumes a mirrored image, and ours is not, so its "Left" label means your right hand.
        cb.current({ hand: hand || null, isRight: r.handedness[0]?.[0]?.categoryName === "Left", face });
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, []);
  return (
    <div className="cam">
      <video ref={video} muted playsInline />
      <canvas ref={canvas} width="640" height="480" />
    </div>
  );
}