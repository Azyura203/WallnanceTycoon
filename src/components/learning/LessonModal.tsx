import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { X, CheckCircle, Clock, BookOpen } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { LearningLesson } from '@/src/types/game';
import GameButton from '@/src/components/buttons/GameButton';

interface Props {
  lesson: LearningLesson | null;
  visible: boolean;
  onClose: () => void;
  onComplete: (lessonId: string) => void;
}

export default function LessonModal({ lesson, visible, onClose, onComplete }: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  if (!lesson) return null;

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(lesson.id);
      onClose();
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getLessonTypeIcon = (type: LearningLesson['type']) => {
    switch (type) {
      case 'text': return <BookOpen size={isSmallScreen ? 16 : 20} color={Colors.primary[500]} />;
      case 'interactive': return <CheckCircle size={isSmallScreen ? 16 : 20} color={Colors.success[500]} />;
      case 'simulation': return <Clock size={isSmallScreen ? 16 : 20} color={Colors.warning[500]} />;
      default: return <BookOpen size={isSmallScreen ? 16 : 20} color={Colors.neutral[500]} />;
    }
  };

  const getLessonTypeColor = (type: LearningLesson['type']) => {
    switch (type) {
      case 'text': return Colors.primary[500];
      case 'interactive': return Colors.success[500];
      case 'simulation': return Colors.warning[500];
      default: return Colors.neutral[500];
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, isSmallScreen && styles.modalContentSmall]}>
          {/* Header */}
          <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
            <View style={styles.headerLeft}>
              {getLessonTypeIcon(lesson.type)}
              <View style={styles.headerText}>
                <Text style={[styles.lessonTitle, isSmallScreen && styles.lessonTitleSmall]}>
                  {lesson.title}
                </Text>
                <View style={styles.lessonMeta}>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: getLessonTypeColor(lesson.type) },
                    isSmallScreen && styles.typeBadgeSmall
                  ]}>
                    <Text style={[styles.typeText, isSmallScreen && styles.typeTextSmall]}>
                      {lesson.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.estimatedTime, isSmallScreen && styles.estimatedTimeSmall]}>
                    {lesson.estimatedTime} min
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={isSmallScreen ? 20 : 24} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.content, isSmallScreen && styles.contentSmall]}>
              <Text style={[styles.lessonContent, isSmallScreen && styles.lessonContentSmall]}>
                {lesson.content}
              </Text>

              {/* Interactive Elements for different lesson types */}
              {lesson.type === 'interactive' && (
                <View style={[styles.interactiveSection, isSmallScreen && styles.interactiveSectionSmall]}>
                  <Text style={[styles.interactiveTitle, isSmallScreen && styles.interactiveTitleSmall]}>
                    💡 Key Takeaways:
                  </Text>
                  <View style={styles.takeawaysList}>
                    <Text style={[styles.takeaway, isSmallScreen && styles.takeawaySmall]}>
                      • Understanding market fundamentals is crucial for success
                    </Text>
                    <Text style={[styles.takeaway, isSmallScreen && styles.takeawaySmall]}>
                      • Risk management should always be your top priority
                    </Text>
                    <Text style={[styles.takeaway, isSmallScreen && styles.takeawaySmall]}>
                      • Diversification helps reduce overall portfolio risk
                    </Text>
                  </View>
                </View>
              )}

              {lesson.type === 'simulation' && (
                <View style={[styles.simulationSection, isSmallScreen && styles.simulationSectionSmall]}>
                  <Text style={[styles.simulationTitle, isSmallScreen && styles.simulationTitleSmall]}>
                    🎮 Practice Scenario:
                  </Text>
                  <View style={[styles.scenarioCard, isSmallScreen && styles.scenarioCardSmall]}>
                    <Text style={[styles.scenarioText, isSmallScreen && styles.scenarioTextSmall]}>
                      You have $10,000 to invest. The market is showing signs of volatility. 
                      How would you allocate your funds across different assets?
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, isSmallScreen && styles.footerSmall]}>
            {lesson.completed ? (
              <View style={[styles.completedIndicator, isSmallScreen && styles.completedIndicatorSmall]}>
                <CheckCircle size={isSmallScreen ? 20 : 24} color={Colors.success[500]} />
                <Text style={[styles.completedText, isSmallScreen && styles.completedTextSmall]}>
                  Lesson Completed!
                </Text>
              </View>
            ) : (
              <GameButton
                title={isCompleting ? "Completing..." : "Complete Lesson"}
                onPress={handleComplete}
                disabled={isCompleting}
                style={[styles.completeButton, isSmallScreen && styles.completeButtonSmall]}
                textStyle={[styles.completeButtonText, isSmallScreen && styles.completeButtonTextSmall]}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    maxHeight: '90%',
    ...Layout.shadows.large,
  },
  modalContentSmall: {
    maxHeight: '95%',
    borderRadius: Layout.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerSmall: {
    padding: Layout.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: Layout.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  lessonTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  lessonTitleSmall: {
    fontSize: 16,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  typeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: Colors.card,
  },
  typeTextSmall: {
    fontSize: 8,
  },
  estimatedTime: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  estimatedTimeSmall: {
    fontSize: 10,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  contentSmall: {
    padding: Layout.spacing.md,
  },
  lessonContent: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  lessonContentSmall: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  interactiveSection: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  interactiveSectionSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  interactiveTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.sm,
  },
  interactiveTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  takeawaysList: {
    gap: Layout.spacing.xs,
  },
  takeaway: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.primary[600],
    lineHeight: 20,
  },
  takeawaySmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  simulationSection: {
    backgroundColor: Colors.warning[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  simulationSectionSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  simulationTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.warning[700],
    marginBottom: Layout.spacing.sm,
  },
  simulationTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  scenarioCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning[500],
  },
  scenarioCardSmall: {
    padding: Layout.spacing.sm,
  },
  scenarioText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[700],
    lineHeight: 20,
  },
  scenarioTextSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  footerSmall: {
    padding: Layout.spacing.md,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    paddingVertical: Layout.spacing.md,
  },
  completedIndicatorSmall: {
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  completedText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.success[600],
  },
  completedTextSmall: {
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: Colors.primary[500],
  },
  completeButtonSmall: {
    paddingVertical: Layout.spacing.sm,
  },
  completeButtonText: {
    fontSize: 16,
  },
  completeButtonTextSmall: {
    fontSize: 14,
  },
});