import {useState, useEffect} from 'react';
import {Select} from 'flowbite-react';

function VideoDeviceSelector() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceList) => {
        const videoDevices = deviceList.filter(
          (device) => device.kind === 'videoinput',
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId); // Set default selected device
        }
      })
      .catch((error) => console.error('Error enumerating devices:', error));
  }, []);

  const changeVideoInput = (deviceId) => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: deviceId,
        },
      })
      .then((stream) => {
        console.log(stream);
        // Here you can handle the new stream, e.g., set it to a video element
      });
  };

  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    changeVideoInput(deviceId);
  };

  return (
    <div>
      <h2>Select Video Input</h2>
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
