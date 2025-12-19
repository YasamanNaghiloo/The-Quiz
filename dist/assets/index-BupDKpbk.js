(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function n(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(e){if(e.ep)return;e.ep=!0;const s=n(e);fetch(e.href,s)}})();const k="modulepreload",x=function(o){return"/"+o},p={},L=function(t,n,r){let e=Promise.resolve();if(n&&n.length>0){let u=function(l){return Promise.all(l.map(m=>Promise.resolve(m).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};var c=u;document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),i=a?.nonce||a?.getAttribute("nonce");e=u(n.map(l=>{if(l=x(l),l in p)return;p[l]=!0;const m=l.endsWith(".css"),f=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${f}`))return;const d=document.createElement("link");if(d.rel=m?"stylesheet":k,m||(d.as="script"),d.crossOrigin="",d.href=l,i&&d.setAttribute("nonce",i),document.head.appendChild(d),m)return new Promise((w,E)=>{d.addEventListener("load",w),d.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${l}`)))})}))}function s(a){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=a,window.dispatchEvent(i),!i.defaultPrevented)throw a}return e.then(a=>{for(const i of a||[])i.status==="rejected"&&s(i.reason);return t().catch(s)})};async function S(o){const t=await fetch(o);if(!t.ok)throw new Error("Failed to fetch question");return t.json()}async function I(o,t){const n=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer:t})});if(!n.ok)throw new Error("Wrong answer");return n.json()}class T{constructor(t,n){this.seconds=t,this.onTimeout=n,this.interval=null}start(t){let n=this.seconds;t(n),this.interval=setInterval(()=>{n--,t(n),n<=0&&(this.stop(),this.onTimeout())},1e3)}stop(){clearInterval(this.interval)}}const b="quiz-scores";function q(o,t){const n=y();n.push({name:o,time:t}),n.sort((r,e)=>r.time-e.time),localStorage.setItem(b,JSON.stringify(n.slice(0,5)))}function y(){return JSON.parse(localStorage.getItem(b))||[]}class A{constructor(t){this.root=t,this.startTime=null,this.timer=null,this.currentFocusIndex=0}start(t){this.nickname=t,this.startTime=Date.now(),this.loadQuestion("https://courselab.lnu.se/quiz/question/1")}async loadQuestion(t){try{const n=await S(t);this.renderQuestion(n)}catch{this.gameOver("Could not load question")}}renderQuestion(t){this.currentFocusIndex=0,this.root.innerHTML=`
      <h2 tabindex="0">${t.question}</h2>
      <form id="answer-form" aria-label="Question form"></form>
      <p>⏱️ Time left: <span id="timer">10</span>s</p>
    `;const n=document.getElementById("answer-form");if(t.alternatives){let r="";Object.entries(t.alternatives).forEach(([c,a],i)=>{r+=`
          <div class="radio-option">
            <input
              type="radio"
              id="option-${i}"
              name="answer"
              value="${c}"
              ${i===0?"checked":""}
              tabindex="${i===0?"0":"-1"}"
            >
            <label for="option-${i}">${a}</label>
          </div>
        `}),n.innerHTML=`
        ${r}
        <button type="submit" class="submit-btn" tabindex="0">➡️ Answer</button>
      `;const e=n.querySelectorAll('input[type="radio"]'),s=n.querySelector(".submit-btn");requestAnimationFrame(()=>e[0].focus()),e.forEach((c,a)=>{c.addEventListener("keydown",i=>{switch(i.key){case"ArrowDown":{i.preventDefault();const u=(a+1)%e.length;e[u].focus(),e[u].checked=!0,this.currentFocusIndex=u;break}case"ArrowUp":{i.preventDefault();const u=(a-1+e.length)%e.length;e[u].focus(),e[u].checked=!0,this.currentFocusIndex=u;break}case" ":{i.preventDefault(),c.checked=!0;break}case"Enter":{i.preventDefault(),n.requestSubmit();break}}})}),s.addEventListener("keydown",c=>{c.key==="Enter"&&(c.preventDefault(),n.requestSubmit())})}else{n.innerHTML=`
        <input
          type="text"
          name="answer"
          class="text-answer"
          placeholder="✏️ Your answer"
          required
          autocomplete="off"
          tabindex="0"
        >
        <button type="submit" class="submit-btn" tabindex="0">➡️ Answer</button>
      `;const r=n.querySelector(".text-answer"),e=n.querySelector(".submit-btn");requestAnimationFrame(()=>{r.focus(),r.select()}),r.addEventListener("keydown",s=>{s.key==="Enter"&&r.value.trim()&&(s.preventDefault(),n.requestSubmit())}),e.addEventListener("keydown",s=>{s.key==="Enter"&&(s.preventDefault(),n.requestSubmit())})}this.timer=new T(10,()=>this.gameOver("Time is up!")),this.timer.start(r=>{const e=document.getElementById("timer");e&&(e.textContent=r,r<=3&&(e.style.color="red",e.style.fontWeight="bold"))}),n.onsubmit=r=>{r.preventDefault(),this.timer.stop();const e=new FormData(n).get("answer");this.submitAnswer(t.nextURL,e)}}async submitAnswer(t,n){try{const r=await I(t,n);r.nextURL?this.loadQuestion(r.nextURL):this.victory()}catch{this.gameOver("Wrong answer!")}}victory(){const t=(Date.now()-this.startTime)/1e3;q(this.nickname,t),this.root.innerHTML=`
      <h2 tabindex="0">🎉 Victory!</h2>
      <p tabindex="0">🏁 Time: ${t.toFixed(2)}s</p>
      <button id="restart" tabindex="0">🔄 Restart</button>
      <button id="highscore" tabindex="0">🏆 High Scores</button>
    `,this.addGameEndHandlers()}gameOver(t){this.root.innerHTML=`
      <h2 tabindex="0">❌ ${t}</h2>
      <button id="restart" tabindex="0">🔄 Restart</button>
      <button id="highscore" tabindex="0">🏆 High Scores</button>
    `,this.addGameEndHandlers()}addGameEndHandlers(){const t=document.getElementById("restart"),n=document.getElementById("highscore");t.focus(),t.onclick=()=>location.reload(),n.onclick=()=>L(()=>Promise.resolve().then(()=>H),void 0).then(r=>r.showHighScores())}}const h=document.getElementById("app");function g(){const o=y();let t='<h2 tabindex="0">🏆 High Scores</h2>';o.length===0?t+='<p tabindex="0">No high scores yet.</p>':(t+="<ol>",o.forEach(r=>{t+=`<li>🎯 ${r.name} - ${r.time.toFixed(2)}s</li>`}),t+="</ol>"),t+='<button id="back" tabindex="0">⬅️ Back</button>',h.innerHTML=t;const n=document.getElementById("back");n&&(n.focus(),n.addEventListener("keydown",r=>{r.key==="Enter"&&(r.preventDefault(),n.click())}),n.onclick=()=>v())}function D(o){o.forEach((t,n)=>{t.addEventListener("keydown",r=>{if(r.key==="ArrowRight"||r.key==="ArrowDown"){r.preventDefault();const e=(n+1)%o.length;o[e].focus()}else if(r.key==="ArrowLeft"||r.key==="ArrowUp"){r.preventDefault();const e=(n-1+o.length)%o.length;o[e].focus()}})})}function v(){h.innerHTML=`
    <h1 tabindex="0">🧠 Quiz Game</h1>
    <input 
      id="nickname" 
      placeholder="📝 Your nickname" 
      tabindex="0" 
      autocomplete="off"
    />
    <div class="button-group">
      <button id="start" tabindex="0">▶️ Start</button>
      <button id="highscore" tabindex="0">🏆 High Scores</button>
    </div>
  `;const o=document.getElementById("nickname"),t=document.getElementById("start"),n=document.getElementById("highscore");requestAnimationFrame(()=>{o.focus()}),o.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),o.value.trim()&&t.click())}),D([o,t,n]),t.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),t.click())}),n.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),n.click())}),t.onclick=()=>{const e=o.value.trim();if(!e){alert("Please enter a nickname"),o.focus();return}new A(h).start(e)},n.onclick=()=>g()}v();const H=Object.freeze(Object.defineProperty({__proto__:null,showHighScores:g},Symbol.toStringTag,{value:"Module"}));
