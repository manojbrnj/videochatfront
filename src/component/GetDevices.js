import {Button} from 'flowbite-react';
import React from 'react';

function GetDevices() {
  const GetUserDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log(devices);
    });
  };

  const ChangeAudioInput = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          deviceId: 'default',
        },
      })
      .then((stream) => {
        console.log(stream);
      });
  };
  const ChangeAudioOutput = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          deviceId: 'default',
        },
      })
      .then((stream) => {
        console.log(stream);
      });
  };

  const ChangeVideoInput = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: 'default',
        },
      })
      .then((stream) => {
        console.log(stream);
      });
  };
  return (
    <div>
      <Button gradientDuoTone='cyanToBlue' onClick={GetUserDevices}>
        Get Devices
      </Button>
      <Button gradientDuoTone='cyanToBlue' onClick={ChangeAudioInput}>
        Audioinput
      </Button>
      <Button gradientDuoTone='cyanToBlue' onClick={ChangeAudioOutput}>
        AudioOutput
      </Button>
      <Button gradientDuoTone='cyanToBlue' onClick={ChangeVideoInput}>
        VideoInput
      </Button>
    </div>
  );
}

export default GetDevices;
