import {useState, useEffect} from 'react';
import {Select} from 'flowbite-react';

function VideoDeviceSelector() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io('https://video-chat-6rs1.onrender.com');
    // Initialize RTCPeerConnection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    });

    peerConnection.current
      .createOffer()
      .then((offer) => peerConnection.current.setLocalDescription(offer))
      .then(() => {
        socketRef.current.emit(
          'offer',
          peerConnection.current.localDescription,
        );
      })
      .catch((error) => console.error('Error creating offer:', error));
    // Set up event listeners for RTCPeerConnection
    peerConnection.current.onicecandidate = handleICECandidate;
    peerConnection.current.ontrack = handleTrack;
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceList) => {
        const videoDevices = deviceList.filter(
          (device) => device.kind === 'videoinput',
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId); // Set default selected device
        }
      })
      .catch((error) => console.error('Error enumerating devices:', error));

    // Set up socket event listeners
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleNewICECandidate);
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  const handleICECandidate = (event) => {
    if (event.candidate) {
      socketRef.current.emit('ice-candidate', event.candidate);
    }
  };

  const handleOffer = (offer) => {
    peerConnection.current
      .setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peerConnection.current.createAnswer())
      .then((answer) => peerConnection.current.setLocalDescription(answer))
      .then(() => {
        socketRef.current.emit(
          'answer',
          peerConnection.current.localDescription,
        );
      })
      .catch((error) => console.error('Error handling offer:', error));
  };
  const handleTrack = (event) => {
    // Handle incoming tracks
  };

  const handleAnswer = (answer) => {
    peerConnection.current
      .setRemoteDescription(new RTCSessionDescription(answer))
      .catch((error) => console.error('Error handling answer:', error));
  };
  const handleNewICECandidate = (candidate) => {
    peerConnection.current
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((error) => console.error('Error adding ICE candidate:', error));
  };
  const changeVideoInput = (deviceId) => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: deviceId,
        },
      })
      .then((stream) => {
        console.log(stream);
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        // Here you can handle the new stream, e.g., set it to a video element
      });
  };

  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    changeVideoInput(deviceId);
  };

  return (
    <div>
      <h2>Select Video Input</h2>
      <Select value={selectedDevice} onChange={handleDeviceChange}>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${devices.indexOf(device) + 1}`}
          </option>
        ))}
      </Select>
    </div>
  );
}

export default VideoDeviceSelector;
