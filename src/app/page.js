// src/pages/index.js
'use client';
import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';

const socket = io('https://video-chat-6rs1.onrender.com', {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
function Home() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [myRoomId, setMyRoomId] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const constraints = {
      audio: true,
      video: true,
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      localVideoRef.current.srcObject = stream;
      setLocalStream(stream);
    });

    peerConnectionRef.current = new RTCPeerConnection();

    peerConnectionRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };

    socket.on('offer', async (offer) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', async (answer) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    });

    socket.on('ice-candidate', (candidate) => {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('room-created', (id) => {
      setMyRoomId(id);
    });

    socket.emit('create-room');
  }, []);

  const handleCall = async () => {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit('offer', {offer, roomId});
  };
  socket.on('callReceived', (data) => {
    const {from, roomId} = data;
    if (confirm(`Incoming call from ${from}. Accept?`)) {
      socket.emit('callAccepted', {to: from, roomId});
      joinRoom(roomId);
    }
  });

  socket.on('callConnected', (data) => {
    const {roomId} = data;
    joinRoom(roomId);
  });
  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };
  function joinRoom(roomId) {
    // Implement your video chat logic here
    console.log(`Joined room: ${roomId}`);
  }
  function makeCall() {
    const targetRoomId = document.getElementById('targetRoomId').value;
    if (targetRoomId) {
      socket.emit('makeCall', targetRoomId);
      console.log(`Calling peer with room ID: ${targetRoomId}`);
    } else {
      alert('Please enter a valid Room ID');
    }
  }
  return (
    <div>
      <div>Your Room ID: {myRoomId}</div>
      <input
        type='text'
        value={roomId}
        onChange={handleRoomIdChange}
        placeholder='Enter Room ID to call'
      />
      <button onclick='makeCall()'>Make Call</button>
      <video ref={localVideoRef} autoPlay muted></video>
      <video ref={remoteVideoRef} autoPlay></video>
    </div>
  );
}

export default Home;
