import {useState, useEffect, useRef, useCallback} from 'react';
import {Button, Select, Label, TextInput} from 'flowbite-react';
import io from 'socket.io-client';

function VideoDeviceSelector({stream, setStream}) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const sendMessageRef = useRef(null);
  const receiveMessageRef = useRef([]);
  const [autorization, setAuthorization] = useState({
    userName: 'user1',
    password: 'x',
  });
  // ... existing code ...

  const sendMessage = () => {
    const message = sendMessageRef.current.value;
    // Implement your message sending logic here
    console.log('Sending message:', message);
    // Clear the input after sending
    sendMessageRef.current.value = '';
  };
  useEffect(() => {
    socketRef.current = io('https://video-chat-6rs1.onrender.com', {
      auth: {
        userName: 'abcd',
        password: 'x',
      },
    });
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
    // Socket event handlers

    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleNewICECandidate);
    socketRef.current.on('chat-message', handleMessage);
    // Load devices
    enumerateDevices();

    return () => {
      // Cleanup after component unmount
      peerConnection.current.close();
      socketRef.current.disconnect();
      socketRef.current.off('offer', handleOffer);
      socketRef.current.off('answer', handleAnswer);
      socketRef.current.off('ice-candidate', handleNewICECandidate);
      socketRef.current.off('chat-message', handleMessage);
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

      newStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, newStream);
      });

      setStream(newStream);
      setSelectedDevice(deviceId);
    } catch (error) {
      console.error('Error changing video input:', error);
    }
  };

  const handleICECandidate = (event) => {
    console.log('ICE candidate event:', event);
    if (event.candidate) {
      console.log('ICE candidate:', event.candidate);
      socketRef.current.emit('ice-candidate', event.candidate);
      console.log('ICE candidate sent');
    } else {
      console.log('ICE candidate gathering complete');
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
      console.log('Offer received');
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socketRef.current.emit('answer', peerConnection.current.localDescription);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleTrack = (event) => {
    const remoteVideoElement = document.getElementById('remoteVideo');
    console.log('Track event:', event);
    if (remoteVideoRef.current) {
      if (event.streams[0]) remoteVideoRef.current.srcObject = event.streams[0];
      else if (event.streams[1])
        remoteVideoRef.current.srcObject = event.streams[1];
      else if (event.streams[2])
        remoteVideoRef.current.srcObject = event.streams[2];
    }
    console.log('Remote video srcObject set');
  };

  const handleAnswer = async (answer) => {
    try {
      if (peerConnection.current.signalingState === 'have-local-offer') {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
        console.log('Answer received and set successfully');
      } else {
        console.log(
          'Ignoring answer as signaling state is:',
          peerConnection.current.signalingState,
        );
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleNewICECandidate = async (candidate) => {
    try {
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(candidate),
      );
      console.log('ICE candidate received');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleMessage = (message) => {
    console.log('Message received:', message);
    receiveMessageRef.current.push(message);
  };
  const MsgSent = (e) => {
    socketRef.current.emit('chat-message', sendMessageRef.current.value);
    // socketRef.current.on('chat-message', handleMessage);
  };
  return (
    <div>
      <h2>Select Video Input</h2>
      <Button onClick={CreateOffer} disabled={!stream}>
        Create Offer
      </Button>
      <Select value={selectedDevice} onChange={handleDeviceChange}>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${devices.indexOf(device) + 1}`}
          </option>
        ))}
      </Select>

      <div className='mb-4'>
        <Label htmlFor='send-message' value='Send Message' />
        <TextInput
          id='send-message'
          type='text'
          placeholder='Type your message here'
          ref={sendMessageRef}
          onClick={MsgSent}
        />
        <Button onClick={sendMessage} className='mt-2'>
          Send
        </Button>
      </div>
      <div className='mb-4'>
        <Label htmlFor='receive-message' value='Received Messages' />
        <TextInput
          id='receive-message'
          type='text'
          readOnly
          ref={receiveMessageRef}
        />
      </div>
      <video
        id='remoteVideo'
        autoPlay
        ref={remoteVideoRef}
        style={{width: '100%', height: 'auto'}}
      />
    </div>
  );
}

export default VideoDeviceSelector;
