'use client';
import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

const socket = io('https://video-chat-6rs1.onrender.com', {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function Home() {
  // ... (previous state and ref declarations)
  const [backgroundImage, setBackgroundImage] = useState(
    '/default-background.jpg',
  );
  const canvasRef = useRef(null);

  const constraints = {
    audio: true,
    video: true,
  };

  const getMicAndCamera = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        startBackgroundChange();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to access microphone and camera!',
        footer: error.message,
      });
    }
  };

  const startBackgroundChange = async () => {
    const net = await bodyPix.load();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = backgroundImage;

    const segmentPerson = async () => {
      const segmentation = await net.segmentPerson(localVideoRef.current);
      const backgroundMask = bodyPix.toMask(segmentation);

      ctx.drawImage(localVideoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(backgroundMask, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      requestAnimationFrame(segmentPerson);
    };

    segmentPerson();
  };

  return (
    <div>
      <button onClick={getMicAndCamera}>Make Call</button>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{display: 'none'}}
      />
      <canvas ref={canvasRef} width='640' height='480' />
      <input
        type='file'
        onChange={(e) =>
          setBackgroundImage(URL.createObjectURL(e.target.files[0]))
        }
      />
    </div>
  );
}

export default Home;
