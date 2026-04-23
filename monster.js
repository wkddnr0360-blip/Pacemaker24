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

window.MONSTER_DATA = {
    fire: {
        name: "불꽃", color: "239, 68, 68",
        bgGradients: [
            "linear-gradient(135deg, #FFE5B4 0%, #FFB347 100%)",
            "linear-gradient(135deg, #FF8C42 0%, #FF5733 100%)",
            "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
            "linear-gradient(135deg, #8B0000 0%, #FF1744 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(255,140,0,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(255,99,71,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(255,69,0,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(255,23,68,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "fire_charizard", name: "리자몽", pokeIds: [4, 5, 6, 10034], stages: ["파이리", "리자드", "리자몽", "메가리자몽"], megaClass: "mega-charizard" },
            { id: "fire_blaziken", name: "번치코", pokeIds: [255, 256, 257, 10050], stages: ["아차모", "영치기", "번치코", "메가번치코"], megaClass: "mega-blaziken" },
            { id: "fire_infernape", name: "초염몽", pokeIds: [390, 391, 392, 392], stages: ["불꽃숭이", "파이숭이", "초염몽", "초염몽"], megaClass: "mega-infernape" },
            { id: "fire_delphox", name: "마폭시", pokeIds: [653, 654, 655, 655], stages: ["푸네코", "테르나", "마폭시", "마폭시"], megaClass: "mega-delphox" },
            { id: "fire_incineroar", name: "어흥염", pokeIds: [725, 726, 727, 727], stages: ["냐오불", "냐오히트", "어흥염", "어흥염"], megaClass: "mega-incineroar" },
            { id: "fire_typhlosion", name: "블레이범", pokeIds: [155, 156, 157, 157], stages: ["브케인", "마그케인", "블레이범", "블레이범"], megaClass: "mega-typhlosion" },
            { id: "fire_cinderace", name: "에이스번", pokeIds: [813, 814, 815, 815], stages: ["염버니", "래비풋", "에이스번", "에이스번"], megaClass: "mega-cinderace" },
            { id: "fire_talonflame", name: "파이어로", pokeIds: [661, 662, 663, 663], stages: ["화살꼬마", "불화살빈", "파이어로", "파이어로"], megaClass: "mega-talonflame" },
            { id: "fire_emboar", name: "염무왕", pokeIds: [498, 499, 500, 500], stages: ["뚜꾸리", "차오꿀", "염무왕", "염무왕"], megaClass: "mega-emboar" },
            { id: "fire_houndoom", name: "헬가", pokeIds: [228, 229, 229, 10048], stages: ["델빌", "헬가", "헬가", "메가헬가"], megaClass: "mega-houndoom" },
            { id: "fire_vulpix", name: "나인테일", pokeIds: [37, 37, 38, 38], stages: ["식스테일", "식스테일", "나인테일", "나인테일"], megaClass: "mega-ninetales" },
            { id: "fire_growlithe", name: "윈디", pokeIds: [58, 58, 59, 59], stages: ["가디", "가디", "윈디", "윈디"], megaClass: "mega-arcanine" },
            { id: "fire_flareon", name: "부스터", pokeIds: [133, 133, 136, 136], stages: ["이브이", "이브이", "부스터", "부스터"], megaClass: "mega-flareon" },
            { id: "fire_ho_oh", name: "칠색조", pokeIds: [250, 250, 250, 250], stages: ["칠색조", "칠색조", "칠색조", "칠색조"], megaClass: "mega-ho-oh" },
            { id: "fire_entei", name: "앤테이", pokeIds: [244, 244, 244, 244], stages: ["앤테이", "앤테이", "앤테이", "앤테이"], megaClass: "mega-entei" },
            { id: "fire_camerupt", name: "폭타", pokeIds: [322, 323, 323, 10087], stages: ["둔타", "폭타", "폭타", "메가폭타"], megaClass: "mega-camerupt" },
            { id: "fire_magmortar", name: "마그마번", pokeIds: [240, 126, 467, 467], stages: ["마그비", "마그마", "마그마번", "마그마번"], megaClass: "mega-magmortar" },
            { id: "fire_centiskorch", name: "다태우지네", pokeIds: [850, 850, 851, 851], stages: ["태우지네", "태우지네", "다태우지네", "다태우지네"], megaClass: "mega-centiskorch" },
            { id: "fire_chandelure", name: "샹델라", pokeIds: [607, 608, 609, 609], stages: ["불켜미", "램프라", "샹델라", "샹델라"], megaClass: "mega-chandelure" }
        ]
    },
    water: {
        name: "물", color: "59, 130, 246",
        bgGradients: [
            "linear-gradient(135deg, #B0E0E6 0%, #87CEEB 100%)",
            "linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)",
            "linear-gradient(135deg, #4682B4 0%, #00008B 100%)",
            "linear-gradient(135deg, #00008B 0%, #1E90FF 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(100,149,237,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(70,130,180,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(30,144,255,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(30,144,255,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "water_blastoise", name: "거북왕", pokeIds: [7, 8, 9, 10036], stages: ["꼬부기", "어니부기", "거북왕", "메가거북왕"], megaClass: "mega-blastoise" },
            { id: "water_swampert", name: "대짱이", pokeIds: [258, 259, 260, 10064], stages: ["물짱이", "늪짱이", "대짱이", "메가대짱이"], megaClass: "mega-swampert" },
            { id: "water_greninja", name: "개굴닌자", pokeIds: [656, 657, 658, 10116], stages: ["개구마르", "개구반장", "개굴닌자", "지우개굴닌자"], megaClass: "mega-greninja" },
            { id: "water_feraligatr", name: "장크로다일", pokeIds: [158, 159, 160, 160], stages: ["리아코", "엘리게이", "장크로다일", "장크로다일"], megaClass: "mega-feraligatr" },
            { id: "water_empoleon", name: "엠페르트", pokeIds: [393, 394, 395, 395], stages: ["팽도리", "팽태보", "엠페르트", "엠페르트"], megaClass: "mega-empoleon" },
            { id: "water_gyarados", name: "갸라도스", pokeIds: [129, 129, 130, 10041], stages: ["잉어킹", "잉어킹", "갸라도스", "메가갸라도스"], megaClass: "mega-gyarados" },
            { id: "water_inteleon", name: "인텔리레온", pokeIds: [816, 817, 818, 818], stages: ["울머기", "누겔레온", "인텔리레온", "인텔리레온"], megaClass: "mega-inteleon" },
            { id: "water_primarina", name: "누리레느", pokeIds: [728, 729, 730, 730], stages: ["누리공", "키요공", "누리레느", "누리레느"], megaClass: "mega-primarina" },
            { id: "water_samurott", name: "대검귀", pokeIds: [501, 502, 503, 503], stages: ["수댕이", "쌍검자비", "대검귀", "대검귀"], megaClass: "mega-samurott" },
            { id: "water_milotic", name: "밀로틱", pokeIds: [349, 349, 350, 350], stages: ["빈티나", "빈티나", "밀로틱", "밀로틱"], megaClass: "mega-milotic" },
            { id: "water_psyduck", name: "골덕", pokeIds: [54, 54, 55, 55], stages: ["고라파덕", "고라파덕", "골덕", "골덕"], megaClass: "mega-golduck" },
            { id: "water_vaporeon", name: "샤미드", pokeIds: [133, 133, 134, 134], stages: ["이브이", "이브이", "샤미드", "샤미드"], megaClass: "mega-vaporeon" },
            { id: "water_spheal", name: "씨카이저", pokeIds: [363, 364, 365, 365], stages: ["대굴레오", "씨레오", "씨카이저", "씨카이저"], megaClass: "mega-walrein" },
            { id: "water_suicune", name: "스이쿤", pokeIds: [245, 245, 245, 245], stages: ["스이쿤", "스이쿤", "스이쿤", "스이쿤"], megaClass: "mega-suicune" },
            { id: "water_lapras", name: "라프라스", pokeIds: [131, 131, 131, 131], stages: ["라프라스", "라프라스", "라프라스", "라프라스"], megaClass: "mega-lapras" },
            { id: "water_sharpedo", name: "샤크니아", pokeIds: [318, 319, 319, 10070], stages: ["샤프니아", "샤크니아", "샤크니아", "메가샤크니아"], megaClass: "mega-sharpedo" },
            { id: "water_cloyster", name: "파르셀", pokeIds: [90, 91, 91, 91], stages: ["셀러", "파르셀", "파르셀", "파르셀"], megaClass: "mega-cloyster" },
            { id: "water_glalie", name: "얼음귀신", pokeIds: [361, 361, 362, 10074], stages: ["눈꼬마", "눈꼬마", "얼음귀신", "메가얼음귀신"], megaClass: "mega-glalie" },
            { id: "water_kingler", name: "킹크랩", pokeIds: [98, 98, 99, 99], stages: ["크랩", "크랩", "킹크랩", "킹크랩"], megaClass: "mega-kingler" },
            { id: "water_quagsire", name: "누오", pokeIds: [194, 194, 195, 195], stages: ["우파", "우파", "누오", "누오"], megaClass: "mega-quagsire" }
        ]
    },
    grass: {
        name: "풀", color: "16, 185, 129",
        bgGradients: [
            "linear-gradient(135deg, #90EE90 0%, #7CFC00 100%)",
            "linear-gradient(135deg, #7CFC00 0%, #32CD32 100%)",
            "linear-gradient(135deg, #32CD32 0%, #006400 100%)",
            "linear-gradient(135deg, #006400 0%, #355E3B 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(144,238,144,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(50,205,50,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(0,100,0,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(0,100,0,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "grass_venusaur", name: "이상해꽃", pokeIds: [1, 2, 3, 10033], stages: ["이상해씨", "이상해풀", "이상해꽃", "메가이상해꽃"], megaClass: "mega-venusaur" },
            { id: "grass_sceptile", name: "나무킹", pokeIds: [252, 253, 254, 10065], stages: ["나무지기", "나무돌이", "나무킹", "메가나무킹"], megaClass: "mega-sceptile" },
            { id: "grass_meganium", name: "메가니움", pokeIds: [152, 153, 154, 154], stages: ["치코리타", "베이리프", "메가니움", "메가니움"], megaClass: "mega-meganium" },
            { id: "grass_torterra", name: "토대부기", pokeIds: [387, 388, 389, 389], stages: ["모부기", "수풀부기", "토대부기", "토대부기"], megaClass: "mega-torterra" },
            { id: "grass_decidueye", name: "모크나이퍼", pokeIds: [722, 723, 724, 724], stages: ["나몰빼미", "빼미스로우", "모크나이퍼", "모크나이퍼"], megaClass: "mega-decidueye" },
            { id: "grass_serperior", name: "샤로다", pokeIds: [495, 496, 497, 497], stages: ["주리비얀", "샤비", "샤로다", "샤로다"], megaClass: "mega-serperior" },
            { id: "grass_chesnaught", name: "브리가론", pokeIds: [650, 651, 652, 652], stages: ["도치마론", "도치보구", "브리가론", "브리가론"], megaClass: "mega-chesnaught" },
            { id: "grass_rillaboom", name: "고릴타", pokeIds: [810, 811, 812, 812], stages: ["흥나숭", "채키몽", "고릴타", "고릴타"], megaClass: "mega-rillaboom" },
            { id: "grass_meowscarada", name: "마스카나", pokeIds: [906, 907, 908, 908], stages: ["나오하", "나로테", "마스카나", "마스카나"], megaClass: "mega-meowscarada" },
            { id: "grass_abomasnow", name: "눈설왕", pokeIds: [459, 459, 460, 10060], stages: ["눈쓰개", "눈쓰개", "눈설왕", "메가눈설왕"], megaClass: "mega-abomasnow" },
            { id: "grass_leafeon", name: "리피아", pokeIds: [133, 133, 470, 470], stages: ["이브이", "이브이", "리피아", "리피아"], megaClass: "mega-leafeon" },
            { id: "grass_bellsprout", name: "우츠보트", pokeIds: [69, 70, 71, 71], stages: ["모다피", "우츠동", "우츠보트", "우츠보트"], megaClass: "mega-victreebel" },
            { id: "grass_budew", name: "로즈레이드", pokeIds: [406, 400, 407, 407], stages: ["꼬몽울", "로젤리아", "로즈레이드", "로즈레이드"], megaClass: "mega-roserade" },
            { id: "grass_celebi", name: "세레비", pokeIds: [251, 251, 251, 251], stages: ["세레비", "세레비", "세레비", "세레비"], megaClass: "mega-celebi" },
            { id: "grass_shaymin", name: "쉐이미", pokeIds: [492, 492, 492, 10006], stages: ["쉐이미", "쉐이미", "쉐이미", "스카이폼"], megaClass: "mega-shaymin" },
            { id: "grass_pinsir", name: "쁘사이저", pokeIds: [127, 127, 127, 10040], stages: ["쁘사이저", "쁘사이저", "쁘사이저", "메가쁘사이저"], megaClass: "mega-pinsir" },
            { id: "grass_heracross", name: "헤라크로스", pokeIds: [214, 214, 214, 10047], stages: ["헤라크로스", "헤라크로스", "헤라크로스", "메가헤라크로스"], megaClass: "mega-heracross" },
            { id: "grass_beedrill", name: "독침붕", pokeIds: [13, 14, 15, 10090], stages: ["뿔충이", "딱충이", "독침붕", "메가독침붕"], megaClass: "mega-beedrill" },
            { id: "grass_scizor", name: "핫삼", pokeIds: [123, 123, 212, 10046], stages: ["스라크", "스라크", "핫삼", "메가핫삼"], megaClass: "mega-scizor" },
            { id: "grass_pidgeot", name: "피죤투", pokeIds: [16, 17, 18, 10073], stages: ["구구", "피죤", "피죤투", "메가피죤투"], megaClass: "mega-pidgeot" },
            { id: "grass_lilligant", name: "드레디어", pokeIds: [548, 548, 549, 549], stages: ["치릴리", "치릴리", "드레디어", "드레디어"], megaClass: "mega-lilligant" },
            { id: "grass_cherrim", name: "체리꼬", pokeIds: [420, 420, 421, 421], stages: ["체리버", "체리버", "체리꼬", "체리꼬"], megaClass: "mega-cherrim" }
        ]
    },
    electric: {
        name: "번개", color: "234, 179, 8",
        bgGradients: [
            "linear-gradient(135deg, #FFFF99 0%, #FFFF00 100%)",
            "linear-gradient(135deg, #FFFF00 0%, #FFD700 100%)",
            "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(255,255,0,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(255,215,0,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(255,140,0,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(255,255,0,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "electric_ampharos", name: "전룡", pokeIds: [179, 180, 181, 10045], stages: ["메리프", "보송송", "전룡", "메가전룡"], megaClass: "mega-ampharos" },
            { id: "electric_luxray", name: "렌트라", pokeIds: [403, 404, 405, 405], stages: ["꼬링크", "럭시오", "렌트라", "렌트라"], megaClass: "mega-luxray" },
            { id: "electric_electivire", name: "에레키블", pokeIds: [239, 125, 466, 466], stages: ["에레키드", "에레브", "에레키블", "에레키블"], megaClass: "mega-electivire" },
            { id: "electric_magnezone", name: "자포코일", pokeIds: [81, 82, 462, 462], stages: ["코일", "레어코일", "자포코일", "자포코일"], megaClass: "mega-magnezone" },
            { id: "electric_raichu", name: "라이츄", pokeIds: [172, 25, 26, 26], stages: ["피츄", "피카츄", "라이츄", "라이츄"], megaClass: "mega-raichu" },
            { id: "electric_manectric", name: "썬더볼트", pokeIds: [309, 310, 310, 10055], stages: ["썬더라이", "썬더볼트", "썬더볼트", "메가썬더볼트"], megaClass: "mega-manectric" },
            { id: "electric_toxtricity", name: "스트린더", pokeIds: [848, 848, 849, 849], stages: ["일렉젤", "일렉젤", "스트린더", "스트린더"], megaClass: "mega-toxtricity" },
            { id: "electric_vikavolt", name: "투구뿌논", pokeIds: [736, 737, 738, 738], stages: ["턱지충이", "전지충이", "투구뿌논", "투구뿌논"], megaClass: "mega-vikavolt" },
            { id: "electric_eelektross", name: "저리더프", pokeIds: [602, 603, 604, 604], stages: ["저리어", "저리릴", "저리더프", "저리더프"], megaClass: "mega-eelektross" },
            { id: "electric_pawmot", name: "빠모트", pokeIds: [921, 922, 923, 923], stages: ["빠모", "빠모트", "빠르모트", "빠르모트"], megaClass: "mega-pawmot" },
            { id: "electric_jolteon", name: "쥬피썬더", pokeIds: [133, 133, 135, 135], stages: ["이브이", "이브이", "쥬피썬더", "쥬피썬더"], megaClass: "mega-jolteon" },
            { id: "electric_pachirisu", name: "파치리스", pokeIds: [417, 417, 417, 417], stages: ["파치리스", "파치리스", "파치리스", "파치리스"], megaClass: "mega-pachirisu" },
            { id: "electric_dedenne", name: "데덴네", pokeIds: [702, 702, 702, 702], stages: ["데덴네", "데덴네", "데덴네", "데덴네"], megaClass: "mega-dedenne" },
            { id: "electric_yamper", name: "펄스멍", pokeIds: [835, 835, 836, 836], stages: ["멍파치", "멍파치", "펄스멍", "펄스멍"], megaClass: "mega-boltund" },
            { id: "electric_zapdos", name: "썬더", pokeIds: [145, 145, 145, 145], stages: ["썬더", "썬더", "썬더", "썬더"], megaClass: "mega-zapdos" },
            { id: "electric_raikou", name: "라이코", pokeIds: [243, 243, 243, 243], stages: ["라이코", "라이코", "라이코", "라이코"], megaClass: "mega-raikou" },
            { id: "electric_electrode", name: "붐볼", pokeIds: [100, 101, 101, 101], stages: ["찌리리공", "붐볼", "붐볼", "붐볼"], megaClass: "mega-electrode" },
            { id: "electric_pincurchin", name: "찌르성게", pokeIds: [871, 871, 871, 871], stages: ["찌르성게", "찌르성게", "찌르성게", "찌르성게"], megaClass: "mega-pincurchin" },
            { id: "electric_galvantula", name: "전툴라", pokeIds: [595, 595, 596, 596], stages: ["파쪼꼬", "파쪼꼬", "전툴라", "전툴라"], megaClass: "mega-galvantula" },
            { id: "electric_emolga", name: "에몽가", pokeIds: [587, 587, 587, 587], stages: ["에몽가", "에몽가", "에몽가", "에몽가"], megaClass: "mega-emolga" },
            { id: "electric_morpeko", name: "모르페코", pokeIds: [877, 877, 877, 877], stages: ["모르페코", "모르페코", "모르페코", "모르페코"], megaClass: "mega-morpeko" }
        ]
    },
    psychic: {
        name: "초능력", color: "168, 85, 247",
        bgGradients: [
            "linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%)",
            "linear-gradient(135deg, #DA70D6 0%, #BA55D3 100%)",
            "linear-gradient(135deg, #BA55D3 0%, #9932CC 100%)",
            "linear-gradient(135deg, #9932CC 0%, #8B008B 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(221,160,221,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(186,85,211,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(153,50,204,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(153,50,204,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "psychic_alakazam", name: "후딘", pokeIds: [63, 64, 65, 10037], stages: ["캐이시", "윤겔라", "후딘", "메가후딘"], megaClass: "mega-alakazam" },
            { id: "psychic_metagross", name: "메타그로스", pokeIds: [374, 375, 376, 10076], stages: ["메탕", "메탕구", "메타그로스", "메가메타그로스"], megaClass: "mega-metagross" },
            { id: "psychic_gengar", name: "팬텀", pokeIds: [92, 93, 94, 10038], stages: ["고오스", "고우스트", "팬텀", "메가팬텀"], megaClass: "mega-gengar" },
            { id: "psychic_reuniclus", name: "란쿨루스", pokeIds: [577, 578, 579, 579], stages: ["유니란", "듀란", "란쿨루스", "란쿨루스"], megaClass: "mega-reuniclus" },
            { id: "psychic_gallade", name: "엘레이드", pokeIds: [280, 281, 475, 10068], stages: ["랄토스", "킬리아", "엘레이드", "메가엘레이드"], megaClass: "mega-gallade" },
            { id: "psychic_slowbro", name: "야도란", pokeIds: [79, 79, 80, 10071], stages: ["야돈", "야돈", "야도란", "메가야도란"], megaClass: "mega-slowbro" },
            { id: "psychic_hatterene", name: "브리무음", pokeIds: [856, 857, 858, 858], stages: ["몸지브림", "손지브림", "브리무음", "브리무음"], megaClass: "mega-hatterene" },
            { id: "psychic_gothitelle", name: "고디모아젤", pokeIds: [574, 575, 576, 576], stages: ["고디탱", "고디보미", "고디모아젤", "고디모아젤"], megaClass: "mega-gothitelle" },
            { id: "psychic_espeon", name: "에브이", pokeIds: [133, 133, 196, 196], stages: ["이브이", "이브이", "에브이", "에브이"], megaClass: "mega-espeon" },
            { id: "psychic_mew", name: "뮤", pokeIds: [151, 151, 151, 151], stages: ["뮤", "뮤", "뮤", "뮤"], megaClass: "mega-mew" },
            { id: "psychic_mewtwo", name: "뮤츠", pokeIds: [150, 150, 150, 10043], stages: ["뮤츠", "뮤츠", "뮤츠", "메가뮤츠X"], megaClass: "mega-mewtwo" },
            { id: "psychic_lugia", name: "루기아", pokeIds: [249, 249, 249, 249], stages: ["루기아", "루기아", "루기아", "루기아"], megaClass: "mega-lugia" },
            { id: "psychic_lucario", name: "루카리오", pokeIds: [447, 448, 448, 10059], stages: ["리오르", "루카리오", "루카리오", "메가루카리오"], megaClass: "mega-lucario" },
            { id: "psychic_lopunny", name: "이어롭", pokeIds: [427, 428, 428, 10088], stages: ["이어롤", "이어롭", "이어롭", "메가이어롭"], megaClass: "mega-lopunny" },
            { id: "psychic_medicham", name: "요가램", pokeIds: [307, 307, 308, 10054], stages: ["요가랑", "요가랑", "요가램", "메가요가램"], megaClass: "mega-medicham" },
            { id: "psychic_audino", name: "다부니", pokeIds: [531, 531, 531, 10069], stages: ["다부니", "다부니", "다부니", "메가다부니"], megaClass: "mega-audino" }
        ]
    },
    dark: {
        name: "어둠", color: "107, 33, 168",
        bgGradients: [
            "linear-gradient(135deg, #4B0082 0%, #663399 100%)",
            "linear-gradient(135deg, #663399 0%, #483D8B 100%)",
            "linear-gradient(135deg, #483D8B 0%, #2F4F4F 100%)",
            "linear-gradient(135deg, #1a0033 0%, #330066 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(138,43,226,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(75,0,130,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(47,79,79,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(75,0,130,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "dark_tyranitar", name: "마기라스", pokeIds: [246, 247, 248, 10049], stages: ["애버라스", "데기라스", "마기라스", "메가마기라스"], megaClass: "mega-tyranitar" },
            { id: "dark_hydreigon", name: "삼삼드래", pokeIds: [633, 634, 635, 635], stages: ["모노두", "디헤드", "삼삼드래", "삼삼드래"], megaClass: "mega-hydreigon" },
            { id: "dark_krookodile", name: "악비아르", pokeIds: [551, 552, 553, 553], stages: ["깜눈크", "악비르", "악비아르", "악비아르"], megaClass: "mega-krookodile" },
            { id: "dark_grimmsnarl", name: "오롱털", pokeIds: [859, 860, 861, 861], stages: ["임프딤프", "모그렘", "오롱털", "오롱털"], megaClass: "mega-grimmsnarl" },
            { id: "dark_shiftry", name: "다탱구", pokeIds: [273, 274, 275, 275], stages: ["도토리", "잎새코", "다탱구", "다탱구"], megaClass: "mega-shiftry" },
            { id: "dark_absol", name: "앱솔", pokeIds: [359, 359, 359, 10057], stages: ["앱솔", "앱솔", "앱솔", "메가앱솔"], megaClass: "mega-absol" },
            { id: "dark_umbreon", name: "블래키", pokeIds: [133, 133, 197, 197], stages: ["이브이", "이브이", "블래키", "블래키"], megaClass: "mega-umbreon" },
            { id: "dark_zoroark", name: "조로아크", pokeIds: [570, 571, 571, 571], stages: ["조로아", "조로아크", "조로아크", "조로아크"], megaClass: "mega-zoroark" },
            { id: "dark_obstagoon", name: "가로막구리", pokeIds: [263, 264, 862, 862], stages: ["지그제구리", "직구리", "가로막구리", "가로막구리"], megaClass: "mega-obstagoon" },
            { id: "dark_bisharp", name: "절각참", pokeIds: [624, 625, 625, 625], stages: ["자망칼", "절각참", "절각참", "절각참"], megaClass: "mega-bisharp" },
            { id: "dark_purrloin", name: "레파르다스", pokeIds: [509, 509, 510, 510], stages: ["쌔비냥", "쌔비냥", "레파르다스", "레파르다스"], megaClass: "mega-liepard" },
            { id: "dark_sneasel", name: "포푸니라", pokeIds: [215, 215, 461, 461], stages: ["포푸니", "포푸니", "포푸니라", "포푸니라"], megaClass: "mega-weavile" },
            { id: "dark_darkrai", name: "다크라이", pokeIds: [491, 491, 491, 491], stages: ["다크라이", "다크라이", "다크라이", "다크라이"], megaClass: "mega-darkrai" },
            { id: "dark_yveltal", name: "이벨타르", pokeIds: [717, 717, 717, 717], stages: ["이벨타르", "이벨타르", "이벨타르", "이벨타르"], megaClass: "mega-yveltal" },
            { id: "dark_sableye", name: "깜까미", pokeIds: [302, 302, 302, 10066], stages: ["깜까미", "깜까미", "깜까미", "메가깜까미"], megaClass: "mega-sableye" },
            { id: "dark_banette", name: "다크펫", pokeIds: [353, 354, 354, 10056], stages: ["어둠대신", "다크펫", "다크펫", "메가다크펫"], megaClass: "mega-banette" },
            { id: "dark_aggron", name: "보스로라", pokeIds: [304, 305, 306, 10053], stages: ["가보리", "갱도라", "보스로라", "메가보스로라"], megaClass: "mega-aggron" },
            { id: "dark_steelix", name: "강철톤", pokeIds: [95, 95, 208, 10072], stages: ["롱스톤", "롱스톤", "강철톤", "메가강철톤"], megaClass: "mega-steelix" },
            { id: "dark_honchkrow", name: "돈크로우", pokeIds: [198, 198, 430, 430], stages: ["니로우", "니로우", "돈크로우", "돈크로우"], megaClass: "mega-honchkrow" }
        ]
    },
    dragon: {
        name: "드래곤", color: "99, 102, 241",
        bgGradients: [
            "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
            "linear-gradient(135deg, #A5B4FC 0%, #818CF8 100%)",
            "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
            "linear-gradient(135deg, #4338CA 0%, #312E81 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(99,102,241,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(79,70,229,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(67,56,202,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(49,46,129,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "dragon_salamence", name: "보만다", pokeIds: [371, 372, 373, 10089], stages: ["아공이", "쉘곤", "보만다", "메가보만다"], megaClass: "mega-salamence" },
            { id: "dragon_garchomp", name: "한카리아스", pokeIds: [443, 444, 445, 10058], stages: ["딥상어동", "한바이트", "한카리아스", "메가한카리아스"], megaClass: "mega-garchomp" },
            { id: "dragon_dragonite", name: "망나뇽", pokeIds: [147, 148, 149, 149], stages: ["미뇽", "신뇽", "망나뇽", "망나뇽"], megaClass: "mega-dragonite" },
            { id: "dragon_haxorus", name: "액스라이즈", pokeIds: [610, 611, 612, 612], stages: ["터검니", "액스도", "액스라이즈", "액스라이즈"], megaClass: "mega-haxorus" },
            { id: "dragon_goodra", name: "미끄래곤", pokeIds: [704, 705, 706, 706], stages: ["미끄메라", "미끄네일", "미끄래곤", "미끄래곤"], megaClass: "mega-goodra" },
            { id: "dragon_altaria", name: "파비코리", pokeIds: [333, 334, 334, 10067], stages: ["파비코", "파비코리", "파비코리", "메가파비코리"], megaClass: "mega-altaria" },
            { id: "dragon_flygon", name: "플라이곤", pokeIds: [328, 329, 330, 330], stages: ["톱치", "비브라바", "플라이곤", "플라이곤"], megaClass: "mega-flygon" },
            { id: "dragon_dragapult", name: "드래펄트", pokeIds: [885, 886, 887, 887], stages: ["드라꼬", "드래런치", "드래펄트", "드래펄트"], megaClass: "mega-dragapult" },
            { id: "dragon_kommo_o", name: "짜랑고우거", pokeIds: [782, 783, 784, 784], stages: ["짜랑꼬", "짜랑고우", "짜랑고우거", "짜랑고우거"], megaClass: "mega-kommo_o" },
            { id: "dragon_baxcalibur", name: "드닐레이브", pokeIds: [996, 997, 998, 998], stages: ["드니차", "드니꽁", "드닐레이브", "드닐레이브"], megaClass: "mega-baxcalibur" },
            { id: "dragon_applin", name: "애프룡", pokeIds: [840, 841, 841, 841], stages: ["과사삭벌레", "애프룡", "애프룡", "애프룡"], megaClass: "mega-flapple" },
            { id: "dragon_noibat", name: "음번", pokeIds: [714, 714, 715, 715], stages: ["음뱃", "음뱃", "음번", "음번"], megaClass: "mega-noivern" },
            { id: "dragon_rayquaza", name: "레쿠쟈", pokeIds: [384, 384, 384, 10079], stages: ["레쿠쟈", "레쿠쟈", "레쿠쟈", "메가레쿠쟈"], megaClass: "mega-rayquaza" },
            { id: "dragon_latias", name: "라티아스", pokeIds: [380, 380, 380, 10062], stages: ["라티아스", "라티아스", "라티아스", "메가라티아스"], megaClass: "mega-latias" },
            { id: "dragon_latios", name: "라티오스", pokeIds: [381, 381, 381, 10063], stages: ["라티오스", "라티오스", "라티오스", "메가라티오스"], megaClass: "mega-latios" },
            { id: "dragon_aerodactyl", name: "프테라", pokeIds: [142, 142, 142, 10042], stages: ["프테라", "프테라", "프테라", "메가프테라"], megaClass: "mega-aerodactyl" },
            { id: "dragon_kangaskhan", name: "캥카", pokeIds: [115, 115, 115, 10039], stages: ["캥카", "캥카", "캥카", "메가캥카"], megaClass: "mega-kangaskhan" },
            { id: "dragon_duraludon", name: "두랄루돈", pokeIds: [884, 884, 884, 884], stages: ["두랄루돈", "두랄루돈", "두랄루돈", "두랄루돈"], megaClass: "mega-duraludon" }
        ]
    },
    normal: {
        name: "노말", color: "156, 163, 175",
        bgGradients: [
            "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
            "linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)",
            "linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)",
            "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(156,163,175,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(107,114,128,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(75,85,99,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(55,65,81,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "normal_eevee", name: "이브이", pokeIds: [133, 133, 133, 133], stages: ["이브이", "이브이", "이브이", "이브이"], megaClass: "mega-eevee" },
            { id: "normal_snorlax", name: "잠만보", pokeIds: [446, 143, 143, 143], stages: ["먹고자", "잠만보", "잠만보", "잠만보"], megaClass: "mega-snorlax" },
            { id: "normal_ditto", name: "메타몽", pokeIds: [132, 132, 132, 132], stages: ["메타몽", "메타몽", "메타몽", "메타몽"], megaClass: "mega-ditto" },
            { id: "normal_skitty", name: "에나비", pokeIds: [300, 300, 301, 301], stages: ["에나비", "에나비", "델케티", "델케티"], megaClass: "mega-skitty" },
            { id: "normal_meowth", name: "나옹", pokeIds: [52, 52, 53, 53], stages: ["나옹", "나옹", "페르시온", "페르시온"], megaClass: "mega-meowth" }
        ]
    },
    fairy: {
        name: "페어리", color: "244, 114, 182",
        bgGradients: [
            "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)",
            "linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%)",
            "linear-gradient(135deg, #F9A8D4 0%, #F472B6 100%)",
            "linear-gradient(135deg, #F472B6 0%, #EC4899 100%)"
        ],
        effects: [
            "brightness(0.95) drop-shadow(0 0 5px rgba(244,114,182,0.5))",
            "brightness(1.05) drop-shadow(0 0 10px rgba(236,72,153,0.7))",
            "brightness(1.15) drop-shadow(0 0 15px rgba(219,39,119,0.9))",
            "brightness(1.3) drop-shadow(0 0 30px rgba(190,24,93,1)) saturate(1.5)"
        ],
        monsters: [
            { id: "fairy_clefairy", name: "삐삐", pokeIds: [173, 35, 36, 36], stages: ["삐", "삐삐", "픽시", "픽시"], megaClass: "mega-clefairy" },
            { id: "fairy_jigglypuff", name: "푸린", pokeIds: [174, 39, 40, 40], stages: ["푸푸린", "푸린", "푸크린", "푸크린"], megaClass: "mega-jigglypuff" },
            { id: "fairy_mimikyu", name: "따라큐", pokeIds: [778, 778, 778, 778], stages: ["따라큐", "따라큐", "따라큐", "따라큐"], megaClass: "mega-mimikyu" },
            { id: "fairy_tinkaton", name: "두드리짱", pokeIds: [957, 958, 959, 959], stages: ["어리짱", "벼리짱", "두드리짱", "두드리짱"], megaClass: "mega-tinkaton" },
            { id: "fairy_togepi", name: "토게키스", pokeIds: [175, 176, 468, 468], stages: ["토게피", "토게틱", "토게키스", "토게키스"], megaClass: "mega-togekiss" },
            { id: "fairy_gardevoir", name: "가디안", pokeIds: [280, 281, 282, 10051], stages: ["랄토스", "킬리아", "가디안", "메가가디안"], megaClass: "mega-gardevoir" },
            { id: "fairy_sylveon", name: "님피아", pokeIds: [133, 133, 700, 700], stages: ["이브이", "이브이", "님피아", "님피아"], megaClass: "mega-sylveon" },
            { id: "fairy_azumarill", name: "마릴리", pokeIds: [298, 183, 184, 184], stages: ["루리리", "마릴", "마릴리", "마릴리"], megaClass: "mega-azumarill" },
            { id: "fairy_mawile", name: "입치트", pokeIds: [303, 303, 303, 10052], stages: ["입치트", "입치트", "입치트", "메가입치트"], megaClass: "mega-mawile" },
            { id: "fairy_florges", name: "플라제스", pokeIds: [669, 670, 671, 671], stages: ["플라베베", "플라엣", "플라제스", "플라제스"], megaClass: "mega-florges" },
            { id: "fairy_alcremie", name: "마휘핑", pokeIds: [868, 868, 869, 869], stages: ["마빌크", "마빌크", "마휘핑", "마휘핑"], megaClass: "mega-alcremie" }
        ]
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
            titleEl.innerHTML = `<span style="color:var(--primary);">${displayName}</span> <span style="opacity:0.6; font-size:12px;">|</span> ${currentStageIdx >= 3 ? '⭐ 메가진화' : stageName}`;
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
        
        if (m.status !== "egg") {
            try {
                let pokeData = await window.PokeAPI.getPokemon(pokeId);
                if (pokeData && pokeData.name) {
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
            return `<div class="bag-item-grid ${isDisplay ? 'active' : ''}" style="${bgStyle}">${imagePart}<div style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:3px; z-index:5; text-align:center; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName}</div><div style="font-size:10px; font-weight:700; color:var(--text-muted); background:var(--bg); border:1px solid var(--border-color); padding:3px 6px; border-radius:8px; z-index:5; margin-bottom:6px; text-align:center; white-space:nowrap;">${stageName}</div><div style="display:flex; gap:4px; margin-top:auto; z-index:10; width:100%; justify-content:center; flex-direction:column;">${btn.replace('border-radius:6px;', 'border-radius:6px; width:100%; padding-left:0; padding-right:0;')}${formBtn.replace('border-radius:6px;', 'border-radius:6px; width:100%; padding-left:0; padding-right:0;')}</div></div>`;
        } else {
            return `<div class="bag-item ${isDisplay ? 'active' : ''}" style="${bgStyle}">${imagePart}<div style="flex-grow:1; display:flex; flex-direction:column; min-width:0; padding-right:10px;"><span style="font-size:13px; font-weight:800; color:var(--text-main); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName} - <span style="font-weight:700; font-size:11px;">${stageName}</span></span>${info}</div><div style="display:flex; flex-direction:column; align-items:stretch; flex-shrink:0; min-width:70px;">${btn}${formBtn}</div></div>`;
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
                
                html += `<div style="background: var(--surface); border: 1px solid var(--border-color); padding: 10px; border-radius: 12px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="SFX.play('pop'); showEvolutionChain('${type}', '${m.id}')">
                            <img src="${imgUrl}" style="width:55px; height:55px; object-fit:contain; transform:scale(1.1); filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));" loading="lazy">
                            <div style="font-size: 13px; font-weight: 700; color: var(--text-main); line-height: 1.3;">
                                ${m.name}${megaStr}
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

// ------------------------------------------
// 4. 실험실 (Lab) 전용 도구 복구
// ------------------------------------------
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
    try {
        if(window.showToast) window.showToast("⏳ 도감을 불러오는 중...");
        let addCount = 0;
        for (let type in window.MONSTER_DATA) {
            let typeData = window.MONSTER_DATA[type];
            for (let monster of typeData.monsters) {
                let isExists = window.monsterData.inventory.some(m => m.type === type && m.monsterSubId === monster.id && m.status === "retired");
                if (!isExists) {
                    let finalHours = window.getEvolutionHours(monster)[window.getEvolutionHours(monster).length - 1];
                    window.monsterData.inventory.push({ id: `p_${Date.now()}_${addCount}`, type: type, monsterSubId: monster.id, status: "retired", startDate: window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0], totalSeconds: finalHours * 3600, bonusSeconds: 0 });
                    addCount++;
                }
            }
        }
        if (addCount === 0) return window.showToast ? window.showToast("ℹ️ 이미 모든 도감이 해금되어있습니다.") : null;
        
        let dataStr = JSON.stringify(window.monsterData);
        if (dataStr.length > 4950000) {  
            if(window.showToast) window.showToast("⚠️ 저장소 용량 부족! 도감 일부만 추가됩니다.");
            window.monsterData.inventory = window.monsterData.inventory.slice(-30);
            dataStr = JSON.stringify(window.monsterData);
        }
        if(window.setL) window.setL('monsterData', dataStr);
        document.getElementById('settings-modal').style.display = 'none';
        setTimeout(() => {
            window.openMonsterBag();
            if(window.triggerAutoSync) window.triggerAutoSync();
            if(window.showToast) window.showToast(`✅ [실험실] ${addCount}개의 도감이 해금되었습니다!`);
        }, 100);
    } catch(err) {
        if(window.showToast) window.showToast("❌ 도감 로딩 중 오류가 발생했습니다.");
    }
};

window.labInstantHatch = function() {
    let eggs = window.monsterData.inventory.filter(x => x.status === "egg");
    if(eggs.length === 0) return window.showToast ? window.showToast("가방에 부화 대기 중인 알이 없습니다. 먼저 알을 지급받으세요.") : null;
    
    if (window.monsterData.activeId) {
        let active = window.monsterData.inventory.find(m => m.id === window.monsterData.activeId);
        if (active && active.status === "active") {
            active.status = "retired"; active.endDate = window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0];
            active.totalSeconds = window.calculateActiveMonsterExp(active);
        }
    }

    let egg = eggs[0];
    const types = Object.keys(window.MONSTER_DATA);
    const type = types[Math.floor(Math.random() * types.length)];
    egg.type = type; egg.monsterSubId = window.MONSTER_DATA[type].monsters[Math.floor(Math.random() * window.MONSTER_DATA[type].monsters.length)].id;
    egg.status = "active"; egg.startDate = window.Utils ? window.Utils.getLogicalDateString() : new Date().toISOString().split('T')[0];
    egg.totalSeconds = 0; egg.selectedStage = 0;
    
    window.monsterData.activeId = egg.id; window.monsterData.displayId = egg.id;
    if(window.setL) window.setL('monsterData', JSON.stringify(window.monsterData));
    window.updateMonsterUI(); 
    let bagModal = document.getElementById('monster-bag-modal');
    if (bagModal && bagModal.style.display === 'flex') window.openMonsterBag(true);
    if(window.triggerAutoSync) window.triggerAutoSync();
    if(window.SFX) window.SFX.play('success');
    if(window.showToast) window.showToast("⚪ [실험실] 알이 즉시 부화했습니다!");
};