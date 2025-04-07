import BookingService from '../../services/BookingService';
import PlanService from '../../services/PlanService';
import React, { useState, useEffect } from 'react';
import './BookingForm.css'; // optional styling

export default function BookingForm({ slot, onClose, onBooked }) {
  const [weeklyOptions, setWeeklyOptions] = useState([]); // Store processed week options { value: string, display: string }
  const [selectedTopicOption, setSelectedTopicOption] = useState(''); // 'custom' or 'week_1', 'week_2', etc.
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndProcessPlan = async () => {
      setFetchingPlan(true);
      setError('');
      try {
        const planData = await PlanService.getCurrentPlan();
        console.log("Fetched Plan Data:", planData);
        const options = [];
        if (planData && planData.weekly_plan) {
          const weekEntries = Object.entries(planData.weekly_plan)
            // Sort weeks numerically
            .sort(([weekA], [weekB]) => parseInt(weekA) - parseInt(weekB));

          weekEntries.forEach(([weekNum, entries]) => {
            if (entries && entries.length > 0) {
              // Find the first entry for the week (assuming sorted or just taking the first)
              const firstEntry = entries[0]; 
              // Optionally, filter out completed weeks/entries here if needed
              // if (firstEntry.completed) return;
              
              // Construct display name (e.g., "Week 1: Algebra")
              const displayName = `Week ${weekNum}: ${firstEntry.topic_name}`;
              // Construct value identifier
              const value = `week_${weekNum}`;
              
              options.push({
                value: value, 
                display: displayName,
                // Store the display name to easily retrieve it later for custom_topic
                _rawDisplayName: displayName 
              });
            }
          });
          console.log("Processed Weekly Options for Dropdown:", options);
          setWeeklyOptions(options);
        } else {
          console.log("No weekly plan found or plan format incorrect.");
          setWeeklyOptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch/process weekly plan:", err);
        setError("Could not load topics from your plan. Please enter a custom topic.");
        setWeeklyOptions([]);
      } finally {
        setFetchingPlan(false);
      }
    };

    if (slot) {
      fetchAndProcessPlan();
    }
  }, [slot]);

  if (!slot) return null;

  const handleTopicSelectionChange = (e) => {
    setSelectedTopicOption(e.target.value);
    setError('');
    if (e.target.value !== 'custom') {
      setCustomTopic('');
    }
  };

  const handleCustomTopicChange = (e) => {
    setCustomTopic(e.target.value);
    if (selectedTopicOption === 'custom') {
        setError('');
    }
  };

  const handleBooking = async () => {
    let topicData = {};
    let isValid = false;

    if (selectedTopicOption === 'custom') {
      if (!customTopic.trim()) {
        setError('Please enter your custom topic.');
      } else {
        topicData = { custom_topic: customTopic.trim() };
        isValid = true;
      }
    } else if (selectedTopicOption && selectedTopicOption.startsWith('week_')) {
        // Find the corresponding week option to get the display name
        const selectedWeek = weeklyOptions.find(opt => opt.value === selectedTopicOption);
        if (selectedWeek) {
            // Use the stored display name as the custom topic string
            topicData = { custom_topic: selectedWeek._rawDisplayName };
            isValid = true;
        } else {
             // Should not happen if state is managed correctly
             setError('Invalid week selection.');
        }
        
    } else {
      setError('Please select a topic option or choose custom.');
    }

    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      console.log("Booking with Slot ID:", slot.id, "and Topic Data:", topicData);
      await BookingService.createBooking(slot.id, topicData);
      if (onBooked) {
        onBooked();
      }
      onClose();
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.error || err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h3>Book Session</h3>
      <p><strong>Date & Time:</strong> {new Date(slot.start_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>

      <label htmlFor="topic-select">Topic:</label>
      {fetchingPlan ? (
        <p>Loading topics...</p>
      ) : (
        <select 
          id="topic-select"
          value={selectedTopicOption}
          onChange={handleTopicSelectionChange}
          required
          className='topic-select'
          disabled={loading}
        >
          <option value="" disabled>-- Select Topic --</option>
          {/* Add week options first */} 
          {weeklyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.display} {/* Display name like "Week 1: Algebra" */}
            </option>
          ))}
          {/* Custom option last */} 
          <option value="custom">Other (Custom Topic)</option> 
        </select>
      )}

      {/* Conditional input for custom topic */} 
      {selectedTopicOption === 'custom' && (
        <input
          id="custom-topic"
          type="text"
          value={customTopic}
          onChange={handleCustomTopicChange}
          placeholder="Enter your custom topic"
          required
          className='topic-input custom-topic-input'
          disabled={loading}
        />
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="booking-actions">
        <button onClick={onClose} disabled={loading} className='close'>Close</button>
        <button 
          onClick={handleBooking} 
          // Updated disabled logic
          disabled={loading || fetchingPlan || (!selectedTopicOption || (selectedTopicOption === 'custom' && !customTopic.trim()))} 
          className='book'
        >
          {loading ? 'Booking...' : 'Book Session'}
        </button>
      </div>
    </div>
  );
}