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
  const [videoSource, setVideoSource] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    document.title = "TensorFLow Tutorial";

    (async () => {
      let Model = await cocoSsd.load();
      setModel(Model);
      setShowEnableCamButton(true);
      // console.log("model in useeffect : ", Model);
    })();
  }, []);

  useEffect(() => {
    if (showVideo == true) {
      videoRef.current.srcObject = videoSource;
      videoRef.current.addEventListener("playing", predictWebcam);
    }
  }, [showVideo]);

  useEffect(() => {
    console.log("children : ", children);
  });

  async function handleEnableWebcam(e) {
    console.log("button pressed");

    if (!!navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowEnableCamButton(false);
      const constraint = {
        video: true,
      };

      let stream = await navigator.mediaDevices.getUserMedia(constraint);
      // videoRef.current.srcObject = stream;
      setVideoSource(stream);

      setShowVideo(true);
      // videoRef.current.addEventListener("playing", predictWebcam);
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

    let predictions = await model.detect(videoRef.current);
    // console.log("predictions are :", predictions);

    let result = [];
    predictions.map((prediction) => {
      if (prediction.score > 0.6) {
        result.push(prediction);
      }
    });

    setChildren(result);
    window.requestAnimationFrame(predictWebcam);
  }

  return (
    <div>
      <h1>TensorFlow.js Hello World</h1>

      {model ? (
        <p className="status">TF.js load version : {tf.version.tfjs}</p>
      ) : (
        <p className="status">TF.js and coco-ssd model is loading ...</p>
      )}

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
            <div>
              <video
                ref={videoRef}
                id="webcam"
                autoPlay
                width="640"
                height="480"
              />
              {children?.map((child, index) => {
                if (children.length > 0) {
                  return (
                    <>
                      <div
                        key={index}
                        className="highlighter"
                        style={{
                          left: child.bbox[0],
                          top: child.bbox[1],
                          width: child.bbox[2],
                          height: child.bbox[3],
                        }}
                      ></div>
                      <>
                        <p
                          style={{
                            marginTop: child.bbox[1] - 10,
                            marginLeft: child.bbox[0],
                            width: child.bbox[2] - 10,
                            top: 0,
                            left: 0,
                          }}
                        >
                          A {child.class} with a{" "}
                          {Math.round(parseFloat(child.score) * 100)} %
                          confidence
                        </p>
                      </>
                    </>
                  );
                }
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
