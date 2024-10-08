'use client';
import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {Button} from 'flowbite-react';
import ScreenRecorder from '@/component/ScreenRecorder';
import ScreenShare from '@/component/ScreenShare';
import GetDevices from '@/component/GetDevices';
import VideoDeviceSelector from '@/component/VideoDeviceSelector';

function Home() {
  const constraints = {
    video: true,
    audio: true,
  };
  const [stream, setStream] = useState(null);
  const [streamShare, setStreamShare] = useState(null);
  const localVideoRef = useRef(null);
  const localVideoRef2 = useRef(null);

  const StartStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints,
      );
      setStream(mediaStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    }
  };

  const StopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const StartScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setStreamShare(screenStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed ScreenShare!',
      });
    }
  };

  return (
    <div>
      <div className='flex justify-center items-center gap-2 md:gap-10 sm:gap-3 md:text-sm flex-col sm:flex-row mt-4'>
        <Button gradientDuoTone='cyanToBlue' onClick={StartStream}>
          Make Call
        </Button>
        <Button
          gradientDuoTone='cyanToBlue'
          disabled={!stream}
          onClick={StopStream}
          className={!stream ? 'opacity-50 cursor-not-allowed' : ''}
        >
          End Call
        </Button>
        <Button gradientDuoTone='cyanToBlue'>Change Screen Size</Button>
      </div>
      <div className='w-full flex justify-center mt-4'>
        <div className='w-full max-w-2xl p-4 bg-white rounded-lg shadow-lg'>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className='w-full h-[480px] object-cover border-8 border-blue-500 rounded-md shadow-inner'
          />
        </div>
        <div className='w-full max-w-2xl p-4 bg-white rounded-lg shadow-lg'>
          <video
            ref={localVideoRef2}
            autoPlay
            muted
            playsInline
            className='w-full h-[480px] object-cover border-8 border-blue-500 rounded-md shadow-inner'
          />
        </div>
      </div>
      <ScreenRecorder stream={stream} />
      <Button gradientDuoTone='cyanToBlue' onClick={StartScreenShare}>
        Share Screen
      </Button>
      <ScreenShare stream={streamShare} />
      <GetDevices />
      <VideoDeviceSelector stream={stream} setStream={setStream} />
    </div>
  );
}

export default Home;
