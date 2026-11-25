export function startMatrix(state, clearAnimation) {
    clearAnimation();

    const canvas = state.getAsciiCanvas();
    const width = 190;
    const height = 60;
    const DEFAULT_CHARS = 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';

    const screen = Array.from({ length: height }, () => new Array(width).fill(' '));
    const drops = Array.from({ length: width }, () => Math.floor(Math.random() * -height));
    const depths = Array.from({ length: width }, () => Math.floor(Math.random() * 3));

    const renderFrame = () => {
        const activeChars = state.getChars(DEFAULT_CHARS, true);
        const charCount = activeChars.length;

        for (let y = 0; y < height; y++) {
            const row = screen[y];
            for (let x = 0; x < width; x++) {
                if (row[x] !== ' ' && Math.random() > 0.85) {
                    row[x] = ' ';
                }
            }
        }

        for (let x = 0; x < width; x++) {
            const y = drops[x];
            if (y >= 0 && y < height) {
                screen[y][x] = activeChars[Math.floor(Math.random() * charCount)];
            }

            drops[x]++;

            if (drops[x] > height && Math.random() > 0.95) {
                drops[x] = 0;
                depths[x] = Math.floor(Math.random() * 3);
            }
        }

        const parts = [];
        for (let y = 0; y < height; y++) {
            const row = screen[y];
            for (let x = 0; x < width; x++) {
                const char = row[x];
                parts.push(char === ' ' ? ' ' : `<span class="m${depths[x]}">${char}</span>`);
            }
            parts.push('\n');
        }

        canvas.innerHTML = parts.join('');
    };

    renderFrame();
    state.setIntervalId(setInterval(renderFrame, state.getSpeed()));
}
