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

const Card = ({ children, className = '', noPadding = false }: any) => (
  <div className={`bg-dark-900 rounded-2xl shadow-xl border border-dark-800 ${noPadding ? '' : 'p-5'} ${className}`}>{children}</div>
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
    <div className="min-h-screen bg-dark-950 flex flex-col p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-brand-900/20 to-dark-950 z-0 pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="mb-8 text-center">
          <div className="relative mb-8 group mx-auto w-full max-w-[280px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <img 
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80" 
              alt="Fitness Motivation" 
              className="relative w-full h-80 object-cover rounded-2xl shadow-2xl shadow-black/80 grayscale-[30%] contrast-125"
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent rounded-b-2xl"></div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
               <span className="inline-block px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 shadow-lg shadow-brand-900/50">Hardcore Training</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">PRATO <span className="text-brand-500">IDEAL</span></h1>
          <p className="text-zinc-400 font-medium text-sm">Construa o físico que você sempre quis.</p>
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-fade-in bg-dark-900/50 p-6 rounded-2xl border border-dark-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-l-4 border-brand-500 pl-3 uppercase italic">Seus Dados</h2>
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
            <Button onClick={handleNext} disabled={!formData.name || !formData.age}>AVANÇAR</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in bg-dark-900/50 p-6 rounded-2xl border border-dark-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-l-4 border-brand-500 pl-3 uppercase italic">Seu Objetivo</h2>
            {Object.values(GoalType).map(g => (
              <div key={g} 
                onClick={() => setFormData({...formData, goal: g})}
                className={`p-4 rounded-xl border cursor-pointer transition-all font-bold uppercase text-sm flex items-center justify-between ${formData.goal === g ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'border-dark-700 bg-dark-800 text-zinc-500 hover:bg-dark-700 hover:text-zinc-300'}`}
              >
                {g}
                {formData.goal === g && <CheckIcon className="w-5 h-5" />}
              </div>
            ))}
            <Button onClick={handleNext}>AVANÇAR</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in bg-dark-900/50 p-6 rounded-2xl border border-dark-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-l-4 border-brand-500 pl-3 uppercase italic">Nível de Atividade</h2>
            {Object.values(ActivityLevel).map(l => (
              <div key={l} 
                onClick={() => setFormData({...formData, activityLevel: l})}
                className={`p-4 rounded-xl border cursor-pointer transition-all font-bold uppercase text-sm flex items-center justify-between ${formData.activityLevel === l ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'border-dark-700 bg-dark-800 text-zinc-500 hover:bg-dark-700 hover:text-zinc-300'}`}
              >
                {l}
                {formData.activityLevel === l && <CheckIcon className="w-5 h-5" />}
              </div>
            ))}
            <Button onClick={handleSubmit} disabled={isGenerating}>
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <RefreshIcon className="w-4 h-4 animate-spin" /> MONTANDO ESTRATÉGIA...
                </span>
              ) : 'FINALIZAR CADASTRO'}
            </Button>
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
    <div className="p-5 space-y-6 pt-8">
      <header className="flex justify-between items-start pb-2">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-500 shadow-lg shadow-brand-900/20">
             <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80" 
                alt="User" 
                className="w-full h-full object-cover"
             />
           </div>
           <div>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-0.5">Shape em construção</p>
              <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase">{data.profile?.name.split(' ')[0]}</h1>
           </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex flex-col items-end">
          <span className="text-brand-500">{data.profile?.goal}</span>
          <span className="text-[8px] text-zinc-500">{data.profile?.weight}kg Atual</span>
        </div>
      </header>

      {/* Water Card */}
      <Card className="bg-gradient-to-br from-blue-900 to-dark-900 text-white border-blue-900/30 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg ring-1 ring-blue-500/40">
                <DropletIcon className="w-6 h-6 text-blue-400" />
              </div>
              <span className="font-bold text-lg uppercase tracking-wide">Hidratação</span>
            </div>
            <div className="text-right">
               <span className="text-3xl font-black italic">{data.waterIntake}</span>
               <span className="text-xs text-blue-300 font-medium ml-1 uppercase">/ {data.waterTarget}ml Meta</span>
            </div>
          </div>
          
          <div className="w-full bg-dark-950 h-3 rounded-full mb-5 overflow-hidden border border-dark-800">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>

          <button 
            onClick={addWater}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-wider shadow-lg shadow-blue-900/20"
          >
            <PlusIcon className="w-4 h-4" /> Beber 250ml
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col justify-between h-36 bg-dark-900 border-dark-700 hover:border-brand-500/50 transition-colors relative overflow-hidden">
           <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-brand-900/10 to-transparent"></div>
          <div className="bg-brand-500/10 w-10 h-10 rounded-lg flex items-center justify-center text-brand-500 mb-2 border border-brand-500/20 relative z-10">
            <FlameIcon className="w-5 h-5" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Dieta</p>
            <p className="text-2xl font-black text-white italic">{data.dailyCaloriesTarget} <span className="text-xs text-zinc-500 font-bold not-italic">kcal</span></p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between h-36 bg-dark-900 border-dark-700 hover:border-brand-500/50 transition-colors relative overflow-hidden">
           <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-zinc-800/10 to-transparent"></div>
           <div className="bg-zinc-800/50 w-10 h-10 rounded-lg flex items-center justify-center text-zinc-300 mb-2 border border-zinc-700 relative z-10">
            <AwardIcon className="w-5 h-5" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Badges</p>
            <p className="text-2xl font-black text-white italic">{data.badges.length} <span className="text-xs text-zinc-500 font-bold not-italic">Conquistas</span></p>
          </div>
        </Card>
      </div>

      {/* Today's Tip */}
      <div className="relative rounded-2xl overflow-hidden min-h-[140px] flex items-end p-5 shadow-xl border border-dark-800 group">
         <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
            alt="Tip Background"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent"></div>
         
         <div className="relative z-10">
            <h3 className="font-black text-brand-500 mb-1 uppercase text-xs tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span> Dica do Coach
            </h3>
            <p className="text-white text-sm font-medium leading-relaxed italic">"{data.tipOfTheDay || "O único treino ruim é aquele que não aconteceu. Mantenha a disciplina."}"</p>
         </div>
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

  const allIngredients = data.dietPlan.flatMap(meal => 
    meal.ingredients.map(ing => `${ing.name} (${ing.amount})`)
  );

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className="relative h-48 w-full overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" 
          className="w-full h-full object-cover opacity-60"
          alt="Healthy Food"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
           <div>
             <span className="text-brand-500 font-bold uppercase tracking-widest text-[10px] mb-1 block">Nutrição de Alta Performance</span>
             <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Protocolo <br/>Alimentar</h1>
           </div>
           <button onClick={regenerate} className="p-3 bg-dark-800/80 backdrop-blur rounded-xl text-zinc-400 hover:text-brand-500 hover:bg-dark-700 transition-all border border-white/10">
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        <div className="flex bg-dark-900 p-1.5 rounded-xl border border-dark-800">
          <button 
            onClick={() => setShowShopping(false)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wide rounded-lg transition-all ${!showShopping ? 'bg-dark-800 text-white shadow-lg ring-1 ring-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Refeições do Dia
          </button>
          <button 
            onClick={() => setShowShopping(true)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wide rounded-lg transition-all ${showShopping ? 'bg-dark-800 text-white shadow-lg ring-1 ring-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Lista de Mercado
          </button>
        </div>

        {!showShopping ? (
          <div className="space-y-5">
            {data.dietPlan.map((meal) => (
              <Card key={meal.id} noPadding className="overflow-hidden group hover:border-brand-900/50 transition-colors">
                 <div className="p-5 border-b border-dark-800 bg-dark-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded bg-dark-800 border border-dark-700 text-[10px] font-mono text-zinc-400 mb-2">{meal.time}</span>
                        <h3 className="font-bold text-lg text-white uppercase tracking-tight">{meal.name}</h3>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-black text-brand-500 block leading-none">{meal.calories}</span>
                         <span className="text-[10px] text-zinc-500 font-bold uppercase">Kcal</span>
                      </div>
                    </div>
                 </div>
                
                <div className="p-5 bg-dark-900/50">
                  <div className="flex gap-4 text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500"></span> <span className="text-zinc-300">{meal.protein}g</span> Prot</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> <span className="text-zinc-300">{meal.carbs}g</span> Carb</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <span className="text-zinc-300">{meal.fats}g</span> Gord</span>
                  </div>

                  <div className="space-y-2.5">
                    {meal.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm text-zinc-300 group/item">
                        <span className="group-hover/item:text-white transition-colors">{ing.name}</span>
                        <span className="font-bold text-zinc-500">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                  
                  {meal.suggestion && (
                    <div className="mt-4 pt-3 border-t border-dark-800/50">
                      <p className="text-xs text-zinc-500 italic">
                        <span className="text-brand-500 not-italic font-bold uppercase text-[10px] mr-1">Dica:</span> 
                        {meal.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <h3 className="font-black mb-6 text-white uppercase tracking-wide text-sm border-b border-dark-700 pb-3 flex items-center gap-2">
              <DownloadIcon className="w-4 h-4 text-brand-500" /> Itens Essenciais
            </h3>
            <div className="space-y-1">
              {allIngredients.map((item, idx) => (
                <div key={idx} 
                  onClick={() => toggleIngredient(item)}
                  className={`flex items-center gap-4 p-3 hover:bg-dark-800 rounded-xl cursor-pointer transition-colors border border-transparent ${checkedIngredients.includes(item) ? 'opacity-40' : 'hover:border-dark-700'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checkedIngredients.includes(item) ? 'bg-brand-600 border-brand-600 text-white' : 'border-zinc-600'}`}>
                    {checkedIngredients.includes(item) && <CheckIcon className="w-3 h-3" />}
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
    <div className="pb-24">
       {/* Hero Header */}
       <div className="relative h-48 w-full overflow-hidden shadow-2xl group">
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80" 
          className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000 grayscale"
          alt="Workout Gym"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-brand-900/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
           <div>
             <span className="text-brand-500 font-bold uppercase tracking-widest text-[10px] mb-1 block">Hard Work Pays Off</span>
             <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Rotina <br/>de Treino</h1>
           </div>
           <button onClick={regenerate} className="p-3 bg-dark-800/80 backdrop-blur rounded-xl text-zinc-400 hover:text-brand-500 hover:bg-dark-700 transition-all border border-white/10">
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {data.workoutPlan.map(day => (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider border transition-all ${selectedDayId === day.id ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/40' : 'bg-dark-900 text-zinc-500 border-dark-800 hover:bg-dark-800 hover:text-zinc-300'}`}
            >
              {day.dayName.replace("Treino", "")}
            </button>
          ))}
        </div>

        {activeRoutine ? (
          <div className="space-y-4">
            {activeRoutine.exercises.map((ex, i) => (
              <Card key={ex.id} className="flex gap-4 group hover:border-zinc-600 transition-colors items-center">
                <div className="flex flex-col items-center justify-center w-10">
                   <span className="text-3xl font-black text-dark-800 group-hover:text-brand-600/20 transition-colors stroke-text">{(i+1)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-white mb-1 uppercase tracking-tight">{ex.name}</h3>
                  {ex.notes && <p className="text-[10px] text-brand-500 mb-2 font-bold uppercase">{ex.notes}</p>}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-dark-950 text-zinc-300 border border-dark-700 text-[10px] rounded font-bold uppercase tracking-wider">{ex.sets} Séries</span>
                    <span className="px-2 py-1 bg-dark-950 text-zinc-300 border border-dark-700 text-[10px] rounded font-bold uppercase tracking-wider">{ex.reps} Reps</span>
                    <span className="px-2 py-1 bg-dark-950 text-zinc-500 border border-dark-700 text-[10px] rounded font-mono">{ex.restSeconds}s</span>
                  </div>
                </div>
              </Card>
            ))}
            <div className="mt-6 p-6 bg-brand-900/10 border border-brand-500/20 rounded-2xl text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-brand-600/5 to-transparent"></div>
               <p className="text-brand-500 text-sm font-black uppercase tracking-widest relative z-10">Não pare quando doer.</p>
               <p className="text-zinc-500 text-xs mt-1 font-medium relative z-10">Pare quando terminar.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-900 rounded-2xl border border-dark-800 border-dashed">
              <DumbbellIcon className="w-12 h-12 text-dark-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">Nenhum treino carregado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileTab = ({ data, onReset }: { data: AppData, onReset: () => void }) => {
  const handleDownload = () => {
    exportData(data);
  };

  return (
    <div className="p-5 space-y-6 pt-10">
      <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">Meu <span className="text-brand-500">Perfil</span></h1>

      <Card className="flex items-center gap-5 border-brand-500/30 bg-gradient-to-r from-dark-900 via-dark-900 to-brand-900/10">
        <div className="w-20 h-20 bg-dark-950 border-2 border-brand-900 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
           <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80" 
                alt="User" 
                className="w-full h-full object-cover grayscale"
             />
        </div>
        <div>
          <h3 className="font-bold text-xl text-white uppercase italic">{data.profile?.name}</h3>
          <div className="flex gap-2 mt-2">
             <span className="bg-dark-950 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 border border-dark-700 uppercase">{data.profile?.age} ANOS</span>
             <span className="bg-dark-950 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 border border-dark-700 uppercase">{data.profile?.weight} KG</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-widest pl-1">Sistema</h3>
        
        <button onClick={handleDownload} className="w-full flex items-center justify-between p-4 bg-dark-900 border border-dark-700 rounded-xl hover:bg-dark-800 hover:border-brand-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-950 rounded-lg group-hover:text-brand-500 transition-colors">
                <DownloadIcon className="w-5 h-5" />
            </div>
            <span className="text-zinc-200 font-bold text-sm uppercase tracking-wide">Backup dos Dados</span>
          </div>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-red-900/50 text-xs uppercase tracking-widest pl-1">Zona de Perigo</h3>
        <button onClick={onReset} className="w-full p-4 bg-red-950/20 text-red-500 border border-red-900/30 rounded-xl font-bold text-sm hover:bg-red-900/40 transition-colors uppercase tracking-wide">
          Apagar Tudo e Reiniciar
        </button>
      </div>

      <div className="mt-8 p-5 bg-dark-900 rounded-xl border border-dark-800">
        <h4 className="font-bold text-xs text-zinc-300 mb-2 flex items-center gap-2 uppercase tracking-wide">
           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
           Status do App
        </h4>
        <p className="text-[10px] text-zinc-600 font-mono uppercase">
          Build v2.0.1 (Bodybuilder Edition)<br/>
          Cache Offline: Ativo
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
        lastUpdated: new Date().toISOString(),
        tipOfTheDay: plan?.tipOfTheDay || ''
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
        waterTarget: plan.waterTarget,
        tipOfTheDay: plan.tipOfTheDay
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-950 text-brand-600 font-black tracking-widest uppercase animate-pulse italic text-xl">Carregando Sistema...</div>;

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