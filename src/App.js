import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import testImage from "./testImage.jpg";

function App() {
  const [showVideo, setShowVideo] = useState(false);
  const [showEnableCamButton, setShowEnableCamButton] = useState(false);
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    document.title = "TensorFLow Tutorial";

    (async () => {
      let Model = await cocoSsd.load();
      setModel(Model);
      setShowEnableCamButton(true);
      // console.log("model in useeffect : ", Model);
    })();
  }, []);

  async function handleEnableWebcam(e) {
    console.log("button pressed");

    if (!!navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowEnableCamButton(false);
      const constraint = {
        video: true,
      };

      setShowVideo(true);
      let stream = await navigator.mediaDevices.getUserMedia(constraint);

      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("playing", predictWebcam);
    } else {
      console.warn("getUserMedia() is not supported on your browser");
    }
  }

  async function predictWebcam() {
    if (!model) {
      console.error("Model not loaded");
      return;
    }

    if (!videoRef.current || !videoRef.current.srcObject) {
      console.log("Video element not ready");
      return;
    }

    let predictions = await model.detect(videoRef);
    console.log("predictions are :", predictions);
  }

  return (
    <div>
      <h1>TensorFlow.js Hello World</h1>

      {tf && <p className="status">TF.js load version : {tf.version.tfjs}</p>}

      {/* <section id="demos" className="invisible"> */}
      <section id="demos">
        <p>
          Hold some objects close to your webcam to get a real-time
          classification. When ready click "enable webcam" below and accept
          access to the webcam when the browser asks
        </p>
        <div id="liveView" className="camView">
          {showEnableCamButton && (
            <button onClick={handleEnableWebcam} id="webcamButton">
              Enable Webcam
            </button>
          )}

          {showVideo && (
            <video
              ref={videoRef}
              id="webcam"
              autoPlay
              width="640"
              height="480"
            ></video>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
