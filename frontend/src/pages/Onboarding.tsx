import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, aiAPI } from '../services/api';
import '../styles/Onboarding.css';

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState({
        studying: '',
        goals: '',
        focusAreas: [] as string[],
        dailyHours: 4,
    });
    const [loading, setLoading] = useState(false);
    const [aiKey, setAiKey] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) setAiKey(savedKey);
    }, []);

    const questions = [
        {
            question: "What's your Gemini API Key?",
            subtitle: "Get it from https://aistudio.google.com/app/apikey",
            type: "apiKey"
        },
        {
            question: "What are you currently studying?",
            subtitle: "E.g., Web Development, Data Structures, Machine Learning",
            type: "text",
            field: "studying"
        },
        {
            question: "What are your main goals?",
            subtitle: "What do you want to achieve in the next few months?",
            type: "textarea",
            field: "goals"
        },
        {
            question: "What are your focus areas?",
            subtitle: "Select or add your focus areas (press Enter to add)",
            type: "tags",
            field: "focusAreas",
            suggestions: ["DSA", "Development", "DevOps", "System Design", "Aptitude", "Interview Prep"]
        },
        {
            question: "How many hours can you study per day?",
            subtitle: "Be realistic with your time commitment",
            type: "number",
            field: "dailyHours"
        }
    ];

    const currentQuestion = questions[step];

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Save API key
            localStorage.setItem('gemini_api_key', aiKey);

            // Save profile
            await profileAPI.updateProfile({
                studying_topics: [responses.studying],
                goals: responses.goals,
                focus_areas: responses.focusAreas,
                daily_hours_target: responses.dailyHours,
                onboarding_completed: true
            });

            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to complete onboarding. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addFocusArea = (area: string) => {
        if (area && !responses.focusAreas.includes(area)) {
            setResponses({
                ...responses,
                focusAreas: [...responses.focusAreas, area]
            });
        }
    };

    const removeFocusArea = (area: string) => {
        setResponses({
            ...responses,
            focusAreas: responses.focusAreas.filter(a => a !== area)
        });
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="question-section">
                    <h2>{currentQuestion.question}</h2>
                    <p className="subtitle">{currentQuestion.subtitle}</p>

                    <div className="answer-section">
                        {currentQuestion.type === 'apiKey' && (
                            <input
                                type="password"
                                value={aiKey}
                                onChange={(e) => setAiKey(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                className="input-field"
                            />
                        )}

                        {currentQuestion.type === 'text' && (
                            <input
                                type="text"
                                value={responses[currentQuestion.field as keyof typeof responses] as string}
                                onChange={(e) => setResponses({ ...responses, [currentQuestion.field!]: e.target.value })}
                                placeholder="Type your answer..."
                                className="input-field"
                            />
                        )}

                        {currentQuestion.type === 'textarea' && (
                            <textarea
                                value={responses[currentQuestion.field as keyof typeof responses] as string}
                                onChange={(e) => setResponses({ ...responses, [currentQuestion.field!]: e.target.value })}
                                placeholder="Type your answer..."
                                className="textarea-field"
                                rows={4}
                            />
                        )}

                        {currentQuestion.type === 'tags' && (
                            <div className="tags-input">
                                <div className="suggestions">
                                    {currentQuestion.suggestions?.map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => addFocusArea(suggestion)}
                                            className={`suggestion-tag ${responses.focusAreas.includes(suggestion) ? 'active' : ''}`}
                                            disabled={responses.focusAreas.includes(suggestion)}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                                <div className="selected-tags">
                                    {responses.focusAreas.map(area => (
                                        <span key={area} className="selected-tag">
                                            {area}
                                            <button onClick={() => removeFocusArea(area)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentQuestion.type === 'number' && (
                            <div className="number-input">
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={responses.dailyHours}
                                    onChange={(e) => setResponses({ ...responses, dailyHours: Number(e.target.value) })}
                                    className="slider"
                                />
                                <div className="number-display">{responses.dailyHours} hours/day</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="button-section">
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)} className="btn-secondary">
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Saving...' : step === questions.length - 1 ? 'Complete' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
