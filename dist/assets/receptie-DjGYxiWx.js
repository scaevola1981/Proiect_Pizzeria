import"./supabase-Cnp1ATid.js";import"./security-Bv09CpAF.js";import"./app-wBbXJArf.js";let m=[];async function H(){const e=document.getElementById("login-overlay"),n=document.getElementById("btn-owner-login"),a=document.getElementById("btn-owner-logout"),i=document.getElementById("owner-email"),o=document.getElementById("owner-password"),t=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)e.style.display="none",k();else{const r=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");r&&(r.style.display="none"),l&&(l.style.display="block")}async function s(){const r=i.value.trim(),l=o.value,d=window.checkLoginRateLimit();if(d.blocked){t.style.display="block",t.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!r||!l){t.style.display="block",t.innerText="Completați email-ul și parola.";return}if(n.disabled=!0,n.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(r,l)).success)window.resetLoginAttempts(),t.style.display="none",e.style.display="none",k();else{const u=window.recordFailedLogin();t.style.display="block",u.blocked?t.innerText="Cont blocat temporar. Așteptați 5 minute.":t.innerText=`Email sau parolă incorectă. Mai aveți ${u.attemptsLeft} încercări.`}n.disabled=!1,n.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}n&&n.addEventListener("click",s),o&&o.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),i&&i.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),a&&a.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function k(){if(!window.supabaseClient)return;const{authenticated:e}=await window.getAuthSession();if(!e){document.getElementById("login-overlay").style.display="flex";const i=document.getElementById("auth-loading"),o=document.getElementById("login-form-content");i&&(i.style.display="none"),o&&(o.style.display="block");return}const{data:n,error:a}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(a){console.error("Eroare:",a);return}m=n||[],m.forEach(i=>z(i)),renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},i=>{if(i.eventType==="INSERT")m.findIndex(t=>t.id===i.new.id)===-1&&m.unshift(i.new),z(i.new);else if(i.eventType==="UPDATE"){const o=m.findIndex(t=>t.id===i.new.id);o>-1?m[o]=i.new:m.unshift(i.new),z(i.new)}else i.eventType==="DELETE"&&(m=m.filter(o=>o.id!==i.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:i}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});i&&(m=i,m.forEach(o=>z(o)),renderOwnerOrders())}},5e3))}const D=new Set;function z(e){if(!e||e.status!=="noua")return;const n=Array.isArray(e.detalii_comanda)?e.detalii_comanda.length:0,a=`${e.id}_${e.total}_${n}`;D.has(a)||(D.add(a),console.log("🖨️ Auto-print declanșat automat pentru comanda #",e.id,"Masa:",e.numar_masa),_(e))}window.renderOwnerOrders=function(){const e=document.getElementById("comenzi-container");if(!e)return;e.innerHTML="";const n=new Date;n.setHours(0,0,0,0);let a=0;if(m.length===0){e.innerHTML="<p>Nicio comandă înregistrată.</p>";return}m.forEach(t=>{if(t.status!=="finalizata"&&(a+=parseFloat(t.total)||0),t.status==="finalizata")return;const c=document.createElement("div");c.className="modern-card",t.status,t.status;let s=A(t.detalii_comanda);const r=new Date(t.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=new Date(t.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let d=t.status.toUpperCase(),f="#f39c12";t.status==="noua"?(d="NOUĂ",f="#f39c12"):t.status==="in_preparare"?(d="ÎN PREPARARE",f="#2ecc71"):t.status==="servita"&&(d="SERVITĂ",f="#95a5a6");let u="";t.status==="noua"?u=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:t.status==="in_preparare"?u=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:t.status==="servita"&&(u=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(t.numar_masa))}</button>`),c.innerHTML=`
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
            ${u}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(t.id)})"><i class="fas fa-print"></i> Printează Bon</button>
        `,e.appendChild(c)});const i=m.filter(t=>new Date(t.created_at)>=n&&t.status!=="finalizata");if(i.length>0||a>0){const t=document.createElement("div");t.style.gridColumn="1 / -1",t.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${a.toFixed(2)} Lei</h2>`,e.insertBefore(t,e.firstChild)}const o=document.getElementById("btn-incheiere-zi");o&&(o.style.display=i.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const e=document.getElementById("history-content");if(!e)return;const n=new Date;n.setDate(n.getDate()-7);const a=m.filter(t=>new Date(t.created_at)>=n);let i="",o="";if(a.length===0)i='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const t={};a.forEach(c=>{const s=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});t[s]=(t[s]||0)+(parseFloat(c.total)||0)}),a.forEach(c=>{const s=new Date(c.created_at),r=s.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=s.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==o){const u=t[d]?t[d].toFixed(2):"0.00";i+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${u} Lei</h3>
                         </div>`,o=d}let f=A(c.detalii_comanda);i+=`
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
            `})}e.innerHTML=i};window.showEndDayModal=function(){const e=document.getElementById("end-day-modal"),n=document.getElementById("end-day-summary"),a=new Date;a.setHours(0,0,0,0);const i=m.filter(r=>new Date(r.created_at)>=a),o=i.filter(r=>r.status==="noua"||r.status==="in_preparare"),t=i.filter(r=>r.status==="servita"),c=i.reduce((r,l)=>r+(parseFloat(l.total)||0),0),s=i.length;n.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${s}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${t.length}</strong></p>
        ${o.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${o.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,e.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:e}=await window.getAuthSession();if(!e){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const n=new Date;n.setDate(n.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",n.toISOString())}catch(s){console.error("Eroare la curățarea istoricului vechi:",s)}const a=new Date;a.setHours(0,0,0,0);const i=m.filter(s=>new Date(s.created_at)>=a&&s.status!=="finalizata");if(i.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let o=0;for(const s of i){const{error:r}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",s.id);r&&(console.error("Eroare la finalizare comanda #"+s.id,r),o++)}window.closeEndDayModal();const t=document.getElementById("cb-force-close");let c=!1;if(t&&t.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(s){console.error("Nu s-a putut forța închiderea:",s)}if(o===0){const s=m.filter(l=>new Date(l.created_at)>=a).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let r=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${s.toFixed(2)} Lei
Comenzi finalizate: ${i.length}

Toate comenzile au fost mutate în Istoric.${r}`)}else alert(`Ziua a fost închisă, dar ${o} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=e=>{const n=document.getElementById("receptie-panel"),a=document.getElementById("istoric-panel");e?(n.style.display="none",a.style.display="block"):(n.style.display="block",a.style.display="none")};let v;const y=document.getElementById("install-app-btn");function M(){const e=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;y&&(e?y.style.display="none":y.style.display="inline-flex")}M();window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),v=e,M()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),y&&(y.style.display="none")});y&&y.addEventListener("click",async()=>{if(v){v.prompt();const{outcome:e}=await v.userChoice;console.log(`PWA install choice: ${e}`),e==="accepted"&&(y.style.display="none"),v=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function A(e){if(!e||!Array.isArray(e)||e.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const n={};e.forEach(t=>{const c=t.customer_name&&t.customer_name.trim()!==""?t.customer_name:"Masa";n[c]||(n[c]=[]),n[c].push(t)});let a="";const i=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let o=0;for(const[t,c]of Object.entries(n)){let s=0;const r=c.map(u=>{const L=parseFloat(u.product.pret||0),p=parseInt(u.quantity||1),g=L*p;s+=g;const b=u.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(u.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${p}x</b> ${escapeHTML(u.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${g.toFixed(2)} Lei</span>
            </div>${b}`}).join(""),l=i[o%i.length];o++;const f=t==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(t)}`;a+=`
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
        `}return a}async function _(e){if(!e)return;const n=e.detalii_comanda||[],a=String(e.numar_masa||"?"),i=parseFloat(e.total||0).toFixed(2),o=new Date(e.created_at),t=o.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),s=n.some(p=>p.is_new===!0),r=s,l=s?n.filter(p=>p.is_new===!0):n,d={};l.forEach(p=>{const g=p.customer_name&&p.customer_name.trim()!==""?p.customer_name:"Masa";d[g]||(d[g]=[]),d[g].push(p)});let f="";for(const[p,g]of Object.entries(d)){const b=p==="Masa"?"👥 Împreună":`👤 ${p}`;let $=0;f+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${b}</b>
        </div>`,g.forEach(h=>{var O,C;const I=parseInt(h.quantity||1),B=parseFloat(((O=h.product)==null?void 0:O.pret)||0),S=I*B;$+=S;const P=h.notes?`<br><small><i>* ${h.notes}</i></small>`:"";f+=`<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${I}x ${((C=h.product)==null?void 0:C.nume)||"Produs"}</span>
                <span>${S.toFixed(2)}</span>
            </div>${P}`}),f+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${$.toFixed(2)} Lei</div>`}const u=`
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
            <span>Masa: ${a}</span>
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
            <div class="total">TOTAL: ${i} Lei</div>
        </div>

        <div class="footer">
            <p>Vă mulțumim!</p>
            <p>www.bella-roma.ro</p>
        </div>
    </body>
    </html>`;if(await T()&&typeof qz<"u"&&qz.websocket.isActive())try{const p=w||await qz.printers.getDefault(),g=qz.print.createConfig(p),b=[{type:"pixel",format:"html",flavor:"plain",data:u}];await qz.print(g,b),console.log("✅ Bon printat 100% silențios via QZ Tray pe:",p);return}catch(p){console.warn("Eroare trimitere job QZ Tray, fallback la browser:",p)}R(u)}function R(e){let n=document.getElementById("receipt-print-frame");n||(n=document.createElement("iframe"),n.id="receipt-print-frame",n.style.cssText="position: fixed; top: -10000px; left: -10000px; width: 80mm; height: 0; border: none; visibility: hidden;",document.body.appendChild(n));const a=n.contentDocument||n.contentWindow.document;a.open(),a.write(e),a.close(),n.onload=()=>{try{n.contentWindow.focus(),n.contentWindow.print()}catch(i){console.warn("Printare automată blocată, se deschide fereastra manuală:",i);const o=window.open("","_blank","width=320,height=600");o&&(o.document.write(e),o.document.close(),o.onload=()=>{o.print(),o.onafterprint=()=>o.close()})}}}let w=null,E=!1;async function T(){if(typeof qz>"u")return x("Lipsă SDK QZ","#e74c3c"),!1;if(qz.websocket.isActive())return x(`Conectat (${w||"Implicită"})`,"#2ecc71"),!0;if(E)return!1;E=!0;try{qz.security.setCertificatePromise(e=>e()),qz.security.setSignaturePromise(()=>e=>e()),qz.websocket.isActive()||await qz.websocket.connect({retries:5,delay:1});try{const e=await qz.printers.find();console.log("🖨️ Imprimante detectate de QZ Tray:",e);const n=e.find(a=>a&&(a.toLowerCase().includes("samsung")||a.toLowerCase().includes("m2020")||a.toLowerCase().includes("m2026")));n?w=n:w=await qz.printers.getDefault(),x(`Conectat (${w||"Implicită"})`,"#2ecc71")}catch{x("Conectat QZ","#2ecc71")}return E=!1,!0}catch(e){return console.warn("QZ Tray nu este pornit pe laptop:",e),x("Deconectat (Offline)","#f5b041"),E=!1,!1}}function x(e,n){const a=document.getElementById("qz-status-badge");a&&(a.style.background=`rgba(${n==="#2ecc71"?"46, 204, 113":"245, 176, 65"}, 0.2)`,a.style.color=n,a.style.borderColor=n,a.innerHTML=`<i class="fas fa-print"></i> QZ Tray: ${e}`)}window.testQZPrint=async function(){if(await T()&&typeof qz<"u"&&qz.websocket.isActive())try{const n=w||await qz.printers.getDefault(),a=qz.print.createConfig(n),o=[{type:"pixel",format:"html",flavor:"plain",data:`
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${n}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `}];await qz.print(a,o),alert(`✅ Test trimis cu succes pe imprimanta: ${n}!`)}catch(n){alert("Eroare la printare prin QZ Tray: "+n.message)}else alert("QZ Tray nu este pornit pe laptop. Deschide aplicația QZ Tray pe Windows!")};window.printOrderReceipt=function(e){const n=m.find(a=>a.id===e);n&&(_(n),n.status==="noua"&&window.updateOrderStatus(e,"in_preparare"))};H();setTimeout(T,500);setInterval(T,8e3);
