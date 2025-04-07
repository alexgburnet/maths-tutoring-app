// src/pages/tabs/AdminQuizTab.jsx
import { useEffect, useState } from 'react';
import QuizService from '/src/services/QuizService';
import AdminQuizTopicModal from '../AdminQuizTopicModal';
import { FaTrash } from 'react-icons/fa';
import './AdminQuizTab.css'; // Make sure CSS is imported

export default function AdminQuizTab() {
    const [topicsByCategory, setTopicsByCategory] = useState({}); // Changed state shape
    const [loading, setLoading] = useState(true);
    const [openTopicId, setOpenTopicId] = useState(null);

    const loadTopics = async () => {
        setLoading(true);
        try {
            const data = await QuizService.getTopics();
            // Group topics by category
            const grouped = data.reduce((acc, topic) => {
                const category = topic.category || 'Uncategorised';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(topic);
                // Sort topics within category alphabetically
                acc[category].sort((a, b) => a.name.localeCompare(b.name));
                return acc;
            }, {});
            
            // Sort categories alphabetically, keeping 'Uncategorised' last
            const sortedCategories = Object.keys(grouped).sort((a, b) => {
                if (a === 'Uncategorised') return 1;
                if (b === 'Uncategorised') return -1;
                return a.localeCompare(b);
            });

            const sortedGrouped = {};
            for (const category of sortedCategories) {
                sortedGrouped[category] = grouped[category];
            }

            setTopicsByCategory(sortedGrouped);
        } catch (error) {
            console.error("Failed to load topics:", error);
            // Handle error state if needed
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this topic and ALL its questions/rubrics?")) {
             try {
                 await QuizService.deleteTopic(id);
                 await loadTopics(); // Reload after delete
             } catch (error) {
                 console.error("Failed to delete topic:", error);
                 alert('Failed to delete topic.');
             }
        }
    };

    const handleCreate = async () => {
        const name = prompt("Enter new topic name:");
        if (!name) return;
        const category = prompt("Enter category (optional, defaults to Uncategorised):");
        try {
            await QuizService.createTopic({ name, category: category || 'Uncategorised' });
            await loadTopics(); // Reload after create
        } catch (error) {
            console.error("Failed to create topic:", error);
            alert('Failed to create topic.');
        }
    };

    // Function to be called when modal closes and category might have changed
    const handleModalClose = () => {
        setOpenTopicId(null);
        loadTopics(); // Reload topics in case category was changed
    };

    useEffect(() => {
        loadTopics();
    }, []);

    if (loading) {
        return <p>Loading topics...</p>;
    }

    return (
        <div className="quiz-admin-panel">
            <div className="quiz-header">
                <h2>Quiz Topics & Subtopics</h2>
                <button onClick={handleCreate} className="create-button">+ New Topic</button>
            </div>

            {Object.keys(topicsByCategory).length === 0 ? (
                 <p>No topics created yet.</p>
             ) : (
                 Object.entries(topicsByCategory).map(([category, topics]) => (
                     <div key={category} className="category-group">
                         <h3 className="category-title">{category}</h3>
                         <div className="quiz-topic-cards">
                             {topics.map((topic) => (
                                 <div
                                     key={topic.id}
                                     className="quiz-topic-card"
                                     onClick={() => setOpenTopicId(topic.id)}
                                     style={{ cursor: 'pointer' }}
                                 >
                                     <div className="quiz-card-header">
                                         <h4>{topic.name}</h4> {/* Use h4 for topic name */} 
                                         <button
                                             onClick={(e) => handleDelete(e, topic.id)}
                                             className="delete-button small-button"
                                             title="Delete topic"
                                         >
                                             <FaTrash />
                                         </button>
                                     </div>
                                     {/* Maybe add question count or other info here later */}
                                 </div>
                             ))}
                         </div>
                     </div>
                 ))
             )}

            {openTopicId && (
                // Pass the updated close handler to reload topics
                <AdminQuizTopicModal topicId={openTopicId} onClose={handleModalClose} />
            )}
        </div>
    );
}