// src/pages/index.js
'use client';
import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import {Button} from 'flowbite-react';
import {s} from 'vite/dist/node/types.d-aGj9QkWt';
import Swal from 'sweetalert2';

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

  const constraints = {
    audio: true,
    video: true,
  };
  const ShowError = (error) => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Failed to access microphone and camera!',
      footer: error.message,
    });
  };
  const getMicAndCamera = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      console.log(stream);
    } catch (error) {
      ShowError(error);
    }
  };

  return (
    <div>
      {/* Add hero section here */}
      <section className='bg-gray-900 text-white'>
        <div className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12'>
          <h1 className='mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl'>
            Welcome to Our Awesome Game
          </h1>
          <p className='mb-8 text-lg font-normal text-gray-400 lg:text-xl sm:px-16 xl:px-48'>
            Get ready for an epic gaming experience! Challenge your friends,
            beat high scores, and become the ultimate champion.
          </p>
          <div className='flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4'>
            <a
              href='#'
              className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900'
            >
              Start Playing
              <svg
                className='ml-2 -mr-1 w-5 h-5'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                  clipRule='evenodd'
                ></path>
              </svg>
            </a>
            <a
              href='#'
              className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-400'
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
      <button
        onClick={getMicAndCamera}
        className='bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105'
      >
        Make Call
      </button>

      <video ref={localVideoRef} autoPlay playsInline muted />
    </div>
  );
}

export default Home;
