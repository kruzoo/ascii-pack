const COLS = 152;
const ROWS = 64;
const TEX_W = 360;
const TEX_H = 180;
const DEFAULT_RAMP = '█';

const LAND_POLYGONS = [
    [
        [-168, 66], [-162, 70], [-140, 70], [-125, 70], [-110, 68], [-94, 68],
        [-92, 62], [-80, 62], [-78, 53], [-64, 59], [-55, 52], [-66, 44],
        [-70, 42], [-75, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 29],
        [-97, 26], [-97, 19], [-90, 21], [-87, 21], [-88, 16], [-83, 15],
        [-83, 10], [-78, 8], [-82, 8], [-86, 11], [-92, 15], [-105, 20],
        [-110, 24], [-115, 31], [-117, 33], [-122, 37], [-124, 42], [-124, 48],
        [-130, 54], [-138, 59], [-152, 60], [-162, 55], [-166, 60],
    ],
    [
        [-52, 60], [-42, 60], [-36, 66], [-22, 70], [-18, 77], [-25, 82],
        [-45, 83], [-62, 81], [-72, 77], [-58, 73], [-54, 66],
    ],
    [[-85, 22], [-79, 23], [-74, 20], [-78, 20], [-83, 21]],
    [
        [-78, 9], [-72, 11], [-62, 10], [-50, 2], [-42, -3], [-35, -6],
        [-35, -10], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38],
        [-64, -41], [-66, -46], [-69, -53], [-74, -55], [-75, -47], [-72, -37],
        [-71, -24], [-71, -18], [-77, -12], [-81, -5], [-80, 1], [-78, 5],
    ],
    [
        [-6, 36], [10, 37], [11, 33], [20, 32], [25, 32], [32, 31],
        [35, 27], [38, 21], [43, 12], [51, 12], [49, 4], [41, -2],
        [40, -11], [35, -20], [33, -26], [28, -33], [20, -35], [18, -34],
        [15, -26], [12, -16], [12, -6], [9, 0], [9, 4], [2, 6],
        [-8, 5], [-14, 10], [-17, 15], [-16, 21], [-12, 28], [-9, 32],
    ],
    [[49, -12], [50, -16], [47, -25], [44, -25], [44, -17]],
    [
        [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [8, 54],
        [10, 57], [14, 54], [20, 55], [24, 60], [21, 65], [14, 68],
        [25, 71], [32, 70], [42, 67], [52, 68], [68, 73], [86, 74],
        [105, 77], [125, 73], [145, 71], [170, 69], [179, 66], [168, 60],
        [162, 56], [156, 51], [142, 54], [140, 48], [135, 43], [129, 39],
        [129, 35], [126, 35], [125, 39], [121, 40], [118, 38], [122, 37],
        [121, 31], [120, 26], [114, 22], [109, 20], [109, 12], [104, 10],
        [100, 13], [103, 2], [100, 5], [98, 15], [94, 17], [90, 22],
        [85, 20], [80, 13], [78, 8], [73, 19], [68, 23], [62, 25],
        [56, 26], [50, 29], [56, 24], [60, 22], [52, 16], [44, 13],
        [40, 20], [35, 28], [35, 32], [36, 36], [27, 37], [26, 41],
        [23, 38], [19, 40], [14, 45], [16, 41], [18, 40], [15, 38],
        [12, 42], [9, 44], [5, 43], [0, 39], [-5, 36],
    ],
    [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 58], [-6, 58], [-5, 54], [-5, 51]],
    [[-10, 52], [-6, 52], [-6, 55], [-9, 55]],
    [[-24, 64], [-14, 64], [-14, 66], [-23, 66]],
    [[130, 31], [136, 34], [141, 36], [142, 41], [145, 44], [141, 45], [139, 39], [135, 36], [130, 33]],
    [[95, 5], [99, 3], [105, -5], [104, -6], [98, 0]],
    [[106, -6], [114, -7], [114, -8], [106, -7]],
    [[109, 1], [114, 4], [118, 6], [118, 0], [115, -4], [110, -3]],
    [[131, -2], [141, -3], [150, -10], [147, -10], [138, -8], [133, -4]],
    [[120, 18], [123, 18], [126, 7], [122, 7], [120, 14]],
    [
        [114, -22], [122, -18], [130, -12], [136, -12], [137, -15], [141, -16],
        [143, -11], [146, -18], [153, -26], [153, -32], [150, -37], [144, -38],
        [138, -36], [131, -32], [122, -34], [115, -34], [113, -27],
    ],
    [[173, -35], [178, -38], [175, -41], [168, -46], [167, -45], [173, -39]],
    [
        [-180, -73], [-150, -75], [-120, -73], [-90, -72], [-60, -64], [-55, -66],
        [-30, -74], [0, -70], [40, -68], [80, -67], [120, -67], [150, -69],
        [170, -72], [180, -73], [180, -90], [-180, -90],
    ],
];

let cachedData = null;

function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return s - Math.floor(s);
}

function valueNoise2D(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const a = hash2(ix, iy);
    const b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1);
    const d = hash2(ix + 1, iy + 1);

    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm2D(x, y, octaves = 3) {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
        sum += valueNoise2D(x * freq, y * freq) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2.02;
    }
    return sum / norm;
}

function getEarthData() {
    if (cachedData) return cachedData;

    const polyBounds = LAND_POLYGONS.map((poly) => {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < poly.length; i++) {
            const [x, y] = poly[i];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        return { poly, minX, maxX, minY, maxY };
    });

    const isLandPoint = (lon, lat) => {
        for (let p = 0; p < polyBounds.length; p++) {
            const b = polyBounds[p];
            if (lon < b.minX || lon > b.maxX || lat < b.minY || lat > b.maxY) continue;
            let inside = false;
            const poly = b.poly;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const [xi, yi] = poly[i];
                const [xj, yj] = poly[j];
                if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
                    inside = !inside;
                }
            }
            if (inside) return true;
        }
        return false;
    };

    const landMask = new Uint8Array(TEX_W * TEX_H);
    for (let ty = 0; ty < TEX_H; ty++) {
        const lat = 90 - (ty + 0.5);
        for (let tx = 0; tx < TEX_W; tx++) {
            const lon = tx + 0.5 - 180;
            const jLon = lon + (fbm2D((lon + 180) * 0.08, (lat + 90) * 0.08, 2) - 0.5) * 2.2;
            const jLat = lat + (fbm2D((lon + 180) * 0.08 + 31, (lat + 90) * 0.08 + 17, 2) - 0.5) * 1.8;
            if (isLandPoint(jLon, jLat)) landMask[ty * TEX_W + tx] = 1;
        }
    }

    const coastalMap = new Float32Array(TEX_W * TEX_H);
    for (let ty = 0; ty < TEX_H; ty++) {
        for (let tx = 0; tx < TEX_W; tx++) {
            if (landMask[ty * TEX_W + tx]) continue;
            let hits = 0;
            for (let dy = -2; dy <= 2; dy++) {
                const ny = ty + dy;
                if (ny < 0 || ny >= TEX_H) continue;
                const rowOff = ny * TEX_W;
                for (let dx = -2; dx <= 2; dx++) {
                    hits += landMask[rowOff + ((tx + dx + TEX_W) % TEX_W)];
                }
            }
            coastalMap[ty * TEX_W + tx] = Math.min(1, hits / 12);
        }
    }

    const texR = new Uint8Array(TEX_W * TEX_H);
    const texG = new Uint8Array(TEX_W * TEX_H);
    const texB = new Uint8Array(TEX_W * TEX_H);
    const texShadeBias = new Float32Array(TEX_W * TEX_H);

    for (let ty = 0; ty < TEX_H; ty++) {
        const lat = 90 - (ty + 0.5);
        const absLat = Math.abs(lat);
        for (let tx = 0; tx < TEX_W; tx++) {
            const lon = tx + 0.5 - 180;
            const idx = ty * TEX_W + tx;
            const isLand = landMask[idx] === 1;
            const polarIce = absLat > 78 || (lat < -68 && isLand);

            if (polarIce) {
                texR[idx] = 142;
                texG[idx] = 176;
                texB[idx] = 202;
                texShadeBias[idx] = 0.12;
            } else if (isLand) {
                const relief = fbm2D((lon + 180) * 0.08, (lat + 90) * 0.08, 3);
                const aridNoise = fbm2D((lon + 180) * 0.05 + 19, (lat + 90) * 0.05 + 7, 3);
                const isDesert =
                    (lat > 12 && lat < 33 && lon > -17 && lon < 60) ||
                    (lat < -18 && lat > -32 && lon > 116 && lon < 142) ||
                    (absLat > 16 && absLat < 34 && aridNoise > 0.52);

                if (relief > 0.68) {
                    texR[idx] = 128;
                    texG[idx] = 112;
                    texB[idx] = 92;
                } else if (isDesert) {
                    texR[idx] = 186;
                    texG[idx] = 152;
                    texB[idx] = 88;
                } else {
                    const lush = Math.max(0, Math.min(1, 1 - absLat / 76 + (relief - 0.5) * 0.45));
                    texR[idx] = Math.round(36 + (1 - lush) * 46 + relief * 18);
                    texG[idx] = Math.round(108 + lush * 54 + relief * 16);
                    texB[idx] = Math.round(42 + relief * 12);
                }
                texShadeBias[idx] = (relief - 0.5) * 0.22;
            } else {
                const coastal = coastalMap[idx];
                texR[idx] = Math.round(14 + coastal * 16);
                texG[idx] = Math.round(52 + coastal * 48);
                texB[idx] = Math.round(126 + coastal * 38);
                texShadeBias[idx] = coastal * 0.08;
            }
        }
    }

    const radiusY = ROWS * 0.43;
    const radiusX = radiusY * 2.0;
    const cx = COLS / 2;
    const cy = ROWS / 2;

    const lInv = 1 / Math.hypot(-0.78, 0.36, 0.51);
    const nlx = -0.78 * lInv;
    const nly = 0.36 * lInv;
    const nlz = 0.51 * lInv;

    const cosT = Math.cos(0.41);
    const sinT = Math.sin(0.41);

    const grid = new Array(ROWS * COLS);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const idx = y * COLS + x;
            const sx = (x - cx) / radiusX;
            const sy = (cy - y) / radiusY;
            const r2 = sx * sx + sy * sy;

            if (r2 > 1) {
                const h = hash2(x, y);
                grid[idx] = h > 0.9978
                    ? { isGlobe: false, bright: h > 0.9993, phaseOffset: x * 0.4 + y * 0.7 }
                    : null;
                continue;
            }

            const sz = Math.sqrt(1 - r2);
            const rim = 1 - Math.sqrt(r2);
            const dayLight = Math.max(0, Math.min(1, (sx * nlx + sy * nly + sz * nlz + 0.28) / 1.28));

            const y1 = sy * cosT - sz * sinT;
            const z1 = sy * sinT + sz * cosT;
            const lat = (Math.asin(Math.max(-1, Math.min(1, y1))) * 180) / Math.PI;
            const ty = Math.max(0, Math.min(TEX_H - 1, Math.floor(((90 - lat) / 180) * TEX_H)));

            grid[idx] = {
                isGlobe: true,
                x1: sx,
                z1,
                tyOffset: ty * TEX_W,
                dayLight,
                rimGlow: rim < 0.045 && dayLight > 0.18 ? (1 - rim / 0.045) * dayLight : 0,
            };
        }
    }

    cachedData = { texR, texG, texB, texShadeBias, grid };
    return cachedData;
}

export function startAsciiEarth(state, clearAnimation) {
    clearAnimation();

    const canvas = state.getAsciiCanvas();
    const { texR, texG, texB, texShadeBias, grid } = getEarthData();

    let angleY = 0;
    let tick = 0;

    const renderFrame = () => {
        const rampChars = state.getChars(DEFAULT_RAMP);
        const rampLen = rampChars.length;
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const parts = [];

        for (let y = 0; y < ROWS; y++) {
            let currentColor = '';
            let run = '';

            const flush = () => {
                if (!run) return;
                parts.push(currentColor ? `<span style="color:${currentColor}">${run}</span>` : run);
                run = '';
            };

            const rowOffset = y * COLS;
            for (let x = 0; x < COLS; x++) {
                const cell = grid[rowOffset + x];

                if (!cell) {
                    if (currentColor !== '') {
                        flush();
                        currentColor = '';
                    }
                    run += ' ';
                    continue;
                }

                if (!cell.isGlobe) {
                    const pulse = Math.sin(tick * 0.05 + cell.phaseOffset);
                    const ch = cell.bright ? (pulse > -0.2 ? '+' : '*') : (pulse > 0.1 ? '*' : '.');
                    const color = cell.bright ? '#b8cee8' : '#6c8ab5';
                    if (color !== currentColor) {
                        flush();
                        currentColor = color;
                    }
                    run += ch;
                    continue;
                }

                const xRot = cell.x1 * cosY + cell.z1 * sinY;
                const zRot = -cell.x1 * sinY + cell.z1 * cosY;

                let lon = (Math.atan2(xRot, zRot) * 180) / Math.PI;
                if (lon < -180) lon += 360;
                if (lon > 180) lon -= 360;

                const tx = Math.floor(((lon + 180) / 360) * TEX_W) % TEX_W;
                const tIdx = cell.tyOffset + (tx < 0 ? tx + TEX_W : tx);

                const light = 0.24 + cell.dayLight * 0.72;
                const rimAdd = cell.rimGlow;

                const r = Math.min(208, Math.round((texR[tIdx] * light + rimAdd * 18) / 8) * 8);
                const g = Math.min(216, Math.round((texG[tIdx] * light + rimAdd * 38) / 8) * 8);
                const b = Math.min(224, Math.round((texB[tIdx] * light + rimAdd * 68) / 8) * 8);
                const color = `rgb(${r},${g},${b})`;

                const shade = Math.max(0.12, Math.min(0.96, cell.dayLight * 0.78 + texShadeBias[tIdx]));
                const ch = rampChars[Math.floor(shade * rampLen)] || rampChars[rampLen - 1];

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
        angleY += 0.04;
        tick += 1;
    };

    renderFrame();
    state.setIntervalId(setInterval(renderFrame, state.getSpeed()));
}