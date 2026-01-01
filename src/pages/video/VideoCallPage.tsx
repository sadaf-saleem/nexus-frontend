import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Video, Phone, PhoneOff, Mic, MicOff, Monitor, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<string[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInCall) {
      // Mock video stream (in real app, this would be WebRTC)
      if (localVideoRef.current) {
        // Create a mock video stream with a colored canvas
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#3B82F6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(user?.name || 'You', canvas.width / 2, canvas.height / 2);
        }
        const stream = canvas.captureStream(30);
        localVideoRef.current.srcObject = stream;
      }

      // Start call timer
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInCall, user]);

  const startCall = () => {
    setIsInCall(true);
    setParticipants([user?.id || '', 'participant_1']);
    toast.success('Call started');
  };

  const endCall = () => {
    setIsInCall(false);
    setIsVideoOn(true);
    setIsAudioOn(true);
    setIsScreenSharing(false);
    setParticipants([]);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    toast.success('Call ended');
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (localVideoRef.current) {
      if (!isVideoOn) {
        // Re-enable video
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#3B82F6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(user?.name || 'You', canvas.width / 2, canvas.height / 2);
        }
        localVideoRef.current.srcObject = canvas.captureStream(30);
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast.success(`Audio ${!isAudioOn ? 'enabled' : 'disabled'}`);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(`Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
          <p className="text-gray-600">Connect with investors and entrepreneurs via video</p>
        </div>
      </div>

      {!isInCall ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
                <Video size={40} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Start a Video Call</h2>
              <p className="text-gray-600 mb-6">
                Begin a video call with your connections
              </p>
              <Button
                leftIcon={<Phone size={18} />}
                onClick={startCall}
                size="lg"
              >
                Start Call
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Call Header */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="primary" className="animate-pulse">
                    Live
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-gray-900">Video Call in Progress</h3>
                    <p className="text-sm text-gray-600">Duration: {formatTime(callDuration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{participants.length} participants</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Video Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Local Video */}
            <Card>
              <CardBody className="p-0">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {isVideoOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                          <Users size={40} className="text-white" />
                        </div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">Video Off</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="gray">{user.name} (You)</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Remote Video */}
            <Card>
              <CardBody className="p-0">
                <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                        <Users size={40} className="text-white" />
                      </div>
                      <p className="text-white font-medium">Participant</p>
                      <p className="text-gray-400 text-sm">Waiting for video...</p>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="gray">Remote Participant</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Call Controls */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isAudioOn ? "outline" : "error"}
                  onClick={toggleAudio}
                  leftIcon={isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
                  size="lg"
                >
                  {isAudioOn ? 'Mute' : 'Unmute'}
                </Button>

                <Button
                  variant={isVideoOn ? "outline" : "error"}
                  onClick={toggleVideo}
                  leftIcon={isVideoOn ? <Video size={18} /> : <Video size={18} />}
                  size="lg"
                >
                  {isVideoOn ? 'Video Off' : 'Video On'}
                </Button>

                <Button
                  variant={isScreenSharing ? "primary" : "outline"}
                  onClick={toggleScreenShare}
                  leftIcon={<Monitor size={18} />}
                  size="lg"
                >
                  {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                </Button>

                <Button
                  variant="error"
                  onClick={endCall}
                  leftIcon={<PhoneOff size={18} />}
                  size="lg"
                >
                  End Call
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

