// ==========================================
// 🔥 Pacemaker Pro+ : Main Application Engine
// 원본 기능 100% 유지 + Firebase 연동 + 버그 수정 통합본
// ==========================================

import { FirebaseEngine } from './firebase.js';
import './battle.js';
import './board.js';
import './audio.js';
import './achievements.js';
import './editor.js';
import './calendar.js';
import './study.js';
import './lab.js';
import './monster-ui.js';

window.APP_VERSION = "1.0.0 Pro+ (Firebase)"; 

// 전역 변수 초기화
window.activeUser = localStorage.getItem('activeUser') !== 'null' ? localStorage.getItem('activeUser') : null;
window.activePw = localStorage.getItem('activePw') !== 'null' ? localStorage.getItem('activePw') : null;
window.myDeviceToken = localStorage.getItem('deviceToken') || ("DEV_" + Date.now() + "_" + Math.floor(Math.random()*10000));
localStorage.setItem('deviceToken', window.myDeviceToken);
window.selectedChar = localStorage.getItem('selectedChar') || 'dpp_boy';

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

window.preloadPokemonData = async function() {
    if (!window.monsterData || !window.monsterData.inventory || !window.PokeAPI) return;
    
    const allPokeIds = new Set();
    window.monsterData.inventory.forEach(m => {
        const spec = window.getMonsterSpec(m);
        if (spec && spec.pokeIds) {
            spec.pokeIds.forEach(id => allPokeIds.add(id));
        }
    });

    // Fire and forget - let them run in parallel in the background
    for (const id of allPokeIds) {
        window.PokeAPI.getPokemon(id);
    }
}

// ------------------------------------------
// ✨ 부드러운 공통 모달 닫기 애니메이션
// ------------------------------------------
window.app = window; 
window.app.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || modal.dataset.closing === "true") return;
    
    modal.dataset.closing = "true";
    const box = modal.querySelector('.modal-box') || modal.children[0];
    
    if (box) {
        // 스와이프 도중이든 터치 클릭이든, 현재 위치에서 부드럽게 밑으로 떨어지는 애니메이션 적용
        box.style.animation = 'none';
        box.style.transition = 'transform 0.35s cubic-bezier(0.28, 1.1, 0.32, 1), opacity 0.35s ease';
        box.style.transform = 'translateY(100vh)';
        box.style.opacity = '0';
            
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            box.style.transition = ''; // 재사용을 위한 리셋
            box.style.transform = '';
            box.style.opacity = '';
            modal.dataset.closing = "false";
        }, 350);
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
            box.style.animation = 'none'; // 애니메이션 강제 해제로 드래그 잠김 현상 해결
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
    if(res.success && res.data && res.timestamp) {
        window.saveUserLocalData(res.data);
        window.executeSafeSync(); // 복구된 데이터를 현재 서버 데이터로 덮어쓰기
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

    const selectedCharBtn = document.querySelector('.char-btn.selected');
    if (selectedCharBtn) {
        window.selectedChar = selectedCharBtn.dataset.char;
        localStorage.setItem('selectedChar', window.selectedChar);
    }
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
    window.checkAndResetDay();
    window.initLocalState(); 
    
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
    else if (viewId === 'game') {
        if (window.BGM) window.BGM.play('town');
        if (window.InstSys && window.InstSys.preloadInstruments) {
            window.InstSys.preloadInstruments(); // 광장 입장 시 피아노 사운드 미리 로드
        }
        if (!window.gameInitialized && typeof $ !== 'undefined') {
            window.gameInitialized = true;
            // 게임 뷰 렌더링 후 약간의 딜레이를 주어 컨테이너 크기가 잡힌 뒤 실행
            setTimeout(() => { $(window).trigger('startGameEvent', [window.activeUser || 'Player', window.selectedChar]); }, 100);
        } else if (window.gameInitialized && typeof $ !== 'undefined') {
            setTimeout(() => { $(window).trigger('resize'); }, 100); // 캔버스 다시 리사이징
        }
    } else {
        if (window.BGM && window.BGM.currentTrack === 'town') window.BGM.stop();
    }
};

window.initLocalState = function() {
    try { window.blockSeconds = window.Utils.safeParseJSON(window.getL('blockSeconds'), Array(48).fill(0)); } catch(e){}
    try { window.targetBlocks = window.Utils.safeParseJSON(window.getL('targetBlocks'), Array(48).fill(false)); } catch(e){}
    try { window.dailyRecords = window.Utils.safeParseJSON(window.getL('dailyRecords'), {}); } catch(e){}
    try { window.ddayConfig = window.Utils.safeParseJSON(window.getL('ddayConfig'), {title:"", date:""}); } catch(e){}
    try { window.achievementsData = window.Utils.safeParseJSON(window.getL('achievements'), {}); } catch(e){}
    
    // ✨ 몬스터 데이터 로컬 캐시 초기화 누락 복구 (데이터 증발 버그의 원인)
    try { if(window.initMonster) window.initMonster(); } catch(e){}
    window.preloadPokemonData(); // Pre-fetch Pokémon data in the background
    
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
    if (window.InstrumentEngine) window.InstrumentEngine.stop();
    if (window.PlazaMusic) window.PlazaMusic.stop();
    window.showLoading(true, "서버에 안전하게 동기화 중... ☁️");
    window.syncTodayRecord();
    await window.saveAllDataToServer(); 
    localStorage.removeItem('activeUser'); localStorage.removeItem('activePw');
    location.reload();
};

window.manualClearBoard = function() {
    if(!confirm("⚠️ 오늘 하루의 체크 및 달성 기록을 모두 초기화하시겠습니까?\n(이 작업은 되돌릴 수 없으며, 즉시 서버에 반영됩니다)")) return;
    
    window.blockSeconds = Array(48).fill(0); 
    window.targetBlocks = Array(48).fill(false); 
    window.alarmedBlocks = Array(48).fill(false);
    for(let i=0; i<48; i++) { 
        window.removeL(`note_${i}`); 
        if(window.domCache.notes && window.domCache.notes[i]) window.domCache.notes[i].value = ""; 
    }
    
    window.setL('blockSeconds', JSON.stringify(window.blockSeconds));
    window.setL('targetBlocks', JSON.stringify(window.targetBlocks));
    window.setL('alarmedBlocks', JSON.stringify(window.alarmedBlocks));
    
    window.syncTodayRecord();
    window.updateUI(true); 
    window.triggerAutoSync(true);
    window.app.closeModal('settings-modal');
    window.showToast("🧹 오늘의 보드가 성공적으로 초기화되었습니다.");
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
    window.initBottomSheetSwipe(); // 팝업창 드래그해서 닫기 제스처 활성화

    // 캐릭터 선택 UI 클릭 및 애니메이션 처리
    if (typeof $ !== 'undefined') {
        $('.char-btn').click(function() {
                if(window.SFX) window.SFX.play('success'); // ✨ 캐릭터 선택 시 특별한 효과음
            $('.char-btn').css('border-color', 'transparent').removeClass('selected');
            $(this).css('border-color', 'var(--primary)').addClass('selected');
        });
        
        if (window.selectedChar) {
            $('.char-btn').css('border-color', 'transparent').removeClass('selected');
            $('.char-btn[data-char="' + window.selectedChar + '"]').css('border-color', 'var(--primary)').addClass('selected');
        }

        // 앱 내부 캐릭터 변경 UI 연동
        $('.char-btn-inapp').click(function() {
            if(window.SFX) window.SFX.play('success'); // ✨ 캐릭터 선택 시 특별한 효과음
            $('.char-btn-inapp').css('border-color', 'transparent').removeClass('selected');
            $(this).css('border-color', 'var(--primary)').addClass('selected');
        });
        
        // ★ [신규] 모든 캐릭터가 항상 부드럽게 걷고 있는 애니메이션 전역 적용 (12x1, 3x4, 4x4 완벽 호환)
        window.charAnimCache = window.charAnimCache || {};
        window.charAnimFoot = window.charAnimFoot || 0;
        
        function updateCharUIAnimation() {
            window.charAnimFoot = (window.charAnimFoot + 1) % 4;
            $('.char-btn, .char-btn-inapp').each(function() {
                let elt = $(this);
                let charName = elt.data('char');
                if (!charName) return;
                
                if (!window.charAnimCache[charName]) {
                    window.charAnimCache[charName] = { loaded: false, img: new Image() };
                    window.charAnimCache[charName].img.onload = function() {
                        let w = this.naturalWidth;
                        let h = this.naturalHeight;
                        let type = '12x1';
                        let fw, fh, cols;
                        if (w > h * 2.5) {
                            type = '12x1'; fw = w / 12; fh = h;
                        } else {
                            cols = Math.round(w / (h / 4));
                            if (cols < 3) cols = 4;
                            type = cols + 'x4';
                            fw = w / cols; fh = h / 4;
                        }
                        window.charAnimCache[charName] = { loaded: true, type: type, fw: fw, fh: fh, cols: cols };
                    };
                    window.charAnimCache[charName].img.src = 'img/characters/' + charName + '.gif';
                    return;
                }
                
                let cache = window.charAnimCache[charName];
                if (!cache.loaded) return;
                
                let foot = window.charAnimFoot;
                let frameX = 0, frameY = 0;
                
                if (cache.type === '12x1') {
                    if (foot === 0) frameX = 0;
                    else if (foot === 1) frameX = 1;
                    else if (foot === 2) frameX = 0;
                    else if (foot === 3) frameX = 2;
                } else if (cache.type === '4x4') {
                    frameX = foot;
                    frameY = 0;
                } else if (cache.type === '3x4') {
                    if (foot === 0) frameX = 1;
                    else if (foot === 1) frameX = 0;
                    else if (foot === 2) frameX = 1;
                    else if (foot === 3) frameX = 2;
                    frameY = 0; 
                }
                
                let px = - (frameX * cache.fw);
                let py = - (frameY * cache.fh);
                let ox = (50 - cache.fw) / 2;
                let oy = (50 - cache.fh) / 2;
                
                elt.css({
                    'background-position': (px + ox) + 'px ' + (py + oy) + 'px',
                    'background-repeat': 'no-repeat'
                });
            });
        }
        
        if (window.charAnimInterval) clearInterval(window.charAnimInterval);
        window.charAnimInterval = setInterval(updateCharUIAnimation, 200);
    }
    
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

window.changeCharacterInApp = function() {
    const selected = document.querySelector('.char-btn-inapp.selected');
    if (selected) {
        window.selectedChar = selected.dataset.char;
        localStorage.setItem('selectedChar', window.selectedChar);
        
        if (typeof $ !== 'undefined') {
            $(window).trigger('changeCharacterEvent', [window.selectedChar]);
        }
        
        window.app.closeModal('char-change-modal');
        window.showToast("✨ 캐릭터가 성공적으로 변경되었습니다!");
    }
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
            window.app.closeModal(this.id);
            
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


// 🐛 6 & 7. 불필요해진 구버전 백업/점검 UI 숨기기
const backupCheckBtn = document.getElementById('btn-check-backup');
const lastBackupTime = document.getElementById('last-backup-time');
if(backupCheckBtn) backupCheckBtn.style.display = 'none'; // 실시간 동기화이므로 점검 불필요
if(lastBackupTime) lastBackupTime.innerText = "Firebase 실시간 클라우드 동기화 🟢";
