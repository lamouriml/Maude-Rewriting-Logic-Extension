import { Disposable, WebviewPanel, window, ViewColumn, EventEmitter } from 'vscode';

export class VisualizationPanel implements Disposable {
    private static readonly viewType = 'maude.visualization';
    private panel: WebviewPanel | null = null;
    private _onDidReceiveCommand = new EventEmitter<string>();
    private _onStopRequested = new EventEmitter<void>();
    private _onClearRequested = new EventEmitter<void>();
    private _onStartRequested = new EventEmitter<void>();

    readonly onDidReceiveCommand = this._onDidReceiveCommand.event;
    readonly onStopRequested = this._onStopRequested.event;
    readonly onClearRequested = this._onClearRequested.event;
    readonly onStartRequested = this._onStartRequested.event;
    private firstUpdate = true;

    create(): void {
        this.panel = window.createWebviewPanel(
            VisualizationPanel.viewType,
            'Maude-RL',
            ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        this.panel.webview.html = this.initHtml();

        this.panel.webview.onDidReceiveMessage(msg => {
            switch (msg.type) {
                case 'command':
                    this._onDidReceiveCommand.fire(msg.text);
                    break;
                case 'stop':
                    this._onStopRequested.fire();
                    break;
                case 'clear':
                    this._onClearRequested.fire();
                    break;
                case 'start':
                    this._onStartRequested.fire();
                    break;
            }
        });

        this.panel.onDidDispose(() => {
            this.panel = null;
        });
    }

    update(html: string, state: 'ready' | 'running' = 'ready'): void {
        if (!this.panel) return;
        try {
            // First update: set initial HTML on the page
            if (this.firstUpdate) {
                this.firstUpdate = false;
                this.panel.webview.postMessage({ type: 'update', html, state });
                return;
            }
            // Subsequent updates: postMessage only (no full reload)
            this.panel.webview.postMessage({ type: 'update', html, state });
        } catch {
            // disposed
        }
    }

    reveal(): void {
        this.panel?.reveal(ViewColumn.Beside);
    }

    dispose(): void {
        this._onDidReceiveCommand.dispose();
        this._onStopRequested.dispose();
        this._onClearRequested.dispose();
        this._onStartRequested.dispose();
        this.panel?.dispose();
        this.panel = null;
    }

    private initHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>Maude-RL</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#1e1e1e;--text:#d4d4d4;--input-bg:#252526;--input-border:#3c3c3c;--input-color:#d4d4d4;--prompt-color:#c586c0;--fs:13px}
body{font-family:'Consolas','Courier New',monospace;font-size:var(--fs);line-height:1.6;background:var(--bg);color:var(--text);height:100vh;display:flex;flex-direction:column;overflow:hidden}
#output{flex:1;overflow-y:auto;padding:12px 16px;font-size:var(--fs);user-select:text;cursor:text;white-space:pre-wrap}
.tbar{display:flex;align-items:center;gap:6px;border-top:1px solid var(--input-border);background:var(--input-bg);padding:4px 8px;flex-shrink:0}
.tbar .prompt{color:var(--prompt-color);font-weight:bold;white-space:nowrap;font-size:var(--fs)}
.tbar textarea{flex:1;background:transparent;border:none;color:var(--input-color);font-family:inherit;font-size:var(--fs);outline:none;resize:none;padding:2px 0;line-height:1.4;user-select:text}
.zbtn{background:var(--input-border);border:none;color:var(--text);cursor:pointer;padding:2px 6px;border-radius:2px;font-size:12px;line-height:1}
.zbtn:hover{background:#555}
.sbtn{background:var(--input-border);border:none;color:var(--text);cursor:pointer;padding:4px 10px;border-radius:3px;font-family:inherit;font-size:12px;white-space:nowrap}
.sbtn:hover{background:#555}
.sbtn.danger{background:#3a1a1a;color:#f44747}
.sbtn.danger:hover{background:#4a2a2a}
.sbtn.good{background:#1a3a2a;color:#4ec9b0}
.sbtn.good:hover{background:#2a4a3a}
@keyframes pulse{50%{opacity:.5}}
.sbtn.pulse{animation:pulse 1s infinite}
.st{color:#6a9955;font-size:11px;min-width:50px;text-align:right;white-space:nowrap}
.st.run{color:#f44747;font-weight:bold}
.sep{width:1px;height:18px;background:var(--input-border)}
</style>
</head>
<body>
<div id="output"><div class="welcome" style="color:#888;text-align:center;margin-top:40px">Open Maude-RL to start a session.</div><div id="sentinel"></div></div>
<div class="tbar">
  <button class="zbtn" id="zmOut" title="Zoom out">A−</button>
  <button class="zbtn" id="zmIn" title="Zoom in">A+</button>
  <span class="sep"></span>
  <button class="sbtn good" id="startBtn" title="Start new Maude session">▶ Start</button>
  <button class="sbtn" id="clearBtn" title="Clear output">✕ Clear</button>
  <span class="sep"></span>
  <span class="prompt">Maude&gt;</span>
  <textarea id="cmdInput" rows="1" placeholder="command…" spellcheck="false"></textarea>
  <button class="sbtn" id="stopBtn">⏹ Stop</button>
  <span class="st" id="status"></span>
</div>
<script>
(function(){
  const vscode=acquireVsCodeApi();
  const $=s=>document.getElementById(s);
  const output=$('output'),sentinel=$('sentinel'),input=$('cmdInput');
  const stopBtn=$('stopBtn'),startBtn=$('startBtn'),clearBtn=$('clearBtn');
  const statusEl=$('status'),zmOut=$('zmOut'),zmIn=$('zmIn');
  let fs=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--fs'))||13;

  function autoResize(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,120)+'px'}
  function zoom(d){fs=Math.max(8,Math.min(32,fs+d));document.documentElement.style.setProperty('--fs',fs+'px');autoResize()}
  function scrollBottom(){requestAnimationFrame(()=>{sentinel?.scrollIntoView({behavior:'instant'})})}
  function setState(state){
    if(state==='running'){stopBtn.className='sbtn danger pulse';statusEl.className='st run';statusEl.textContent='Running…'}
    else{stopBtn.className='sbtn';statusEl.className='st';statusEl.textContent=''}}
  function updatePage(html,state){
    output.innerHTML=html;
    if(sentinel)output.appendChild(sentinel);
    scrollBottom();
    if(state)setState(state);
  }

  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const t=input.value.trim();if(t){vscode.postMessage({type:'command',text:t})}input.value='';autoResize()}
  });
  input.addEventListener('input',autoResize);
  stopBtn.addEventListener('click',function(){vscode.postMessage({type:'stop'});input.focus()});
  startBtn.addEventListener('click',function(){vscode.postMessage({type:'start'});input.focus()});
  clearBtn.addEventListener('click',function(){vscode.postMessage({type:'clear'});input.focus()});
  zmOut.addEventListener('click',()=>zoom(-1));
  zmIn.addEventListener('click',()=>zoom(1));

  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&e.key==='='){e.preventDefault();zoom(1)}
    if(e.ctrlKey&&e.key==='-'){e.preventDefault();zoom(-1)}
    if(e.ctrlKey&&e.key==='0'){e.preventDefault();fs=13;document.documentElement.style.setProperty('--fs','13px');autoResize()}
  });

  window.addEventListener('message',function(e){
    const d=e.data;if(!d)return;
    if(d.type==='update')updatePage(d.html,d.state);
  });

  input.focus();
}());
</script>
</body>
</html>`;
    }
}
