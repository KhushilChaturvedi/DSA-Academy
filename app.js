(()=>{
const M=window.ACADEMY_MODULES;
const SKEY="dsa-academy-progress-v1";
let state=load(); let session=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function load(){try{return Object.assign({done:{},theme:"dark"},JSON.parse(localStorage.getItem(SKEY)||"{}"))}catch{return {done:{},theme:"dark"}}}
function save(){localStorage.setItem(SKEY,JSON.stringify(state))}
function theme(){document.documentElement.dataset.theme=state.theme;$("#themeBtn").textContent=state.theme==="dark"?"☼":"☾"}
function pct(){return Math.round(Object.keys(state.done).length/M.length*100)}
function renderHome(){
 $("#academyPct").textContent=pct()+"%";$("#academyBar").style.width=pct()+"%";$("#academyCount").textContent=`${Object.keys(state.done).length} / ${M.length} modules`;
 const areas=[...new Set(M.map(m=>m.area))];$("#areaFilter").innerHTML=`<option value="all">All areas</option>`+areas.map(x=>`<option>${x}</option>`).join("");
 const area=$("#areaFilter").value||"all", st=$("#stateFilter").value||"all";
 const shown=M.filter(m=>(area==="all"||m.area===area)&&(st==="all"||(st==="done"?state.done[m.title]:!state.done[m.title])));
 $("#moduleCount").textContent=`${shown.length} modules`;$("#moduleGrid").innerHTML=shown.map((m,i)=>`<button class="module-card ${state.done[m.title]?"done":""}" data-title="${esc(m.title)}"><div class="module-top"><span class="eyebrow">${esc(m.area)}</span><span>${state.done[m.title]?"✓":"→"}</span></div><h3>${esc(m.title)}</h3><p>${esc(m.why)}</p><div class="module-bar"><span style="width:${state.done[m.title]?"100":"0"}%"></span></div><div class="module-foot"><span>${state.done[m.title]?"Completed":"Not started"}</span><span>7-step lesson</span></div></button>`).join("");
 $$(".module-card").forEach(b=>b.onclick=()=>start(M.find(x=>x.title===b.dataset.title)));
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function start(mod){
 session={m:mod,stage:0,answered:false};$("#homeView").classList.add("hidden");$("#completeView").classList.add("hidden");$("#lessonView").classList.remove("hidden");renderStage();
}
const stageNames=["Discover","Understand","Simulate","Predict","Build","Explain","Break & Connect"];
function renderStage(){
 const m=session.m, st=session.stage;
 $("#lessonCounter").textContent=`${M.indexOf(m)+1}/${M.length} · ${m.area}`;
 $("#lessonStage").textContent=`${stageNames[st]} · ${st+1}/7`;
 $("#lessonBar").style.width=(st/7*100)+"%";$("#lessonArea").textContent=m.area;$("#lessonModule").textContent=m.title;
 $("#sideProblem").textContent=m.why;$("#sideInvariant").textContent=m.invariant;$("#sideOps").textContent=m.operations;
 $("#sideCheck").textContent=st>=5?"Can you explain it without using the formal definition?":"Don't chase the answer. Explain why it must be true.";
 $("#lessonKicker").textContent=stageNames[st].toUpperCase();
 $("#lessonFeedback").className="feedback hidden";$("#lessonInsight").classList.add("insight","hidden");$("#lessonInteraction").innerHTML="";
 $("#continueBtn").disabled=true; $("#continueBtn").textContent=st===6?"Finish module →":"Continue →";
 const built=stageData(m,st);$("#lessonTitle").textContent=built.title;$("#lessonText").textContent=built.text;$("#lessonVisual").innerHTML=built.visual;
 if(built.interaction) mountChoice(built.interaction);
 else { $("#continueBtn").disabled=false; $("#lessonInsight").classList.remove("hidden");$("#lessonInsight").innerHTML=`<span class="eyebrow">CORE IDEA</span><p>${esc(built.insight)}</p>`; }
}
function stageData(m,st){
 if(st===0)return {title:m.title+" starts with a problem.",text:m.why,visual:viz(m,0),interaction:{prompt:"What is the key pressure this concept is designed to handle?",opts:[m.pressureFrom||m.invariant,"Make every operation O(1) regardless of constraints.","Store every possible answer in advance.","Ignore the input structure."],correct:0,ok:"Exactly. A data structure or pattern exists because some repeated pressure needs a better representation.",bad:"Look at the reason the concept exists. What repeated pressure is causing the naive approach to hurt?",insight:m.intuition}};
 if(st===1)return {title:"Strip away the vocabulary.",text:m.intuition,visual:viz(m,1),interaction:{prompt:"Which statement best captures the mental model?",opts:[m.invariant,"The implementation syntax is the concept.","The concept works only on one specific example.","The fastest possible code is always the main idea."],correct:0,ok:"Yes. The invariant is the durable idea; code is one implementation of it.",bad:"Ignore syntax. What must remain true or what information must the structure preserve?",insight:m.invariant}};
 if(st===2)return {title:"Now manipulate the idea.",text:"Watch the structure change. The goal is to see the rule operate, not merely hear about it.",visual:viz(m,2),interaction:{prompt:predictPrompt(m),opts:predictOptions(m),correct:0,ok:"Good. You are reasoning from the structure rather than recalling a definition.",bad:"Use the invariant. What must the next operation preserve?",insight:m.operations}};
 if(st===3)return {title:"Predict before the computer reveals it.",text:m.predict,visual:viz(m,3),interaction:{prompt:"Choose the outcome your mental model predicts.",opts:predictOptions(m,true),correct:0,ok:"Exactly. Prediction is where the mental model becomes usable.",bad:"Simulate the invariant one step at a time.",insight:"Prediction forces you to execute the data structure mentally."}};
 if(st===4)return {title:"Build the smallest version.",text:"You do not need a full library yet. Construct the abstraction from its required state and operations.",visual:`<div class="codeish">${esc(buildPrompt(m))}</div>`,interaction:{prompt:"Which design decision must come first?",opts:[buildAnswer(m),m.operations+" is implementation detail; start coding immediately.","Copy a known implementation without identifying state.","Optimize before defining what the structure stores."],correct:0,ok:"Yes. Define state and invariants first; code follows from them.",bad:"Ask what information the implementation must maintain for every operation.",insight:"A first-principles implementation starts from state + invariant + operations."}};
 if(st===5)return {title:"Explain it back.",text:"Pick the explanation that would let another person reconstruct the concept from scratch.",visual:viz(m,5),interaction:{prompt:"Which explanation is closest to a transferable understanding?",opts:[m.intuition+" The formal name is secondary.","It is a library/container with a fixed API.","It is just a memorized pattern.","It is fast because computers are fast."],correct:0,ok:"Exactly. If you can reconstruct the idea, you understand it.",bad:"Prefer an explanation that describes the pressure, structure, and invariant—not the vocabulary.",insight:"Teach-back is the checkpoint before we trust that the concept is understood."}};
 return {title:"What breaks—and where does it connect?",text:m.break,visual:viz(m,6),interaction:{prompt:"Which conclusion is correct?",opts:[m.break,m.connect+" is unrelated to this concept.","If one example works, all edge cases work automatically.","A concept should be used whenever its name appears in a problem."],correct:0,ok:"Correct. Knowing the boundary of a concept is part of understanding it.",bad:"Think about the failure condition. Good DSA knowledge includes when not to use a tool.",insight:"Connection: "+m.connect}};
}
function predictPrompt(m){if(m.title.includes("Stack"))return"Push A, B, C; pop; then peek. What should be returned?";if(m.title.includes("Queue"))return"A, B, C enter; A leaves; D enters. Who is next?";if(m.title.includes("Hash"))return"Two keys choose the same bucket. What must happen?";if(m.title.includes("Heap"))return"Insert a new value with better priority than the current root. What must the structure restore?";if(m.title.includes("Binary search"))return"After one valid comparison, how much of the search space can you safely discard?";return"After one operation, what information must remain true for the next operation to be correct?"}
function predictOptions(m,special=false){
 if(m.title.includes("Stack"))return special?["B","A","C","D"]:["The newest active item","The oldest item","A random item","All items"];
 if(m.title.includes("Queue"))return special?["B","C","A","D"]:["The oldest active item","The newest item","A random item","No order"];
 if(m.title.includes("Hash"))return["Resolve the collision while preserving both keys","Delete one key","Rehash every query","Assume it cannot happen"];
 if(m.title.includes("Heap"))return["Repair parent-child order until the heap invariant is restored","Sort the whole structure every time","Ignore the root","Convert it into a queue"];
 if(m.title.includes("Binary search"))return["Half, under the maintained invariant","One element only","Nothing","The entire input"];
 return["The invariant m must preserve","Any unrelated state","Only the last value","No state matters"];
}
function buildPrompt(m){return `Given: ${m.operations}\\n\\nQuestion: what state must be stored so those operations can be correct?\\n\\nInvariant: ${m.invariant}`;}
function buildAnswer(m){return "First define the minimum state needed to preserve: "+m.invariant}
function mountChoice(data){
 $("#lessonInteraction").innerHTML=`<div class="choice-prompt"><strong>${esc(data.prompt)}</strong></div><div class="choice-grid">${data.opts.map((x,i)=>`<button class="choice-btn" data-i="${i}">${esc(x)}</button>`).join("")}</div>`;
 $$(".choice-btn").forEach(b=>b.onclick=()=>{if(session.answered)return;session.answered=true;const ok=+b.dataset.i===data.correct;$$(".choice-btn").forEach(x=>x.disabled=true);b.classList.add(ok?"correct":"wrong");$$(".choice-btn")[data.correct].classList.add("correct");$("#lessonFeedback").className=`feedback ${ok?"correct":"wrong"}`;$("#lessonFeedback").innerHTML=`<strong>${ok?"Correct mental move.":"Not quite."}</strong> ${ok?data.ok:data.bad}`;$("#lessonInsight").classList.remove("hidden");$("#lessonInsight").innerHTML=`<span class="eyebrow">WHY</span><p>${esc(data.insight)}</p>`;$("#continueBtn").disabled=false;});
}
function viz(m,stage){
 const t=m.title;
 if(t.includes("Stack"))return `<div class="visual-stack">${["A","B","C","D"].map((x,i)=>`<div class="stack-item ${i===3?"stack-top":""}">${x}</div>`).join("")}</div>`;
 if(t.includes("Queue"))return `<div class="flow"><div class="flow-box">A</div><span class="arrow">→</span><div class="flow-box">B</div><span class="arrow">→</span><div class="flow-box">C</div><span class="arrow">→</span><div class="flow-box">front</div></div>`;
 if(t.includes("Hash"))return `<div class="visual-array">${["0","1","2","3","4","5","6","7"].map(x=>`<div class="cell">${x}</div>`).join("")}</div>`;
 if(t.includes("Heap"))return `<div class="binary-tree"><div class="tree-level"><span class="tree-node active">9</span></div><div class="tree-level"><span class="tree-node">7</span><span class="tree-node">5</span></div><div class="tree-level"><span class="tree-node">2</span><span class="tree-node">3</span><span class="tree-node">1</span><span class="tree-node">4</span></div></div>`;
 if(t.includes("Tree")||t.includes("BST")||t.includes("Balanced"))return `<div class="binary-tree"><div class="tree-level"><span class="tree-node active">50</span></div><div class="tree-level"><span class="tree-node">30</span><span class="tree-node">70</span></div><div class="tree-level"><span class="tree-node">20</span><span class="tree-node">40</span><span class="tree-node">60</span><span class="tree-node">80</span></div></div>`;
 if(t.includes("Growth")||t.includes("complexity")||m.area==="Foundations")return `<div class="growth-chart">${[20,30,42,60,85,115,145,175].map(h=>`<div style="height:${h/2}px"></div>`).join("")}</div>`;
 if(m.area==="Graphs"||m.area.includes("Structures")&&t.includes("Union"))return `<div class="flow"><div class="flow-box">A</div><span class="arrow">— edge —</span><div class="flow-box">B</div><span class="arrow">— edge —</span><div class="flow-box">C</div></div>`;
 if(t.includes("Linked"))return `<div class="flow"><div class="flow-box">head</div><span class="arrow">→</span><div class="flow-box">node</div><span class="arrow">→</span><div class="flow-box">node</div><span class="arrow">→</span><div class="flow-box">null</div></div>`;
 return `<div class="codeish">${esc(m.invariant)}</div>`;
}
function finishStage(){session.stage++;session.answered=false;if(session.stage>=7){complete();return}renderStage()}
function complete(){state.done[session.m.title]=Date.now();save();$("#lessonView").classList.add("hidden");$("#completeView").classList.remove("hidden");$("#completeTitle").textContent=`${session.m.title} understood enough to move on.`;$("#completeText").textContent="You have worked through the problem, mental model, prediction, construction, teach-back and boundary. The next step is to test it in DSA Forge.";renderHome();$("#completeNext").onclick=()=>{const i=M.indexOf(session.m);start(M[(i+1)%M.length])};}
function home(){$("#lessonView").classList.add("hidden");$("#completeView").classList.add("hidden");$("#homeView").classList.remove("hidden");renderHome()}
$("#themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";save();theme()};
$("#resetBtn").onclick=()=>{if(confirm("Reset Academy progress?")){state={done:{},theme:"dark"};save();theme();renderHome()}};
$("#areaFilter").onchange=renderHome;$("#stateFilter").onchange=renderHome;$("#resumeBtn").onclick=()=>{const m=M.find(x=>!state.done[x.title])||M[0];start(m)};
$("#backBtn").onclick=home;$("#nextModuleBtn").onclick=()=>{const i=M.indexOf(session.m);start(M[(i+1)%M.length])};
$("#continueBtn").onclick=finishStage;$("#completeHome").onclick=home;
theme();renderHome();
})();