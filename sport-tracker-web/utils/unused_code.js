/*=== Webcam Function ===*/
const webcamRef = useRef(null);
const mediaRecorderRef = useRef(null);
const [capturing, setCapturing] = useState(false);
const [recordedChunks, setRecordedChunks] = useState([]);
const [startClicked, setStartClicked] = useState(false);

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const handleStartCaptureClick = useCallback(() => {
  setCapturing(true);
  mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
    mimeType: "video/webm",
  });
  mediaRecorderRef.current.addEventListener(
    "dataavailable",
    handleDataAvailable
  );
  mediaRecorderRef.current.start(1000);
  ///Send video to server
  mediaRecorderRef.current.ondataavailable = async (event) => {
    console.log(event.data);
    // if (event.data && event.data.size > 0) {
    //   ws.send(event.data);
    // }
  };
}, [webcamRef, setCapturing, mediaRecorderRef]);

const handleDataAvailable = useCallback(
  ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  },
  [setRecordedChunks]
);

const handleStopCaptureClick = useCallback(() => {
  mediaRecorderRef.current.stop();
  setCapturing(false);
  setStartClicked(false);
}, [mediaRecorderRef, webcamRef, setCapturing]);

const handleDownload = useCallback(() => {
  if (recordedChunks.length) {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "react-webcam-stream-capture.webm";
    a.click();
    window.URL.revokeObjectURL(url);
    setRecordedChunks([]);
  }
}, [recordedChunks]);


/* UI BUTTON */
{capturing ? (
  <Button onClick={()=>console.log('stop')} type="primary" danger>
    Stop Capture
  </Button>
) : (
  !startClicked && (
    <Button onClick={startActivity} type="primary" danger>
      Start Capture
    </Button>
  )
)}
{recordedChunks.length > 0 && (
  <>
    <div style={{ width: "20px" }} />
    <Button onClick={()=>console.log('download')} type="primary" danger>
      Download
    </Button>
  </>
)}