import {useState, useEffect, useRef, useCallback} from 'react';
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

    enumerateDevices();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const enumerateDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(
        (device) => device.kind === 'videoinput',
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }, []);

  const changeVideoInput = async (deviceId) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {deviceId: deviceId},
      });

      setStream(newStream);
      newStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, newStream);
      });

      // Update selected device
      setSelectedDevice(deviceId);
    } catch (error) {
      console.error('Error changing video input:', error);
    }
  };

  const handleICECandidate = (event) => {
    if (event.candidate) {
      socketRef.current.emit('ice-candidate', event.candidate);
    }
  };

  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
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
    // Here you can attach the incoming video track to a video element to show the stream
    const remoteVideoElement = document.getElementById('remoteVideo');
    if (remoteVideoElement) {
      remoteVideoElement.srcObject = event.streams[0];
    }
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
      <video
        id='remoteVideo'
        autoPlay
        style={{width: '100%', height: 'auto'}}
      />
    </div>
  );
}

export default VideoDeviceSelector;
