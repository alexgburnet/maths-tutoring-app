// src/pages/tabs/AdminQuizTab.jsx
import { useEffect, useState } from 'react';
import QuizService from '/src/services/QuizService';
import AdminQuizTopicModal from '../AdminQuizTopicModal';
import { FaTrash } from 'react-icons/fa';

export default function AdminQuizTab() {
    const [topics, setTopics] = useState([]);
    const [openTopicId, setOpenTopicId] = useState(null);

    const loadTopics = async () => {
        const data = await QuizService.getTopics();
        setTopics(data);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // prevent opening the modal
        await QuizService.deleteTopic(id);
        await loadTopics();
    };

    const handleCreate = async () => {
        const name = prompt("Enter new topic name:");
        if (!name) return;
        await QuizService.createTopic({ name });
        await loadTopics();
    };

    useEffect(() => {
        loadTopics();
    }, []);

    return (
        <div className="quiz-admin-panel">
            <div className="quiz-header">
                <h2>Quiz Topics</h2>
                <button onClick={handleCreate} className="create-button">+ New Topic</button>
            </div>

            <div className="quiz-topic-cards">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        className="quiz-topic-card"
                        onClick={() => setOpenTopicId(topic.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="quiz-card-header">
                            <h3>{topic.name}</h3>
                            <button
                                onClick={(e) => handleDelete(e, topic.id)}
                                className="delete-button"
                                title="Delete topic"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {openTopicId && (
                <AdminQuizTopicModal topicId={openTopicId} onClose={() => setOpenTopicId(null)} />
            )}
        </div>
    );
}