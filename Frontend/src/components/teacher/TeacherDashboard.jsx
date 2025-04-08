import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchStudentsForAttendance,
  submitAttendance,
  clearError as clearAttendanceError,
} from '../../redux/attendanceSlice';
import { submitResult, clearError as clearResultError } from '../../redux/resultSlice';
import { submitLeave } from '../../redux/leaveSlice';
import { submitFeedback } from '../../redux/feedbackSlice';

// Component for marking attendance
function AttendanceMarking() {
  const dispatch = useDispatch();
  const { students, attendances, loading, error } = useSelector((state) => state.attendance);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchStudentsForAttendance());
  }, [dispatch]);

  const handleMarkAttendance = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = () => {
    const attendanceData = { date: new Date().toISOString(), records: attendance };
    dispatch(submitAttendance(attendanceData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Attendance submitted successfully!');
        setAttendance({});
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.payload || 'Failed to submit attendance');
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Mark Attendance</h2>
      {message && (
        <p className={message.includes('successfully') ? 'text-green-600 mb-2' : 'text-red-500 mb-2'}>
          {message}
        </p>
      )}
      {loading ? (
        <p className="text-gray-500">Loading students...</p>
      ) : error ? (
        <div className="mb-2">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => dispatch(clearAttendanceError())}
            className="text-blue-500 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students available</p>
      ) : (
        <>
          {students.map((student) => (
            <div key={student._id} className="flex items-center gap-2 mb-2">
              <span className="w-40 truncate">{student.name || 'Unknown'}</span>
              <select
                value={attendance[student._id] || ''}
                onChange={(e) => handleMarkAttendance(student._id, e.target.value)}
                className="border p-1 rounded"
              >
                <option value="">Select status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>
          ))}
          <button
            onClick={handleSubmitAttendance}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            disabled={loading || Object.keys(attendance).length === 0}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
          {attendances.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Recent Attendance</h3>
              {attendances.slice(0, 3).map((att, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {new Date(att.date).toLocaleDateString()}: {Object.entries(att.records).length} students marked
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Component for entering student results
function ResultsEntry() {
  const dispatch = useDispatch();
  const { loading, error, results } = useSelector((state) => state.results);
  const { students } = useSelector((state) => state.attendance);
  const [resultData, setResultData] = useState({ studentId: '', subject: '', marks: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setResultData({ ...resultData, [e.target.name]: e.target.value });
  };

  const handleSubmitResults = (e) => {
    e.preventDefault();
    dispatch(submitResult(resultData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Results submitted successfully!');
        setResultData({ studentId: '', subject: '', marks: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.payload || 'Failed to submit results');
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Enter Student Results</h2>
      {message && (
        <p className={message.includes('successfully') ? 'text-green-600 mb-2' : 'text-red-500 mb-2'}>
          {message}
        </p>
      )}
      {loading && <p className="text-gray-500">Submitting...</p>}
      {error && (
        <div className="mb-2">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => dispatch(clearResultError())}
            className="text-blue-500 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}
      <form onSubmit={handleSubmitResults} className="flex flex-col gap-2">
        <select
          name="studentId"
          value={resultData.studentId}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name || 'Unknown'}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="subject"
          value={resultData.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="marks"
          value={resultData.marks}
          onChange={handleChange}
          placeholder="Marks (0-100)"
          min="0"
          max="100"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Results'}
        </button>
      </form>
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Recent Results</h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Student</th>
                <th className="border p-2">Subject</th>
                <th className="border p-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 3).map((result) => (
                <tr key={result._id} className="hover:bg-gray-100">
                  <td className="border p-2">{result.student?.name || 'Unknown'}</td>
                  <td className="border p-2">{result.subject}</td>
                  <td className="border p-2">{result.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Component for leave application
function LeaveApplicationFormTeacher() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.leaves);
  const [formData, setFormData] = useState({ date: '', reason: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    dispatch(submitLeave(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        const { leave } = result.payload;
        setMessage(`Leave submitted by ${leave.teacher?.name || 'You'} (${leave.teacher?.email || 'N/A'})! Status: ${leave.status}`);
        setFormData({ date: '', reason: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.payload || 'Failed to submit leave');
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Apply for Leave</h2>
      {message && (
        <p className={message.includes('submitted') ? 'text-green-600 mb-2' : 'text-red-500 mb-2'}>
          {message}
        </p>
      )}
      {loading && <p className="text-gray-500">Submitting...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmitLeave} className="flex flex-col gap-2">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Enter your reason for leave..."
          className="border p-2 rounded h-24"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Leave Application'}
        </button>
      </form>
    </div>
  );
}

// Component for sending feedback
function FeedbackFormTeacher() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.feedback);
  const [feedback, setFeedback] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    dispatch(submitFeedback({ feedback })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setResponseMsg(`Feedback submitted successfully! Status: ${result.payload.feedback.status}`);
        setFeedback('');
        setTimeout(() => setResponseMsg(''), 3000);
      } else {
        setResponseMsg(result.payload || 'Failed to submit feedback');
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Send Feedback to HOD</h2>
      {responseMsg && (
        <p className={responseMsg.includes('successfully') ? 'text-green-600 mb-2' : 'text-red-500 mb-2'}>
          {responseMsg}
        </p>
      )}
      {loading && <p className="text-gray-500">Submitting...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-2">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          className="border p-2 rounded h-24"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { loading: attendanceLoading } = useSelector((state) => state.attendance);
  
  // Redirect if not a teacher
  useEffect(() => {
    console.log('Auth state on mount:', { token, user });
    if (!token || !user || user.role !== 'Teacher') {
      navigate('/login');
    } else {
      dispatch(fetchStudentsForAttendance());
    }
  }, [token, user, navigate, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchStudentsForAttendance());
  };

  if (!token || !user || user.role !== 'Teacher') return null; // Prevent render until redirect

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={attendanceLoading}
        >
          {attendanceLoading ? 'Refreshing...' : 'Refresh Students'}
        </button>
      </div>
      
      <div className="mt-4 border p-4 rounded shadow bg-white">
        <AttendanceMarking />
      </div>
      
      <div className="mt-4 border p-4 rounded shadow bg-white">
        <ResultsEntry />
      </div>
      
      <div className="mt-4 border p-4 rounded shadow bg-white">
        <LeaveApplicationFormTeacher />
      </div>
      
      <div className="mt-4 border p-4 rounded shadow bg-white">
        <FeedbackFormTeacher />
      </div>
    </div>
  );
}

export default TeacherDashboard;