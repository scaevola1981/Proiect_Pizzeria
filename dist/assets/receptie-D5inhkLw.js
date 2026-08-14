import"./supabase-Cnp1ATid.js";import"./security-Bv09CpAF.js";import"./app-CjUHT8gY.js";let g=[];async function _(){const t=document.getElementById("login-overlay"),a=document.getElementById("btn-owner-login"),r=document.getElementById("btn-owner-logout"),n=document.getElementById("owner-email"),s=document.getElementById("owner-password"),e=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)t.style.display="none",O();else{const o=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");o&&(o.style.display="none"),l&&(l.style.display="block")}async function i(){const o=n.value.trim(),l=s.value,d=window.checkLoginRateLimit();if(d.blocked){e.style.display="block",e.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!o||!l){e.style.display="block",e.innerText="Completați email-ul și parola.";return}if(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(o,l)).success)window.resetLoginAttempts(),e.style.display="none",t.style.display="none",O();else{const p=window.recordFailedLogin();e.style.display="block",p.blocked?e.innerText="Cont blocat temporar. Așteptați 5 minute.":e.innerText=`Email sau parolă incorectă. Mai aveți ${p.attemptsLeft} încercări.`}a.disabled=!1,a.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}a&&a.addEventListener("click",i),s&&s.addEventListener("keypress",o=>{o.key==="Enter"&&i()}),n&&n.addEventListener("keypress",o=>{o.key==="Enter"&&i()}),r&&r.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function O(){if(!window.supabaseClient)return;const{authenticated:t}=await window.getAuthSession();if(!t){document.getElementById("login-overlay").style.display="flex";const n=document.getElementById("auth-loading"),s=document.getElementById("login-form-content");n&&(n.style.display="none"),s&&(s.style.display="block");return}const{data:a,error:r}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(r){console.error("Eroare:",r);return}g=a||[],renderOwnerOrders(),window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},n=>{if(n.eventType==="INSERT")g.unshift(n.new),v(n.new);else if(n.eventType==="UPDATE"){const s=g.findIndex(e=>e.id===n.new.id);if(s>-1){const e=g[s];g[s]=n.new,e.status!=="noua"&&n.new.status==="noua"&&v(n.new)}}else n.eventType==="DELETE"&&(g=g.filter(s=>s.id!==n.old.id));renderOwnerOrders()}).subscribe()}window.renderOwnerOrders=function(){const t=document.getElementById("comenzi-container");if(!t)return;t.innerHTML="";const a=new Date;a.setHours(0,0,0,0);let r=0;if(g.length===0){t.innerHTML="<p>Nicio comandă înregistrată.</p>";return}g.forEach(e=>{const i=new Date(e.created_at)>=a;if(i&&e.status!=="finalizata"&&(r+=parseFloat(e.total)||0),e.status==="finalizata"||!i)return;const o=document.createElement("div");o.className="modern-card",e.status,e.status;let l=D(e.detalii_comanda);const d=new Date(e.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),y=new Date(e.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let p=e.status.toUpperCase(),m="#f39c12";e.status==="noua"?(p="NOUĂ",m="#f39c12"):e.status==="in_preparare"?(p="ÎN PREPARARE",m="#2ecc71"):e.status==="servita"&&(p="SERVITĂ",m="#95a5a6");let w="";e.status==="noua"?w=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:e.status==="in_preparare"?w=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:e.status==="servita"&&(w=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(e.numar_masa))}</button>`),o.innerHTML=`
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
                    <span class="modern-tag">Ora ${escapeHTML(y)}</span>
                    <span class="modern-tag">${escapeHTML(d)}</span>
                    <span class="modern-tag" style="background: ${m}; color: white;">${escapeHTML(p)}</span>
                </div>
            </div>
            ${w}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(e.id)})"><i class="fas fa-print"></i> Printează Bon</button>
        `,t.appendChild(o)});const n=g.filter(e=>new Date(e.created_at)>=a&&e.status!=="finalizata");if(n.length>0||r>0){const e=document.createElement("div");e.style.gridColumn="1 / -1",e.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${r.toFixed(2)} Lei</h2>`,t.insertBefore(e,t.firstChild)}const s=document.getElementById("btn-incheiere-zi");s&&(s.style.display=n.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const t=document.getElementById("history-content");if(!t)return;const a=new Date;a.setDate(a.getDate()-7);const r=g.filter(e=>new Date(e.created_at)>=a);let n="",s="";if(r.length===0)n='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const e={};r.forEach(c=>{const i=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});e[i]=(e[i]||0)+(parseFloat(c.total)||0)}),r.forEach(c=>{const i=new Date(c.created_at),o=i.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=i.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=i.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==s){const p=e[d]?e[d].toFixed(2):"0.00";n+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${p} Lei</h3>
                         </div>`,s=d}let y=D(c.detalii_comanda);n+=`
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
                            ${y}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${escapeHTML(l)}</span>
                            <span class="modern-tag">${escapeHTML(o)}</span>
                        </div>
                    </div>
                </div>
            `})}t.innerHTML=n};window.showEndDayModal=function(){const t=document.getElementById("end-day-modal"),a=document.getElementById("end-day-summary"),r=new Date;r.setHours(0,0,0,0);const n=g.filter(o=>new Date(o.created_at)>=r),s=n.filter(o=>o.status==="noua"||o.status==="in_preparare"),e=n.filter(o=>o.status==="servita"),c=n.reduce((o,l)=>o+(parseFloat(l.total)||0),0),i=n.length;a.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${i}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${e.length}</strong></p>
        ${s.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${s.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,t.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:t}=await window.getAuthSession();if(!t){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const a=new Date;a.setDate(a.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",a.toISOString())}catch(i){console.error("Eroare la curățarea istoricului vechi:",i)}const r=new Date;r.setHours(0,0,0,0);const n=g.filter(i=>new Date(i.created_at)>=r&&i.status!=="finalizata");if(n.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let s=0;for(const i of n){const{error:o}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",i.id);o&&(console.error("Eroare la finalizare comanda #"+i.id,o),s++)}window.closeEndDayModal();const e=document.getElementById("cb-force-close");let c=!1;if(e&&e.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(i){console.error("Nu s-a putut forța închiderea:",i)}if(s===0){const i=g.filter(l=>new Date(l.created_at)>=r).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let o=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${i.toFixed(2)} Lei
Comenzi finalizate: ${n.length}

Toate comenzile au fost mutate în Istoric.${o}`)}else alert(`Ziua a fost închisă, dar ${s} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=t=>{const a=document.getElementById("receptie-panel"),r=document.getElementById("istoric-panel");t?(a.style.display="none",r.style.display="block"):(a.style.display="block",r.style.display="none")};let x;const b=document.getElementById("install-app-btn");function S(){const t=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;b&&(t?b.style.display="none":b.style.display="inline-flex")}S();window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),x=t,S()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),b&&(b.style.display="none")});b&&b.addEventListener("click",async()=>{if(x){x.prompt();const{outcome:t}=await x.userChoice;console.log(`PWA install choice: ${t}`),t==="accepted"&&(b.style.display="none"),x=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function D(t){if(!t||!Array.isArray(t)||t.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const a={};t.forEach(e=>{const c=e.customer_name&&e.customer_name.trim()!==""?e.customer_name:"Masa";a[c]||(a[c]=[]),a[c].push(e)});let r="";const n=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let s=0;for(const[e,c]of Object.entries(a)){let i=0;const o=c.map(p=>{const m=parseFloat(p.product.pret||0),w=parseInt(p.quantity||1),u=m*w;i+=u;const f=p.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(p.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${w}x</b> ${escapeHTML(p.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${u.toFixed(2)} Lei</span>
            </div>${f}`}).join(""),l=n[s%n.length];s++;const y=e==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(e)}`;r+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${l}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${l};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${l}; font-weight: 800; font-size: 0.95rem;">
                        ${y}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${i.toFixed(2)} Lei
                    </span>
                </div>
                ${o}
            </div>
        `}return r}function v(t){if(!t)return;const a=t.detalii_comanda||[],r=String(t.numar_masa||"?"),n=parseFloat(t.total||0).toFixed(2),s=new Date(t.created_at),e=s.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),i=a.some(u=>u.is_new===!0),o=i,l=i?a.filter(u=>u.is_new===!0):a,d={};l.forEach(u=>{const f=u.customer_name&&u.customer_name.trim()!==""?u.customer_name:"Masa";d[f]||(d[f]=[]),d[f].push(u)});let y="";for(const[u,f]of Object.entries(d)){const I=u==="Masa"?"👥 Împreună":`👤 ${u}`;let L=0;y+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${I}</b>
        </div>`,f.forEach(h=>{var T,z;const E=parseInt(h.quantity||1),M=parseFloat(((T=h.product)==null?void 0:T.pret)||0),$=E*M;L+=$;const k=h.notes?`<br><small><i>* ${h.notes}</i></small>`:"";y+=`<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${E}x ${((z=h.product)==null?void 0:z.nume)||"Produs"}</span>
                <span>${$.toFixed(2)}</span>
            </div>${k}`}),y+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${L.toFixed(2)} Lei</div>`}const p=`
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
            ${o?'<p style="font-size: 14px; font-weight: bold; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">*** BON SUPLIMENTAR ***</p>':""}
        </div>

        <div class="info">
            <span>Masa: ${r}</span>
            <span>#${parseInt(t.id)}</span>
        </div>
        <div class="info" style="border-bottom: none; font-weight: normal;">
            <span>${e}</span>
            <span>${c}</span>
        </div>

        <div style="margin-top: 4px;">
            ${y}
        </div>

        <div class="total-section">
            <div class="total">TOTAL: ${n} Lei</div>
        </div>

        <div class="footer">
            <p>Vă mulțumim!</p>
            <p>www.bella-roma.ro</p>
        </div>
    </body>
    </html>`;let m=document.getElementById("receipt-print-frame");m||(m=document.createElement("iframe"),m.id="receipt-print-frame",m.style.cssText="position: fixed; top: -10000px; left: -10000px; width: 80mm; height: 0; border: none; visibility: hidden;",document.body.appendChild(m));const w=m.contentDocument||m.contentWindow.document;w.open(),w.write(p),w.close(),m.onload=()=>{try{m.contentWindow.focus(),m.contentWindow.print()}catch(u){console.warn("Printare automată blocată, se deschide fereastra manuală:",u);const f=window.open("","_blank","width=320,height=600");f&&(f.document.write(p),f.document.close(),f.onload=()=>{f.print(),f.onafterprint=()=>f.close()})}}}window.printOrderReceipt=function(t){const a=g.find(r=>r.id===t);a&&(v(a),a.status==="noua"&&window.updateOrderStatus(t,"in_preparare"))};_();
