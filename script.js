const tween = [
  t => t, // 0
  t => 1 - Math.cos((t * Math.PI) / 2), // 1
  t => Math.sin((t * Math.PI) / 2), // 2
  t => (1 - Math.cos(t * Math.PI)) / 2, // 3
  t => t ** 2, // 4
  t => 1 - (t - 1) ** 2, // 5
  t => ((t *= 2) < 1 ? t ** 2 : -((t - 2) ** 2 - 2)) / 2, // 6
  t => t ** 3, // 7
  t => 1 + (t - 1) ** 3, // 8
  t => ((t *= 2) < 1 ? t ** 3 : (t - 2) ** 3 + 2) / 2, // 9
  t => t ** 4, // 10
  t => 1 - (t - 1) ** 4, // 11
  t => ((t *= 2) < 1 ? t ** 4 : -((t - 2) ** 4 - 2)) / 2, // 12
  () => 0, // 13
  () => 1 // 14
  // t => t // 15, should be Animation Curve
];
/* prettier-ignore */
const tweenB = [
  null,
  [0.361974, 0.000000, 0.674135, 0.488132],
  [0.325864, 0.511867, 0.638026, 1.000000],
  [0.364083, 0.000000, 0.635917, 1.000000],
  [0.392730, 0.000000, 0.731875, 0.463750],
  [0.267451, 0.534903, 0.606712, 1.000000],
  [0.443325, 0.000000, 0.556675, 1.000000],
  [0.333333, 0.000000, 0.666667, 0.000000],
  [0.333333, 1.000000, 0.666667, 1.000000],
  [0.646755, 0.000000, 0.353245, 1.000000],
  [0.442421, 0.000000, 0.735885, -0.056459],
  [0.264112, 1.056447, 0.557559, 1.000000],
  [0.747337, 0.000000, 0.252663, 1.000000],
  null,
  null,
];
const audio = {
  /** @type {AudioContext} */
  _actx: null,
  _inited: false,
  _started: false,
  /** @type {AudioBufferSourceNode[]} */
  _bfs: [],
  init(actx) {
    this._actx = actx || self.AudioContext || self.webkitAudioContext;
    this._inited = true;
  },
  start(actx) {
    if (!this._inited) this.init(actx);
    if (!this._started) this._actx = new this._actx();
    this._started = true;
  },
  decode(arraybuffer) {
    const actx = this.actx;
    return actx.decodeAudioData(arraybuffer);
  },
  mute(length) {
    const actx = this.actx;
    return actx.createBuffer(2, 44100 * length, 44100);
  },
  /**
   * @typedef {Object} AudioParamOptions
   * @property {boolean} [loop=false]
   * @property {boolean} [isOut=true]
   * @property {number} [offset=0]
   * @property {number} [playbackrate=1]
   * @property {number} [gainrate=1]
   *
   * @param {AudioBuffer} res
   * @param {AudioParamOptions} options
   */
  play(res, /*prettier-ignore*/ {
    loop = false,
    isOut = true,
    offset = 0,
    playbackrate = 1,
    gainrate = 1
  } = {}) {
    const actx = this.actx;
    const bfs = this._bfs;
    const gain = actx.createGain();
    const bufferSource = actx.createBufferSource();
    bufferSource.buffer = res;
    bufferSource.loop = loop; // 循环播放
    bufferSource.connect(gain);
    gain.gain.value = gainrate;
    bufferSource.playbackRate.value = playbackrate;
    if (isOut) gain.connect(actx.destination);
    bufferSource.start(0, offset);
    bfs[bfs.length] = bufferSource;
  },
  stop() {
    const bfs = this._bfs;
    for (const i of bfs) i.stop();
    bfs.length = 0;
  },
  get actx() {
    if (!this._started) this.start();
    return this._actx;
  }
};
const presets = [
  { chart: 'PastelLines.RekuMochizuki.0', level: 'IN' }, // 初始谱面
  { chart: 'Bamboo.rissyuu.0', level: 'IN' }, // BpmShifts长度大于1
  { chart: 'RIP.eicateve.0', level: 'IN' }, // 线动成面
  { chart: 'TheNextArcady.SEPHID.0', level: 'IN' }, // 包含透明渐变背景、CameraMove包含xPositionKeyPoints
  { chart: 'OnAndOn.ETIA.0', level: 'IN' }, // BpmShifts为空数组
  { chart: 'Vrtuaresort.seatrus.0', level: 'IN' }, // CameraMove包含xPositionKeyPoints
  { chart: 'LavenderLeaffeatLexi.VauBoy.0', level: 'IN' }, // 好长一首歌qwq
  { chart: 'SakuraFubuki.Street.0', level: 'IN' }, // 开头字体显示bug fix
  { chart: 'RestrictedAccess.Knighthood.0', level: 'IN' }, // 特色表演
  { chart: 'SwingSweetTweeDance.Uske.0', level: 'IN' }, // CameraMove.scaleKeyPoints初始time不为0
  { chart: 'Antler.Juggernaut.0', level: 'IN' }, // lineCap = round 包含点状线条
  { chart: 'slichertz.Sobrem.0', level: 'IN' }, // 包含负y值音符
  { chart: 'BRAVEROAD.umavsMorimoriAtsushi.0', level: 'AT' } // AT谱面+多个theme
];
const assets = atob('L3NpbS1yemMtYXNzZXRz');
const params = new URLSearchParams(location.search);
const selectedChart = params.get('chart'); // 如果chart输入数字，就用预设
const selectedSpeed = params.get('speed') || '3.5';
const selectedLevel = params.get('level') || 'IN';
const info = presets[+selectedChart] || { chart: selectedChart, level: selectedLevel };
const res = [`${assets}/${info.chart}/music.ogg`, `${assets}/${info.chart}/Chart_${info.level}.json`];
// const res = [`../plugins/bundle/ラグトレイン.稲葉曇.0/Music.ogg`, `../plugins/bundle/ラグトレイン.稲葉曇.0/Chart_HD_repaired.json`];
// const res = ['../assets/PastelLines.RekuMochizuki.0/music.ogg', '../plugins/bundle/riztime_test/Chart_EZ.json'];
const linePoints = [];
let speed = 6.71875 + +selectedSpeed;
let hhl = 0;
let ringY = 0;
let noteScale = 0;
let centerX = 0;
let centerY = 0;
let wlen = 0;
let hlen = 0;
async function main() {
  const stage = document.getElementById('stage');
  const canvas = document.createElement('canvas');
  const canvasfg = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const ctxfg = canvasfg.getContext('2d');
  stage.appendChild(canvas);
  window.addEventListener('resize', resize);
  resize();
  let errored = false;
  document.body.onunhandledrejection = () => (errored = true);
  stage.onclick = () => {
    if (errored) window.alert('资源不合法，请检查');
    else window.alert('资源加载中，请稍候');
  };
  audio.init();
  const bgm = await audio.decode(await (await fetch(res[0])).arrayBuffer());
  const hit1 = await audio.decode(await (await fetch(`${assets}/rizline_level_tap_1.ogg`)).arrayBuffer());
  const hit2 = await audio.decode(await (await fetch(`${assets}/rizline_level_drag_1.ogg`)).arrayBuffer());
  const chart = await (await fetch(res[1])).json();
  console.log(chart);
  self.chart = chart;
  prepChart();

  function resize() {
    canvas.style.cssText += `;width:${stage.clientWidth}px;height:${stage.clientHeight}px`;
    const width = stage.clientWidth * devicePixelRatio;
    const height = stage.clientHeight * devicePixelRatio;
    const aspect = width / height;
    canvas.width = width;
    canvas.height = height;
    canvasfg.width = width;
    canvasfg.height = height;
    ctx.lineCap = 'round';
    ringY = aspect > 9 / 16 ? height * 0.74 : (width * 0.74) / (9 / 16) + (height - width / (9 / 16)) / 2;
    noteScale = aspect > 9 / 16 ? height / 1920 : width / 1080;
    centerX = width / 2;
    centerY = height / 2;
    wlen = aspect > 3 / 4 ? height * (3 / 4) : width;
    hlen = aspect > 9 / 16 ? height : width / (9 / 16);
    hhl = 0.0777 * hlen;
  }

  function prepChart() {
    // if (chart.fileVersion !== 0) throw new Error('fileVersion is not 0');
    const bpmShifts = chart.bpmShifts;
    if (!bpmShifts.length) bpmShifts.push({ time: 0, value: 1, easeType: 0, floorPosition: 0 });
    bpmShifts.forEach(modify);
    const getSeconds = time => {
      let result = Infinity;
      for (const i of bpmShifts) {
        if (time > i.endTime) continue;
        if (time < i.startTime) break;
        result = i.floorPosition + ((time - i.startTime) / i.startValue / chart.bPM) * 60;
      }
      return result;
    };
    for (const i of bpmShifts) {
      i.startSeconds = getSeconds(i.startTime);
      i.endSeconds = getSeconds(i.endTime);
      if (i.easeType !== 0) console.error('EaseType is not 0:', i.easeType);
      else delete i.easeType;
    }
    for (const i of chart.themes) {
      i.bgColor = rgba2Str(i.colorsList[0]);
      i.bgColor0 = rgba2Str({ ...i.colorsList[0], a: 0 });
      i.bgColor1 = rgba2Str({ ...i.colorsList[0], a: 127.5 });
      i.noteColor = rgba2Str(i.colorsList[1]);
      i.fxColor = rgba2Str(i.colorsList[2]);
      if (i.colorsList.length > 3) console.error('colorsList length is greater than 3:', i.colorsList);
      // delete i.colorsList;
    }
    for (const i of chart.challengeTimes) {
      i.themeIndex = chart.challengeTimes.indexOf(i) + 1;
      i.startSeconds = getSeconds(i.start);
      i.endSeconds = getSeconds(i.end);
      i.transStartSeconds = i.startSeconds + i.transTime;
      i.transEndSeconds = i.endSeconds + i.transTime;
    }
    chart.canvasMoves.forEach((i, index) => {
      if (i.index !== index) throw new Error('CanvasMove index is not correct');
    });
    for (const i of chart.canvasMoves) {
      i.xPositionKeyPoints.forEach(modify);
      for (const j of i.xPositionKeyPoints) {
        j.startSeconds = getSeconds(j.startTime);
        j.endSeconds = getSeconds(j.endTime);
        if (j.floorPosition !== 0) console.error('FloorPosition is not 0:', j.floorPosition);
        else delete j.floorPosition;
      }
      i.speedKeyPoints.forEach(modify);
      for (const j of i.speedKeyPoints) {
        j.startSeconds = getSeconds(j.startTime);
        j.endSeconds = getSeconds(j.endTime);
        if (j.easeType !== 0) console.error('EaseType is not 0:', j.easeType);
        else delete j.easeType;
      }
    }
    chart.cameraMove.scaleKeyPoints.forEach(modify);
    for (const i of chart.cameraMove.scaleKeyPoints) {
      i.startSeconds = getSeconds(i.startTime);
      i.endSeconds = getSeconds(i.endTime);
      if (i.floorPosition !== 0) console.error('FloorPosition is not 0:', i.floorPosition);
      else delete i.floorPosition;
    }
    chart.cameraMove.xPositionKeyPoints.forEach(modify);
    for (const i of chart.cameraMove.xPositionKeyPoints) {
      i.startSeconds = getSeconds(i.startTime);
      i.endSeconds = getSeconds(i.endTime);
      // if (i.floorPosition !== 0) console.error('FloorPosition is not 0:', i.floorPosition);
      // else delete i.floorPosition;
    }

    function modify(v, i, a) {
      if (v.time !== undefined) {
        v.startTime = v.time;
        v.endTime = i == a.length - 1 ? Infinity : a[i + 1].time;
        delete v.time;
      }
      if (v.value !== undefined) {
        v.startValue = v.value;
        v.endValue = i == a.length - 1 ? v.value : a[i + 1].value;
        delete v.value;
      }
      if (v.xPosition !== undefined) {
        v.startX = v.xPosition;
        v.endX = i == a.length - 1 ? v.xPosition : a[i + 1].xPosition;
        delete v.xPosition;
      }
      // // debug
      // if (v.canvasIndex === 0) {
      //   console.log(v.color);
      //   v.color = { r: 255, g: 0, b: 0, a: 255 };
      // }
      if (v.canvasIndex !== undefined) {
        v.startCanvasIndex = v.canvasIndex;
        v.endCanvasIndex = i == a.length - 1 ? v.canvasIndex : a[i + 1].canvasIndex;
        delete v.canvasIndex;
        v.startY = v.floorPosition;
        v.endY = i == a.length - 1 ? v.floorPosition : a[i + 1].floorPosition;
        delete v.floorPosition;
      }
      if (v.color !== undefined) {
        v.startColor = v.color;
        v.endColor = i == a.length - 1 ? v.color : a[i + 1].color;
        delete v.color;
      }
    }
    chart.lines.forEach((v, i) => (v.id = i));
    for (const i of chart.lines) {
      i.startSeconds = getSeconds(i.linePoints[0].time);
      i.endSeconds = getSeconds(i.linePoints[i.linePoints.length - 1].time);
      i.linePoints.forEach(modify);
      for (const j of i.linePoints) {
        j.lineId = i.id;
        j.startSeconds = getSeconds(j.startTime);
        j.endSeconds = getSeconds(j.endTime);
        j.startCanvas = chart.canvasMoves[j.startCanvasIndex];
        j.endCanvas = chart.canvasMoves[j.endCanvasIndex];
        linePoints.push(j);
      }
      i.notes.forEach((v, i) => (v.id = i));
      for (const j of i.notes) {
        j.seconds = getSeconds(j.time);
        if (j.seconds < i.startSeconds || i.endSeconds < j.seconds) console.error('Note is out of line:', j);
        for (const k of i.linePoints) {
          if (k.startSeconds <= j.seconds && j.seconds <= k.endSeconds && k.endSeconds !== Infinity) {
            j.linePoint = k;
            j.startCanvas = chart.canvasMoves[k.startCanvasIndex];
            j.endCanvas = chart.canvasMoves[k.endCanvasIndex];
            j.progress = (j.seconds - k.startSeconds) / (k.endSeconds - k.startSeconds);
            // break;
          }
        }
        const oi = j.otherInformations;
        if (j.type == 2) {
          if (oi.length) {
            if (oi.length !== 3) console.error('[=2] must have 3 elements, but got', j);
            j.holdEndTime = oi[0];
            j.holdEndCanvasIndex = oi[1];
            j.holdEndFloorPosition = oi[2];
            j.holdEndSeconds = getSeconds(j.holdEndTime);
          } else console.error('[=2] is empty:', j);
        } else {
          if (oi.length) {
            const valid = oi.length === 3 && oi[0] === 0 && oi[1] === 0 && oi[2] === 0;
            if (!valid) console.error('[!2] must be [] or [0,0,0], but got', j);
          } else {
            // legal
          }
        }
        delete j.otherInformations;
      }
      i.judgeRingColor.forEach(modify);
      for (const j of i.judgeRingColor) {
        j.startSeconds = getSeconds(j.startTime);
        j.endSeconds = getSeconds(j.endTime);
      }
      i.lineColor.forEach(modify);
      for (const j of i.lineColor) {
        j.startSeconds = getSeconds(j.startTime);
        j.endSeconds = getSeconds(j.endTime);
      }
    }
    // linePoints.sort((a, b) => b.startCanvasIndex - a.startCanvasIndex);
    linePoints.sort((a, b) => a.startTime - b.startTime);
  }
  stage.onclick = async () => {
    audio.play(bgm, { gainrate: 0.5 });
    stage.onclick = null;
    for (const i of chart.lines) {
      for (const j of i.notes) {
        setTimeout(() => {
          audio.play(j.type == 1 ? hit2 : hit1);
          console.debug(j.type === 0 ? 'Tap' : j.type === 1 ? 'Drag' : 'Hold', /* i.id + '.' + j.id ,*/ 'at', Math.round(j.seconds * 1e3), 'ms');
        }, j.seconds * 1e3);
      }
    }
    const now = performance.now();
    loop();

    function loop() {
      const nowSeconds = (self.qwq ? self.qwq : performance.now() - now) / 1e3;
      calcqwq(nowSeconds);
      const scale = chart.cameraMove.currentScale;
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 处理challengeTimes
      if (chart.challengeTimes.every(i => nowSeconds < i.transStartSeconds || nowSeconds > i.endSeconds)) {
        drawqwq(ctx, nowSeconds, scale, chart.themes[0].bgColor, chart.themes[0].bgColor0, chart.themes[0].bgColor1, chart.themes[0].noteColor);
      }
      for (const i of chart.challengeTimes) {
        const theme = chart.themes[i.themeIndex];
        if (nowSeconds > i.endSeconds && nowSeconds <= i.transEndSeconds) {
          const transProgress = 1 - (nowSeconds - i.endSeconds) / (i.transEndSeconds - i.endSeconds);
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(centerX, 0, centerY * 2 * transProgress * 15, 0, Math.PI * 2);
          ctx.fill();
          drawqwq(ctxfg, nowSeconds, scale, theme.bgColor, theme.bgColor0, theme.bgColor1, theme.noteColor);
          ctx.globalCompositeOperation = 'destination-over';
          ctx.drawImage(canvasfg, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
        } else if (nowSeconds > i.transStartSeconds && nowSeconds <= i.endSeconds) {
          drawqwq(ctx, nowSeconds, scale, theme.bgColor, theme.bgColor0, theme.bgColor1, theme.noteColor);
        } else if (nowSeconds > i.startSeconds && nowSeconds <= i.transStartSeconds) {
          const transProgress = (nowSeconds - i.startSeconds) / (i.transStartSeconds - i.startSeconds);
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(centerX, centerY * 2, centerY * 2 * transProgress * 15, 0, Math.PI * 2);
          ctx.fill();
          drawqwq(ctxfg, nowSeconds, scale, theme.bgColor, theme.bgColor0, theme.bgColor1, theme.noteColor);
          ctx.globalCompositeOperation = 'destination-over';
          ctx.drawImage(canvasfg, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      for (const i of chart.lines) {
        const x = centerX + i.currentX * scale * wlen;
        // 画圈
        if (i.currentJudgeRingColor && nowSeconds >= i.startSeconds && nowSeconds <= i.endSeconds) {
          ctx.strokeStyle = rgba2Str(i.currentJudgeRingColor);
          ctx.lineWidth = noteScale * 10 * scale;
          ctx.beginPath();
          ctx.arc(x, ringY, noteScale * 53 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
        // 标记线id
        if (nowSeconds >= i.startSeconds && nowSeconds <= i.endSeconds) {
          ctx.fillStyle = 'black';
          ctx.font = hlen * 0.02 + 'px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(i.id, x, ringY + noteScale * 100 + (i.id % 9) * hlen * 0.02);
        }
      }
      // ctx.strokeStyle = 'red';
      // ctx.lineWidth = 1;
      // ctx.strokeRect(centerX - wlen / 2, centerY - hlen / 2, wlen, hlen);
      // 给不在矩形范围的区域加阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, centerX - wlen / 2, canvas.height);
      ctx.fillRect(centerX + wlen / 2, 0, centerX - wlen / 2, canvas.height);
      ctx.fillRect(centerX - wlen / 2, 0, wlen, centerY - hlen / 2);
      ctx.fillRect(centerX - wlen / 2, centerY + hlen / 2, wlen, centerY - hlen / 2);
      requestAnimationFrame(loop);
    }

    function drawqwq(ctx, nowSeconds, scale, bgColor, bgColor0, bgColor1, noteColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = hlen * 0.004;
      ctx.font = hlen * 0.02 + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Copyright
      ctx.strokeText('Rizline Simulator v0.1.9', centerX, centerY - hlen * 0.03);
      ctx.fillText('Rizline Simulator v0.1.9', centerX, centerY - hlen * 0.03);
      ctx.strokeText('DO NOT DISTRIBUTE!', centerX, centerY - hlen * 0.06);
      ctx.fillText('DO NOT DISTRIBUTE!', centerX, centerY - hlen * 0.06);
      ctx.strokeText('Code by lchz\x683\x3473', centerX, centerY);
      ctx.fillText('Code by lchz\x683\x3473', centerX, centerY);
      ctx.strokeText('Time: ' + (nowSeconds * 1e3).toFixed(2) + 'ms', centerX, centerY + hlen * 0.03);
      ctx.fillText('Time: ' + (nowSeconds * 1e3).toFixed(2) + 'ms', centerX, centerY + hlen * 0.03);
      ctx.lineWidth = noteScale * 10;
      for (const j of linePoints) {
        // linePoints连线
        const y1 = (j.startY - j.startCanvas.currentY) * scale;
        const y2 = (j.endY - j.endCanvas.currentY) * scale;
        const cy1 = ringY - y1 * speed * hhl;
        const cy2 = ringY - y2 * speed * hhl;
        if (cy1 < 0 && cy2 < 0) continue;
        if (cy1 > canvas.height && cy2 > canvas.height) continue;
        const x1 = (j.startX + j.startCanvas.currentX) * scale;
        const x2 = (j.endX + j.endCanvas.currentX) * scale;
        const cx1 = centerX + x1 * wlen;
        const cx2 = centerX + x2 * wlen;
        const easeType = j.easeType;
        ctx.beginPath();
        if (easeType === 0 || cx1 === cx2) {
          ctx.moveTo(cx1, cy1);
          ctx.lineTo(cx2, cy2);
        } else if (easeType === 13) {
          ctx.moveTo(cx1, cy1);
          ctx.lineTo(cx1, cy2);
        } else if (easeType === 14) {
          ctx.moveTo(cx2, cy1);
          ctx.lineTo(cx2, cy2);
        } else {
          // 7.9ms(存在bug)
          // ctx.moveTo(cx1, cy1);
          // const cp = tweenB[easeType];
          // if (!cp) throw new Error('easeType ' + easeType + ' not found');
          // const cp1x = cx1 + (cx2 - cx1) * cp[1];
          // const cp1y = cy1 + (cy2 - cy1) * cp[0];
          // const cp2x = cx1 + (cx2 - cx1) * cp[3];
          // const cp2y = cy1 + (cy2 - cy1) * cp[2];
          // ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cx2, cy2);
          // 17.9ms
          ctx.moveTo(cx1, cy1);
          for (let t = 0; t < 1; t += 0.03125) {
            const tx = cx1 + (cx2 - cx1) * tween[easeType](t);
            const ty = cy1 + (cy2 - cy1) * t;
            ctx.lineTo(tx, ty);
          }
          ctx.lineTo(cx2, cy2);
        }
        if (!isNaN(cy1) && !isNaN(cy2)) {
          if ((cx1 === cx2 && cy1 === cy2) || j.currentStartColor === j.currentEndColor) ctx.strokeStyle = j.currentStartColor;
          else {
            const gradient = ctx.createLinearGradient(cx1, cy1, cx2, cy2);
            gradient.addColorStop(0, j.currentStartColor);
            gradient.addColorStop(1, j.currentEndColor);
            ctx.strokeStyle = gradient;
          }
        } else {
          ctx.strokeStyle = j.currentStartColor;
        }
        ctx.stroke();
        // 标记线点id
        // ctx.fillStyle = 'black';
        // ctx.font = hlen * 0.02 + 'px Arial';
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle';
        // ctx.fillText(j.lineId, cx1, cy1);
        // ctx.fillText(j.startCanvasIndex, cx1, cy1 + hlen * 0.02);
      }
      // line遮罩
      {
        // const gradient = ctx.createLinearGradient(0, centerY + hlen / 2 - hlen * (404 / 1920), 0, centerY + hlen / 2 - hlen * (596 / 1920));
        // gradient.addColorStop(0 / 192, bgColor);
        // gradient.addColorStop(128 / 192, bgColor1);
        // gradient.addColorStop(192 / 192, bgColor0);
        const gradient = ctx.createLinearGradient(0, centerY - hlen / 2, 0, centerY + hlen / 2);
        // gradient.addColorStop(174 / 1920, bgColor);
        // gradient.addColorStop(302 / 1920, bgColor1);
        // gradient.addColorStop(366 / 1920, bgColor0);
        gradient.addColorStop(1324 / 1920, bgColor0);
        gradient.addColorStop(1388 / 1920, bgColor1);
        gradient.addColorStop(1516 / 1920, bgColor);
        ctx.fillStyle = gradient;
        // ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      for (const i of chart.lines) {
        // 绘制note
        for (const j of i.notes) {
          const deltaSeconds = j.seconds - nowSeconds;
          if (j.type === 0) {
            if (deltaSeconds < 0) continue;
            const x = centerX + j.currentX * scale * wlen;
            const y = ringY - j.currentY * scale * speed * hhl;
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x, y, noteScale * 42 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = noteColor;
            ctx.beginPath();
            ctx.arc(x, y, noteScale * 26 * scale, 0, Math.PI * 2);
            ctx.fill();
          } else if (j.type === 1) {
            if (deltaSeconds < 0) continue;
            const x = centerX + j.currentX * scale * wlen;
            const y = ringY - j.currentY * scale * speed * hhl;
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x, y, noteScale * 32 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, noteScale * 22 * scale, 0, Math.PI * 2);
            ctx.fill();
          } else if (j.type === 2) {
            if (j.holdEndSeconds - nowSeconds < -0.25) continue; // 0.25s
            const x = centerX + j.currentX * scale * wlen;
            const y = ringY - (deltaSeconds < 0 ? 0 : j.currentY * scale * speed * hhl);
            ctx.strokeStyle = 'black';
            ctx.fillStyle = noteColor;
            ctx.lineWidth = noteScale * 10 * scale;
            if (j.holdEndSeconds - nowSeconds < 0) {
              const progress = 1 - ((nowSeconds - j.holdEndSeconds) / 0.25) ** 3; // todo
              ctx.beginPath();
              ctx.arc(x, y, noteScale * 34 * scale * progress, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(x, y, noteScale * 27 * scale * progress, 0, Math.PI * 2);
              ctx.fillStyle = 'white';
              ctx.fill();
              ctx.stroke();
              continue;
            }
            ctx.beginPath();
            ctx.arc(x, y, noteScale * 34 * scale, 0, Math.PI * 2);
            ctx.stroke();
            const holdSize = noteScale * 23 * scale;
            const dy = ringY - j.currentHoldY * scale * speed * hhl; // todo
            if (y) {
              const gradient = ctx.createLinearGradient(x, y, x, dy);
              gradient.addColorStop(0 / 63, noteColor);
              gradient.addColorStop(36 / 63, noteColor);
              gradient.addColorStop(63 / 63, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = gradient;
            }
            ctx.fillRect(x - holdSize, dy, holdSize * 2, y - dy);
            ctx.beginPath();
            ctx.moveTo(x - holdSize, y);
            ctx.lineTo(x - holdSize, dy);
            ctx.moveTo(x + holdSize, y);
            ctx.lineTo(x + holdSize, dy);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, noteScale * 27 * scale, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.stroke();
          }
          // 标记note id
          // ctx.fillStyle = 'blue';
          // ctx.font = '30px Arial';
          // ctx.textAlign = 'center';
          // ctx.textBaseline = 'middle';
          // ctx.fillText(i.id + '.' + j.id, x, y);
        }
      }
      // note遮罩
      {
        // const gradient = ctx.createLinearGradient(0, centerY + hlen / 2 - hlen * (211 / 1920), 0, centerY + hlen / 2 - hlen * (336 / 1920));
        // gradient.addColorStop(0 / 192, bgColor);
        // gradient.addColorStop(128 / 192, bgColor1);
        // gradient.addColorStop(192 / 192, bgColor0);
        const gradient = ctx.createLinearGradient(0, centerY - hlen / 2, 0, centerY + hlen / 2);
        gradient.addColorStop(174 / 1920, bgColor);
        gradient.addColorStop(302 / 1920, bgColor1);
        gradient.addColorStop(366 / 1920, bgColor0);
        gradient.addColorStop(1584 / 1920, bgColor0);
        // gradient.addColorStop(302 / 1920, bgColor1);
        gradient.addColorStop(1709 / 1920, bgColor);
        ctx.fillStyle = gradient;
        // ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // 绘制打击特效(WIP)
    }

    function calcqwq(nowSeconds) {
      const { scaleKeyPoints, xPositionKeyPoints } = chart.cameraMove;
      if (scaleKeyPoints.length) chart.cameraMove.currentScale = scaleKeyPoints[0].startValue; // WIP
      for (const i of scaleKeyPoints) {
        if (nowSeconds > i.endSeconds) continue;
        if (nowSeconds < i.startSeconds) break;
        const delta = tween[i.easeType]((nowSeconds - i.startSeconds) / (i.endSeconds - i.startSeconds));
        chart.cameraMove.currentScale = i.startValue + (i.endValue - i.startValue) * delta;
        break;
      }
      if (xPositionKeyPoints.length) chart.cameraMove.currentX = xPositionKeyPoints[0].startValue; // WIP
      for (const i of xPositionKeyPoints) {
        if (nowSeconds > i.endSeconds) continue;
        if (nowSeconds < i.startSeconds) break;
        const delta = tween[i.easeType]((nowSeconds - i.startSeconds) / (i.endSeconds - i.startSeconds));
        chart.cameraMove.currentX = i.startValue + (i.endValue - i.startValue) * delta;
        break;
      }
      // 计算不同canvas的实时位置
      for (const i of chart.canvasMoves) {
        i.currentX = (i.xPositionKeyPoints[0].startValue || 0) - chart.cameraMove.currentX;
        for (const j of i.xPositionKeyPoints) {
          if (nowSeconds > j.endSeconds) continue;
          if (nowSeconds < j.startSeconds) break;
          const delta = tween[j.easeType]((nowSeconds - j.startSeconds) / (j.endSeconds - j.startSeconds));
          i.currentX = j.startValue + (j.endValue - j.startValue) * delta - chart.cameraMove.currentX;
        }
        for (const j of i.speedKeyPoints) {
          if (nowSeconds > j.endSeconds) continue;
          if (nowSeconds < j.startSeconds) break;
          i.currentY = j.floorPosition + (nowSeconds - j.startSeconds) * j.startValue;
        }
      }
      for (const i of chart.lines) {
        const seconds = nowSeconds;
        for (const j of i.linePoints) {
          if (seconds > j.endSeconds) continue;
          if (seconds < j.startSeconds) break;
          const x1 = j.startX + chart.canvasMoves[j.startCanvasIndex].currentX;
          const x2 = j.endX + chart.canvasMoves[j.endCanvasIndex].currentX;
          const y1 = j.startY - chart.canvasMoves[j.startCanvasIndex].currentY;
          const y2 = j.endY - chart.canvasMoves[j.endCanvasIndex].currentY;
          const delta = tween[j.easeType]((0 - y1) / (y2 - y1));
          i.currentX = x1 + (x2 - x1) * delta;
        }
        // 通过缓动函数计算出note的水平位置
        for (const j of i.notes) {
          const seconds = j.seconds;
          const k = j.linePoint;
          const x1 = k.startX + chart.canvasMoves[k.startCanvasIndex].currentX;
          const x2 = k.endX + chart.canvasMoves[k.endCanvasIndex].currentX;
          const delta = tween[k.easeType]((seconds - k.startSeconds) / (k.endSeconds - k.startSeconds));
          j.currentX = x1 + (x2 - x1) * delta;
          j.currentY = j.floorPosition - chart.canvasMoves[k.startCanvasIndex].currentY;
          if (j.type === 2) {
            if (nowSeconds >= seconds) {
              for (const k of i.linePoints) {
                if (nowSeconds > k.endSeconds) continue;
                if (nowSeconds < k.startSeconds) break;
                const x1 = k.startX + chart.canvasMoves[k.startCanvasIndex].currentX;
                const x2 = k.endX + chart.canvasMoves[k.endCanvasIndex].currentX;
                const delta = tween[k.easeType]((nowSeconds - k.startSeconds) / (k.endSeconds - k.startSeconds));
                j.currentX = x1 + (x2 - x1) * delta;
              }
            }
            j.currentHoldY = j.holdEndFloorPosition - chart.canvasMoves[j.holdEndCanvasIndex].currentY;
          }
        }
        i.currentJudgeRingColor = getCurrentColor(i.judgeRingColor, nowSeconds);
        const currentLineColor = getCurrentColor(i.lineColor, nowSeconds);
        if (currentLineColor) {
          for (const j of i.linePoints) {
            j.currentStartColor = rgba2Str(mixColor(j.startColor, currentLineColor));
            j.currentEndColor = rgba2Str(mixColor(j.endColor, currentLineColor));
          }
        } else {
          for (const j of i.linePoints) {
            j.currentStartColor = rgba2Str(j.startColor);
            j.currentEndColor = rgba2Str(j.endColor);
          }
        }
      }
    }
  };
}

function rgba2Str({ r, g, b, a }) {
  return `rgba(${r},${g},${b},${a / 255})`;
}

function mixColor({ r: r1, g: g1, b: b1, a: a1 }, { r: r2, g: g2, b: b2, a: a2 }) {
  if (a2 === 0) return { r: r1, g: g1, b: b1, a: a1 };
  if (a2 === 255) return { r: r2, g: g2, b: b2, a: a1 };
  const a0 = a2 / 255;
  return { r: r1 + (r2 - r1) * a0, g: g1 + (g2 - g1) * a0, b: b1 + (b2 - b1) * a0, a: a1 };
}

function getCurrentColor(colorPoints, nowSeconds) {
  let currentColor = null;
  if (colorPoints.length) currentColor = colorPoints[0].startColor;
  for (const j of colorPoints) {
    if (nowSeconds > j.endSeconds) continue;
    if (nowSeconds < j.startSeconds) break;
    const delta = (nowSeconds - j.startSeconds) / (j.endSeconds - j.startSeconds);
    currentColor = {
      r: j.startColor.r + (j.endColor.r - j.startColor.r) * delta,
      g: j.startColor.g + (j.endColor.g - j.startColor.g) * delta,
      b: j.startColor.b + (j.endColor.b - j.startColor.b) * delta,
      a: j.startColor.a + (j.endColor.a - j.startColor.a) * delta
    };
    break;
  }
  return currentColor;
}
