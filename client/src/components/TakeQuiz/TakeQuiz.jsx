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
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
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

        await Promise.all(allTopics.map(async (topic) => {
          const questions = await QuizService.getQuizQuestions(topic.id, { useUserPaper: true });
          await Promise.all(questions.map(async (q) => {
            const r = await QuizService.getQuizRubrics(q.id);
            rubricMap[q.id] = Object.fromEntries(r.map(d => [d.score, d.description]));
            initialAnswers[q.id] = 3;
          }));
          topicList.push({ ...topic, questions });
        }));

        topicList.sort((a, b) => a.id - b.id);

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
    const nextQId = topics[topicIndex]?.questions[questionIndex + 1]?.id || topics[topicIndex + 1]?.questions[0]?.id;
    if (nextQId) {
        setSliderValue(answers[nextQId] ?? 3);
    }
  };

  const back = () => {
    let prevQId;
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
      prevQId = currentTopic.questions[questionIndex - 1].id;
    } else if (topicIndex > 0) {
      const prevTopic = topics[topicIndex - 1];
      setTopicIndex(prev => prev - 1);
      const lastQuestionIndex = prevTopic.questions.length - 1;
      setQuestionIndex(lastQuestionIndex);
      prevQId = prevTopic.questions[lastQuestionIndex].id;
    }
    if (prevQId) {
        setSliderValue(answers[prevQId] ?? 3);
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

      setIsGeneratingPlan(true);

      try {
        console.log("Generating weekly plan...");
        await PlanService.generatePlan();
        console.log("Plan generation triggered successfully.");
        setShowThankYou(true);
      } catch (planError) {
        console.error("❌ Failed to trigger plan generation:", planError);
        alert("Your assessment was saved, but we couldn't generate your plan right now. Please check your dashboard later or contact support.");
        setShowThankYou(false);
      } finally {
         setIsGeneratingPlan(false);
      }

    } catch (submitError) {
      console.error("❌ Failed to submit quiz assessment:", submitError);
      alert("Failed to submit quiz results. Please try again.");
      setIsGeneratingPlan(false);
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
          <h1>Thank You!</h1>
          <p>Your assessment is complete. We've generated a personalised study plan based on your answers.</p>
          <p>You can view your weekly plan now on your Dashboard.</p>
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

      <div className="quiz-main-area">
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
              <button onClick={back} disabled={(topicIndex === 0 && questionIndex === 0) || isGeneratingPlan}>
                Back
              </button>
              {(topicIndex === topics.length - 1 && questionIndex === currentTopic.questions.length - 1) ? (
                <button
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={Object.values(answers).some(a => a === undefined || a === null) || isGeneratingPlan}
                >
                  Submit
                </button>
              ) : (
                <button onClick={next} disabled={currentAnswer === undefined || isGeneratingPlan}>
                  Next
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {isGeneratingPlan && (
          <div className="loading-overlay">
              <div className="loading-content">
                  <div className="spinner"></div>
                  <p>Generating your personalised plan...</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderWithMath(text) {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]*?\$\$)|(\$[^$]*\$)|(\\\[[\s\S]*?\\\])|(\\\([^)]*\\\))/g);

  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={index} math={part.slice(2, -2)} />;
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={index} math={part.slice(1, -1)} />;
    }
     if (part.startsWith('\\[') && part.endsWith('\\]')) {
       return <BlockMath key={index} math={part.slice(2, -2)} />;
     }
     if (part.startsWith('\\(') && part.endsWith('\\)')) {
       return <InlineMath key={index} math={part.slice(2, -2)} />;
     }
    return part.split('\\n').map((line, lineIndex) => line.trim() ? <p key={`${index}-${lineIndex}`}>{line}</p> : null);
  }).flat().filter(Boolean);
}