// ==========================================
// 🐉 Pacemaker Pro+ : Monster Engine (Full Version)
// 원본 기능 100% 유지 + 버그 수정 통합본
// ==========================================

// 전역 상태 연결 (app.js에서 관리되는 변수들을 사용)
window.monsterData = { activeId: null, displayId: null, inventory: [] };

// ------------------------------------------
// 1. 포켓몬 API 및 전체 데이터베이스 (100% 복구)
// ------------------------------------------
window.PokeAPI = {
    cache: {},
    async getPokemon(id) {
        if (this.cache[id]) return this.cache[id];
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error("API not ok");
            const data = await res.json();
            this.cache[id] = data;
            return data;
        } catch(e) {
            console.warn("PokeAPI Error:", e);
            return null;
        }
    }
};

window.getEvolutionHours = function(spec) {
    if (!spec) return [0, 8, 19, 30];
    let isMega = spec.stages[2] !== spec.stages[3];
    return isMega ? [0, 8, 19, 30, 40] : [0, 8, 19, 30];
};

window.getMonsterSpec = function(monster) {
    if (!monster || !monster.type) return null;
    const typeData = window.MONSTER_DATA[monster.type];
    if (!typeData) return null;
    let monsterSubId = monster.monsterSubId || typeData.monsters[0].id;
    return typeData.monsters.find(m => m.id === monsterSubId) || typeData.monsters[0]; 
};

// ------------------------------------------
// 2. 몬스터 엔진 코어 (초기화 및 연산)
// ------------------------------------------
window.initMonster = function() {
    try {
        let savedData = window.getL ? window.getL('monsterData') : null;
        let current = savedData;
        let iterations = 0;
        while (typeof current === 'string' && iterations < 5) {
            try { current = JSON.parse(current); } catch(e) { break; }
            iterations++;
        }
        
        if (current && typeof current === 'object' && !Array.isArray(current) && current.inventory) {
            window.monsterData = current;
        } else {
            let id = "m_" + Date.now();
            window.monsterData = { 
                activeId: null, displayId: id,
                inventory: [{ id: id, type: "fire", monsterSubId: "fire_charizard", status: "egg", startDate: "", totalSeconds: 0 }]
            };
        }
        
        if (!window.monsterData.inventory || window.monsterData.inventory.length === 0) {
             let id = "m_" + Date.now();
             window.monsterData.inventory = [{ id: id, type: "fire", monsterSubId: "fire_charizard", status: "egg", startDate: "", totalSeconds: 0 }];
             window.monsterData.displayId = id;
        }

        window.checkMonsterCompletion();
        window.updateMonsterUI();
        if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData));
    } catch(err) {
        console.error("✗ 몬스터 초기화 오류:", err);
        let id = "m_" + Date.now();
        window.monsterData = { activeId: null, displayId: id, inventory: [{ id: id, type: "fire", monsterSubId: "fire_charizard", status: "egg", startDate: "", totalSeconds: 0 }]};
        if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData));
        window.updateMonsterUI(); 
    }
};

window.calculateActiveMonsterExp = function(monster) {
    if(monster.status === "retired") return monster.totalSeconds || 0;
    if(monster.status === "egg") return 0;

    let totalSeconds = 0;
    let startObj = new Date(monster.startDate + "T00:00:00");
    let todayStr = window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0];
    let todayObj = new Date(todayStr + "T00:00:00");

    if (isNaN(startObj.getTime())) startObj = new Date(todayStr + "T00:00:00");

    for (let d = new Date(startObj); d <= todayObj; d.setDate(d.getDate() + 1)) {
        let y = d.getFullYear();
        let m = String(d.getMonth()+1).padStart(2, '0');
        let dNum = String(d.getDate()).padStart(2, '0');
        let dStr = `${y}-${m}-${dNum}`;
        
        // 🐛 [버그 5 픽스 적용] 
        // 오늘의 경험치는 달력에 남겨진 옛날 시간이 아닌, 실시간 체크박스(blockSeconds)에서 즉시 계산합니다.
        if (dStr === todayStr && window.blockSeconds) {
            let safeBlockSeconds = Array.isArray(window.blockSeconds) ? window.blockSeconds : Array(48).fill(0);
            let todaySecs = safeBlockSeconds.reduce((a, b) => Number(a) + Number(b), 0);
            totalSeconds += (isNaN(todaySecs) ? 0 : todaySecs);
        } else if (window.dailyRecords && window.dailyRecords[dStr]) {
            let rec = window.dailyRecords[dStr];
            if(rec.totalTime) {
                let parts = rec.totalTime.split('h');
                let h = parseInt(parts[0]) || 0;
                let min = parseInt(parts[1]?.replace('m', '').trim()) || 0;
                totalSeconds += (h * 3600) + (min * 60);
            }
        }
    }
    let offset = monster.startOffsetSeconds || 0;
    return Math.max(0, totalSeconds + (monster.bonusSeconds || 0) - offset);
};

window.checkMonsterCompletion = function() {
    if (!window.monsterData.activeId) return;
    let active = window.monsterData.inventory.find(m => m.id === window.monsterData.activeId);
    if (!active || active.status !== "active") return;
    
    // 메모리 누수 방지용 가비지 컬렉터 유지
    if (window.monsterData.inventory.length > 300) {
        let eggs = window.monsterData.inventory.filter(m => m.status === 'egg');
        let activeList = window.monsterData.inventory.filter(m => m.status === 'active');
        let retired = window.monsterData.inventory.filter(m => m.status === 'retired');
        
        if (retired.length > 250) {
            retired.sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
            retired = retired.slice(-250);
            window.monsterData.inventory = [...activeList, ...eggs, ...retired];
        }
    }

    let totalSeconds = window.calculateActiveMonsterExp(active); 
    let totalHours = Math.floor(totalSeconds / 3600);
    let spec = window.getMonsterSpec(active);
    if (!spec) return;
    
    let evoHours = window.getEvolutionHours(spec);
    let maxHours = evoHours[evoHours.length - 1]; 

    if (totalHours >= maxHours) {
        active.status = "retired";
        active.endDate = window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0];
        active.totalSeconds = totalSeconds; 
        window.monsterData.activeId = null;
        
        let newId = "m_" + Date.now();
        const types = Object.keys(window.MONSTER_DATA);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const typeData = window.MONSTER_DATA[randomType];
        const randomMonster = typeData.monsters[Math.floor(Math.random() * typeData.monsters.length)].id;
        
        window.monsterData.inventory.push({ id: newId, type: randomType, monsterSubId: randomMonster, status: "egg", startDate: "", totalSeconds: 0 });
        
        if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
        if(window.triggerAutoSync) window.triggerAutoSync(true); 
        if(window.showToast) window.showToast("🎉 파트너가 최종 진화를 마쳤습니다! 도감에 보존되며 새로운 알을 획득했습니다!");
        
        let bagModal = document.getElementById('monster-bag-modal');
        if(bagModal && bagModal.style.display === 'flex' && window.openMonsterBag) {
            window.openMonsterBag(true);
        }
    }
};