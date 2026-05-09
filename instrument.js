// ==========================================
// 🎹 instrument.js : 광장 연주 (MML Studio) 엔진
// ==========================================

window.InstSys = {
    logs: null, playBtn: null, stopBtn: null, initBtn: null, pauseBtn: null,
    currTime: null, totTime: null, canvas: null, ctx: null,
    sharedScores: [],
    currentScoreTitle: "이름 없는 악보",
    
    initDOM() {
        this.logs = document.getElementById('consoleBody');
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.initBtn = document.getElementById('initBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.currTime = document.getElementById('currentTime');
        this.totTime = document.getElementById('totalTime');
        this.canvas = document.getElementById('visualizer');
        
        document.getElementById('sharedScoreSelect')?.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const delBtn = document.getElementById('deleteSharedScoreBtn');
            if(selectedId) {
                const score = this.sharedScores.find(s => s.id === selectedId);
                if(score && score.author === window.activeUser) {
                    delBtn.style.display = 'block';
                } else {
                    delBtn.style.display = 'none';
                }
            } else {
                delBtn.style.display = 'none';
            }
        });
    },
    
    log(msg, type = 'sys') {
        if(!this.logs) return;
        const line = document.createElement('div'); 
        line.style.color = type === 'sys' ? '#8b5cf6' : (type === 'ok' ? '#10b981' : (type === 'err' ? '#ef4444' : '#eab308'));
        const timeSpan = document.createElement('span');
        timeSpan.style.color = '#475569'; timeSpan.style.marginRight = '8px';
        timeSpan.textContent = `[${new Date().toISOString().substring(11, 23)}] `;
        line.appendChild(timeSpan);
        line.appendChild(document.createTextNode(msg));
        this.logs.appendChild(line); 
        this.logs.scrollTop = this.logs.scrollHeight;
    },
    format(sec) {
        if (!sec || isNaN(sec)) return "00:00.000";
        return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${Math.floor(sec % 60).toString().padStart(2, '0')}.${Math.floor((sec % 1) * 1000).toString().padStart(3, '0')}`;
    },
    
    async refreshSharedScores() {
        if(!window.FirebaseEngine) return;
        this.log("클라우드 악보 목록을 불러오는 중...", "sys");
        const res = await window.FirebaseEngine.getSharedScores();
        if(res.success) {
            this.sharedScores = res.data;
            const select = document.getElementById('sharedScoreSelect');
            if(select) {
                select.innerHTML = '<option value="">불러올 악보를 선택하세요...</option>';
                this.sharedScores.forEach(score => {
                    select.innerHTML += `<option value="${score.id}">${window.Utils.escapeHTML(score.title)} (by ${window.Utils.escapeHTML(score.author)})</option>`;
                });
            }
            this.log("악보 목록 갱신 완료.", "ok");
            
            const delBtn = document.getElementById('deleteSharedScoreBtn');
            if(delBtn) delBtn.style.display = 'none';
        } else {
            this.log("악보 목록을 불러오지 못했습니다.", "err");
        }
    },

    loadSharedScore() {
        const select = document.getElementById('sharedScoreSelect');
        const selectedId = select?.value;
        if(!selectedId) return this.log("불러올 악보를 선택해주세요.", "warn");
        
        const score = this.sharedScores.find(s => s.id === selectedId);
        if(score) {
            document.getElementById('mmlInput').value = score.xmlData;
            this.currentScoreTitle = score.title;
            const titleInput = document.getElementById('scoreTitleInput');
            if(titleInput) titleInput.value = score.title;
            this.log(`'${score.title}' 악보를 성공적으로 불러왔습니다.`, "ok");
        }
    },

    async uploadSharedScore() {
        if(!window.FirebaseEngine) return this.log("Firebase 연동이 필요합니다.", "err");
        const xmlData = document.getElementById('mmlInput').value.trim();
        if(!xmlData) return this.log("공유할 악보 데이터가 없습니다.", "warn");
        
        let titleInput = document.getElementById('scoreTitleInput');
        let title = titleInput ? titleInput.value.trim() : "";
        if(!title) title = this.currentScoreTitle;
        if(!title || title === "이름 없는 악보") title = "공유된 악보";

        this.log("악보 업로드 중...", "sys");
        const res = await window.FirebaseEngine.uploadSharedScore({
            title: title.trim(),
            author: window.activeUser || "익명",
            xmlData: xmlData,
            date: new Date().toISOString()
        });

        if(res.success) {
            this.log("악보가 성공적으로 클라우드에 공유되었습니다!", "ok");
            if(window.showToast) window.showToast("✅ 악보가 공유되었습니다.");
            this.refreshSharedScores();
        } else {
            this.log("악보 업로드에 실패했습니다.", "err");
        }
    },

    async deleteSharedScore() {
        const select = document.getElementById('sharedScoreSelect');
        const selectedId = select?.value;
        if(!selectedId) return;

        if(!confirm("정말 이 악보를 삭제하시겠습니까?")) return;

        this.log("악보 삭제 중...", "sys");
        const res = await window.FirebaseEngine.deleteSharedScore(selectedId);
        if(res.success) {
            this.log("악보가 삭제되었습니다.", "ok");
            if(window.showToast) window.showToast("🗑️ 악보가 삭제되었습니다.");
            this.refreshSharedScores();
        } else {
            this.log("악보 삭제에 실패했습니다.", "err");
        }
    },
    
    // 원격(광장) 자동 재생용 메서드
    async playMusicData(xmlData, mode, tempo, keyShift, startTimeTs) {
        try {
            // 방어 코드: 이미 엔진이 재생 중이라면 겹치거나 깨지는 것을 막기 위해 이전 연주 정지
            if (window.InstrumentEngine && window.InstrumentEngine.isPlaying) window.InstrumentEngine.stop();
            
            const tracksStr = MMLParser.extractTracks(xmlData);
            if (tracksStr.length === 0) return;
            parsedTracksData = tracksStr.map(t => MMLParser.parse(t));
            
            document.getElementById('mmlInput').value = xmlData;
            document.getElementById('ensembleSize').value = mode;
            document.getElementById('tempoSlider').value = tempo;
            document.getElementById('tempoValue').textContent = parseFloat(tempo).toFixed(2) + 'x';
            if(document.getElementById('keyShift')) document.getElementById('keyShift').value = keyShift;

            await window.InstrumentEngine.init();
            
            if (mode === 'guitar_duo') await Promise.all([window.InstrumentEngine.sampler.loadInstrument('acoustic_guitar_steel'), window.InstrumentEngine.sampler.loadInstrument('electric_bass_finger')]);
            else if (mode === 'flute_harp') await Promise.all([window.InstrumentEngine.sampler.loadInstrument('flute'), window.InstrumentEngine.sampler.loadInstrument('orchestral_harp')]);
            else if (mode === 'oboe_celesta') await Promise.all([window.InstrumentEngine.sampler.loadInstrument('oboe'), window.InstrumentEngine.sampler.loadInstrument('celesta')]);
            else if (mode === 'piano_strings') await Promise.all([window.InstrumentEngine.sampler.loadInstrument('acoustic_grand_piano'), window.InstrumentEngine.sampler.loadInstrument('string_ensemble_1')]);
            else await window.InstrumentEngine.sampler.loadInstrument('acoustic_grand_piano');

            window.InstrumentEngine.masterKeyShift = parseInt(keyShift) || 0;
            window.InstrumentEngine.tempoMultiplier = parseFloat(tempo) || 1.0;
            
            await window.InstrumentEngine.start(parsedTracksData, mode);
            
            if (startTimeTs) {
                let elapsed = (Date.now() - startTimeTs) / 1000;
                if (elapsed > 0) window.InstrumentEngine.seek(elapsed);
            }
            
            if (window.PlazaMusic && window.PlazaMusic.isPlayingRemote) {
                this.playBtn.style.display = 'none'; 
                this.stopBtn.style.display = 'none'; 
                this.pauseBtn.style.display = 'none'; 
                this.initBtn.style.display = 'none';
            } else {
                this.playBtn.style.display = 'none'; this.stopBtn.style.display = 'block'; this.pauseBtn.style.display = 'block'; this.initBtn.style.display = 'none';
            }
        } catch(e) {
            this.log(e.message, 'err');
        }
    }
};

// 모달이 처음 열릴 때 Canvas 너비 지정
window.initInstrumentCanvas = function() {
    if(!window.InstSys.canvas) window.InstSys.initDOM();
    if (window.InstSys.canvas && window.InstSys.canvas.offsetWidth > 0) {
        window.InstSys.canvas.width = window.InstSys.canvas.offsetWidth;
        window.InstSys.canvas.height = window.InstSys.canvas.offsetHeight;
        window.InstSys.ctx = window.InstSys.canvas.getContext('2d');
    }
    window.addEventListener('resize', () => {
        if (window.InstSys.canvas && window.InstSys.canvas.offsetWidth > 0) {
            window.InstSys.canvas.width = window.InstSys.canvas.offsetWidth;
            window.InstSys.canvas.height = window.InstSys.canvas.offsetHeight;
        }
    });
    if (window.InstSys.sharedScores.length === 0) {
        window.InstSys.refreshSharedScores();
    }
};

class MMLParser {
    static extractTracks(rawXml) {
        const tracks = [];
        const cdataRegex = /<!\[CDATA\[(.*?)\]\]>/gs;
        let match;
        while ((match = cdataRegex.exec(rawXml)) !== null) {
            const cleanMML = match[1].replace(/\s+/g, '');
            if (cleanMML.length > 0) tracks.push(cleanMML);
        }
        if (tracks.length === 0) {
            const doc = new DOMParser().parseFromString(rawXml, "text/xml");
            const mel = doc.querySelector('melody');
            if (mel && mel.textContent) tracks.push(mel.textContent.replace(/\s+/g, ''));
            doc.querySelectorAll('chord').forEach(c => {
                if(c.textContent) tracks.push(c.textContent.replace(/\s+/g, ''));
            });
            
            if (tracks.length === 0) {
                const blocks = rawXml.split(/(?:멜로디|화음\d*|Track\d*|\n\s*\n)/i);
                blocks.forEach(block => {
                    const cleanData = block.replace(/\s+/g, '');
                    if (cleanData.length > 0 && cleanData.match(/[a-gr][+#-]?|t\d/i)) tracks.push(cleanData);
                });
                if (tracks.length === 0 && rawXml.match(/[a-gr][+#-]?\d*\.*|t\d+|v\d+|l\d*\.*|o\d+|[<>&]/gi)) {
                    tracks.push(rawXml.replace(/\s+/g, ''));
                }
            }
        }
        return tracks;
    }

    static getMidi(note, acc, octave) {
        const map = {c:0, d:2, e:4, f:5, g:7, a:9, b:11};
        let semi = map[note.toLowerCase()];
        if (acc === '+' || acc === '#') semi++; if (acc === '-') semi--;
        return (octave + 1) * 12 + semi;
    }

    static parse(mmlString) {
        const tokens = mmlString.match(/[a-gr][+#-]?\d*\.*|t\d+|v\d+|l\d*\.*|o\d+|[<>&]/gi) || [];
        const events = [];
        let st = { oct: 4, tmp: 120, vol: 0.6, len: 4, dots: "", time: 0, pending: null };

        for (let t of tokens) {
            t = t.toLowerCase();
            if (t.startsWith('t')) st.tmp = parseInt(t.substring(1));
            else if (t.startsWith('v')) st.vol = Math.min(parseInt(t.substring(1)) / 15.0, 2.0); 
            else if (t.startsWith('l')) { let m = t.match(/l(\d*)(\.*)/); if (m[1]) st.len = parseInt(m[1]); st.dots = m[2] || ""; }
            else if (t.startsWith('o')) st.oct = parseInt(t.substring(1));
            else if (t === '>') st.oct++; else if (t === '<') st.oct--;
            else if (t === '&') { if (st.pending) st.pending.tied = true; }
            else {
                let m = t.match(/([a-gr])([+#-]?)(_?\d*)(\.*)/);
                if (m) {
                    let targetLen = m[3] ? parseInt(m[3].replace('_', '')) : st.len;
                    let targetDots = (m[3] || m[4]) ? (m[4] || "") : st.dots;
                    let beats = 4 / targetLen, add = beats / 2;
                    for(let i=0; i<targetDots.length; i++) { beats += add; add /= 2; }
                    let duration = beats * (60 / st.tmp);

                    if (m[1] === 'r') { st.time += duration; st.pending = null; } 
                    else {
                        let midi = this.getMidi(m[1], m[2], st.oct);
                        if (st.pending && st.pending.tied && st.pending.midi === midi) {
                            st.pending.duration += duration; st.time += duration; st.pending.tied = false;
                        } else {
                            st.pending = { midi, time: st.time, duration, vol: st.vol, tied: false };
                            events.push(st.pending); st.time += duration;
                        }
                    }
                }
            }
        }
        return { events, maxTime: st.time };
    }
}

class CustomSampler {
    constructor(audioCtx) { this.ctx = audioCtx; this.buffers = {}; }

    async decodeBase64(base64Str) {
        const base64Data = base64Str.split(',')[1] || base64Str;
        const binaryStr = window.atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryStr.charCodeAt(i);
        return await new Promise((resolve, reject) => this.ctx.decodeAudioData(bytes.buffer, resolve, reject));
    }

    async loadInstrument(instrumentName) {
        if (this.buffers[instrumentName]) return;
        InstSys.log(`[다운로드] ${instrumentName} 로드 중...`, 'sys');
        const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instrumentName}-ogg.js`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const text = await response.text();
            const audioDataMap = {};
            const regex = /"([A-Ga-g][b#]?\d)"\s*:\s*"([^"]+)"/g;
            let match;
            while ((match = regex.exec(text)) !== null) { audioDataMap[match[1]] = match[2]; }

            this.buffers[instrumentName] = {};
            const decodePromises = Object.keys(audioDataMap).map(async (noteName) => {
                try {
                    const buffer = await this.decodeBase64(audioDataMap[noteName]);
                    const m = noteName.toLowerCase().match(/^([a-g][b#]?)(\d+)$/);
                    const notes = { 'c':0, 'c#':1, 'db':1, 'd':2, 'd#':3, 'eb':3, 'e':4, 'f':5, 'f#':6, 'gb':6, 'g':7, 'g#':8, 'ab':8, 'a':9, 'a#':10, 'bb':10, 'b':11 };
                    if (m) this.buffers[instrumentName][(parseInt(m[2]) + 1) * 12 + notes[m[1]]] = buffer;
                } catch(e) {} 
            });
            await Promise.all(decodePromises);
            InstSys.log(`[완료] ${instrumentName} 준비 완료!`, 'ok');
        } catch (error) { InstSys.log(`[실패] 오류: ${error.message}`, 'err'); throw error; }
    }

    getBufferAndPitch(instrumentName, midiNumber) {
        const instData = this.buffers[instrumentName];
        if (!instData) return null;
        if (instData[midiNumber]) return { buffer: instData[midiNumber], rate: 1.0 };
        let nearestMidi = -1, minDiff = 999;
        for (let key in instData) {
            let diff = Math.abs(parseInt(key) - midiNumber);
            if (diff < minDiff) { minDiff = diff; nearestMidi = parseInt(key); }
        }
        if (nearestMidi === -1) return null;
        return { buffer: instData[nearestMidi], rate: Math.pow(2, (midiNumber - nearestMidi) / 12) };
    }
}

window.InstrumentEngine = {
    ctx: null, sampler: null, masterGain: null, analyzer: null, convolver: null, reverbGain: null,
    isPlaying: false, isPaused: false, duration: 0, activeNodes: new Set(), currentTracksData: [], currentMode: 'piano',
    masterKeyShift: 0, tempoMultiplier: 1.0, virtualTime: 0, lastProcessTime: 0, masterQueue: [], scheduleAheadTime: 0.2,
    timerID: null, animID: null, visualData: null, sustainEnabled: true, mediaRecorder: null, recordedChunks: [],

    createReverb() {
        const sr = this.ctx.sampleRate;
        const impulse = this.ctx.createBuffer(2, sr * 3.5, sr);
        let lastL = 0, lastR = 0;
        for (let i = 0; i < sr * 3.5; i++) {
            const d = Math.exp(-i / (sr * 0.8));
            lastL = lastL + 0.12 * ((Math.random() * 2 - 1) - lastL);
            lastR = lastR + 0.12 * ((Math.random() * 2 - 1) - lastR);
            impulse.getChannelData(0)[i] = lastL * d; impulse.getChannelData(1)[i] = lastR * d;
        }
        const conv = this.ctx.createConvolver(); conv.buffer = impulse;
        return conv;
    },

    async init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') await this.ctx.resume();
        } catch(e) {
            window.InstSys.log("오디오 엔진을 초기화할 수 없습니다. 화면을 터치한 후 다시 시도해주세요.", "err"); return;
        }

        this.masterGain = this.ctx.createGain(); 
        const volEl = document.getElementById('volumeSlider');
        this.masterGain.gain.value = volEl ? parseFloat(volEl.value) : 0.7;
        
        this.convolver = this.createReverb();
        this.reverbGain = this.ctx.createGain(); this.reverbGain.gain.value = 0.4;
        
        this.convolver.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);

        this.analyzer = this.ctx.createAnalyser(); this.analyzer.fftSize = 512;
        this.visualData = new Uint8Array(this.analyzer.frequencyBinCount);

        this.masterGain.connect(this.analyzer);
        this.analyzer.connect(this.ctx.destination);
        this.sampler = new CustomSampler(this.ctx);
    },

    stop() {
        this.isPlaying = false; this.isPaused = false;
        if (window.InstSys.pauseBtn) { window.InstSys.pauseBtn.innerHTML = "일시정지"; }
        clearTimeout(this.timerID); cancelAnimationFrame(this.animID);
        this.masterQueue = [];
        if(window.InstSys.currTime) window.InstSys.currTime.textContent = '00:00.000';
        if(document.getElementById('seekSlider')) document.getElementById('seekSlider').value = 0;
        if(window.InstSys.ctx && window.InstSys.canvas) window.InstSys.ctx.clearRect(0, 0, window.InstSys.canvas.width, window.InstSys.canvas.height);
        
        this.activeNodes.forEach(node => { 
            try { node.source.onended = null; node.source.stop(); node.source.disconnect(); } catch(e){} 
            try { node.gain.disconnect(); } catch(e){} 
        });
        this.activeNodes.clear();

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    },

    startRecording() {
        try {
            const dest = this.ctx.createMediaStreamDestination();
            this.masterGain.connect(dest);
            this.mediaRecorder = new MediaRecorder(dest.stream);
            this.recordedChunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordedChunks.push(e.data);
            };
            this.mediaRecorder.onstop = () => {
                if (this.recordedChunks.length === 0) return;
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = (window.InstSys.currentScoreTitle || 'MML_연주') + '.webm';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
                window.InstSys.log("⏺️ 녹음이 저장되었습니다.", 'ok');
                if(window.showToast) window.showToast("✅ 녹음 파일이 다운로드 되었습니다!");
            };
            this.mediaRecorder.start();
            window.InstSys.log("⏺️ 연주를 녹음 중입니다... (연주가 끝나면 자동으로 다운로드됩니다)", 'sys');
        } catch(e) {
            window.InstSys.log("녹음 기능을 지원하지 않는 환경입니다.", 'err');
        }
    },

    seek(targetTime) {
        if (!this.isPlaying) { this.virtualTime = targetTime; return; }
        this.activeNodes.forEach(node => { try { node.source.stop(); node.source.disconnect(); node.gain.disconnect(); } catch(e){} });
        this.activeNodes.clear();
        
        this.virtualTime = targetTime;
        this.lastProcessTime = this.ctx.currentTime;
        this.buildQueue(this.currentMode);
        this.masterQueue = this.masterQueue.filter(note => note.playTime >= targetTime);
        if(window.InstSys.currTime) window.InstSys.currTime.textContent = window.InstSys.format(this.virtualTime);
    },

    buildQueue(mode) {
        this.masterQueue = [];
        this.currentTracksData.forEach((track, idx) => {
            let instName = 'acoustic_grand_piano';
            if (mode === 'guitar_duo') instName = (idx === 0) ? 'acoustic_guitar_steel' : 'electric_bass_finger';
            else if (mode === 'flute_harp') instName = (idx === 0) ? 'flute' : 'orchestral_harp';
            else if (mode === 'oboe_celesta') instName = (idx === 0) ? 'oboe' : 'celesta';
            else if (mode === 'piano_strings') instName = (idx === 0) ? 'acoustic_grand_piano' : 'string_ensemble_1';
            
            track.events.forEach((note) => {
                const isStrongBeat = (note.duration >= 0.5) || (Math.random() > 0.8);
                const phraseVol = note.vol * (isStrongBeat ? 1.1 : 0.9);
                const timingOffset = (Math.random() - 0.5) * 0.015;
                let pTime = Math.max(0, note.time + timingOffset);
                
                let sNote = (off, v) => this.masterQueue.push({ inst: instName, midi: Math.max(0, Math.min(127, note.midi + off)), playTime: pTime, duration: note.duration, vol: phraseVol * v, isChord: (idx > 0) });
                if (this.currentTracksData.length === 1) {
                    sNote(0, 1.2); sNote(-12, 0.9); sNote(7, 0.6); sNote(12, 0.5); 
                } else { sNote(0, 1.2); }
            });
        });
        this.masterQueue.sort((a, b) => a.playTime - b.playTime);
    },

    async start(tracksData, mode) {
        if(this.ctx) this.stop();
        await this.init(); 
        this.isPlaying = true; this.currentTracksData = tracksData; this.currentMode = mode;
        this.duration = Math.max(0, ...this.currentTracksData.map(t => t.maxTime));
        document.getElementById('seekSlider').max = this.duration;
        if(window.InstSys.totTime) window.InstSys.totTime.textContent = window.InstSys.format(this.duration);
        
        this.tempoMultiplier = parseFloat(document.getElementById('tempoSlider').value);
        this.virtualTime = parseFloat(document.getElementById('seekSlider').value) || 0;
        this.lastProcessTime = 0;
        this.buildQueue(mode);
        this.masterQueue = this.masterQueue.filter(note => note.playTime >= this.virtualTime);
        this.schedulerLoop();
        this.renderVisuals();
    },

    schedulerLoop() {
        if (!this.isPlaying || this.isPaused) return;
        const now = this.ctx.currentTime;
        if (this.lastProcessTime === 0) this.lastProcessTime = now;
        
        const deltaReal = now - this.lastProcessTime;
        const safeDelta = Math.min(deltaReal, 0.1); // 버벅임 한도 방어
        this.virtualTime += safeDelta * this.tempoMultiplier;
        this.lastProcessTime = now;

        while (this.masterQueue.length > 0 && this.masterQueue[0].playTime <= this.virtualTime + this.scheduleAheadTime * this.tempoMultiplier) {
            const note = this.masterQueue.shift();
            const realOffset = (note.playTime - this.virtualTime) / this.tempoMultiplier;
            const sTime = now + realOffset;
            
            if (sTime >= now - 0.1) this.playNote(note.inst, note.midi, Math.max(now, sTime), note.duration / this.tempoMultiplier, note.vol, note.isChord);
        }
        this.timerID = setTimeout(() => this.schedulerLoop(), 25);
    },

    playNote(inst, midi, time, dur, vol, isChord = false) {
        if (vol < 0.01) return;
        const shiftedMidi = Math.max(0, Math.min(127, midi + this.masterKeyShift));
        const sample = this.sampler.getBufferAndPitch(inst, shiftedMidi);
        if (!sample) return;
        
        const source = this.ctx.createBufferSource(); source.buffer = sample.buffer;
        // 음원 피치 자연스럽게 약간 뒤틀어 겹침 노이즈 방지
        const finalDetune = (Math.random() - 0.5) * 3;
        source.playbackRate.value = Math.max(0.1, Math.min(sample.rate * Math.pow(2, finalDetune / 1200), 10.0));
        const gain = this.ctx.createGain();
        
        const isPerc = /piano|harp|celesta|guitar|bass/i.test(inst);
        let attack = 0.015;
        let release = this.sustainEnabled ? (isChord ? 3.0 : 1.5) : 0.1;
        if (!isPerc) { attack = 0.1; release = 0.5; }
        
        const safeVol = Math.max(0.01, vol);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(safeVol, time + attack);
        gain.gain.setValueAtTime(safeVol, time + dur);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur + release); 
        
        source.connect(gain); gain.connect(this.convolver); gain.connect(this.masterGain);
        this.activeNodes.add({ source, gain });
        source.start(time); source.stop(time + dur + release + 0.1);
        source.onended = () => { try{ source.disconnect(); gain.disconnect(); }catch(e){} this.activeNodes.delete({source, gain}); };
    },

    renderVisuals() {
        if (!this.isPlaying || this.isPaused) return;
        if (window.InstSys.currTime) window.InstSys.currTime.textContent = window.InstSys.format(Math.min(this.virtualTime, this.duration));
        if (document.activeElement !== document.getElementById('seekSlider')) document.getElementById('seekSlider').value = this.virtualTime;

        if (window.InstSys.ctx && window.InstSys.canvas) {
            this.analyzer.getByteFrequencyData(this.visualData);
            const cw = window.InstSys.canvas.width, ch = window.InstSys.canvas.height;
            window.InstSys.ctx.shadowBlur = 0;
            window.InstSys.ctx.fillStyle = '#000'; window.InstSys.ctx.fillRect(0, 0, cw, ch);
            
            window.InstSys.ctx.shadowBlur = 12; // ✨ 스튜디오 감성 글로우 이펙트 보강
            let barW = (cw / this.analyzer.frequencyBinCount) * 2.5; let x = 0;
            for(let i=0; i<this.analyzer.frequencyBinCount; i++) {
                const val = this.visualData[i];
                window.InstSys.ctx.shadowColor = `rgb(${val}, 100, 255)`;
                window.InstSys.ctx.fillStyle = `rgb(${val}, ${Math.max(80, val)}, 255)`;
                window.InstSys.ctx.fillRect(x, ch - (val/255)*ch, barW, (val/255)*ch);
                x += barW + 1;
            }
            window.InstSys.ctx.shadowBlur = 0; // 초기화
        }
        if (this.virtualTime > this.duration + 2.0) { 
            const isLoop = document.getElementById('loopPlay') && document.getElementById('loopPlay').checked;
            if (isLoop && (!window.PlazaMusic || !window.PlazaMusic.isPlayingRemote)) {
                window.InstSys.log("🔁 반복 재생을 위해 처음으로 돌아갑니다.", 'sys');
                this.seek(0);
                return;
            }

            window.InstSys.log("■ 연주 종료.", 'sys'); 
            this.stop(); 
            if (window.PlazaMusic && !window.PlazaMusic.isPlayingRemote) { window.PlazaMusic.stop(); }
            if (window.activeUser && typeof firebase !== 'undefined' && (!window.PlazaMusic || !window.PlazaMusic.isPlayingRemote)) {
                try {
                    firebase.database().ref('players/' + window.activeUser).update({ isPlayingMusic: false });
                } catch(e) {}
            }
            return; 
        }
        this.animID = requestAnimationFrame(() => this.renderVisuals());
    }
};

let parsedTracksData = [];

window.addEventListener('DOMContentLoaded', () => {
    window.InstSys.initDOM();
    

    document.getElementById('resetSheetBtn').addEventListener('click', () => {
        document.getElementById('mmlInput').value = '';
        window.InstSys.currentScoreTitle = "이름 없는 악보";
        const titleInput = document.getElementById('scoreTitleInput');
        if(titleInput) titleInput.value = "";
        InstrumentEngine.stop(); parsedTracksData = [];
        document.getElementById('trackCountBadge').textContent = 'Tracks: 0';
        if (window.InstSys.initBtn) window.InstSys.initBtn.style.display = 'none';
        window.InstSys.playBtn.style.display = 'block'; window.InstSys.playBtn.disabled = false;
        window.InstSys.stopBtn.style.display = 'none'; window.InstSys.pauseBtn.style.display = 'none';
    });

    window.InstSys.playBtn.addEventListener('click', async () => {
        const rawXml = document.getElementById('mmlInput').value.trim();
        if (!rawXml) return window.InstSys.log("XML 코드를 붙여넣어 주세요.", 'err');
        
        try {
            window.InstSys.playBtn.disabled = true;
            window.InstSys.log("악보 데이터를 분석하고 악기를 준비 중입니다...", "sys");
            
            const tracksStr = MMLParser.extractTracks(rawXml);
            if (tracksStr.length === 0) throw new Error("MML 데이터를 찾을 수 없습니다.");
            document.getElementById('trackCountBadge').textContent = `Tracks: ${tracksStr.length}`;
            parsedTracksData = tracksStr.map(t => MMLParser.parse(t));
            
            await InstrumentEngine.init();
            
            const mode = document.getElementById('ensembleSize').value;
            if (mode === 'guitar_duo') await Promise.all([InstrumentEngine.sampler.loadInstrument('acoustic_guitar_steel'), InstrumentEngine.sampler.loadInstrument('electric_bass_finger')]);
            else if (mode === 'flute_harp') await Promise.all([InstrumentEngine.sampler.loadInstrument('flute'), InstrumentEngine.sampler.loadInstrument('orchestral_harp')]);
            else if (mode === 'oboe_celesta') await Promise.all([InstrumentEngine.sampler.loadInstrument('oboe'), InstrumentEngine.sampler.loadInstrument('celesta')]);
            else if (mode === 'piano_strings') await Promise.all([InstrumentEngine.sampler.loadInstrument('acoustic_grand_piano'), InstrumentEngine.sampler.loadInstrument('string_ensemble_1')]);
            else await InstrumentEngine.sampler.loadInstrument('acoustic_grand_piano');
            
            window.InstSys.log("모든 준비가 끝났습니다. 합주를 시작합니다!", 'ok');
            if (window.InstSys.initBtn) window.InstSys.initBtn.style.display = 'none';
            window.InstSys.playBtn.style.display = 'block'; window.InstSys.stopBtn.style.display = 'block'; window.InstSys.pauseBtn.style.display = 'block';
            
            // 광장에 원격 공유
            if (window.PlazaMusic && !window.PlazaMusic.isPlayingRemote) {
                let tempo = document.getElementById('tempoSlider').value;
                let keyShift = document.getElementById('keyShift') ? document.getElementById('keyShift').value : 0;
                window.PlazaMusic.start(rawXml, mode, tempo, keyShift, window.InstSys.currentScoreTitle);
            }

            InstrumentEngine.start(parsedTracksData, mode).then(() => { window.InstSys.playBtn.disabled = false; });
            
            // 🎵 광장의 다른 사람들에게 연주 상태를 채팅 풍선으로 알림
            if (window.activeUser && typeof firebase !== 'undefined') {
                try {
                    const db = firebase.database();
                    db.ref('players/' + window.activeUser).update({ chatMsg: "🎵 악기를 연주 중입니다~!", chatTime: Date.now(), isPlayingMusic: true });
                } catch(e) {}
            }
        } catch (e) {
            window.InstSys.log(e.message, 'err'); 
            window.InstSys.playBtn.disabled = false;
        }
    });

    document.getElementById('recordBtn').addEventListener('click', async () => {
        if (InstrumentEngine.isPlaying) return window.InstSys.log("이미 연주 중입니다. 정지 후 다시 시도하세요.", 'warn');
        const rawXml = document.getElementById('mmlInput').value.trim();
        if (!rawXml) return window.InstSys.log("XML 코드를 붙여넣어 주세요.", 'err');
        
        try {
            window.InstSys.playBtn.disabled = true;
            document.getElementById('recordBtn').disabled = true;
            window.InstSys.log("악보 데이터를 분석하고 녹음을 준비 중입니다...", "sys");
            
            const tracksStr = MMLParser.extractTracks(rawXml);
            if (tracksStr.length === 0) throw new Error("MML 데이터를 찾을 수 없습니다.");
            parsedTracksData = tracksStr.map(t => MMLParser.parse(t));
            
            await InstrumentEngine.init();
            
            const mode = document.getElementById('ensembleSize').value;
            if (mode === 'guitar_duo') await Promise.all([InstrumentEngine.sampler.loadInstrument('acoustic_guitar_steel'), InstrumentEngine.sampler.loadInstrument('electric_bass_finger')]);
            else if (mode === 'flute_harp') await Promise.all([InstrumentEngine.sampler.loadInstrument('flute'), InstrumentEngine.sampler.loadInstrument('orchestral_harp')]);
            else if (mode === 'oboe_celesta') await Promise.all([InstrumentEngine.sampler.loadInstrument('oboe'), InstrumentEngine.sampler.loadInstrument('celesta')]);
            else if (mode === 'piano_strings') await Promise.all([InstrumentEngine.sampler.loadInstrument('acoustic_grand_piano'), InstrumentEngine.sampler.loadInstrument('string_ensemble_1')]);
            else await InstrumentEngine.sampler.loadInstrument('acoustic_grand_piano');
            
            if (window.InstSys.initBtn) window.InstSys.initBtn.style.display = 'none';
            window.InstSys.playBtn.style.display = 'block'; window.InstSys.stopBtn.style.display = 'block'; window.InstSys.pauseBtn.style.display = 'block';
            
            InstrumentEngine.startRecording();
            InstrumentEngine.start(parsedTracksData, mode).then(() => { window.InstSys.playBtn.disabled = false; document.getElementById('recordBtn').disabled = false; });
        } catch (e) { window.InstSys.log(e.message, 'err'); window.InstSys.playBtn.disabled = false; document.getElementById('recordBtn').disabled = false; }
    });

    window.InstSys.stopBtn.addEventListener('click', () => { 
        InstrumentEngine.stop(); 
        if (window.PlazaMusic) window.PlazaMusic.stop(); // 공유 중지
        window.InstSys.log("■ 강제 종료되었습니다.", 'warn'); 
        if (window.activeUser && typeof firebase !== 'undefined') {
            try {
                firebase.database().ref('players/' + window.activeUser).update({ isPlayingMusic: false });
            } catch(e) {}
        }
    });
    
    window.InstSys.pauseBtn.addEventListener('click', () => {
        if (!InstrumentEngine.isPlaying) return;
        InstrumentEngine.isPaused = !InstrumentEngine.isPaused;
        if (InstrumentEngine.isPaused) { InstrumentEngine.ctx.suspend(); window.InstSys.pauseBtn.innerHTML = "▶ 계속 재생"; }
        else { InstrumentEngine.ctx.resume(); InstrumentEngine.lastProcessTime = InstrumentEngine.ctx.currentTime; window.InstSys.pauseBtn.innerHTML = "일시정지"; InstrumentEngine.schedulerLoop(); }
    });
    
    document.getElementById('seekSlider').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if(window.InstSys.currTime) window.InstSys.currTime.textContent = window.InstSys.format(val);
        InstrumentEngine.seek(val);
    });
    
    const ksEl = document.getElementById('keyShift');
    if(ksEl) ksEl.addEventListener('input', (e) => { InstrumentEngine.masterKeyShift = parseInt(e.target.value) || 0; });
    
    document.getElementById('tempoSlider').addEventListener('input', (e) => { const val = parseFloat(e.target.value); InstrumentEngine.tempoMultiplier = val; document.getElementById('tempoValue').textContent = val.toFixed(2) + 'x'; });
    
    const volEl = document.getElementById('volumeSlider');
    if(volEl) volEl.addEventListener('input', (e) => { 
        const val = parseFloat(e.target.value); 
        if(InstrumentEngine.masterGain) InstrumentEngine.masterGain.gain.value = val; 
        document.getElementById('volumeValue').textContent = Math.round(val * 100) + '%'; 
    });

    const spEl = document.getElementById('sustainPedal');
    if(spEl) spEl.addEventListener('change', (e) => { 
        InstrumentEngine.sustainEnabled = e.target.checked; 
        const label = document.getElementById('sustainLabel');
        if(label) label.textContent = e.target.checked ? 'ON' : 'OFF';
        window.InstSys.log(`🎹 서스테인 페달: ${e.target.checked ? 'ON' : 'OFF'}`, 'sys');
    });

    const lpEl = document.getElementById('loopPlay');
    if(lpEl) lpEl.addEventListener('change', (e) => { 
        const label = document.getElementById('loopLabel');
        if(label) label.textContent = e.target.checked ? 'ON' : 'OFF';
        window.InstSys.log(`🔁 반복 재생: ${e.target.checked ? 'ON' : 'OFF'}`, 'sys');
    });

    document.getElementById('decodeToMainBtn').addEventListener('click', () => {
        const decodeRules = { 'n58': 'c', 'n46': 'a+', 'n62': 'd', 'n27': 'd+', 'n41': 'f', 'n34': 'a+', 'n70': 'c', 'n65': 'f', 'b\\+': 'c' };
        let input = document.getElementById('decoderInput').value.trim().replace(/^MML@/i, '').replace(/;$/, '');
        if (!input) return window.InstSys.log("MML 코드를 붙여넣어 주세요.", 'err');
        for (const [key, value] of Object.entries(decodeRules)) { input = input.replace(new RegExp(key, 'gi'), value); }
        
        let tracks = input.split(',');
        let tempo = (tracks[0].match(/t\d+/i) || [''])[0];
        let vol = (tracks[0].match(/v\d+/i) || [''])[0];
        
        let xmlOutput = `<?xml version="1.0" encoding="utf-8"?>\n<ms2>\n`;
        tracks.forEach((t, i) => {
            if (t) {
                let trackStr = t.trim();
                if (i > 0) { if (vol && !trackStr.toLowerCase().includes('v')) trackStr = vol + trackStr; if (tempo && !trackStr.toLowerCase().includes('t')) trackStr = tempo + trackStr; }
                xmlOutput += i === 0 ? `  <melody>\n    <![CDATA[${trackStr}]]>\n  </melody>\n` : `  <chord index="${i}">\n    <![CDATA[${trackStr}]]>\n  </chord>\n`;
            }
        });
        xmlOutput += `</ms2>`;
        document.getElementById('mmlInput').value = xmlOutput;
        document.getElementById('decoderInput').value = '';
        window.InstSys.currentScoreTitle = "해독된 악보";
        const titleInput = document.getElementById('scoreTitleInput');
        if(titleInput) titleInput.value = "해독된 악보";
        window.InstSys.log(`🛠️ MML 해독 완료! 메인 악보로 전송되었습니다.`, 'ok');
    });
});