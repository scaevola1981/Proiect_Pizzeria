import"./supabase-Cnp1ATid.js";import"./security-Bv09CpAF.js";import"./app-DW9bjJ8o.js";let m=[];async function _(){const n=document.getElementById("login-overlay"),a=document.getElementById("btn-owner-login"),r=document.getElementById("btn-owner-logout"),t=document.getElementById("owner-email"),s=document.getElementById("owner-password"),e=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)n.style.display="none",z();else{const i=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");i&&(i.style.display="none"),l&&(l.style.display="block")}async function o(){const i=t.value.trim(),l=s.value,d=window.checkLoginRateLimit();if(d.blocked){e.style.display="block",e.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!i||!l){e.style.display="block",e.innerText="Completați email-ul și parola.";return}if(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(i,l)).success)window.resetLoginAttempts(),e.style.display="none",n.style.display="none",z();else{const p=window.recordFailedLogin();e.style.display="block",p.blocked?e.innerText="Cont blocat temporar. Așteptați 5 minute.":e.innerText=`Email sau parolă incorectă. Mai aveți ${p.attemptsLeft} încercări.`}a.disabled=!1,a.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}a&&a.addEventListener("click",o),s&&s.addEventListener("keypress",i=>{i.key==="Enter"&&o()}),t&&t.addEventListener("keypress",i=>{i.key==="Enter"&&o()}),r&&r.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function z(){if(!window.supabaseClient)return;const{authenticated:n}=await window.getAuthSession();if(!n){document.getElementById("login-overlay").style.display="flex";const t=document.getElementById("auth-loading"),s=document.getElementById("login-form-content");t&&(t.style.display="none"),s&&(s.style.display="block");return}const{data:a,error:r}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(r){console.error("Eroare:",r);return}m=a||[],renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},t=>{if(t.eventType==="INSERT")m.findIndex(e=>e.id===t.new.id)===-1&&(m.unshift(t.new),v(t.new));else if(t.eventType==="UPDATE"){const s=m.findIndex(e=>e.id===t.new.id);if(s>-1){const e=m[s];m[s]=t.new,e.status!=="noua"&&t.new.status==="noua"&&v(t.new)}else m.unshift(t.new),t.new.status==="noua"&&v(t.new)}else t.eventType==="DELETE"&&(m=m.filter(s=>s.id!==t.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:t}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});t&&(m=t,renderOwnerOrders())}},5e3))}window.renderOwnerOrders=function(){const n=document.getElementById("comenzi-container");if(!n)return;n.innerHTML="";const a=new Date;a.setHours(0,0,0,0);let r=0;if(m.length===0){n.innerHTML="<p>Nicio comandă înregistrată.</p>";return}m.forEach(e=>{const o=new Date(e.created_at)>=a;if(o&&e.status!=="finalizata"&&(r+=parseFloat(e.total)||0),e.status==="finalizata"||!o)return;const i=document.createElement("div");i.className="modern-card",e.status,e.status;let l=I(e.detalii_comanda);const d=new Date(e.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),w=new Date(e.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let p=e.status.toUpperCase(),u="#f39c12";e.status==="noua"?(p="NOUĂ",u="#f39c12"):e.status==="in_preparare"?(p="ÎN PREPARARE",u="#2ecc71"):e.status==="servita"&&(p="SERVITĂ",u="#95a5a6");let y="";e.status==="noua"?y=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:e.status==="in_preparare"?y=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:e.status==="servita"&&(y=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(e.numar_masa))}</button>`),i.innerHTML=`
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${escapeHTML(String(e.numar_masa))}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(e.total))} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${parseInt(e.id)}</h3>
                </div>
                <div class="modern-card-desc">
                    ${l}
                </div>
                <div class="modern-card-tags">
                    <span class="modern-tag">Ora ${escapeHTML(w)}</span>
                    <span class="modern-tag">${escapeHTML(d)}</span>
                    <span class="modern-tag" style="background: ${u}; color: white;">${escapeHTML(p)}</span>
                </div>
            </div>
            ${y}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(e.id)})"><i class="fas fa-print"></i> Printează Bon</button>
        `,n.appendChild(i)});const t=m.filter(e=>new Date(e.created_at)>=a&&e.status!=="finalizata");if(t.length>0||r>0){const e=document.createElement("div");e.style.gridColumn="1 / -1",e.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${r.toFixed(2)} Lei</h2>`,n.insertBefore(e,n.firstChild)}const s=document.getElementById("btn-incheiere-zi");s&&(s.style.display=t.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const n=document.getElementById("history-content");if(!n)return;const a=new Date;a.setDate(a.getDate()-7);const r=m.filter(e=>new Date(e.created_at)>=a);let t="",s="";if(r.length===0)t='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const e={};r.forEach(c=>{const o=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});e[o]=(e[o]||0)+(parseFloat(c.total)||0)}),r.forEach(c=>{const o=new Date(c.created_at),i=o.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=o.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==s){const p=e[d]?e[d].toFixed(2):"0.00";t+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${p} Lei</h3>
                         </div>`,s=d}let w=I(c.detalii_comanda);t+=`
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
                            ${w}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${escapeHTML(l)}</span>
                            <span class="modern-tag">${escapeHTML(i)}</span>
                        </div>
                    </div>
                </div>
            `})}n.innerHTML=t};window.showEndDayModal=function(){const n=document.getElementById("end-day-modal"),a=document.getElementById("end-day-summary"),r=new Date;r.setHours(0,0,0,0);const t=m.filter(i=>new Date(i.created_at)>=r),s=t.filter(i=>i.status==="noua"||i.status==="in_preparare"),e=t.filter(i=>i.status==="servita"),c=t.reduce((i,l)=>i+(parseFloat(l.total)||0),0),o=t.length;a.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${o}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${e.length}</strong></p>
        ${s.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${s.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,n.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:n}=await window.getAuthSession();if(!n){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const a=new Date;a.setDate(a.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",a.toISOString())}catch(o){console.error("Eroare la curățarea istoricului vechi:",o)}const r=new Date;r.setHours(0,0,0,0);const t=m.filter(o=>new Date(o.created_at)>=r&&o.status!=="finalizata");if(t.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let s=0;for(const o of t){const{error:i}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",o.id);i&&(console.error("Eroare la finalizare comanda #"+o.id,i),s++)}window.closeEndDayModal();const e=document.getElementById("cb-force-close");let c=!1;if(e&&e.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(o){console.error("Nu s-a putut forța închiderea:",o)}if(s===0){const o=m.filter(l=>new Date(l.created_at)>=r).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let i=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${o.toFixed(2)} Lei
Comenzi finalizate: ${t.length}

Toate comenzile au fost mutate în Istoric.${i}`)}else alert(`Ziua a fost închisă, dar ${s} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=n=>{const a=document.getElementById("receptie-panel"),r=document.getElementById("istoric-panel");n?(a.style.display="none",r.style.display="block"):(a.style.display="block",r.style.display="none")};let x;const b=document.getElementById("install-app-btn");function S(){const n=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;b&&(n?b.style.display="none":b.style.display="inline-flex")}S();window.addEventListener("beforeinstallprompt",n=>{n.preventDefault(),x=n,S()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),b&&(b.style.display="none")});b&&b.addEventListener("click",async()=>{if(x){x.prompt();const{outcome:n}=await x.userChoice;console.log(`PWA install choice: ${n}`),n==="accepted"&&(b.style.display="none"),x=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function I(n){if(!n||!Array.isArray(n)||n.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const a={};n.forEach(e=>{const c=e.customer_name&&e.customer_name.trim()!==""?e.customer_name:"Masa";a[c]||(a[c]=[]),a[c].push(e)});let r="";const t=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let s=0;for(const[e,c]of Object.entries(a)){let o=0;const i=c.map(p=>{const u=parseFloat(p.product.pret||0),y=parseInt(p.quantity||1),f=u*y;o+=f;const g=p.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(p.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${y}x</b> ${escapeHTML(p.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${f.toFixed(2)} Lei</span>
            </div>${g}`}).join(""),l=t[s%t.length];s++;const w=e==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(e)}`;r+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${l}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${l};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${l}; font-weight: 800; font-size: 0.95rem;">
                        ${w}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${o.toFixed(2)} Lei
                    </span>
                </div>
                ${i}
            </div>
        `}return r}function v(n){if(!n)return;const a=n.detalii_comanda||[],r=String(n.numar_masa||"?"),t=parseFloat(n.total||0).toFixed(2),s=new Date(n.created_at),e=s.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),o=a.some(f=>f.is_new===!0),i=o,l=o?a.filter(f=>f.is_new===!0):a,d={};l.forEach(f=>{const g=f.customer_name&&f.customer_name.trim()!==""?f.customer_name:"Masa";d[g]||(d[g]=[]),d[g].push(f)});let w="";for(const[f,g]of Object.entries(d)){const D=f==="Masa"?"👥 Împreună":`👤 ${f}`;let L=0;w+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${D}</b>
        </div>`,g.forEach(h=>{var T,O;const E=parseInt(h.quantity||1),M=parseFloat(((T=h.product)==null?void 0:T.pret)||0),$=E*M;L+=$;const k=h.notes?`<br><small><i>* ${h.notes}</i></small>`:"";w+=`<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${E}x ${((O=h.product)==null?void 0:O.nume)||"Produs"}</span>
                <span>${$.toFixed(2)}</span>
            </div>${k}`}),w+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${L.toFixed(2)} Lei</div>`}const p=`
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
            ${i?'<p style="font-size: 14px; font-weight: bold; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">*** BON SUPLIMENTAR ***</p>':""}
        </div>

        <div class="info">
            <span>Masa: ${r}</span>
            <span>#${parseInt(n.id)}</span>
        </div>
        <div class="info" style="border-bottom: none; font-weight: normal;">
            <span>${e}</span>
            <span>${c}</span>
        </div>

        <div style="margin-top: 4px;">
            ${w}
        </div>

        <div class="total-section">
            <div class="total">TOTAL: ${t} Lei</div>
        </div>

        <div class="footer">
            <p>Vă mulțumim!</p>
            <p>www.bella-roma.ro</p>
        </div>
    </body>
    </html>`;let u=document.getElementById("receipt-print-frame");u||(u=document.createElement("iframe"),u.id="receipt-print-frame",u.style.cssText="position: fixed; top: -10000px; left: -10000px; width: 80mm; height: 0; border: none; visibility: hidden;",document.body.appendChild(u));const y=u.contentDocument||u.contentWindow.document;y.open(),y.write(p),y.close(),u.onload=()=>{try{u.contentWindow.focus(),u.contentWindow.print()}catch(f){console.warn("Printare automată blocată, se deschide fereastra manuală:",f);const g=window.open("","_blank","width=320,height=600");g&&(g.document.write(p),g.document.close(),g.onload=()=>{g.print(),g.onafterprint=()=>g.close()})}}}window.printOrderReceipt=function(n){const a=m.find(r=>r.id===n);a&&(v(a),a.status==="noua"&&window.updateOrderStatus(n,"in_preparare"))};_();
