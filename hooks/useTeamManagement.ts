import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerFinances } from './usePlayerFinances';

const TEAM_KEY = '@wallnance_team';
const LAST_SALARY_PAYMENT = '@wallnance_last_salary_payment';

export interface Employee {
  id: string;
  name: string;
  emoji: string;
  role: string;
  bio: string;
  personality: 'Genius' | 'Chaotic' | 'Slacker' | 'Hardworker' | 'Loyalist';
  perk: string;
  salary: number;
  skill: {
    name: string;
    level: number;
  };
  stress: 'Low' | 'Medium' | 'High';
  effect: string;
  hired: Date;
}

export function useTeamManagement() {
  const [team, setTeam] = useState<Employee[]>([]);
  const [lastSalaryPayment, setLastSalaryPayment] = useState<Date | null>(null);
  const { balance, isLoading: financeLoading, updateBalance } = usePlayerFinances();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const [teamData, lastPayment] = await Promise.all([
        AsyncStorage.getItem(TEAM_KEY),
        AsyncStorage.getItem(LAST_SALARY_PAYMENT),
      ]);

      if (teamData) {
        const parsedTeam = JSON.parse(teamData);
        setTeam(parsedTeam.map((employee: any) => ({
          ...employee,
          hired: new Date(employee.hired),
        })));
      }

      if (lastPayment) {
        setLastSalaryPayment(new Date(lastPayment));
      }
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTeam = async (newTeam: Employee[]) => {
    try {
      await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(newTeam));
      setTeam(newTeam);
    } catch (error) {
      console.error('Error saving team:', error);
      throw error;
    }
  };

  const hireEmployee = async (employee: Employee) => {
    if (team.length >= 6) {
      throw new Error('Maximum team size reached');
    }

    if (employee.salary > balance) {
      throw new Error('Insufficient funds to hire employee');
    }

    // Sample data for characterful employees
    const samplePersonalities = ['Genius', 'Chaotic', 'Slacker', 'Hardworker', 'Loyalist'] as const;
    const samplePerks = [
      'Boosts team morale during crises',
      'Reduces stress of nearby teammates',
      'Generates 10% more market insight',
      'Automates minor tasks',
      'Never misses salary day',
    ];
    const sampleBios = [
      'Once hacked into a vending machine for fun.',
      'Writes code while skateboarding.',
      'Believes coffee is a personality trait.',
      'Thinks meetings are a waste of CPU cycles.',
      'Once debugged a toaster.',
    ];
    const sampleEmojis = ['🧠', '🤪', '😴', '💪', '🛡️'];

    const newEmployee: Employee = {
      ...employee,
      bio: sampleBios[Math.floor(Math.random() * sampleBios.length)],
      personality: samplePersonalities[Math.floor(Math.random() * samplePersonalities.length)],
      perk: samplePerks[Math.floor(Math.random() * samplePerks.length)],
      emoji: sampleEmojis[Math.floor(Math.random() * sampleEmojis.length)],
      hired: new Date(),
    };
    const newTeam = [...team, newEmployee];
    await saveTeam(newTeam);
  };

  const fireEmployee = async (employeeId: string) => {
    const newTeam = team.filter(emp => emp.id !== employeeId);
    await saveTeam(newTeam);
  };

  const paySalaries = async () => {
    const totalSalary = team.reduce((sum, emp) => sum + emp.salary, 0);
    
    if (totalSalary === 0) {
      throw new Error('No salaries to pay');
    }

    if (balance < totalSalary) {
      throw new Error('Insufficient funds for salaries');
    }

    // Deduct salaries from balance
    await updateBalance(-totalSalary);

    const now = new Date();
    await AsyncStorage.setItem(LAST_SALARY_PAYMENT, now.toISOString());
    setLastSalaryPayment(now);

    // Update stress levels based on payment timing
    const newTeam = team.map(emp => ({
      ...emp,
      stress: determineNewStressLevel(emp.stress),
    }));
    await saveTeam(newTeam);

    return totalSalary;
  };

  const determineNewStressLevel = (currentStress: string): 'Low' | 'Medium' | 'High' => {
    const random = Math.random();
    switch (currentStress) {
      case 'Low':
        return random < 0.7 ? 'Low' : 'Medium';
      case 'Medium':
        return random < 0.4 ? 'Low' : random < 0.8 ? 'Medium' : 'High';
      case 'High':
        return random < 0.6 ? 'Medium' : 'High';
      default:
        return 'Medium';
    }
  };

  return {
    team,
    isLoading: isLoading || financeLoading,
    hireEmployee,
    fireEmployee,
    paySalaries,
    lastSalaryPayment,
  };
}