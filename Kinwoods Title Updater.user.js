// ==UserScript==
// @name         Действие в заголовке, уведомление
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Невезение
// @match        *://patron.kinwoods.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Настройки звука по умолчанию
    const defaultSettings = {
        soundEnabled: true,
        volume: 0.25,
        frequency1: 440,
        frequency2: 660,
        duration: 1.5,
        fadeOut: 1.5,
        waveType: 'sine'
    };

    // 1. Функция воспроизведения звука с настраиваемыми параметрами
    function playCustomSound() {
        try {
            const settings = {
                soundEnabled: GM_getValue('soundEnabled', defaultSettings.soundEnabled),
                volume: GM_getValue('volume', defaultSettings.volume),
                frequency1: GM_getValue('frequency1', defaultSettings.frequency1),
                frequency2: GM_getValue('frequency2', defaultSettings.frequency2),
                duration: GM_getValue('duration', defaultSettings.duration),
                fadeOut: GM_getValue('fadeOut', defaultSettings.fadeOut),
                waveType: GM_getValue('waveType', defaultSettings.waveType)
            };

            if (!settings.soundEnabled) return;

            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = settings.waveType;
            osc1.frequency.value = settings.frequency1;
            osc2.type = settings.waveType;
            osc2.frequency.value = settings.frequency2;
            gain.gain.value = settings.volume;

            gain.gain.setValueAtTime(settings.volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + settings.fadeOut);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + settings.duration);
            osc2.stop(ctx.currentTime + settings.duration);
        } catch (e) {
            console.log("Ошибка звука:", e);
        }
    }

    // 2. Стили для панели управления
    GM_addStyle(`
    .sound-control-container {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
    }

    .sound-control-panel {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 15px;
        border-radius: 8px;
        border: 2px solid #87887f;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        font-family: Arial, sans-serif;
        font-size: 14px;
        min-width: 260px;
        margin-top: 50px;
        display: none;
    }

    .sound-control-panel.visible {
        display: block;
    }

    .control-group {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .control-group:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .control-group-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #1e1e1e !important;
    }

    .control-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .control-row:last-child {
        margin-bottom: 0;
    }

    .control-label {
        min-width: 120px;
        color: #1e1e1e;
    }

    .control-value {
        min-width: 40px;
        text-align: right;
        margin-right: 10px;
    }

    input[type="range"] {
        flex-grow: 1;
        height: 6px;
        background: #d0d1c5;
        border-radius: 3px;
        outline: none;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        background: #c9894c;
        border-radius: 50%;
        cursor: pointer;
    }

    select {
        padding: 4px;
        border-radius: 4px;
        border: 1px solid #87887f;
        background: rgba(255,255,255,0.7);
    }

    .toggle-button {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 2px solid #87887f;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        right: 0;
        z-index: 10000;
        font-size: 24px;
        line-height: 1;
        padding-bottom: 3px;
    }

    .test-sound-btn {
        background: #c9894c;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        width: 100%;
    }

    .test-sound-btn:hover {
        background: #b87a40;
    }

    .reset-sound-btn {
        background: #87887f;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 5px;
        width: 100%;
    }

    .reset-sound-btn:hover {
        background: #6e6e66;
    }

    .button-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .button-group button {
        flex: 1;
    }
    `);

    // 3. Создаем панель управления
    const container = document.createElement('div');
    container.className = 'sound-control-container';

    const toggleButton = document.createElement('div');
    toggleButton.className = 'toggle-button';
    toggleButton.textContent = '🔔';

    const soundPanel = document.createElement('div');
    soundPanel.className = 'sound-control-panel';
    soundPanel.innerHTML = `
        <div class="control-group">
            <div class="control-group-title">Основные настройки</div>
            <div class="control-row">
                <label class="control-label">Включить звук:</label>
                <input type="checkbox" id="soundToggle" ${GM_getValue('soundEnabled', defaultSettings.soundEnabled) ? 'checked' : ''}>
            </div>
            <div class="control-row">
                <label class="control-label">Громкость:</label>
                <span class="control-value" id="volumeValue">${GM_getValue('volume', defaultSettings.volume)}</span>
                <input type="range" min="0" max="1" step="0.01" value="${GM_getValue('volume', defaultSettings.volume)}" id="volumeSlider">
            </div>
            <div class="control-row">
                <label class="control-label">Тип волны:</label>
                <select id="waveTypeSelect">
                    <option value="sine" ${GM_getValue('waveType', defaultSettings.waveType) === 'sine' ? 'selected' : ''}>Синус</option>
                    <option value="square" ${GM_getValue('waveType', defaultSettings.waveType) === 'square' ? 'selected' : ''}>Квадрат</option>
                    <option value="sawtooth" ${GM_getValue('waveType', defaultSettings.waveType) === 'sawtooth' ? 'selected' : ''}>Пила</option>
                    <option value="triangle" ${GM_getValue('waveType', defaultSettings.waveType) === 'triangle' ? 'selected' : ''}>Треугольник</option>
                </select>
            </div>
        </div>

        <div class="control-group">
            <div class="control-group-title">Частоты звука</div>
            <div class="control-row">
                <label class="control-label">Частота 1 (Гц):</label>
                <span class="control-value" id="freq1Value">${GM_getValue('frequency1', defaultSettings.frequency1)}</span>
                <input type="range" min="220" max="880" step="1" value="${GM_getValue('frequency1', defaultSettings.frequency1)}" id="freq1Slider">
            </div>
            <div class="control-row">
                <label class="control-label">Частота 2 (Гц):</label>
                <span class="control-value" id="freq2Value">${GM_getValue('frequency2', defaultSettings.frequency2)}</span>
                <input type="range" min="220" max="880" step="1" value="${GM_getValue('frequency2', defaultSettings.frequency2)}" id="freq2Slider">
            </div>
        </div>

        <div class="control-group">
            <div class="control-group-title">Длительность</div>
            <div class="control-row">
                <label class="control-label">Длит. звука (с):</label>
                <span class="control-value" id="durationValue">${GM_getValue('duration', defaultSettings.duration)}</span>
                <input type="range" min="0.5" max="3" step="0.1" value="${GM_getValue('duration', defaultSettings.duration)}" id="durationSlider">
            </div>
            <div class="control-row">
                <label class="control-label">Затухание (с):</label>
                <span class="control-value" id="fadeOutValue">${GM_getValue('fadeOut', defaultSettings.fadeOut)}</span>
                <input type="range" min="0.5" max="3" step="0.1" value="${GM_getValue('fadeOut', defaultSettings.fadeOut)}" id="fadeOutSlider">
            </div>
        </div>

        <div class="button-group">
            <button class="test-sound-btn" id="testSoundBtn">Проверить</button>
            <button class="reset-sound-btn" id="resetSoundBtn">Сбросить</button>
        </div>
    `;

    container.appendChild(toggleButton);
    container.appendChild(soundPanel);
    document.body.appendChild(container);

    // 4. Обработчики событий для элементов управления
    const setupSlider = (sliderId, valueId, settingKey) => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        slider.addEventListener('input', function() {
            const value = this.value;
            valueDisplay.textContent = value;
            GM_setValue(settingKey, parseFloat(value));
        });
    };

    // Настройка всех ползунков
    setupSlider('volumeSlider', 'volumeValue', 'volume');
    setupSlider('freq1Slider', 'freq1Value', 'frequency1');
    setupSlider('freq2Slider', 'freq2Value', 'frequency2');
    setupSlider('durationSlider', 'durationValue', 'duration');
    setupSlider('fadeOutSlider', 'fadeOutValue', 'fadeOut');

    document.getElementById('soundToggle').addEventListener('change', function() {
        GM_setValue('soundEnabled', this.checked);
    });

    document.getElementById('waveTypeSelect').addEventListener('change', function() {
        GM_setValue('waveType', this.value);
    });

    document.getElementById('testSoundBtn').addEventListener('click', playCustomSound);

    // Обработчик для кнопки сброса
    document.getElementById('resetSoundBtn').addEventListener('click', function() {
        // Сброс всех звуковых настроек
        GM_setValue('volume', defaultSettings.volume);
        GM_setValue('frequency1', defaultSettings.frequency1);
        GM_setValue('frequency2', defaultSettings.frequency2);
        GM_setValue('duration', defaultSettings.duration);
        GM_setValue('fadeOut', defaultSettings.fadeOut);
        GM_setValue('waveType', defaultSettings.waveType);

        // Обновление значений на интерфейсе
        document.getElementById('volumeSlider').value = defaultSettings.volume;
        document.getElementById('volumeValue').textContent = defaultSettings.volume;

        document.getElementById('freq1Slider').value = defaultSettings.frequency1;
        document.getElementById('freq1Value').textContent = defaultSettings.frequency1;

        document.getElementById('freq2Slider').value = defaultSettings.frequency2;
        document.getElementById('freq2Value').textContent = defaultSettings.frequency2;

        document.getElementById('durationSlider').value = defaultSettings.duration;
        document.getElementById('durationValue').textContent = defaultSettings.duration;

        document.getElementById('fadeOutSlider').value = defaultSettings.fadeOut;
        document.getElementById('fadeOutValue').textContent = defaultSettings.fadeOut;

        document.getElementById('waveTypeSelect').value = defaultSettings.waveType;

        // Воспроизведение звука с настройками по умолчанию
        playCustomSound();
    });

    // Обработчик для кнопки сворачивания
    toggleButton.addEventListener('click', function() {
        soundPanel.classList.toggle('visible');
    });

    // 5. Функция обновления заголовка
    function updateTitle() {
        try {
            const battleTimer = document.querySelector('p.turn-text.svelte-1yiowxi');
            if (battleTimer && battleTimer.textContent.includes('Сейчас ходит')) {
                const timerText = battleTimer.textContent.trim();
                const timeMatch = timerText.match(/\d+/);
                const nameMatch = timerText.match(/Сейчас ходит\s+(.+?)\./);
                const initiative = document.querySelector('p.initiative-value.svelte-1cage5m')?.textContent?.trim() || '?';

                if (timeMatch && nameMatch) {
                    document.title = `${timeMatch[0]} сек. / И-${initiative} / ${nameMatch[1].trim()}`;
                    return;
                }
            }

            const normalTimer = document.querySelector('div.panel.svelte-1t5p5a7 > p.svelte-1t5p5a7');
            if (normalTimer) {
                const timerText = normalTimer.textContent.trim();
                if (timerText.includes('осталось') && timerText.includes('сек')) {
                    const time = timerText.match(/\d+/)?.[0] || '';
                    const action = timerText.split('осталось')[0].trim();
                    document.title = `${time} сек. / ${action}`;
                    return;
                }
            }

            document.title = 'KINWOODS / Лес';
        } catch (e) {
            console.error('Ошибка:', e);
            document.title = 'KINWOODS / Лес';
        }
    }

    // 6. Проверка завершения действия со звуком
    let lastTimerState = null;
    function checkActionCompletion() {
        const timerElement = document.querySelector('p.turn-text.svelte-1yiowxi, div.panel.svelte-1t5p5a7 > p.svelte-1t5p5a7');
        const currentState = timerElement?.textContent?.trim();

        if (lastTimerState && !currentState && GM_getValue('soundEnabled', defaultSettings.soundEnabled)) {
            playCustomSound();
        }

        lastTimerState = currentState;
    }

    // 7. Запуск обновлений
    setInterval(() => {
        updateTitle();
        checkActionCompletion();
    }, 300);

    new MutationObserver(() => {
        updateTitle();
    }).observe(document.body, {
        childList: true,
        subtree: true
    });

    updateTitle();
})();
