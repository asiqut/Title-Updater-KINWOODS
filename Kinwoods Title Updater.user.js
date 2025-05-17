// ==UserScript==
// @name         Kinwoods Title Updater
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Добавляет текст в заголовок сайта
// @author       Невезение
// @match        *://patron.kinwoods.com/*
// ==/UserScript==

(function() {
    'use strict';

    function formatTurnText(turnText, initiativeText) {
        // Обрабатываем основной текст
        let result = turnText
            .replace(/Сейчас ходит/g, 'Бой. ')
            .replace(/\. Ход завершится сам через/g, ':')
            .trim();

        // Добавляем инициативу в скобках (если есть)
        if (initiativeText) {
            initiativeText = initiativeText.trim();
            if (!initiativeText.startsWith('[')) initiativeText = '[' + initiativeText;
            if (!initiativeText.endsWith(']')) initiativeText = initiativeText + ']';
            result = `${result} ${initiativeText}`.trim();
        }

        return result;
    }

    function updateTitle() {
        const primaryElement = document.querySelector('p.svelte-1t5p5a7');
        const turnTextElement = document.querySelector('p.turn-text.svelte-1yiowxi');
        const initiativeElement = document.querySelector('p.initiative-value.svelte-1cage5m');

        let newTitle;

        if (primaryElement) {
            // Приоритет 1: основной элемент
            newTitle = primaryElement.textContent.trim();
        } else if (turnTextElement) {
            // Приоритет 2: turn-text + initiative-value (дополнительно)
            newTitle = formatTurnText(
                turnTextElement.textContent,
                initiativeElement?.textContent
            ) || 'KINWOODS / Лес'; // Fallback если formatTurnText вернул пустую строку
        } else {
            // Fallback
            newTitle = 'KINWOODS / Лес';
        }

        document.title = newTitle;
    }

    // Первое обновление
    updateTitle();

    // Отслеживание изменений
    const observer = new MutationObserver(updateTitle);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Дополнительная проверка
    setInterval(updateTitle, 100);
})();
