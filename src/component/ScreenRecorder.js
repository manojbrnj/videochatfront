'use client';
import React, {useRef, useState} from 'react';
import {Button, Container} from 'flowbite-react';
import Swal from 'sweetalert2';
function ScreenRecorder({stream}) {
  const [mediaBlob, setMediaBlob] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const localVideoRef = useRef(null);
  const StartRecording = () => {
    // const recorder = new MediaRecorder(stream, {
    //   mimeType: 'video/webm; codecs=vp8',
    // });
    if (!stream) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Make call Before start Recording!',
      });
      return;
    }
    let mediaRecord = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp8',
    });
    if (!MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
      console.error('MIME type not supported');
      return;
    }
    let blobdata = [];
    console.log('Stream tracks:', stream.getTracks());
    mediaRecord.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setMediaBlob((prev) => [...prev, e.data]);
        //
      }
    };

    mediaRecord.start();
    setMediaRecorder(mediaRecord);
  };

  const StopRecording = () => {
    if (!mediaRecorder) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Record Before Stop Recording!',
      });
      return;
    }
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      console.log('Data collected:', mediaBlob.length); // Should log the number of recorded blobs
    };
    // Creating a Blob from the collected blob data
    const completeBlob = new Blob(mediaBlob, {type: 'video/webm '}); // Assuming you're recording video
    const url = URL.createObjectURL(completeBlob);

    // Creating a Blob from the collected blob data

    setVideoUrl(url);
  };

  const PlayRecording = () => {
    if (mediaBlob == null) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Record Before Stop Recording!',
      });
      return;
    }
    const url = videoUrl;

    if (localVideoRef.current) {
      localVideoRef.current.src = url;
      localVideoRef.current.controls = true;
      localVideoRef.current.play();
    }
  };
  return (
    <div>
      <Button gradientDuoTone='cyanToBlue' onClick={StartRecording}>
        Start Recording
      </Button>
      <Button gradientDuoTone='cyanToBlue' onClick={StopRecording}>
        Stop Recording
      </Button>
      <Button gradientDuoTone='cyanToBlue' onClick={PlayRecording}>
        Play Recording
      </Button>
      <div className='w-full max-w-2xl p-4 bg-white rounded-lg shadow-lg'>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className='w-full h-[480px] object-cover border-4 border-blue-500 rounded-md shadow-inner'
        />
      </div>
    </div>
  );
}

export default ScreenRecorder;
