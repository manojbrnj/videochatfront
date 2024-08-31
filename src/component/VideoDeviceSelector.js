import {useState, useEffect, useRef} from 'react';
import {Button, Select} from 'flowbite-react';
import io from 'socket.io-client';

function VideoDeviceSelector({stream, setStream}) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const peerConnection = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://video-chat-6rs1.onrender.com');

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
      ],
    });

    peerConnection.current.onicecandidate = handleICECandidate;
    peerConnection.current.ontrack = handleTrack;

    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleNewICECandidate);

    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceList) => {
        const videoDevices = deviceList.filter(
          (device) => device.kind === 'videoinput',
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      })
      .catch((error) => console.error('Error enumerating devices:', error));

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const changeVideoInput = async (deviceId) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId,
      },
    });

    setStream(newStream);

    newStream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, newStream);
    });
  };

  const handleICECandidate = (event) => {
    if (event.candidate) {
      socketRef.current.emit('ice-candidate', event.candidate);
    }
  };

  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    changeVideoInput(deviceId);
  };

  const CreateOffer = async () => {
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socketRef.current.emit('offer', peerConnection.current.localDescription);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socketRef.current.emit('answer', peerConnection.current.localDescription);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleTrack = (event) => {
    // Handle incoming tracks
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleNewICECandidate = async (candidate) => {
    try {
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(candidate),
      );
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
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
