'use client';
import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import {Button, Container} from 'flowbite-react';
import ScreenRecorder from '@/component/ScreenRecorder';
import ScreenShare from '@/component/ScreenShare';
import GetDevices from '@/component/GetDevices';
import VideoDeviceSelector from '@/component/VideoDeviceSelector';

function Home() {
  useEffect(() => {
    //const socket = io.connect('https://video-chat-6rs1.onrender.com');
  }, []);

  const constraints = {
    video: true,
    audio: true,
  };
  const [stream, setStream] = useState(null);
  const [streamShare, sestStreamShare] = useState(null);
  const localVideoRef = useRef(null);
  const localVideoRef2 = useRef(null);
  useEffect(() => {
    // StartStream();
    return () => {
      // setStream(null);
    };
  }, [stream]);

  const StartStream = async () => {
    try {
      let mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      setStream(mediaStream);
      let height = localVideoRef.current.height;
      let width = localVideoRef.current.width;

      mediaStream.getTracks().forEach((track) => {
        const constraints = {
          height:
            height < mediaStream.getVideoTracks()[0].getSettings().height
              ? mediaStream.getVideoTracks()[0].getSettings().height
              : height,
          width:
            width < mediaStream.getVideoTracks()[0].getSettings().width
              ? mediaStream.getVideoTracks()[0].getSettings().width
              : width,
        };
        track.applyConstraints(constraints);
      });
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
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  };
  // Screen Share
  const StartScreenShare = async () => {
    await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        sestStreamShare(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log('Stream:', stream);
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed ScreenShare!',
        });
      });
  };

  return (
    <div>
      <div className='flex justify-center items-center gap-2 md:gap-10 sm:gap-3 md:text-sm flex-col sm:flex-row   mt-4'>
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
      <div className='w-full   flex justify-center mt-4'>
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
      <VideoDeviceSelector />
    </div>
  );
}

export default Home;
