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