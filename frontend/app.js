const { useState, useEffect, useMemo } = React;
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = window.Recharts || {};

// Custom SVG Icons
const Icons = {
    Layers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
    ),
    Pickaxe: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2 22 9.5" /><path d="m15 15 6 6" /><path d="M10 20v-5l-7-7V3h5l7 7h5" /><path d="m10 20-8-8" /></svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
    ChevronLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    History: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
    ),
    Maximize2: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
    ),
    TrendingDown: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
    ),
    ArrowRightLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></svg>
    ),
    Play: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    ),
    Pause: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
    )
};

const STRATA_APP = () => {
    const CORPUS_EXAMPLES = [
        "The foundations of language are built like the strata of the earth. Each merge adds a new layer of complexity, a new mineral of meaning crystallized from the raw dust of characters. To understand the structure of the whole, one must excavate the parts, layer by layer, until the base bedrock is revealed.",
        "The architecture of meaning is built upon a substrate of recurring patterns. Just as tectonic plates shift and collide to create mountain ranges, characters collide and merge to form the peaks of our vocabulary. This process of compression is the very heartbeat of efficient communication.",
        "Deep within the digital mines of information, we search for the precious gems of efficiency. Each merge rule act as a chemical bond, crystallizing simple characters into complex molecular structures. The deeper we excavate, the more refined our understanding of the linguistic landscape becomes.",
        "Consider the sedimentary layers of a text, where ancient roots and modern prefixes coexist. By applying the BPE algorithm, we simulate the passage of geological time—merging common occurrences into stable bedrock. What remains is a compact representation of the original linguistic deposit.",
        "A language is a living geography, constantly eroding and rebuilding itself. Through the lens of tokenization, we can witness the erosion of individual characters as they are subsumed into the rising tides of frequent pairs. This is the natural selection of tokens in the ecosystem of a corpus."
    ];

    const [activePanel, setActivePanel] = useState('train');
    const [corpus, setCorpus] = useState(CORPUS_EXAMPLES[0]);
    const [corpusIndex, setCorpusIndex] = useState(0);
    const [vocabSize, setVocabSize] = useState(150);
    const [loading, setLoading] = useState(false);
    const [encodingLoading, setEncodingLoading] = useState(false);
    const [trainingData, setTrainingData] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [inputText, setInputText] = useState("");
    const [encodedTokens, setEncodedTokens] = useState([]);
    const [selectedTokenAncestry, setSelectedTokenAncestry] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const API_URL = window.location.port === '5500' 
        ? `http://${window.location.hostname}:5000` 
        : '/api';

    // Autoplay effect
    useEffect(() => {
        let interval;
        if (isPlaying && trainingData) {
            interval = setInterval(() => {
                setCurrentStep(s => {
                    if (s >= trainingData.history.length - 1) {
                        setIsPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, 800);
        }
        return () => clearInterval(interval);
    }, [isPlaying, trainingData]);

    const handleTrain = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/train`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ corpus, vocab_size: vocabSize })
            });
            const data = await response.json();
            setTrainingData(data);
            setCurrentStep(0);
            setActivePanel('visualize');
        } catch (err) {
            console.error("Training failed:", err);
            alert("Training failed. Is the backend server running?");
        } finally {
            setLoading(false);
        }
    };

    const handleEncode = async () => {
        if (!trainingData || !inputText.trim()) return;
        setEncodingLoading(true);
        try {
            const response = await fetch(`${API_URL}/encode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText, merges: trainingData.merges })
            });
            const data = await response.json();
            setEncodedTokens(data.tokens);
        } catch (err) {
            console.error("Encoding failed:", err);
        } finally {
            setEncodingLoading(false);
        }
    };

    const getAncestry = (token, visited = new Set()) => {
        if (visited.has(token)) return { t: token };
        const newVisited = new Set(visited);
        newVisited.add(token);
        
        if (!trainingData || !trainingData.merges) return { t: token };
        const mergeIdx = trainingData.merges.findIndex(m => m[0] + m[1] === token);
        if (mergeIdx === -1) return { t: token };
        const [a, b] = trainingData.merges[mergeIdx];
        return {
            t: token,
            age: mergeIdx + 1,
            left: getAncestry(a, newVisited),
            right: getAncestry(b, newVisited)
        };
    };

    const renderAncestry = (node, depth = 0) => {
        if (!node.left) return (
            <div className="flex flex-col items-center">
                <span className="token-chip default mono text-xs opacity-60">{node.t}</span>
            </div>
        );

        return (
            <div className="flex flex-col items-center border-t border-amber/20 pt-2 mt-2">
                <span className="token-chip amber mono text-sm mb-2">{node.t}</span>
                <div className="flex gap-4">
                    {renderAncestry(node.left, depth + 1)}
                    {renderAncestry(node.right, depth + 1)}
                </div>
            </div>
        );
    };

    const compressionStats = useMemo(() => {
        if (!inputText || encodedTokens.length === 0) return null;
        const charBaseline = inputText.length;
        const tokenCount = encodedTokens.length;
        const ratio = (charBaseline / tokenCount).toFixed(2);
        const pressure = Math.min(100, (tokenCount / charBaseline) * 100);
        return { charBaseline, tokenCount, ratio, pressure };
    }, [inputText, encodedTokens]);

    return (
        <div className="min-h-screen flex flex-col p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                            <div className="h-0.5 w-6 bg-white/20"></div>
                            <div className="h-0.5 w-6 bg-white/40"></div>
                            <div className="h-0.5 w-6 bg-amber-600"></div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-widest mono text-white">STRATA</h1>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Byte Pair Encoding Visualization</p>
                </div>
                
                <nav className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {['train', 'visualize', 'encode'].map(panel => (
                        <button 
                            key={panel}
                            onClick={() => (panel === 'train' || trainingData) && setActivePanel(panel)}
                            className={`px-3 lg:px-4 py-1.5 rounded-full text-[10px] lg:text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap
                                ${activePanel === panel ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 
                                  trainingData ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-white/20 cursor-not-allowed'}`}
                        >
                            {panel}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="flex-1 flex gap-6 overflow-hidden">
                {/* PANEL 1: TRAIN */}
                {activePanel === 'train' && (
                    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 animate-fade-in overflow-y-auto lg:overflow-visible pr-1">
                        {/* 1. Corpus Column - Always First */}
                        <div className="order-1 lg:order-1 col-span-12 lg:col-span-6 flex flex-col gap-6">
                            <div className="card min-h-[300px] lg:flex-1 p-4 lg:p-6 flex flex-col">
                                <div className="rock-texture"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Icons.Pickaxe />
                                        <h2 className="font-semibold uppercase tracking-wider text-sm">Training Corpus</h2>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const next = (corpusIndex + 1) % CORPUS_EXAMPLES.length;
                                            setCorpusIndex(next);
                                            setCorpus(CORPUS_EXAMPLES[next]);
                                        }}
                                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/60 hover:text-amber-500 transition-all flex items-center gap-2"
                                    >
                                        <Icons.ArrowRightLeft /> NEXT EXAMPLE
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">The raw material used to learn common patterns and vocabulary.</p>
                                <textarea 
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 mono text-sm text-white/80 focus:outline-none focus:border-amber-500/50 resize-none"
                                    value={corpus}
                                    onChange={(e) => setCorpus(e.target.value)}
                                    placeholder="Paste your training text here..."
                                />
                            </div>
                        </div>

                        {/* 2. Params Column - Second on Laptop, Third on Mobile */}
                        <div className="order-3 lg:order-2 col-span-12 lg:col-span-3 flex flex-col gap-6">
                            <div className="card p-6">
                                <div className="rock-texture"></div>
                                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                                    <Icons.Layers /> BPE Parameters
                                </h3>
                                <p className="text-[10px] text-white/40 mb-6 uppercase tracking-tighter">Define the limits of your vocabulary extraction.</p>
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <label className="text-xs text-white/60">Target Vocab Size</label>
                                            <span className="text-xs mono text-amber-500 font-bold">{vocabSize}</span>
                                        </div>
                                        <input 
                                            type="range" min="50" max="500" value={vocabSize}
                                            onChange={(e) => setVocabSize(parseInt(e.target.value))}
                                            className="w-full accent-amber-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] text-white/20 mono">
                                            <span>MIN_VOCAB (50)</span>
                                            <span>MAX_VOCAB (500)</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleTrain}
                                        disabled={loading}
                                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(217,119,6,0.2)] hover:shadow-[0_0_30px_rgba(217,119,6,0.4)] flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                TRAINING...
                                            </span>
                                        ) : (
                                            <>
                                                <Icons.Zap /> START TRAINING
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Explanation Column - Third on Laptop, Second on Mobile */}
                        <div className="order-2 lg:order-3 col-span-12 lg:col-span-3 flex flex-col gap-6">
                            <div className="card p-6 flex-1">
                                <div className="rock-texture"></div>
                                <h2 className="text-xs uppercase tracking-widest text-amber-500 mb-4 font-bold">New to BPE?</h2>
                                <div className="space-y-4 text-xs text-white/60 leading-relaxed">
                                    <p>
                                        <strong className="text-white">Byte Pair Encoding (BPE)</strong> is how AI models like GPT "read" text. Instead of looking at whole words or single characters, it finds the most frequent patterns and merges them into "tokens".
                                    </p>
                                    <p>
                                        This process reduces the length of the text while keeping the most meaningful combinations together, making it much more efficient for machines to process.
                                    </p>
                                    <div className="p-3 bg-white/5 rounded border border-white/10 italic">
                                        Think of it like geological sedimentation—characters are the raw dust, and merges are the layers forming solid rock.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PANEL 2: VISUALIZE */}
                {activePanel === 'visualize' && trainingData && (
                    <div className="flex-1 flex flex-col items-center gap-4 lg:gap-6 animate-fade-in overflow-y-auto pr-2 py-2 lg:py-4">
                        <div className="w-full max-w-5xl flex flex-col gap-4 lg:gap-6">
                            {/* Dynamic Step Explanation */}
                            <div className="card p-3 lg:p-4 border-amber-500/30 bg-amber-900/10 shadow-[0_0_20px_rgba(217,119,6,0.1)]">
                                <div className="flex items-start gap-3 lg:gap-4">
                                    <div className="p-2 bg-amber-600 rounded-lg text-white shadow-lg">
                                        <Icons.Zap />
                                    </div>
                                    <div>
                                        <h3 className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">Step {currentStep}: {currentStep === 0 ? "Initial Bedrock" : "Layer Formation"}</h3>
                                        <p className="text-sm text-white/80 leading-relaxed">
                                            {currentStep === 0 ? (
                                                "Every single character is currently a separate token. This is the 'raw dust' before any structure has been learned. Total tokens: " + trainingData.history[0].token_count
                                            ) : (
                                                <>
                                                    In this step, we identified that <span className="text-amber-500 font-bold">"{trainingData.history[currentStep].rule.split('→')[0].trim()}"</span> appeared most frequently. 
                                                    They have been merged into the new token <span className="text-green-500 font-bold">"{trainingData.history[currentStep].rule.split('→')[1].trim()}"</span>. 
                                                    The total token count dropped to {trainingData.history[currentStep].token_count}.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="w-full flex flex-col gap-4 lg:gap-6">
                                    <div className="card p-4 lg:p-6 flex flex-col h-[400px] lg:h-[500px]">
                                <div className="rock-texture"></div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Icons.Eye />
                                        <h2 className="font-semibold uppercase tracking-wider text-sm">BPE Visualizer</h2>
                                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">Watch how characters merge into tokens step-by-step.</p>
                                        <span className="px-2 py-0.5 rounded bg-amber-900/30 border border-amber-600/30 text-[10px] mono text-amber-500">
                                            Merge Step {currentStep} of {trainingData.history.length - 1}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <button 
                                            onClick={() => {
                                                setIsPlaying(false);
                                                setCurrentStep(s => Math.max(0, s-1));
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-amber-500 transition-colors"
                                            title="Previous Step"
                                        ><Icons.ChevronLeft /></button>
                                        
                                        <button 
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/5 text-white/60 hover:text-amber-500'}`}
                                            title={isPlaying ? "Pause" : "Play"}
                                        >
                                            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setIsPlaying(false);
                                                setCurrentStep(s => Math.min(trainingData.history.length-1, s+1));
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-amber-500 transition-colors"
                                            title="Next Step"
                                        ><Icons.ChevronRight /></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 bg-black/40 rounded-lg border border-white/5 mono text-sm leading-8">
                                    {trainingData.history[currentStep].corpus_snapshot.slice(0, 50).map((item, i) => (
                                        <span key={i} className="mr-4 inline-block opacity-80">
                                            {item.word.map((token, j) => {
                                                const rule = trainingData.history[currentStep].rule;
                                                const isNew = rule && currentStep > 0 && token === rule.split('→ ')[1]?.trim();
                                                const pair = trainingData.history[currentStep].best_pair;
                                                const isPair = Array.isArray(pair) && pair.length > 0 && (token === pair[0] || token === pair[1]);
                                                
                                                return (
                                                    <span 
                                                        key={j} 
                                                        className={`token-chip ${isNew ? 'green' : isPair ? 'amber' : 'default opacity-40'} transition-all duration-300`}
                                                    >
                                                        {token === '</w>' ? '␣' : token}
                                                    </span>
                                                );
                                            })}
                                            <span className="text-[10px] opacity-20 ml-1">x{item.freq}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="card p-6 h-[250px]">
                                <div className="rock-texture"></div>
                                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                                    <Icons.TrendingDown /> Pair Frequency Distribution
                                </h3>
                                <p className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">The most common character pairs are chosen for merging in each step.</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trainingData.history[currentStep].top_pairs}>
                                        <XAxis dataKey="pair" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', fontSize: '10px'}}
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        />
                                        <Bar dataKey="freq" radius={[4, 4, 0, 0]}>
                                            {trainingData.history[currentStep].top_pairs?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#d97706' : '#2a2a2a'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="col-span-12 flex flex-col gap-6">
                            <div className="card p-6">
                                <div className="rock-texture"></div>
                                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                                    <Icons.History /> Learned Merge Rules
                                </h3>
                                <p className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">The history of all successful merges that created your vocabulary.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto max-h-[200px] lg:max-h-[150px] pr-2">
                                    {trainingData.merges.map((merge, i) => (
                                        <div 
                                            key={i} 
                                            className={`p-2 rounded border border-white/5 mono text-[10px] flex justify-between items-center group cursor-pointer transition-all
                                                ${i < currentStep ? 'bg-white/5 border-amber-500/20' : 'opacity-20 hover:opacity-40'}`}
                                            onClick={() => setCurrentStep(i + 1)}
                                        >
                                            <span className="text-white/40 font-bold">#{i+1}</span>
                                            <span className="text-amber-500 group-hover:scale-105 transition-transform truncate ml-2">
                                                {merge[0]} + {merge[1]} → {merge[0]}{merge[1]}
                                            </span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

                {/* PANEL 3: ENCODE */}
                {activePanel === 'encode' && trainingData && (
                    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-visible">
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                            <div className="card p-4 lg:p-6 h-auto lg:h-[500px] flex flex-col min-h-[400px]">
                                <div className="rock-texture"></div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
                                    <div className="flex flex-col gap-1 text-white/80">
                                        <div className="flex items-center gap-2">
                                            <Icons.ArrowRightLeft />
                                            <h2 className="font-semibold uppercase tracking-wider text-sm">Live Tokenizer</h2>
                                        </div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">Test your trained model on new text.</p>
                                    </div>
                                    <div className="hidden xl:block text-right">
                                        <p className="text-[10px] text-teal-500 uppercase tracking-widest font-bold">How it works:</p>
                                        <p className="text-[9px] text-white/40 max-w-[200px]">The model applies the {trainingData.merges.length} merges you trained, in the exact same sequence, to compress this new text.</p>
                                    </div>
                                    <button 
                                        onClick={handleEncode}
                                        disabled={encodingLoading}
                                        className="w-full sm:w-auto px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(13,148,136,0.2)]"
                                    >
                                        {encodingLoading ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                PROCESSING...
                                            </>
                                        ) : (
                                            "TOKENIZE"
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 flex-1 overflow-hidden">
                                    <div className="w-full sm:w-1/2 flex flex-col min-h-[150px]">
                                        <textarea 
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 mono text-sm text-white/80 focus:outline-none focus:border-teal-500/50 resize-none"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="Enter text to tokenize..."
                                        />
                                    </div>
                                    <div className="w-full sm:w-1/2 bg-black/60 rounded-lg p-4 overflow-y-auto mono text-sm border border-white/5 relative min-h-[150px]">
                                        {encodedTokens.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 leading-relaxed">
                                                {encodedTokens.map((token, i) => (
                                                    <span 
                                                        key={i} 
                                                        onClick={() => setSelectedTokenAncestry(getAncestry(token.t))}
                                                        className={`token-chip cursor-pointer hover:scale-110 ${i % 2 === 0 ? 'teal' : 'purple'}`}
                                                    >
                                                        {token.t === '</w>' ? '␣' : token.t}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-white/10 text-center p-8">
                                                <Icons.Maximize2 />
                                                <p className="text-xs uppercase tracking-widest mt-4">Tokenization results will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6 flex-1 min-h-[300px]">
                                <div className="rock-texture"></div>
                                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                                    <Icons.Maximize2 /> Token Ancestry: Derivation Tree
                                </h3>
                                <div className="flex items-center justify-center min-h-[200px]">
                                    {selectedTokenAncestry ? (
                                        <div className="animate-fade-in p-4 bg-white/5 rounded-xl border border-white/5">
                                            {renderAncestry(selectedTokenAncestry)}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-white/20 italic">Click a token above to see its derivation</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <div className="card p-6">
                                <div className="rock-texture"></div>
                                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Efficiency Analytics</h3>
                                {compressionStats ? (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-white/60">Compression Ratio</span>
                                                <span className="text-teal-500 font-bold mono">x{compressionStats.ratio}</span>
                                            </div>
                                            <div className="pressure-gauge">
                                                <div 
                                                    className="pressure-fill bg-gradient-to-r from-teal-900 to-teal-500 shadow-[0_0_10px_#0d9488]"
                                                    style={{width: `${compressionStats.pressure}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/20">No data available yet.</p>
                                )}
                            </div>

                            <div className="card flex-1 p-6 flex flex-col overflow-hidden">
                                <div className="rock-texture"></div>
                                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Token Strata</h3>
                                <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-0.5 pr-2">
                                    {encodedTokens.length > 0 ? (
                                        encodedTokens.map((token, i) => (
                                            <div 
                                                key={i}
                                                className="h-6 flex items-center px-3 text-[10px] mono border-l-4 transition-all hover:translate-x-1"
                                                style={{
                                                    backgroundColor: `rgba(13, 148, 136, ${0.05 + (token.age / (trainingData.merges.length + 1)) * 0.4})`,
                                                    borderLeftColor: token.age === 0 ? '#444' : '#0d9488',
                                                    width: `${Math.max(40, 100 - (token.age / trainingData.merges.length) * 40)}%`
                                                }}
                                            >
                                                <span className="opacity-40 mr-2">layer:{token.age}</span>
                                                <span className="font-bold">{token.t === '</w>' ? '␣' : token.t}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded">
                                            <span className="text-[10px] text-white/10 uppercase vertical-text">No Tokens Analyzed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="mt-8 mb-4 flex justify-center items-center gap-2 border-t border-white/5 pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mono">
                    built from scratch by <a href="https://github.com/sam-sree" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-amber-500 transition-colors underline-offset-4 hover:underline">samyukta sreekanth</a> - 2026
                </p>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<STRATA_APP />);
