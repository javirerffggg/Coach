import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentPhase, calculateMacros } from '../utils/phaseLogic';
import { format } from 'date-fns';

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

      // ==================== GENERAR REPORTE SEMANAL ====================
      
      generateWeeklyReport: () => {
        const state = get();
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return format(date, 'yyyy-MM-dd');
        });
      
        // Calcular promedios y datos diarios
        const weekData = last7Days.map(date => {
          const progress = state.calculateDailyProgress(date);
          const meals = state.dailyMeals[date];
          return {
            date,
            ...progress,
            meals,
            hasMeals: meals && Object.values(meals).some(meal => meal.length > 0)
          };
        });
      
        const daysWithData = weekData.filter(d => d.hasMeals);
        const avgCalories = daysWithData.length > 0 
          ? Math.round(daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length)
          : 0;
        const avgProtein = daysWithData.length > 0
          ? Math.round(daysWithData.reduce((sum, d) => sum + d.protein, 0) / daysWithData.length * 10) / 10
          : 0;
        const avgFat = daysWithData.length > 0
          ? Math.round(daysWithData.reduce((sum, d) => sum + d.fat, 0) / daysWithData.length * 10) / 10
          : 0;
        const avgCarbs = daysWithData.length > 0
          ? Math.round(daysWithData.reduce((sum, d) => sum + d.carbs, 0) / daysWithData.length * 10) / 10
          : 0;
      
        // ==================== ALIMENTOS MÁS CONSUMIDOS ====================
        const foodFrequency = {};
        daysWithData.forEach(day => {
          if (!day.meals) return;
          Object.values(day.meals).forEach(mealArray => {
            mealArray.forEach(entry => {
              const foodName = entry.foodName;
              if (!foodFrequency[foodName]) {
                foodFrequency[foodName] = {
                  count: 0,
                  totalCalories: 0,
                  totalProtein: 0,
                  totalFat: 0,
                  totalCarbs: 0
                };
              }
              foodFrequency[foodName].count++;
              foodFrequency[foodName].totalCalories += entry.calories || 0;
              foodFrequency[foodName].totalProtein += entry.protein || 0;
              foodFrequency[foodName].totalFat += entry.fat || 0;
              foodFrequency[foodName].totalCarbs += entry.carbs || 0;
            });
          });
        });
      
        const topFoods = Object.entries(foodFrequency)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10)
          .map(([name, data]) => ({
            name,
            count: data.count,
            avgCalories: Math.round(data.totalCalories / data.count),
            avgProtein: Math.round(data.totalProtein / data.count * 10) / 10,
            avgFat: Math.round(data.totalFat / data.count * 10) / 10,
            avgCarbs: Math.round(data.totalCarbs / data.count * 10) / 10
          }));
      
        // ==================== DISTRIBUCIÓN POR COMIDA ====================
        const mealDistribution = {
          breakfast: { calories: 0, protein: 0, fat: 0, carbs: 0, count: 0 },
          lunch: { calories: 0, protein: 0, fat: 0, carbs: 0, count: 0 },
          dinner: { calories: 0, protein: 0, fat: 0, carbs: 0, count: 0 },
          snacks: { calories: 0, protein: 0, fat: 0, carbs: 0, count: 0 }
        };
      
        daysWithData.forEach(day => {
          if (!day.meals) return;
         
          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            const meal = day.meals[mealType] || [];
            if (meal.length > 0) {
              const mealTotals = meal.reduce((acc, entry) => ({
                calories: acc.calories + (entry.calories || 0),
                protein: acc.protein + (entry.protein || 0),
                fat: acc.fat + (entry.fat || 0),
                carbs: acc.carbs + (entry.carbs || 0)
              }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
      
              mealDistribution[mealType].calories += mealTotals.calories;
              mealDistribution[mealType].protein += mealTotals.protein;
              mealDistribution[mealType].fat += mealTotals.fat;
              mealDistribution[mealType].carbs += mealTotals.carbs;
              mealDistribution[mealType].count++;
            }
          });
        });
      
        // Calcular promedios de cada comida
        const mealAverages = {};
        Object.entries(mealDistribution).forEach(([mealType, data]) => {
          const count = data.count || 1;
          mealAverages[mealType] = {
            calories: Math.round(data.calories / count),
            protein: Math.round(data.protein / count * 10) / 10,
            fat: Math.round(data.fat / count * 10) / 10,
            carbs: Math.round(data.carbs / count * 10) / 10,
            percentage: avgCalories > 0 ? Math.round((data.calories / count / avgCalories) * 100) : 0
          };
        });
      
        const mealLabels = {
          breakfast: 'Desayuno',
          lunch: 'Comida',
          dinner: 'Cena',
          snacks: 'Snacks'
        };
      
        // Peso inicial y final
        const weekWeights = state.weightHistory.filter(w => 
          last7Days.includes(w.date)
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
       
        const startWeight = weekWeights.length > 0 ? weekWeights[0].weight : state.user.bodyWeight;
        const endWeight = weekWeights.length > 0 
          ? weekWeights[weekWeights.length - 1].weight 
          : state.user.bodyWeight;
        const weightChange = (endWeight - startWeight).toFixed(2);
      
        // Adherencia
        const adherenceDays = weekData.filter(d => 
          d.hasMeals && 
          d.calories >= state.currentMacros.calories * 0.95 &&
          d.calories <= state.currentMacros.calories * 1.05
        ).length;
      
        // ==================== GENERAR REPORTE ====================
        const report = `
═══════════════════════════════════════════════════════════
        REPORTE SEMANAL - MI COACH DE DEFINICIÓN
═══════════════════════════════════════════════════════════

📅 PERÍODO: ${format(new Date(last7Days[0]), 'dd/MM/yyyy')} - ${format(new Date(last7Days[6]), 'dd/MM/yyyy')}
👤 USUARIO: ${state.user.name}
📆 GENERADO: ${format(today, 'dd/MM/yyyy HH:mm')}

───────────────────────────────────────────────────────────
📊 FASE ACTUAL DEL PLAN
───────────────────────────────────────────────────────────
Fase: ${state.currentPhase?.name || 'No definida'}
Descripción: ${state.currentPhase?.description || 'N/A'}

───────────────────────────────────────────────────────────
🎯 OBJETIVOS ACTUALES (Diarios)
───────────────────────────────────────────────────────────
Calorías: ${state.currentMacros.calories} kcal
Proteínas: ${state.currentMacros.protein}g
Grasas: ${state.currentMacros.fat}g
Carbohidratos: ${state.currentMacros.carbs}g

───────────────────────────────────────────────────────────
📈 RESUMEN DE LA SEMANA
───────────────────────────────────────────────────────────
Días registrados: ${daysWithData.length}/7
Adherencia al plan: ${adherenceDays}/7 días (${Math.round(adherenceDays/7*100)}%)

PROMEDIOS DIARIOS:
  • Calorías: ${avgCalories} kcal (Objetivo: ${state.currentMacros.calories} kcal)
  • Proteínas: ${avgProtein}g (Objetivo: ${state.currentMacros.protein}g)
  • Grasas: ${avgFat}g (Objetivo: ${state.currentMacros.fat}g)
  • Carbohidratos: ${avgCarbs}g (Objetivo: ${state.currentMacros.carbs}g)

DESVIACIÓN DEL OBJETIVO:
  • Calorías: ${avgCalories - state.currentMacros.calories > 0 ? '+' : ''}${avgCalories - state.currentMacros.calories} kcal
  • Proteínas: ${avgProtein - state.currentMacros.protein > 0 ? '+' : ''}${(avgProtein - state.currentMacros.protein).toFixed(1)}g
  • Grasas: ${avgFat - state.currentMacros.fat > 0 ? '+' : ''}${(avgFat - state.currentMacros.fat).toFixed(1)}g
  • Carbohidratos: ${avgCarbs - state.currentMacros.carbs > 0 ? '+' : ''}${(avgCarbs - state.currentMacros.carbs).toFixed(1)}g

───────────────────────────────────────────────────────────
🍽️ DISTRIBUCIÓN DE MACROS POR COMIDA
───────────────────────────────────────────────────────────
Promedios por tipo de comida (cuando se consumió):

${Object.entries(mealAverages).map(([mealType, avg]) => {
  if (mealDistribution[mealType].count === 0) {
    return `${mealLabels[mealType].toUpperCase()}:
  ❌ No registrado esta semana
`;
  }
  return `${mealLabels[mealType].toUpperCase()}:
  Registrado: ${mealDistribution[mealType].count}/${daysWithData.length} días
  Promedio: ${avg.calories} kcal (${avg.percentage}% del total diario)
  • Proteínas: ${avg.protein}g
  • Grasas: ${avg.fat}g
  • Carbohidratos: ${avg.carbs}g
`;
}).join('')}
DISTRIBUCIÓN PORCENTUAL DE CALORÍAS:
  • Desayuno: ${mealAverages.breakfast.percentage}%
  • Comida: ${mealAverages.lunch.percentage}%
  • Cena: ${mealAverages.dinner.percentage}%
  • Snacks: ${mealAverages.snacks.percentage}%

───────────────────────────────────────────────────────────
🥗 TOP 10 ALIMENTOS MÁS CONSUMIDOS
───────────────────────────────────────────────────────────
${topFoods.length === 0 ? 'No hay datos de alimentos esta semana.' : 
topFoods.map((food, index) => `
${index + 1}. ${food.name}
    Consumido: ${food.count} ${food.count === 1 ? 'vez' : 'veces'}
    Promedio por ración: ${food.avgCalories} kcal | P: ${food.avgProtein}g | G: ${food.avgFat}g | C: ${food.avgCarbs}g
`).join('')}

───────────────────────────────────────────────────────────
⚖️ EVOLUCIÓN DEL PESO
───────────────────────────────────────────────────────────
Peso inicial semana: ${startWeight} kg
Peso final semana: ${endWeight} kg
Cambio semanal: ${weightChange > 0 ? '+' : ''}${weightChange} kg
Peso objetivo actual: ${state.user.bodyWeight} kg

${weekWeights.length > 0 ? `
Registros de peso esta semana:
${weekWeights.map(w => `  • ${format(new Date(w.date), 'dd/MM/yyyy')}: ${w.weight} kg`).join('\n')}
` : 'No hay registros de peso esta semana.'}

───────────────────────────────────────────────────────────
📋 DETALLE DIARIO
───────────────────────────────────────────────────────────
${weekData.map((day, index) => {
  const dayName = format(new Date(day.date), 'EEEE');
  const dateFormatted = format(new Date(day.date), 'dd/MM/yyyy');
  const status = !day.hasMeals ? '❌ Sin datos' :
    (day.calories >= state.currentMacros.calories * 0.95 && 
     day.calories <= state.currentMacros.calories * 1.05) ? '✅ En objetivo' : '⚠️ Fuera de objetivo';
  
  return `
${dayName.toUpperCase()} - ${dateFormatted}
  Estado: ${status}
  Calorías: ${day.calories} kcal
  Proteínas: ${day.protein.toFixed(1)}g
  Grasas: ${day.fat.toFixed(1)}g
  Carbohidratos: ${day.carbs.toFixed(1)}g
`;
}).join('')}

───────────────────────────────────────────────────────────
🔍 ANÁLISIS AUTOMÁTICO
───────────────────────────────────────────────────────────
ADHERENCIA:
${adherenceDays >= 6 ? '✅ Excelente adherencia al plan esta semana.' : 
  adherenceDays >= 4 ? '⚠️ Adherencia moderada. Intenta ser más consistente.' :
  '❌ Baja adherencia esta semana. Revisa qué obstáculos encontraste.'}

CALORÍAS:
${Math.abs(avgCalories - state.currentMacros.calories) <= 50 ? 
  '✅ Calorías promedio muy cercanas al objetivo.' :
  Math.abs(avgCalories - state.currentMacros.calories) <= 150 ?
  '⚠️ Desviación moderada en calorías. Afina el tracking.' :
  '❌ Desviación significativa en calorías. Revisa porciones y registro.'}

PROTEÍNAS:
${avgProtein >= state.currentMacros.protein * 0.9 ?
  '✅ Ingesta de proteínas adecuada.' :
  '⚠️ Proteínas por debajo del objetivo. Prioriza alimentos proteicos.'}

DISTRIBUCIÓN DE COMIDAS:
${mealAverages.breakfast.percentage >= 20 && mealAverages.breakfast.percentage <= 35 ?
  '✅ Desayuno bien distribuido.' :
  mealAverages.breakfast.percentage < 20 ?
  '⚠️ Desayuno ligero. Considera aumentar proteínas en la mañana.' :
  '⚠️ Desayuno muy calórico. Redistribuye calorías al resto del día.'}
${mealAverages.lunch.percentage >= 30 && mealAverages.lunch.percentage <= 45 ?
  '✅ Comida principal adecuada.' :
  '⚠️ Revisa el tamaño de la comida principal.'}

PESO:
${parseFloat(weightChange) < 0 && state.currentPhase?.phase >= 2 ?
  '✅ Pérdida de peso acorde con fase de déficit.' :
  parseFloat(weightChange) === 0 ?
  '➡️ Peso estable esta semana.' :
  parseFloat(weightChange) > 0 && state.currentPhase?.phase >= 2 ?
  '⚠️ Ganancia de peso en fase de déficit. Revisa calorías.' :
  '✅ Peso estable, apropiado para fase actual.'}

ALIMENTOS FRECUENTES:
${topFoods.length >= 5 ?
  topFoods.slice(0, 3).every(f => f.avgProtein > 15) ?
  '✅ Buena variedad de alimentos proteicos frecuentes.' :
  '⚠️ Considera incluir más fuentes de proteína en rotación.' :
  '⚠️ Poca variedad de alimentos. Intenta diversificar más.'}

───────────────────────────────────────────────────────────
💡 NOTAS PARA LA IA ANALISTA
────────────────────────────────AY───────────────────────────
CONTEXTO DEL PLAN:
- Este usuario sigue un plan de definición muscular de 4 fases
- La fase actual determina los objetivos calóricos y de macros
- El objetivo es mantener masa muscular mientras pierde grasa
- La adherencia óptima es 6-7 días por semana dentro del rango ±5% calorías
- Se espera pérdida de peso gradual de 0.3-0.8 kg/semana en fases de déficit

PUNTOS CLAVE A ANALIZAR:
1. ¿La adherencia es suficiente para lograr resultados?
2. ¿Los promedios de macros son apropiados para la fase actual?
3. ¿La evolución del peso es saludable y sostenible?
4. ¿La distribución de comidas es óptima para saciedad y adherencia?
5. ¿Los alimentos más consumidos son nutritivos y apropiados?
6. ¿Hay patrones preocupantes (proteínas bajas, calorías muy variables)?
7. ¿Qué ajustes específicos recomiendas para la próxima semana?

REFERENCIAS IMPORTANTES:
- Proteína mínima: 1.8-2.2g/kg peso corporal
- Déficit calórico recomendado: 400-700 kcal según fase
- Distribución ideal: 25-30% desayuno, 35-40% comida, 25-30% cena, 5-15% snacks
- Pérdida de peso saludable: 0.5-1% del peso corporal por semana

═══════════════════════════════════════════════════════════
                      FIN DEL REPORTE
═══════════════════════════════════════════════════════════
  `.trim();
      
        return report;
      },
    }),
    {
      name: 'coach-definicion-storage',
    }
  )
);

export default useStore;
