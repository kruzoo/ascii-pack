export function startTornado(state, clearAnimation) {
    clearAnimation();

    const canvas = state.getAsciiCanvas();
    const DEFAULT_RAMP = '.:-=+*#%@';
    const cols = 140;
    const rows = 58;

    const debris = Array.from({ length: 60 }, (_, i) => ({
        angle: (i / 60) * Math.PI * 2 + Math.random() * 0.5,
        yNorm: Math.random(),
        speed: 0.14 + Math.random() * 0.22,
        lift: 0.004 + Math.random() * 0.008,
        radiusMult: 1.15 + Math.random() * 0.85,
    }));

    const debrisGrid = new Uint8Array(rows * cols);

    function hash2(x, y) {
        const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
        return s - Math.floor(s);
    }

    let time = 0;

    const renderFrame = () => {
        const rampChars = state.getChars(DEFAULT_RAMP);
        const rampLen = rampChars.length;

        debrisGrid.fill(0);
        for (let i = 0; i < debris.length; i++) {
            const p = debris[i];
            p.angle += p.speed;
            p.yNorm -= p.lift;
            if (p.yNorm < 0.14) {
                p.yNorm = 0.92 + Math.random() * 0.08;
                p.angle = Math.random() * Math.PI * 2;
            }

            const y = Math.floor(p.yNorm * (rows - 1));
            const hFromBottom = 1 - p.yNorm;
            const sway =
                Math.sin(p.yNorm * 4.5 - time * 1.4) * (4 + hFromBottom * 5) +
                Math.cos(p.yNorm * 2.2 + time * 0.8) * 2.5;
            const centerX = cols * 0.5 + sway;
            const funnelR = (3.8 + Math.pow(hFromBottom, 1.85) * 26) * p.radiusMult;
            const x = Math.round(centerX + Math.cos(p.angle) * funnelR);
            const depth = Math.sin(p.angle);

            if (x >= 0 && x < cols && y >= 0 && y < rows && depth > -0.25) {
                const shade = Math.max(0.25, Math.min(0.95, 0.45 + depth * 0.4));
                const encodedShade = Math.max(1, Math.min(127, Math.round(shade * 127)));
                debrisGrid[y * cols + x] = encodedShade | (p.yNorm > 0.72 ? 128 : 0);
            }
        }

        const flashWave = Math.sin(time * 0.37) * Math.sin(time * 1.9);
        const lightning = flashWave > 0.92 ? (flashWave - 0.92) / 0.08 : 0;

        const parts = [];

        for (let y = 0; y < rows; y++) {
            const yNorm = y / (rows - 1);
            const hFromBottom = 1 - yNorm;
            const rowOffset = y * cols;

            const sway =
                Math.sin(yNorm * 4.5 - time * 1.4) * (4 + hFromBottom * 5) +
                Math.cos(yNorm * 2.2 + time * 0.8) * 2.5;
            const centerX = cols * 0.5 + sway;
            const baseRadius = 3.5 + Math.pow(hFromBottom, 1.85) * 26;

            let currentColor = '';
            let run = '';

            const flush = () => {
                if (!run) return;
                parts.push(currentColor ? `<span style="color:${currentColor}">${run}</span>` : run);
                run = '';
            };

            for (let x = 0; x < cols; x++) {
                const dx = x - centerX;
                const absDx = Math.abs(dx);
                let color = '';
                let ch = ' ';

                const deb = debrisGrid[rowOffset + x];
                if (deb) {
                    const shade = (deb & 127) / 127;
                    ch = rampChars[Math.floor(shade * rampLen)] || rampChars[rampLen - 1];
                    color = deb & 128 ? 'rgb(168,144,112)' : 'rgb(144,160,176)';
                } else {
                    const cloudEdge =
                        0.16 +
                        Math.sin(x * 0.09 + time * 0.5) * 0.03 +
                        Math.cos(x * 0.16 - time * 0.3) * 0.02;

                    const normX = dx / baseRadius;
                    const inFunnel = absDx <= baseRadius * 1.05 && yNorm >= 0.08 && yNorm <= 0.95;

                    if (inFunnel) {
                        const clampedX = Math.max(-1, Math.min(1, normX));
                        const angle = Math.asin(clampedX);
                        const z = Math.sqrt(Math.max(0, 1 - clampedX * clampedX));

                        const spinSpeed = 3.2 + (1 - hFromBottom) * 4.5;
                        const spiral = Math.sin(angle * 3 + yNorm * 26 - time * spinSpeed) * 0.5 + 0.5;
                        const spiral2 = Math.sin(angle * 5 - yNorm * 14 - time * (spinSpeed * 0.7)) * 0.5 + 0.5;

                        const density = Math.pow(z, 0.55) * (0.48 + spiral * 0.34 + spiral2 * 0.18);

                        if (density > 0.16) {
                            const light = Math.max(0.18, Math.min(1, 0.45 - clampedX * 0.35 + z * 0.3));
                            const shade = Math.max(0.08, Math.min(0.96, density * light * 1.15));

                            const dustMix = Math.max(0, (yNorm - 0.68) / 0.32);
                            const rBase = 104 + dustMix * 52 + lightning * 25;
                            const gBase = 118 + dustMix * 24 + lightning * 28;
                            const bBase = 136 - dustMix * 32 + lightning * 42;

                            const r = Math.min(208, Math.round((rBase * light) / 8) * 8);
                            const g = Math.min(216, Math.round((gBase * light) / 8) * 8);
                            const b = Math.min(224, Math.round((bBase * light) / 8) * 8);

                            color = `rgb(${r},${g},${b})`;
                            ch = rampChars[Math.floor(shade * rampLen)] || rampChars[rampLen - 1];
                        }
                    } else if (yNorm < cloudEdge) {
                        const cloudDepth = 1 - yNorm / cloudEdge;
                        const turb = Math.sin(x * 0.11 + time * 0.7) * Math.cos(y * 0.35 - time * 0.4) * 0.5 + 0.5;
                        const shade = Math.max(0.1, Math.min(0.92, cloudDepth * 0.65 + turb * 0.35 + lightning * 0.25));
                        const v = Math.min(184, Math.round((56 + shade * 80 + lightning * 48) / 8) * 8);
                        color = `rgb(${v},${Math.min(200, v + 8)},${Math.min(216, v + 24)})`;
                        ch = rampChars[Math.floor(shade * rampLen)] || rampChars[rampLen - 1];
                    } else if (yNorm > 0.87) {
                        const dustR = 22 + Math.sin(time * 2 + y) * 2.5;
                        const distRatio = absDx / dustR;
                        const groundLevel = (yNorm - 0.87) / 0.13;
                        if (distRatio < 1.25) {
                            const swirl = Math.sin(dx * 0.28 - time * 4.5 + y * 0.8) * 0.5 + 0.5;
                            const dustDensity =
                                (1 - distRatio / 1.25) * (0.45 + groundLevel * 0.55) * (0.55 + swirl * 0.45);
                            if (dustDensity > 0.15) {
                                const r = Math.round((120 + dustDensity * 64) / 8) * 8;
                                const g = Math.round((96 + dustDensity * 52) / 8) * 8;
                                const b = Math.round((72 + dustDensity * 32) / 8) * 8;
                                color = `rgb(${r},${g},${b})`;
                                ch =
                                    rampChars[Math.floor(Math.min(0.95, dustDensity) * rampLen)] ||
                                    rampChars[rampLen - 1];
                            }
                        } else if (y === rows - 1 && hash2(x, y) > 0.35) {
                            color = 'rgb(64,56,48)';
                            ch = rampChars[0];
                        }
                    }
                }

                if (color !== currentColor) {
                    flush();
                    currentColor = color;
                }
                run += ch;
            }

            flush();
            parts.push('\n');
        }

        canvas.innerHTML = parts.join('');
        time += 0.12;
    };

    renderFrame();
    state.setIntervalId(setInterval(renderFrame, state.getSpeed()));
}
