import React, { useState } from 'react';
import { TimelineComponentProps, TimelineEvent, TimelineData } from '../../types/timeline';

interface TimelineRejectionProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const TimelineRejectionComponent = ({ isOpen, onClose, message }: TimelineRejectionProps) => {
  if (!isOpen) return null;

  return (
    <div className="timeline-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="timeline-modal" style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        width: '90%',
        color: '#e0dede',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
      }}>
        <button 
          className="close-button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#e0dede'
          }}
        >
          ×
        </button>

        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
        
        <h2 style={{ 
          fontSize: '28px', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #ff9800, #f57c00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Timeline Not Suitable
        </h2>
        
        <div style={{
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          border: '2px solid #ff9800',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          <p style={{ fontSize: '16px', margin: 0 }}>
            {message}
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          border: '2px solid #2196f3',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#2196f3', marginTop: 0 }}>💡 Suggested Alternatives:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.2)', borderRadius: '8px' }}>
              🧠 <strong>MindMap</strong><br/>
              <small>Organize concepts</small>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgba(156, 39, 176, 0.2)', borderRadius: '8px' }}>
              🃏 <strong>Flashcards</strong><br/>
              <small>Memorize key points</small>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgba(255, 152, 0, 0.2)', borderRadius: '8px' }}>
              📝 <strong>Quiz</strong><br/>
              <small>Test knowledge</small>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '15px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🏠 Back to Options
        </button>
      </div>
    </div>
  );
};

export { TimelineRejectionComponent };

export const TimelineComponent = ({ 
  timelineData, 
  isOpen, 
  onClose, 
  onComplete 
}: TimelineComponentProps) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  // Handle rejection response
  if (timelineData && 'error' in timelineData && timelineData.error === 'TIMELINE_NOT_SUITABLE') {
    return (
      <TimelineRejectionComponent 
        isOpen={isOpen}
        onClose={onClose}
        message={timelineData.message}
      />
    );
  }

  // Type assertion after rejection check - ensuring it's TimelineData
  if (!timelineData || 'error' in timelineData) {
    return null;
  }
  
  const validTimelineData = timelineData;
  const currentEvent = validTimelineData.events[currentEventIndex];
  const totalEvents = validTimelineData.events.length;

  const handleNext = () => {
    if (currentEventIndex < totalEvents - 1) {
      setCurrentEventIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateString: string) => {
    // Handle different date precision levels
    if (!dateString) return 'Unknown Date';
    
    // Full date format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Month-Year format: YYYY-MM
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      const [year, month] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
      });
    }
    
    // Year only format: YYYY
    if (/^\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // Fallback for any other format
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      // Ignore error and return raw string
    }
    
    return dateString; // Return as-is if no pattern matches
  };

  return (
    <div className="timeline-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="timeline-modal" style={{
        backgroundColor: validTimelineData.theme.backgroundColor,
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '1000px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        width: '95%',
        color: validTimelineData.theme.textColor,
        fontFamily: validTimelineData.theme.fontFamily
      }}>
        <button 
          className="close-button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: validTimelineData.theme.textColor
          }}
        >
          ×
        </button>

        {/* Completion Screen */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🕐</div>
              <h2 style={{ fontSize: '32px', marginBottom: '15px', color: validTimelineData.theme.primaryColor }}>
                Timeline Complete!
              </h2>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                You've explored all {totalEvents} events!
              </p>
              <p style={{ fontSize: '16px', marginBottom: '30px', opacity: 0.8 }}>
                Timeline journey finished
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentEventIndex(0);
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🔄 Start Over
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: `linear-gradient(45deg, ${validTimelineData.theme.primaryColor}, #66bb6a)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🏠 Return Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '28px', 
            background: `linear-gradient(45deg, ${validTimelineData.theme.primaryColor}, #66bb6a)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
          }}>
            🕐 {validTimelineData.title}
          </h2>
          {validTimelineData.description && (
            <p style={{ margin: '10px 0', opacity: 0.8 }}>{validTimelineData.description}</p>
          )}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
            <div style={{ fontSize: '16px' }}>
              Event: {currentEventIndex + 1} / {totalEvents}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          height: '8px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: `linear-gradient(45deg, ${validTimelineData.theme.primaryColor}, #66bb6a)`,
            height: '100%',
            width: `${((currentEventIndex + 1) / totalEvents) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Timeline Event */}
        <div style={{
          marginBottom: '30px',
          minHeight: '300px',
          maxWidth: '800px',
          margin: '0 auto 30px auto',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: `3px solid ${validTimelineData.theme.primaryColor}`,
          borderRadius: '15px',
          padding: '30px',
          position: 'relative'
        }}>
          {/* Importance Badge */}
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: getImportanceColor(currentEvent.importance),
            color: 'white',
            padding: '5px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {currentEvent.importance} importance
          </div>

          {/* Date */}
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: validTimelineData.theme.primaryColor,
            marginBottom: '15px'
          }}>
            📅 {formatDate(currentEvent.date)}
            {currentEvent.endDate && ` - ${formatDate(currentEvent.endDate)}`}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: validTimelineData.theme.textColor,
            fontWeight: 'bold'
          }}>
            {currentEvent.title}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: validTimelineData.theme.textColor,
            opacity: 0.9
          }}>
            {currentEvent.description}
          </p>

          {/* Category */}
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '5px 10px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            📂 {currentEvent.category}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentEventIndex === 0}
            style={{
              background: currentEventIndex === 0 
                ? 'linear-gradient(45deg, #666, #888)' 
                : 'linear-gradient(45deg, #9e9e9e, #bdbdbd)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: currentEventIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentEventIndex === 0 ? 0.5 : 1,
              transition: 'transform 0.2s ease',
              minWidth: '110px'
            }}
            onMouseEnter={(e) => {
              if (currentEventIndex !== 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentEventIndex !== 0) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ⬅ Previous
          </button>

          {currentEventIndex === totalEvents - 1 ? (
            <button
              onClick={handleComplete}
              style={{
                background: `linear-gradient(45deg, ${validTimelineData.theme.primaryColor}, #66bb6a)`,
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                minWidth: '110px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ✅ Complete
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                background: `linear-gradient(45deg, ${validTimelineData.theme.primaryColor}, #66bb6a)`,
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                minWidth: '110px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Next ➡
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 