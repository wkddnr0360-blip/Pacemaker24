// ==========================================
// 📚 공부 시간표 및 디데이, 알림 기능 (study.js)
// ==========================================

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
    if(window.updateMonsterUI) window.updateMonsterUI(); 
};

window.syncTodayRecord = function() {
    if (!window.activeUser) return;
    const dateStr = window.Utils.getLogicalDateString();
    if (!window.dailyRecords[dateStr]) window.dailyRecords[dateStr] = { targetTime: "00h 00m", totalTime: "00h 00m" };
    window.dailyRecords[dateStr].targetTime = window.targetStudyString; window.dailyRecords[dateStr].totalTime = window.totalStudyString;
    
    // ✨ 스냅샷 방식(역정규화) 추가: 엑박 방지를 위해 현재 전시 중인 포켓몬 상태를 박제
    if (window.monsterData && window.monsterData.displayId) {
        let myMon = window.monsterData.inventory.find(x => x.id === window.monsterData.displayId);
        if (myMon && myMon.status !== 'egg') {
            let spec = window.getMonsterSpec(myMon);
            if (spec) {
                let currentStageIdx = myMon.selectedStage || 0;
                let pokeId = spec.pokeIds[currentStageIdx];
                let isShiny = !!myMon.isShiny;
                
                // Fallback URL
                let fallbackUrl = pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
                let imgUrl = fallbackUrl;
                let cachedData = window.PokeAPI && window.PokeAPI.cache ? window.PokeAPI.cache[pokeId] : null;
                if (cachedData && cachedData.name) {
                    let sdName = cachedData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh');
                    imgUrl = isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`;
                }
                
                window.dailyRecords[dateStr].partner_id = myMon.id;
                window.dailyRecords[dateStr].partner_name = myMon.nickname || spec.name;
                window.dailyRecords[dateStr].partner_status = spec.stages[currentStageIdx];
                window.dailyRecords[dateStr].partner_image_url = imgUrl;
                window.dailyRecords[dateStr].partner_poke_id = pokeId;
            }
        }
    }
    
    window.setL('dailyRecords', JSON.stringify(window.dailyRecords));
};

window.updateDashboardTodoAlert = function() {
    const alertIcon = document.getElementById('todo-alert-icon');
    if(!alertIcon) return;
    const todayStr = window.Utils.getLogicalDateString();
    let upcomingDate = null;
    let sortedDates = Object.keys(window.dailyRecords).sort();
    for(let d of sortedDates) { if (d >= todayStr && window.dailyRecords[d].todo) { upcomingDate = d; break; } }
    
    if (upcomingDate) {
        alertIcon.style.display = 'flex'; alertIcon.dataset.targetDStr = upcomingDate;
        let tempDiv = document.createElement('div'); tempDiv.innerHTML = window.dailyRecords[upcomingDate].todo;
        let pureText = tempDiv.textContent || tempDiv.innerText || "";
        alertIcon.title = `[${upcomingDate === todayStr ? "오늘" : upcomingDate.substring(5).replace('-','/')}] ${pureText.substring(0, 20)}${pureText.length > 20 ? '...' : ''}`;
    } else { alertIcon.style.display = 'none'; }
};

window.teleportToTodo = function(dStr) {
    if(dStr === window.Utils.getLogicalDateString()) { window.switchView('study'); setTimeout(() => window.openTextModal('todo'), 100); } 
    else { window.switchView('calendar'); window.openRecordModal(dStr); }
};

window.updateDdayUI = function() {
    const badge = document.getElementById('dday-badge');
    if (!badge) return;
    if (!window.ddayConfig || !window.ddayConfig.date) { badge.innerText = "⏳ 디데이 설정 +"; return; }
    const today = new Date(window.Utils.getLogicalDateString() + "T00:00:00");
    const target = new Date(window.ddayConfig.date + "T00:00:00");
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    let dText = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? `D-Day` : `D+${Math.abs(diffDays)}`);
    badge.innerHTML = `<span style="font-size:10px; opacity:0.8; margin-right:4px;">${window.Utils.escapeHTML(window.ddayConfig.title)}</span> ${dText}`;
};

window.openDdayModal = function() { if (window.ddayConfig) { document.getElementById('dday-title-input').value = window.ddayConfig.title || ""; document.getElementById('dday-date-input').value = window.ddayConfig.date || ""; } document.getElementById('dday-modal').style.display = 'flex'; document.body.style.overflow = 'hidden'; };
window.saveDday = function() { window.ddayConfig.title = document.getElementById('dday-title-input').value.trim(); window.ddayConfig.date = document.getElementById('dday-date-input').value; if(!window.ddayConfig.title || !window.ddayConfig.date) return window.showToast("내용을 모두 입력해주세요."); window.setL('ddayConfig', JSON.stringify(window.ddayConfig)); window.updateDdayUI(); window.app.closeModal('dday-modal'); window.showToast("디데이가 설정되었습니다."); window.triggerAutoSync(); };
window.clearDday = function() { window.ddayConfig = { title: "", date: "" }; window.setL('ddayConfig', JSON.stringify(window.ddayConfig)); window.updateDdayUI(); window.app.closeModal('dday-modal'); window.triggerAutoSync(); };