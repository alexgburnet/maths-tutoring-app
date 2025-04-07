import { useEffect, useState } from 'react';
import QuizService from '/src/services/QuizService';
import './AdminQuizTopicModal.css';

export default function AdminQuizTopicModal({ topicId, onClose }) {
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [openRubricId, setOpenRubricId] = useState(null);
    const [rubrics, setRubrics] = useState({});
    const [newQuestionTier, setNewQuestionTier] = useState('Foundation');
    const [topicCategory, setTopicCategory] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    const load = async () => {
        const allTopics = await QuizService.getTopics();
        const currentTopic = allTopics.find(t => t.id === parseInt(topicId));
        setTopic(currentTopic);
        setTopicCategory(currentTopic?.category || 'Uncategorised');
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
        if (!entry?.description?.trim()) return;

        if (entry.id) {
            await QuizService.updateRubric(entry.id, { description: entry.description });
        } else {
            await QuizService.createRubric({ question_id: questionId, score, description: entry.description });
        }
    };

    const addQuestion = async () => {
        const title = prompt("Enter subtopic/question title:");
        if (!title) return;
    
        const tierValue = newQuestionTier === "Foundation" ? "F" : "H";
        await QuizService.createQuestion({ title, topic_id: topicId, tier: tierValue });
        await load();
    };

    const deleteQuestion = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this question and its rubrics?')) {
            await QuizService.deleteQuestion(id);
            await load();
        }
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
        if (question && !isNaN(parseFloat(question.weight))) {
            await QuizService.updateQuestion(questionId, { weight: parseFloat(question.weight) });
        } else {
            alert('Invalid weight value.');
        }
    };

    const handleSaveCategory = async () => {
        if (!topicCategory.trim()) {
            alert('Please enter a category name.');
            return;
        }
        setIsSavingCategory(true);
        try {
            await QuizService.updateTopic(topicId, { category: topicCategory.trim() });
            setTopic(prev => ({ ...prev, category: topicCategory.trim() }));
            alert('Category updated!');
        } catch (error) {
            console.error("Failed to save category:", error);
            alert('Failed to save category.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    useEffect(() => {
        load();
    }, [topicId]);

    return (
        <div className="quiz-modal-overlay" onClick={onClose}>
            <div className="quiz-modal" onClick={e => e.stopPropagation()}>
                <div className="quiz-modal-header">
                    <h2>{topic?.name} – Details</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="topic-category-editor">
                    <label htmlFor="topic-category-input">Category:</label>
                    <input
                        id="topic-category-input"
                        type="text"
                        value={topicCategory}
                        onChange={(e) => setTopicCategory(e.target.value)}
                        placeholder="e.g., Algebra, Geometry"
                    />
                    <button
                        onClick={handleSaveCategory}
                        disabled={isSavingCategory || topicCategory === (topic?.category || 'Uncategorised')}
                        className="save-button"
                    >
                        {isSavingCategory ? 'Saving...' : 'Save Category'}
                    </button>
                </div>

                <hr className="modal-divider" />

                <h3>Subtopics / Questions</h3>
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
                                    <span className={`tier-badge tier-${q.tier}`}>{q.tier === 'F' ? 'Foundation' : 'Higher'}</span>
                                </div>
                                <div className="question-actions">
                                    <button onClick={(e) => deleteQuestion(e, q.id)} className="delete-button small-button">Delete</button>
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
                                        value={q.weight === null || q.weight === undefined ? '' : q.weight}
                                        onChange={(e) => updateWeight(q.id, e.target.value)}
                                    />
                                    <button onClick={() => saveWeight(q.id)} className="save-button small-button">Save Wgt</button>
                                </div>
                            )}

                            {openRubricId === q.id && (
                                <div className="rubric-editor">
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <div key={score} className="rubric-row">
                                            <span className="rubric-score">{score}</span>
                                            <input
                                                type="text"
                                                value={rubrics[q.id]?.[score]?.description || ''}
                                                onChange={(e) => handleRubricChange(q.id, score, e.target.value)}
                                                placeholder={`Enter rubric for score ${score}`}
                                            />
                                            <button onClick={() => saveRubric(q.id, score)} className="save-button small-button">
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