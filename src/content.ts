const sources = import.meta.glob('../portfolio/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
export function publicCopy(file: string) {
 const source = sources[`../portfolio/${file}.md`];
 const match = source.match(/<!-- public-copy:start -->([\s\S]*?)<!-- public-copy:end -->/);
 if (!match) throw new Error(`Missing public copy in ${file}`);
 return match[1].trim();
}
export const home = publicCopy('pages/home');
export const projects = [
 {slug:'resqnet',name:'ResQNet',status:'Prototype · Mobile systems',when:'Ongoing',stack:['Flutter','Dart','Nearby Connections','Firebase'],question:'What can an emergency app still do when the network is gone?',summary:home.split('### ResQNet\n\n')[1].split('\n\n')[0],caption:'Illustrative relay path between connected devices. No measured range or delivery reliability is implied.'},
 {slug:'trading-lab',name:'Trading Lab',status:'Active research · Data and evaluation',when:'2026',stack:['Python','pandas','FastAPI'],question:'Does a trading rule still beat holding once fills wait for the next open and every trade pays a cost?',summary:home.split('### Trading Lab\n\n')[1].split('\n\n')[0],caption:'Conceptual research notebook. This drawing represents the evaluation process, not measured returns.'},
 {slug:'pancreatic-ct',name:'Pancreatic CT research',status:'Research · Computer vision',when:'Research',stack:['TensorFlow','Keras','ResNet-50','Swin'],question:'How much of a high accuracy score comes from the model, and how much from the split?',summary:home.split('### Pancreatic CT research\n\n')[1].split('\n\n')[0],caption:'Illustrative patient grouping. All slices from one person stay in a single evaluation partition.'},
 {slug:'eeg',name:'EEG research',status:'Internship research · Biomedical signals',when:'2025',stack:['MNE-Python','NumPy','SciPy'],question:'Can a classifier learn the condition rather than the person?',summary:'A signal-processing and classification study on EEG recordings, with subject-level evaluation.',caption:'Conceptual signal illustration, not a patient recording. The research method filters signals before extracting features and comparing classifiers.'},
 {slug:'logstonedb',name:'LogstoneDB',status:'In progress · Go',when:'Now',stack:['Go','Raft','Simulation'],question:'Can a distributed bug be replayed exactly, every time?',summary:'An early database project in Go. It starts with Raft and a deterministic simulator, before a networked, replicated key-value store.',caption:'Illustrative three-node target architecture. The current project begins with deterministic simulation.'}
];
export const skills = [
 {group:'Languages',items:['Python','Dart','Go','TypeScript','JavaScript','C++','C','Java']},
 {group:'Machine learning',items:['TensorFlow','Keras','PyTorch','NumPy','SciPy','pandas','MNE-Python']},
 {group:'Systems and backend',items:['Node.js','Express','FastAPI','PostgreSQL','Docker','Nginx','Raft']},
 {group:'Mobile and web',items:['Flutter','React Native','React','Next.js','GSAP','Three.js','Lenis']},
 {group:'Daily tools',items:['Git','GitHub','Jupyter Lab','VS Code','Firebase CLI']}
];
export const experience = [
 {when:'Now',role:'LogstoneDB',kind:'Solo project · Go',text:'I am building a replicated key-value store in Go. I started with a deterministic Raft simulator, so that any failing run can be replayed exactly.',href:'/projects/logstonedb'},
 {when:'2026',role:'Trading Lab',kind:'Independent research · Python',text:'In August I built an engine that tests trading rules on daily prices. In October I wrote a draft protocol for opening-range breakouts on Nifty 50 stocks, with a dataset registry and a holdout set that tuning never touches.',href:'/projects/trading-lab'},
 {when:'Ongoing',role:'ResQNet',kind:'Mobile and systems engineering',text:'I built an Android prototype that relays SOS messages between nearby phones without a server. The later versions move the backend onto a self-hosted server.',href:'/projects/resqnet'},
 {when:'May – Jun 2025',role:'Summer research intern',kind:'NIT Rourkela · EEG',text:'I worked with EEG recordings during my internship. I cleaned the signals, extracted features, and compared four classifiers on data split by subject.',href:'/projects/eeg'},
 {when:'Research',role:'Pancreatic CT study',kind:'Computer vision · Advisor-guided',text:'I benchmarked 36 pipelines to show how splitting scans by patient instead of by slice changes the reported accuracy. I also audited the dataset for duplicate images.',href:'/projects/pancreatic-ct'},
 {when:'Client work',role:'Web builds',kind:'Frontend',text:'I have built animation-heavy websites for clients using GSAP, Three.js, and Lenis.',href:null}
];
export const studying = [
 {tag:'Raft',text:'I am reading about Raft and writing down the rules that LogstoneDB must never break.'},
 {tag:'Trading',text:'I am studying opening-range breakout strategies, and I keep all data after 1 October 2026 aside for one final test.'},
 {tag:'LLMs',text:'I am learning how quantization and Apple\'s MLX library let large language models run on a laptop with less memory.'}
];
