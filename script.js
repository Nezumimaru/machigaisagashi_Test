document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const markersLayer = document.getElementById('markersLayer');
    const foundCountEl = document.getElementById('foundCount');
    const gameOverModal = document.getElementById('gameOverModal');
    const lifeCountEl = document.getElementById('lifeCount');

    let mistakesLeft = 4; // 3回までOK、4回目でアウトなので初期値4にして減らしていくか、ミス回数をカウントするか
    // リクエスト： "3回まで間違えられるけど、4回間違えたら終了"
    // 表示はハート4つにして、1ミスで1つ減る -> 0になった瞬間にGameOver
    // レベルデータの定義
    const levels = [
        {
            id: 'default',
            src: 'game_image.jpg',
            title: '2026年2月号',
            // もともとの間違いデータ（とりあえずここに移動）
            mistakes: [
                { id: 1, found: false, areas: [{ x: 84.8, y: 89.0, w: 10.5, h: 6.4 }] },
                { id: 2, found: false, areas: [{ x: 94.1, y: 61.1, w: 4.1, h: 3.9 }] },
                { id: 3, found: false, areas: [{ x: 53.6, y: 56.1, w: 4.1, h: 3.3 }] },
                { id: 4, found: false, areas: [{ x: 55.9, y: 90.0, w: 6.1, h: 2.1 }] },
                { id: 5, found: false, areas: [{ x: 40.9, y: 76.6, w: 6.6, h: 4.7 }] },
                { id: 6, found: false, areas: [{ x: 7.7, y: 96.0, w: 2.9, h: 2.1 }] },
                { id: 7, found: false, areas: [{ x: 12.1, y: 64.9, w: 2.2, h: 3.0 }] },
                { id: 8, found: false, areas: [{ x: 53.6, y: 74.4, w: 9.6, h: 4.7 }] }
            ]
        },
        {
            id: '202509',
            src: '202509.png',
            title: '2025年9月号',
            mistakes: [
                { id: 1, found: false, areas: [{ x: 41.1, y: 76.5, w: 4.1, h: 18.1 }] },
                { id: 2, found: false, areas: [{ x: 95.3, y: 81.4, w: 3.8, h: 3.1 }] },
                { id: 3, found: false, areas: [{ x: 90.7, y: 92.0, w: 4.6, h: 6.0 }] },
                { id: 4, found: false, areas: [{ x: 79.9, y: 93.7, w: 3.3, h: 3.3 }] },
                { id: 5, found: false, areas: [{ x: 76.8, y: 54.9, w: 3.6, h: 4.3 }] },
                { id: 6, found: false, areas: [{ x: 36.7, y: 85.5, w: 10.1, h: 6.9 }] },
                { id: 7, found: false, areas: [{ x: 8.2, y: 57.9, w: 10.0, h: 10.4 }] },
                { id: 8, found: false, areas: [{ x: 33.3, y: 53.1, w: 9.6, h: 5.2 }] }
            ]
        },
        {
            id: '202512',
            src: '202512.png',
            title: '2025年12月号',
            mistakes: [
                { id: 1, found: false, areas: [{ x: 85.9, y: 87.8, w: 8.3, h: 5.3 }] },
                { id: 2, found: false, areas: [{ x: 84.3, y: 62.3, w: 4.1, h: 4.5 }] },
                { id: 3, found: false, areas: [{ x: 61.3, y: 64.5, w: 2.2, h: 3.4 }] },
                { id: 4, found: false, areas: [{ x: 56.5, y: 84.9, w: 2.9, h: 3.0 }] },
                { id: 5, found: false, areas: [{ x: 22.4, y: 76.6, w: 4.5, h: 4.8 }] },
                { id: 6, found: false, areas: [{ x: 23.3, y: 90.2, w: 2.8, h: 4.8 }] },
                { id: 7, found: false, areas: [{ x: 11.3, y: 92.5, w: 4.6, h: 2.3 }] },
                { id: 8, found: false, areas: [{ x: 29.3, y: 64.5, w: 14.7, h: 7.9 }] }
            ]
        }
    ];

    let currentLevelIndex = 0;
    let mistakes = []; // 現在のレベルの間違いデータ

    // DOM要素
    const levelMenu = document.getElementById('levelMenu');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const gameImage = document.getElementById('gameImage');
    const footer = document.querySelector('footer');
    const instructionText = document.querySelector('.instruction-text');

    // UI初期化
    initLevelMenu();

    function initLevelMenu() {
        // 最初はフッターを隠す
        footer.style.display = 'none';
        // テキスト初期化
        instructionText.textContent = "好きなまちがいさがしを選んでね";

        document.querySelectorAll('.level-item').forEach(item => {
            item.addEventListener('click', () => {
                const levelIndex = parseInt(item.getAttribute('data-level'));
                loadLevel(levelIndex);
            });
        });

        backToMenuBtn.addEventListener('click', () => {
            showLevelMenu();
        });
    }

    function loadLevel(index) {
        currentLevelIndex = index;
        const levelData = levels[index];

        // データのディープコピー（状態リセットのため）
        mistakes = JSON.parse(JSON.stringify(levelData.mistakes));

        // 画像切り替え
        gameImage.src = levelData.src;

        // 状態リセット
        foundTotal = 0;
        mistakesLeft = 4;
        foundCountEl.textContent = foundTotal;
        updateLifeDisplay();

        // マーカー消去
        markersLayer.innerHTML = '';

        // UI切り替え
        levelMenu.style.display = 'none';
        gameArea.style.display = 'block';
        backToMenuBtn.style.display = 'inline-block';
        footer.style.display = 'block'; // フッター表示
        instructionText.textContent = "下の画像をクリックしてね！";
        document.querySelector('.subtitle').textContent = `全部で${mistakes.length > 0 ? mistakes.length : '?'}つの間違いがあるよ！`;

        // 答え合わせボタンなどの状態リセット
        showAnswerBtn.disabled = false;
        showAnswerBtn.textContent = "答え合わせ";
    }

    function showLevelMenu() {
        levelMenu.style.display = 'flex';
        gameArea.style.display = 'none';
        backToMenuBtn.style.display = 'none';
        footer.style.display = 'none'; // フッター非表示
        instructionText.textContent = "好きなまちがいさがしを選んでね";
    }


    // Audio Context initialization for sound effect
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // 正解音: "ピンポン" (シンプルな音)
    function playCorrectSound() {
        initAudio();

        // 1. 声（イエーイ）は削除

        // 2. シンプルな正解音
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // シンプルな単音、または短い和音
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // 不正解音: "ぶー" (低音ノコギリ波)
    function playWrongSound() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3); // Pitch bend down

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // 5つの間違いの定義 (仮の座標)
    // NOTE: レベルロード時に設定されるようになったため、この固定定義は削除します。

    let foundTotal = 0;
    // TOTAL_MISTAKES 変数は削除し、mistakes.length を使用します
    // const TOTAL_MISTAKES = 8;

    // デバッグ用要素
    const debugModeCheckbox = document.getElementById('debugMode');
    const coordOutput = document.getElementById('coordOutput');
    let debugStartPoint = null; // 範囲測定の開始点

    // クリックイベント
    gameArea.addEventListener('click', (e) => {
        // AudioContextの初期化
        initAudio();

        const rect = gameArea.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // デバッグモード（座標測定）
        if (debugModeCheckbox && debugModeCheckbox.checked) {
            if (!debugStartPoint) {
                // 1点目（開始点）
                debugStartPoint = { x, y };
                coordOutput.value = "2点目をクリックして範囲などを決定...";

                // 開始点マーカー
                const marker = document.createElement('div');
                marker.classList.add('debug-marker'); // クラスで管理してリセット時に消せるようにすると良いが簡易実装
                marker.style.position = 'absolute';
                marker.style.left = x + '%';
                marker.style.top = y + '%';
                marker.style.width = '6px';
                marker.style.height = '6px';
                marker.style.background = 'red';
                marker.style.transform = 'translate(-50%, -50%)';
                marker.style.pointerEvents = 'none';
                marker.style.zIndex = '9999';
                markersLayer.appendChild(marker);

            } else {
                // 2点目（終了点） -> 範囲計算
                const start = debugStartPoint;
                const end = { x, y };

                // 左上、右下を計算
                const minX = Math.min(start.x, end.x);
                const maxX = Math.max(start.x, end.x);
                const minY = Math.min(start.y, end.y);
                const maxY = Math.max(start.y, end.y);

                // 中心と幅・高さ (%)
                const w = maxX - minX;
                const h = maxY - minY;
                const cx = minX + w / 2;
                const cy = minY + h / 2;

                const coordString = `{ x: ${cx.toFixed(1)}, y: ${cy.toFixed(1)}, w: ${w.toFixed(1)}, h: ${h.toFixed(1)} },`;
                coordOutput.value = coordString;
                coordOutput.select();

                console.log(coordString);

                // 範囲を可視化
                const rangeBox = document.createElement('div');
                rangeBox.style.position = 'absolute';
                rangeBox.style.left = cx + '%';
                rangeBox.style.top = cy + '%';
                rangeBox.style.width = w + '%';
                rangeBox.style.height = h + '%';
                rangeBox.style.border = '2px solid blue';
                rangeBox.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
                rangeBox.style.transform = 'translate(-50%, -50%)';
                rangeBox.style.pointerEvents = 'none';
                rangeBox.style.zIndex = '9999';
                markersLayer.appendChild(rangeBox);

                // リセット
                debugStartPoint = null;
            }
            return; // ゲームのロジックは動かさない
        }

        // 下の画像だけクリック可能にする (y < 50% は無視)
        if (y < 50) return;

        const coordString = `{ x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, r: 5 },`;
        console.log(coordString);

        let hit = false;

        // すでに見つけた間違いかどうかチェック（ループ内で見つかったら終了したいので for...of or simple loop）
        // forEachだと止まらないので、for keep
        for (const mistake of mistakes) {
            if (mistake.found) continue;

            // 登録されたすべてのエリア(上・下)に対して判定
            for (const area of mistake.areas) {
                let isHit = false;

                if (area.w && area.h) {
                    // 長方形判定 (x, yを中心とする)
                    const halfW = area.w / 2;
                    const halfH = area.h / 2;
                    if (x >= area.x - halfW && x <= area.x + halfW &&
                        y >= area.y - halfH && y <= area.y + halfH) {
                        isHit = true;
                    }
                } else {
                    // 円形判定 (デフォルト)
                    const dx = x - area.x;
                    const dy = y - area.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const radius = area.r || 5;
                    if (dist <= radius) {
                        isHit = true;
                    }
                }

                if (isHit) {
                    hit = true;
                    // 正解アクション
                    foundMistake(mistake, area);
                    break; // 1つの間違いでエリア複数持っていたとしても1つヒットすればOK
                }
            }
            if (hit) break; // ヒットしたら他の間違い判定はしない（オーバーラップ対策）
        }

        if (!hit) {
            // 不正解エフェクト
            showWrongClick(e.clientX, e.clientY);

            // 不正解音
            playWrongSound();

            // ライフ減少処理
            mistakesLeft--;
            updateLifeDisplay();

            if (mistakesLeft <= 0) {
                // ゲームオーバー
                setTimeout(() => {
                    showGameOver();
                }, 500);
            }
        }
    });

    function updateLifeDisplay() {
        let hearts = "";
        for (let i = 0; i < mistakesLeft; i++) {
            hearts += "❤";
        }
        lifeCountEl.textContent = hearts;
    }

    // ヒントボタン
    const hintBtn = document.getElementById('hintBtn');
    let hintIndex = 0; // ヒントの表示準を管理

    hintBtn.addEventListener('click', () => {
        initAudio();

        // 全てもう見つけている場合やゲームオーバー時は何もしない
        if (foundTotal >= mistakes.length || mistakesLeft <= 0) return;

        // ボタンを一時的に無効化
        hintBtn.disabled = true;

        // 未発見の間違いを取得し、X座標(左側)でソート
        const remainingMistakes = mistakes.filter(m => !m.found).sort((a, b) => {
            // エリアが複数ある場合、最初のエリアのX座標でソート
            const xA = a.areas.length > 0 ? a.areas[0].x : 0;
            const xB = b.areas.length > 0 ? b.areas[0].x : 0;
            return xA - xB;
        });

        if (remainingMistakes.length > 0) {
            // インデックスが範囲を超えないように調整（ループさせる）
            if (hintIndex >= remainingMistakes.length) {
                hintIndex = 0;
            }

            const targetMistake = remainingMistakes[hintIndex];

            // ターゲットのエリアを表示（下の画像のみ）
            // customMarkerは削除されたので、areaのw/hを考慮
            targetMistake.areas.forEach(area => {
                if (area.y >= 50) {
                    let style = null;
                    if (area.w && area.h) {
                        style = { width: area.w + '%', height: area.h + '%' };
                    }
                    showHintCircle(area.x, area.y, style);
                }
            });

            // 次回のためにインデックスを進める
            hintIndex++;
        }

        // 少し待ってからボタンを再有効化(連打防止)
        setTimeout(() => {
            hintBtn.disabled = false;
        }, 1500);
    });

    function showHintCircle(x, y, style = null) {
        const hint = document.createElement('div');
        hint.classList.add('hint-circle');
        hint.style.left = x + '%';
        hint.style.top = y + '%';

        if (style) {
            if (style.width) hint.style.width = style.width;
            if (style.height) hint.style.height = style.height;
            // ヒントは丸で統一または大きさを合わせるため、borderRadiusは固定
            hint.style.borderRadius = '50%'; // 円形ヒント
        } else {
            // デフォルトの円形ヒントのサイズ
            hint.style.width = '10%';
            hint.style.height = '10%';
            hint.style.borderRadius = '50%';
        }

        markersLayer.appendChild(hint);

        // 3秒後にフェードアウトして削除
        setTimeout(() => {
            hint.style.transition = "opacity 0.5s";
            hint.style.opacity = "0";
            setTimeout(() => {
                hint.remove();
            }, 500);
        }, 3000);
    }

    // 答え合わせボタン
    const showAnswerBtn = document.getElementById('showAnswerBtn');
    showAnswerBtn.addEventListener('click', () => {
        initAudio();
        const confirmShow = confirm("本当に答えを見ますか？");
        if (confirmShow) {
            mistakes.forEach(mistake => {
                if (!mistake.found) {
                    // 未発見の間違いを表示 (下の画像のみ)
                    // customMarkerは削除されたので、areaのw/hを考慮
                    mistake.areas.forEach(area => {
                        if (area.y >= 50) {
                            let style = null;
                            if (area.w && area.h) {
                                style = { width: area.w + '%', height: area.h + '%', borderRadius: '50%' }; // 長丸（楕円）
                            }
                            createMaru(area.x, area.y, true, style);
                        }
                    });
                }
            });
            // ボタンを無効化
            showAnswerBtn.disabled = true;
            showAnswerBtn.textContent = "答えを表示しました";
        }
    });

    function foundMistake(mistake, area) {
        mistake.found = true;
        foundTotal++;
        foundCountEl.textContent = foundTotal;

        // 正解音
        playCorrectSound();

        // クラッカー演出は削除（クリア時のみ）
        /*
        const rect = gameArea.getBoundingClientRect();
        const px = (hx / 100) * rect.width;
        const py = (hy / 100) * rect.height;
        const viewportX = (rect.left + px) / window.innerWidth;
        const viewportY = (rect.top + py) / window.innerHeight;

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: viewportX, y: viewportY },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
        */

        // マルを表示
        // customMarkerは削除されたので、area情報から表示
        let style = null;
        if (area.w && area.h) {
            style = { width: area.w + '%', height: area.h + '%', borderRadius: '50%' }; // 長丸（楕円）
        }
        createMaru(area.x, area.y, false, style);


        // NOTE: 上下両方にマルを出す場合はここで反対側の座標を計算して出すことも可能ですが、
        // 「見つけた場所」にだけ出すのが一般的です。

        // クリア判定
        if (foundTotal >= mistakes.length) {
            setTimeout(() => {
                showClear();
            }, 500);
        }
    }

    function createMaru(x, y, isAnswer = false, style = null) {
        const maru = document.createElement('div');
        maru.classList.add('mark-circle');
        if (isAnswer) {
            maru.classList.add('is-answer');
        }
        maru.style.left = x + '%';
        maru.style.top = y + '%';

        // カスタムスタイル適用
        if (style) {
            if (style.width) maru.style.width = style.width;
            if (style.height) maru.style.height = style.height;
            if (style.borderRadius) maru.style.borderRadius = style.borderRadius;
        }

        markersLayer.appendChild(maru);
    }

    function showWrongClick(clientX, clientY) {
        // gameArea内での相対位置を計算
        const rect = gameArea.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const wrong = document.createElement('div');
        wrong.classList.add('wrong-click-x'); // バツ印のクラスに変更
        wrong.style.left = x + 'px';
        wrong.style.top = y + 'px';
        gameArea.appendChild(wrong);

        setTimeout(() => {
            wrong.remove();
        }, 800); // アニメーション時間に合わせて少し長く
    }

    function showClear() {
        console.log("Clear!");
        clearModal.classList.add('active');

        // クリア音 (sound01.mp3)
        const clearAudio = new Audio('sound01.mp3');
        clearAudio.play().catch(e => console.error("Audio play error:", e));

        // クラッカー演出
        confetti({
            particleCount: 300,
            spread: 120,
            origin: { x: 0.5, y: 0.6 }, // 画面中央やや下から
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
    }

    function showGameOver() {
        console.log("Game Over");
        gameOverModal.classList.add('active');
    }
});
