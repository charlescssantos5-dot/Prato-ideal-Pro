import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AppData, UserProfile, GoalType, ActivityLevel } from './types';
import { loadData, saveData, exportData } from './services/storage';
import { generatePlan } from './services/geminiService';
import { DropletIcon, FlameIcon, CheckIcon, DownloadIcon, AwardIcon, RefreshIcon, PlusIcon, DumbbellIcon } from './components/Icons';

// --- Helper Components for Screens ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "w-full py-3.5 px-4 rounded-xl font-bold tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 uppercase text-sm";
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-900/50 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-dark-800 text-zinc-300 border border-dark-700 hover:bg-dark-700 hover:text-white disabled:opacity-50",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-dark-800"
  };
  // @ts-ignore
  return <button disabled={disabled} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-dark-900 rounded-2xl shadow-xl border border-dark-800 p-5 ${className}`}>{children}</div>
);

const Input = (props: any) => (
  <input 
    {...props}
    className={`w-full p-4 border border-dark-700 rounded-xl bg-dark-800 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all ${props.className}`}
  />
);

// --- Screens ---

const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: 'Masculino',
    goal: GoalType.MUSCLE_GAIN,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  
  const handleSubmit = async () => {
    setIsGenerating(true);
    const profile: UserProfile = {
      ...formData as UserProfile,
      createdAt: new Date().toISOString()
    };
    await onComplete(profile);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-900/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <DumbbellIcon className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">PRATO <span className="text-brand-500">IDEAL</span></h1>
          <p className="text-zinc-400 font-medium">Nutrição e Treino Inteligente</p>
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-white border-l-4 border-brand-500 pl-3">Sobre você</h2>
            <Input 
              type="text" placeholder="Seu Nome" 
              value={formData.name || ''} onChange={(e: any) => setFormData({...formData, name: e.target.value})}
            />
             <select 
              className="w-full p-4 border border-dark-700 rounded-xl bg-dark-800 text-white outline-none focus:border-brand-500"
              value={formData.gender} onChange={(e: any) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            <div className="flex gap-3">
              <Input 
                type="number" placeholder="Idade" 
                className="w-1/2"
                value={formData.age || ''} onChange={(e: any) => setFormData({...formData, age: parseInt(e.target.value)})}
              />
               <Input 
                type="number" placeholder="Altura (cm)" 
                className="w-1/2"
                value={formData.height || ''} onChange={(e: any) => setFormData({...formData, height: parseInt(e.target.value)})}
              />
            </div>
             <Input 
              type="number" placeholder="Peso Atual (kg)" 
              value={formData.weight || ''} onChange={(e: any) => setFormData({...formData, weight: parseInt(e.target.value)})}
            />
            <Button onClick={handleNext} disabled={!formData.name || !formData.age}>Continuar</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white border-l-4 border-brand-500 pl-3">Seu Objetivo</h2>
            {Object.values(GoalType).map(g => (
              <div key={g} 
                onClick={() => setFormData({...formData, goal: g})}
                className={`p-5 rounded-xl border cursor-pointer transition-all font-semibold flex items-center justify-between ${formData.goal === g ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-dark-700 bg-dark-800 text-zinc-400 hover:bg-dark-700'}`}
              >
                {g}
                {formData.goal === g && <CheckIcon className="w-5 h-5" />}
              </div>
            ))}
            <Button onClick={handleNext}>Continuar</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white border-l-4 border-brand-500 pl-3">Nível de Atividade</h2>
            {Object.values(ActivityLevel).map(l => (
              <div key={l} 
                onClick={() => setFormData({...formData, activityLevel: l})}
                className={`p-5 rounded-xl border cursor-pointer transition-all font-semibold flex items-center justify-between ${formData.activityLevel === l ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-dark-700 bg-dark-800 text-zinc-400 hover:bg-dark-700'}`}
              >
                {l}
                {formData.activityLevel === l && <CheckIcon className="w-5 h-5" />}
              </div>
            ))}
            <Button onClick={handleSubmit} disabled={isGenerating}>
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <RefreshIcon className="w-4 h-4 animate-spin" /> Criando Estratégia...
                </span>
              ) : 'Finalizar Cadastro'}
            </Button>
            {isGenerating && <p className="text-xs text-center text-zinc-500">Analisando perfil e gerando rotina...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const HomeTab = ({ data, updateData }: { data: AppData, updateData: (d: Partial<AppData>) => void }) => {
  const addWater = () => {
    const newAmount = Math.min(data.waterIntake + 250, data.waterTarget * 1.5);
    updateData({ waterIntake: newAmount });
  };

  const progress = Math.min((data.waterIntake / data.waterTarget) * 100, 100);

  return (
    <div className="p-5 space-y-6">
      <header className="flex justify-between items-end border-b border-dark-800 pb-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Bem-vindo de volta,</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase italic">{data.profile?.name.split(' ')[0]}</h1>
        </div>
        <div className="bg-brand-600/20 border border-brand-500/30 text-brand-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
          {data.profile?.goal}
        </div>
      </header>

      {/* Water Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <DropletIcon className="w-6 h-6 text-blue-100" />
              </div>
              <span className="font-bold text-lg">Hidratação</span>
            </div>
            <div className="text-right">
               <span className="text-3xl font-extrabold">{data.waterIntake}</span>
               <span className="text-sm text-blue-200 font-medium ml-1">/ {data.waterTarget}ml</span>
            </div>
          </div>
          
          <div className="w-full bg-black/30 h-4 rounded-full mb-5 overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-cyan-300 to-blue-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>

          <button 
            onClick={addWater}
            className="w-full bg-black/20 hover:bg-black/40 active:scale-[0.98] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-wide border border-white/10"
          >
            <PlusIcon className="w-4 h-4" /> + 250ml
          </button>
        </div>
        {/* Decorative bubbles */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl group-hover:bg-cyan-400/40 transition-all"></div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col justify-between h-36 bg-dark-900 border-dark-700 hover:border-orange-500/50 transition-colors">
          <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 mb-2 border border-orange-500/20">
            <FlameIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Meta Calórica</p>
            <p className="text-2xl font-extrabold text-white">{data.dailyCaloriesTarget} <span className="text-sm text-zinc-500 font-normal">kcal</span></p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between h-36 bg-dark-900 border-dark-700 hover:border-purple-500/50 transition-colors">
           <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-purple-500 mb-2 border border-purple-500/20">
            <AwardIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Conquistas</p>
            <p className="text-2xl font-extrabold text-white">{data.badges.length}</p>
          </div>
        </Card>
      </div>

      {/* Today's Tip */}
      <div className="bg-zinc-900/50 border border-brand-900/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-600"></div>
        <h3 className="font-bold text-brand-500 mb-2 uppercase text-xs tracking-widest">Dica do Coach</h3>
        <p className="text-zinc-300 text-sm italic leading-relaxed">"{data.profile?.goal === GoalType.MUSCLE_GAIN ? "Para crescer, você precisa descansar tanto quanto treina. O músculo cresce no sono." : "A dieta não tem fim, é um estilo de vida. Mantenha a constância."}"</p>
      </div>
    </div>
  );
};

const DietTab = ({ data, regenerate }: { data: AppData, regenerate: () => void }) => {
  const [showShopping, setShowShopping] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  const toggleIngredient = (item: string) => {
    if (checkedIngredients.includes(item)) {
      setCheckedIngredients(p => p.filter(i => i !== item));
    } else {
      setCheckedIngredients(p => [...p, item]);
    }
  };

  // Flatten ingredients for shopping list
  const allIngredients = data.dietPlan.flatMap(meal => 
    meal.ingredients.map(ing => `${ing.name} (${ing.amount})`)
  );

  return (
    <div className="p-5 pb-24 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-extrabold text-white uppercase italic tracking-tighter">Plano <span className="text-brand-500">Alimentar</span></h1>
        <button onClick={regenerate} className="p-3 bg-dark-800 rounded-full text-zinc-400 hover:text-brand-500 hover:bg-dark-700 transition-all">
          <RefreshIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex bg-dark-800 p-1.5 rounded-xl border border-dark-700">
        <button 
          onClick={() => setShowShopping(false)}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!showShopping ? 'bg-dark-700 shadow-lg text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          REFEIÇÕES
        </button>
        <button 
          onClick={() => setShowShopping(true)}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${showShopping ? 'bg-dark-700 shadow-lg text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          LISTA DE COMPRAS
        </button>
      </div>

      {!showShopping ? (
        <div className="space-y-5">
          {data.dietPlan.map((meal) => (
            <Card key={meal.id} className="border-l-4 border-l-brand-500 overflow-hidden relative group">
               <div className="absolute top-0 right-0 bg-dark-800 px-3 py-1.5 rounded-bl-xl border-b border-l border-dark-700">
                  <span className="text-xs font-bold text-brand-500">{meal.calories} kcal</span>
               </div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <div>
                  <h3 className="font-bold text-lg text-white">{meal.name}</h3>
                  <span className="text-xs font-mono text-zinc-500 bg-dark-800 px-2 py-1 rounded border border-dark-700 inline-block mt-1">{meal.time}</span>
                </div>
              </div>
              
              <div className="mb-4 bg-dark-800/50 p-3 rounded-lg border border-white/5">
                <div className="flex gap-4 text-xs font-bold text-zinc-400">
                  <span className="flex flex-col"><span className="text-brand-500">{meal.protein}g</span> Prot</span>
                  <span className="w-px bg-dark-700 h-full"></span>
                  <span className="flex flex-col"><span className="text-zinc-200">{meal.carbs}g</span> Carb</span>
                  <span className="w-px bg-dark-700 h-full"></span>
                  <span className="flex flex-col"><span className="text-zinc-200">{meal.fats}g</span> Gord</span>
                </div>
              </div>

              <div className="border-t border-dark-700 pt-3">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Ingredientes</p>
                <ul className="text-sm text-zinc-300 space-y-2">
                  {meal.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-dark-800 pb-1 last:border-0">
                      <span>{ing.name}</span>
                      <span className="text-zinc-500 font-mono text-xs">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-zinc-500 italic bg-dark-950 p-2 rounded border border-dark-800/50">
                  <span className="text-brand-500 not-italic font-bold mr-1">Dica:</span> 
                  {meal.suggestion}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <h3 className="font-bold mb-6 text-white uppercase tracking-wide border-b border-dark-700 pb-3">Itens Necessários</h3>
          <div className="space-y-1">
            {allIngredients.map((item, idx) => (
              <div key={idx} 
                onClick={() => toggleIngredient(item)}
                className={`flex items-center gap-4 p-3 hover:bg-dark-800 rounded-xl cursor-pointer transition-colors border border-transparent ${checkedIngredients.includes(item) ? 'opacity-50' : 'hover:border-dark-700'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checkedIngredients.includes(item) ? 'bg-brand-600 border-brand-600 text-white' : 'border-zinc-600'}`}>
                  {checkedIngredients.includes(item) && <CheckIcon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-medium ${checkedIngredients.includes(item) ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const WorkoutTab = ({ data, regenerate }: { data: AppData, regenerate: () => void }) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(data.workoutPlan[0]?.id || '');

  useEffect(() => {
     if (!selectedDayId && data.workoutPlan.length > 0) {
         setSelectedDayId(data.workoutPlan[0].id);
     }
  }, [data.workoutPlan, selectedDayId]);

  const activeRoutine = data.workoutPlan.find(d => d.id === selectedDayId);

  return (
    <div className="p-5 pb-24 space-y-6">
       <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-extrabold text-white uppercase italic tracking-tighter">Protocolo <span className="text-brand-500">Treino</span></h1>
        <button onClick={regenerate} className="p-3 bg-dark-800 rounded-full text-zinc-400 hover:text-brand-500 hover:bg-dark-700 transition-all">
          <RefreshIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {data.workoutPlan.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDayId(day.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold border transition-all ${selectedDayId === day.id ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/40' : 'bg-dark-800 text-zinc-400 border-dark-700 hover:bg-dark-700'}`}
          >
            {day.dayName}
          </button>
        ))}
      </div>

      {activeRoutine ? (
        <div className="space-y-4">
          {activeRoutine.exercises.map((ex, i) => (
            <Card key={ex.id} className="flex gap-4 group hover:border-zinc-600 transition-colors">
              <div className="flex flex-col items-center justify-center w-12 border-r border-dark-700 pr-4">
                 <span className="text-2xl font-black text-dark-700 group-hover:text-brand-600/50 transition-colors">{(i+1).toString().padStart(2, '0')}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white mb-1">{ex.name}</h3>
                <p className="text-xs text-zinc-400 mb-3">{ex.notes}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs rounded font-bold uppercase">{ex.sets} Séries</span>
                  <span className="px-2.5 py-1 bg-dark-800 text-zinc-300 border border-dark-700 text-xs rounded font-bold uppercase">{ex.reps} Reps</span>
                  <span className="px-2.5 py-1 bg-dark-950 text-zinc-500 border border-dark-800 text-xs rounded font-mono">{ex.restSeconds}s desc</span>
                </div>
              </div>
            </Card>
          ))}
          <div className="mt-6 p-4 bg-brand-900/20 border border-brand-500/30 rounded-xl text-center">
             <p className="text-brand-400 text-sm font-bold uppercase">Bom Treino!</p>
             <p className="text-zinc-500 text-xs mt-1">Registre suas cargas para progredir.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-900 rounded-2xl border border-dark-800 border-dashed">
            <DumbbellIcon className="w-12 h-12 text-dark-700 mx-auto mb-4" />
            <p className="text-zinc-500">Nenhum treino carregado.</p>
        </div>
      )}
    </div>
  );
};

const ProfileTab = ({ data, onReset }: { data: AppData, onReset: () => void }) => {
  const handleDownload = () => {
    exportData(data);
  };

  return (
    <div className="p-5 space-y-6">
      <h1 className="text-2xl font-extrabold text-white uppercase italic tracking-tighter">Meu <span className="text-brand-500">Perfil</span></h1>

      <Card className="flex items-center gap-5 border-brand-500/30 bg-gradient-to-r from-dark-900 to-dark-800">
        <div className="w-20 h-20 bg-dark-950 border-2 border-dark-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-3xl font-black text-zinc-600">{data.profile?.name.charAt(0)}</span>
        </div>
        <div>
          <h3 className="font-bold text-xl text-white">{data.profile?.name}</h3>
          <div className="flex gap-3 mt-2">
             <span className="bg-dark-950 px-2 py-1 rounded text-xs font-mono text-zinc-400 border border-dark-700">{data.profile?.age} ANOS</span>
             <span className="bg-dark-950 px-2 py-1 rounded text-xs font-mono text-zinc-400 border border-dark-700">{data.profile?.weight} KG</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-widest pl-1">Dados do Sistema</h3>
        
        <button onClick={handleDownload} className="w-full flex items-center justify-between p-4 bg-dark-900 border border-dark-700 rounded-xl hover:bg-dark-800 hover:border-brand-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-950 rounded-lg group-hover:text-brand-500 transition-colors">
                <DownloadIcon className="w-5 h-5" />
            </div>
            <span className="text-zinc-200 font-bold text-sm">Exportar Backup (JSON)</span>
          </div>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-red-900/50 text-xs uppercase tracking-widest pl-1">Zona de Perigo</h3>
        <button onClick={onReset} className="w-full p-4 bg-red-950/30 text-red-500 border border-red-900/50 rounded-xl font-bold text-sm hover:bg-red-900/50 transition-colors">
          APAGAR DADOS E REINICIAR
        </button>
      </div>

      <div className="mt-8 p-5 bg-dark-900 rounded-xl border border-dark-700">
        <h4 className="font-bold text-sm text-zinc-300 mb-3 flex items-center gap-2">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           Instalação do App
        </h4>
        <p className="text-xs text-zinc-500 leading-relaxed font-mono">
          Versão PWA 1.0.0<br/>
          Para instalar: Menu do navegador &gt; "Adicionar à Tela Inicial".<br/>
          Desenvolvedores: Use CapacitorJS para build nativo.
        </p>
      </div>
    </div>
  );
};

// --- Main App Container ---

export default function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadData();
    setAppData(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (appData) {
      saveData(appData);
    }
  }, [appData]);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    // Initial AI Generation
    const plan = await generatePlan(profile);
    
    const newData: AppData = {
        profile,
        dietPlan: plan?.dietPlan || [],
        workoutPlan: plan?.workoutPlan || [],
        waterIntake: 0,
        waterTarget: plan?.waterTarget || 2500,
        dailyCaloriesTarget: plan?.dailyCaloriesTarget || 2000,
        badges: ['Iniciante'],
        lastUpdated: new Date().toISOString()
    };

    setAppData(newData);
    saveData(newData);
  };

  const handleRegeneratePlan = async () => {
    if (!appData?.profile) return;
    const plan = await generatePlan(appData.profile);
    if (plan) {
      setAppData(prev => prev ? ({
        ...prev,
        dietPlan: plan.dietPlan,
        workoutPlan: plan.workoutPlan,
        dailyCaloriesTarget: plan.dailyCaloriesTarget,
        waterTarget: plan.waterTarget
      }) : null);
    }
  };

  const handleReset = () => {
    if(confirm("Tem certeza? Isso apagará todos os seus dados permanentemente.")){
        localStorage.clear();
        window.location.reload();
    }
  };

  const updateAppData = (partial: Partial<AppData>) => {
    setAppData(prev => prev ? ({ ...prev, ...partial }) : null);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-950 text-brand-600 font-bold tracking-widest uppercase animate-pulse">Carregando Sistema...</div>;

  if (!appData?.profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <HomeTab data={appData} updateData={updateAppData} />}
      {activeTab === 'diet' && <DietTab data={appData} regenerate={handleRegeneratePlan} />}
      {activeTab === 'workout' && <WorkoutTab data={appData} regenerate={handleRegeneratePlan} />}
      {activeTab === 'profile' && <ProfileTab data={appData} onReset={handleReset} />}
    </Layout>
  );
}