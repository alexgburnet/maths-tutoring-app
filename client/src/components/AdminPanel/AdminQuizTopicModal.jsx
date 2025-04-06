import { useEffect, useState } from 'react';
import QuizService from '/src/services/QuizService';
import './AdminQuizTopicModal.css';

export default function AdminQuizTopicModal({ topicId, onClose }) {
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [openRubricId, setOpenRubricId] = useState(null);
    const [rubrics, setRubrics] = useState({});
    const [newQuestionTier, setNewQuestionTier] = useState('Foundation'); // Default tier

    const load = async () => {
        const allTopics = await QuizService.getTopics();
        const currentTopic = allTopics.find(t => t.id === parseInt(topicId));
        setTopic(currentTopic);
        const subtopics = await QuizService.getQuestions(topicId);
        setQuestions(subtopics);
    };

    const loadRubrics = async (questionId) => {
        const data = await QuizService.getRubricsForQuestion(questionId);
        const byScore = Object.fromEntries(data.map(r => [r.score, { ...r }]));
        setRubrics((prev) => ({ ...prev, [questionId]: byScore }));
    };

    const handleRubricChange = (questionId, score, value) => {
        setRubrics((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [score]: { ...prev[questionId]?.[score], description: value }
            }
        }));
    };

    const saveRubric = async (questionId, score) => {
        const entry = rubrics[questionId]?.[score];
        if (!entry.description) return;

        if (entry.id) {
            await QuizService.updateRubric(entry.id, entry);
        } else {
            await QuizService.createRubric({ question_id: questionId, score, description: entry.description });
        }
    };

    const addQuestion = async () => {
        const title = prompt("Enter subtopic/question title:");
        if (!title) return;
        await QuizService.createQuestion({ title, topic_id: topicId, tier: newQuestionTier });
        await load();
    };

    const deleteQuestion = async (e, id) => {
        e.stopPropagation();
        await QuizService.deleteQuestion(id);
        await load();
    };

    const updateWeight = (questionId, newWeight) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId ? { ...q, weight: newWeight } : q
            )
        );
    };

    const saveWeight = async (questionId) => {
        const question = questions.find(q => q.id === questionId);
        await QuizService.updateQuestion(questionId, { weight: parseFloat(question.weight) });
    };

    useEffect(() => {
        load();
    }, [topicId]);

    return (
        <div className="quiz-modal-overlay">
            <div className="quiz-modal">
                <div className="quiz-modal-header">
                    <h2>{topic?.name} – Subtopics</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="add-question-controls">
                    <select
                        value={newQuestionTier}
                        onChange={(e) => setNewQuestionTier(e.target.value)}
                        className="tier-select"
                    >
                        <option value="Foundation">Foundation</option>
                        <option value="Higher">Higher</option>
                    </select>
                    <button onClick={addQuestion} className="create-button">+ Add Subtopic</button>
                </div>

                <ul className="question-list">
                    {questions.map((q) => (
                        <li key={q.id} className="question-item">
                            <div className="question-header" onClick={async () => {
                                if (openRubricId === q.id) {
                                    setOpenRubricId(null);
                                } else {
                                    await loadRubrics(q.id);
                                    setOpenRubricId(q.id);
                                }
                            }}>
                                <div className="question-title">
                                    {q.title} - 
                                    <span className="tier-badge">{q.tier}</span>
                                </div>
                                <div className="question-actions">
                                    <button onClick={(e) => deleteQuestion(e, q.id)}>Delete</button>
                                </div>
                            </div>

                            {openRubricId === q.id && (
                                <div className="subtopic-weight-row">
                                    <label htmlFor={`weight-${q.id}`}>Weight:</label>
                                    <input
                                        type="number"
                                        id={`weight-${q.id}`}
                                        step="0.1"
                                        min="0"
                                        value={q.weight || ''}
                                        onChange={(e) => updateWeight(q.id, e.target.value)}
                                    />
                                    <button onClick={() => saveWeight(q.id)}>Save Weight</button>
                                </div>
                            )}

                            {openRubricId === q.id && (
                                <div className="rubric-editor">
                                    {[0, 1, 2, 3, 4, 5].map(score => (
                                        <div key={score} className="rubric-row">
                                            <span className="rubric-score">{score}</span>
                                            <input
                                                type="text"
                                                value={rubrics[q.id]?.[score]?.description || ''}
                                                onChange={(e) => handleRubricChange(q.id, score, e.target.value)}
                                                placeholder={`Enter rubric for score ${score}`}
                                            />
                                            <button onClick={() => saveRubric(q.id, score)} className="save-button">
                                                Save
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}