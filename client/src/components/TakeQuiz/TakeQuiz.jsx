import { useEffect, useState } from 'react';
import QuizService from '/src/services/QuizService';
import PlanService from '/src/services/PlanService';
import './TakeQuiz.css';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';

export default function TakeQuiz() {
  const [topics, setTopics] = useState([]);
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
      try {
        const allTopics = await QuizService.getQuizTopics({ useUserPaper: true });
        const topicList = [];
        const rubricMap = {};
        const initialAnswers = {};

        for (const topic of allTopics) {
          const questions = await QuizService.getQuizQuestions(topic.id, { useUserPaper: true });
          for (const q of questions) {
            const r = await QuizService.getQuizRubrics(q.id);
            rubricMap[q.id] = Object.fromEntries(r.map(d => [d.score, d.description]));
            initialAnswers[q.id] = 3;
          }
          topicList.push({ ...topic, questions });
        }

        setTopics(topicList);
        setRubrics(rubricMap);
        setAnswers(initialAnswers);
        setSliderValue(3);
      } catch (err) {
        console.error("❌ Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentTopic = topics[topicIndex];
  const currentQuestion = currentTopic?.questions[questionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  const total = topics.reduce((acc, t) => acc + t.questions.length, 0);
  const currentIndex = topics
    .slice(0, topicIndex)
    .reduce((acc, t) => acc + t.questions.length, 0) + questionIndex + 1;

  const handleSliderChange = (e) => {
    const score = parseInt(e.target.value);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: score }));
    setSliderValue(score);
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

    try {
      console.log("Submitting quiz assessment...");
      await QuizService.submitAssessment(payload);
      console.log("Assessment submitted successfully.");

      try {
        console.log("Generating weekly plan...");
        await PlanService.generatePlan();
        console.log("Plan generation triggered successfully.");
      } catch (planError) {
        console.error("❌ Failed to trigger plan generation:", planError);
      }

      setShowThankYou(true);

    } catch (submitError) {
      console.error("❌ Failed to submit quiz assessment:", submitError);
      alert("Failed to submit quiz results. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <h1>Self-Assessment Quiz</h1>
          <p>This quiz helps us build a personalised learning plan for our tutorials.</p>
          <p>Based on your confidence in each topic — and how many weeks are left until your exam — we'll create a weekly plan that maximises your progress and exam results.</p>
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
          <p>Your responses have been saved. We're now generating a detailed plan, tailored to your goals and time left before your exam.</p>
          <p>You'll see your plan on your dashboard shortly.</p>
        </div>
      </div>
    );
  }

  if (!currentTopic || !currentQuestion) {
    return <div className="loading">Loading question...</div>;
  }

  return (
    <div className="page-container dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Quiz</h1>
        <hr className="page-separator" />
      </div>

      <div className="quiz-progress-info">Question {currentIndex} of {total}</div>
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
            value={currentAnswer ?? 3}
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
  );
}

function renderWithMath(text) {
  const parts = text.split(/(\$[^$]*\$)/g);
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