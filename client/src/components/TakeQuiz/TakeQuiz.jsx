import { useEffect, useState } from 'react';
import QuizService from '/src/services/QuizService';
import './TakeQuiz.css';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';

export default function TakeQuiz() {
  const [topics, setTopics] = useState([]); // [{ name, category, questions: [...] }]
  const [rubrics, setRubrics] = useState({});
  const [answers, setAnswers] = useState({});
  const [topicIndex, setTopicIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sliderValue, setSliderValue] = useState(3);
  const [showSplash, setShowSplash] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const load = async () => {
      const allTopics = await QuizService.getQuizTopics();
      const topicList = [];
      const rubricMap = {};
      const initialAnswers = {};

      for (let topic of allTopics) {
      const qs = await QuizService.getQuizQuestions(topic.id);
      for (let q of qs) {
          const r = await QuizService.getQuizRubrics(q.id);
          rubricMap[q.id] = Object.fromEntries(r.map(d => [d.score, d.description]));
          initialAnswers[q.id] = 3; // 🟢 Set default score
      }
      topicList.push({ ...topic, questions: qs });
      }

      setTopics(topicList);
      setRubrics(rubricMap);
      setAnswers(initialAnswers);

    for (let topic of topicList) {
      for (let q of topic.questions) {
        initialAnswers[q.id] = 3; // Default all sliders to 3
      }
    }

      setTopics(topicList);
      setRubrics(rubricMap);
      setLoading(false);
      setAnswers(initialAnswers);
      setSliderValue(3); // Default value
    };
    load();
  }, []);

  const currentTopic = topics[topicIndex];
  const currentQuestion = currentTopic?.questions[questionIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const currentIndex = topics
  .slice(0, topicIndex)
  .reduce((acc, t) => acc + t.questions.length, 0) + questionIndex + 1;

  const handleSliderChange = (e) => {
    const score = parseInt(e.target.value);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: score }));
    setSliderValue(score); // Animate this
  };

  const next = () => {
    if (questionIndex < currentTopic.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else if (topicIndex < topics.length - 1) {
      setTopicIndex(prev => prev + 1);
      setQuestionIndex(0);
    }
  };

  const back = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    } else if (topicIndex > 0) {
      const prevTopic = topics[topicIndex - 1];
      setTopicIndex(prev => prev - 1);
      setQuestionIndex(prevTopic.questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    const payload = Object.entries(answers).map(([questionId, score]) => ({
      question_id: parseInt(questionId),
      confidence_score: score,
    }));
    await QuizService.submitAssessment(payload);
    setShowThankYou(true);
  };

  if (loading) return <div className="loading">Loading quiz...</div>;

  const total = topics.reduce((acc, t) => acc + t.questions.length, 0);
  const progress = Object.keys(answers).length;

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <h1>Welcome to the Self-Assessment Quiz</h1>
          <p>
            This quiz helps you reflect on your confidence in each topic. We'll use your responses — 
            along with the number of weeks left until your exam — to build a detailed, personalised revision plan
            designed to boost your progress and maximise your results.
          </p>
          <button className="start-button" onClick={() => setShowSplash(false)}>Start Quiz</button>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="thank-you-screen">
        <div className="thank-you-content">
          <h1>Thanks for completing the quiz!</h1>
          <p>
            Your results are now being used to generate a personalised topic-by-topic revision plan 
            based on your confidence levels and the number of weeks left until your exam.
          </p>
          <p>We’ll notify you once your plan is ready!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Quiz</h1>
        <hr className="page-separator" />
      </div>

      <div className="page-container">
        <div className="quiz-progress-info">
            Question {currentIndex} of {total}
            </div>

            <div className="quiz-progress">
            <div
                className="quiz-progress-bar"
                style={{ width: `${(currentIndex / total) * 100}%` }}
            ></div>
        </div>

        <AnimatePresence mode="wait">
        <motion.div
            key={`${topicIndex}-${questionIndex}`}
            className="quiz-content"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
        >
          <h2 className="quiz-topic">{currentTopic.name}</h2>
          <h3 className="quiz-title">{currentQuestion.title}</h3>

          <input
            type="range"
            min={1}
            max={5}
            value={currentAnswer ?? 3} // Default slider starts at 3
            onChange={handleSliderChange}
            className="quiz-slider"
          />
          <div className="quiz-slider-labels">
            {[1, 2, 3, 4, 5].map(score => (
              <span key={score}>{score}</span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentAnswer !== undefined && (
                <motion.div
                key={currentAnswer}
                className="rubric-description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                layout
                >
                {renderWithMath(rubrics[currentQuestion.id]?.[currentAnswer] || 'No description yet')}
                </motion.div>
            )}
            </AnimatePresence>

          <div className="quiz-nav">
            <button onClick={back} disabled={topicIndex === 0 && questionIndex === 0}>
              Back
            </button>
            {(topicIndex === topics.length - 1 && questionIndex === currentTopic.questions.length - 1) ? (
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== total}
              >
                Submit
              </button>
            ) : (
              <button onClick={next} disabled={currentAnswer === undefined}>
                Next
              </button>
            )}
          </div>
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function renderWithMath(text) {
    const parts = text.split(/(\$[^$]*\$)/g); // Split on $...$
  
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return (
          <div key={index} className="latex-block">
            <BlockMath math={part.slice(1, -1)} />
          </div>
        );
      }
      return part.trim() ? <p key={index}>{part}</p> : null;
    });
  }