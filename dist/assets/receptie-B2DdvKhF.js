import"./supabase-Cnp1ATid.js";import"./security-Bv09CpAF.js";import"./app-wBbXJArf.js";let u=[];async function _(){const n=document.getElementById("login-overlay"),t=document.getElementById("btn-owner-login"),i=document.getElementById("btn-owner-logout"),a=document.getElementById("owner-email"),o=document.getElementById("owner-password"),e=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)n.style.display="none",S();else{const r=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");r&&(r.style.display="none"),l&&(l.style.display="block")}async function s(){const r=a.value.trim(),l=o.value,d=window.checkLoginRateLimit();if(d.blocked){e.style.display="block",e.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!r||!l){e.style.display="block",e.innerText="Completați email-ul și parola.";return}if(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(r,l)).success)window.resetLoginAttempts(),e.style.display="none",n.style.display="none",S();else{const p=window.recordFailedLogin();e.style.display="block",p.blocked?e.innerText="Cont blocat temporar. Așteptați 5 minute.":e.innerText=`Email sau parolă incorectă. Mai aveți ${p.attemptsLeft} încercări.`}t.disabled=!1,t.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}t&&t.addEventListener("click",s),o&&o.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),a&&a.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),i&&i.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function S(){if(!window.supabaseClient)return;const{authenticated:n}=await window.getAuthSession();if(!n){document.getElementById("login-overlay").style.display="flex";const a=document.getElementById("auth-loading"),o=document.getElementById("login-form-content");a&&(a.style.display="none"),o&&(o.style.display="block");return}const{data:t,error:i}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(i){console.error("Eroare:",i);return}u=t||[],renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},a=>{if(a.eventType==="INSERT")u.findIndex(e=>e.id===a.new.id)===-1&&(u.unshift(a.new),z(a.new));else if(a.eventType==="UPDATE"){const o=u.findIndex(e=>e.id===a.new.id);if(o>-1){const e=u[o];u[o]=a.new,e.status!=="noua"&&a.new.status==="noua"&&z(a.new)}else u.unshift(a.new),a.new.status==="noua"&&z(a.new)}else a.eventType==="DELETE"&&(u=u.filter(o=>o.id!==a.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:a}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});a&&(u=a,renderOwnerOrders())}},5e3))}window.renderOwnerOrders=function(){const n=document.getElementById("comenzi-container");if(!n)return;n.innerHTML="";const t=new Date;t.setHours(0,0,0,0);let i=0;if(u.length===0){n.innerHTML="<p>Nicio comandă înregistrată.</p>";return}u.forEach(e=>{if(e.status!=="finalizata"&&(i+=parseFloat(e.total)||0),e.status==="finalizata")return;const c=document.createElement("div");c.className="modern-card",e.status,e.status;let s=D(e.detalii_comanda);const r=new Date(e.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=new Date(e.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let d=e.status.toUpperCase(),f="#f39c12";e.status==="noua"?(d="NOUĂ",f="#f39c12"):e.status==="in_preparare"?(d="ÎN PREPARARE",f="#2ecc71"):e.status==="servita"&&(d="SERVITĂ",f="#95a5a6");let p="";e.status==="noua"?p=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:e.status==="in_preparare"?p=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:e.status==="servita"&&(p=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(e.numar_masa))}</button>`),c.innerHTML=`
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${escapeHTML(String(e.numar_masa))}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(e.total))} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${parseInt(e.id)}</h3>
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
            ${p}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(e.id)})"><i class="fas fa-print"></i> Printează Bon</button>
        `,n.appendChild(c)});const a=u.filter(e=>new Date(e.created_at)>=t&&e.status!=="finalizata");if(a.length>0||i>0){const e=document.createElement("div");e.style.gridColumn="1 / -1",e.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${i.toFixed(2)} Lei</h2>`,n.insertBefore(e,n.firstChild)}const o=document.getElementById("btn-incheiere-zi");o&&(o.style.display=a.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const n=document.getElementById("history-content");if(!n)return;const t=new Date;t.setDate(t.getDate()-7);const i=u.filter(e=>new Date(e.created_at)>=t);let a="",o="";if(i.length===0)a='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const e={};i.forEach(c=>{const s=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});e[s]=(e[s]||0)+(parseFloat(c.total)||0)}),i.forEach(c=>{const s=new Date(c.created_at),r=s.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=s.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==o){const p=e[d]?e[d].toFixed(2):"0.00";a+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${p} Lei</h3>
                         </div>`,o=d}let f=D(c.detalii_comanda);a+=`
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
            `})}n.innerHTML=a};window.showEndDayModal=function(){const n=document.getElementById("end-day-modal"),t=document.getElementById("end-day-summary"),i=new Date;i.setHours(0,0,0,0);const a=u.filter(r=>new Date(r.created_at)>=i),o=a.filter(r=>r.status==="noua"||r.status==="in_preparare"),e=a.filter(r=>r.status==="servita"),c=a.reduce((r,l)=>r+(parseFloat(l.total)||0),0),s=a.length;t.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${s}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${e.length}</strong></p>
        ${o.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${o.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,n.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:n}=await window.getAuthSession();if(!n){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const t=new Date;t.setDate(t.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",t.toISOString())}catch(s){console.error("Eroare la curățarea istoricului vechi:",s)}const i=new Date;i.setHours(0,0,0,0);const a=u.filter(s=>new Date(s.created_at)>=i&&s.status!=="finalizata");if(a.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let o=0;for(const s of a){const{error:r}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",s.id);r&&(console.error("Eroare la finalizare comanda #"+s.id,r),o++)}window.closeEndDayModal();const e=document.getElementById("cb-force-close");let c=!1;if(e&&e.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(s){console.error("Nu s-a putut forța închiderea:",s)}if(o===0){const s=u.filter(l=>new Date(l.created_at)>=i).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let r=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${s.toFixed(2)} Lei
Comenzi finalizate: ${a.length}

Toate comenzile au fost mutate în Istoric.${r}`)}else alert(`Ziua a fost închisă, dar ${o} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=n=>{const t=document.getElementById("receptie-panel"),i=document.getElementById("istoric-panel");n?(t.style.display="none",i.style.display="block"):(t.style.display="block",i.style.display="none")};let T;const y=document.getElementById("install-app-btn");function k(){const n=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;y&&(n?y.style.display="none":y.style.display="inline-flex")}k();window.addEventListener("beforeinstallprompt",n=>{n.preventDefault(),T=n,k()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),y&&(y.style.display="none")});y&&y.addEventListener("click",async()=>{if(T){T.prompt();const{outcome:n}=await T.userChoice;console.log(`PWA install choice: ${n}`),n==="accepted"&&(y.style.display="none"),T=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function D(n){if(!n||!Array.isArray(n)||n.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const t={};n.forEach(e=>{const c=e.customer_name&&e.customer_name.trim()!==""?e.customer_name:"Masa";t[c]||(t[c]=[]),t[c].push(e)});let i="";const a=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let o=0;for(const[e,c]of Object.entries(t)){let s=0;const r=c.map(p=>{const m=parseFloat(p.product.pret||0),g=parseInt(p.quantity||1),w=m*g;s+=w;const b=p.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(p.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${g}x</b> ${escapeHTML(p.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${w.toFixed(2)} Lei</span>
            </div>${b}`}).join(""),l=a[o%a.length];o++;const f=e==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(e)}`;i+=`
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
        `}return i}async function z(n){if(!n)return;const t=n.detalii_comanda||[],i=String(n.numar_masa||"?"),a=parseFloat(n.total||0).toFixed(2),o=new Date(n.created_at),e=o.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),s=t.some(m=>m.is_new===!0),r=s,l=s?t.filter(m=>m.is_new===!0):t,d={};l.forEach(m=>{const g=m.customer_name&&m.customer_name.trim()!==""?m.customer_name:"Masa";d[g]||(d[g]=[]),d[g].push(m)});let f="";for(const[m,g]of Object.entries(d)){const w=m==="Masa"?"👥 Împreună":`👤 ${m}`;let b=0;f+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${w}</b>
        </div>`,g.forEach(x=>{var $,I;const E=parseInt(x.quantity||1),M=parseFloat((($=x.product)==null?void 0:$.pret)||0),L=E*M;b+=L;const B=x.notes?`<br><small><i>* ${x.notes}</i></small>`:"";f+=`<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${E}x ${((I=x.product)==null?void 0:I.nume)||"Produs"}</span>
                <span>${L.toFixed(2)}</span>
            </div>${B}`}),f+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${b.toFixed(2)} Lei</div>`}const p=`
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
            <span>#${parseInt(n.id)}</span>
        </div>
        <div class="info" style="border-bottom: none; font-weight: normal;">
            <span>${e}</span>
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
    </html>`;if(typeof qz<"u"&&qz.websocket.isActive())try{const m=h||await qz.printers.getDefault(),g=qz.print.createConfig(m),w=[{type:"pixel",format:"html",flavor:"plain",data:p}];qz.print(g,w).then(()=>{console.log("✅ Bon printat silențios via QZ Tray pe:",m)}).catch(b=>{console.warn("Eroare printare QZ Tray, fallback la browser:",b),O(p)});return}catch(m){console.warn("Excepție QZ Tray, fallback la browser:",m)}O(p)}function O(n){let t=document.getElementById("receipt-print-frame");t||(t=document.createElement("iframe"),t.id="receipt-print-frame",t.style.cssText="position: fixed; top: -10000px; left: -10000px; width: 80mm; height: 0; border: none; visibility: hidden;",document.body.appendChild(t));const i=t.contentDocument||t.contentWindow.document;i.open(),i.write(n),i.close(),t.onload=()=>{try{t.contentWindow.focus(),t.contentWindow.print()}catch(a){console.warn("Printare automată blocată, se deschide fereastra manuală:",a);const o=window.open("","_blank","width=320,height=600");o&&(o.document.write(n),o.document.close(),o.onload=()=>{o.print(),o.onafterprint=()=>o.close()})}}}let h=null;async function C(){if(typeof qz>"u")return v("Lipsă SDK QZ","#e74c3c"),!1;if(qz.websocket.isActive())return v(`Conectat (${h||"Implicită"})`,"#2ecc71"),!0;try{qz.security.setCertificatePromise(n=>n()),qz.security.setSignaturePromise(()=>n=>n()),await qz.websocket.connect({retries:3,delay:1});try{const n=await qz.printers.find();console.log("🖨️ Imprimante detectate de QZ Tray:",n);const t=n.find(i=>i.toLowerCase().includes("samsung")||i.toLowerCase().includes("m2020")||i.toLowerCase().includes("m2026"));t?h=t:h=await qz.printers.getDefault(),v(`Conectat: ${h||"Implicită"}`,"#2ecc71")}catch{v("Conectat QZ","#2ecc71")}return!0}catch(n){return console.warn("QZ Tray nu este pornit pe laptop:",n),v("Deconectat (Offline)","#f5b041"),!1}}function v(n,t){const i=document.getElementById("qz-status-badge");i&&(i.style.background=`rgba(${t==="#2ecc71"?"46, 204, 113":"245, 176, 65"}, 0.2)`,i.style.color=t,i.style.borderColor=t,i.innerHTML=`<i class="fas fa-print"></i> QZ Tray: ${n}`)}window.testQZPrint=async function(){if(await C()&&typeof qz<"u"&&qz.websocket.isActive())try{const t=h||await qz.printers.getDefault(),i=qz.print.createConfig(t),o=[{type:"pixel",format:"html",flavor:"plain",data:`
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${t}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `}];await qz.print(i,o),alert(`✅ Test trimis cu succes pe imprimanta: ${t}!`)}catch(t){alert("Eroare la printare prin QZ Tray: "+t.message)}else alert("QZ Tray nu este pornit pe laptop. Deschide aplicația QZ Tray pe Windows!")};window.printOrderReceipt=function(n){const t=u.find(i=>i.id===n);t&&(z(t),t.status==="noua"&&window.updateOrderStatus(n,"in_preparare"))};_();setTimeout(C,1e3);
