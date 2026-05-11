// ==========================================
// 🧪 실험실 (Lab) 전용 도구 및 마이그레이션 (lab.js)
// ==========================================

window.labAddEgg = function() {
    const types = Object.keys(window.MONSTER_DATA);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const typeData = window.MONSTER_DATA[randomType];
    const randomMonster = typeData.monsters[Math.floor(Math.random() * typeData.monsters.length)].id;
    let newId = "m_" + Date.now();
    window.monsterData.inventory.push({ id: newId, type: randomType, monsterSubId: randomMonster, status: "egg", startDate: "", totalSeconds: 0 });
    document.getElementById('settings-modal').style.display = 'none';
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
    window.updateMonsterUI(); 
    if(window.triggerAutoSync) window.triggerAutoSync();
    if(window.showToast) window.showToast("🎁 [실험실] 임의의 파트너가 가방에 추가되었습니다.");
};

window.labAddTime = function() {
    if(!window.monsterData.activeId) return window.showToast ? window.showToast("현재 육성 중인 몬스터가 없습니다.") : null;
    let m = window.monsterData.inventory.find(x => x.id === window.monsterData.activeId);
    m.bonusSeconds = (m.bonusSeconds || 0) + (10 * 3600);
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
    window.checkMonsterCompletion(); window.updateMonsterUI(); 
    if(window.triggerAutoSync) window.triggerAutoSync();
    if(window.showToast) window.showToast("⏳ [실험실] 현재 몬스터 경험치 +10시간");
};

window.labInstantEvolve = function() {
    if(!window.monsterData.activeId) return window.showToast ? window.showToast("현재 육성 중인 몬스터가 없습니다.") : null;
    let m = window.monsterData.inventory.find(x => x.id === window.monsterData.activeId);
    m.bonusSeconds = (m.bonusSeconds || 0) + (20 * 3600);
    document.getElementById('settings-modal').style.display = 'none';
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
    window.checkMonsterCompletion(); window.updateMonsterUI(); 
    if(window.triggerAutoSync) window.triggerAutoSync();
    if(window.showToast) window.showToast("⚡ [실험실] 다음 단계로 진화 경험치 보너스 적용!");
};

window.labChangeType = function() {
    if(!window.monsterData.activeId) return window.showToast ? window.showToast("현재 육성 중인 몬스터가 없습니다.") : null;
    let m = window.monsterData.inventory.find(x => x.id === window.monsterData.activeId);
    const types = Object.keys(window.MONSTER_DATA);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const typeData = window.MONSTER_DATA[randomType];
    const randomMonster = typeData.monsters[Math.floor(Math.random() * typeData.monsters.length)].id;
    m.type = randomType; m.monsterSubId = randomMonster;
    document.getElementById('settings-modal').style.display = 'none';
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
    window.updateMonsterUI(); 
    if(window.triggerAutoSync) window.triggerAutoSync();
    if(window.showToast) window.showToast(`✨ [실험실] 속성이 [${window.MONSTER_DATA[randomType].name}]으로 변경되었습니다!`);
};

window.labResetMonster = function() {
    if(!confirm("가방 내 모든 몬스터 기록을 삭제하시겠습니까?")) return;
    let id = "m_" + Date.now();
    window.monsterData = { activeId: null, displayId: id, inventory: [{ id: id, type: "fire", monsterSubId: "fire_charizard", status: "egg", startDate: "", totalSeconds: 0 }] };
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
    window.updateMonsterUI(); 
    if(window.triggerAutoSync) window.triggerAutoSync();
    if(window.showToast) window.showToast("🗑️ [실험실] 몬스터 데이터가 초기화되었습니다.");
};

window.labShowAllPokedex = function() {
    // ... [monster.js 351번째 줄 로직 동일] ...
};

window.labInstantHatch = function() {
    // ... [monster.js 379번째 줄 로직 동일] ...
};

window.labMigrateData = async function() {
    const gasUrl = "https://script.google.com/macros/s/AKfycbxx1toXSR7ZFvLUPJ948GiCvppDyUiwjDZhYEHo9f8IgqRekEbGVgWsorB4nEhxFr7I/exec";
    if (!window.activeUser) return window.showToast("먼저 로그인이 필요합니다.");
    if (!confirm(`[데이터 이사] 현재 로그인된 '${window.activeUser}' 계정으로 이전 서버의 데이터를 가져오시겠습니까?\n가져온 데이터는 현재 기기의 기록을 덮어씌웁니다.`)) return;
    window.showLoading(true, `이전 서버에서 '${window.activeUser}' 데이터 찾는 중... 🚚`);
    let res = await window.FirebaseEngine.migrateFromGAS(gasUrl, window.activeUser);
    if (res.success) {
        window.saveUserLocalData(res.data);
        window.showToast("✅ 데이터 이사 성공! 클라우드에 자동 동기화됩니다.");
        window.executeSafeSync().then(() => { setTimeout(() => { alert("기록 복구가 완료되었습니다. 변경사항을 적용하기 위해 새로고침합니다."); location.reload(); }, 1000); });
    } else {
        window.showLoading(false);
        alert(`이사 실패: ${res.message}\n\n* GAS 배포 설정이 '모든 사용자(Anyone)'로 되어있는지 확인해주세요.`);
    }
};