import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { journeyService } from '../services/journeyService';
import { userService } from '../services/userService';
import type { Journey } from '../types/journey';
import type { User } from '../types/user';
import Layout from '../components/Layout';

const JourneyAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
    // Pre-select student if coming from StudentList
    const studentId = searchParams.get('studentId');
    if (studentId) {
      setSelectedStudentIds(new Set([parseInt(studentId)]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [journeyResponse, studentResponse] = await Promise.all([
        journeyService.getJourneys({ page: 1, pageSize: 100 }),
        userService.getLearners({ page: 1, pageSize: 100 }),
      ]);
      setJourneys(journeyResponse.journeys);
      setStudents(studentResponse.users);
    } catch (err) {
      console.error('Error loading data:', err);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: number) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  const handleSelectAll = () => {
    const filteredStudents = students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedJourneyId) {
      setMessage({ type: 'error', text: 'Please select a journey' });
      return;
    }
    
    if (selectedStudentIds.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one student' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      
      const userIds = Array.from(selectedStudentIds);
      await userService.assignJourney(selectedJourneyId, { userIds });
      
      setMessage({
        type: 'success',
        text: `Successfully assigned journey to ${userIds.length} student${userIds.length > 1 ? 's' : ''}`,
      });
      
      // Reset form
      setTimeout(() => {
        navigate('/students');
      }, 1500);
    } catch (err) {
      console.error('Error assigning journey:', err);
      setMessage({ type: 'error', text: 'Failed to assign journey' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedJourney = journeys.find(j => j.id === selectedJourneyId);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">🎯 Assign Journey</h2>
          <p className="mt-1 text-sm text-gray-500">Select a journey and students to assign</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Journey Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Journey</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {journeys.map((journey) => (
                    <label
                      key={journey.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedJourneyId === journey.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="journey"
                        value={journey.id}
                        checked={selectedJourneyId === journey.id}
                        onChange={() => setSelectedJourneyId(journey.id)}
                        className="sr-only"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{journey.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {journey.language?.name} • {journey.topics?.length || 0} topics
                        </div>
                        {journey.description && (
                          <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {journey.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Student Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Select Students ({selectedStudentIds.size})
                  </h3>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {selectedStudentIds.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Student List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedStudentIds.has(student.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.has(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{student.name}</div>
                        <div className="text-sm text-gray-500 truncate">@{student.username}</div>
                      </div>
                    </label>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No students found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary & Submit */}
            {selectedJourneyId && selectedStudentIds.size > 0 && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Assignment Summary</h4>
                <p className="text-gray-700">
                  Assigning <span className="font-semibold">{selectedJourney?.name}</span> to{' '}
                  <span className="font-semibold">{selectedStudentIds.size}</span> student
                  {selectedStudentIds.size > 1 ? 's' : ''}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </Layout>
  );
};

export default JourneyAssignment;
