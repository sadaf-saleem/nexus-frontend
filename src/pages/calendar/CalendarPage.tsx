import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Meeting, AvailabilitySlot } from '../../types';
import { Calendar, Clock, User, Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data storage
const meetingsStorage: Meeting[] = [];
const availabilityStorage: AvailabilitySlot[] = [];

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState('');
  const [pendingRequests, setPendingRequests] = useState<Meeting[]>([]);

  useEffect(() => {
    if (user) {
      // Load meetings for current user
      const userMeetings = meetingsStorage.filter(
        m => m.organizerId === user.id || m.attendeeId === user.id
      );
      setMeetings(userMeetings);

      // Load availability slots
      const userSlots = availabilityStorage.filter(s => s.userId === user.id);
      setAvailabilitySlots(userSlots);

      // Load pending requests
      const pending = userMeetings.filter(m => 
        m.status === 'pending' && m.attendeeId === user.id
      );
      setPendingRequests(pending);
    }
  }, [user]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setShowMeetingModal(true);
  };

  const createMeeting = () => {
    if (!user || !selectedDate || !meetingTitle || !selectedAttendee) {
      toast.error('Please fill all required fields');
      return;
    }

    const newMeeting: Meeting = {
      id: `meeting_${Date.now()}`,
      title: meetingTitle,
      description: meetingDescription,
      startTime: selectedDate.toISOString(),
      endTime: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
      organizerId: user.id,
      attendeeId: selectedAttendee,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    meetingsStorage.push(newMeeting);
    setMeetings([...meetingsStorage]);
    setShowMeetingModal(false);
    setMeetingTitle('');
    setMeetingDescription('');
    setSelectedAttendee('');
    toast.success('Meeting request sent!');
  };

  const handleMeetingResponse = (meetingId: string, status: 'accepted' | 'declined') => {
    const meeting = meetingsStorage.find(m => m.id === meetingId);
    if (meeting) {
      meeting.status = status === 'accepted' ? 'confirmed' : 'declined';
      setMeetings([...meetingsStorage]);
      setPendingRequests(pendingRequests.filter(m => m.id !== meetingId));
      toast.success(`Meeting ${status}!`);
    }
  };

  const addAvailabilitySlot = () => {
    setShowAvailabilityModal(true);
  };

  const calendarEvents = meetings.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    start: meeting.startTime,
    end: meeting.endTime,
    backgroundColor: meeting.status === 'confirmed' ? '#10b981' : 
                     meeting.status === 'pending' ? '#f59e0b' : '#ef4444',
    borderColor: meeting.status === 'confirmed' ? '#10b981' : 
                 meeting.status === 'pending' ? '#f59e0b' : '#ef4444',
  }));

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Meetings</h1>
          <p className="text-gray-600">Schedule and manage your meetings</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<Plus size={18} />}
            onClick={addAvailabilitySlot}
          >
            Add Availability
          </Button>
          <Button
            leftIcon={<Calendar size={18} />}
            onClick={() => setShowMeetingModal(true)}
          >
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Pending Meeting Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Pending Meeting Requests</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {pendingRequests.map(meeting => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(meeting.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Check size={16} />}
                      onClick={() => handleMeetingResponse(meeting.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<X size={16} />}
                      onClick={() => handleMeetingResponse(meeting.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardBody>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            editable={true}
            dayMaxEvents={true}
            height="auto"
          />
        </CardBody>
      </Card>

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Meeting</h2>
            <div className="space-y-4">
              <Input
                label="Meeting Title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                fullWidth
              />
              <Input
                label="Attendee Email"
                value={selectedAttendee}
                onChange={(e) => setSelectedAttendee(e.target.value)}
                fullWidth
                placeholder="user@example.com"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>
              {selectedDate && (
                <div className="text-sm text-gray-600">
                  <strong>Selected Date:</strong> {selectedDate.toLocaleString()}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowMeetingModal(false);
                    setMeetingTitle('');
                    setMeetingDescription('');
                    setSelectedAttendee('');
                  }}
                >
                  Cancel
                </Button>
                <Button fullWidth onClick={createMeeting}>
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Availability Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  fullWidth
                />
                <Input
                  label="End Time"
                  type="time"
                  fullWidth
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    toast.success('Availability slot added!');
                    setShowAvailabilityModal(false);
                  }}
                >
                  Add Slot
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

