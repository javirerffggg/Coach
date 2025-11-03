import { format, isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns';

// Definición de las fechas de las fases
export const PHASE_DATES = {
  PHASE_1_START: new Date(2024, 10, 4), // 4 Nov 2024
  PHASE_1_WEEK_3: new Date(2024, 10, 18), // 18 Nov 2024
  PHASE_1_END: new Date(2024, 11, 1), // 1 Dic 2024
  
  PHASE_2_START: new Date(2024, 11, 2), // 2 Dic 2024
  PHASE_2_FEB_START: new Date(2025, 1, 1), // 1 Feb 2025
  PHASE_2_FEB_END: new Date(2025, 1, 28), // 28 Feb 2025
  PHASE_2_MAR_START: new Date(2025, 2, 1), // 1 Mar 2025
  PHASE_2_END: new Date(2025, 2, 30), // 30 Mar 2025
  
  PHASE_3_START: new Date(2025, 3, 1), // 1 Abr 2025
  PHASE_3_END: new Date(2025, 5, 15), // 15 Jun 2025
  
  PHASE_4_START: new Date(2025, 5, 16), // 16 Jun 2025
  PHASE_4_WEEK_2: new Date(2025, 5, 23), // 23 Jun 2025
};

// Determinar la fase actual basada en la fecha
export const getCurrentPhase = (currentDate = new Date(), manualOverride = null) => {
  if (manualOverride) {
    return manualOverride;
  }

  // FASE 1: Transición y Mantenimiento
  if (isBefore(currentDate, PHASE_DATES.PHASE_1_WEEK_3)) {
    return {
      phase: 1,
      subPhase: 'descarga',
      name: 'FASE 1: Transición - Descarga',
      description: 'Semanas 1-2: Descarga metabólica',
    };
  }
  
  if (isWithinInterval(currentDate, { 
    start: PHASE_DATES.PHASE_1_WEEK_3, 
    end: PHASE_DATES.PHASE_1_END 
  })) {
    return {
      phase: 1,
      subPhase: 'mantenimiento',
      name: 'FASE 1: Búsqueda de Mantenimiento',
      description: 'Semanas 3-4: Estableciendo mantenimiento calórico',
    };
  }

  // FASE 2: Definición Principal
  if (isWithinInterval(currentDate, { 
    start: PHASE_DATES.PHASE_2_START, 
    end: PHASE_DATES.PHASE_2_FEB_START 
  })) {
    return {
      phase: 2,
      subPhase: 'inicio_deficit',
      name: 'FASE 2: Inicio del Déficit',
      description: 'Dic-Ene: Déficit calórico moderado',
    };
  }
  
  if (isWithinInterval(currentDate, { 
    start: PHASE_DATES.PHASE_2_FEB_START, 
    end: PHASE_DATES.PHASE_2_FEB_END 
  })) {
    return {
      phase: 2,
      subPhase: 'descanso_dieta',
      name: 'FASE 2: Descanso de Dieta',
      description: 'Febrero: Recuperación metabólica',
    };
  }
  
  if (isWithinInterval(currentDate, { 
    start: PHASE_DATES.PHASE_2_MAR_START, 
    end: PHASE_DATES.PHASE_2_END 
  })) {
    return {
      phase: 2,
      subPhase: 'continuacion_deficit',
      name: 'FASE 2: Continuación del Déficit',
      description: 'Marzo: Déficit más profundo',
    };
  }

  // FASE 3: Pulido Final
  if (isWithinInterval(currentDate, { 
    start: PHASE_DATES.PHASE_3_START, 
    end: PHASE_DATES.PHASE_3_END 
  })) {
    return {
      phase: 3,
      subPhase: 'pulido',
      name: 'FASE 3: Pulido Final',
      description: 'Abr-Jun: Máximo déficit para definición',
    };
  }

  // FASE 4: Mantenimiento de Verano
  if (isWithinInterval(currentDate, { 
    start: PHASE_DATES.PHASE_4_START, 
    end: PHASE_DATES.PHASE_4_WEEK_2 
  })) {
    return {
      phase: 4,
      subPhase: 'descarga_verano',
      name: 'FASE 4: Descarga de Verano',
      description: 'Semana 1: Vuelta a mantenimiento',
    };
  }
  
  if (isAfter(currentDate, PHASE_DATES.PHASE_4_WEEK_2)) {
    return {
      phase: 4,
      subPhase: 'dieta_inversa',
      name: 'FASE 4: Dieta Inversa',
      description: 'Incremento calórico progresivo',
    };
  }

  return null;
};

// Calcular macros basados en la fase actual
export const calculateMacros = (userProfile, currentPhase) => {
  const { 
    bodyWeight, 
    maintenanceCalories, 
    endHypertrophyCalories, 
    endDeficitCalories,
    reverseWeek = 1 
  } = userProfile;

  let targetCalories = maintenanceCalories;
  let protein = 0;
  let fat = 0;
  let carbs = 0;

  switch (currentPhase.phase) {
    case 1:
      if (currentPhase.subPhase === 'descarga') {
        // Semanas 1-2: Usar calorías de fin de hipertrofia
        targetCalories = endHypertrophyCalories || maintenanceCalories;
        protein = Math.round(bodyWeight * 1.8);
        const fatCalories = Math.round(targetCalories * 0.25);
        fat = Math.round(fatCalories / 9);
        carbs = Math.round((targetCalories - (protein * 4) - fatCalories) / 4);
      } else {
        // Semanas 3-4: Mantenimiento
        targetCalories = maintenanceCalories;
        protein = Math.round(bodyWeight * 1.8);
        const fatCalories = Math.round(targetCalories * 0.25);
        fat = Math.round(fatCalories / 9);
        carbs = Math.round((targetCalories - (protein * 4) - fatCalories) / 4);
      }
      break;

    case 2:
      if (currentPhase.subPhase === 'inicio_deficit') {
        // Dic-Ene: Déficit de 400 kcal
        targetCalories = maintenanceCalories - 400;
        protein = Math.round(bodyWeight * 2.2);
        fat = Math.round(bodyWeight * 0.9);
        carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
      } else if (currentPhase.subPhase === 'descanso_dieta') {
        // Febrero: Vuelta a mantenimiento
        targetCalories = maintenanceCalories;
        protein = Math.round(bodyWeight * 1.8);
        const fatCalories = Math.round(targetCalories * 0.25);
        fat = Math.round(fatCalories / 9);
        carbs = Math.round((targetCalories - (protein * 4) - fatCalories) / 4);
      } else if (currentPhase.subPhase === 'continuacion_deficit') {
        // Marzo: Déficit de 550 kcal
        targetCalories = maintenanceCalories - 550;
        protein = Math.round(bodyWeight * 2.2);
        fat = Math.round(bodyWeight * 0.9);
        carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
      }
      break;

    case 3:
      // Pulido Final: Déficit de 700 kcal
      targetCalories = maintenanceCalories - 700;
      protein = Math.round(bodyWeight * 2.2);
      fat = Math.round(bodyWeight * 0.9);
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
      break;

    case 4:
      if (currentPhase.subPhase === 'descarga_verano') {
        // Semana 1: Vuelta a mantenimiento
        targetCalories = maintenanceCalories;
        protein = Math.round(bodyWeight * 1.8);
        const fatCalories = Math.round(targetCalories * 0.25);
        fat = Math.round(fatCalories / 9);
        carbs = Math.round((targetCalories - (protein * 4) - fatCalories) / 4);
      } else if (currentPhase.subPhase === 'dieta_inversa') {
        // Dieta Inversa: +150 kcal por semana
        targetCalories = (endDeficitCalories || maintenanceCalories - 700) + (150 * reverseWeek);
        protein = Math.round(bodyWeight * 1.8);
        const fatCalories = Math.round(targetCalories * 0.25);
        fat = Math.round(fatCalories / 9);
        carbs = Math.round((targetCalories - (protein * 4) - fatCalories) / 4);
      }
      break;

    default:
      break;
  }

  return {
    calories: targetCalories,
    protein: Math.max(0, protein),
    fat: Math.max(0, fat),
    carbs: Math.max(0, carbs),
  };
};

// Obtener contexto del plan para la fase actual
export const getPhaseContext = (currentPhase) => {
  const contexts = {
    1: {
      cardio: { sessions: 2, type: 'LISS (30-40 min)' },
      training: 'Intensidad Moderada (RIR 2-3)',
      focus: 'Adaptación y recuperación',
    },
    2: {
      cardio: { sessions: 3, type: 'LISS (40-45 min)' },
      training: 'Intensidad Alta (RIR 1-2)',
      focus: 'Mantener masa muscular en déficit',
    },
    3: {
      cardio: { sessions: 4, type: 'LISS (45-50 min)' },
      training: 'Intensidad Muy Alta (RIR 0-1)',
      focus: 'Máxima definición',
    },
    4: {
      cardio: { sessions: 2, type: 'LISS (30 min)' },
      training: 'Intensidad Moderada (RIR 2-3)',
      focus: 'Mantenimiento y disfrute',
    },
  };

  return contexts[currentPhase.phase] || contexts[1];
};
