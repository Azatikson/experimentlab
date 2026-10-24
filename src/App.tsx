import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, ChevronDown, ChevronRight,
  CircleHelp, FlaskConical, LayoutDashboard, Search, Settings2, SlidersHorizontal,
  Sparkles, Target, TrendingUp, Users, Plus, MoreHorizontal, Clock3, CheckCircle2,
  CircleAlert, ChartNoAxesCombined, Download, Upload, X, FileText, CalendarDays,
  CircleDot, Menu, Trash2, RotateCcw
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, BarChart, Bar
} from 'recharts'

type Status = 'Running' | 'Completed' | 'Draft' | 'Needs review'
type Experiment = {
  id: string; name: string; hypothesis: string; metric: string; status: Status;
  owner: string; started: string; controlVisitors: number; controlConversions: number;
  variantVisitors: number; variantConversions: number; trend: number[]
}
const initialExperiments: Experiment[] = [
  { id:'EXP-024', name:'Упростить форму регистрации', hypothesis:'Меньше полей снизят трение и увеличат долю завершённых регистраций.', metric:'Конверсия в регистрацию', status:'Needs review', owner:'Вы', started:'18 окт. 2026', controlVisitors:1200, controlConversions:132, variantVisitors:1180, variantConversions:154, trend:[8.9,9.4,10.1,10.8,11.1,11.8,12.4,13.05] },
  { id:'EXP-023', name:'Добавить отзывы на лендинг', hypothesis:'Отзывы клиентов повысят доверие и увеличат конверсию в регистрацию.', metric:'Конверсия в регистрацию', status:'Completed', owner:'Вы', started:'12 окт. 2026', controlVisitors:900, controlConversions:81, variantVisitors:920, variantConversions:94, trend:[8.2,8.7,8.9,9.1,9.7,9.9,10.2] },
  { id:'EXP-022', name:'Проверить новый текст кнопки', hypothesis:'Кнопка с понятной выгодой поможет новым посетителям понять следующий шаг.', metric:'Кликабельность кнопки', status:'Draft', owner:'Вы', started:'21 окт. 2026', controlVisitors:0, controlConversions:0, variantVisitors:0, variantConversions:0, trend:[] },
  { id:'EXP-021', name:'Чек-лист онбординга', hypothesis:'Видимый чек-лист поможет новым пользователям быстрее выполнить целевое действие.', metric:'Активация пользователей', status:'Running', owner:'Вы', started:'16 окт. 2026', controlVisitors:1500, controlConversions:270, variantVisitors:1480, variantConversions:281, trend:[17.2,17.7,18.1,18.4,18.7,18.9,19.0] },
  { id:'EXP-020', name:'Перенести цены ниже преимуществ', hypothesis:'Если сначала объяснить ценность, больше пользователей начнут пробный период.', metric:'Запуск пробного периода', status:'Running', owner:'Вы', started:'14 окт. 2026', controlVisitors:780, controlConversions:92, variantVisitors:805, variantConversions:101, trend:[10.8,11.2,11.4,11.7,12.0,12.2] },
]
const statusMeta: Record<Status, {label:string; tone:string; color:string}> = {
  Running:{label:'Запущен',tone:'blue',color:'#4e8af7'},
  Completed:{label:'Завершён',tone:'green',color:'#25b889'},
  Draft:{label:'Черновик',tone:'gray',color:'#9aa3b4'},
  'Needs review':{label:'Нужна проверка',tone:'amber',color:'#f0a544'},
}
const fmt = (n:number, digits=1) => `${n.toFixed(digits)}%`
const rate = (conversions:number, visitors:number) => visitors ? conversions / visitors * 100 : 0
const lift = (e:Experiment) => {
  const c=rate(e.controlConversions,e.controlVisitors), v=rate(e.variantConversions,e.variantVisitors)
  return c ? (v-c)/c*100 : 0
}
const pctPoint = (e:Experiment) => rate(e.variantConversions,e.variantVisitors)-rate(e.controlConversions,e.controlVisitors)
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return 'Доброй ночи!'
  if (hour < 12) return 'Доброе утро!'
  if (hour < 18) return 'Добрый день!'
  return 'Добрый вечер!'
}
function readExperiments(): Experiment[] {
  try {
    const raw=localStorage.getItem('experimentlab.v1')
    return raw ? JSON.parse(raw) as Experiment[] : initialExperiments
  } catch { return initialExperiments }
}
function App() {
  const [experiments,setExperiments]=useState<Experiment[]>(readExperiments)
  const [active,setActive]=useState('Обзор')
  const [query,setQuery]=useState('')
  const [showCreate,setShowCreate]=useState(false)
  const [showImport,setShowImport]=useState(false)
  const [selected,setSelected]=useState<Experiment|null>(null)
  const [notice,setNotice]=useState('')
  const [mobileNav,setMobileNav]=useState(false)
  const [form,setForm]=useState({name:'',hypothesis:'',metric:'Конверсия в регистрацию'})
  const [importText,setImportText]=useState('')
  const save=(next:Experiment[])=>{setExperiments(next);localStorage.setItem('experimentlab.v1',JSON.stringify(next))}
  const filtered=useMemo(()=>experiments.filter(e=>`${e.name} ${e.id} ${e.metric} ${e.status}`.toLowerCase().includes(query.toLowerCase())),[experiments,query])
  const running=experiments.filter(e=>e.status==='Running').length
  const needsReview=experiments.filter(e=>e.status==='Needs review').length
  const completed=experiments.filter(e=>e.status==='Completed').length
  const withData=experiments.filter(e=>e.controlVisitors>0&&e.variantVisitors>0)
  const statusData=Object.entries(statusMeta).map(([key,v])=>({name:v.label,value:experiments.filter(e=>e.status===key).length,color:v.color}))
  const trendData=[
    {day:'17 окт.',control:10.4,variant:10.8},{day:'18 окт.',control:10.5,variant:11.2},
    {day:'19 окт.',control:10.7,variant:11.8},{day:'20 окт.',control:10.6,variant:12.1},
    {day:'21 окт.',control:10.9,variant:12.3},{day:'22 окт.',control:11.0,variant:12.8},
    {day:'23 окт.',control:11.0,variant:13.1},
  ]
  const primary=experiments.find(e=>e.id==='EXP-024') || withData[0]
  const showNotice=(msg:string)=>{setNotice(msg);window.setTimeout(()=>setNotice(''),3200)}
  const createExperiment=()=>{
    if(!form.name.trim()){showNotice('Сначала укажите название эксперимента.');return}
    const next:Experiment={id:`EXP-${String(Math.max(24,...experiments.map(e=>Number(e.id.replace('EXP-',''))||0))+1).padStart(3,'0')}`,name:form.name.trim(),hypothesis:form.hypothesis.trim()||'Гипотеза пока не добавлена.',metric:form.metric,status:'Draft',owner:'Вы',started:new Date().toLocaleDateString('ru-RU',{month:'short',day:'numeric',year:'numeric'}),controlVisitors:0,controlConversions:0,variantVisitors:0,variantConversions:0,trend:[]}
    save([next,...experiments]);setShowCreate(false);setForm({name:'',hypothesis:'',metric:'Конверсия в регистрацию'});setActive('Эксперименты');showNotice('Эксперимент создан')
  }
  const exportJson=()=>{const blob=new Blob([JSON.stringify(experiments,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='experimentlab-backup.json';a.click();URL.revokeObjectURL(url);showNotice('Резервная копия экспортирована')}
  const importCsv=()=>{
    try{
      const lines=importText.trim().split(/\r?\n/);const header=lines.shift()?.split(',').map(s=>s.trim().toLowerCase())||[]
      const index=(name:string)=>header.indexOf(name)
      const required=['id','name','status','control_visitors','control_conversions','variant_visitors','variant_conversions']
      if(required.some(k=>index(k)<0))throw new Error('В CSV нужны столбцы: id,name,status,control_visitors,control_conversions,variant_visitors,variant_conversions')
      const parsed=lines.filter(Boolean).map(line=>{
        const c=line.split(',');const n=(key:string)=>Number(c[index(key)]||0)
        const st=(c[index('status')]||'Draft').trim() as Status
        const status:Status=(['Running','Completed','Draft','Needs review'].includes(st)?st:'Draft')
        return {id:c[index('id')]||`EXP-${Date.now()}`,name:c[index('name')]||'Imported experiment',hypothesis:'Импортировано из CSV',metric:'Conversion rate',status,owner:'Вы',started:'Imported',controlVisitors:n('control_visitors'),controlConversions:n('control_conversions'),variantVisitors:n('variant_visitors'),variantConversions:n('variant_conversions'),trend:[]} as Experiment
      })
      if(!parsed.length)throw new Error('В CSV нет строк с экспериментами')
      save([...parsed,...experiments]);setShowImport(false);setImportText('');showNotice(`Импортировано экспериментов: ${parsed.length}`)
    }catch(e){showNotice(e instanceof Error?e.message:'Не удалось импортировать CSV')}
  }
  const navItems=[
    {label:'Обзор',icon:LayoutDashboard,section:'WORKSPACE'},
    {label:'Эксперименты',icon:FlaskConical,section:'WORKSPACE'},
    {label:'Аналитика',icon:ChartNoAxesCombined,section:'WORKSPACE'},
  ]
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-icon"><FlaskConical size={21}/></div><div><strong>experiment<span>lab</span></strong><small>АНАЛИТИКА ПРОДУКТА</small></div><button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X size={17}/></button></div>
      <div className="nav-section">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      {navItems.map(n=><button key={n.label} className={`nav-link ${active===n.label?'active':''}`} onClick={()=>{setActive(n.label);setMobileNav(false);setSelected(null)}}><n.icon size={18}/><span>{n.label}</span>{n.label==='Эксперименты'&&<em>{experiments.length}</em>}</button>)}
      <div className="nav-section nav-gap">УПРАВЛЕНИЕ</div>
      <button className="nav-link" onClick={()=>setShowImport(true)}><Upload size={18}/><span>Импорт данных</span></button>
      <button className="nav-link" onClick={exportJson}><Download size={18}/><span>Экспорт копии</span></button>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={16}/></div><b>Превращайте данные в решения.</b><p>Превращайте результаты экспериментов в решения, которым можно доверять.</p><button onClick={()=>showNotice('Совет: выберите одну основную метрику и сформулируйте гипотезу до запуска теста.')}>Совет <ChevronRight size={13}/></button></div><div className="profile"><div className="profile-avatar">A</div><div><b>Azat</b><small>Продакт-менеджер</small></div><MoreHorizontal size={18}/></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><div className="breadcrumbs"><span>Пространство</span><ChevronRight size={14}/><b>{selected?'Experiment details':active}</b></div><div className="top-actions"><div className="search-box"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск экспериментов..." aria-label="Поиск экспериментов"/><kbd>⌘ K</kbd></div><button className="icon-btn notification-btn" onClick={()=>showNotice(needsReview?`${needsReview} experiment(s) need review`:'Нет новых уведомлений')} aria-label="Уведомления"><Bell size={17}/>{needsReview>0&&<i/>}</button><div className="top-avatar">A</div></div></header>
      <div className="page-content">
        {selected ? <ExperimentDetail experiment={selected} onBack={()=>setSelected(null)} onUpdate={(e)=>{save(experiments.map(x=>x.id===e.id?e:x));setSelected(e)}} onDelete={()=>{save(experiments.filter(x=>x.id!==selected.id));setSelected(null);showNotice('Эксперимент удалён')}}/> :
        active==='Обзор' ? <Overview experiments={experiments} filtered={filtered} statusData={statusData} trendData={trendData} primary={primary} running={running} completed={completed} needsReview={needsReview} onNew={()=>setShowCreate(true)} onOpen={(e)=>{setSelected(e);setActive('Эксперименты')}} onViewAll={()=>setActive('Эксперименты')} /> :
        active==='Эксперименты' ? <ExperimentsPage experiments={filtered} onNew={()=>setShowCreate(true)} onOpen={setSelected} onImport={()=>setShowImport(true)} /> :
        <AnalysisPage experiments={withData} onOpen={setSelected} />}
      </div>
      <footer className="footer"><span>© 2026 ExperimentLab</span><span><span className="live-dot"/> Все данные хранятся в браузере <span className="footer-sep">·</span> <button onClick={exportJson}>Экспорт копии</button></span></footer>
    </main>
    {showCreate&&<Modal title="Создать эксперимент" subtitle="Начните с чёткой гипотезы и одной основной метрики." onClose={()=>setShowCreate(false)}><label>Название эксперимента<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Упростить форму регистрации"/></label><label>Гипотеза<textarea value={form.hypothesis} onChange={e=>setForm({...form,hypothesis:e.target.value})} placeholder="Если изменить X, метрика Y улучшится, потому что…"/></label><label>Основная метрика<select value={form.metric} onChange={e=>setForm({...form,metric:e.target.value})}><option>Конверсия в регистрацию</option><option>Активация пользователей</option><option>Кликабельность кнопки</option><option>Запуск пробного периода</option><option>Конверсия в покупку</option></select></label><div className="modal-actions"><button className="btn-secondary" onClick={()=>setShowCreate(false)}>Отмена</button><button className="btn-primary" onClick={createExperiment}><Plus size={16}/> Создать эксперимент</button></div></Modal>}
    {showImport&&<Modal title="Import experiments" subtitle="Вставьте данные CSV. Обязательные столбцы указаны ниже." onClose={()=>setShowImport(false)}><div className="csv-help">id,name,status,control_visitors,control_conversions,variant_visitors,variant_conversions</div><textarea className="import-area" value={importText} onChange={e=>setImportText(e.target.value)} placeholder={'EXP-025,Новый онбординг,Running,500,50,510,62'} rows={6}/><div className="modal-actions"><button className="btn-secondary" onClick={()=>setShowImport(false)}>Отмена</button><button className="btn-primary" onClick={importCsv}><Upload size={16}/> Импорт CSV</button></div></Modal>}
    {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}
  </div>
}
function Overview({experiments,filtered,statusData,trendData,primary,running,completed,needsReview,onNew,onOpen,onViewAll}:{experiments:Experiment[];filtered:Experiment[];statusData:{name:string;value:number;color:string}[];trendData:{day:string;control:number;variant:number}[];primary?:Experiment;running:number;completed:number;needsReview:number;onNew:()=>void;onOpen:(e:Experiment)=>void;onViewAll:()=>void}){
  const total=experiments.length
  const totalVisitors=experiments.reduce((s,e)=>s+e.controlVisitors+e.variantVisitors,0)
  const liftValue=primary?lift(primary):0
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> ВАШЕ ПРОСТРАНСТВО ЭКСПЕРИМЕНТОВ</div><h1>{getGreeting()} <span className="wave">✳</span></h1><p>Главное о ваших экспериментах на сегодня.</p></div><div className="heading-actions"><button className="btn-secondary" onClick={()=>window.print()}><FileText size={16}/> Экспорт отчёта</button><button className="btn-primary" onClick={onNew}><Plus size={17}/> Новый эксперимент</button></div></div>
    <div className="metric-grid">
      <MetricCard label="Всего экспериментов" value={String(total).padStart(2,'0')} change="Всего в проекте" icon={<FlaskConical/>} color="purple" foot={`${completed} completed`} />
      <MetricCard label="Сейчас запущено" value={String(running).padStart(2,'0')} change="Сбор данных продолжается" icon={<Activity/>} color="blue" foot="Следите за размером выборки" />
      <MetricCard label="Требуют внимания" value={String(needsReview).padStart(2,'0')} change="Нужен более внимательный анализ" icon={<CircleAlert/>} color="amber" foot={needsReview?'Проверьте результаты и примите решение':'Нет результатов на проверку'} />
      <MetricCard label="Всего участников" value={totalVisitors.toLocaleString('en-US')} change="В экспериментах с данными" icon={<Users/>} color="green" foot="Контрольная и тестовая группы" />
    </div>
    <div className="dashboard-grid top-charts">
      <section className="panel trend-panel"><PanelHeading title="Динамика конверсии" subtitle="Пример динамики по дням · демонстрационные данные" action="Последние 7 дней"/><div className="chart-key"><span><i className="key-dot purple-dot"/>Variant</span><span><i className="key-dot gray-dot"/>Control</span><span className="chart-unit">Conversion rate (%)</span></div><div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{top:10,right:8,left:-22,bottom:0}}><defs><linearGradient id="variantFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid stroke="#eff1f6" strokeDasharray="4 5" vertical={false}/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fill:'#9aa1b0',fontSize:11}} dy={10}/><YAxis domain={[8,15]} tickLine={false} axisLine={false} tick={{fill:'#9aa1b0',fontSize:11}} tickFormatter={v=>`${v}%`}/><Tooltip contentStyle={{border:'1px solid #eceef4',borderRadius:12,fontSize:12,boxShadow:'0 8px 24px #20264010'}} formatter={(v:any)=>[`${Number(v).toFixed(1)}%`,'']}/><Area type="monotone" dataKey="variant" name="Variant" stroke="#8052e8" strokeWidth={2.5} fill="url(#variantFill)" activeDot={{r:5,strokeWidth:0}}/><Area type="monotone" dataKey="control" name="Control" stroke="#aeb6c5" strokeWidth={2.2} fill="transparent" activeDot={{r:4,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><span className="live-dot"/> Предпросмотр динамики</span><span>Демонстрационные данные — не связаны с ежедневными событиями эксперимента</span></div></section>
      <section className="panel status-panel"><PanelHeading title="Statusы экспериментов" subtitle="Текущий статус экспериментов" action="Все эксперименты" onAction={onViewAll}/><div className="status-chart-wrap"><div className="donut-holder"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={65} paddingAngle={4} stroke="none">{statusData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}</Pie><Tooltip formatter={(v:any,n:any)=>[v,n]}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{total}</strong><span>экспериментов</span></div></div><div className="status-legend">{statusData.map(s=><div className="status-item" key={s.name}><span className="status-dot" style={{background:s.color}}/><span>{s.name}</span><b>{s.value}</b></div>)}</div></div><div className="status-foot"><span>Состояние процесса</span><b>{total?Math.round((completed/total)*100):0}% завершено</b></div><div className="status-progress"><span style={{width:`${total?completed/total*100:0}%`}}/></div></section>
    </div>
    <div className="dashboard-grid lower-grid">
      <section className="panel experiments-panel"><PanelHeading title="Последние эксперименты" subtitle="Краткий обзор последних экспериментов" action="Все эксперименты" onAction={onViewAll}/><div className="table-scroll"><table className="experiments-table"><thead><tr><th>ЭКСПЕРИМЕНТ</th><th>СТАТУС</th><th>ОСНОВНАЯ МЕТРИКА</th><th>КОНВЕРСИЯ / ПРИРОСТ</th><th/></tr></thead><tbody>{filtered.slice(0,5).map(e=><tr key={e.id} onClick={()=>onOpen(e)} className="table-row"><td><div className="experiment-cell"><div className={`experiment-icon ${e.status==='Running'?'icon-blue':e.status==='Needs review'?'icon-amber':e.status==='Completed'?'icon-green':'icon-gray'}`}><FlaskConical size={16}/></div><div><b>{e.name}</b><small>{e.id} <span>·</span> {e.started}</small></div></div></td><td><StatusBadge status={e.status}/></td><td><span className="metric-name">{e.metric}</span></td><td><span className={`lift-text ${lift(e)>=0?'lift-positive':'lift-negative'}`}>{e.controlVisitors&&e.variantVisitors?`${lift(e)>=0?'+':''}${lift(e).toFixed(1)}%`:'—'}</span></td><td><button className="row-arrow" onClick={ev=>{ev.stopPropagation();onOpen(e)}}><ChevronRight size={16}/></button></td></tr>)}</tbody></table></div><button className="table-mobile-link" onClick={onViewAll}>Все эксперименты <ChevronRight size={15}/></button></section>
      <section className="panel attention-panel"><PanelHeading title="Требуют внимания" subtitle="Рекомендуемые следующие шаги"/>{experiments.filter(e=>e.status==='Needs review'||e.status==='Running').slice(0,3).map(e=><button className="attention-item" key={e.id} onClick={()=>onOpen(e)}><div className={`attention-icon ${e.status==='Needs review'?'attention-amber':'attention-blue'}`}>{e.status==='Needs review'?<CircleAlert size={17}/>:<Clock3 size={17}/>}</div><div className="attention-copy"><b>{e.name}</b><small>{e.status==='Needs review'?'Результаты готовы к проверке':'Эксперимент собирает данные'}</small><span>{e.id} · {e.status}</span></div><ChevronRight size={15}/></button>)}{!experiments.some(e=>e.status==='Needs review'||e.status==='Running')&&<div className="empty-state">Нет экспериментов, требующих внимания. Отличная работа!</div>}<div className="insight-box"><div className="insight-icon"><Sparkles size={16}/></div><div><b>Совет продакту</b><p>Определите одну основную метрику до запуска теста. Это поможет принять сфокусированное решение.</p></div></div></section>
    </div>
    <div className="dashboard-grid bottom-grid">
      <section className="panel performance-panel"><PanelHeading title="Сводка результатов" subtitle="Выбранный эксперимент · наблюдаемые результаты" action={primary?.id||'Нет данных'}/>{primary&&primary.controlVisitors>0&&primary.variantVisitors>0?<><div className="snapshot-title"><div><span className="mini-label">ОСНОВНАЯ МЕТРИКА</span><h3>{primary.metric}</h3></div><StatusBadge status={primary.status}/></div><div className="snapshot-values"><div><span>Контрольная группа</span><strong>{fmt(rate(primary.controlConversions,primary.controlVisitors),2)}</strong><small>{primary.controlConversions.toLocaleString()} / {primary.controlVisitors.toLocaleString()} conversions</small></div><div className="snapshot-divider"/><div><span>Тестовая группа</span><strong>{fmt(rate(primary.variantConversions,primary.variantVisitors),2)}</strong><small>{primary.variantConversions.toLocaleString()} / {primary.variantVisitors.toLocaleString()} conversions</small></div></div><div className="snapshot-lift"><div><span>Наблюдаемый относительный прирост</span><strong className={lift(primary)>=0?'lift-positive':'lift-negative'}>{lift(primary)>=0?'+':''}{lift(primary).toFixed(1)}%</strong></div><div className="snapshot-lift-bar"><span style={{width:`${Math.min(100,Math.abs(lift(primary))*3)}%`}}/></div></div><button className="btn-secondary full-btn" onClick={()=>onOpen(primary)}>Открыть анализ эксперимента <ChevronRight size={15}/></button></>:<div className="empty-state">Add results to see the performance snapshot.</div>}</section>
      <section className="panel quick-panel"><PanelHeading title="Быстрые действия" subtitle="Продолжайте работу над экспериментами"/><button className="quick-action" onClick={onNew}><span className="quick-icon purple-bg"><Plus size={17}/></span><span><b>Создать эксперимент</b><small>Превратите идею в проверяемую гипотезу</small></span><ChevronRight size={16}/></button><button className="quick-action" onClick={()=>document.querySelector<HTMLInputElement>('#quick-search')?.focus()}><span className="quick-icon blue-bg"><Search size={17}/></span><span><b>Найти эксперимент</b><small>Поиск по названию, ID или метрике</small></span><ChevronRight size={16}/></button><button className="quick-action" onClick={()=>window.print()}><span className="quick-icon green-bg"><FileText size={17}/></span><span><b>Экспорт дашборда</b><small>Распечатайте обзор или сохраните его в PDF</small></span><ChevronRight size={16}/></button><div className="privacy-note"><CircleDot size={13}/><span>Your data stays in this browser. Export a backup before clearing site data.</span></div></section>
    </div>
  </>
}
function MetricCard({label,value,change,icon,color,foot}:{label:string;value:string;change:string;icon:React.ReactNode;color:string;foot:string}){
  return <section className="metric-card"><div className="metric-card-top"><span>{label}</span><span className={`metric-icon ${color}`}>{icon}</span></div><div className="metric-number">{value}</div><div className="metric-change">{change}</div><div className="metric-foot"><span className={`foot-dot ${color}`}/>{foot}</div></section>
}
function PanelHeading({title,subtitle,action,onAction}:{title:string;subtitle?:string;action?:string;onAction?:()=>void}){
  return <div className="panel-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action&&(onAction?<button className="panel-action" onClick={onAction}>{action}<ChevronRight size={14}/></button>:<span className="panel-period">{action}<ChevronDown size={13}/></span>)}</div>
}
function StatusBadge({status}:{status:Status}){return <span className={`status-badge ${statusMeta[status].tone}`}><i/>{statusMeta[status].label}</span>}
function ExperimentsPage({experiments,onNew,onOpen,onImport}:{experiments:Experiment[];onNew:()=>void;onOpen:(e:Experiment)=>void;onImport:()=>void}){
  const [filter,setFilter]=useState('All')
  const items=experiments.filter(e=>filter==='All'||e.status===filter)
  return <><div className="page-heading"><div><div className="eyebrow">ПРОСТРАНСТВО / ЭКСПЕРИМЕНТЫ</div><h1>Эксперименты</h1><p>Управляйте гипотезами, тестами и результатами в одном месте.</p></div><div className="heading-actions"><button className="btn-secondary" onClick={onImport}><Upload size={16}/> Импорт CSV</button><button className="btn-primary" onClick={onNew}><Plus size={17}/> Новый эксперимент</button></div></div><div className="panel list-panel"><div className="filter-row"><div className="filter-tabs">{['All','Running','Needs review','Completed','Draft'].map(s=><button key={s} className={filter===s?'selected':''} onClick={()=>setFilter(s)}>{({'All':'Все','Running':'Запущен','Needs review':'Нужна проверка','Completed':'Завершён','Draft':'Черновик'} as Record<string,string>)[s]}<span>{s==='All'?experiments.length:experiments.filter(e=>e.status===s).length}</span></button>)}</div><button className="btn-secondary small-btn"><SlidersHorizontal size={15}/> Фильтр</button></div><div className="table-scroll"><table className="experiments-table full-table"><thead><tr><th>ЭКСПЕРИМЕНТ</th><th>СТАТУС</th><th>ОСНОВНАЯ МЕТРИКА</th><th>КОНТРОЛЬ</th><th>ТЕСТ</th><th>ПРИРОСТ</th><th/></tr></thead><tbody>{items.map(e=><tr key={e.id} className="table-row" onClick={()=>onOpen(e)}><td><div className="experiment-cell"><div className="experiment-icon icon-purple"><FlaskConical size={16}/></div><div><b>{e.name}</b><small>{e.id} · {e.started}</small></div></div></td><td><StatusBadge status={e.status}/></td><td>{e.metric}</td><td>{e.controlVisitors?fmt(rate(e.controlConversions,e.controlVisitors),2):'—'}</td><td>{e.variantVisitors?fmt(rate(e.variantConversions,e.variantVisitors),2):'—'}</td><td className={lift(e)>=0?'lift-positive':'lift-negative'}>{e.controlVisitors&&e.variantVisitors?`${lift(e)>=0?'+':''}${lift(e).toFixed(1)}%`:'—'}</td><td><ChevronRight size={16}/></td></tr>)}</tbody></table></div>{!items.length&&<div className="empty-state">В этом разделе пока нет экспериментов.</div>}</div></>
}
function AnalysisPage({experiments,onOpen}:{experiments:Experiment[];onOpen:(e:Experiment)=>void}){
  return <><div className="page-heading"><div><div className="eyebrow">ПРОСТРАНСТВО / АНАЛИТИКА</div><h1>Аналитика</h1><p>Сравнивайте наблюдаемую конверсию. Результаты описательные и сами по себе не доказывают причинно-следственную связь.</p></div></div><div className="analysis-grid">{experiments.map(e=><button className="panel analysis-card" key={e.id} onClick={()=>onOpen(e)}><div className="analysis-card-top"><span className="mini-label">{e.id}</span><StatusBadge status={e.status}/></div><h3>{e.name}</h3><p>{e.metric}</p><div className="analysis-bars"><div><span>Контрольная группа</span><b>{fmt(rate(e.controlConversions,e.controlVisitors),2)}</b></div><div className="bar-track"><div className="bar-fill control" style={{width:`${Math.min(100,rate(e.controlConversions,e.controlVisitors)*5)}%`}}/></div><div><span>Тестовая группа</span><b>{fmt(rate(e.variantConversions,e.variantVisitors),2)}</b></div><div className="bar-track"><div className="bar-fill variant" style={{width:`${Math.min(100,rate(e.variantConversions,e.variantVisitors)*5)}%`}}/></div></div><div className="analysis-lift">Наблюдаемый прирост <strong className={lift(e)>=0?'lift-positive':'lift-negative'}>{lift(e)>=0?'+':''}{lift(e).toFixed(1)}%</strong></div></button>)}</div>{!experiments.length&&<div className="panel empty-state">Добавьте результаты эксперимента, чтобы начать анализ.</div>}</>
}
function ExperimentDetail({experiment,onBack,onUpdate,onDelete}:{experiment:Experiment;onBack:()=>void;onUpdate:(e:Experiment)=>void;onDelete:()=>void}){
  const [edit,setEdit]=useState(false)
  const [draft,setDraft]=useState(experiment)
  const c=rate(experiment.controlConversions,experiment.controlVisitors),v=rate(experiment.variantConversions,experiment.variantVisitors),diff=v-c
  return <><div className="page-heading detail-heading"><div><button className="back-link" onClick={onBack}>← Ко всем экспериментам</button><div className="eyebrow">{experiment.id} / ЭКСПЕРИМЕНТ DETAILS</div><h1>{experiment.name}</h1><p>{experiment.hypothesis}</p></div><div className="heading-actions"><button className="btn-secondary" onClick={()=>window.print()}><FileText size={16}/> Экспорт отчёта</button><button className="btn-primary" onClick={()=>setEdit(!edit)}><Settings2 size={16}/>{edit?'Отменить редактирование':'Изменить результаты'}</button></div></div>
    {edit?<section className="panel edit-panel"><h2>Редактирование данных эксперимента</h2><div className="edit-grid"><label>Статус<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as Status})}>{Object.keys(statusMeta).map(s=><option key={s} value={s}>{statusMeta[s as Status].label}</option>)}</select></label><label>Основная метрика<input value={draft.metric} onChange={e=>setDraft({...draft,metric:e.target.value})}/></label>{(['controlVisitors','controlConversions','variantVisitors','variantConversions'] as const).map(k=><label key={k}>{({controlVisitors:'Посетители контрольной группы',controlConversions:'Конверсии контрольной группы',variantVisitors:'Посетители тестовой группы',variantConversions:'Конверсии тестовой группы'})[k]}<input type="number" min="0" value={draft[k]} onChange={e=>setDraft({...draft,[k]:Number(e.target.value)})}/></label>)}</div><div className="modal-actions"><button className="btn-secondary" onClick={()=>setEdit(false)}>Отмена</button><button className="btn-primary" onClick={()=>{if(draft.controlConversions>draft.controlVisitors||draft.variantConversions>draft.variantVisitors||Object.values(draft).some(v=>typeof v==='number'&&v<0)){alert('Проверьте данные: число конверсий не может превышать число посетителей, значения не могут быть отрицательными.');return}onUpdate(draft);setEdit(false)}}>Сохранить изменения</button></div></section>:null}
    <div className="metric-grid detail-metrics"><MetricCard label="Конверсия в контрольной группе" value={experiment.controlVisitors?fmt(c,2):'—'} change={`${experiment.controlConversions} конверсий / ${experiment.controlVisitors} посетителей`} icon={<Users/>} color="blue" foot="Control group"/><MetricCard label="Конверсия в тестовой группе" value={experiment.variantVisitors?fmt(v,2):'—'} change={`${experiment.variantConversions} конверсий / ${experiment.variantVisitors} посетителей`} icon={<Target/>} color="purple" foot="Test group"/><MetricCard label="Абсолютное изменение" value={experiment.controlVisitors&&experiment.variantVisitors?`${diff>=0?'+':''}${diff.toFixed(2)} pp`:'—'} change="Тестовая группа минус контрольная" icon={<TrendingUp/>} color="green" foot="Процентные пункты"/><MetricCard label="Относительный прирост" value={experiment.controlVisitors&&experiment.variantVisitors?`${lift(experiment)>=0?'+':''}${lift(experiment).toFixed(1)}%`:'—'} change="Наблюдаемое относительное изменение" icon={<Activity/>} color="amber" foot="Описательный результат, не доказательство причинности"/></div>
    <div className="dashboard-grid detail-grid"><section className="panel"><PanelHeading title="Сравнение конверсии" subtitle="Наблюдаемая конверсия по группам"/><div className="detail-bars"><div><span>Контрольная группа</span><b>{experiment.controlVisitors?fmt(c,2):'—'}</b></div><div className="bar-track"><div className="bar-fill control" style={{width:`${Math.min(100,c*5)}%`}}/></div><div><span>Тестовая группа</span><b>{experiment.variantVisitors?fmt(v,2):'—'}</b></div><div className="bar-track"><div className="bar-fill variant" style={{width:`${Math.min(100,v*5)}%`}}/></div></div><div className="detail-callout"><Sparkles size={17}/><p>{experiment.controlVisitors&&experiment.variantVisitors?`Наблюдаемая конверсия тестовой группы ${diff>=0?'выше':'ниже'} на ${Math.abs(diff).toFixed(2)} процентного пункта. Это описательный результат: перед решением оцените неопределённость и качество эксперимента.`:'Добавьте количество посетителей и конверсий, чтобы сравнить группы.'}</p></div></section><section className="panel"><PanelHeading title="Паспорт эксперимента" subtitle="Гипотеза и параметры"/><div className="brief-item"><span>Status</span><StatusBadge status={experiment.status}/></div><div className="brief-item"><span>Основная метрика</span><b>{experiment.metric}</b></div><div className="brief-item"><span>Дата начала</span><b>{experiment.started}</b></div><div className="brief-item"><span>Гипотеза</span><p>{experiment.hypothesis}</p></div><button className="delete-btn" onClick={()=>{if(confirm(`Удалить эксперимент «${experiment.name}»?`))onDelete()}}><Trash2 size={14}/> Удалить эксперимент</button></section></div>
  </>
}
function Modal({title,subtitle,children,onClose}:{title:string;subtitle:string;children:React.ReactNode;onClose:()=>void}){
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal"><div className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</section></div>
}
export default App
