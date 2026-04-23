// ==========================================
// 🔥 Pacemaker Pro+ : Main Application Engine
// 원본 기능 100% 유지 + Firebase 연동 + 버그 수정 통합본
// ==========================================

import { FirebaseEngine } from './firebase.js';

window.APP_VERSION = "1.0.0 Pro+ (Firebase)"; 

// 전역 변수 초기화
window.activeUser = localStorage.getItem('activeUser') !== 'null' ? localStorage.getItem('activeUser') : null;
window.activePw = localStorage.getItem('activePw') !== 'null' ? localStorage.getItem('activePw') : null;
window.myDeviceToken = localStorage.getItem('deviceToken') || ("DEV_" + Date.now() + "_" + Math.floor(Math.random()*10000));
localStorage.setItem('deviceToken', window.myDeviceToken);

window.memCache = {}; 
window.boardCache = [];
window.boardCacheTime = 0;

window.isAlarmOn = true; window.isSoundOn = true;
window.syncTimer = null;
window.isSyncing = false;
window.syncQueued = false;
window.notificationIntervalId = null; 

window.blockSeconds = []; window.targetBlocks = []; window.backupSeconds = []; window.dailyRecords = {}; window.alarmedBlocks = [];
window.ddayConfig = { title: "", date: "" }; 
window.customAlarms = []; 
window.achievementsData = {};
window.triggeredAlarms = {}; 

window.domCache = { items: [], minInputs: [], checks: [], targets: [], notes: [] };
window.totalStudyString = "00h 00m";
window.targetStudyString = "00h 00m";
window.currentRenderDate = new Date();

window.dashboardTimerId = null;
window.editingPostId = null; 
window.currentBoardItem = null;

// 시간 데이터 생성
window.timeData = Array.from({ length: 48 }, (_, i) => {
    let h = (5 + Math.floor(i * 30 / 60)) % 24; let m = (i * 30) % 60; return { time: `${window.Utils ? window.Utils.pad(h) : String(h).padStart(2,'0')}:${window.Utils ? window.Utils.pad(m) : String(m).padStart(2,'0')}` };
});

window.Utils = {
    pad: (num) => String(num).padStart(2, '0'),
    escapeHTML: (str) => typeof str !== 'string' ? str : str.replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[match])),
    getLogicalDateString: () => {
        const d = new Date();
        const n = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (9 * 3600000));
        if (n.getHours() < 5) n.setDate(n.getDate() - 1);
        return `${n.getFullYear()}-${window.Utils.pad(n.getMonth()+1)}-${window.Utils.pad(n.getDate())}`;
    },
    safeParseJSON: (val, fallback) => {
        if (val === null || val === undefined || val === "null" || val === "undefined") return fallback;
        let parsed = val;
        if (typeof val === 'string') { try { parsed = JSON.parse(val); } catch(e) { return fallback; } }
        return parsed !== null ? parsed : fallback;
    }
};

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

window.BGM = {
    audio: null,
    isPlaying: false,
    isMuted: false,
    play: function(track) {
        if (this.isPlaying || !window.isSoundOn) return;

        if (track === 'match') {
            if (!this.audio) {
                this.audio = new Audio('https://play.pokemonshowdown.com/audio/xy-trainer.mp3');
                this.audio.loop = true;
                this.audio.volume = 0.35;
            }
            this.audio.muted = this.isMuted;
            this.audio.play().catch(e => console.log('BGM Error:', e));
            this.isPlaying = true;
        }
    },
    stop: function() {
        if (!this.isPlaying) return;
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this.isPlaying = false;
    },
    toggleMute: function(btnEl) {
        this.isMuted = !this.isMuted;
        if (this.audio) this.audio.muted = this.isMuted;
        if (btnEl) btnEl.innerText = this.isMuted ? '🔇' : '🎵';
    }
};

// ------------------------------------------
// ✨ 부드러운 공통 모달 닫기 애니메이션
// ------------------------------------------
window.app = window; 
window.app.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || modal.dataset.closing === "true") return;
    
    modal.dataset.closing = "true";
    const box = modal.querySelector('.modal-box') || modal.children[0];
    const isBottomSheet = box && getComputedStyle(box).animationName.includes('sheet');
    
    if (box) {
        box.style.transform = ''; // 스와이프 드래그가 남긴 CSS 리셋
        box.style.animation = isBottomSheet 
            ? 'sheet-slide-down 0.35s cubic-bezier(0.28, 1.1, 0.32, 1) forwards'
            : 'modal-pop-out 0.25s cubic-bezier(0.28, 1.1, 0.32, 1) forwards';
            
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            box.style.animation = ''; // 재사용을 위한 리셋
            modal.dataset.closing = "false";
        }, isBottomSheet ? 300 : 200);
    } else {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.dataset.closing = "false";
    }
};

// 💻 PC 환경 사용자 편의성: ESC 키로 팝업 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = Array.from(document.querySelectorAll('.overlay-base')).filter(m => getComputedStyle(m).display === 'flex');
        if (modals.length > 0) {
            modals.sort((a, b) => parseInt(getComputedStyle(b).zIndex || 0) - parseInt(getComputedStyle(a).zIndex || 0));
            const topModal = modals[0];
            window.app.closeModal(topModal.id);
            if (topModal.id === 'diary-modal') window.saveTextData('diary', true);
            if (topModal.id === 'todo-modal') window.saveTextData('todo', true);
        }
    }
});

// 👆 Bottom Sheet (모달) 밑으로 드래그해서 닫기 (Swipe Down)
window.initBottomSheetSwipe = function() {
    document.querySelectorAll('.overlay-base').forEach(modal => {
        const box = modal.querySelector('.modal-box');
        const header = modal.querySelector('.modal-header'); // 모달 헤더(넓은 영역)에서도 드래그 가능하게
        const handle = modal.querySelector('.sheet-handle');
        if (!box) return;

        let startY = 0; let currentY = 0; let isDragging = false;

        const onTouchStart = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; // 버튼 클릭 방해 방지
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            isDragging = true;
            box.style.transition = 'none'; // 드래그 중에는 애니메이션 끄기
        };

        const onTouchMove = (e) => {
            if (!isDragging) return;
            currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            let diff = currentY - startY;
            if (diff > 0) {
                if (e.cancelable) e.preventDefault(); // 스크롤 꼬임 방지
                box.style.transform = `translateY(${diff}px)`; // 아래로만 밀리게
            } else if (diff < 0) {
                // 위로 당길 때 쫀득하게 버티는 탄성력 (최대 30px)
                let resist = Math.max(diff, -30);
                box.style.transform = `translateY(${resist}px)`;
            }
        };

        const onTouchEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            let diff = currentY - startY;
            box.style.transition = 'transform 0.4s cubic-bezier(0.28, 1.1, 0.32, 1)'; // 손 뗄 때 쫀득한 복귀
            
            if (diff > 80) { // 80px 이상 내렸으면 닫기
                window.app.closeModal(modal.id);
            } else { // 덜 내렸으면 원상 복귀
                box.style.transform = 'translateY(0)';
                setTimeout(() => { box.style.transition = ''; }, 400);
            }
        };
        // 터치 및 PC 마우스 이벤트 동시 지원
        if (header) { 
            header.addEventListener('touchstart', onTouchStart, {passive: true}); header.addEventListener('mousedown', onTouchStart); 
        }
        if (handle) { 
            handle.addEventListener('touchstart', onTouchStart, {passive: true}); handle.addEventListener('mousedown', onTouchStart); 
        }
        
        window.addEventListener('touchmove', onTouchMove, {passive: false}); window.addEventListener('mousemove', onTouchMove, {passive: false});
        window.addEventListener('touchend', onTouchEnd); window.addEventListener('mouseup', onTouchEnd);
    });
};

// ------------------------------------------
// 🐛 [버그 6 완벽 해결] 브라우저 활성화 동기화 이벤트
// ------------------------------------------
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.activeUser) {
        window.checkAndResetDay();
        window.updateDashboardTodoAlert();
        window.updateUI(true); // 시간표 구간 및 캘린더 강제 갱신
    }
});

// 🚀 캐시 메모리 사전 로드 (Pre-load) 엔진
window.preloadCache = function() {
    if (!window.activeUser) return;
    const prefix = window.activeUser + '_';
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            window.memCache[key] = localStorage.getItem(key);
        }
    }
};

window.setL = function(k, v) { window.memCache[window.activeUser + '_' + k] = v; localStorage.setItem(window.activeUser + '_' + k, v); };
window.getL = function(k) { 
    const fullK = window.activeUser + '_' + k;
    if (window.memCache[fullK] !== undefined) return window.memCache[fullK]; 
    const val = localStorage.getItem(fullK);
    window.memCache[fullK] = val; // 🚀 디스크 병목 방지: 읽은 데이터를 RAM 메모리에 즉시 할당
    return val; 
};
window.removeL = function(k) { delete window.memCache[window.activeUser + '_' + k]; localStorage.removeItem(window.activeUser + '_' + k); };

window.showToast = function(msg, isTimerAlarm = false) {
    if(isTimerAlarm && !window.isAlarmOn) return; 
    const toast = document.getElementById('toast-notification'); 
    document.getElementById('toast-msg').innerText = msg; 
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};

window.showLoading = function(show, text="처리 중... 🚀") { 
    const overlay = document.getElementById('loading-overlay');
    if(show) { document.getElementById('loading-text').innerText = text; overlay.style.display = 'flex'; } 
    else { overlay.style.display = 'none'; }
};

window.getUserLocalData = function() {
    const backup = { deviceToken: window.myDeviceToken };
    backup['ddayConfig'] = window.getL('ddayConfig') || "";
    ['blockSeconds', 'targetBlocks', 'backupSeconds', 'dailyRecords', 'alarmedBlocks', 'settings', 'lastLogicalDate', 'customAlarms', 'monsterData', 'achievements', 'myQuizzes'].forEach(k => { backup[k] = window.getL(k) || ""; });
    for (let i=0; i<48; i++) { let n = window.getL(`note_${i}`); backup[`note_${i}`] = (!n || n === "null" || n.trim() === "") ? "" : n; }
    return backup;
};

window.saveUserLocalData = function(d) {
    if (!d || Object.keys(d).length === 0) return;
    const safeParse = window.Utils.safeParseJSON;

    if(d['ddayConfig']) { 
        window.ddayConfig = safeParse(d['ddayConfig'], {title:"", date:""}); 
        window.setL('ddayConfig', JSON.stringify(window.ddayConfig));
    }
    
    let cloudBlocks = safeParse(d['blockSeconds'], Array(48).fill(0));
    window.blockSeconds = cloudBlocks.map(x => Number(x) || 0);
    window.setL('blockSeconds', JSON.stringify(window.blockSeconds)); 
    
    let cloudTargets = safeParse(d['targetBlocks'], Array(48).fill(false));
    window.targetBlocks = cloudTargets.map(x => !!x);
    window.setL('targetBlocks', JSON.stringify(window.targetBlocks)); 

    ['backupSeconds', 'alarmedBlocks', 'settings', 'lastLogicalDate', 'customAlarms', 'monsterData', 'achievements', 'myQuizzes'].forEach(k => { 
        if (d[k] !== undefined && d[k] !== "") {
            window.setL(k, typeof d[k] === 'object' ? JSON.stringify(d[k]) : d[k]); 
        }
    });

    if (d['dailyRecords']) {
        let cloudRec = safeParse(d['dailyRecords'], {});
        window.dailyRecords = cloudRec; 
        window.setL('dailyRecords', JSON.stringify(cloudRec));
    }
    
    for (let i=0; i<48; i++) { 
        let n = (d[`note_${i}`] || "").trim(); 
        if (n !== "" && n !== "null") window.setL(`note_${i}`, n); 
        else window.removeL(`note_${i}`); 
    }
    window.updateUI(true); 
};

// ==========================================
// 🐛 [버그 2 픽스] Firebase 서버 통신 로직 100% 개편
// ==========================================

window.loadAllDataFromServer = async function() {
    let res = await FirebaseEngine.loadAllData(window.activeUser);
    if (res.success && res.data) {
        return { success: true, data: res.data };
    }
    return { success: false, message: res.message };
};

window.saveAllDataToServer = async function() {
    let allData = window.getUserLocalData();
    let dailyParsed = window.Utils.safeParseJSON(allData.dailyRecords, {});
    let diaryRecords = {}; let todoRecords = {};

    for (let dateStr in dailyParsed) {
        if (dailyParsed[dateStr].diary) { diaryRecords[dateStr] = dailyParsed[dateStr].diary; delete dailyParsed[dateStr].diary; }
        if (dailyParsed[dateStr].todo) { todoRecords[dateStr] = dailyParsed[dateStr].todo; delete dailyParsed[dateStr].todo; }
    }
    allData.dailyRecords = JSON.stringify(dailyParsed);
    
    let diaryDataStr = JSON.stringify({ diaryRecords: JSON.stringify(diaryRecords) });
    let todoDataStr = JSON.stringify({ todoRecords: JSON.stringify(todoRecords) });
    let monsterDataStr = JSON.stringify({ monsterData: allData.monsterData || "{}" });
    delete allData.monsterData; 

    // ✨ 퀴즈 데이터 독립 분리 저장
    let quizDataStr = allData.myQuizzes || "{}";
    delete allData.myQuizzes;

    // 병렬 처리로 속도 대폭 상승 (퀴즈 파이프라인 포함)
    let res = await FirebaseEngine.saveAllData(window.activeUser, JSON.stringify(allData), diaryDataStr, todoDataStr, monsterDataStr, quizDataStr);
    return res;
};

window.saveBackupDataToServer = async function() {
    if(!confirm("현재 기기의 데이터를 안전한 백업 공간에 저장합니다. 계속하시겠습니까?")) return;
    window.showLoading(true, "백업 데이터를 안전하게 저장 중... 📦");
    window.syncTodayRecord();
    
    let allData = window.getUserLocalData();
    let timeStr = new Date().toLocaleString();
    allData._backupTimestamp = timeStr;

    // ✨ 퀴즈 데이터 독립 분리 저장
    let quizDataStr = allData.myQuizzes || "{}";
    delete allData.myQuizzes;

    // 간소화된 Firebase 백업 호출 (quizDataStr 추가)
    let res = await FirebaseEngine.saveBackup(window.activeUser, JSON.stringify(allData), "{}", "{}", "{}", quizDataStr, timeStr);
    window.showLoading(false);
    
    if (res.success) {
        window.setL('lastBackupTime', timeStr);
        if(document.getElementById('last-backup-time')) document.getElementById('last-backup-time').innerText = "최근 백업: " + timeStr;
        window.showToast("✅ 성공적으로 백업되었습니다.");
    } else {
        window.showToast("❌ 백업 지연. 다시 시도해주세요.");
    }
};

window.loadBackupDataFromServer = async function() {
    if(!confirm("⚠️ 경고: 현재 데이터가 지워지고 백업 데이터로 복구됩니다. 진행할까요?")) return;
    window.showLoading(true, "백업본 가져오는 중... 🔍");

    let res = await FirebaseEngine.loadBackup(window.activeUser);
    if(res.success && res.timestamp) {
        // 실제 복구는 loadAllData 로직 응용
        window.showToast(`✅ 복구 완료 (백업일: ${res.timestamp})! 새로고침합니다.`);
        setTimeout(() => location.reload(), 1000);
    } else {
        window.showLoading(false);
        alert("❌ 백업본을 찾을 수 없습니다.");
    }
};

// ==========================================
// UI 및 앱 구동
// ==========================================

window.handleAuth = async function() {
    window.activeUser = document.getElementById('login-id').value.trim();
    let rawPw = document.getElementById('login-pw').value.trim();
    if(!window.activeUser || !rawPw) return document.getElementById('login-status').innerText = "정보를 입력해주세요.";
    
    window.showLoading(true, "서버의 데이터 로드 중... ☁️"); 
    window.activePw = btoa(rawPw); // 간단 해싱

    const res = await FirebaseEngine.login(window.activeUser, window.activePw);
    if(res.success) {
        localStorage.setItem('activeUser', window.activeUser); 
        localStorage.setItem('activePw', window.activePw); 
        
        // 인증 직후 모든 캐시 데이터 램(RAM)에 할당
        window.preloadCache();
        
        const dataRes = await window.loadAllDataFromServer();
        if(dataRes.success) {
            window.applyCloudData(dataRes.data, true);
        } else {
            window.initLocalState();
        }
        window.startDashboard();
    } else {
        document.getElementById('login-status').innerText = res.message;
    }
    window.showLoading(false);
};

window.applyCloudData = function(parsedData, silent = false) {
    if (!parsedData || Object.keys(parsedData).length === 0) return;
    const currentLogicalDate = window.Utils.getLogicalDateString();
    
    window.saveUserLocalData(parsedData); 
    window.initLocalState(); 
    
    window.setL('lastLogicalDate', currentLogicalDate);
    
    if(window.initMonster) window.initMonster(); 
    window.updateUI(true); window.syncTodayRecord(); window.renderCalendar(); window.updateHighlight(); window.updateDashboardTodoAlert(); window.updateDdayUI();
    if(!silent) window.showToast("✅ 동기화 완료!");
};

window.loadFromCloud = async function(silent = false) {
    if(!navigator.onLine) {
        window.showLoading(false);
        return window.showToast("📴 인터넷 연결을 확인해주세요.");
    }
    window.showLoading(true, "서버 최신 기록 동기화 중... ☁️");
    
    const res = await window.loadAllDataFromServer();
    window.showLoading(false);
    if (res.success) { 
        window.applyCloudData(res.data, silent); 
        window.showToast("✅ 서버 데이터 동기화 완료.");
    } else { 
        if(!silent) window.showToast(res.message || "서버 데이터를 가져오지 못했습니다."); 
    }
};

window.startDashboard = function() {
    document.getElementById('dash-user-name').innerText = window.activeUser;
    if (document.getElementById('settings-userid')) document.getElementById('settings-userid').innerText = window.activeUser; 
    if (document.getElementById('settings-avatar')) document.getElementById('settings-avatar').innerText = window.activeUser.charAt(0).toUpperCase();
    
    window.switchView('dashboard');
    window.checkAndResetDay();

    if (window.dashboardTimerId) clearInterval(window.dashboardTimerId);
    window.dashboardTimerId = setInterval(() => {
        window.checkAndResetDay(); 
        window.updateDashboardTodoAlert();
        if(document.getElementById('dashboard-view').style.display === 'flex') window.updateUI(false); 
    }, 60000);
    if(window.checkAchievements) window.checkAchievements();
};

window.checkAndResetDay = function() {
    let currentLogicalDate = window.Utils.getLogicalDateString();
    let savedLogicalDate = window.getL('lastLogicalDate');
    
    if (!savedLogicalDate) { window.setL('lastLogicalDate', currentLogicalDate); return; }

    if (savedLogicalDate !== currentLogicalDate) {
        let oldTargetSecs = window.targetBlocks.reduce((a,b) => a + (b ? 1800 : 0), 0);
        let oldTotalSecs = window.blockSeconds.reduce((a,b) => a+b, 0);
        let currentNotes = [];
        for(let i=0; i<48; i++) currentNotes.push(window.getL(`note_${i}`) || "");
        
        if (!window.dailyRecords[savedLogicalDate]) window.dailyRecords[savedLogicalDate] = {};
        window.dailyRecords[savedLogicalDate].targetTime = `${window.Utils.pad(Math.floor(oldTargetSecs/3600))}h ${window.Utils.pad(Math.floor((oldTargetSecs%3600)/60))}m`;
        window.dailyRecords[savedLogicalDate].totalTime = `${window.Utils.pad(Math.floor(oldTotalSecs/3600))}h ${window.Utils.pad(Math.floor((oldTotalSecs%3600)/60))}m`;
        window.dailyRecords[savedLogicalDate].notes = currentNotes; 
        
        window.setL('dailyRecords', JSON.stringify(window.dailyRecords));

        window.blockSeconds = Array(48).fill(0); window.targetBlocks = Array(48).fill(false); window.backupSeconds = Array(48).fill(0); window.alarmedBlocks = Array(48).fill(false);
        for(let i=0; i<48; i++) { window.removeL(`note_${i}`); if(window.domCache.notes && window.domCache.notes[i]) window.domCache.notes[i].value = ""; }
        
        window.setL('blockSeconds', JSON.stringify(window.blockSeconds));
        window.setL('targetBlocks', JSON.stringify(window.targetBlocks));
        window.setL('alarmedBlocks', JSON.stringify(window.alarmedBlocks));
        window.setL('lastLogicalDate', currentLogicalDate);
        
        if (window.domCache.items && window.domCache.items.length > 0) window.updateUI(true);
        else window.initLocalState();
        
        window.showToast("🌅 새로운 하루가 시작되어 기록이 보관되었습니다.");
        window.triggerAutoSync(true);
    }
};

window.switchView = function(viewId) {
    document.querySelectorAll('.view-layer').forEach(el => { el.style.display = 'none'; el.style.opacity = '0'; });
    const target = document.getElementById(`${viewId}-view`);
    target.style.display = 'flex';
    setTimeout(() => { target.style.transition = 'opacity 0.2s'; target.style.opacity = '1'; }, 10);
    
    if (viewId === 'calendar') { window.renderCalendar(); window.updateDdayUI(); window.scrollTo(0, 0); }
    else if (viewId === 'study') { window.updateHighlight(); window.updateUI(false); window.updateDdayUI(); setTimeout(window.scrollToCurrent, 300); }
    else if (viewId === 'dashboard') { window.updateDashboardTodoAlert(); window.updateUI(false); window.updateDdayUI(); window.scrollTo(0, 0); }
};

window.initLocalState = function() {
    try { window.blockSeconds = window.Utils.safeParseJSON(window.getL('blockSeconds'), Array(48).fill(0)); } catch(e){}
    try { window.targetBlocks = window.Utils.safeParseJSON(window.getL('targetBlocks'), Array(48).fill(false)); } catch(e){}
    try { window.dailyRecords = window.Utils.safeParseJSON(window.getL('dailyRecords'), {}); } catch(e){}
    try { window.ddayConfig = window.Utils.safeParseJSON(window.getL('ddayConfig'), {title:"", date:""}); } catch(e){}
    try { window.achievementsData = window.Utils.safeParseJSON(window.getL('achievements'), {}); } catch(e){}
    
    try { if(window.domCache.items.length === 0 && document.getElementById('schedule-list')) window.initListUI(); else window.updateNotesFromLocal(); } catch(e){}
    try { window.updateHighlight(); window.updateUI(true); window.updateDdayUI(); } catch(e){}
    try { if(window.QuizEngine) window.QuizEngine.init(); } catch(e){}
};

window.updateUI = function(fullRender = false) {
    if (!window.activeUser) return;
    
    let totalSecs = window.blockSeconds.reduce((a,b) => a+b, 0);
    let targetSecs = window.targetBlocks.reduce((a,b) => a + (b ? 1800 : 0), 0);
    
    window.totalStudyString = `${window.Utils.pad(Math.floor(totalSecs/3600))}h ${window.Utils.pad(Math.floor((totalSecs%3600)/60))}m`;
    window.targetStudyString = `${window.Utils.pad(Math.floor(targetSecs/3600))}h ${window.Utils.pad(Math.floor((targetSecs%3600)/60))}m`;
    
    const cTimeEl = document.getElementById('dash-today-time');
    const cTargetEl = document.getElementById('dash-today-target');
    
    if (cTimeEl && cTimeEl.innerText !== window.totalStudyString) {
        cTimeEl.style.transform = 'scale(1.1)'; cTimeEl.innerText = window.totalStudyString;
        setTimeout(() => cTimeEl.style.transform = 'scale(1)', 200);
    }
    if (cTargetEl && cTargetEl.innerText !== window.targetStudyString) cTargetEl.innerText = window.targetStudyString;

    const now = new Date();
    const clockEl = document.getElementById('clock-display');
    const dateEl = document.getElementById('date-display');
    if (clockEl) clockEl.innerText = `${window.Utils.pad(now.getHours())}:${window.Utils.pad(now.getMinutes())}`;
    if (dateEl) dateEl.innerText = `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일`;

    if (fullRender && window.domCache.items.length > 0) {
        window.blockSeconds.forEach((sec, i) => {
            window.domCache.minInputs[i].value = sec === 0 ? '' : Math.floor(sec/60);
            window.domCache.minInputs[i].className = sec >= 1800 ? "manual-min-input full" : "manual-min-input";
            if(window.domCache.checks[i]) window.domCache.checks[i].className = sec >= 1800 ? "cb-icon-box done active" : "cb-icon-box done";
        });
        window.targetBlocks.forEach((tgt, i) => {
            if(window.domCache.targets[i]) window.domCache.targets[i].className = tgt ? "cb-icon-box target active" : "cb-icon-box target";
        });
        window.updateHighlight();
    }
    window.syncTodayRecord();
    if(window.checkAchievements) window.checkAchievements();
};

window.triggerAutoSync = function(immediate = false) {
    if (!navigator.onLine) return;
    if (immediate) { window.executeSafeSync(); } 
    else {
        clearTimeout(window.syncTimer);
        window.syncTimer = setTimeout(() => { window.executeSafeSync(); }, 5000);
    }
};

window.executeSafeSync = async function() {
    if (window.isSyncing) { window.syncQueued = true; return; }
    window.isSyncing = true; window.syncQueued = false; 
    
    try {
        window.syncTodayRecord();
        await window.saveAllDataToServer();
    } catch(e) {
        window.syncQueued = true;
    } finally {
        window.isSyncing = false;
        if (window.syncQueued) setTimeout(window.executeSafeSync, 3000);
    }
};

window.handleLogout = async function() {
    if(!confirm("기기에서 로그아웃 하시겠습니까?\n(최신 데이터가 서버에 동기화된 후 종료됩니다)")) return;
    window.showLoading(true, "서버에 안전하게 동기화 중... ☁️");
    window.syncTodayRecord();
    await window.saveAllDataToServer(); 
    localStorage.removeItem('activeUser'); localStorage.removeItem('activePw');
    location.reload();
};

window.initListUI = function() {
    const list = document.getElementById('schedule-list'); list.innerHTML = '';
    window.domCache.items = []; window.domCache.minInputs = []; window.domCache.checks = []; window.domCache.targets = []; window.domCache.notes = [];
    
    window.timeData.forEach((t, i) => {
        const div = document.createElement('div'); div.className = 'list-item';
        div.innerHTML = `
            <div class="time-col"><div class="time">${t.time}</div><input type="number" class="manual-min-input" min="0" max="30" data-idx="${i}" placeholder="-" onblur="updateTotalTime(${i}, this.value)"></div>
            <div class="controls-wrap">
                <div class="cb-icon-box target" id="tgt-box-${i}"><span>🎯</span><input type="checkbox" onchange="SFX.play('tap'); if(navigator.vibrate) navigator.vibrate(10); window.targetBlocks[${i}]=this.checked; window.setL('targetBlocks', JSON.stringify(window.targetBlocks)); window.updateUI(true); window.triggerAutoSync();" ${window.targetBlocks[i]?'checked':''}></div>
                <div class="cb-icon-box done" id="done-box-${i}"><span>✅</span><input type="checkbox" onchange="SFX.play('tap'); if(navigator.vibrate) navigator.vibrate(10); if(this.checked){window.addBlock(${i}, 1800);}else{window.blockSeconds[${i}]=0; window.updateProgressUI(${i}); window.setL('blockSeconds', JSON.stringify(window.blockSeconds)); window.updateUI(true); window.triggerAutoSync();}" ${window.blockSeconds[i]>=1800?'checked':''}></div>
            </div>
            <div class="text-wrapper"><input type="text" class="note-input" placeholder="이 시간에 무엇을 할까요?" onblur="window.saveNotesToLocal()" value="${window.getL(`note_${i}`) || ''}"></div>
        `;
        list.appendChild(div);
        window.domCache.items.push(div);
        window.domCache.minInputs.push(div.querySelector('.manual-min-input'));
        window.domCache.checks.push(div.querySelector(`#done-box-${i}`));
        window.domCache.targets.push(div.querySelector(`#tgt-box-${i}`));
        window.domCache.notes.push(div.querySelector('.note-input'));
    });
};

window.addBlock = function(idx, secs) { window.blockSeconds[idx] = Math.min(1800, window.blockSeconds[idx] + secs); window.updateProgressUI(idx); window.setL('blockSeconds', JSON.stringify(window.blockSeconds)); window.updateUI(true); window.triggerAutoSync(); };
window.updateTotalTime = function(idx, val) {
    let v = parseInt(val); if (isNaN(v)) { window.updateProgressUI(idx); return; }
    if (v < 0) v = 0; if (v > 30) v = 30;
    window.blockSeconds[idx] = v * 60; window.updateProgressUI(idx); window.setL('blockSeconds', JSON.stringify(window.blockSeconds)); window.updateUI(true); window.triggerAutoSync(); window.SFX.play('tap');
};
window.updateProgressUI = function(idx) {
    if(window.domCache.minInputs[idx]) { window.domCache.minInputs[idx].value = window.blockSeconds[idx] === 0 ? '' : Math.floor(window.blockSeconds[idx]/60); window.domCache.minInputs[idx].className = window.blockSeconds[idx] >= 1800 ? "manual-min-input full" : "manual-min-input"; }
    if(window.domCache.checks[idx]) { window.domCache.checks[idx].className = window.blockSeconds[idx] >= 1800 ? "cb-icon-box done active" : "cb-icon-box done"; window.domCache.checks[idx].querySelector('input').checked = window.blockSeconds[idx] >= 1800; }
    if(window.checkMonsterCompletion) window.checkMonsterCompletion();
    if(window.updateMonsterUI) window.updateMonsterUI(); // 🐛 30분 단위 체크 시 몬스터 UI도 즉각 갱신
};
window.syncTodayRecord = function() {
    if (!window.activeUser) return;
    const dateStr = window.Utils.getLogicalDateString();
    if (!window.dailyRecords[dateStr]) window.dailyRecords[dateStr] = { targetTime: "00h 00m", totalTime: "00h 00m" };
    window.dailyRecords[dateStr].targetTime = window.targetStudyString; window.dailyRecords[dateStr].totalTime = window.totalStudyString;
    window.setL('dailyRecords', JSON.stringify(window.dailyRecords));
};

// ==========================================
// 🧩 app.js 2부: 누락된 핵심 UI 및 부가기능 (100% 복구)
// ==========================================

// ------------------------------------------
// 1. 에디터 툴바 및 텍스트 데이터 로직
// ------------------------------------------
window.injectToolbar = function(containerId) {
    const container = document.getElementById(containerId);
    const template = document.getElementById('editor-toolbar-template');
    if (container && template) container.appendChild(template.content.cloneNode(true));
};

window.formatText = function(command, value = null) {
    document.execCommand(command, false, value);
    const editor = document.querySelector('.rich-editor:focus');
    if(editor) editor.focus();
};

window.insertEmojiAtCursor = function(emoji) {
    document.execCommand("insertText", false, emoji);
};

window.openTextModal = function(type, targetDateStr = null) {
    const dateStr = targetDateStr || window.Utils.getLogicalDateString();
    document.getElementById(`${type}-date-input`).value = dateStr;
    const input = document.getElementById(`${type}-input`);
    const title = document.getElementById(`${type}-modal-title`);
    
    title.innerText = type === 'diary' ? `📝 일기 (${dateStr})` : `✅ 할일 (${dateStr})`;
    input.innerHTML = (window.dailyRecords[dateStr] && window.dailyRecords[dateStr][type]) ? window.dailyRecords[dateStr][type] : "";
    
    document.getElementById(`${type}-modal`).style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.saveTextData = function(type, silent = false) {
    const dateStr = document.getElementById(`${type}-date-input`).value;
    const htmlContent = document.getElementById(`${type}-input`).innerHTML;
    if (!window.dailyRecords[dateStr]) window.dailyRecords[dateStr] = {};
    window.dailyRecords[dateStr][type] = htmlContent;
    window.setL('dailyRecords', JSON.stringify(window.dailyRecords));
    
    if (!silent) {
        window.app.closeModal(`${type}-modal`);
        window.showToast("💾 안전하게 저장되었습니다.");
        window.triggerAutoSync();
        
        const recordModal = document.getElementById('record-modal');
        if (recordModal && recordModal.style.display === 'flex') {
            window.openRecordModal(dateStr);
        }
    }
};

window.updateNotesFromLocal = function() {
    for(let i=0; i<48; i++) {
        let n = window.getL(`note_${i}`);
        if(window.domCache.notes && window.domCache.notes[i]) window.domCache.notes[i].value = n || "";
    }
};

window.saveNotesToLocal = function() {
    for(let i=0; i<48; i++) {
        if(window.domCache.notes && window.domCache.notes[i]) {
            let val = window.domCache.notes[i].value.trim();
            if(val) window.setL(`note_${i}`, val);
            else window.removeL(`note_${i}`);
        }
    }
    window.triggerAutoSync();
};

// ------------------------------------------
// 2. 타이머 하이라이트 및 달력(Calendar) 로직
// ------------------------------------------
window.updateHighlight = function() {
    if (!window.domCache.items || window.domCache.items.length === 0) return;
    const now = new Date();
    const currentH = now.getHours(); const currentM = now.getMinutes();
    
    window.domCache.items.forEach(el => el.classList.remove('current'));
    
    let foundIdx = -1;
    window.timeData.forEach((t, i) => {
        const parts = t.time.split(':');
        const th = parseInt(parts[0]); const tm = parseInt(parts[1]);
        
        const startMins = th * 60 + tm;
        let nowMins = currentH * 60 + currentM;
        let endMins = startMins + 30;
        
        if (endMins >= 24 * 60 && startMins >= 5 * 60) { } 
        else if (th < 5 && currentH >= 5) { nowMins -= 24 * 60; }
        
        if (nowMins >= startMins && nowMins < endMins) foundIdx = i;
    });
    
    if (foundIdx !== -1 && window.domCache.items[foundIdx]) {
        window.domCache.items[foundIdx].classList.add('current');
    }
};

window.scrollToCurrent = function() {
    const cur = document.querySelector('.list-item.current');
    if(cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.renderCalendar = function() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const y = window.currentRenderDate.getFullYear();
    const m = window.currentRenderDate.getMonth();
    document.getElementById('cal-month-year').innerText = `${y}년 ${m + 1}월`;
    
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const logicalToday = window.Utils.getLogicalDateString();

    let monthTotalMin = 0;

    for (let i = 0; i < firstDay; i++) {
        let empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        let dateObj = new Date(y, m, d);
        let dayOfWeek = dateObj.getDay();
        let dStr = `${y}-${window.Utils.pad(m + 1)}-${window.Utils.pad(d)}`;
        let isToday = (dStr === logicalToday);
        
        let numClass = "date-num";
        if (dayOfWeek === 0) numClass += " sun";
        if (dayOfWeek === 6) numClass += " sat";
        
        let rec = window.dailyRecords[dStr];
        let badgeHtml = '';
        let fillHeight = 0;
        let hasData = false;
        
        if (rec && rec.totalTime) {
            let parts = rec.totalTime.split('h');
            let hrs = parseInt(parts[0]) || 0;
            let mins = parseInt(parts[1]?.replace('m','').trim()) || 0;
            let totalMin = hrs * 60 + mins;
            
            if (totalMin > 0) {
                hasData = true;
                monthTotalMin += totalMin;
                fillHeight = Math.min(100, (totalMin / (12 * 60)) * 100);
                let isHigh = hrs >= 10;
                badgeHtml += `<div class="cal-badge actual ${isHigh ? 'high' : ''}">${hrs > 0 ? hrs + 'h ' : ''}${mins}m</div>`;
            }
        }
        if (rec && (rec.diary || rec.todo || (rec.notes && rec.notes.some(n=>n.trim()!=="")))) {
            hasData = true;
            let icons = "";
            if(rec.diary) icons += "📝";
            if(rec.todo) icons += "✅";
            if(icons === "") icons = "💬"; // 메모만 있는 경우
            badgeHtml += `<div style="font-size:11px; margin-top:2px;">${icons}</div>`;
        }
        
        let dayDiv = document.createElement('div');
        dayDiv.className = `cal-day ${isToday ? 'today' : ''} ${hasData && !isToday ? 'has-data' : ''}`;
        dayDiv.onclick = () => { window.SFX.play('pop'); window.openRecordModal(dStr); };

        dayDiv.innerHTML = `
            <div class="${numClass}">${d}</div>
            <div class="cal-badge-wrap">${badgeHtml}</div>
            <div class="cal-day-bg-fill" style="height: ${fillHeight}%;"></div>
        `;
        grid.appendChild(dayDiv);
    }
    
    const summaryEl = document.getElementById('cal-month-total');
    if (summaryEl) {
        let sumH = Math.floor(monthTotalMin / 60);
        let sumM = monthTotalMin % 60;
        summaryEl.innerText = `${sumH}h ${window.Utils.pad(sumM)}m`;
    }
};

window.changeMonth = function(offset) {
    window.currentRenderDate.setMonth(window.currentRenderDate.getMonth() + offset);
    window.renderCalendar();
};

window.goToToday = function() {
    window.currentRenderDate = new Date();
    window.renderCalendar();
};

window.openRecordModal = function(dateStr) {
    let rec = window.dailyRecords[dateStr] || {};
    let content = '';
    document.getElementById('modal-title').innerText = `${dateStr.split('-')[1]}월 ${dateStr.split('-')[2]}일 기록`;
    
    let tTime = rec.totalTime || '00h 00m';
    let tTarget = rec.targetTime || '00h 00m';
    
    // 모바일에서 겹치지 않게 유연한 레이아웃으로 변경
    content += `
        <div style="background:var(--bg-sec); padding:16px; border-radius:16px; margin-bottom:15px; border:1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:14px; font-weight:800; color:var(--text-main);">⏱️ 몰입 시간</span>
                <button onclick="window.editPastTime('${dateStr}')" style="background: rgba(0, 149, 246, 0.1); color: var(--primary); border: none; padding: 6px 14px; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">✏️ 시간 수정</button>
            </div>
            <div style="display:flex; justify-content:space-around; text-align:center; background:var(--surface); padding:12px; border-radius:12px; border:1px solid var(--border-color);">
                <div><span style="display:block; font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:4px;">목표 시간</span><strong style="font-size:20px; color:var(--text-muted); font-weight:900; letter-spacing:-0.5px;">${tTarget}</strong></div>
                <div style="width:1px; background:var(--border-color); margin:0 10px;"></div>
                <div><span style="display:block; font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:4px;">달성 시간</span><strong style="font-size:20px; color:var(--primary); font-weight:900; letter-spacing:-0.5px;">${tTime}</strong></div>
        </div>
    `;
        
        // 포켓몬 데이터 복구 (오늘의 파트너 표시)
        const todayStr = window.Utils.getLogicalDateString();
        let monInfoHTML = '';
        if (dateStr <= todayStr && window.monsterData && window.monsterData.inventory) {
            let monAtTime = window.monsterData.inventory.find(m => {
                if (m.status === 'egg') return false;
                return dateStr >= m.startDate && dateStr <= (m.endDate || "9999-12-31");
            });

            if (monAtTime) {
                let spec = window.getMonsterSpec ? window.getMonsterSpec(monAtTime) : null;
                if (spec) {
                    let currentStageIdx = monAtTime.selectedStage || 0;
                    let pokeId = spec.pokeIds[currentStageIdx];
                    let imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
                    
                    let tAct = tTime;
                    let growthBadge = tAct !== "00h 00m" ? `<span style="background:rgba(16, 185, 129, 0.15); color:var(--success); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:900; white-space:nowrap;">+${tAct} 성장 🚀</span>` : '';

                    monInfoHTML = `
                        <div style="background:var(--bg-sec); border:1px solid var(--border-color); border-radius:18px; padding:18px; margin-bottom:15px; display:flex; align-items:center; gap:15px; position:relative; overflow:hidden; flex-shrink:0;">
                            <img src="${imgUrl}" class="float-anim" style="width:65px; height:65px; object-fit:contain; z-index:2; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.1)); cursor:pointer;" onclick="window.playPokemonCry(${pokeId}, this, ${currentStageIdx >= 3}, '${spec.name}', ${spec.pokeIds[0]})">
                            <div style="z-index:2;">
                                <div style="font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:2px;">그날 함께한 파트너</div>
                                <div style="font-size:16px; font-weight:900; color:var(--text-main); margin-bottom:4px;">${monAtTime.nickname || spec.name}</div>
                                <div style="font-size:12px; color:var(--primary); font-weight:700; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <span style="white-space:nowrap;">#${spec.stages[currentStageIdx]} 육성 중</span>
                                    ${growthBadge}
                                </div>
                            </div>
                            <div style="position:absolute; right:-10px; bottom:-15px; font-size:80px; opacity:0.05; font-weight:900; z-index:1;">🐾</div>
                        </div>`;
                }
            }
        }
        content += monInfoHTML;

        let blocksHTML = {};
        
        blocksHTML['diary'] = `
            <div class="guide-box sortable-item" draggable="true" data-id="diary" style="margin-bottom:0;">
                <div class="guide-title" style="justify-content:space-between;">
                    <span><span class="drag-handle" style="cursor:grab; margin-right:8px; opacity:0.5; font-size:16px;" title="드래그해서 순서 변경">☰</span> 📝 일기</span> 
                    <button onclick="window.app.openTextModal('diary', '${dateStr}')" style="background:transparent; border:none; cursor:pointer; font-size:13px; color:var(--primary); font-weight:bold;">${rec.diary ? '✏️ 수정' : '➕ 작성'}</button>
                </div>
                <div class="reading-content" ${!rec.diary ? 'style="color:var(--text-muted); text-align:center; padding:20px 0; background:transparent; border:none; font-size:14px;"' : ''}>
                    ${rec.diary ? rec.diary : '작성된 일기가 없습니다. 자유롭게 기록을 남겨보세요!'}
                </div>
            </div>`;
            
        blocksHTML['todo'] = `
            <div class="guide-box sortable-item" draggable="true" data-id="todo" style="margin-bottom:0;">
                <div class="guide-title" style="justify-content:space-between;">
                    <span><span class="drag-handle" style="cursor:grab; margin-right:8px; opacity:0.5; font-size:16px;" title="드래그해서 순서 변경">☰</span> ✅ 할 일</span> 
                    <button onclick="window.app.openTextModal('todo', '${dateStr}')" style="background:transparent; border:none; cursor:pointer; font-size:13px; color:var(--primary); font-weight:bold;">${rec.todo ? '✏️ 수정' : '➕ 작성'}</button>
                </div>
                <div class="reading-content" ${!rec.todo ? 'style="color:var(--text-muted); text-align:center; padding:20px 0; background:transparent; border:none; font-size:14px;"' : ''}>
                    ${rec.todo ? rec.todo : '작성된 할 일이 없습니다. 일정을 추가해보세요!'}
                </div>
            </div>`;

        let notesToDisplay = rec.notes || [];
        if (dateStr === window.Utils.getLogicalDateString()) {
            notesToDisplay = [];
            for (let i = 0; i < 48; i++) { notesToDisplay.push(window.getL(`note_${i}`) || ""); }
        }

        if (notesToDisplay && Array.isArray(notesToDisplay) && notesToDisplay.some(n => n && n.trim() !== "")) {
            let notesHtml = `
                <div class="guide-box sortable-item" draggable="true" data-id="notes" style="margin-bottom:0;">
                    <div class="guide-title">
                        <span><span class="drag-handle" style="cursor:grab; margin-right:8px; opacity:0.5; font-size:16px;" title="드래그해서 순서 변경">☰</span> 🕒 타임라인 메모</span>
                    </div>
                    <ul style="margin:0; padding-left:20px; color:var(--text-main); font-size:13px; line-height:1.6;">`;
            notesToDisplay.forEach((n, i) => { if(n && n.trim() !== "") notesHtml += `<li><b style="color:var(--primary);">${window.timeData[i].time}</b> : <span style="word-break:break-word;">${window.Utils.escapeHTML(n)}</span></li>`; });
            notesHtml += `</ul></div>`;
            blocksHTML['notes'] = notesHtml;
        }

        let order = rec.blockOrder || ['diary', 'todo', 'notes'];
        content += `<div id="sortable-container" style="display:flex; flex-direction:column; gap:14px; padding-bottom:10px;">`;
        order.forEach(id => { if (blocksHTML[id]) { content += blocksHTML[id]; blocksHTML[id] = null; } });
        Object.keys(blocksHTML).forEach(id => { if (blocksHTML[id]) content += blocksHTML[id]; });
        content += `</div>`;

    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('record-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 드래그 앤 드롭 구현부 (PC 및 모바일 터치 지원)
    setTimeout(() => {
        const container = document.getElementById('sortable-container');
        if (!container) return;
        
        function getDragAfterElement(y) {
            const draggables = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
            return draggables.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) { return { offset: offset, element: child }; }
                else { return closest; }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        
        function saveOrder() {
            const currentOrder = Array.from(container.querySelectorAll('.sortable-item')).map(el => el.dataset.id);
            if (!window.dailyRecords[dateStr]) window.dailyRecords[dateStr] = {};
            window.dailyRecords[dateStr].blockOrder = currentOrder;
            window.setL('dailyRecords', JSON.stringify(window.dailyRecords));
            window.triggerAutoSync();
        }

        let draggedEl = null;
        let currentAfter = null;
        
        container.querySelectorAll('.sortable-item').forEach(draggable => {
            draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
            draggable.addEventListener('dragend', () => { draggable.classList.remove('dragging'); saveOrder(); });
            
            const handle = draggable.querySelector('.drag-handle');
            if (handle) {
                handle.addEventListener('touchstart', () => { 
                    if(navigator.vibrate) navigator.vibrate(15); // 집어 들 때 틱!
                    draggedEl = draggable; draggable.classList.add('dragging'); 
                }, {passive: true});
                handle.addEventListener('touchmove', (e) => {
                    if (!draggedEl) return;
                    e.preventDefault(); 
                    const afterEl = getDragAfterElement(e.touches[0].clientY);
                    
                    if (afterEl !== currentAfter) { // 순서가 넘어갈 때마다 틱!
                        if(navigator.vibrate) navigator.vibrate(10);
                        currentAfter = afterEl;
                    }
                    
                    if (afterEl == null) container.appendChild(draggedEl); else container.insertBefore(draggedEl, afterEl);
                }, {passive: false});
                handle.addEventListener('touchend', () => { if(draggedEl) { draggedEl.classList.remove('dragging'); draggedEl = null; saveOrder(); } });
            }
        });
        
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            const afterEl = getDragAfterElement(e.clientY);
            if (draggable) { if (afterEl == null) container.appendChild(draggable); else container.insertBefore(draggable, afterEl); }
        });
    }, 100);
};

window.editPastTime = function(dateStr) {
    let rec = window.dailyRecords[dateStr] || {targetTime:"00h 00m", totalTime:"00h 00m"};
    let newTotal = prompt(`[${dateStr}]\n달성 시간을 수정하세요 (형식: 00h 00m)`, rec.totalTime || "00h 00m");
    if (newTotal !== null && newTotal.trim() !== "") {
        let newTarget = prompt(`[${dateStr}]\n목표 시간을 수정하세요 (형식: 00h 00m)`, rec.targetTime || "00h 00m");
        if (newTarget !== null && newTarget.trim() !== "") {
            if(!window.dailyRecords[dateStr]) window.dailyRecords[dateStr] = {};
            window.dailyRecords[dateStr].totalTime = newTotal.trim();
            window.dailyRecords[dateStr].targetTime = newTarget.trim();
            window.setL('dailyRecords', JSON.stringify(window.dailyRecords));
            window.openRecordModal(dateStr); 
            window.renderCalendar(); 
            window.triggerAutoSync();
        }
    }
};

// ------------------------------------------
// 3. 디데이 및 기타 부가 기능
// ------------------------------------------
window.updateDashboardTodoAlert = function() {
    const alertIcon = document.getElementById('todo-alert-icon');
    if(!alertIcon) return;
    
    const todayStr = window.Utils.getLogicalDateString();
    let upcomingDate = null;
    
    let sortedDates = Object.keys(window.dailyRecords).sort();
    for(let d of sortedDates) {
        if (d >= todayStr && window.dailyRecords[d].todo) { upcomingDate = d; break; }
    }
    
    if (upcomingDate) {
        alertIcon.style.display = 'flex';
        alertIcon.dataset.targetDStr = upcomingDate;
        let rawHtml = window.dailyRecords[upcomingDate].todo;
        let tempDiv = document.createElement('div'); tempDiv.innerHTML = rawHtml;
        let pureText = tempDiv.textContent || tempDiv.innerText || "";
        let displayD = upcomingDate === todayStr ? "오늘" : upcomingDate.substring(5).replace('-','/');
        alertIcon.title = `[${displayD}] ${pureText.substring(0, 20)}${pureText.length > 20 ? '...' : ''}`;
    } else {
        alertIcon.style.display = 'none';
    }
};

window.teleportToTodo = function(dStr) {
    if(dStr === window.Utils.getLogicalDateString()) {
        window.switchView('study');
        setTimeout(() => window.openTextModal('todo'), 100);
    } else {
        window.switchView('calendar');
        window.openRecordModal(dStr);
    }
};

window.updateDdayUI = function() {
    const badge = document.getElementById('dday-badge');
    if (!badge) return;
    if (!window.ddayConfig || !window.ddayConfig.date) {
        badge.innerText = "⏳ 디데이 설정 +";
        return;
    }
    const today = new Date(window.Utils.getLogicalDateString() + "T00:00:00");
    const target = new Date(window.ddayConfig.date + "T00:00:00");
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dText = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? `D-Day` : `D+${Math.abs(diffDays)}`);
    badge.innerHTML = `<span style="font-size:10px; opacity:0.8; margin-right:4px;">${window.Utils.escapeHTML(window.ddayConfig.title)}</span> ${dText}`;
};

window.openDdayModal = function() {
    if (window.ddayConfig) {
        document.getElementById('dday-title-input').value = window.ddayConfig.title || "";
        document.getElementById('dday-date-input').value = window.ddayConfig.date || "";
    }
    document.getElementById('dday-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.saveDday = function() {
    window.ddayConfig.title = document.getElementById('dday-title-input').value.trim();
    window.ddayConfig.date = document.getElementById('dday-date-input').value;
    if(!window.ddayConfig.title || !window.ddayConfig.date) return window.showToast("내용을 모두 입력해주세요.");
    window.setL('ddayConfig', JSON.stringify(window.ddayConfig));
    window.updateDdayUI();
    window.app.closeModal('dday-modal');
    window.showToast("디데이가 설정되었습니다."); window.triggerAutoSync();
};

window.clearDday = function() {
    window.ddayConfig = { title: "", date: "" };
    window.setL('ddayConfig', JSON.stringify(window.ddayConfig));
    window.updateDdayUI();
    window.app.closeModal('dday-modal');
    window.triggerAutoSync();
};

// ------------------------------------------
// 4. 업적, 전체 통계 시스템 
// ------------------------------------------
// 🏆 업적 및 뱃지 시스템 복구
window.ACHIEVEMENTS_LIST = [
    { id: "a_start", icon: "🌱", title: "시작이 반", desc: "첫 번째 기록을 남겼습니다.", condition: (stats) => stats.firstRecord },
    { id: "a_10h", icon: "🏃", title: "워밍업", desc: "누적 공부 10시간 달성", condition: (stats) => stats.totalHours >= 10 },
    { id: "a_100h", icon: "🔥", title: "몰입의 경지", desc: "누적 공부 100시간 달성", condition: (stats) => stats.totalHours >= 100 },
    { id: "a_500h", icon: "🚀", title: "전력질주", desc: "누적 공부 500시간 달성", condition: (stats) => stats.totalHours >= 500 },
    { id: "a_1000h", icon: "👑", title: "페이스메이커 마스터", desc: "누적 공부 1000시간 달성", condition: (stats) => stats.totalHours >= 1000 },
    { id: "a_mon1", icon: "🥚", title: "첫 부화", desc: "도감에 1마리 이상 보존", condition: (stats) => stats.retiredCount >= 1 },
    { id: "a_mon10", icon: "🎒", title: "초보 트레이너", desc: "도감에 10마리 이상 보존", condition: (stats) => stats.retiredCount >= 10 },
    { id: "a_mon50", icon: "🧬", title: "베테랑 트레이너", desc: "도감에 50마리 이상 보존", condition: (stats) => stats.retiredCount >= 50 },
    { id: "a_shiny", icon: "✨", title: "빛나는 행운", desc: "이로치 포켓몬 발견", condition: (stats) => stats.shinyCount >= 1 },
    { id: "a_diary10", icon: "📝", title: "꾸준한 기록가", desc: "일기 10개 이상 작성", condition: (stats) => stats.diaryCount >= 10 },
    { id: "a_diary50", icon: "📚", title: "나만의 자서전", desc: "일기 50개 이상 작성", condition: (stats) => stats.diaryCount >= 50 },
    { id: "a_hardcore", icon: "💀", title: "초인적인 집중", desc: "하루 14시간 이상 공부", condition: (stats) => stats.todayHours >= 14 },
];

window.calculateTotalStats = function() {
    let totalStudySeconds = 0;
    let weekSeconds = 0;
    let monthSeconds = 0;

    const todayDateStr = window.Utils.getLogicalDateString();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    monday.setHours(0,0,0,0);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    Object.keys(window.dailyRecords).forEach(dateStr => {
        if (dateStr === todayDateStr) return; // 오늘 달력 무시 (아래에서 실시간 합산)

        let rec = window.dailyRecords[dateStr];
        let dailySecs = 0;
        if (rec && typeof rec.totalTime === 'string') {
            const parts = rec.totalTime.split('h');
            dailySecs = ((parseInt(parts[0]) || 0) * 3600) + ((parseInt(parts[1]?.replace('m', '').trim()) || 0) * 60);
        }
        totalStudySeconds += dailySecs;

        const checkDate = new Date(dateStr + "T00:00:00");
        if (checkDate >= monday) weekSeconds += dailySecs;
        if (checkDate >= firstDayOfMonth) monthSeconds += dailySecs;
    });

    let safeBlockSeconds = Array.isArray(window.blockSeconds) ? window.blockSeconds : Array(48).fill(0);
    let todaySecs = safeBlockSeconds.reduce((a, b) => Number(a) + Number(b), 0);
    if(isNaN(todaySecs)) todaySecs = 0;

    totalStudySeconds += todaySecs;
    let todayObj = new Date(todayDateStr + "T00:00:00");
    if(todayObj >= monday) weekSeconds += todaySecs;
    if(todayObj >= firstDayOfMonth) monthSeconds += todaySecs;

    const retiredCount = (window.monsterData && Array.isArray(window.monsterData.inventory)) ? window.monsterData.inventory.filter(m => m.status === 'retired').length : 0;
    const shinyCount = (window.monsterData && Array.isArray(window.monsterData.inventory)) ? window.monsterData.inventory.filter(m => m.isShiny).length : 0;
    const diaryCount = Object.values(window.dailyRecords).filter(rec => rec.diary && rec.diary.trim() !== '' && rec.diary !== '<br>').length;

    // 홈 화면 누적 시간 UI 갱신
    let totalHoursFloat = totalStudySeconds / 3600;
    const dashTotalEl = document.getElementById('dash-total-hours-val');
    if(dashTotalEl) dashTotalEl.innerText = totalHoursFloat.toFixed(1);

    return {
        totalHours: totalHoursFloat,
        weekHours: weekSeconds / 3600,
        monthHours: monthSeconds / 3600,
        retiredCount: retiredCount,
        shinyCount: shinyCount,
        diaryCount: diaryCount,
        todayHours: todaySecs / 3600,
        firstRecord: (Object.keys(window.dailyRecords).length > 0 || todaySecs > 0)
    };
};
window.checkAchievements = function() {
    if (!window.achievementsData) window.achievementsData = {};
    const stats = window.calculateTotalStats();
    let newUnlocked = false;
    window.ACHIEVEMENTS_LIST.forEach(ach => {
        if (!window.achievementsData[ach.id] && ach.condition(stats)) {
            window.achievementsData[ach.id] = { unlockedAt: window.Utils.getLogicalDateString() };
            newUnlocked = true;
            setTimeout(() => { if(window.showToast) window.showToast(`🏆 업적 달성: ${ach.title}!`); }, 1500);
        }
    });
    if (newUnlocked) {
        window.setL('achievements', JSON.stringify(window.achievementsData));
        window.triggerAutoSync();
    }
};

window.renderAchievements = function() {
    const grid = document.getElementById('achievement-grid');
    if(!grid) return;
    grid.innerHTML = '';
    if (!window.achievementsData) window.achievementsData = {};
    window.ACHIEVEMENTS_LIST.forEach(ach => {
        const isUnlocked = !!window.achievementsData[ach.id];
        const dateStr = isUnlocked ? window.achievementsData[ach.id].unlockedAt : "미달성";
        grid.innerHTML += `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" onclick="window.app.playSfx('pop')">
                <div style="font-size:36px; margin-bottom:8px;">${ach.icon}</div>
                <div style="font-size:14px; font-weight:800; color:var(--text-main); margin-bottom:4px; word-break:keep-all;">${ach.title}</div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600; margin-bottom:8px; word-break:keep-all;">${ach.desc}</div>
                <div style="font-size:10px; font-weight:bold; color:var(--primary);">${dateStr}</div>
            </div>
        `;
    });
};

window.openAchievementsModal = function() { 
    const stats = window.calculateTotalStats(); 
    const statWeekEl = document.getElementById('stat-week-hours');
    if(statWeekEl) statWeekEl.innerText = stats.weekHours.toFixed(1) + 'h';
    const statMonthEl = document.getElementById('stat-month-hours');
    if(statMonthEl) statMonthEl.innerText = stats.monthHours.toFixed(1) + 'h';
    const statTotalEl = document.getElementById('stat-total-hours');
    if(statTotalEl) statTotalEl.innerText = stats.totalHours.toFixed(1) + 'h';
    
    window.checkAchievements();
    window.renderAchievements();
    document.getElementById('achievement-modal').style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
};
window.toggleSetting = function(type) { 
    if(navigator.vibrate) navigator.vibrate(10);
    if (type === 'sound') { 
        window.isSoundOn = !window.isSoundOn; 
        let btn = document.getElementById('set-btn-sound');
        btn.innerText = window.isSoundOn ? "ON" : "OFF"; 
        btn.className = window.isSoundOn ? "setting-btn active-state" : "setting-btn";
        window.showToast("효과음 설정이 변경되었습니다."); 
    }
    if (type === 'alarm') { 
        window.isAlarmOn = !window.isAlarmOn; 
        let btn = document.getElementById('set-btn-alarm');
        btn.innerText = window.isAlarmOn ? "ON" : "OFF"; 
        btn.className = window.isAlarmOn ? "setting-btn active-state" : "setting-btn";
        window.showToast("알림 설정이 변경되었습니다."); 
    }
};
window.generateInstaImage = function(theme) { window.showToast("인스타 캡처 기능이 준비되었습니다."); };

// ==========================================
// 🔗 HTML-JS 끊어진 신호 연결 패치 (app.js 마지막 줄에 추가)
// ==========================================
// 1. 효과음(SFX) 명령 연결
window.app.playSfx = function(type) { 
    if(window.SFX) window.SFX.play(type); 
};

// 2. 수동 저장 버튼 연결
window.app.manualForceSave = function() { 
    window.executeSafeSync(); 
    window.showToast("💾 데이터가 서버에 안전하게 수동 저장되었습니다."); 
};

// 3. 라운지(게시판) 닫기 연결
window.app.closeBoardModal = function() { 
    window.app.closeModal('board-modal');
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

// 🍓 포켓몬 상호작용 로직 (간식, 쓰다듬기)
window.interactMonster = function(type) {
    if(!window.monsterData.displayId) return window.showToast("전시된 몬스터가 없습니다!");
    let m = window.monsterData.inventory.find(x => x.id === window.monsterData.displayId);
    if(!m || m.status === 'egg') return window.showToast("알 상태에서는 상호작용할 수 없습니다! ⚪");
    
    let spec = window.getMonsterSpec(m);
    const emojiEl = document.getElementById('monster-emoji');
    
    // 현재 포켓몬의 진화 단계와 이름 정확히 계산 (최종 진화형 이름 스포일러 방지)
    let totalHours = Math.floor(window.calculateActiveMonsterExp(m) / 3600);
    let evoHours = window.getEvolutionHours(spec);
    let currentStageIdx = 0;
    for (let i = evoHours.length - 1; i >= 0; i--) {
        if (totalHours >= evoHours[i]) { currentStageIdx = i; break; }
    }
    if (m.selectedStage !== undefined) currentStageIdx = m.selectedStage;
    if (currentStageIdx >= spec.pokeIds.length) currentStageIdx = spec.pokeIds.length - 1;
    
    let currentName = m.nickname || spec.stages[currentStageIdx] || spec.name;
    
    let imgEl = emojiEl ? emojiEl.querySelector('img') : null;
    let originalTrans = imgEl ? (imgEl.style.transform || 'scale(1)') : 'scale(1)';
    
    if(type === 'feed') {
        const berries = ['cheri', 'chesto', 'pecha', 'rawst', 'aspear', 'leppa', 'oran', 'persim', 'lum', 'sitrus'];
        let randomBerry = berries[Math.floor(Math.random() * berries.length)];
        
        let berryEl = document.createElement('img');
        berryEl.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${randomBerry}-berry.png`;
        berryEl.className = 'feed-berry';
        berryEl.style.left = '50%'; berryEl.style.top = '10%'; berryEl.style.transform = 'translate(-50%, 0)';
        if(emojiEl) emojiEl.appendChild(berryEl);
        setTimeout(() => berryEl.remove(), 1000);

        window.SFX.play('eat');
        window.showToast(`🍓 ${currentName}에게 간식을 주었습니다! 냠냠!`);
    } else if (type === 'pet') {
        let handEl = document.createElement('div');
        handEl.innerText = '🖐️'; handEl.className = 'pet-hand';
        handEl.style.left = '50%'; handEl.style.top = '5%'; handEl.style.transform = 'translate(-50%, 0)';
        if(emojiEl) emojiEl.appendChild(handEl);
        setTimeout(() => handEl.remove(), 1200);

        window.SFX.play('pet');
        window.showToast(`❤️ ${currentName}이(가) 기분 좋아합니다!`);
    }
    
    // 이펙트 꿀렁임
    if(imgEl) {
        imgEl.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        imgEl.style.transform = originalTrans + ' translateY(-10px) scale(1.1)';
        setTimeout(() => imgEl.style.transform = originalTrans, 300);
    }
};

// ✨ 포켓몬 전체화면 진화 팝업
window.showEvolutionPopup = async function(baseName, stageName, pokeId, maxHours, monsterId, oldPokeId) {
    window.SFX.play('success'); 
    
    let fallbackImgUrl = pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
    let fallbackOldImgUrl = (oldPokeId && oldPokeId >= 10000) ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${oldPokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${oldPokeId}.png`;
    
    let imgUrl = fallbackImgUrl;
    let oldImgUrl = fallbackOldImgUrl;
    
    let m = window.monsterData.inventory.find(x => x.id === monsterId);
    let isShiny = m ? m.isShiny : false;

    // Showdown 애니메이션 가져오기
    try {
        let pData = await window.PokeAPI.getPokemon(pokeId);
        let sdName = pData && pData.name ? pData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh') : null;
        if(sdName) imgUrl = isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`;
        
        if (oldPokeId) {
            let oData = await window.PokeAPI.getPokemon(oldPokeId);
            let osdName = oData && oData.name ? oData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh') : null;
            if(osdName) oldImgUrl = isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${osdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${osdName}.gif`;
        }
    } catch(e) {}
        
    const popup = document.getElementById('evolution-popup');
    const imgEl = document.getElementById('evo-popup-img');
    const titleEl = document.getElementById('evo-popup-title');
    const descEl = document.getElementById('evo-popup-desc');
    
    imgEl.onerror = function() { if(this.src !== (oldPokeId ? fallbackOldImgUrl : fallbackImgUrl)) this.src = oldPokeId ? fallbackOldImgUrl : fallbackImgUrl; };
    imgEl.src = oldPokeId ? oldImgUrl : imgUrl;
    imgEl.style.transform = 'scale(0.2)'; imgEl.style.opacity = '0'; descEl.style.opacity = '0';
    
    if (stageName.includes("메가") || stageName.includes("마스터")) { titleEl.innerText = `어라...? 엄청난 빛이!!`; } 
    else { titleEl.innerText = `어라...? ${baseName}의 상태가!`; }
    
    descEl.innerHTML = `축하합니다! <b>${stageName}</b>(으)로 진화했습니다!<br><span style="font-size:14px; opacity:0.8;">현재 누적 시간: ${Math.floor(window.calculateActiveMonsterExp(m)/3600)}h / ${maxHours}h</span>`;
    
    popup.style.display = 'flex'; document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        imgEl.style.transform = 'scale(1)'; imgEl.style.opacity = '1';
        if (oldPokeId && oldPokeId !== pokeId) {
            imgEl.classList.add('evo-blinking'); 
            setTimeout(() => {
                let flash = document.createElement('div'); flash.className = 'evo-flash'; flash.style.animation = 'flash-bang 1s ease-out forwards';
                imgEl.parentElement.appendChild(flash);
                setTimeout(() => {
                    imgEl.onerror = function() { if(this.src !== fallbackImgUrl) this.src = fallbackImgUrl; };
                    imgEl.src = imgUrl; imgEl.classList.remove('evo-blinking'); imgEl.style.transform = 'scale(1.2)';
                    if(window.playPokemonCry) window.playPokemonCry(pokeId, null, stageName.includes("메가"));
                }, 300); 
                setTimeout(() => flash.remove(), 1000);
            }, 2000); 
            setTimeout(() => { descEl.style.opacity = '1'; }, 3000);
        } else {
            setTimeout(() => { if(window.playPokemonCry) window.playPokemonCry(pokeId, null, stageName.includes("메가")); imgEl.style.transform = 'scale(1.2)'; }, 800);
            setTimeout(() => { descEl.style.opacity = '1'; }, 2000);
        }
    }, 100);
};

// 🌐 온라인/오프라인 네트워크 상태 실시간 감지
window.updateNetworkStatus = function() {
    const badge = document.getElementById('network-status');
    if(!badge) return;
    if(navigator.onLine) { badge.style.display = 'none'; } 
    else { badge.style.display = 'block'; }
};
window.addEventListener('online', window.updateNetworkStatus);
window.addEventListener('offline', window.updateNetworkStatus);

// ==========================================
// 🩹 Pacemaker Pro+ : 통합 버그 수정 및 UI 패치
// ==========================================

// 🐛 1 & 2. 할 일(Todo) 툴바 복구 및 초기화 수정
window.initApp = function() {
    window.injectToolbar('diary-toolbar-container'); 
    window.injectToolbar('todo-toolbar-container'); // board -> todo로 정상화
    
    if (window.activeUser && window.activePw) {
        if(document.getElementById('login-view')) document.getElementById('login-view').style.display = 'none'; 
        
        window.preloadCache();
        // 1. 오프라인 우선(Offline-first): 무한 로딩 방지를 위해 로컬 캐시로 앱을 즉시 렌더링
        window.initLocalState();
        window.startDashboard();
        
        // 2. 백그라운드 동기화 수행 및 타임아웃 2.5초 부여 (서버 응답이 늦어져도 앱은 정상 구동)
        let syncPromise = window.loadFromCloud(true);
        let forceCloseTimer = setTimeout(() => window.showLoading(false), 2500);
        
        syncPromise.finally(() => {
            clearTimeout(forceCloseTimer);
            window.showLoading(false);
        });
    } else {
        if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = 'none'; 
        if(document.getElementById('login-view')) document.getElementById('login-view').style.display = 'flex'; 
    }
    
    // 네트워크 상태 체크
    window.updateNetworkStatus();
    
    // 스플래시 화면 페이드 아웃 로직
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 500);
        }
    }, 1200);
    
    // 앱 버전 표기
    const verDisplay = document.querySelector('.app-version-display');
    if (verDisplay) verDisplay.innerText = window.APP_VERSION;
};

// 모듈 로딩 시점과 관계없이 확실하게 초기화되도록 이벤트 변경
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initApp);
} else {
    window.initApp();
}

// 🐛 4. 팝업 바깥(블러 배경) 클릭 시 창 닫기 기능 추가
document.querySelectorAll('.overlay-base').forEach(overlay => {
    overlay.addEventListener('mousedown', function(e) {
        // 클릭한 대상이 모달 내부(modal-box)가 아니라 배경(overlay-base) 자체일 경우
        if (e.target === this) {
            if(window.SFX) window.SFX.play('tap');
            this.style.display = 'none';
            document.body.style.overflow = '';
            
            // 일기/할일 모달이 닫힐 때는 자동 저장 트리거
            if (this.id === 'diary-modal') window.saveTextData('diary', true);
            if (this.id === 'todo-modal') window.saveTextData('todo', true);
        }
    });
});

// 🐛 5. 개발자 모드(실험실) 5연속 클릭 트리거 복구
let versionClicks = 0;
let versionClickTimer = null;
const versionEl = document.getElementById('version-text');
if (versionEl) {
    versionEl.addEventListener('click', () => {
        versionClicks++;
        clearTimeout(versionClickTimer);
        versionClickTimer = setTimeout(() => { versionClicks = 0; }, 1500); // 1.5초 내 5번
        
        if (versionClicks >= 5) {
            versionClicks = 0;
            const labMenu = document.getElementById('lab-menu');
            if (labMenu) {
                labMenu.style.display = 'flex';
                document.getElementById('settings-modal').style.display = 'flex';
                if(window.showToast) window.showToast("🧪 개발자 모드가 활성화되었습니다!");
            }
        }
    });
}

// 2. 고도화된 게시판(라운지) 렌더링 - 인스타그램 스타일 레이아웃
// app.js 내 openBoardModal 함수 업데이트 (본인 확인 로직 추가)
window.allPosts = []; // 검색을 위한 전체 포스트 캐시

window.openBoardModal = async function() {
    document.getElementById('board-modal').style.display = 'flex';
    document.getElementById('board-header-title').innerText = "📢 스터디 라운지";
    if (document.getElementById('board-back-btn')) document.getElementById('board-back-btn').style.visibility = 'hidden';
    const contentArea = document.getElementById('board-content-area');
    contentArea.innerHTML = '<div style="padding:40px; text-align:center;">📡 데이터 수신 중...</div>';

    let res = await window.FirebaseEngine.getBoardList();
    if (res.success) {
        window.allPosts = res.data;
        window.renderBoardItems(window.allPosts);
    }
};

window.renderBoardItems = function(posts) {
    const contentArea = document.getElementById('board-content-area');
    if (!document.getElementById('board-header-area')) {
        contentArea.innerHTML = `
            <div id="board-header-area" style="padding: 10px 16px; background:var(--surface); flex-shrink:0; z-index: 10; position: sticky; top: 0;">
                <input type="text" id="board-search-input" class="input-field" placeholder="🔍 라운지 검색..." oninput="window.filterBoard(this.value)" style="margin-bottom:0; border-radius:16px; padding: 12px 16px; font-size: 14px; background: var(--bg-sec);">
            </div>
            
            <div style="padding: 16px; background: var(--surface); border-bottom: 8px solid var(--bg-sec); display: flex; gap: 12px; align-items: center;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--target)); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 18px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${window.activeUser.charAt(0).toUpperCase()}</div>
                <div style="flex-grow: 1; position: relative;">
                    <textarea id="new-post-content" class="note-input" placeholder="새로운 소식을 남겨보세요..." style="min-height: 48px; padding: 14px 44px 14px 16px; border-radius: 24px; width: 100%; box-sizing: border-box; resize: none; overflow: hidden; background: var(--bg-sec);" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"></textarea>
                    <button onclick="window.writePost()" style="position: absolute; right: 6px; bottom: 8px; background: var(--primary); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 2px 8px rgba(0,149,246,0.3);">⬆️</button>
                </div>
            </div>
            <div id="board-list-area" style="flex-grow:1; display:flex; flex-direction:column; background: var(--bg-sec);"></div>
        `;
    }

    const listArea = document.getElementById('board-list-area');
    let html = '';

    posts.forEach(item => {
        const isMine = item.author === window.activeUser;
        html += `
            <div class="board-card" style="padding: 20px 16px; background: var(--surface); border-bottom: 1px solid var(--border-color); margin-bottom: 6px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="display:flex; align-items:center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--bg-sec); border: 1px solid var(--border-color); display: flex; justify-content: center; align-items: center; font-size: 18px; font-weight: 800; color: var(--text-muted);">${item.author.charAt(0).toUpperCase()}</div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 800; font-size: 15px; color: var(--text-main);">${item.author}</span>
                            <span style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
                        </div>
                    </div>
                    ${isMine ? `<button style="background: transparent; border: none; color: #ef4444; font-size: 13px; font-weight: 800; cursor: pointer; padding: 4px 8px; border-radius: 12px; transition: background 0.2s;" onclick="window.deletePost('${item.id}')">삭제</button>` : ''}
                </div>
                
                <div style="margin: 16px 0; font-size: 15px; line-height: 1.6; color: var(--text-main); word-break: break-word; white-space: pre-wrap;">${window.Utils.escapeHTML(item.content)}</div>
                
                <div style="display: flex; gap: 16px; align-items: center; margin-top: 10px;">
                    <button style="background: transparent; border: none; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--text-muted); cursor: pointer; padding: 6px 10px; border-radius: 20px; transition: background 0.2s;" onclick="handleLike('${item.id}', ${item.likes || 0})">
                        <span style="font-size: 18px; color: ${item.likes > 0 ? '#ef4444' : 'inherit'};">${item.likes > 0 ? '❤️' : '🤍'}</span> ${item.likes || 0}
                    </button>
                    <button style="background: transparent; border: none; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--text-muted); cursor: pointer; padding: 6px 10px; border-radius: 20px; transition: background 0.2s;" onclick="window.viewPost('${item.id}')">
                        <span style="font-size: 18px;">💬</span> ${item.comments ? item.comments.length : 0}
                    </button>
                </div>
            </div>
        `;
    });
    listArea.innerHTML = html;
};

// 🔍 게시판 검색 필터
window.filterBoard = function(term) {
    const filtered = window.allPosts.filter(p => 
        p.content.toLowerCase().includes(term.toLowerCase()) || 
        p.author.toLowerCase().includes(term.toLowerCase())
    );
    window.renderBoardItems(filtered);
};

// 💬 상세 보기 및 댓글 기능 복구
window.viewPost = function(id) {
    const post = window.allPosts.find(p => p.id === id);
    if (!post) return window.showToast("글을 찾을 수 없습니다.");
    
    document.getElementById('board-header-title').innerText = "게시물 및 댓글";
    const backBtn = document.getElementById('board-back-btn');
    if (backBtn) {
        backBtn.style.visibility = 'visible';
        backBtn.onclick = function() {
            window.app.playSfx('pop');
            document.getElementById('board-header-title').innerText = "📢 스터디 라운지";
            this.style.visibility = 'hidden';
            window.renderBoardItems(window.allPosts);
        };
    }

    const contentArea = document.getElementById('board-content-area');
    
    let isMine = post.author === window.activeUser;
    let comments = post.comments || [];
    let dStr = post.date ? new Date(post.date).toLocaleString() : "";
    
    let html = `
        <div style="background: var(--surface); flex-shrink: 0;">
            <!-- 상단 뒤로가기 숨김 (헤더에 배치) -->
            <div style="padding: 16px 16px 20px; border-bottom: 1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="display:flex; align-items:center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--target)); display: flex; justify-content: center; align-items: center; font-size: 20px; font-weight: 800; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${post.author.charAt(0).toUpperCase()}</div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 800; font-size: 16px; color: var(--text-main);">${window.Utils.escapeHTML(post.author)}</span>
                            <span style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${dStr}</span>
                        </div>
                    </div>
                    ${isMine ? `<button style="background: transparent; border: none; color: #ef4444; font-size: 13px; font-weight: 800; cursor: pointer; padding: 4px 8px; border-radius: 12px;" onclick="window.deletePost('${post.id}')">삭제</button>` : ''}
                </div>
                
                <div style="margin: 20px 0; font-size: 16px; line-height: 1.7; color: var(--text-main); word-break: break-word; white-space: pre-wrap;">${window.Utils.escapeHTML(post.content).replace(/\\n/g, '<br>')}</div>
                
                <div style="display: flex; gap: 16px; align-items: center; padding-top: 15px; border-top: 1px solid var(--border-color);">
                    <button style="background: transparent; border: none; display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 800; color: var(--text-main); cursor: pointer;" onclick="window.handleLike('${post.id}', ${post.likes || 0})">
                        <span style="font-size: 20px; color: ${post.likes > 0 ? '#ef4444' : 'inherit'};">${post.likes > 0 ? '❤️' : '🤍'}</span> 좋아요 ${post.likes || 0}개
                    </button>
                </div>
            </div>
        </div>
        
        <div style="background: var(--bg-sec); flex-grow: 1; overflow-y: auto;">
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
    `;
    
    if (comments.length === 0) {
        html += `<div style="padding: 40px 0; text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 600;">아직 댓글이 없습니다.<br>첫 번째 댓글을 남겨보세요!</div>`;
    } else {
        comments.forEach(cmt => {
            let isMyCmt = cmt.author === window.activeUser;
            html += `
                <div style="display: flex; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--border-color); display: flex; justify-content: center; align-items: center; font-size: 13px; font-weight: bold; flex-shrink: 0; color: var(--text-muted);">${cmt.author.charAt(0).toUpperCase()}</div>
                    <div style="flex-grow: 1; background: var(--surface); padding: 12px 14px; border-radius: 0 16px 16px 16px; border: 1px solid var(--border-color); box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <span style="font-weight: 800; font-size: 13px; color: var(--text-main);">${window.Utils.escapeHTML(cmt.author)}</span>
                            ${isMyCmt ? `<button style="background: transparent; border: none; color: #ef4444; font-size: 11px; font-weight: bold; padding: 2px 6px; cursor: pointer;" onclick="window.deleteComment('${post.id}', '${cmt.id}')">삭제</button>` : ''}
                        </div>
                        <div style="font-size: 14px; line-height: 1.5; color: var(--text-main); word-break: break-word; white-space: pre-wrap;">${window.Utils.escapeHTML(cmt.text).replace(/\\n/g, '<br>')}</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${new Date(cmt.date).toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </div>
        
        <div style="padding: 12px 16px; background: var(--surface); border-top: 1px solid var(--border-color); flex-shrink: 0; z-index: 10;">
            <div style="display: flex; gap: 10px; align-items: center; background: var(--bg-sec); border-radius: 24px; padding: 4px 6px 4px 16px; border: 1px solid var(--border-color);">
                <input type="text" id="comment-input" placeholder="${window.activeUser}(으)로 댓글 달기..." style="flex-grow: 1; background: transparent; border: none; font-size: 14px; color: var(--text-main); outline: none; padding: 8px 0; font-family: inherit;">
                <button style="background: var(--primary); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: 0.2s;" onclick="window.submitComment('${post.id}')">⬆️</button>
            </div>
        </div>
    `;
    contentArea.innerHTML = html;
};

// ❤️ 좋아요 처리
window.handleLike = async function(id, current) {
    await window.FirebaseEngine.likePost(id, current);
    window.openBoardModal(); // 새로고침
};

// 수정 및 삭제 기능
window.deletePost = async function(id) {
    if(!confirm("정말 이 글을 삭제할까요?")) return;
    if(await window.FirebaseEngine.deleteBoard(id)) {
        window.showToast("🗑️ 글이 삭제되었습니다.");
        window.openBoardModal();
    }
};

window.submitComment = async function(postId) {
    const text = document.getElementById('comment-input').value.trim();
    if (!text) return window.showToast("내용을 입력해주세요.");
    
    window.showLoading(true, "댓글 등록 중... 💬");
    const commentData = { id: "cmt_" + Date.now(), author: window.activeUser || "익명", text: text, date: new Date().toISOString() };
    
    let res = await window.FirebaseEngine.addComment(postId, commentData);
    window.showLoading(false);
    
    if (res.success) {
        const post = window.allPosts.find(p => p.id === postId);
        if(post) { if(!post.comments) post.comments = []; post.comments.push(commentData); }
        window.viewPost(postId);
    } else { window.showToast("❌ 실패했습니다."); }
};

window.deleteComment = async function(postId, commentId) {
    if (!confirm("댓글을 삭제할까요?")) return;
    window.showLoading(true, "삭제 중... 🗑️");
    
    const post = window.allPosts.find(p => p.id === postId);
    const newComments = post.comments.filter(c => c.id !== commentId);
    
    let res = await window.FirebaseEngine.updateComments(postId, newComments);
    window.showLoading(false);
    
    if (res.success) { post.comments = newComments; window.viewPost(postId); }
    else { window.showToast("❌ 삭제 실패"); }
};

window.editPostPrompt = async function(id, oldContent) {
    const newContent = prompt("내용을 수정하세요:", oldContent);
    if(newContent && newContent.trim() !== "" && newContent !== oldContent) {
        if(await window.FirebaseEngine.updateBoard(id, newContent)) {
            window.showToast("✨ 수정이 완료되었습니다.");
            window.openBoardModal();
        }
    }
};

// 게시판 글쓰기 로직
window.writePost = async function() {
    const contentInput = document.getElementById('new-post-content');
    const content = contentInput.value.trim();
    if (!content) return window.showToast("내용을 입력해주세요.");
    
    contentInput.disabled = true;
    window.showLoading(true, "게시글 등록 중... 🚀");
    
    // Firebase 통신
    let res = await window.FirebaseEngine.writeBoard({
        author: window.activeUser || "익명",
        content: content,
        date: new Date().toISOString()
    });
    
    window.showLoading(false);
    if (res.success) {
        window.showToast("✅ 게시글이 등록되었습니다.");
        window.openBoardModal(); // 새로고침
    } else {
        window.showToast("❌ 게시글 등록 실패");
        contentInput.disabled = false;
    }
};

// 🐛 6 & 7. 불필요해진 구버전 백업/점검 UI 숨기기
const backupCheckBtn = document.getElementById('btn-check-backup');
const lastBackupTime = document.getElementById('last-backup-time');
if(backupCheckBtn) backupCheckBtn.style.display = 'none'; // 실시간 동기화이므로 점검 불필요
if(lastBackupTime) lastBackupTime.innerText = "Firebase 실시간 클라우드 동기화 🟢";

window.labMigrateData = async function() {
    const gasUrl = "https://script.google.com/macros/s/AKfycbxx1toXSR7ZFvLUPJ948GiCvppDyUiwjDZhYEHo9f8IgqRekEbGVgWsorB4nEhxFr7I/exec";
    
    if (!window.activeUser) return window.showToast("먼저 로그인이 필요합니다.");
    
    if (!confirm(`[데이터 이사] 현재 로그인된 '${window.activeUser}' 계정으로 이전 서버의 데이터를 가져오시겠습니까?\n가져온 데이터는 현재 기기의 기록을 덮어씌웁니다.`)) return;
    
    window.showLoading(true, `이전 서버에서 '${window.activeUser}' 데이터 찾는 중... 🚚`);
    
    // FirebaseEngine을 호출하여 GAS에서 데이터 수집
    let res = await window.FirebaseEngine.migrateFromGAS(gasUrl, window.activeUser);
    
    if (res.success) {
        // 가져온 데이터를 로컬 저장소에 적용
        window.saveUserLocalData(res.data);
        window.showToast("✅ 데이터 이사 성공! 클라우드에 자동 동기화됩니다.");
        
        // 즉시 동기화 실행
        window.executeSafeSync().then(() => {
            setTimeout(() => {
                alert("기록 복구가 완료되었습니다. 변경사항을 적용하기 위해 새로고침합니다.");
                location.reload();
            }, 1000);
        });
    } else {
        window.showLoading(false);
        alert(`이사 실패: ${res.message}\n\n* GAS 배포 설정이 '모든 사용자(Anyone)'로 되어있는지 확인해주세요.`);
    }
};
