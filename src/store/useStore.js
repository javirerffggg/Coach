import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentPhase, calculateMacros } from '../utils/phaseLogic';

const useStore = create(
  persist(
    (set, get) => ({
      // ==================== ESTADO DEL USUARIO ====================
      user: {
        name: '',
        bodyWeight: 0,
        maintenanceCalories: 0,
        endHypertrophyCalories: 0,
        endDeficitCalories: 0,
        reverseWeek: 1,
        setupComplete: false,
      },

      // ==================== FASE ACTUAL ====================
      currentPhase: null,
      currentMacros: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      phaseOverride: null, // Para modo manual

      // ==================== ALIMENTOS ====================
      foods: [], // Lista de alimentos personalizados
      
      // ==================== COMIDAS DEL DÍA ====================
      dailyMeals: {}, // { 'YYYY-MM-DD': { breakfast: [], lunch: [], dinner: [], snacks: [] } }
      
      // ==================== HISTORIAL ====================
      weightHistory: [], // { date: 'YYYY-MM-DD', weight: 75.5 }
      dailyProgress: {}, // { 'YYYY-MM-DD': { calories: 0, protein: 0, fat: 0, carbs: 0 } }

      // ==================== ACCIONES ====================
      
      // Configurar usuario inicial
      setUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData, setupComplete: true },
      })),

      // Actualizar peso corporal
      updateBodyWeight: (newWeight) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          user: { ...state.user, bodyWeight: newWeight },
          weightHistory: [
            ...state.weightHistory,
            { date: today, weight: newWeight },
          ],
        }));
        get().refreshMacros();
      },

      // Refrescar fase y macros
      refreshMacros: () => {
        const state = get();
        const phase = getCurrentPhase(new Date(), state.phaseOverride);
        const macros = calculateMacros(state.user, phase);
        
        set({
          currentPhase: phase,
          currentMacros: macros,
        });
      },

      // Cambiar fase manualmente (modo desarrollador)
      setPhaseOverride: (phaseOverride) => {
        set({ phaseOverride });
        get().refreshMacros();
      },

      // ==================== GESTIÓN DE ALIMENTOS ====================
      
      addFood: (food) => set((state) => ({
        foods: [...state.foods, { ...food, id: Date.now() }],
      })),

      updateFood: (id, updatedFood) => set((state) => ({
        foods: state.foods.map((food) =>
          food.id === id ? { ...food, ...updatedFood } : food
        ),
      })),

      deleteFood: (id) => set((state) => ({
        foods: state.foods.filter((food) => food.id !== id),
      })),

      // ==================== GESTIÓN DE COMIDAS ====================
      
      addMealEntry: (date, mealType, foodEntry) => set((state) => {
        const dateKey = date;
        const currentMeals = state.dailyMeals[dateKey] || {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        };

        return {
          dailyMeals: {
            ...state.dailyMeals,
            [dateKey]: {
              ...currentMeals,
              [mealType]: [...currentMeals[mealType], { ...foodEntry, id: Date.now() }],
            },
          },
        };
      }),

      removeMealEntry: (date, mealType, entryId) => set((state) => {
        const dateKey = date;
        const currentMeals = state.dailyMeals[dateKey];
        
        if (!currentMeals) return state;

        return {
          dailyMeals: {
            ...state.dailyMeals,
            [dateKey]: {
              ...currentMeals,
              [mealType]: currentMeals[mealType].filter((entry) => entry.id !== entryId),
            },
          },
        };
      }),

      // ==================== CÁLCULO DE PROGRESO DIARIO ====================
      
      calculateDailyProgress: (date) => {
        const state = get();
        const meals = state.dailyMeals[date];
        
        if (!meals) {
          return { calories: 0, protein: 0, fat: 0, carbs: 0 };
        }

        const allEntries = [
          ...meals.breakfast,
          ...meals.lunch,
          ...meals.dinner,
          ...meals.snacks,
        ];

        const totals = allEntries.reduce(
          (acc, entry) => ({
            calories: acc.calories + (entry.calories || 0),
            protein: acc.protein + (entry.protein || 0),
            fat: acc.fat + (entry.fat || 0),
            carbs: acc.carbs + (entry.carbs || 0),
          }),
          { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        return totals;
      },

      // ==================== INCREMENTAR SEMANA DE DIETA INVERSA ====================
      
      incrementReverseWeek: () => set((state) => ({
        user: { ...state.user, reverseWeek: state.user.reverseWeek + 1 },
      })),

      // ==================== RESET ====================
      
      resetApp: () => set({
        user: {
          name: '',
          bodyWeight: 0,
          maintenanceCalories: 0,
          endHypertrophyCalories: 0,
          endDeficitCalories: 0,
          reverseWeek: 1,
          setupComplete: false,
        },
        currentPhase: null,
        currentMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        phaseOverride: null,
        foods: [],
        dailyMeals: {},
        weightHistory: [],
        dailyProgress: {},
      }),
    }),
    {
      name: 'coach-definicion-storage',
    }
  )
);

export default useStore;
