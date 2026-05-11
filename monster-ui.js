// ==========================================
// 🐉 Pacemaker Pro+ : Monster UI
// ==========================================

window.updateMonsterUI = async function() {
    try {
        const titleEl = document.getElementById('monster-title');
        const emojiEl = document.getElementById('monster-emoji');
        const descEl = document.getElementById('monster-desc');

        if (!window.monsterData || !window.monsterData.inventory || window.monsterData.inventory.length === 0) {
            if(titleEl) titleEl.innerText = "파트너 없음";
            if(descEl) descEl.innerText = "가방에서 알을 부화시켜보세요!";
            if(emojiEl) emojiEl.innerHTML = `<div class="monster-display" style="background:#eee; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:40px;">⚪</div>`;
            return;
        }

        let displayMonster = window.monsterData.inventory.find(m => m.id === window.monsterData.displayId) || window.monsterData.inventory[0];
        if (!displayMonster) return;

        let totalSeconds = window.calculateActiveMonsterExp(displayMonster);
        let totalHoursFloat = totalSeconds / 3600;
        let totalHours = Math.floor(totalHoursFloat); 
    
        let typeData = window.MONSTER_DATA[displayMonster.type];
        if (!typeData) return;
        let monsterSpec = window.getMonsterSpec(displayMonster);
        if (!monsterSpec) return;
        
        let evoHours = window.getEvolutionHours(monsterSpec);
        let maxHours = evoHours[evoHours.length - 1];
        
        let maxStageIdx = 0;
        for (let i = evoHours.length - 1; i >= 0; i--) {
            if (totalHours >= evoHours[i]) { maxStageIdx = i; break; }
        }
        
        if (displayMonster.status !== "egg") {
            let highest = displayMonster.highestReachedStage !== undefined ? displayMonster.highestReachedStage : (displayMonster.selectedStage || 0);
            if (displayMonster.selectedStage === undefined) {
                displayMonster.selectedStage = maxStageIdx;
                displayMonster.highestReachedStage = maxStageIdx;
                if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
            } else if (maxStageIdx > highest) {
                
                // ✨ 진화 감지 시 화려한 팝업 띄우기
                let newPokeId = monsterSpec.pokeIds[maxStageIdx];
                let oldPokeId = monsterSpec.pokeIds[highest];
                // 알에서 깨어나는 상태라면 이전 모습 표기를 생략합니다.
                if (displayMonster.status === "egg") oldPokeId = null;
                if(window.showEvolutionPopup) {
                    window.showEvolutionPopup(monsterSpec.name, monsterSpec.stages[maxStageIdx], newPokeId, maxHours, displayMonster.id, oldPokeId);
                }
                
                displayMonster.highestReachedStage = maxStageIdx;
                displayMonster.selectedStage = maxStageIdx;
                if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
            } else if (maxStageIdx < highest) {
                displayMonster.highestReachedStage = maxStageIdx;
                if (displayMonster.selectedStage > maxStageIdx) displayMonster.selectedStage = maxStageIdx;
                if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData)); 
            }
        }
        
        let currentStageIdx = displayMonster.selectedStage !== undefined ? displayMonster.selectedStage : maxStageIdx;
        if (currentStageIdx >= monsterSpec.pokeIds.length) currentStageIdx = monsterSpec.pokeIds.length - 1;
        if (currentStageIdx < 0) currentStageIdx = 0;
        
        // 홈 화면 포켓몬 크기(Scale) 동적 조절 변수 추가
        let baseScale = 1.0;
        if (currentStageIdx === 0) baseScale = 0.65;
        else if (currentStageIdx === 1) baseScale = 0.85;
        else if (currentStageIdx === 2) baseScale = 1.05;
        else baseScale = 1.2;
        let isSingle = monsterSpec.stages[0] === monsterSpec.stages[monsterSpec.stages.length - 1];
        let isTwo = !isSingle && monsterSpec.stages[1] === monsterSpec.stages[monsterSpec.stages.length - 1];
        if (isSingle) { baseScale = 1.05; }
        else if (isTwo) { baseScale = currentStageIdx === 0 ? 0.85 : 1.1; }
        else {
            if (currentStageIdx === 0) baseScale = 0.65;
            else if (currentStageIdx === 1) baseScale = 0.85;
            else if (currentStageIdx === 2) baseScale = 1.05;
            else baseScale = 1.2;
        }

        let stageName = displayMonster.status === "egg" ? "부화 전" : monsterSpec.stages[currentStageIdx];
        let bgGradient = typeData.bgGradients[currentStageIdx] || typeData.bgGradients[0];
        let effectFilter = typeData.effects[currentStageIdx] || typeData.effects[0];
        let megaClass = currentStageIdx >= 3 ? (monsterSpec.megaClass || "") : "";
        let isMax = totalHours >= maxHours;
        let nextHours = isMax ? null : (evoHours[maxStageIdx + 1] || maxHours);
        let progressPercent = 100;
        let descText = "";
        let pulseClass = `pulse-stage-${currentStageIdx + 1}`;
        let actualTypeHtml = "";

        if (displayMonster.status === "egg") {
            descText = "⚪ 부화 대기 중 (가방에서 속성 선택)";
            bgGradient = "linear-gradient(135deg, #E8E8E8 0%, #F5F5F5 100%)";
            effectFilter = "brightness(0.9)";
            pulseClass = "pulse-egg";
            progressPercent = 0;
        } else if (displayMonster.status === "retired") {
            descText = `📖 도감 등록 완료 (${displayMonster.startDate.slice(2).replace(/-/g,'.')} ~ ${displayMonster.endDate?.slice(2).replace(/-/g,'.') || '완료'})`;
            bgGradient = "linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)";
            effectFilter = "brightness(1.1) saturate(1.3)";
            pulseClass = "pulse-retired";
            progressPercent = 100;
        } else {
            if (isMax) {
                descText = `👑 육성 완료! (${maxHours}시간 돌파)`;
                pulseClass = "pulse-max";
                effectFilter = "brightness(1.4) drop-shadow(0 0 40px rgba(255,215,0,1)) saturate(1.8)";
                bgGradient = "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF4500 100%)";
                stageName = "👑 마스터 (MAX)";
            } else if (nextHours) {
                let prevHours = evoHours[maxStageIdx];
                let hoursInStage = totalHoursFloat - prevHours;
                let requiredHours = nextHours - prevHours;
                progressPercent = Math.min(100, (hoursInStage / requiredHours) * 100);
                let hoursLeft = Math.max(0, nextHours - totalHoursFloat).toFixed(1);
                
                if (maxStageIdx >= 3) descText = `🌟 메가진화 달성! 졸업까지 ${hoursLeft}시간 남음`;
                else descText = `⏳ 다음 진화까지 ${hoursLeft}시간 | 현재 진행: ${totalHoursFloat.toFixed(1)}시간`;
            }
        }

        let pokeId = monsterSpec.pokeIds[currentStageIdx];
        let isShiny = !!displayMonster.isShiny; 
        let shinyMark = isShiny ? `<span style="color:#fbbf24; text-shadow:0 0 5px rgba(251,191,36,0.8);">✨</span> ` : "";
        
        // 🐛 애니메이션 외곽선(Matte) 픽셀 깨짐 방지를 위해 부드러운 그림자만 적용합니다.
        let protectionShadow = isShiny ? 'drop-shadow(0 4px 10px rgba(251,191,36,0.4))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))';
        
        // 🐛 [버그 4 & 7 방어 로직] 10000번 이상 메가진화도 공식 Artwork fallback 적용
        let fallbackUrl = pokeId >= 10000 
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
        let imageUrl = fallbackUrl;

        if (displayMonster.status !== "egg") {
            try {
                let pokeData = await window.PokeAPI.getPokemon(pokeId);
                if (pokeData && pokeData.name) {
                    if (pokeData.types) {
                        let typesStr = pokeData.types.map(t => window.TYPE_TRANSLATION && window.TYPE_TRANSLATION[t.type.name] ? window.TYPE_TRANSLATION[t.type.name] : t.type.name.toUpperCase()).join('/');
                        actualTypeHtml = `<span style="display:inline-block; font-size:10px; color:var(--text-main); background:var(--bg-sec); padding:2px 6px; border-radius:8px; border:1px solid var(--border-color); margin-left:4px;">${typesStr}</span>`;
                    }
                    let sdName = pokeData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh');
                    // ✨ 생동감 넘치는 Showdown 애니메이션 적용!
                    imageUrl = isShiny 
                        ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif`
                        : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`;
                }
            } catch (err) { /* silent fail, use fallback url */ }
        }

        if (emojiEl) {
            let pureName = displayMonster.nickname ? displayMonster.nickname : monsterSpec.name;
            let imagePart = displayMonster.status === "egg" 
                ? `<div style="font-size: 50px; text-align: center; line-height: 1;">⚪</div>`
                : `<img src="${imageUrl}" style="width: 100px; height: 100px; max-width: 100%; max-height: 100%; object-fit: contain; transform: scale(${baseScale}); filter: ${protectionShadow} drop-shadow(0 4px 10px rgba(0,0,0,0.3)); cursor: pointer;" onclick="event.stopPropagation(); window.playPokemonCry(${pokeId}, this, ${currentStageIdx >= 3}, '${pureName}', ${monsterSpec.pokeIds[2] || monsterSpec.pokeIds[0]})" onerror="if(this.src !== '${fallbackUrl}') { this.src='${fallbackUrl}'; } else { this.style.display='none'; this.nextElementSibling.style.display='block'; }"><div style="display:none; font-size:50px; text-align:center;">🐾</div>`;
            emojiEl.innerHTML = `<div class="monster-display ${pulseClass} ${megaClass}" style="background: ${bgGradient}; filter: ${effectFilter}; border-radius: 16px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">${imagePart}</div>`;
        }

        if (titleEl) {
            let displayName = displayMonster.status === "egg" ? "미확인 알" : (displayMonster.nickname ? `${shinyMark}${displayMonster.nickname} <span style="font-size:11px; opacity:0.7;">(${monsterSpec.name})</span>` : `${shinyMark}${monsterSpec.name}`);
            titleEl.innerHTML = `<span style="color:var(--primary);">${displayName}</span> <span style="opacity:0.6; font-size:12px;">|</span> ${currentStageIdx >= 3 ? '⭐ 메가진화' : stageName} ${actualTypeHtml}`;
        }

        let progressEl = document.getElementById('monster-progress');
        if (progressEl) progressEl.style.width = `${progressPercent}%`;
        if (descEl) descEl.innerText = descText;

        let floatImg = document.getElementById('float-mon-img');
        let floatRing = document.getElementById('float-mon-ring');
        let floatEgg = document.getElementById('float-mon-egg');

        if (floatImg && floatRing && floatEgg) {
            if (displayMonster.status === "egg") {
                floatImg.style.display = 'none';
                floatEgg.style.display = 'block';
                floatRing.style.strokeDashoffset = 169.6; 
                floatRing.style.stroke = "var(--border-color)";
            } else {
                floatEgg.style.display = 'none';
                floatImg.style.display = 'block';
                floatImg.src = imageUrl;
                
                let ringCircumference = 169.6;
                let offset = ringCircumference - (ringCircumference * (progressPercent / 100));
                floatRing.style.strokeDashoffset = offset;
                
                if (isMax || displayMonster.status === "retired") floatRing.style.stroke = "var(--success)";
                else floatRing.style.stroke = "var(--primary)";
            }
        }
    } catch(err) {
        console.error("Monster UI Update Error:", err);
    }
};

// ------------------------------------------
// 3. UI 및 상호작용 (가방, 부화, 도감 등)
// ------------------------------------------
window.filterAndRenderBag = function(preserveScroll = false) {
    if (window.bagRenderTimeout) clearTimeout(window.bagRenderTimeout);
    window.bagRenderTimeout = setTimeout(() => { window.openMonsterBag(preserveScroll); }, 200);
};

window.openMonsterBag = async function(preserveScroll = false) {
    try {
        const content = document.getElementById('monster-bag-content');
        const searchInput = document.getElementById('monster-search-input');
        if (!content) return;
        
        let scrollPos = preserveScroll ? content.scrollTop : 0;
        if (!preserveScroll && !searchInput?.value) {
            content.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">가방을 열고 있습니다... 🎒</div>';
        }
        
        let modal = document.getElementById('monster-bag-modal');
        if (modal.style.display !== 'flex') {
            if (searchInput) searchInput.value = '';
            modal.style.display = 'flex'; document.body.style.overflow = 'hidden';
        }
        
        let searchTerm = searchInput?.value.toLowerCase().trim() || '';
        let inventory = window.monsterData.inventory;

        if (searchTerm) {
            inventory = window.monsterData.inventory.filter(m => {
                const spec = window.getMonsterSpec(m);
                if (!spec) return false;
                return `${spec.name} ${m.nickname || ''} ${spec.stages.join(' ')}`.toLowerCase().includes(searchTerm);
            });
        }

        let html = '';
        let eggs = inventory.filter(m => m.status === "egg");
        let active = inventory.filter(m => m.status === "active");
        let retired = inventory.filter(m => m.status === "retired");

        html += `<div style="font-weight:800; color:var(--primary); margin-bottom:10px;">🔥 현재 육성 중</div>`;
        if (active.length > 0) {
            let activeHtmls = await Promise.all(active.map(m => window.generateBagItemHtml(m)));
            html += activeHtmls.filter(h => h).join('');
        } else {
            html += `<div style="font-size:13px; color:var(--text-muted); padding:15px; text-align:center; background:var(--surface); border-radius:12px; margin-bottom:15px;">육성 중인 몬스터가 없습니다. 부화시켜보세요!</div>`;
        }

        html += `<div style="font-weight:800; color:var(--text-main); margin-bottom:10px; margin-top:20px;">⚪ 부화 대기</div>`;
        if (eggs.length > 0) {
            let eggHtmls = await Promise.all(eggs.map(m => window.generateBagItemHtml(m)));
            html += eggHtmls.filter(h => h).join('');
        } else {
            html += `<div style="font-size:13px; color:var(--text-muted); padding:15px; text-align:center; background:var(--surface); border-radius:12px; margin-bottom:15px;">대기 중인 알이 없습니다. (육성을 완료하면 지급됩니다)</div>`;
        }

        let totalUnique = new Set(window.monsterData.inventory.filter(m => m.status === 'retired').map(m => m.monsterSubId)).size;
        let totalAvailable = Object.values(window.MONSTER_DATA).reduce((acc, t) => acc + t.monsters.length, 0);
        
        html += `<div style="font-weight:800; color:var(--text-main); margin-bottom:15px; margin-top:25px; display:flex; justify-content:space-between; align-items:center;">
                    <span>📖 수집한 몬스터</span>
                    <span style="font-size:12px; color:var(--primary); background:rgba(0,149,246,0.1); padding:4px 10px; border-radius:12px;">수집률 ${totalUnique}/${totalAvailable} (${Math.round((totalUnique/totalAvailable)*100)}%)</span>
                 </div>`;
                 
        if (retired.length > 0) {
            for (let typeKey of Object.keys(window.MONSTER_DATA)) {
                let typeRetired = retired.filter(m => m.type === typeKey);
                if (typeRetired.length > 0) {
                    let tData = window.MONSTER_DATA[typeKey];
                    html += `<div style="font-size:12px; font-weight:800; color:white; background:rgba(${tData.color},0.9); padding:5px 12px; border-radius:10px; margin:15px 0 10px 0; display:inline-block; box-shadow:0 2px 5px rgba(${tData.color},0.3);">🧬 ${tData.name} 속성</div>
                             <div class="bag-grid-container">`;
                    let retiredHtmls = await Promise.all(typeRetired.map(m => window.generateBagItemHtml(m, 'grid')));
                    html += retiredHtmls.filter(h => h).join('');
                    html += `</div>`;
                }
            }
        } else {
            html += `<div style="font-size:13px; color:var(--text-muted); padding:15px; text-align:center; background:var(--surface); border-radius:12px; margin-bottom:15px;">아직 육성을 완료한 몬스터가 없습니다.</div>`;
        }

        if (searchTerm && inventory.length === 0) {
            html = `<div style="text-align:center; padding:40px; color:var(--text-muted);">"<strong>${window.Utils ? window.Utils.escapeHTML(searchTerm) : searchTerm}</strong>"에 대한 검색 결과가 없습니다.</div>`;
        }

        content.innerHTML = html;
        if (preserveScroll) content.scrollTop = scrollPos;
    } catch(err) {
        console.error('[openMonsterBag] Error:', err);
    }
};

window.generateBagItemHtml = async function(m, layout = 'list') {
    try {
        if (!m || !m.type || !m.monsterSubId) return "";
        let isDisplay = m.id === window.monsterData.displayId;
        let typeData = window.MONSTER_DATA[m.type];
        if (!typeData) return "";
        let monsterSpec = window.getMonsterSpec(m);
        if (!monsterSpec) return "";
        
        let evoHours = window.getEvolutionHours(monsterSpec);
        let maxHours = evoHours[evoHours.length - 1];
        let totalHours = Math.floor(window.calculateActiveMonsterExp(m) / 3600);
        let maxStageIdx = 0;
        for (let i = evoHours.length - 1; i >= 0; i--) {
            if (totalHours >= evoHours[i]) { maxStageIdx = i; break; }
        }
        
        let currentStageIdx = m.selectedStage !== undefined ? m.selectedStage : maxStageIdx;
        if (currentStageIdx >= monsterSpec.pokeIds.length) currentStageIdx = monsterSpec.pokeIds.length - 1;
        if (currentStageIdx < 0) currentStageIdx = 0;
        
        let pokeId = monsterSpec.pokeIds[currentStageIdx] || 1; 
        let isShiny = !!m.isShiny;
        let shinyMark = isShiny ? `<span style="color:#fbbf24; text-shadow:0 0 5px rgba(251,191,36,0.8);">✨</span> ` : "";
        
        // 🐛 진화 단계가 적은 몬스터 비율 예외 처리 포함 동적 크기 조절
        let baseScale = 1.0;
        let isSingle = monsterSpec.stages[0] === monsterSpec.stages[monsterSpec.stages.length - 1];
        let isTwo = !isSingle && monsterSpec.stages[1] === monsterSpec.stages[monsterSpec.stages.length - 1];
        if (isSingle) { baseScale = 1.05; }
        else if (isTwo) { baseScale = currentStageIdx === 0 ? 0.85 : 1.1; }
        else {
            if (currentStageIdx === 0) baseScale = 0.65;
            else if (currentStageIdx === 1) baseScale = 0.85;
            else if (currentStageIdx === 2) baseScale = 1.05;
            else baseScale = 1.2;
        }
        let scaleStr = layout === 'grid' ? (baseScale * 1.1) : (baseScale * 0.95);

        let protectionShadow = isShiny ? 'drop-shadow(0 4px 10px rgba(251,191,36,0.4))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))';
        
        let fallbackUrl = pokeId >= 10000 
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
        let imageUrl = fallbackUrl;
        
        let pureName = m.nickname ? m.nickname : monsterSpec.name;
        
        // ✨ 가방 아이템 다중 타입 배지 표시
        let actualTypeHtml = "";
        if (m.status !== "egg") {
            try {
                let pokeData = await window.PokeAPI.getPokemon(pokeId);
                if (pokeData && pokeData.name) {
                    if (pokeData.types) {
                        let typesStr = pokeData.types.map(t => window.TYPE_TRANSLATION[t.type.name] || t.type.name.toUpperCase()).join('/');
                        actualTypeHtml = `<div style="font-size:9px; color:var(--text-muted); background:var(--bg); border:1px solid var(--border-color); padding:2px 4px; border-radius:6px; z-index:5; margin-bottom:2px; text-align:center;">${typesStr}</div>`;
                    }
                    let sdName = pokeData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh');
                    imageUrl = isShiny 
                        ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif`
                        : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`;
                }
            } catch(e) { }
        }
        
        let displayName = m.status === "egg" ? "미확인 알" :
                          (m.nickname ? `${shinyMark}${m.nickname} <span style="font-size:11px; opacity:0.7;">(${monsterSpec.name})</span>` : `${shinyMark}${monsterSpec.name}`);
        let stageName = m.status === "egg" ? "부화 전" : monsterSpec.stages[currentStageIdx];
        
        let info = "", btn = "";
        if (m.status === "egg") {
            info = `<span style="font-size:13px; font-weight:700; color:var(--text-muted); word-break:keep-all;">⚪ 부화 대기 중</span>`;
            btn = `<button class="setting-btn" style="background:linear-gradient(135deg, var(--primary), var(--target)); color:white; border:none; padding:8px 14px; border-radius:16px; font-size:12px; font-weight:800; white-space:nowrap; flex-shrink:0; box-shadow:0 4px 12px rgba(0,149,246,0.3);" onclick="SFX.play('success'); selectMonsterTypeForHatch('${m.id}')">속성 선택</button>`;
        } else if (m.status === "active") {
            let nextHours = totalHours >= maxHours ? null : (evoHours[maxStageIdx + 1] || maxHours);
            let hoursLeft = nextHours ? Math.max(0, nextHours - totalHours) : 0;
            let timeInfoText = maxStageIdx >= 3 ? `• 졸업까지 ${hoursLeft}h` : `• 진화까지 ${hoursLeft}h`;
            info = `<span style="font-size:11px; color:var(--text-muted); word-break:keep-all; display:block; line-height:1.4;">⏳ 진행도: ${totalHours}/${maxHours}h<br><span style="opacity:0.8;">(${timeInfoText})</span></span>`;
            if(!isDisplay) btn = `<button class="setting-btn" style="background:var(--surface); color:var(--text-main); border:1px solid var(--border-color); padding:8px 14px; border-radius:14px; font-size:12px; font-weight:800; white-space:nowrap; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.05); ${layout==='grid'?'border-radius:10px;':''}" onclick="SFX.play('tap'); setDisplayMonster('${m.id}')">전시하기</button>`;
            else btn = `<span style="font-size:13px; color:var(--primary); font-weight:900; white-space:nowrap; padding:8px 0; display:block; text-align:center;">⭐ 전시 중</span>`;
        } else {
            info = `<span style="font-size:11px; color:var(--text-muted); word-break:keep-all; display:block; line-height:1.4;">📖 도감 등록 완료<br><span style="opacity:0.8;">(${m.startDate.slice(2).replace(/-/g,'.')} ~ ${m.endDate?.slice(2).replace(/-/g,'.') || '완료'})</span></span>`;
            if(!isDisplay) btn = `<button class="setting-btn" style="background:var(--surface); color:var(--text-main); border:1px solid var(--border-color); padding:8px 14px; border-radius:14px; font-size:12px; font-weight:800; white-space:nowrap; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.05); ${layout==='grid'?'border-radius:10px;':''}" onclick="SFX.play('tap'); setDisplayMonster('${m.id}')">전시하기</button>`;
            else btn = `<span style="font-size:13px; color:var(--primary); font-weight:900; white-space:nowrap; padding:8px 0; display:block; text-align:center;">⭐ 전시 중</span>`;
        }
        
        let formBtn = maxStageIdx > 0 && m.status !== "egg" ? `<button class="setting-btn" style="padding:8px 14px; font-size:12px; font-weight:800; white-space:nowrap; background:var(--surface); color:var(--text-main); border:1px solid var(--border-color); border-radius:14px; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.05); ${layout==='grid'?'border-radius:10px; margin-top:6px;':'margin-top:8px;'}" onclick="SFX.play('tap'); event.stopPropagation(); cycleMonsterForm('${m.id}')">🔄 폼 변경</button>` : '';
        let bgStyle = m.status === "retired" ? `background: linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(255,215,0,0.1) 100%);` : '';
        
        let imagePart = m.status === "egg" 
            ? `<div style="font-size:35px; margin-right:15px; width:60px; text-align:center; line-height: 1;">⚪</div>`
            : `<img src="${imageUrl}" style="width:${layout==='grid'?'85px':'68px'}; height:${layout==='grid'?'85px':'68px'}; object-fit:contain; margin-right:${layout==='grid'?'0':'15px'}; margin-bottom:${layout==='grid'?'8px':'0'}; transform:scale(${layout==='grid'?'1.2':'1.15'}); filter: ${protectionShadow} drop-shadow(0 4px 8px rgba(0,0,0,0.25)); cursor:pointer; transition:transform 0.2s;" onclick="event.stopPropagation(); window.playPokemonCry(${pokeId}, this, ${currentStageIdx >= 3}, '${pureName}', ${monsterSpec.pokeIds[2] || monsterSpec.pokeIds[0]})" onerror="if(this.src !== '${fallbackUrl}') { this.src='${fallbackUrl}'; } else { this.style.display='none'; this.nextElementSibling.style.display='block'; }"><div style="display:none; font-size:35px; margin-right:${layout==='grid'?'0':'15px'}; width:60px; text-align:center; line-height:1;">🐾</div>`;
        
        if (layout === 'grid') {
            return `<div class="bag-item-grid ${isDisplay ? 'active' : ''}" style="${bgStyle}">${imagePart}<div style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:3px; z-index:5; text-align:center; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName}</div>${actualTypeHtml}<div style="font-size:10px; font-weight:700; color:var(--text-muted); background:var(--bg); border:1px solid var(--border-color); padding:3px 6px; border-radius:8px; z-index:5; margin-bottom:6px; text-align:center; white-space:nowrap;">${stageName}</div><div style="display:flex; gap:4px; margin-top:auto; z-index:10; width:100%; justify-content:center; flex-direction:column;">${btn.replace('border-radius:6px;', 'border-radius:6px; width:100%; padding-left:0; padding-right:0;')}${formBtn.replace('border-radius:6px;', 'border-radius:6px; width:100%; padding-left:0; padding-right:0;')}</div></div>`;
        } else {
            return `<div class="bag-item ${isDisplay ? 'active' : ''}" style="${bgStyle}">${imagePart}<div style="flex-grow:1; display:flex; flex-direction:column; min-width:0; padding-right:10px;"><span style="font-size:13px; font-weight:800; color:var(--text-main); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName} - <span style="font-weight:700; font-size:11px;">${stageName}</span></span>${actualTypeHtml}${info}</div><div style="display:flex; flex-direction:column; align-items:stretch; flex-shrink:0; min-width:70px;">${btn}${formBtn}</div></div>`;
        }
    } catch(err) {
        return `<div style="padding:10px; background:#ffe0e0; border-radius:8px; color:#e74c3c; font-size:12px;">⚠️ 렌더링 오류 (ID: ${m?.id})</div>`;
    }
};

window.cycleMonsterForm = async function(id) {
    if (window.isCyclingForm) return;
    window.isCyclingForm = true;
    try {
        let m = window.monsterData.inventory.find(x => x.id === id);
        if (!m || m.status === "egg") { window.isCyclingForm = false; return; }
        
        let monsterSpec = window.getMonsterSpec(m);
        if (!monsterSpec) { window.isCyclingForm = false; return; }
        let evoHours = window.getEvolutionHours(monsterSpec);
        
        let totalHours = Math.floor(window.calculateActiveMonsterExp(m) / 3600);
        let maxStageIdx = 0;
        for (let i = evoHours.length - 1; i >= 0; i--) {
            if (totalHours >= evoHours[i]) { maxStageIdx = i; break; }
        }
        
        if (maxStageIdx === 0) { window.isCyclingForm = false; if(window.showToast) window.showToast("아직 진화하지 않아 모습을 변경할 수 없습니다."); return; }
        if (maxStageIdx >= monsterSpec.pokeIds.length) maxStageIdx = monsterSpec.pokeIds.length - 1;
        
        let currentStage = m.selectedStage !== undefined ? m.selectedStage : maxStageIdx;
        if (currentStage > maxStageIdx) currentStage = maxStageIdx;

        let currentPokeId = monsterSpec.pokeIds[currentStage];
        let nextStage = currentStage;
        
        for(let i=0; i<4; i++) {
            nextStage++;
            if (nextStage > maxStageIdx) nextStage = 0;
            if (monsterSpec.pokeIds[nextStage] !== currentPokeId || nextStage === 0) break;
        }
        
        m.selectedStage = nextStage;
        if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData));
        window.updateMonsterUI();
        
        let newPokeId = monsterSpec.pokeIds[nextStage];
        let pureName = m.nickname ? m.nickname : monsterSpec.name;
        if(window.playPokemonCry) window.playPokemonCry(newPokeId, null, nextStage >= 3, pureName, monsterSpec.pokeIds[0]);
        
        let content = document.getElementById('monster-bag-content');
        let scrollPos = content ? content.scrollTop : 0;
        await window.openMonsterBag(true);
        if (document.getElementById('monster-bag-content')) document.getElementById('monster-bag-content').scrollTop = scrollPos;
        
        if(window.triggerAutoSync) window.triggerAutoSync();
        if(window.SFX) window.SFX.play('pop');
        if(window.showToast) window.showToast("✨ 폼(모습)이 변경되었습니다!");
    } finally {
        window.isCyclingForm = false;
    }
};

window.selectMonsterTypeForHatch = function(eggId) {
    let egg = window.monsterData.inventory.find(x => x.id === eggId);
    if (!egg || egg.status !== "egg") return;
    let searchInput = document.getElementById('hatch-search-input');
    if(searchInput) { searchInput.value = ''; searchInput.dataset.eggId = eggId; }
    window.renderHatchList(eggId, '');
    document.getElementById('hatch-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.renderHatchList = function(eggId, searchTerm = '') {
    let term = searchTerm.toLowerCase().trim();
    let html = '<p style="color:var(--text-muted); font-size:13px; margin-bottom:20px; text-align:center; word-break:keep-all;">함께할 파트너를 직접 선택해주세요!</p>';
    let foundCount = 0;

    for (let type in window.MONSTER_DATA) {
        let tData = window.MONSTER_DATA[type];
        let filteredMonsters = tData.monsters.filter(m => m.name.toLowerCase().includes(term) || m.stages.some(s => s.toLowerCase().includes(term)));

        if (filteredMonsters.length > 0) {
            foundCount += filteredMonsters.length;
            html += `<div style="margin-bottom: 20px; text-align:left;">
                        <div style="font-size: 14px; font-weight: 800; color: white; background: rgba(${tData.color}, 0.9); padding: 6px 12px; border-radius: 8px; margin-bottom: 10px; display: inline-block;">
                            🧬 ${tData.name} 속성
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">`;
            
            filteredMonsters.forEach(m => {
                let imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.pokeIds[0]}.png`;
                html += `<div style="background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:12px 5px; cursor:pointer; transition:transform 0.1s; display:flex; flex-direction:column; align-items:center; box-shadow:0 2px 8px rgba(0,0,0,0.04);"
                              onclick="SFX.play('success'); hatchEggWithMonster('${eggId}', '${type}', '${m.id}')"
                              onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'" onmouseleave="this.style.transform='scale(1)'">
                            <img src="${imgUrl}" style="width:60px; height:60px; object-fit:contain; margin-bottom:8px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1)); transform:scale(1.15);" loading="lazy">
                            <div style="font-size:12.5px; font-weight:800; color:var(--text-main); text-align:center; word-break:keep-all;">${m.name}</div>
                         </div>`;
            });
            html += `</div></div>`;
        }
    }
    
    if (foundCount === 0) {
        html = `<div style="text-align:center; padding:40px; color:var(--text-muted);">"<strong>${window.Utils ? window.Utils.escapeHTML(searchTerm) : searchTerm}</strong>"에 대한 검색 결과가 없습니다.</div>`;
    }
    document.getElementById('hatch-modal-body').innerHTML = html;
};

window.hatchEggWithMonster = async function(eggId, selectedType, monsterSubId) {
    try {
        if (!window.monsterData || !window.monsterData.inventory) {
            if(window.showToast) window.showToast("오류: 몬스터 정보를 찾을 수 없습니다."); return;
        }
        
        if (window.monsterData.activeId) {
            let active = window.monsterData.inventory.find(m => m.id === window.monsterData.activeId);
            if (active && active.status === "active") {
                if (!confirm("⚠️ 현재 육성 중인 파트너가 있습니다!\n새 알을 부화시키면 기존 몬스터는 은퇴하여 도감에 보존됩니다.\n새 몬스터로 교체하시겠습니까?")) return;
                active.status = "retired";
                active.endDate = window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0];
                active.totalSeconds = window.calculateActiveMonsterExp(active);
            }
        }
        
        let egg = window.monsterData.inventory.find(x => x.id === eggId);
        if (!egg) {
            egg = { id: eggId, status: "egg", totalSeconds: 0 };
            window.monsterData.inventory.push(egg);
        }
        
        const typeData = window.MONSTER_DATA[selectedType];
        const monsterSpec = typeData.monsters.find(m => m.id === monsterSubId) || typeData.monsters[0];
        
        let nickname = prompt(`✨ [${monsterSpec.name}] 이(가) 곧 부화합니다!\n특별한 이름(별명)을 지어주세요.\n(취소/빈칸 시 기본 이름)`);
        if (nickname === null) return; 
        
        egg.nickname = nickname.trim().substring(0, 10);
        egg.isShiny = Math.random() < 0.1;
        egg.type = selectedType;
        egg.monsterSubId = monsterSubId;
        egg.status = "active";
        egg.startDate = window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0];
        egg.totalSeconds = 0;
        
        let safeBlockSeconds = Array.isArray(window.blockSeconds) ? window.blockSeconds : Array(48).fill(0);
        egg.startOffsetSeconds = safeBlockSeconds.reduce((a, b) => Number(a) + Number(b), 0) || 0;

        egg.bonusSeconds = 0;
        egg.selectedStage = 0;
        
        window.monsterData.activeId = egg.id;
        window.monsterData.displayId = egg.id;
        
        document.getElementById('hatch-modal').style.display = 'none';
        document.body.style.overflow = '';
        if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData));
        
        if(window.SFX) window.SFX.play('success');
        if(window.showToast) window.showToast(`✨ ${monsterSpec.name}이(가) 부화했습니다!`);

        setTimeout(() => {
            window.updateMonsterUI();
            let bagModal = document.getElementById('monster-bag-modal');
            if (bagModal && bagModal.style.display === 'flex') window.openMonsterBag(true);
            if(window.triggerAutoSync) window.triggerAutoSync(true);
        }, 100);
    } catch(err) {
        console.error("Hatch error:", err);
    }
};

window.openPokemonInfoModal = function(searchTerm = '') {
    if (!searchTerm && document.getElementById('settings-modal').style.display === 'flex') {
        document.getElementById('settings-modal').style.display = 'none';
    }
    let totalAvailable = 0;
    let html = '';
    let term = searchTerm.toLowerCase().trim();

    for (let type in window.MONSTER_DATA) {
        let tData = window.MONSTER_DATA[type];
        let filteredMonsters = tData.monsters.filter(m => m.name.toLowerCase().includes(term) || m.stages.some(s => s.toLowerCase().includes(term)));
        
        if (filteredMonsters.length > 0) {
            totalAvailable += filteredMonsters.length;
            html += `<div style="margin-bottom: 20px;">
                        <div style="font-size: 14px; font-weight: 800; color: white; background: rgba(${tData.color}, 0.9); padding: 6px 12px; border-radius: 8px; margin-bottom: 10px; display: inline-block;">
                            🧬 ${tData.name} 속성 (${filteredMonsters.length}종)
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
            
            filteredMonsters.forEach(m => {
                let megaStr = m.megaClass ? ' <span style="font-size:10px; color:var(--text-muted);"><br>(메가/최종폼 포함)</span>' : '';
                let pokeId = m.pokeIds[0];
                let imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`;
                
                let typeBadgeId = 'badge-' + m.id + '-' + Date.now() + Math.floor(Math.random()*1000);
                let typeBadgeHtml = `<span id="${typeBadgeId}" style="font-size:10px; color:var(--text-muted); margin-top:2px;">${tData.name}</span>`;
                let cachedData = window.PokeAPI && window.PokeAPI.cache ? window.PokeAPI.cache[pokeId] : null;
                if (cachedData && cachedData.types) {
                    typeBadgeHtml = `<span id="${typeBadgeId}" style="font-size:10px; color:var(--text-muted); margin-top:2px; display:inline-block;">${cachedData.types.map(t => window.TYPE_TRANSLATION && window.TYPE_TRANSLATION[t.type.name] ? window.TYPE_TRANSLATION[t.type.name] : t.type.name.toUpperCase()).join(' / ')}</span>`;
                } else if (window.PokeAPI) {
                    window.PokeAPI.getPokemon(pokeId).then(data => {
                        if (data && data.types) {
                            let typesStr = data.types.map(t => window.TYPE_TRANSLATION && window.TYPE_TRANSLATION[t.type.name] ? window.TYPE_TRANSLATION[t.type.name] : t.type.name.toUpperCase()).join(' / ');
                            let badgeEl = document.getElementById(typeBadgeId);
                            if (badgeEl) badgeEl.innerText = typesStr;
                        }
                    }).catch(e => {});
                }
                
                html += `<div style="background: var(--surface); border: 1px solid var(--border-color); padding: 10px; border-radius: 12px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="SFX.play('pop'); showEvolutionChain('${type}', '${m.id}')">
                            <img src="${imgUrl}" style="width:55px; height:55px; object-fit:contain; transform:scale(1.1); filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));" loading="lazy">
                            <div style="font-size: 13px; font-weight: 700; color: var(--text-main); line-height: 1.3; display:flex; flex-direction:column;">
                                <span>${m.name}${megaStr}</span>
                                ${typeBadgeHtml}
                            </div>
                         </div>`;
            });
            html += `</div></div>`;
        }
    }
    
    let header = `<div style="text-align:center; margin-bottom:25px; font-size:15px; font-weight:800; color:var(--text-main); background:var(--surface); padding:15px; border-radius:16px; border:1px solid var(--border-color);">
                    ${term ? `검색 결과: 총 <span style="color:var(--primary); font-size:20px;">${totalAvailable}</span>종 발견` : `현재 도감에 총 <span style="color:var(--primary); font-size:20px;">${Object.values(window.MONSTER_DATA).reduce((acc, t) => acc + t.monsters.length, 0)}</span>종의 포켓몬이 발견되었습니다!`}
                  </div>`;
                  
    document.getElementById('pokemon-info-content').innerHTML = header + html;
    document.getElementById('pokemon-info-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    if (searchTerm === '') {
        let input = document.getElementById('pokedex-search-input');
        if (input) input.value = '';
    }
};

window.showEvolutionChain = async function(type, subId) {
    const tData = window.MONSTER_DATA[type];
    if (!tData) return;
    const m = tData.monsters.find(x => x.id === subId);
    if (!m) return;

    const modal = document.getElementById('evolution-chain-modal');
    const content = document.getElementById('evo-chain-content');
    document.getElementById('evo-chain-title').innerText = `${m.name} 육성 및 진화 과정`;
    
    modal.style.display = 'flex';
    content.innerHTML = '<div style="padding:30px; text-align:center;">로딩 중... ⏳</div>';
    
    let html = '';
    let evoHours = window.getEvolutionHours(m);
    let maxHours = evoHours[evoHours.length - 1];
    
    let displayedStages = [];
    displayedStages.push({ type: "egg", stageName: "미확인 알", desc: "가방에서 부화 (누적 0시간)" });

    for (let i = 0; i < m.pokeIds.length; i++) {
        if (i > 0 && m.pokeIds[i] === m.pokeIds[i-1] && m.stages[i] === m.stages[i-1]) continue;
        let isMega = (i >= 3 && m.megaClass) || (i >= 3 && m.stages[3] !== m.stages[2]);
        displayedStages.push({ type: "monster", index: i, pokeId: m.pokeIds[i], stageName: m.stages[i], reqHours: evoHours[i], isMega: isMega });
    }
    displayedStages.push({ type: "max", stageName: "👑 마스터 (MAX)", desc: `누적 <b style="color:#d97706;">${maxHours}시간</b> 달성 시 도감 등록` });

    html += `<div style="position:relative; padding:10px 0;"><div style="position:absolute; left:39px; top:40px; bottom:40px; width:2px; background:var(--border-color); z-index:1;"></div>`;

    for (let idx = 0; idx < displayedStages.length; idx++) {
        let stage = displayedStages[idx];
        if (stage.type === "egg") {
            html += `<div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; position:relative; z-index:2;"><div style="width:60px; height:60px; background:linear-gradient(135deg, #f5f5f5, #e5e5e5); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid var(--border-color); box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-left:10px;"><div style="font-size:26px;">⚪</div></div><div style="flex-grow:1; background:var(--surface); border:1px solid var(--border-color); border-radius:16px; padding:12px 15px; box-shadow:0 2px 8px rgba(0,0,0,0.03);"><div style="font-size:15px; font-weight:800; color:var(--text-main);">${stage.stageName}</div><div style="font-size:12.5px; font-weight:600; color:var(--text-muted); margin-top:4px;">${stage.desc}</div></div></div>`;
        } else if (stage.type === "monster") {
            let badgeHtml = stage.isMega ? `<span style="background:linear-gradient(45deg, #facc15, #f59e0b); color:#78350f; padding:2px 6px; border-radius:6px; font-size:10px; font-weight:800; margin-left:6px;">메가진화</span>` : '';
            let reqText = stage.reqHours === 0 ? "부화 직후 (0시간)" : `누적 <b style="color:var(--primary);">${stage.reqHours}시간</b> 달성 시`;
            let imgUrl = stage.pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.pokeId}.png`;
                
                let baseIdForCry = stage.isMega ? (m.pokeIds[2] || m.pokeIds[0]) : stage.pokeId;

                html += `<div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; position:relative; z-index:2;"><div style="width:60px; height:60px; background:${stage.isMega ? 'rgba(253, 230, 138, 0.4)' : 'var(--surface)'}; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid ${stage.isMega ? '#f59e0b' : 'var(--primary)'}; box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-left:10px; cursor:pointer;" onclick="window.playPokemonCry(${stage.pokeId}, this.querySelector('img'), ${stage.isMega}, '${m.name}', ${baseIdForCry})"><img src="${imgUrl}" style="width:48px; height:48px; object-fit:contain; transform:scale(1.2); filter:drop-shadow(0 2px 4px rgba(0,0,0,0.15));" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.pokeId}.png'"></div><div style="flex-grow:1; background:var(--surface); border:2px solid ${stage.isMega ? '#fcd34d' : 'var(--border-color)'}; border-radius:16px; padding:12px 15px; box-shadow:0 2px 8px rgba(0,0,0,0.03); cursor:pointer;" onclick="window.playPokemonCry(${stage.pokeId}, this.previousElementSibling.querySelector('img'), ${stage.isMega}, '${m.name}', ${baseIdForCry})"><div style="font-size:15px; font-weight:800; color:var(--text-main); display:flex; align-items:center;">${stage.stageName} ${badgeHtml}</div><div style="font-size:12.5px; font-weight:600; color:var(--text-muted); margin-top:4px;">${reqText}</div></div></div>`;
        } else if (stage.type === "max") {
            html += `<div style="display:flex; align-items:center; gap:15px; position:relative; z-index:2;"><div style="width:60px; height:60px; background:linear-gradient(135deg, #FFD700, #FFA500); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid #D4AF37; box-shadow:0 4px 15px rgba(255,215,0,0.4); margin-left:10px;"><div style="font-size:24px;">👑</div></div><div style="flex-grow:1; background:var(--surface); border:2px solid #fcd34d; border-radius:16px; padding:12px 15px; box-shadow:0 4px 15px rgba(255,215,0,0.15);"><div style="font-size:15px; font-weight:900; color:var(--text-main);">${stage.stageName}</div><div style="font-size:12.5px; font-weight:800; color:#d97706; margin-top:4px;">${stage.desc}</div></div></div>`;
        }
    }
    
    html += `</div>`; 
    if (m.pokeIds.length === 4 && m.pokeIds.every((val, i, arr) => val === arr[0])) {
        html += `<div style="margin-top:15px; font-size:12.5px; color:var(--text-muted); font-weight:bold; text-align:center; padding:12px; background:var(--bg-sec); border-radius:12px;">이 포켓몬은 추가 진화가 없습니다. (단일 형태)</div>`;
    }
    content.innerHTML = html;
};

window.setDisplayMonster = function(id) {
    window.monsterData.displayId = id; 
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData));
    window.openMonsterBag(); 
    window.updateMonsterUI(); 
    if(window.triggerAutoSync) window.triggerAutoSync(true);
};

// 🍓 포켓몬 상호작용 로직 (간식, 쓰다듬기)
window.interactMonster = function(type) {
    if(!window.monsterData.displayId) return window.showToast("전시된 몬스터가 없습니다!");
    let m = window.monsterData.inventory.find(x => x.id === window.monsterData.displayId);
    if(!m || m.status === 'egg') return window.showToast("알 상태에서는 상호작용할 수 없습니다! ⚪");
    
    let spec = window.getMonsterSpec(m);
    const emojiEl = document.getElementById('monster-emoji');
    
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
        window.SFX.play('eat'); window.showToast(`🍓 ${currentName}에게 간식을 주었습니다! 냠냠!`);
    } else if (type === 'pet') {
        let handEl = document.createElement('div');
        handEl.innerText = '🖐️'; handEl.className = 'pet-hand';
        handEl.style.left = '50%'; handEl.style.top = '5%'; handEl.style.transform = 'translate(-50%, 0)';
        if(emojiEl) emojiEl.appendChild(handEl);
        setTimeout(() => handEl.remove(), 1200);
        window.SFX.play('pet'); window.showToast(`❤️ ${currentName}이(가) 기분 좋아합니다!`);
    }
    
    if(imgEl) {
        imgEl.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        imgEl.style.transform = originalTrans + ' translateY(-10px) scale(1.1)';
        setTimeout(() => imgEl.style.transform = originalTrans, 300);
    }
};

// ✨ 포켓몬 전체화면 진화 팝업
window.showEvolutionPopup = async function(baseName, stageName, pokeId, maxHours, monsterId, oldPokeId) {
    window.SFX.play('success'); 
    let imgUrl = pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
    
    const popup = document.getElementById('evolution-popup');
    const imgEl = document.getElementById('evo-popup-img');
    const titleEl = document.getElementById('evo-popup-title');
    const descEl = document.getElementById('evo-popup-desc');
    
    imgEl.src = imgUrl;
    imgEl.style.transform = 'scale(0.2)'; imgEl.style.opacity = '0'; descEl.style.opacity = '0';
    titleEl.innerText = stageName.includes("메가") || stageName.includes("마스터") ? `어라...? 엄청난 빛이!!` : `어라...? ${baseName}의 상태가!`;
    popup.style.display = 'flex'; document.body.style.overflow = 'hidden';
    
    setTimeout(() => { imgEl.style.transform = 'scale(1)'; imgEl.style.opacity = '1'; }, 100);
};