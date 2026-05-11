// ==========================================
// 🏆 업적 및 뱃지 시스템 (achievements.js)
// ==========================================

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