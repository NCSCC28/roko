import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, CheckCircle, XCircle, RotateCw } from 'lucide-react';

interface QuizQuestion {
  id: string;
  religion: string;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

interface QuizState {
  currentQuestion: number;
  selectedAnswer: string | null;
  answered: boolean;
  score: number;
  totalQuestions: number;
}

export default function QuizPage() {
  const [religion, setReligion] = useState<'gita' | 'bible' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswer: null,
    answered: false,
    score: 0,
    totalQuestions: 5
  });
  const [showResult, setShowResult] = useState(false);

  const loadQuestions = async () => {
    if (!religion) return;

    setLoading(true);
    try {
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .eq('religion', religion);

      if (difficulty !== 'all') {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query.limit(numQuestions);

      if (error) throw error;

      if (data && data.length > 0) {
        const shuffledQuestions = (data as QuizQuestion[]).sort(() => Math.random() - 0.5).slice(0, numQuestions);
        setQuestions(shuffledQuestions);
        setQuizStarted(true);
        setQuizState({
          currentQuestion: 0,
          selectedAnswer: null,
          answered: false,
          score: 0,
          totalQuestions: shuffledQuestions.length
        });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[quizState.currentQuestion];
  const options = currentQuestion
    ? [
        { key: 'A', text: currentQuestion.option_a },
        { key: 'B', text: currentQuestion.option_b },
        { key: 'C', text: currentQuestion.option_c },
        { key: 'D', text: currentQuestion.option_d }
      ]
    : [];

  const handleAnswerClick = (answer: string) => {
    if (!quizState.answered) {
      setQuizState(prev => ({
        ...prev,
        selectedAnswer: answer,
        answered: true,
        score: answer === currentQuestion.correct_answer ? prev.score + 1 : prev.score
      }));
      setShowResult(true);
    }
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < quizState.totalQuestions - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        answered: false
      }));
      setShowResult(false);
    }
  };

  const handleRestartQuiz = () => {
    setReligion(null);
    setDifficulty('all');
    setQuizStarted(false);
    setQuestions([]);
    setQuizState({
      currentQuestion: 0,
      selectedAnswer: null,
      answered: false,
      score: 0,
      totalQuestions: 5
    });
    setShowResult(false);
  };

  const scorePercentage = Math.round((quizState.score / quizState.totalQuestions) * 100);
  const isQuizComplete = quizState.currentQuestion === quizState.totalQuestions - 1 && quizState.answered;

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-12">
            <BarChart3 className="h-10 w-10 text-green-600 dark:text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sacred Texts Quiz</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Religious Text</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setReligion('gita')}
                    className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      religion === 'gita'
                        ? 'bg-amber-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Bhagavad Gita
                  </button>
                  <button
                    onClick={() => setReligion('bible')}
                    className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      religion === 'bible'
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    The Bible
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Difficulty</h3>
                <div className="space-y-3">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Number of Questions: {numQuestions}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={loadQuestions}
              disabled={!religion || loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Loading Questions...' : 'Start Quiz'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Bhagavad Gita</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">Test your knowledge of Krishna's teachings, Yoga paths, and Hindu philosophy.</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">The Bible</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">Explore Biblical history, teachings, Commandments, and Christian values.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isQuizComplete ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              {scorePercentage >= 80 ? (
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              ) : scorePercentage >= 60 ? (
                <BarChart3 className="h-20 w-20 text-blue-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-20 w-20 text-orange-500 mx-auto mb-4" />
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
            <p className="text-6xl font-bold text-green-600 dark:text-green-500 mb-4">{scorePercentage}%</p>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <p className="text-xl text-gray-900 dark:text-white font-semibold">
                You answered <span className="text-green-600 dark:text-green-500">{quizState.score}</span> out of{' '}
                <span className="text-blue-600 dark:text-blue-500">{quizState.totalQuestions}</span> questions correctly.
              </p>
            </div>

            {scorePercentage >= 80 && (
              <p className="text-lg text-green-600 dark:text-green-400 font-semibold mb-6">
                Excellent! You have strong knowledge of these scriptures.
              </p>
            )}
            {scorePercentage >= 60 && scorePercentage < 80 && (
              <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-6">
                Good effort! Keep exploring to deepen your understanding.
              </p>
            )}
            {scorePercentage < 60 && (
              <p className="text-lg text-orange-600 dark:text-orange-400 font-semibold mb-6">
                Keep learning! Try exploring the verses and taking the quiz again.
              </p>
            )}

            <button
              onClick={handleRestartQuiz}
              className="flex items-center justify-center space-x-2 mx-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RotateCw className="h-5 w-5" />
              <span>Take Another Quiz</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Question {quizState.currentQuestion + 1} of {quizState.totalQuestions}
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                  Score: {quizState.score}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((quizState.currentQuestion + 1) / quizState.totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold mb-4">
                  {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3 mb-8">
                {options.map((option) => {
                  const isSelected = quizState.selectedAnswer === option.key;
                  const isCorrect = option.key === currentQuestion.correct_answer;
                  const showCorrect = quizState.answered && isCorrect;
                  const showIncorrect = quizState.answered && isSelected && !isCorrect;

                  return (
                    <button
                      key={option.key}
                      onClick={() => handleAnswerClick(option.key)}
                      disabled={quizState.answered}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        showCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : showIncorrect
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${quizState.answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold flex-shrink-0 ${
                            showCorrect
                              ? 'bg-green-500 text-white'
                              : showIncorrect
                              ? 'bg-red-500 text-white'
                              : isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {option.key}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{option.text}</p>
                          {showCorrect && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Correct</p>}
                          {showIncorrect && <p className="text-xs text-red-600 dark:text-red-400 mt-1">Incorrect</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`rounded-lg p-4 mb-6 ${
                  quizState.selectedAnswer === currentQuestion.correct_answer
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                }`}>
                  <p className={`font-semibold mb-2 ${
                    quizState.selectedAnswer === currentQuestion.correct_answer
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-orange-900 dark:text-orange-100'
                  }`}>
                    {quizState.selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Not quite right!'}
                  </p>
                  <p className={quizState.selectedAnswer === currentQuestion.correct_answer
                    ? 'text-green-800 dark:text-green-200 text-sm'
                    : 'text-orange-800 dark:text-orange-200 text-sm'
                  }>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {quizState.answered && (
                <button
                  onClick={handleNextQuestion}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                    isQuizComplete
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isQuizComplete ? 'Quiz Complete' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
