import"./supabase-Cnp1ATid.js";import"./security-Bv09CpAF.js";import"./app-wBbXJArf.js";let u=[];async function R(){const e=document.getElementById("login-overlay"),n=document.getElementById("btn-owner-login"),i=document.getElementById("btn-owner-logout"),a=document.getElementById("owner-email"),o=document.getElementById("owner-password"),t=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)e.style.display="none",D();else{const r=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");r&&(r.style.display="none"),l&&(l.style.display="block")}async function s(){const r=a.value.trim(),l=o.value,d=window.checkLoginRateLimit();if(d.blocked){t.style.display="block",t.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!r||!l){t.style.display="block",t.innerText="Completați email-ul și parola.";return}if(n.disabled=!0,n.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(r,l)).success)window.resetLoginAttempts(),t.style.display="none",e.style.display="none",D();else{const m=window.recordFailedLogin();t.style.display="block",m.blocked?t.innerText="Cont blocat temporar. Așteptați 5 minute.":t.innerText=`Email sau parolă incorectă. Mai aveți ${m.attemptsLeft} încercări.`}n.disabled=!1,n.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}n&&n.addEventListener("click",s),o&&o.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),a&&a.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),i&&i.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function D(){if(!window.supabaseClient)return;const{authenticated:e}=await window.getAuthSession();if(!e){document.getElementById("login-overlay").style.display="flex";const a=document.getElementById("auth-loading"),o=document.getElementById("login-form-content");a&&(a.style.display="none"),o&&(o.style.display="block");return}const{data:n,error:i}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(i){console.error("Eroare:",i);return}u=n||[],u.forEach(a=>z(a)),renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},a=>{if(a.eventType==="INSERT")u.findIndex(t=>t.id===a.new.id)===-1&&u.unshift(a.new),z(a.new);else if(a.eventType==="UPDATE"){const o=u.findIndex(t=>t.id===a.new.id);o>-1?u[o]=a.new:u.unshift(a.new),z(a.new)}else a.eventType==="DELETE"&&(u=u.filter(o=>o.id!==a.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:a}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});a&&(u=a,u.forEach(o=>z(o)),renderOwnerOrders())}},5e3))}const M=new Set;async function z(e){if(!e||e.status!=="noua")return;const n=Array.isArray(e.detalii_comanda)?e.detalii_comanda.length:0,i=`${e.id}_${e.total}_${n}`;M.has(i)||(M.add(i),console.log("🖨️ Auto-print declanșat automat pentru comanda #",e.id,"Masa:",e.numar_masa),await P(e))}window.renderOwnerOrders=function(){const e=document.getElementById("comenzi-container");if(!e)return;e.innerHTML="";const n=new Date;n.setHours(0,0,0,0);let i=0;if(u.length===0){e.innerHTML="<p>Nicio comandă înregistrată.</p>";return}u.forEach(t=>{if(t.status!=="finalizata"&&(i+=parseFloat(t.total)||0),t.status==="finalizata")return;const c=document.createElement("div");c.className="modern-card",t.status,t.status;let s=H(t.detalii_comanda);const r=new Date(t.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=new Date(t.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let d=t.status.toUpperCase(),f="#f39c12";t.status==="noua"?(d="NOUĂ",f="#f39c12"):t.status==="in_preparare"?(d="ÎN PREPARARE",f="#2ecc71"):t.status==="servita"&&(d="SERVITĂ",f="#95a5a6");let m="";t.status==="noua"?m=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:t.status==="in_preparare"?m=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:t.status==="servita"&&(m=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(t.numar_masa))}</button>`),c.innerHTML=`
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${escapeHTML(String(t.numar_masa))}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(t.total))} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${parseInt(t.id)}</h3>
                </div>
                <div class="modern-card-desc">
                    ${s}
                </div>
                <div class="modern-card-tags">
                    <span class="modern-tag">Ora ${escapeHTML(l)}</span>
                    <span class="modern-tag">${escapeHTML(r)}</span>
                    <span class="modern-tag" style="background: ${f}; color: white;">${escapeHTML(d)}</span>
                </div>
            </div>
            ${m}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(t.id)})"><i class="fas fa-print"></i> Printează Bon</button>
        `,e.appendChild(c)});const a=u.filter(t=>new Date(t.created_at)>=n&&t.status!=="finalizata");if(a.length>0||i>0){const t=document.createElement("div");t.style.gridColumn="1 / -1",t.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${i.toFixed(2)} Lei</h2>`,e.insertBefore(t,e.firstChild)}const o=document.getElementById("btn-incheiere-zi");o&&(o.style.display=a.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const e=document.getElementById("history-content");if(!e)return;const n=new Date;n.setDate(n.getDate()-7);const i=u.filter(t=>new Date(t.created_at)>=n);let a="",o="";if(i.length===0)a='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const t={};i.forEach(c=>{const s=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});t[s]=(t[s]||0)+(parseFloat(c.total)||0)}),i.forEach(c=>{const s=new Date(c.created_at),r=s.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=s.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==o){const m=t[d]?t[d].toFixed(2):"0.00";a+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${m} Lei</h3>
                         </div>`,o=d}let f=H(c.detalii_comanda);a+=`
                <div class="modern-card history-card">
                    <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                        <div class="modern-card-tab">Masa ${escapeHTML(String(c.numar_masa))}</div>
                        <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(c.total))} Lei</span>
                    </div>
                    <div class="modern-card-body">
                        <div class="modern-card-title-row">
                            <h3>Comanda #${parseInt(c.id)}</h3>
                        </div>
                        <div class="modern-card-desc">
                            ${f}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${escapeHTML(l)}</span>
                            <span class="modern-tag">${escapeHTML(r)}</span>
                        </div>
                    </div>
                </div>
            `})}e.innerHTML=a};window.showEndDayModal=function(){const e=document.getElementById("end-day-modal"),n=document.getElementById("end-day-summary"),i=new Date;i.setHours(0,0,0,0);const a=u.filter(r=>new Date(r.created_at)>=i),o=a.filter(r=>r.status==="noua"||r.status==="in_preparare"),t=a.filter(r=>r.status==="servita"),c=a.reduce((r,l)=>r+(parseFloat(l.total)||0),0),s=a.length;n.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${s}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${t.length}</strong></p>
        ${o.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${o.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,e.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:e}=await window.getAuthSession();if(!e){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const n=new Date;n.setDate(n.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",n.toISOString())}catch(s){console.error("Eroare la curățarea istoricului vechi:",s)}const i=new Date;i.setHours(0,0,0,0);const a=u.filter(s=>new Date(s.created_at)>=i&&s.status!=="finalizata");if(a.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let o=0;for(const s of a){const{error:r}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",s.id);r&&(console.error("Eroare la finalizare comanda #"+s.id,r),o++)}window.closeEndDayModal();const t=document.getElementById("cb-force-close");let c=!1;if(t&&t.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(s){console.error("Nu s-a putut forța închiderea:",s)}if(o===0){const s=u.filter(l=>new Date(l.created_at)>=i).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let r=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${s.toFixed(2)} Lei
Comenzi finalizate: ${a.length}

Toate comenzile au fost mutate în Istoric.${r}`)}else alert(`Ziua a fost închisă, dar ${o} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=e=>{const n=document.getElementById("receptie-panel"),i=document.getElementById("istoric-panel");e?(n.style.display="none",i.style.display="block"):(n.style.display="block",i.style.display="none")};let x;const y=document.getElementById("install-app-btn");function B(){const e=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;y&&(e?y.style.display="none":y.style.display="inline-flex")}B();window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),x=e,B()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),y&&(y.style.display="none")});y&&y.addEventListener("click",async()=>{if(x){x.prompt();const{outcome:e}=await x.userChoice;console.log(`PWA install choice: ${e}`),e==="accepted"&&(y.style.display="none"),x=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function H(e){if(!e||!Array.isArray(e)||e.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const n={};e.forEach(t=>{const c=t.customer_name&&t.customer_name.trim()!==""?t.customer_name:"Masa";n[c]||(n[c]=[]),n[c].push(t)});let i="";const a=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let o=0;for(const[t,c]of Object.entries(n)){let s=0;const r=c.map(m=>{const $=parseFloat(m.product.pret||0),p=parseInt(m.quantity||1),g=$*p;s+=g;const b=m.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(m.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${p}x</b> ${escapeHTML(m.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${g.toFixed(2)} Lei</span>
            </div>${b}`}).join(""),l=a[o%a.length];o++;const f=t==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(t)}`;i+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${l}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${l};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${l}; font-weight: 800; font-size: 0.95rem;">
                        ${f}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${s.toFixed(2)} Lei
                    </span>
                </div>
                ${r}
            </div>
        `}return i}async function P(e){if(!e)return;const n=e.detalii_comanda||[],i=String(e.numar_masa||"?"),a=parseFloat(e.total||0).toFixed(2),o=new Date(e.created_at),t=o.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),s=n.some(p=>p.is_new===!0),r=s,l=s?n.filter(p=>p.is_new===!0):n,d={};l.forEach(p=>{const g=p.customer_name&&p.customer_name.trim()!==""?p.customer_name:"Masa";d[g]||(d[g]=[]),d[g].push(p)});let f="";for(const[p,g]of Object.entries(d)){const b=p==="Masa"?"👥 Împreună":`👤 ${p}`;let S=0;f+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${b}</b>
        </div>`,g.forEach(h=>{var k,C;const I=parseInt(h.quantity||1),Z=parseFloat(((k=h.product)==null?void 0:k.pret)||0),O=I*Z;S+=O;const q=h.notes?`<br><small><i>* ${h.notes}</i></small>`:"";f+=`<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${I}x ${((C=h.product)==null?void 0:C.nume)||"Produs"}</span>
                <span>${O.toFixed(2)}</span>
            </div>${q}`}),f+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${S.toFixed(2)} Lei</div>`}const m=`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Bon Bella Roma</title>
        <style>
            @page {
                size: 80mm auto;
                margin: 0;
            }
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Courier New', monospace;
                width: 80mm;
                padding: 5mm;
                font-size: 12px;
                color: #000;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 6px;
                margin-bottom: 6px;
            }
            .header h1 {
                font-size: 18px;
                letter-spacing: 2px;
                margin-bottom: 2px;
            }
            .header p {
                font-size: 10px;
            }
            .info {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                font-weight: bold;
                padding: 4px 0;
                border-bottom: 1px dashed #000;
            }
            .total-section {
                border-top: 2px solid #000;
                margin-top: 8px;
                padding-top: 6px;
                text-align: center;
            }
            .total-section .total {
                font-size: 18px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 10px;
                padding-top: 6px;
                border-top: 1px dashed #000;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>BELLA ROMA</h1>
            <p>PUB & PIZZERIE</p>
            ${r?'<p style="font-size: 14px; font-weight: bold; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">*** BON SUPLIMENTAR ***</p>':""}
        </div>

        <div class="info">
            <span>Masa: ${i}</span>
            <span>#${parseInt(e.id)}</span>
        </div>
        <div class="info" style="border-bottom: none; font-weight: normal;">
            <span>${t}</span>
            <span>${c}</span>
        </div>

        <div style="margin-top: 4px;">
            ${f}
        </div>

        <div class="total-section">
            <div class="total">TOTAL: ${a} Lei</div>
        </div>

        <div class="footer">
            <p>Vă mulțumim!</p>
            <p>www.bella-roma.ro</p>
        </div>
    </body>
    </html>`;if(await E()&&typeof qz<"u"&&qz.websocket.isActive())try{const p=w||await qz.printers.getDefault(),g=qz.configs.create(p),b=[{type:"pixel",format:"html",flavor:"plain",data:m}];await qz.print(g,b),console.log("✅ Bon printat 100% silențios via QZ Tray pe:",p);return}catch(p){console.warn("❌ Eroare trimitere job QZ Tray:",p)}else console.warn("⚠️ QZ Tray nu este conectat — bonul NU a fost printat. Pornește QZ Tray pe laptop!")}let w=null,A=!1,v=!1;function Q(){A||typeof qz>"u"||(A=!0,qz.security.setCertificatePromise(function(e,n){e()}),qz.security.setSignaturePromise(function(e){return function(n,i){n()}}),qz.websocket.setClosedCallbacks(function(e){console.warn("⚠️ QZ Tray: Conexiune pierdută. Se reconectează în 3 secunde...",e),T("Reconectare...","#f5b041"),setTimeout(L,3e3)}),console.log("✅ QZ Tray: Securitate configurată (mod unsigned)"))}async function L(){if(typeof qz>"u")return!1;if(qz.websocket.isActive())return await _(),T(`Conectat (${w||"Implicită"})`,"#2ecc71"),!0;if(v)return!1;v=!0;try{return Q(),await qz.websocket.connect({retries:3,delay:1}),console.log("✅ QZ Tray: WebSocket conectat cu succes!"),await _(),T(`Conectat (${w||"Implicită"})`,"#2ecc71"),v=!1,!0}catch(e){return console.warn("❌ QZ Tray: Nu s-a putut conecta (aplicația QZ Tray pornită pe laptop?):",e.message||e),T("Deconectat","#f5b041"),v=!1,!1}}async function _(){if(qz.websocket.isActive())try{const e=await qz.printers.find();console.log("🖨️ QZ Tray: Imprimante detectate:",e),w=e.find(i=>i&&(i.toLowerCase().includes("samsung")||i.toLowerCase().includes("m2020")||i.toLowerCase().includes("m2026")))||await qz.printers.getDefault(),console.log("🖨️ QZ Tray: Imprimantă selectată:",w)}catch(e){console.warn("QZ Tray: Nu s-au putut detecta imprimantele:",e)}}async function E(){return typeof qz>"u"?(T("Lipsă SDK QZ","#e74c3c"),!1):await L()}function T(e,n){const i=document.getElementById("qz-status-badge");if(i){const a=n==="#2ecc71"?"46, 204, 113":n==="#e74c3c"?"231, 76, 60":"245, 176, 65";i.style.background=`rgba(${a}, 0.2)`,i.style.color=n,i.style.borderColor=n,i.innerHTML=`<i class="fas fa-print"></i> QZ Tray: ${e}`}}window.testQZPrint=async function(){if(await E()&&qz.websocket.isActive())try{const n=w||await qz.printers.getDefault(),i=qz.configs.create(n),o=[{type:"pixel",format:"html",flavor:"plain",data:`
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${n}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `}];await qz.print(i,o),alert(`✅ Test trimis cu succes pe imprimanta: ${n}!
Bonul a fost printat SILENȚIOS fără fereastră de dialog!`)}catch(n){alert("❌ Eroare la printare prin QZ Tray: "+(n.message||n))}else alert(`❌ QZ Tray nu este pornit pe laptop.

1. Deschide aplicația QZ Tray pe Windows
2. Verifică iconița verde lângă ceas
3. Apasă din nou Test`)};window.printOrderReceipt=function(e){const n=u.find(i=>i.id===e);n&&(P(n),n.status==="noua"&&window.updateOrderStatus(e,"in_preparare"))};R();setTimeout(E,1e3);setInterval(async()=>{typeof qz<"u"&&!qz.websocket.isActive()&&!v&&(console.log("🔄 QZ Tray: Keep-alive reconectare..."),await L())},1e4);
