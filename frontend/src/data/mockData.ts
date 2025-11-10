import {
  MockWorkoutState,
  WorkoutPlan,
  WorkoutSession,
} from '../types/workout';

const workoutPlans: WorkoutPlan[] = [
  {
    id: 'plan-1',
    name: 'Silownia Hybrid Alpha',
    description:
      'Four-day upper/lower split focused on strength and hypertrophy balance.',
    weekDuration: 8,
    isActive: true,
    trainingDays: [
      {
        id: 'td-a1',
        name: 'A1 – Upper Push',
        description: 'Horizontal push with accessory shoulders and triceps.',
        exercises: [
          {
            id: 'ex-bench',
            orderNumber: '1',
            name: 'Barbell Bench Press',
            sets: 4,
            reps: 6,
            tempo: '3-1-1',
            restSeconds: 150,
            notes: 'Work up to an RPE 8.',
          },
          {
            id: 'ex-ohp',
            orderNumber: '2',
            name: 'Seated Dumbbell Shoulder Press',
            sets: 3,
            reps: 10,
            tempo: '2-0-2',
            restSeconds: 90,
          },
          {
            id: 'ex-dip',
            orderNumber: '3',
            name: 'Weighted Dips',
            sets: 3,
            reps: 8,
            tempo: '2-1-1',
            restSeconds: 120,
          },
        ],
      },
      {
        id: 'td-a2',
        name: 'A2 – Upper Pull',
        description: 'Vertical pull and posterior chain accessory focus.',
        exercises: [
          {
            id: 'ex-pullup',
            orderNumber: '1',
            name: 'Weighted Pull-Up',
            sets: 4,
            reps: 6,
            tempo: '2-1-1',
            restSeconds: 120,
          },
          {
            id: 'ex-row',
            orderNumber: '2',
            name: 'Single-Arm Dumbbell Row',
            sets: 3,
            reps: 12,
            tempo: '2-0-2',
            restSeconds: 75,
          },
          {
            id: 'ex-facepull',
            orderNumber: '3',
            name: 'Cable Face Pull',
            sets: 3,
            reps: 15,
            tempo: '2-0-2',
            restSeconds: 60,
          },
        ],
      },
      {
        id: 'td-b1',
        name: 'B1 – Lower Lift',
        description: 'Compound lower-body strength focus.',
        exercises: [
          {
            id: 'ex-squat',
            orderNumber: '1',
            name: 'Back Squat',
            sets: 5,
            reps: 5,
            tempo: '3-1-1',
            restSeconds: 180,
          },
          {
            id: 'ex-rdl',
            orderNumber: '2',
            name: 'Romanian Deadlift',
            sets: 4,
            reps: 8,
            tempo: '3-0-1',
            restSeconds: 150,
          },
          {
            id: 'ex-lunge',
            orderNumber: '3',
            name: 'Walking Lunge',
            sets: 3,
            reps: 12,
            tempo: '2-0-2',
            restSeconds: 90,
          },
        ],
      },
      {
        id: 'td-b2',
        name: 'B2 – Lower Auxiliary',
        description:
          'Accessory work and unilateral focus for lower body stability.',
        exercises: [
          {
            id: 'ex-frontsquat',
            orderNumber: '1',
            name: 'Front Squat',
            sets: 4,
            reps: 6,
            tempo: '2-1-1',
            restSeconds: 150,
          },
          {
            id: 'ex-legcurl',
            orderNumber: '2',
            name: 'Nordic Curl',
            sets: 3,
            reps: 8,
            tempo: '4-0-1',
            restSeconds: 120,
            notes: 'Assisted with bands as needed.',
          },
          {
            id: 'ex-calfraise',
            orderNumber: '3',
            name: 'Seated Calf Raise',
            sets: 4,
            reps: 15,
            tempo: '2-1-2',
            restSeconds: 60,
          },
        ],
      },
    ],
  },
  {
    id: 'plan-2',
    name: 'Silownia Engine Build',
    description: 'Metabolic conditioning with supplemental strength work.',
    weekDuration: 6,
    isActive: false,
    trainingDays: [
      {
        id: 'td-a2',
        name: 'A2 – Capacity',
        exercises: [
          {
            id: 'ex-row',
            orderNumber: '1',
            name: 'Row Intervals',
            sets: 5,
            reps: 500,
            tempo: '1-0-1',
            restSeconds: 120,
            notes: 'Target sub-2:00 pace per 500m.',
          },
          {
            id: 'ex-burpee',
            orderNumber: '2',
            name: 'Burpee Box Jump',
            sets: 4,
            reps: 12,
            tempo: 'Controlled',
            restSeconds: 90,
          },
        ],
      },
    ],
  },
];

const workoutSessions: WorkoutSession[] = [
  {
    id: 'session-001',
    trainingDayId: 'td-a1',
    weekNumber: 3,
    completedAt: '2025-02-03T17:30:00Z',
    isCompleted: true,
    notes: 'Felt strong on bench, shoulder fatigue towards the end.',
    exerciseLogs: [
      {
        id: 'log-bench-001',
        exerciseId: 'ex-bench',
        startingWeight: 92.5,
        isCompleted: true,
        notes: 'Hit all reps, slight grind on last set.',
        feeling: 8,
        nextPreference: 'GAIN',
      },
      {
        id: 'log-ohp-001',
        exerciseId: 'ex-ohp',
        startingWeight: 26,
        isCompleted: true,
        notes: 'Drop to 24kg if shoulders feel unstable.',
        feeling: 6,
        nextPreference: 'STAY',
      },
    ],
  },
  {
    id: 'session-002',
    trainingDayId: 'td-b1',
    weekNumber: 3,
    completedAt: '2025-02-05T18:00:00Z',
    isCompleted: false,
    notes: 'Back tightened during lunges.',
    exerciseLogs: [
      {
        id: 'log-squat-001',
        exerciseId: 'ex-squat',
        startingWeight: 125,
        isCompleted: true,
        feeling: 7,
        nextPreference: 'STAY',
      },
      {
        id: 'log-rdl-001',
        exerciseId: 'ex-rdl',
        startingWeight: 90,
        isCompleted: true,
        feeling: 6,
        nextPreference: 'STAY',
      },
      {
        id: 'log-lunge-001',
        exerciseId: 'ex-lunge',
        isCompleted: false,
        notes: 'Stopped midway due to lower back.',
        feeling: 3,
        nextPreference: 'LOWER',
      },
    ],
  },
];

export const mockWorkoutState: MockWorkoutState = {
  user: { id: 'user-001', username: 'silownia_dev' },
  plans: workoutPlans,
  sessions: workoutSessions,
};

export const getActivePlan = () =>
  mockWorkoutState.plans.find((plan) => plan.isActive);
