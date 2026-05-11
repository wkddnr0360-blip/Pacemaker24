// ==========================================
// 📅 캘린더 및 타이머 기록 로직 (calendar.js)
// ==========================================

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
                badgeHtml += `<div class="cal-badge actual ${isHigh ? 'high' : ''}">${hrs > 0 ? hrs + 'h' : ''}${mins}m</div>`;
            }
        }
        if (rec && (rec.diary || rec.todo || (rec.notes && rec.notes.some(n=>n.trim()!=="")))) {
            hasData = true;
            let icons = "";
            if(rec.diary) icons += "📝";
            if(rec.todo) icons += "✅";
            if(icons === "") icons = "💬";
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
    let isToday = dateStr === window.Utils.getLogicalDateString();
    
    content += `
        <div style="background:var(--bg-sec); padding:16px; border-radius:16px; margin-bottom:15px; border:1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:14px; font-weight:800; color:var(--text-main);">⏱️ 몰입 시간</span>
                ${isToday ? '' : `<button onclick="window.editPastTime('${dateStr}')" style="background: rgba(0, 149, 246, 0.1); color: var(--primary); border: none; padding: 6px 14px; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">✏️ 시간 수정</button>`}
            </div>
            <div style="display:flex; justify-content:space-around; text-align:center; background:var(--surface); padding:12px; border-radius:12px; border:1px solid var(--border-color);">
                <div><span style="display:block; font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:4px;">목표 시간</span><strong style="font-size:18px; color:var(--text-muted); font-weight:900; letter-spacing:-1px;">${tTarget}</strong></div>
                <div style="width:1px; background:var(--border-color); margin:0 10px;"></div>
                <div><span style="display:block; font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:4px;">달성 시간</span><strong style="font-size:18px; color:var(--primary); font-weight:900; letter-spacing:-1px;">${tTime}</strong></div>
        </div>
    `;
        
    const todayStr = window.Utils.getLogicalDateString();
    let monInfoHTML = '';
    
    // ✨ 포켓몬 데이터 복구 (스냅샷 우선 사용으로 완벽한 엑박 해결)
    if (rec.partner_image_url) {
        let imgId = 'rec-mon-' + Date.now();
        let growthBadge = tTime !== "00h 00m" ? `<span style="background:rgba(16, 185, 129, 0.15); color:var(--success); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:900; white-space:nowrap;">+${tTime} 성장 🚀</span>` : '';
        monInfoHTML = `
            <div style="background:var(--bg-sec); border:1px solid var(--border-color); border-radius:18px; padding:18px; margin-bottom:15px; display:flex; align-items:center; gap:15px; position:relative; overflow:hidden; flex-shrink:0;">
                <img id="${imgId}" src="${rec.partner_image_url}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${rec.partner_poke_id || 1}.png';" class="float-anim" style="width:65px; height:65px; object-fit:contain; z-index:2; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.1)); cursor:pointer;" onclick="window.playPokemonCry(${rec.partner_poke_id || 1}, this, ${rec.partner_status?.includes('메가') || false}, '${rec.partner_name}', ${rec.partner_poke_id || 1})">
                <div style="z-index:2;">
                    <div style="font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:2px;">그날 함께한 파트너</div>
                    <div style="font-size:16px; font-weight:900; color:var(--text-main); margin-bottom:4px;">${rec.partner_name}</div>
                    <div style="font-size:12px; color:var(--primary); font-weight:700; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span style="white-space:nowrap;">#${rec.partner_status} 육성 중</span>
                        ${growthBadge}
                    </div>
                </div>
            </div>`;
    } 
    else if (dateStr <= todayStr && window.monsterData && window.monsterData.inventory) {
        let monAtTime = window.monsterData.inventory.find(m => {
            if (m.status === 'egg') return false;
            return dateStr >= m.startDate && dateStr <= (m.endDate || "9999-12-31");
        });

        if (monAtTime) {
            let spec = window.getMonsterSpec ? window.getMonsterSpec(monAtTime) : null;
            if (spec) {
                let currentStageIdx = monAtTime.selectedStage || 0;
                let pokeId = spec.pokeIds[currentStageIdx];
                let fallbackUrl = pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
                let imgUrl = fallbackUrl;
                let isShiny = !!monAtTime.isShiny;
                let imgId = 'rec-mon-' + Date.now();
                let cachedData = window.PokeAPI && window.PokeAPI.cache ? window.PokeAPI.cache[pokeId] : null;
                if (cachedData && cachedData.name) {
                    let sdName = cachedData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh');
                    imgUrl = isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`;
                } else {
                    window.PokeAPI.getPokemon(pokeId).then(data => {
                        if (data && data.name) {
                            let sdName = data.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh');
                            let targetImg = document.getElementById(imgId);
                            if (targetImg) targetImg.src = isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`;
                        }
                    });
                }
                
                let growthBadge = tTime !== "00h 00m" ? `<span style="background:rgba(16, 185, 129, 0.15); color:var(--success); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:900; white-space:nowrap;">+${tTime} 성장 🚀</span>` : '';

                monInfoHTML = `
                    <div style="background:var(--bg-sec); border:1px solid var(--border-color); border-radius:18px; padding:18px; margin-bottom:15px; display:flex; align-items:center; gap:15px; position:relative; overflow:hidden; flex-shrink:0;">
                        <img id="${imgId}" src="${imgUrl}" onerror="if(this.src !== '${fallbackUrl}') this.src='${fallbackUrl}';" class="float-anim" style="width:65px; height:65px; object-fit:contain; z-index:2; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.1)); cursor:pointer;" onclick="window.playPokemonCry(${pokeId}, this, ${currentStageIdx >= 3}, '${spec.name}', ${spec.pokeIds[0]})">
                        <div style="z-index:2;">
                            <div style="font-size:11px; color:var(--text-muted); font-weight:800; margin-bottom:2px;">그날 함께한 파트너</div>
                            <div style="font-size:16px; font-weight:900; color:var(--text-main); margin-bottom:4px;">${monAtTime.nickname || spec.name}</div>
                            <div style="font-size:12px; color:var(--primary); font-weight:700; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <span style="white-space:nowrap;">#${spec.stages[currentStageIdx]} 육성 중</span>
                                ${growthBadge}
                            </div>
                        </div>
                    </div>`;
            }
        }
    }
    content += monInfoHTML;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('record-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
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