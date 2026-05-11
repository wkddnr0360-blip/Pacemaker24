// ==========================================
// 🎵 오디오 및 사운드 시스템 (audio.js)
// ==========================================

window.SFX = {
    ctx: null,
    init: function() {
        if(!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        if(this.ctx.state === 'suspended') this.ctx.resume(); 
    },
    play: function(type) {
        if(!window.isSoundOn) return;
        this.init();
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            if (type === 'tap') { 
                // iOS 키보드 톡 소리
                osc.type = 'sine'; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.02);
                gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.02); osc.start(t); osc.stop(t + 0.02);
            } else if (type === 'success') { 
                // iOS 성공 알림음 (애플페이 느낌 따-링)
                osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, t); 
                gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.1, t + 0.02); gain.gain.linearRampToValueAtTime(0, t + 0.1); osc.start(t); osc.stop(t + 0.1);
                const osc2 = this.ctx.createOscillator(); const gain2 = this.ctx.createGain();
                osc2.connect(gain2); gain2.connect(this.ctx.destination); osc2.type = 'sine'; osc2.frequency.setValueAtTime(880, t + 0.1);
                gain2.gain.setValueAtTime(0, t + 0.1); gain2.gain.linearRampToValueAtTime(0.1, t + 0.12); gain2.gain.linearRampToValueAtTime(0, t + 0.3); osc2.start(t + 0.1); osc2.stop(t + 0.3);
            } else if (type === 'pop') { 
                // 부드러운 팝업 전환음
                osc.type = 'sine'; osc.frequency.setValueAtTime(400, t); osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
                gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.1, t + 0.02); gain.gain.linearRampToValueAtTime(0, t + 0.05); osc.start(t); osc.stop(t + 0.05);
            } else if (type === 'eat') { 
                osc.type = 'square'; osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
                gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.start(t); osc.stop(t + 0.1);
                const osc2 = this.ctx.createOscillator(); const gain2 = this.ctx.createGain();
                osc2.type = 'square'; osc2.frequency.setValueAtTime(700, t + 0.15); osc2.frequency.exponentialRampToValueAtTime(400, t + 0.25);
                gain2.gain.setValueAtTime(0.05, t + 0.15); gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                osc2.connect(gain2); gain2.connect(this.ctx.destination); osc2.start(t + 0.15); osc2.stop(t + 0.25);
            } else if (type === 'pet') { 
                osc.type = 'sine'; osc.frequency.setValueAtTime(400, t); osc.frequency.linearRampToValueAtTime(800, t + 0.3);
                gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.05, t + 0.15); gain.gain.linearRampToValueAtTime(0, t + 0.3); osc.start(t); osc.stop(t + 0.3);
            }
        } catch(e) {}
    }
};

// ✨ 스킬 효과음(SFX)을 재생하는 함수 (Pokemon Showdown 오디오 활용)
window.playSkillSound = function(type, isUlt) {
    if(!window.isSoundOn) return;
    let url = 'https://play.pokemonshowdown.com/audio/moves/';
    let soundName = 'tackle'; 
    
    if (isUlt) {
        switch(type) {
            case 'fire': soundName = 'fireblast'; break;
            case 'water': soundName = 'hydropump'; break;
            case 'grass': soundName = 'solarbeam'; break;
            case 'electric': soundName = 'thunder'; break;
            case 'psychic': soundName = 'psychic'; break;
            case 'dark': soundName = 'darkpulse'; break;
            case 'dragon': soundName = 'outrage'; break;
            case 'fairy': soundName = 'moonblast'; break;
            default: soundName = 'hyperbeam'; break;
        }
    } else {
        switch(type) {
            case 'fire': soundName = 'ember'; break;
            case 'water': soundName = 'watergun'; break;
            case 'grass': soundName = 'razorleaf'; break;
            case 'electric': soundName = 'thundershock'; break;
            case 'psychic': soundName = 'confusion'; break;
            case 'dark': soundName = 'bite'; break;
            case 'dragon': soundName = 'dragonclaw'; break;
            case 'fairy': soundName = 'fairywind'; break;
            default: soundName = 'tackle'; break;
        }
    }
    
    let audio = new Audio(`${url}${soundName}.mp3`);
    audio.volume = 0.6;
    let playPromise = audio.play();
    if (playPromise !== undefined) playPromise.catch(e => {}); // Autoplay 막힘 무시
};

window.BGM = {
    audio: null,
    isPlaying: false,
    isMuted: false,
    currentTrack: null,
    tracks: {
        'match': 'https://play.pokemonshowdown.com/audio/hgss-johto-trainer.mp3',
        'town': 'https://play.pokemonshowdown.com/audio/dpp-route209.mp3',
        'battle': 'https://play.pokemonshowdown.com/audio/dpp-wildpokemon.mp3'
    },
    play: function(track) {
        if (!window.isSoundOn) return;
        
        let src = this.tracks[track];
        if (!src) return;

        if (this.currentTrack === track && this.isPlaying && this.audio && !this.audio.paused) return;
        if (this.audio) {
            this.audio.pause();
            this.audio.src = "";
            this.audio.load();
        }
        
        this.audio = new Audio(src);
        this.audio.loop = true;
        this.audio.volume = 0.35;
        this.audio.muted = this.isMuted;
        
        let playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                this.isPlaying = true;
                this.currentTrack = track;
            }).catch(e => {
                console.log('BGM 자동재생 대기 중...', e);
                this.isPlaying = false;
                this.currentTrack = track;
            });
        }
    },
    stop: function() {
        if (!this.isPlaying) return;
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this.isPlaying = false;
        this.currentTrack = null;
    },
    toggleMute: function(btnEl) {
        this.isMuted = !this.isMuted;
        if (this.audio) {
            this.audio.muted = this.isMuted;
            if (!this.isMuted && !this.isPlaying && this.currentTrack) {
                this.play(this.currentTrack);
            }
        } else if (!this.isMuted && this.currentTrack) {
            this.play(this.currentTrack);
        }
        if (btnEl) btnEl.innerText = this.isMuted ? '🔇' : '🎵';
        
        // ★ 광장 연주(MML) 데이터 수신 제어 (네트워크 자원 절약)
        if (window.PlazaMusic) {
            if (this.isMuted) {
                if(window.PlazaMusic.ignore) window.PlazaMusic.ignore();
            } else {
                if(window.PlazaMusic.listen) window.PlazaMusic.listen();
            }
        }
    }
};

// 4. 포켓몬 울음소리 및 터치 애니메이션 연결 (버그 7 메가진화 무반응 완벽 해결)
window.currentPokemonCry = null;

window.playPokemonCry = function(pokeId, imgEl, isMega, name, baseId) {
    if(window.SFX) window.SFX.play('tap');
    
    // 메가진화 엑스박스/무음 방지: 메가진화일 경우 baseId 우선 사용 (일반 폼은 고유 ID 유지)
    let audioId = (isMega && baseId) ? baseId : pokeId; 
    
    // 🔊 오디오 중첩(연타 귀테러) 완벽 방지
    if(window.currentPokemonCry) {
        window.currentPokemonCry.pause();
        window.currentPokemonCry.currentTime = 0;
    }
    
    let audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${audioId}.ogg`);
    audio.volume = 0.5;
    window.currentPokemonCry = audio;
    audio.play().catch(e => {
        // 최신 API에 메가진화 사운드가 누락된 경우 레거시로 재시도
        let fallbackAudio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${audioId}.ogg`);
        fallbackAudio.volume = 0.5;
        window.currentPokemonCry = fallbackAudio;
        fallbackAudio.play().catch(err => console.log("사운드 재생 실패"));
    });
    
    // 터치 시 애니메이션 효과 복구 (일반 폼 꿀렁임 & 메가진화 이펙트)
    if(imgEl) {
        if (isMega) {
            imgEl.classList.remove('mega-attack-anim');
            void imgEl.offsetWidth; 
            imgEl.classList.add('mega-attack-anim');
            setTimeout(() => { if(imgEl) imgEl.classList.remove('mega-attack-anim'); }, 600);
        } else {
            let baseTrans = imgEl.dataset.baseTrans || imgEl.style.transform || 'scale(1.15)'; 
            if(baseTrans.includes('translateY')) baseTrans = baseTrans.replace(/translateY\([^)]+\)/g, '').trim();
            if(!baseTrans.includes('scale')) baseTrans += ' scale(1.15)';
            imgEl.dataset.baseTrans = baseTrans;
            imgEl.style.transition = 'transform 0.1s';
            imgEl.style.transform = baseTrans + ' translateY(-15px)';
            setTimeout(() => { if(imgEl) imgEl.style.transform = baseTrans; }, 150);
        }
    }
};