import {useState, useEffect, useRef} from 'react';
import {Button, Select} from 'flowbite-react';
import io from 'socket.io-client';
function VideoDeviceSelector({stream}) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  useEffect(async () => {
    socketRef.current = io('https://video-chat-6rs1.onrender.com');
    // Initialize RTCPeerConnection
    peerConnection.current = await new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
      ],
    });

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

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
  // Set up event listeners for RTCPeerConnection
  peerConnection.current.onicecandidate = handleICECandidate;
  peerConnection.current.ontrack = handleTrack;
  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    changeVideoInput(deviceId);
  };

  const CreateOffer = async () => {
    // create offer
    peerConnection.current
      .createOffer()
      .then((offer) => {
        peerConnection.current.setLocalDescription(offer);
        if (stream) {
          stream.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, stream);
          });
        }
        console.log('Offer created:', offer);
      })
      .then(() => {
        socketRef.current.emit(
          'offer',
          peerConnection.current.localDescription,
        );
      })
      .catch((error) => console.error('Error creating offer:', error));
  };

  //scoket offer receive kiya
  socketRef.current.on('offer', handleOffer);
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

  const handleICECandidate = (event) => {
    if (event.candidate) {
      socketRef.current.emit('ice-candidate', event.candidate);
    }
  };

  const handleTrack = (event) => {
    // Handle incoming tracks
  };
  socketRef.current.on('answer', handleAnswer);
  socketRef.current.on('ice-candidate', handleNewICECandidate);
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
  return (
    <div>
      <h2>Select Video Input</h2>
      <Button onClick={CreateOffer}>Create Offer</Button>
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
