// ==========================================
// ⚔️ 포켓몬 배틀 시스템 (battle.js)
// ==========================================

// 🔥 포켓몬 타입 번역 및 속성 상성 알고리즘
window.TYPE_TRANSLATION = {
    normal: '노말', fighting: '격투', flying: '비행', poison: '독', ground: '땅',
    rock: '바위', bug: '벌레', ghost: '고스트', steel: '강철', fire: '불꽃',
    water: '물', grass: '풀', electric: '전기', psychic: '에스퍼', ice: '얼음',
    dragon: '드래곤', dark: '악', fairy: '페어리'
};

// ✨ 속성별 전용 기술 및 위력 데이터
window.TYPE_MOVES = {
    normal: [{name: '몸통박치기', power: 40}, {name: '칼춤', power: 0, effect: 'atk_up'}, {name: '누르기', power: 85}, {name: '파괴광선', power: 120}],
    fire: [{name: '불꽃세례', power: 40}, {name: '도깨비불', power: 0, effect: 'atk_down'}, {name: '화염방사', power: 90}, {name: '불대문자', power: 110}],
    water: [{name: '물대포', power: 40}, {name: '아쿠아링', power: 0, effect: 'heal'}, {name: '파도타기', power: 90}, {name: '하이드로펌프', power: 110}],
    grass: [{name: '잎날가르기', power: 55}, {name: '씨뿌리기', power: 0, effect: 'drain'}, {name: '기가드레인', power: 75, effect: 'heal'}, {name: '솔라빔', power: 120}],
    electric: [{name: '전기쇼크', power: 40}, {name: '전기자석파', power: 0, effect: 'def_down'}, {name: '10만볼트', power: 90}, {name: '번개', power: 110}],
    flying: [{name: '바람일으키기', power: 40}, {name: '순풍', power: 0, effect: 'spd_up'}, {name: '에어슬래시', power: 75}, {name: '브레이브버드', power: 120}],
    poison: [{name: '독침', power: 40}, {name: '독가루', power: 0, effect: 'def_down'}, {name: '오물폭탄', power: 90}, {name: '더스트슈트', power: 120}],
    ground: [{name: '머드숏', power: 40}, {name: '모래뿌리기', power: 0, effect: 'atk_down'}, {name: '지진', power: 100}, {name: '단애의칼', power: 120}],
    rock: [{name: '돌떨구기', power: 50}, {name: '스텔스록', power: 0, effect: 'def_down'}, {name: '스톤샤워', power: 100}, {name: '양날박치기', power: 150}],
    bug: [{name: '벌레먹기', power: 60}, {name: '끈적끈적네트', power: 0, effect: 'spd_down'}, {name: '시저크로스', power: 80}, {name: '메가혼', power: 120}],
    ghost: [{name: '핥기', power: 30}, {name: '이상한빛', power: 0, effect: 'def_down'}, {name: '섀도볼', power: 80}, {name: '고스트다이브', power: 120}],
    steel: [{name: '메탈크로우', power: 50}, {name: '철벽', power: 0, effect: 'def_up'}, {name: '아이언헤드', power: 90}, {name: '파멸의소원', power: 140}],
    ice: [{name: '눈싸라기', power: 40}, {name: '오로라베일', power: 0, effect: 'def_up'}, {name: '냉동빔', power: 90}, {name: '눈보라', power: 110}],
    psychic: [{name: '염동력', power: 50}, {name: '명상', power: 0, effect: 'atk_up'}, {name: '사이코키네시스', power: 90}, {name: '미래예지', power: 120}],
    dark: [{name: '물기', power: 60}, {name: '나쁜음모', power: 0, effect: 'atk_up'}, {name: '악의파동', power: 80}, {name: '속임수', power: 95}],
    dragon: [{name: '용의분노', power: 40}, {name: '용의춤', power: 0, effect: 'atk_up'}, {name: '드래곤크루', power: 80}, {name: '역린', power: 120}],
    fairy: [{name: '요정의바람', power: 40}, {name: '달의불빛', power: 0, effect: 'heal'}, {name: '매지컬샤인', power: 80}, {name: '문포스', power: 95}],
    default: [{name: '부딪치기', power: 40}, {name: '방어', power: 0, effect: 'def_up'}, {name: '돌진', power: 85}, {name: '기가임팩트', power: 150}]
};

window.getTypeEffectiveness = function(atkType, defTypes) {
    const matchups = {
        normal: { strong: [], weak: ['rock', 'steel'], immune: ['ghost'] },
        fire: { strong: ['grass', 'bug', 'ice', 'steel'], weak: ['fire', 'water', 'rock', 'dragon'] },
        water: { strong: ['fire', 'ground', 'rock'], weak: ['water', 'grass', 'dragon'] },
        grass: { strong: ['water', 'ground', 'rock'], weak: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'] },
        electric: { strong: ['water', 'flying'], weak: ['electric', 'grass', 'dragon'], immune: ['ground'] },
        psychic: { strong: ['fighting', 'poison'], weak: ['psychic', 'steel'], immune: ['dark'] },
        dark: { strong: ['psychic', 'ghost'], weak: ['fighting', 'dark', 'fairy'] },
        dragon: { strong: ['dragon'], weak: ['steel'], immune: ['fairy'] },
        fairy: { strong: ['fighting', 'dragon', 'dark'], weak: ['fire', 'poison', 'steel'] }
    };

    let multiplier = 1;
    let atkData = matchups[atkType] || { strong: [], weak: [], immune: [] };

    defTypes.forEach(defType => {
        if (atkData.strong && atkData.strong.includes(defType)) multiplier *= 2;
        if (atkData.weak && atkData.weak.includes(defType)) multiplier *= 0.5;
        if (atkData.immune && atkData.immune.includes(defType)) multiplier *= 0;
    });

    return multiplier;
};

// ✨ Canvas 3D 파티클 기반 스킬 이펙트 엔진
window.BattleFX = {
    particles: [], sparks: [], rings: [], ctx: null, canvas: null, isRunning: false,
    flashColor: null, flashLife: 0, shakeTime: 0, modalBox: null,

    init() {
        this.canvas = document.getElementById('battle-effects-canvas');
        this.modalBox = document.querySelector('#battle-modal .modal-box');
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    },
    emit(type, isEnemyTarget, power, moveName = null, attackerId = null, targetId = null) {
        if(!this.ctx) this.init();
        if(this.canvas && (this.canvas.width === 0 || this.canvas.height === 0)) {
            this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
            this.canvas.height = this.canvas.offsetHeight || 300;
        }
        let cw = this.canvas.width, ch = this.canvas.height;
        
        let startX = isEnemyTarget ? cw * 0.2 : cw * 0.8;
        let startY = isEnemyTarget ? ch * 0.8 : ch * 0.2;
        let endX = isEnemyTarget ? cw * 0.8 : cw * 0.2;
        let endY = isEnemyTarget ? ch * 0.2 : ch * 0.8;
        
        let isSelf = (attackerId === targetId && attackerId);
        let isDrain = moveName && (moveName.includes('드레인') || moveName.includes('흡수'));
        
        // 나에게 시전하는 버프 스킬 처리
        if (isSelf) {
            endX = startX;
            endY = startY;
        }
        
        // 드레인 계열은 대상에게서 시전자로 체력이 흡수되어 날아옴
        if (isDrain) {
            let tmpX = startX, tmpY = startY;
            startX = endX; startY = endY;
            endX = tmpX; endY = tmpY;
        }
        
        // 물리/돌진기인 경우 공격자 DOM 이미지를 직접 튀어나가게(Dash) 애니메이션 처리
        let attackerEl = attackerId ? document.getElementById(attackerId) : null;
        let isContactMove = moveName && (moveName.includes('박치기') || moveName.includes('물기') || moveName.includes('크로우') || moveName.includes('떨구기') || moveName.includes('드레인') || moveName.includes('먹기') || moveName.includes('핥기') || moveName.includes('다이브') || moveName.includes('역린') || moveName.includes('돌진') || moveName.includes('임팩트') || moveName.includes('펀치') || moveName.includes('치기'));
        
        if (attackerEl && isContactMove && targetId !== attackerId) {
            let originalTrans = attackerEl.style.transform || (attackerId === 'battle-my-img' ? 'scale(1.1) translate(10px, -10px)' : 'none');
            attackerEl.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            let dashTrans = attackerId === 'battle-my-img' ? 'scale(1.4) translate(40px, -40px)' : 'scale(1.4) translate(-40px, 40px)';
            attackerEl.style.transform = dashTrans;
            setTimeout(() => { if(attackerEl) attackerEl.style.transform = originalTrans; }, 250);
        }

        let colors = { fire:'#ef4444', water:'#3b82f6', grass:'#10b981', electric:'#facc15', psychic:'#d946ef', dark:'#6b21a8', dragon:'#4f46e5', fairy:'#f472b6', normal:'#9ca3af', poison:'#a855f7', ground:'#d97706', rock:'#b45309', ghost:'#4c1d95', ice:'#38bdf8', steel:'#94a3b8', bug:'#84cc16', heal: '#10b981' };
        let color = colors[type] || '#ffffff';
        if (moveName && moveName.includes('회복')) color = colors.heal;
        
        let isUlt = power >= 110;
        let baseCount = isUlt ? 150 : (power >= 80 ? 80 : 40);

        // ✨ 스킬 세부 카테고리 분석
        let isBeam = moveName && (moveName.includes('광선') || moveName.includes('빔') || moveName.includes('파동') || moveName.includes('방사'));
        let isBomb = moveName && (moveName.includes('폭탄') || moveName.includes('슈트') || moveName.includes('덩어리'));
        let isMeteor = moveName && (moveName.includes('샤워') || moveName.includes('유성') || moveName.includes('용성군') || moveName.includes('돌떨구기'));
        let isPowder = moveName && (moveName.includes('가루') || moveName.includes('씨') || moveName.includes('포자'));
        let isSlash = moveName && (moveName.includes('칼') || moveName.includes('크로우') || moveName.includes('슬래시') || moveName.includes('가르기') || moveName.includes('할퀴기'));
        let isPunch = moveName && (moveName.includes('박치기') || moveName.includes('치기') || moveName.includes('펀치') || moveName.includes('임팩트') || moveName.includes('신속'));
        
        let subCount = isBeam ? baseCount * 2.0 : (isBomb ? baseCount * 1.2 : baseCount);

        // 🌋 화면 환경 이펙트 (Screen Flash & Camera Shake)
        this.flashColor = color;
        this.flashLife = isUlt ? 1.5 : (power >= 80 ? 0.8 : 0.3); // 화면 색상 변경 시간
        this.shakeTime = isUlt ? 25 : (power >= 80 ? 12 : 0); // 화면 진동 시간
        
        if (moveName && (moveName.includes('지진') || moveName.includes('단애의칼') || moveName.includes('임팩트'))) {
            this.shakeTime += 20; // 지진, 강한 타격은 진동 대폭 추가
            this.flashColor = '#451a03'; // 어두운 흙먼지 색상
        }
        if (type === 'dark' || type === 'ghost') this.flashColor = '#111111'; // 암흑기 사용 시 화면이 어두워짐

        // 🌀 기 모으기 이펙트 (공격자 위치에서 응축되는 충격파)
        this.rings.push({
            x: startX, y: startY, radius: isUlt ? 150 : 80, maxRadius: 0, // 큰 원에서 작아짐
            width: 8, life: 1.0, decay: 0.05, color: color, isGather: true
        });

        for(let i=0; i<subCount; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * (isUlt ? 25 : 15);
            let sX = startX, sY = startY;

            // 스킬 성질에 따른 시작 위치 변화
            if (isMeteor) {
                sX = endX + (Math.random() - 0.5) * 200;
                sY = -50 - Math.random() * 100;
            } else if (isPowder || isSelf) {
                sX = startX + (Math.random() - 0.5) * 100;
                sY = startY + (Math.random() - 0.5) * 100;
            } else if (moveName && moveName.includes('번개')) {
                sX = endX + (Math.random() - 0.5) * 150;
                sY = -100; // 하늘에서 내리침
            }

            let vx = (endX - sX) * (isUlt ? 0.025 : 0.035) + Math.cos(angle) * (speed * 0.3);
            let vy = (endY - sY) * (isUlt ? 0.025 : 0.035) + Math.sin(angle) * (speed * 0.3);
            
            let shape = 'circle';
            let pColor = color;
            let size = Math.random() * (isUlt ? 25 : 12) + 4;

            // 모양 및 초기 궤적 커스텀
            if (isSlash) {
                shape = 'slash';
                vx = (Math.random() - 0.5) * 10;
                vy = (Math.random() - 0.5) * 10;
                sX = endX + (Math.random() - 0.5) * 100; // 타겟 주변 무작위 베기
                sY = endY + (Math.random() - 0.5) * 100;
                size = Math.random() * 40 + 20;
            } else if (isBeam) {
                shape = 'beam';
                vx = (endX - sX) * 0.08 + (Math.random() - 0.5) * 5;
                vy = (endY - sY) * 0.08 + (Math.random() - 0.5) * 5;
                if (Math.random() < 0.2) pColor = '#ffffff'; // 에너지 코어 화이트
            } else if (isMeteor || isBomb) {
                shape = 'rock';
                vx = (endX - sX) * 0.015 + (Math.random() - 0.5) * 2;
                vy = isMeteor ? (15 + Math.random() * 10) : (-15 + Math.random() * 5); // 폭탄은 솟구침, 메테오는 추락
            } else if (isPowder) {
                shape = 'dust';
                vx = (endX - sX) * 0.01 + (Math.random() - 0.5) * 10;
                vy = (endY - sY) * 0.01 + (Math.random() - 0.5) * 10 - 2;
            } else if (isPunch) {
                shape = 'star';
                if (Math.random() < 0.5) { // 타격 직전 터지는 파편
                    sX = endX; sY = endY;
                    vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
                }
            } else if (type === 'fire') {
                if (Math.random() < 0.3) { shape = 'smoke'; pColor = '#4b5563'; size *= 1.5; }
                else shape = 'flame';
            } else if (type === 'water' || type === 'ice') {
                shape = 'drop';
            } else if (type === 'electric') {
                shape = 'lightning';
            } else if (type === 'grass' || type === 'bug') {
                shape = 'leaf';
            }
            
            let particle = {
                x: sX, y: sY, vx: vx, vy: vy,
                life: 1.0, decay: Math.random() * 0.015 + (isUlt ? 0.005 : 0.01),
                size: size, color: pColor, isHit: false, targetX: endX, targetY: endY,
                type: type, angle: angle, offset: Math.random() * 100, isUlt: isUlt,
                moveName: moveName || '', shape: shape,
                spin: Math.random() * Math.PI * 2, spinSpeed: (Math.random() - 0.5) * 0.2
            };

            this.particles.push(particle);
        }
        if(!this.isRunning) { this.isRunning = true; this.loop(); }
    },
    loop() {
        if(!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 🌋 1. 화면 전체 컬러 플래시 틴트 효과 (환경 이펙트)
        if (this.flashLife > 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = (this.flashColor === '#111111' || this.flashColor === '#451a03') ? 'source-over' : 'screen';
            this.ctx.fillStyle = this.flashColor;
            this.ctx.globalAlpha = this.flashLife * (this.flashColor === '#111111' ? 0.5 : 0.25);
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            this.flashLife -= 0.03;
        }

        // 🌋 2. 배틀 모달 카메라 쉐이크 (진동)
        if (this.modalBox) {
            if (this.shakeTime > 0) {
                let sx = (Math.random() - 0.5) * Math.min(this.shakeTime, 25);
                let sy = (Math.random() - 0.5) * Math.min(this.shakeTime, 25);
                this.modalBox.style.transform = `translate(${sx}px, ${sy}px)`;
                this.shakeTime -= 1.0;
            } else if (this.modalBox.style.transform !== 'none' && this.modalBox.style.transform !== '') {
                this.modalBox.style.transform = 'translate(0, 0)';
            }
        }

        // 블렌드 모드 설정 (빛이 겹치면 눈부시게 밝아짐)
        this.ctx.globalCompositeOperation = 'screen';
        
        this.particles.forEach((p, i) => {
            p.spin += p.spinSpeed;

            if (p.shape === 'rock') {
                p.vy += 0.8; // 포물선 중력
                p.x += p.vx; p.y += p.vy;
            } else if (p.shape === 'beam') {
                p.x += p.vx; p.y += p.vy;
                p.size *= 0.95; // 빔 형태로 소멸
            } else if (p.shape === 'lightning') {
                p.x += p.vx + (Math.random() - 0.5) * 30;
                p.y += p.vy + (Math.random() - 0.5) * 30;
            } else if (p.type === 'psychic' || p.type === 'ghost') {
                p.offset += 0.2;
                p.x += p.vx + Math.cos(p.offset) * 12; 
                p.y += p.vy + Math.sin(p.offset) * 12;
            } else if (p.shape === 'drop') {
                p.offset += 0.15;
                p.x += p.vx;
                p.y += p.vy + Math.sin(p.offset) * 8; 
            } else if (p.shape === 'flame') {
                p.x += p.vx + (Math.random()-0.5)*5;
                p.y += p.vy - 2; 
                p.size *= 0.95; 
            } else if (p.shape === 'smoke') {
                p.x += p.vx;
                p.y += p.vy * 0.5 - 1.5;
                p.size *= 1.02; // 연기는 퍼지며 커짐
            } else {
                p.x += p.vx; p.y += p.vy;
            }
            
            let dx = p.targetX - p.x, dy = p.targetY - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            if(!p.isHit && dist < (p.isUlt ? 120 : 60)) {
                p.isHit = true; 
                let explodeForce = p.isUlt ? 50 : 25;

                // ✨ 타격 시 폭발 충격파(Ring) 생성
                if (Math.random() < (p.isUlt ? 0.05 : 0.02)) {
                    this.rings.push({
                        x: p.targetX, y: p.targetY, radius: 10, maxRadius: p.isUlt ? 300 : 150,
                        width: p.isUlt ? 25 : 10, life: 1.0, decay: p.isUlt ? 0.02 : 0.04, color: p.color, isGather: false
                    });
                    this.shakeTime = Math.max(this.shakeTime, p.isUlt ? 20 : 8); // 타격 시 화면 흔들림
                }
                
                // ✨ 하얗게 타오르는 2차 파편(Sparks) 생성
                for(let s=0; s < (p.isUlt ? 3 : 1); s++) {
                    this.sparks.push({
                        x: p.x, y: p.y, vx: (Math.random()-0.5)*explodeForce, vy: (Math.random()-0.5)*explodeForce,
                        life: 1.0, decay: 0.03 + Math.random()*0.05, size: p.size * 0.6, color: '#ffffff'
                    });
                }

                if (p.shape === 'slash') {
                    // 슬래시는 터지지 않고 대상을 베고 지나감
                    p.decay *= 1.5;
                } else if (p.shape === 'beam') {
                    p.vx = (Math.random()-0.5) * explodeForce * 2; 
                    p.vy = (Math.random()-0.5) * explodeForce * 2;
                    p.decay *= 1.5;
                } else {
                    p.vx = (Math.random()-0.5) * explodeForce; 
                    p.vy = (Math.random()-0.5) * explodeForce; 
                    p.decay *= (p.isUlt ? 1.2 : 2.5);
                }
            }
            p.life -= p.decay;
            
            if (p.life > 0) {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.spin);
                
                let currentSize = Math.max(0, p.size * p.life);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowBlur = p.isUlt ? 30 : 15; 
                this.ctx.shadowColor = p.color;
                
                // 고도화된 도형 그리기
                this.ctx.beginPath();
                if (p.shape === 'dust' || p.shape === 'leaf') {
                    if (this.ctx.ellipse) this.ctx.ellipse(0, 0, currentSize, currentSize/2, 0, 0, Math.PI*2);
                    else this.ctx.arc(0, 0, currentSize, 0, Math.PI*2);
                } else if (p.shape === 'slash') {
                    if (this.ctx.ellipse) this.ctx.ellipse(0, 0, currentSize*2, currentSize*0.2, 0, 0, Math.PI*2);
                    else this.ctx.rect(-currentSize, -currentSize/4, currentSize*2, currentSize/2);
                } else if (p.shape === 'beam') {
                    // 광선(Beam)은 이동 방향(Velocity)을 향해 길게 찢어지는 궤적을 그림
                    let bAngle = Math.atan2(p.vy, p.vx);
                    this.ctx.rotate(-p.spin); // 기존 스핀 상쇄
                    this.ctx.rotate(bAngle); // 진행 방향으로 회전
                    if (this.ctx.ellipse) this.ctx.ellipse(0, 0, currentSize * 6, currentSize * 0.4, 0, 0, Math.PI*2);
                    else this.ctx.fillRect(-currentSize*3, -currentSize/4, currentSize*6, currentSize/2);
                } else if (p.shape === 'lightning') {
                    this.ctx.rect(-currentSize/2, -currentSize/2, currentSize, currentSize);
                } else if (p.shape === 'star') {
                    for (let j=0; j<5; j++) {
                        this.ctx.lineTo(Math.cos((18+j*72)*Math.PI/180)*currentSize, -Math.sin((18+j*72)*Math.PI/180)*currentSize);
                        this.ctx.lineTo(Math.cos((54+j*72)*Math.PI/180)*currentSize*0.5, -Math.sin((54+j*72)*Math.PI/180)*currentSize*0.5);
                    }
                    this.ctx.closePath();
                } else if (p.shape === 'rock') {
                    this.ctx.rect(-currentSize, -currentSize, currentSize*2, currentSize*2);
                } else if (p.shape === 'drop') {
                    this.ctx.arc(0, 0, currentSize, 0, Math.PI);
                    this.ctx.lineTo(0, -currentSize*2);
                } else {
                    this.ctx.arc(0, 0, currentSize, 0, Math.PI*2);
                }
                
                // 연기는 화면을 하얗게 태우지 않도록 블렌드 모드 예외 처리
                if (p.shape === 'smoke') {
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.globalAlpha = p.life * 0.5;
                }
                
                this.ctx.fill();
                this.ctx.restore();
            }
        });
        
        // 렌더링 세팅 복구
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;

        // ✨ 3. 충격파(Ring) 및 블랙홀 효과 렌더링
        this.ctx.globalCompositeOperation = 'screen';
        this.rings.forEach(r => {
            r.radius += (r.maxRadius - r.radius) * 0.15; // 크기 보간 (Lerp)
            r.life -= r.decay;
            if (r.life > 0) {
                this.ctx.save();
                this.ctx.strokeStyle = r.color;
                this.ctx.lineWidth = Math.max(0.1, r.width * r.life);
                this.ctx.globalAlpha = r.life;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = r.color;
                this.ctx.beginPath();
                this.ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
            }
        });
        this.rings = this.rings.filter(r => r.life > 0);

        // ✨ 4. 타격 2차 파편(Sparks) 렌더링
        this.sparks.forEach(sp => {
            sp.x += sp.vx; sp.y += sp.vy;
            sp.life -= sp.decay;
            if (sp.life > 0) {
                this.ctx.save();
                this.ctx.fillStyle = sp.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = sp.color;
                this.ctx.globalAlpha = sp.life;
                this.ctx.beginPath();
                this.ctx.arc(sp.x, sp.y, Math.max(0, sp.size * sp.life), 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
        this.sparks = this.sparks.filter(sp => sp.life > 0);

        this.particles = this.particles.filter(p => p.life > 0);
        if(this.particles.length > 0 || this.sparks.length > 0 || this.rings.length > 0 || this.shakeTime > 0 || this.flashLife > 0) requestAnimationFrame(() => this.loop());
        else { this.isRunning = false; this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height); }
    }
};

window.playSkillEffect = function(attackerId, targetId, moveType, movePower = 40, effect = null, moveName = null) {
    let isEnemyTarget = targetId === 'battle-enemy-img';
    window.BattleFX.emit(moveType, isEnemyTarget, movePower, moveName, attackerId, targetId);
};

// ⚔️ 포켓몬 배틀 시스템 로직 (공부 누적 시간 비례)
window.startPokemonBattle = async function() {
    if (!window.monsterData || !window.monsterData.displayId) {
        return window.showToast("전시된 파트너 몬스터가 없습니다! 가방에서 꺼내주세요.");
    }
    let myMon = window.monsterData.inventory.find(x => x.id === window.monsterData.displayId);
    if (!myMon || myMon.status === 'egg') {
        return window.showToast("알은 배틀에 나갈 수 없습니다! ⚪");
    }

    let spec = window.getMonsterSpec(myMon);
    let evoHours = window.getEvolutionHours(spec);
    let maxHours = evoHours[evoHours.length - 1] || 40;
    let totalHours = Math.floor(window.calculateActiveMonsterExp(myMon) / 3600);
    
    let myLevel = Math.min(100, Math.max(5, Math.floor((totalHours / maxHours) * 100)));
    let currentStageIdx = myMon.selectedStage || 0;
    let myPokeId = spec.pokeIds[currentStageIdx];
    let myName = myMon.nickname || spec.stages[currentStageIdx];

    window.showLoading(true, "야생의 포켓몬을 찾는 중... 🌿");
    
    let typeKeys = Object.keys(window.MONSTER_DATA);
    let randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    let randomMonList = window.MONSTER_DATA[randomType].monsters;
    let randomMon = randomMonList[Math.floor(Math.random() * randomMonList.length)];
    
    let enemyStageIdx = currentStageIdx;
    if (Math.random() < 0.3) enemyStageIdx = Math.max(0, currentStageIdx - 1);
    else if (Math.random() < 0.1 && currentStageIdx < 3) enemyStageIdx = Math.min(3, currentStageIdx + 1);
    if (enemyStageIdx > 2) enemyStageIdx = 2; // 야생은 메가진화 불가

    let enemyLevel = Math.min(100, Math.max(1, myLevel + Math.floor(Math.random() * 7) - 3)); // 내 레벨 기준 비슷한 레벨의 적
    let enemyPokeId = randomMon.pokeIds[enemyStageIdx];
    
    const [enemyData, myPokeData] = await Promise.all([
        window.PokeAPI.getPokemon(enemyPokeId),
        window.PokeAPI.getPokemon(myPokeId)
    ]);
    
    let parseStats = (pokeData) => {
        let stats = { hp: 60, atk: 60, def: 60, spd: 60 };
        if (pokeData && pokeData.stats) {
            stats.hp = pokeData.stats.find(s => s.stat.name === 'hp')?.base_stat || 60;
            stats.atk = pokeData.stats.find(s => s.stat.name === 'attack')?.base_stat || 60;
            stats.def = pokeData.stats.find(s => s.stat.name === 'defense')?.base_stat || 60;
            stats.spd = pokeData.stats.find(s => s.stat.name === 'speed')?.base_stat || 60;
        }
        return stats;
    };
    
    let myStats = parseStats(myPokeData);
    let enemyStats = parseStats(enemyData);
    window.showLoading(false);

    let myHp = Math.floor(((2 * myStats.hp * myLevel) / 100) + myLevel + 10) * 1.5;
    let enemyHp = Math.floor(((2 * enemyStats.hp * enemyLevel) / 100) + enemyLevel + 10) * 1.5;

    // ✨ PokeAPI에서 가져온 실제 다중 타입 추출
    let myActualTypes = myPokeData ? myPokeData.types.map(t => t.type.name) : [myMon.type];

    let enemyName = randomMon.stages[enemyStageIdx] || (enemyData ? enemyData.name.toUpperCase() : "야생 포켓몬");
    let enemyTypes = enemyData ? enemyData.types.map(t => t.type.name) : ['normal'];
    let enemyTypeKor = enemyTypes.map(t => window.TYPE_TRANSLATION[t] || t.toUpperCase()).join('/');
    let enemySdName = enemyData && enemyData.name ? enemyData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay') : 'pikachu';
    let enemyImg = `https://play.pokemonshowdown.com/sprites/ani/${enemySdName}.gif`;

    window.battleState = {
        myName: myName, myLevel: myLevel, myHp: myHp, myMaxHp: myHp, myPokeId: myPokeId, myTypes: myActualTypes, myType: myActualTypes[0], myStage: currentStageIdx, myStats: myStats, myAtkMod: 1.0, myDefMod: 1.0,
        enemyName: enemyName, enemyLevel: enemyLevel, enemyHp: enemyHp, enemyMaxHp: enemyHp, enemyTypes: enemyTypes, enemyStage: enemyStageIdx, enemyStats: enemyStats, enemyAtkMod: 1.0, enemyDefMod: 1.0, ultUsed: false
    };

    // 배틀 화면 엑박 방지를 위한 Fallback 처리 보강
    let fallbackMyImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${myPokeId}.png`;
    let myImgSrc = fallbackMyImg;
    try {
        if (myPokeData && myPokeData.name) {
            let mySdName = myPokeData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh');
            myImgSrc = !!myMon.isShiny ? `https://play.pokemonshowdown.com/sprites/ani-back-shiny/${mySdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani-back/${mySdName}.gif`;
        }
    } catch(e) {}

    document.getElementById('battle-my-name').innerText = `Lv.${myLevel} ${myName}`;
    document.getElementById('battle-enemy-name').innerHTML = `Lv.${enemyLevel} ${enemyName} <span style="font-size:11px; color:#64748b;">(${enemyTypeKor})</span>`;
    document.getElementById('battle-my-hp').style.width = '100%';
    document.getElementById('battle-enemy-hp').style.width = '100%';
    
    let myImgEl = document.getElementById('battle-my-img');
    myImgEl.src = myImgSrc;
    myImgEl.onerror = function() { this.src = fallbackMyImg; };
    myImgEl.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';

    let enemyImgEl = document.getElementById('battle-enemy-img');
    enemyImgEl.src = enemyImg;
    enemyImgEl.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';

    document.getElementById('battle-log').innerHTML = `앗! 야생의 ${enemyName}이(가) 나타났다!<br>가라, ${myName}!`;

    document.getElementById('battle-actions').style.display = 'flex';
    document.getElementById('battle-continue').style.display = 'none';
    
    // ✨ 다중 타입에 따른 스킬 분배 엔진
    let primaryType = myActualTypes[0] || myMon.type;
    let secondaryType = (myActualTypes[1] && myActualTypes[1] !== primaryType) ? myActualTypes[1] : 'normal';
    
    let primaryMoves = window.TYPE_MOVES[primaryType] || window.TYPE_MOVES['default'];
    let secondaryMoves = window.TYPE_MOVES[secondaryType] || window.TYPE_MOVES['default'];
    let normalMoves = window.TYPE_MOVES['normal'];

    let isMaxStage = currentStageIdx >= (spec.pokeIds.length - 1) || currentStageIdx >= 3;
    let availableMoves = [];
    
    if (isMaxStage) {
        availableMoves.push({ ...primaryMoves[2], type: primaryType }); // 주속성 강공
        availableMoves.push({ ...secondaryMoves[1], type: secondaryType }); // 부속성 변화기
        availableMoves.push({ ...secondaryMoves[2], type: secondaryType }); // 부속성 강공
        availableMoves.push({ ...primaryMoves[3], type: primaryType }); // 주속성 궁극기
        
        // ✨ 전용 기술 오버라이드 복구
        let mySubId = myMon.monsterSubId;
        if (mySubId === 'fire_charizard') availableMoves[1] = { name: '용의춤', power: 0, type: 'dragon', effect: 'atk_up' };
        else if (mySubId === 'fire_blaziken') availableMoves[1] = { name: '벌크업', power: 0, type: 'fighting', effect: 'atk_up' };
        else if (mySubId === 'psychic_gengar') availableMoves[1] = { name: '최면술', power: 0, type: 'psychic', effect: 'def_down' };
        else if (mySubId === 'water_greninja') availableMoves[1] = { name: '그림자분신', power: 0, type: 'dark', effect: 'def_up' };
        else if (mySubId === 'electric_raichu') availableMoves[1] = { name: '고속이동', power: 0, type: 'electric', effect: 'atk_up' };
        else if (mySubId === 'dark_tyranitar') availableMoves[1] = { name: '모래바람', power: 0, type: 'rock', effect: 'atk_down' };
        else if (mySubId === 'dragon_garchomp') availableMoves[1] = { name: '칼춤', power: 0, type: 'normal', effect: 'atk_up' };
        else if (mySubId === 'grass_venusaur') availableMoves[1] = { name: '수면가루', power: 0, type: 'grass', effect: 'def_down' };
    } else if (currentStageIdx === 0) {
        availableMoves.push({ ...normalMoves[0], type: 'normal' });
        availableMoves.push({ ...primaryMoves[0], type: primaryType });
    } else if (currentStageIdx === 1) {
        availableMoves.push({ ...normalMoves[1], type: 'normal' });
        availableMoves.push({ ...primaryMoves[0], type: primaryType });
        availableMoves.push({ ...secondaryMoves[0], type: secondaryType });
    } else if (currentStageIdx === 2) {
        availableMoves.push({ ...normalMoves[0], type: 'normal' });
        availableMoves.push({ ...primaryMoves[1], type: primaryType });
        availableMoves.push({ ...secondaryMoves[2], type: secondaryType });
        availableMoves.push({ ...primaryMoves[2], type: primaryType });
    }

    // ✨ 메가 루카리오 스킬 오버라이드 복구
    let mySubIdCheck = myMon.monsterSubId;
    if (mySubIdCheck === 'psychic_lucario' || myPokeId === 10059) {
        if (availableMoves.length >= 3) {
            availableMoves[2] = { name: '파동탄', power: 90, type: 'fighting', effect: '' };
        }
        if (isMaxStage && availableMoves.length >= 4) {
            availableMoves[3] = { name: '메가파동탄', power: 150, type: 'fighting', effect: '' };
        }
    }

    let moveButtons = '';
    availableMoves.forEach(m => {
        let color = m.type === 'normal' ? '#6b7280' : (window.MONSTER_DATA[m.type] ? `rgb(${window.MONSTER_DATA[m.type].color})` : '#3b82f6');
        let icon = m.type === 'normal' ? '⚔️' : '✨';
        if(m.type === 'fire') icon = '🔥';
        if(m.type === 'water') icon = '💧';
        if(m.type === 'grass') icon = '🌿';
        if(m.type === 'electric') icon = '⚡';
        
        let powerLabel = m.power > 0 ? `위력 ${m.power}` : (m.effect === 'heal' ? '회복기' : '변화기');
        let isUlt = m.power >= 110;
        let borderStyle = isUlt ? `2px solid #fbbf24` : `2px solid rgba(0,0,0,0.3)`;
        let glowStyle = isUlt ? `box-shadow: 0 4px 0 rgba(0,0,0,0.3), 0 0 15px rgba(251, 191, 36, 0.8);` : `box-shadow: 0 4px 0 rgba(0,0,0,0.3);`;
        
        moveButtons += `<button class="btn-primary" data-is-ult="${isUlt}" style="background: ${color}; border: ${borderStyle}; ${glowStyle} font-size: 15px; border-radius: 10px; padding: 12px 0; transition: transform 0.1s, filter 0.3s, opacity 0.3s;" onclick="window.executeBattleTurn('${m.name}', '${m.type}', ${m.power}, '${m.effect || ''}', this)">${icon} ${m.name}<br><span style="font-size:11px; opacity:0.8; font-weight:normal;">${powerLabel}</span></button>`;
    });

    document.getElementById('battle-moves-grid').innerHTML = moveButtons;

    document.getElementById('battle-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.BGM) window.BGM.play('battle');
    if (window.app && window.app.playSfx) window.app.playSfx('success');
};

window.executeBattleTurn = function(moveName = '공격', atkType = 'normal', movePower = 40, effect = '', btnEl = null) {
    let state = window.battleState;
    if (state.myHp <= 0 || state.enemyHp <= 0) return;
    
    let isUlt = movePower >= 110 && !effect;
    
    // 궁극기 1회 제한
    if (isUlt && state.ultUsed) {
        if(window.showToast) window.showToast("궁극기는 전투당 1번만 사용할 수 있습니다!");
        return;
    }

    const btns = document.querySelectorAll('#battle-moves-grid button');
    btns.forEach(b => b.disabled = true);

    if (isUlt) {
        state.ultUsed = true;
        if (btnEl) {
            btnEl.style.opacity = '0.4'; btnEl.style.filter = 'grayscale(100%)'; btnEl.style.transform = 'scale(0.95)';
        }
        
        // ✨ 시네마틱 연출 복구
        let effectColor = atkType === 'fire' ? 'red' : atkType === 'water' ? 'blue' : atkType === 'grass' ? 'green' : atkType === 'electric' ? 'yellow' : 'white';
        let isSpecialUlt = [10034, 10050, 26, 25, 10043, 10079, 10054, 10059].includes(state.myPokeId);
        if (isSpecialUlt) effectColor = 'magenta';
        
        if(!document.getElementById('ult-cinematic-style')) {
            let style = document.createElement('style');
            style.id = 'ult-cinematic-style';
            style.innerHTML = `
                @keyframes speed-lines-anim { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
                @keyframes ult-zoom-in { 0% { transform: translateX(-100vw) scale(1); opacity: 0; } 100% { transform: translateX(0) scale(1.5); opacity: 1; } }
                @keyframes ult-dash-out { 0% { transform: translateX(0) scale(1.5); } 100% { transform: translateX(100vw) scale(2) rotate(15deg); opacity: 0; } }
                @keyframes ult-text-slide { 0% { transform: translateX(50px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes special-ult-bg { 0% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(180deg) brightness(1.5); } 100% { filter: hue-rotate(360deg) brightness(1); } }
                @keyframes special-ult-shake { 0%, 100% { transform: translate(0,0) rotate(0deg); } 25% { transform: translate(-10px,-10px) rotate(-3deg); } 50% { transform: translate(10px,-5px) rotate(3deg); } 75% { transform: translate(-5px,10px) rotate(-1deg); } }
            `;
            document.head.appendChild(style);
        }
        
        let cutin = document.createElement('div');
        cutin.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:3000; display:flex; align-items:center; justify-content:center; overflow:hidden; opacity:0; transition:opacity 0.3s; pointer-events:none;';
        
        if (moveName === '메가파동탄') {
            cutin.innerHTML = `
                <video id="mega-lucario-vid" src="img/characters/megamotion01.mp4" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:1;" autoplay playsinline muted></video>
                <div style="position:absolute; width:300%; height:300%; animation: speed-lines-anim 0.1s linear infinite, special-ult-bg 1s infinite; background:repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px); z-index:2; mix-blend-mode: overlay;"></div>
                <div style="position:absolute; bottom:15%; right:10%; color:white; font-size:55px; font-weight:900; font-style:italic; text-shadow:0 0 20px magenta, 0 0 10px magenta; animation: ult-text-slide 0.3s ease-out 0.3s forwards; opacity:0; z-index:3;">🔥 초궁극기: ${moveName}!!</div>
            `;
            cutin.style.animation = 'special-ult-shake 0.2s infinite';
            document.body.appendChild(cutin);
            
            setTimeout(() => cutin.style.opacity = '1', 50);
            setTimeout(() => { if(window.playPokemonCry) window.playPokemonCry(state.myPokeId, null, true, state.myName, state.myPokeId); }, 400);
            
            setTimeout(() => {
                cutin.style.opacity = '0'; setTimeout(() => cutin.remove(), 300);
                window.processAttackSequence(moveName, atkType, movePower, effect);
            }, 2500); 
        } else {
            let bgExtra = isSpecialUlt ? `animation: speed-lines-anim 0.1s linear infinite, special-ult-bg 1s infinite; background:repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);` : `animation: speed-lines-anim 0.3s linear infinite; background:repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px);`;
            let imgExtra = isSpecialUlt ? `animation: ult-zoom-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, special-ult-shake 0.2s infinite; filter:drop-shadow(0 0 50px ${effectColor}) brightness(1.5);` : `animation: ult-zoom-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; filter:drop-shadow(0 0 30px ${effectColor}) brightness(1.2);`;

            cutin.innerHTML = `
                <div style="position:absolute; width:300%; height:300%; ${bgExtra}"></div>
                <img src="${document.getElementById('battle-my-img').src}" style="width:250px; height:250px; object-fit:contain; ${imgExtra}">
                <div style="position:absolute; bottom:15%; right:10%; color:white; font-size:${isSpecialUlt?'55px':'45px'}; font-weight:900; font-style:italic; text-shadow:0 0 20px ${effectColor}, 0 0 10px ${effectColor}; animation: ult-text-slide 0.3s ease-out 0.3s forwards; opacity:0;">${isSpecialUlt ? '🔥 초궁극기: ' : ''}${moveName}!!</div>
            `;
            document.body.appendChild(cutin);
            
            setTimeout(() => cutin.style.opacity = '1', 50);
            setTimeout(() => { if(window.playPokemonCry) window.playPokemonCry(state.myPokeId, null, state.myStage >= 3, state.myName, state.myPokeId); }, 400);
            
            setTimeout(() => { let img = cutin.querySelector('img'); if(img) img.style.animation = 'ult-dash-out 0.2s ease-in forwards'; }, isSpecialUlt ? 2200 : 1800);
            setTimeout(() => { cutin.style.opacity = '0'; setTimeout(() => cutin.remove(), 300); window.processAttackSequence(moveName, atkType, movePower, effect); }, isSpecialUlt ? 2400 : 2000);
        }
    } else {
        window.processAttackSequence(moveName, atkType, movePower, effect);
    }
};

window.processAttackSequence = function(moveName, atkType, movePower, effect) {
    let state = window.battleState;
    const btns = document.querySelectorAll('#battle-moves-grid button');
    
    if (window.playSkillSound && movePower > 0) window.playSkillSound(atkType, movePower >= 110, moveName);
    let targetEl = (effect === 'heal' || effect === 'atk_up' || effect === 'def_up') ? 'battle-my-img' : 'battle-enemy-img';
    if(window.playSkillEffect) window.playSkillEffect('battle-my-img', targetEl, atkType, movePower, effect, moveName);

    let log = `${state.myName}의 ${moveName}!<br>`;
    
    if (movePower === 0) {
        // ✨ 버프/디버프 처리 복구
        if (effect === 'atk_up') { state.myAtkMod *= 1.5; log += `<span style="color:#3b82f6;">공격력이 크게 올랐다!</span><br>`; }
        else if (effect === 'def_up') { state.myDefMod *= 1.5; log += `<span style="color:#3b82f6;">방어력이 든든해졌다!</span><br>`; }
        else if (effect === 'atk_down') { state.enemyAtkMod *= 0.7; log += `<span style="color:#ef4444;">야생의 ${state.enemyName}의 공격력이 떨어졌다!</span><br>`; }
        else if (effect === 'def_down') { state.enemyDefMod *= 0.7; log += `<span style="color:#ef4444;">야생의 ${state.enemyName}의 방어력이 떨어졌다!</span><br>`; }
        else if (effect === 'heal') {
            let healAmount = Math.floor(state.myMaxHp * 0.4);
            state.myHp = Math.min(state.myMaxHp, state.myHp + healAmount);
            document.getElementById('battle-my-hp').style.width = `${(state.myHp / state.myMaxHp) * 100}%`;
            log += `<span style="color:#10b981;">체력을 크게 회복했다!</span><br>`;
        }
    } else {
        let isCrit = Math.random() < 0.15;
        let levelFactor = Math.floor((2 * state.myLevel) / 5) + 2;
        let statRatio = (state.myStats.atk * state.myAtkMod) / (state.enemyStats.def * state.enemyDefMod); 
        let baseDamage = Math.floor((levelFactor * movePower * statRatio) / 65) + 2;
        
        let stabMult = state.myTypes.includes(atkType) ? 1.5 : 1; // 자속 보정(STAB) 다중 타입 호환
        let multiplier = window.getTypeEffectiveness(atkType, state.enemyTypes);
        let myDamage = Math.floor(baseDamage * stabMult * multiplier * (isCrit ? 1.5 : 1) * ((Math.floor(Math.random() * 16) + 85) / 100));

        if (multiplier > 0 && myDamage < 1) myDamage = 1;

        state.enemyHp = Math.max(0, state.enemyHp - myDamage);
        document.getElementById('battle-enemy-hp').style.width = `${(state.enemyHp / state.enemyMaxHp) * 100}%`;
        
        if (multiplier > 1) log += `<span style="color:#f59e0b; font-weight:900;">효과가 굉장했다!!</span><br>`;
        else if (multiplier < 1 && multiplier > 0) log += `<span style="color:#9ca3af; font-weight:900;">효과가 별로인 것 같다...</span><br>`;
        else if (multiplier === 0) log += `<span style="color:#9ca3af; font-weight:900;">효과가 없는 것 같다...</span><br>`;
        if (isCrit && multiplier > 0) log += `<span style="color:#ef4444; font-weight:900;">급소에 맞았다!!</span><br>`;
        
        if (multiplier === 0) log += `야생의 ${state.enemyName}에게 데미지를 주지 못했다!`;
        else log += `야생의 ${state.enemyName}에게 ${myDamage}의 데미지를 주었다!`;
    }

    document.getElementById('battle-log').innerHTML = log;

    if (state.enemyHp === 0) {
        setTimeout(() => {
            document.getElementById('battle-log').innerHTML = `<b>야생의 ${state.enemyName}은(는) 쓰러졌다!</b><br>배틀에서 승리했다! 🎉`;
            if(window.app && window.app.playSfx) window.app.playSfx('success');
            document.getElementById('battle-actions').style.display = 'none';
            document.getElementById('battle-continue').style.display = 'flex';
        }, 1000);
        return;
    }

    // ✨ 적의 턴 반격 처리 복구
    setTimeout(() => {
        if (state.enemyHp <= 0) return;
        
        let typeMoves = window.TYPE_MOVES[state.enemyTypes[0]] || window.TYPE_MOVES['default'];
        let normalMoves = window.TYPE_MOVES['normal'];
        let enemyAvailableMoves = [typeMoves[0], typeMoves[1], normalMoves[0], normalMoves[1]]; 
        let selectedEnemyMove = enemyAvailableMoves[Math.floor(Math.random() * enemyAvailableMoves.length)];
        
        let enemyAtkType = selectedEnemyMove.power > 0 ? (state.enemyTypes[Math.floor(Math.random() * state.enemyTypes.length)] || 'normal') : 'normal';
        let enemyMovePower = selectedEnemyMove.power;
        let enemyEffect = selectedEnemyMove.effect || '';
        
        if (window.playSkillSound && enemyMovePower > 0) window.playSkillSound(enemyAtkType, false, selectedEnemyMove.name);
        let enemyTargetEl = (enemyEffect === 'heal' || enemyEffect === 'atk_up' || enemyEffect === 'def_up') ? 'battle-enemy-img' : 'battle-my-img';
        if(window.playSkillEffect) window.playSkillEffect('battle-enemy-img', enemyTargetEl, enemyAtkType, enemyMovePower, enemyEffect, selectedEnemyMove.name);
        
        let enemyLog = `야생의 ${state.enemyName}의 ${selectedEnemyMove.name}!<br>`;

        if (enemyMovePower === 0) {
            if (enemyEffect === 'atk_up') { state.enemyAtkMod *= 1.5; enemyLog += `<span style="color:#ef4444;">야생 포켓몬의 공격력이 올랐다!</span><br>`; }
            else if (enemyEffect === 'def_up') { state.enemyDefMod *= 1.5; enemyLog += `<span style="color:#ef4444;">야생 포켓몬의 방어력이 올랐다!</span><br>`; }
            else if (enemyEffect === 'atk_down') { state.myAtkMod *= 0.7; enemyLog += `<span style="color:#3b82f6;">${state.myName}의 공격력이 떨어졌다...</span><br>`; }
            else if (enemyEffect === 'def_down') { state.myDefMod *= 0.7; enemyLog += `<span style="color:#3b82f6;">${state.myName}의 방어력이 떨어졌다...</span><br>`; }
        } else {
            let enemyLevelFactor = Math.floor((2 * state.enemyLevel) / 5) + 2;
            let enemyStatRatio = (state.enemyStats.atk * state.enemyAtkMod) / (state.myStats.def * state.myDefMod);
            let enemyBaseDmg = Math.floor((enemyLevelFactor * enemyMovePower * enemyStatRatio) / 75) + 2; 
            
            let enemyMultiplier = window.getTypeEffectiveness(enemyAtkType, state.myTypes); // 적의 공격을 다중 타입 방어로 계산
            let enemyDamage = Math.floor(enemyBaseDmg * 1.0 * enemyMultiplier * ((Math.floor(Math.random() * 16) + 85) / 100));
            if (enemyMultiplier > 0 && enemyDamage < 1) enemyDamage = 1;

            state.myHp = Math.max(0, state.myHp - enemyDamage);
            document.getElementById('battle-my-hp').style.width = `${(state.myHp / state.myMaxHp) * 100}%`;
            
            if (enemyMultiplier > 1) enemyLog += `<span style="color:#f59e0b; font-weight:900;">효과가 굉장했다!!</span><br>`;
            else if (enemyMultiplier < 1 && enemyMultiplier > 0) enemyLog += `<span style="color:#9ca3af; font-weight:900;">효과가 별로인 것 같다...</span><br>`;
            if (enemyMultiplier === 0) enemyLog += `${state.myName}은(는) 데미지를 입지 않았다!`;
            else enemyLog += `${state.myName}은(는) ${enemyDamage}의 데미지를 입었다!`;
        }
        document.getElementById('battle-log').innerHTML = enemyLog;
        if(window.app && window.app.playSfx && enemyMovePower > 0) window.app.playSfx('eat');
        
        if (state.myHp === 0) {
            setTimeout(() => {
                document.getElementById('battle-log').innerHTML = `<b>${state.myName}은(는) 쓰러졌다...</b><br>눈앞이 깜깜해졌다!`;
                document.getElementById('battle-actions').style.display = 'none';
                document.getElementById('battle-continue').style.display = 'flex';
            }, 1000);
        } else {
            btns.forEach(b => {
                if (b.dataset.isUlt === "true" && state.ultUsed) b.disabled = true;
                else b.disabled = false;
            });
        }
    }, 1800);
};