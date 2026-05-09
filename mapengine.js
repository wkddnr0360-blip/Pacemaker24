function MapEngine() {
    // Attrs
    this.imgs = new Object();
    this.playerList = new PlayerList();
    this.moving = false;
    this.zoom = null;

    // Methods
    
    // Load map
    this.loadMap = function() {
        var self = this;
        // 브라우저 로컬(file://) 실행 시 발생하는 CORS 에러를 막기 위해 JSON 데이터를 직접 삽입
        self.map = {
            "name": "페이스 메이커",
            "file": "img/map.png",
            "width": 24, // 맵 가로 타일 개수 (오류 방지용 하드코딩)
            "height": 22, // 맵 세로 타일 개수
            "start": { "x": 6, "y": 9 },
            "walkable": [
                 false, false, false, false, false, false, false, false, false, false, false, false,  true,  true, false, false, false, false, false, false, false, false, false, false,
                 false, false, false, false, false, false, false, false, false, false, false, false,  true,  true, false, false, false, false, false, false, false, false, false, false,
                 false, false, false, false, false, false, false, false, false, false, false, false,  true,  true, false, false, false, false, false, false, false, false, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true, false, false, false, false, false,  true,  true,  true,  true, false, false, false, false, false,  true,  true,  true, false, false,
                 false, false,  true,  true,  true, false, false, false, false, false,  true,  true,  true,  true, false, false, false, false, false,  true,  true,  true, false, false,
                 false, false,  true,  true,  true, false, false, false, false, false,  true,  true,  true,  true, false, false, false, false, false,  true,  true,  true, false, false,
                 false, false,  true,  true, false, false, false, false, false, false,  true,  true,  true, false, false, false, false, false, false,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false, false, false, false, false, false,  true,  true, false, false,
                 false, false,  true,  true,  true, false, false, false, false, false,  true,  true,  true, false, false, false, false, false, false, false,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false, false, false, false, false, false,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false, false, false, false, false, false,  true,  true, false, false,
                 false, false,  true,  true,  true, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false, false, false, false, false,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true, false, false, false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true, false, false, false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false,  true,  true,  true,  true,  true, false, false, false, false,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, false, false,
                 false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false
            ],
            "borders": [
                { "x": 12, "y": -1, "map": "frlg_route1", "start": { "x": 12, "y": 38 } },
                { "x": 13, "y": -1, "map": "frlg_route1", "start": { "x": 13, "y": 38 } },
                { "x": 6, "y": 8, "map": "frlg_bourgpalette_house1_rdc", "start": { "x": 3, "y": 8 } },
                { "x": 15, "y": 8, "map": "frlg_bourgpalette_house2", "start": { "x": 4, "y": 8 } },
                { "x": 16, "y": 14, "map": "frlg_bourgpalette_labo", "start": { "x": 7, "y": 13 } }
            ]
        };

        // Load map image
        this.imgs[this.map.file] = new Image();

        // Get map image dimensions
        this.imgs[this.map.file].onload = function() {
            self.width = this.width / 16;
            self.height = this.height / 16;
        };
        this.imgs[this.map.file].onerror = function() {
            console.error("맵 이미지 로딩 실패! 경로를 확인하세요:", this.src);
        };
        
        // 이벤트 바인딩 후 src를 지정해야 캐시된 이미지도 오류 없이 폭/높이를 계산합니다.
        this.imgs[this.map.file].src = this.map.file;
    }

    // Load characters images
    this.loadCharactersImages = function() {
        var players = this.playerList.players;
        for (var i in players) {
            var src = 'img/characters/' + players[i].character + '.gif';
            if (!(src in this.imgs)) {
                var img = new Image();
                img.src = src;
                this.imgs[src] = img;
            }
        }
    }

    // Check if all images have loaded
    this.checkImagesLoad = function(callback) {
        var size = Object.keys(this.imgs).length;
        var loaded = 0;
        var checkDone = function() {
            loaded++;
            if (loaded === size) callback();
        };
        for (var i in this.imgs) {
            if (this.imgs[i].complete) {
                checkDone();
            }
            else {
                this.imgs[i].onload = checkDone;
                this.imgs[i].onerror = function() {
                    console.error("캐릭터 이미지 로딩 실패! 경로를 확인하세요:", this.src);
                    checkDone(); // 이미지가 없어도 화면 렌더링이 멈추지 않게 강제 진행
                };
            }
        }
    }
}