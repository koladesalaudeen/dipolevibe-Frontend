/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import {
  FaVideo,
  FaPause,
  FaTv,
  FaTrash,
  FaStop,
  FaAdjust,
  FaPaintBrush,
  FaMagic,
} from "react-icons/fa";

let recordedChunks = []; // Initialize recordedChunks

const RecordingModal = ({ videoRef, startRecording }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="modal bg-white p-4 shadow-lg justify-center rounded w-280">
        <button className="w-full mx-auto my-4 bg-blue-500 text-white font-bold py-2 px-4 rounded">
          <FaTv className="inline-block mr-2" /> Full Screen
        </button>
        <button className="w-full mx-auto my-4 bg-blue-500 text-white font-bold py-2 px-8 rounded">
          <FaVideo className="inline-block mr-2" /> Video Camera
        </button>
        <button
          onClick={startRecording}
          className=" block w-full mx-auto font-bold bg-green-500 text-white px-4 py-2 rounded text-center"
        >
          Start Recording
        </button>
        <hr className="my-4" />
        <div className="flex justify-between">
          <div className="w-1/3 text-center">
            <span className="bg-blue-500 text-white rounded-full h-10 w-10 inline-flex items-center justify-center">
              <FaMagic />
            </span>
            <p>Effects</p>
          </div>
          <div className="w-1/3 text-center">
            <span className="bg-blue-500 text-white rounded-full h-10 w-10 inline-flex items-center justify-center">
              <FaAdjust />
            </span>
            <p>Blur</p>
          </div>
          <div className="w-1/3 text-center">
            <span className="bg-blue-500 text-white rounded-full h-10 w-10 inline-flex items-center justify-center">
              <FaPaintBrush />
            </span>
            <p>Canvas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
const RecorderComponent = ({ closeVideoModal }) => {
  const videoRef = useRef();
  const [screenRecorder, setScreenRecorder] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
  
      const newScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
  
      const newAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(newAudioStream);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      const audioTrack = destination.stream.getAudioTracks()[0];
      newScreenStream.addTrack(audioTrack);
  
      const recorder = new MediaRecorder(
        new MediaStream([...newScreenStream.getTracks()]),
        { mimeType: "video/webm" }
      );
  
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
  
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = videoURL;
        a.download = "screenRecording.webm";
        a.click();
  
        recordedChunks = [];
        setIsRecording(false);
      };
  
      setScreenStream(newScreenStream); // Use useState to set streams
      setAudioStream(newAudioStream);
  
      setScreenRecorder(recorder);
      recorder.start();
  
      const newCameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(newCameraStream);
  
      videoRef.current.srcObject = newCameraStream;
      videoRef.current.play();
    } catch (error) {
      console.error(error);
    }
  };
  

  const stopRecording = () => {
    console.log("Attempting to stop recording...");
    console.log("screenRecorder:", screenRecorder);
    console.log("screenStream:", screenStream);
    console.log("cameraStream:", cameraStream);
  
    if (screenRecorder && screenRecorder.state !== "inactive") {
      console.log("Stopping recording");
      screenRecorder.stop();
      screenStream.getTracks().forEach((track) => track.stop());
      cameraStream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      recordedChunks = [];
      setIsRecording(false);
    }
  };
  

  return (
    <Draggable>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {isRecording ? (
          <>
            <video
              className="rounded-full"
              style={{ height: "200px", width: "300px" }}
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls
            ></video>
            <div className="flex mt-4 border border-sky-blue-500 bg-gray-900 p-2">
              <button className="mx-2 text-white">
                <FaPause />
              </button>
              <button className="mx-2 text-white">
                <FaTrash />
              </button>
              <button onClick={stopRecording} className="mx-2 text-white">
                <FaStop />
              </button>
            </div>
          </>
        ) : (
          <RecordingModal
            videoRef={videoRef}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        )}
      </div>
    </Draggable>
  );
};

export default RecorderComponent;
