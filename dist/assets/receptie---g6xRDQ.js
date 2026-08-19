import"./supabase-BWP_rvw7.js";import"./security-Bv09CpAF.js";import"./app-wBbXJArf.js";let m=[];async function V(){const t=document.getElementById("login-overlay"),a=document.getElementById("btn-owner-login"),n=document.getElementById("btn-owner-logout"),i=document.getElementById("owner-email"),o=document.getElementById("owner-password"),e=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)t.style.display="none",N();else{const r=document.getElementById("auth-loading"),d=document.getElementById("login-form-content");r&&(r.style.display="none"),d&&(d.style.display="block")}async function s(){const r=i.value.trim(),d=o.value,p=window.checkLoginRateLimit();if(p.blocked){e.style.display="block",e.innerText=`Prea multe încercări. Așteptați ${p.remainingSeconds} secunde.`;return}if(!r||!d){e.style.display="block",e.innerText="Completați email-ul și parola.";return}if(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(r,d)).success)window.resetLoginAttempts(),e.style.display="none",t.style.display="none",N();else{const u=window.recordFailedLogin();e.style.display="block",u.blocked?e.innerText="Cont blocat temporar. Așteptați 5 minute.":e.innerText=`Email sau parolă incorectă. Mai aveți ${u.attemptsLeft} încercări.`}a.disabled=!1,a.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}a&&a.addEventListener("click",s),o&&o.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),i&&i.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),n&&n.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function N(){if(!window.supabaseClient)return;const{authenticated:t}=await window.getAuthSession();if(!t){document.getElementById("login-overlay").style.display="flex";const i=document.getElementById("auth-loading"),o=document.getElementById("login-form-content");i&&(i.style.display="none"),o&&(o.style.display="block");return}const{data:a,error:n}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(n){console.error("Eroare:",n);return}m=a||[],m.forEach(i=>E(i)),renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},i=>{if(i.eventType==="INSERT")m.findIndex(e=>e.id===i.new.id)===-1&&m.unshift(i.new),E(i.new);else if(i.eventType==="UPDATE"){const o=m.findIndex(e=>e.id===i.new.id);o>-1?m[o]=i.new:m.unshift(i.new),E(i.new)}else i.eventType==="DELETE"&&(m=m.filter(o=>o.id!==i.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:i}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});i&&(m=i,m.forEach(o=>E(o)),renderOwnerOrders())}},5e3))}const O=new Set;async function E(t){if(!t||t.status!=="noua")return;const a=Array.isArray(t.detalii_comanda)?t.detalii_comanda.length:0,n=`${t.id}_${t.total}_${a}`;O.has(n)||(O.add(n),console.log("🖨️ Auto-print declanșat automat pentru comanda #",t.id,"Masa:",t.numar_masa),await $(t),window.updateOrderStatus&&await window.updateOrderStatus(t.id,"in_preparare"))}window.renderOwnerOrders=function(){const t=document.getElementById("comenzi-container");if(!t)return;t.innerHTML="";const a=new Date;a.setHours(0,0,0,0);let n=0;if(m.length===0){t.innerHTML="<p>Nicio comandă înregistrată.</p>";return}m.forEach(e=>{var l;if(e.status!=="finalizata"&&(n+=parseFloat(e.total)||0),e.status==="finalizata")return;const c=document.createElement("div");c.className="modern-card",e.status,e.status;let s=q(e.detalii_comanda);const r=new Date(e.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),d=new Date(e.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let p=e.status.toUpperCase(),f="#f39c12";e.status==="noua"?(p="NOUĂ",f="#f39c12"):e.status==="in_preparare"?(p="PRINTATĂ / ÎN PREPARARE",f="#2ecc71"):e.status==="servita"&&(p="SERVITĂ",f="#3498db");let u="";e.status==="noua"?u=`<button class="modern-card-btn" style="background: #e67e22;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:e.status==="in_preparare"?u=`<button class="modern-card-btn success" style="background: #27ae60;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'servita')"><i class="fas fa-check-circle"></i> Comandă Printată (Marchează Servită)</button>`:e.status==="servita"&&(u=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(e.numar_masa))}</button>`);const v=e.status==="noua"?"Printează Bon":"Retipărește Bon",b=e.ospatar_nume||(Array.isArray(e.detalii_comanda)?(l=e.detalii_comanda.find(g=>g.ospatar_nume))==null?void 0:l.ospatar_nume:null),y=b?`<span class="modern-tag" style="background: #27ae60; color: white;"><i class="fas fa-user-tie"></i> ${escapeHTML(b)}</span>`:'<span class="modern-tag" style="background: #2980b9; color: white;"><i class="fas fa-qrcode"></i> QR Masă</span>';c.innerHTML=`
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
                    <span class="modern-tag">Ora ${escapeHTML(d)}</span>
                    <span class="modern-tag">${escapeHTML(r)}</span>
                    <span class="modern-tag" style="background: ${f}; color: white;">${escapeHTML(p)}</span>
                    ${y}
                </div>
            </div>
            ${u}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(e.id)})"><i class="fas fa-print"></i> ${v}</button>
        `,t.appendChild(c)});const i=m.filter(e=>new Date(e.created_at)>=a&&e.status!=="finalizata");if(i.length>0||n>0){const e=document.createElement("div");e.style.gridColumn="1 / -1",e.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${n.toFixed(2)} Lei</h2>`,t.insertBefore(e,t.firstChild)}const o=document.getElementById("btn-incheiere-zi");o&&(o.style.display=i.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const t=document.getElementById("history-content");if(!t)return;const a=new Date;a.setDate(a.getDate()-7);const n=m.filter(e=>new Date(e.created_at)>=a);let i="",o="";if(n.length===0)i='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const e={};n.forEach(c=>{const s=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});e[s]=(e[s]||0)+(parseFloat(c.total)||0)}),n.forEach(c=>{const s=new Date(c.created_at),r=s.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),d=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),p=s.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(p!==o){const u=e[p]?e[p].toFixed(2):"0.00";i+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(p)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${u} Lei</h3>
                         </div>`,o=p}let f=q(c.detalii_comanda);i+=`
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
                            <span class="modern-tag">Ora ${escapeHTML(d)}</span>
                            <span class="modern-tag">${escapeHTML(r)}</span>
                        </div>
                    </div>
                </div>
            `})}t.innerHTML=i};window.showEndDayModal=function(){const t=document.getElementById("end-day-modal"),a=document.getElementById("end-day-summary"),n=new Date;n.setHours(0,0,0,0);const i=m.filter(r=>new Date(r.created_at)>=n),o=i.filter(r=>r.status==="noua"||r.status==="in_preparare"),e=i.filter(r=>r.status==="servita"),c=i.reduce((r,d)=>r+(parseFloat(d.total)||0),0),s=i.length;a.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${s}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${e.length}</strong></p>
        ${o.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${o.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,t.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:t}=await window.getAuthSession();if(!t){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const a=new Date;a.setDate(a.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",a.toISOString())}catch(s){console.error("Eroare la curățarea istoricului vechi:",s)}const n=new Date;n.setHours(0,0,0,0);const i=m.filter(s=>new Date(s.created_at)>=n&&s.status!=="finalizata");if(i.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let o=0;for(const s of i){const{error:r}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",s.id);r&&(console.error("Eroare la finalizare comanda #"+s.id,r),o++)}window.closeEndDayModal();const e=document.getElementById("cb-force-close");let c=!1;if(e&&e.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(s){console.error("Nu s-a putut forța închiderea:",s)}if(o===0){const s=m.filter(d=>new Date(d.created_at)>=n).reduce((d,p)=>d+(parseFloat(p.total)||0),0);let r=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${s.toFixed(2)} Lei
Comenzi finalizate: ${i.length}

Toate comenzile au fost mutate în Istoric.${r}`)}else alert(`Ziua a fost închisă, dar ${o} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=t=>{const a=document.getElementById("receptie-panel"),n=document.getElementById("istoric-panel");t?(a.style.display="none",n.style.display="block"):(a.style.display="block",n.style.display="none")};let A;const w=document.getElementById("install-app-btn");function R(){const t=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;w&&(t?w.style.display="none":w.style.display="inline-flex")}R();window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),A=t,R()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),w&&(w.style.display="none")});w&&w.addEventListener("click",async()=>{if(A){A.prompt();const{outcome:t}=await A.userChoice;console.log(`PWA install choice: ${t}`),t==="accepted"&&(w.style.display="none"),A=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function q(t){if(!t||!Array.isArray(t)||t.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const a={};t.forEach(e=>{const c=e.customer_name&&e.customer_name.trim()!==""?e.customer_name:"Masa";a[c]||(a[c]=[]),a[c].push(e)});let n="";const i=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let o=0;for(const[e,c]of Object.entries(a)){let s=0;const r=c.map(u=>{const v=parseFloat(u.product.pret||0),b=parseInt(u.quantity||1),y=v*b;s+=y;const l=u.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(u.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${b}x</b> ${escapeHTML(u.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${y.toFixed(2)} Lei</span>
            </div>${l}`}).join(""),d=i[o%i.length];o++;const f=e==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(e)}`;n+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${d}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${d};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${d}; font-weight: 800; font-size: 0.95rem;">
                        ${f}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${s.toFixed(2)} Lei
                    </span>
                </div>
                ${r}
            </div>
        `}return n}async function $(t){var y;if(!t)return;const a=t.detalii_comanda||[],n=String(t.numar_masa||"?"),i=parseFloat(t.total||0).toFixed(2),o=new Date(t.created_at),e=o.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),s=a.some(l=>l.is_new===!0),r=s,d=s?a.filter(l=>l.is_new===!0):a,p={};d.forEach(l=>{const g=l.customer_name&&l.customer_name.trim()!==""?l.customer_name:"Masa";p[g]||(p[g]=[]),p[g].push(l)});let f="";for(const[l,g]of Object.entries(p)){const L=l==="Masa"?"--- [ IMPREUNA ] ---":`--- [ ${l.toUpperCase()} ] ---`;let C=0;f+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px; text-align: center;">
            <b style="font-size: 12px; letter-spacing: 1px;">${L}</b>
        </div>`,g.forEach(x=>{var D,Q;const S=parseInt(x.quantity||1),H=parseFloat(((D=x.product)==null?void 0:D.pret)||0),M=S*H;C+=M;const Z=((Q=x.product)==null?void 0:Q.nume)||"Produs",F=x.notes?`<div style="font-size: 11px; font-style: italic; padding-left: 8px;">* ${x.notes}</div>`:"";f+=`<div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; padding: 2px 0; line-height: 1.3;">
                <span style="font-weight: bold;"><b>${S}x ${Z}</b></span>
                <span style="font-weight: bold; padding-right: 2px;">${M.toFixed(2)}</span>
            </div>${F}`}),f+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px; padding-right: 2px;">Subtotal: ${C.toFixed(2)} Lei</div>`}const u=t.ospatar_nume||(Array.isArray(t.detalii_comanda)?(y=t.detalii_comanda.find(l=>l.ospatar_nume))==null?void 0:y.ospatar_nume:null),v=`
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
                width: 72mm;
                max-width: 72mm;
                padding: 2mm 3mm 4mm 3mm;
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
            <span>Masa: ${n}</span>
            <span>#${parseInt(t.id)}</span>
        </div>
        <div class="info" style="${u?"":"border-bottom: none;"} font-weight: normal;">
            <span>${e}</span>
            <span>${c}</span>
        </div>
        ${u?`<div class="info" style="border-bottom: none; font-weight: bold;">
            <span>Ospatar: ${escapeHTML(u)}</span>
        </div>`:""}

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
    </html>`;if(await B()&&typeof qz<"u"&&qz.websocket.isActive())try{const l=h||await qz.printers.getDefault(),g=qz.configs.create(l),L=[{type:"pixel",format:"html",flavor:"plain",data:v}];await qz.print(g,L),console.log("✅ Bon printat 100% silențios via QZ Tray pe:",l);return}catch(l){console.warn("❌ Eroare trimitere job QZ Tray:",l)}else console.warn("⚠️ QZ Tray nu este conectat — bonul NU a fost printat. Pornește QZ Tray pe laptop!")}let h=null,k=!1,T=!1;function _(){if(!(k||typeof qz>"u")){k=!0;var t=`-----BEGIN CERTIFICATE-----
MIIC/DCCAeQCCQCa8tjrVFTdTzANBgkqhkiG9w0BAQsFADBAMRwwGgYDVQQDDBNC
ZWxsYSBSb21hIFBpenplcmllMRMwEQYDVQQKDApCZWxsYSBSb21hMQswCQYDVQQG
EwJSTzAeFw0yNjA4MTcwODE5NTNaFw0zNjA4MTQwODE5NTNaMEAxHDAaBgNVBAMM
E0JlbGxhIFJvbWEgUGl6emVyaWUxEzARBgNVBAoMCkJlbGxhIFJvbWExCzAJBgNV
BAYTAlJPMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyIlOlsiH0rt8
+x5TodLsyrlhKhDKVKqtRIbxKgr+U2AdNaT7fRAzDCaYvLYNgNxyjoBMBRt97UTI
IUY35oHBVMq4AwVwJQEe81MxoLJpV8PerYsSUuoaV0hfnGQjTjHgSfLpZvABZ6XF
D6VwCvg2u9JRsBDptdNaR1hIBmIwM7qNRill2LnAbqdVqOFIzd/sky1qywD+2/bi
54rBf0ml8SNgw/9V0hvSXeGGYgV/u2KN+HAWNt2/sKdwdurdchak7O5YqgNvqPx0
1JvkO/NhIGLd11LrbPbineNiXQuHwKQ1QVWQNcNHgIQ5JIFQuXNUMH8LZFs4KGZL
nRL/7FpLOwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC7P039OQg3Zi/aZD8XHBkv
1SfuDeG3EgW5lqGdLib6cX1Ft/0XSIXYPIm/uMZrhn6owtEu9XP1nZGlt9u5ByMD
GlsVdZX2EqBAhic4jQZa3N3rivpIHWTJfqMOE4eYYPrEXz3a4nmW5ZfW9Sp480qd
gzPZLzVVwF7TtbmTyQ9gRE0c5mN/hHPvNTrCeGdqt2OjHfSVEVpvgwzvYI6yUftc
V0+zyU4bzK51xmlBsofb1NfAjkLFj3oMNjCdMYTe36TC1sT0wbOYC262artO7dbj
jA7Y2ztoFknFP/eGkUeXClaqcDqp1NHX3WWvZ5Eee3/qMGmmdiaqrQYwu6h2m7EF
-----END CERTIFICATE-----`,a=`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAyIlOlsiH0rt8+x5TodLsyrlhKhDKVKqtRIbxKgr+U2AdNaT7
fRAzDCaYvLYNgNxyjoBMBRt97UTIIUY35oHBVMq4AwVwJQEe81MxoLJpV8PerYsS
UuoaV0hfnGQjTjHgSfLpZvABZ6XFD6VwCvg2u9JRsBDptdNaR1hIBmIwM7qNRill
2LnAbqdVqOFIzd/sky1qywD+2/bi54rBf0ml8SNgw/9V0hvSXeGGYgV/u2KN+HAW
Nt2/sKdwdurdchak7O5YqgNvqPx01JvkO/NhIGLd11LrbPbineNiXQuHwKQ1QVWQ
NcNHgIQ5JIFQuXNUMH8LZFs4KGZLnRL/7FpLOwIDAQABAoIBAQCkxOzlx26SH6rZ
Slm9JOmayCalwZX9ax9ipt2Qhefh6Z8WbLCWWbEX0r68j3kY4AjgPVo4+BXH1jP5
4xAbPZH0cXwwP0+dmAYuN7UXLICRtEZKoXI03lU2Uij8/upjXWfEWuqbwafl2bbI
3E3rNXcDbBPiboMY+se6xzamyBaC6NdQRUB3/w6Pd90VCIQOVhfIfLXxArPhDYGF
d/pTRk/B4v/VlbIaZSXE0cqtPydUXSMMZnV8xsa9kHkBJ91vvErcVJpGlsDVbVnJ
u+5EhicPh0pNthq0hgdvtE83PcOP70LUYQNxjurq2AOplnJ5btouUW/cqotE6QPS
P1UWk6LBAoGBAPeFQA3ywSWl9IEUnVN2krtEL+fJaLHO4fM4aNdIfxBentI7zkui
7fhMM7gt+xJIYOcWamKS4zfwgCCWq0xX+M9ZplrG/aof99M9r0H4lgH2q7YLdr6b
88Yf/RNWr9I8+LaHM/zivdSxa3lxFF3+nyoRhJjRIv3XBF+kM54QcQ6HAoGBAM9o
AbgPDIpv0q4uPAEZQnAvDyqg373gieAdTpEMnBfyzeBM1XU1a4phb6l3zoq3yXEi
jpyKBRYzlmAIQT84Ck+exQ0CPiOloKVvaz7hfB+VNFnwJD7en91KsH9FlVqM5gO/
x6DaEK9ZXuOFNJodD8h3PFRPUb+MzsTIXZQvxTatAoGBALVDlgcg8aWahRZKfHR0
7zvI0bRS4SLluL6fXtfZtYPNZ03aklb9uHwPggitU6Kt8pkI51vM6i07KPm0nTnJ
auKeap8r/vQpeRnvoHsVivVhKZqlho5MMxeysWkKILQ8Bn/VP5NAkXhDfctvrlSv
dOwf7BTlg1SVtBQ+cbadn83dAoGADmvv+qlpONMPtjbWy0jDWuOazV8ET8KmM6Q2
C1XyIKQsdpVBHnZJdQTTa9g9z116L1i0y+O4+NM7eI/6YXf3F5Q1pXLreTUSF47I
yUWKiPOqATr2ejympw+DeEYRXYuAjvAt5FxlXpv7QhzIDJNKvqiz1DTzvTsAQaSh
BSXRM70CgYBWWaBpuCCxsuPZVrcV6BT5HjRuXPQ/VUPa7m7MJfljpmiZKn85wAR2
e102YBQ+sbWSIXaRcbVgQlUTarpeBepCZ8CemuwU6v52qFR1vFqzrT8Us9j5il9u
cmislyBkYbexYBYwSSgtxKvsqYU0WbuHsvfrcCDvi/itEXvytisfWA==
-----END RSA PRIVATE KEY-----`;qz.security.setCertificatePromise(function(n,i){n(t)}),qz.security.setSignaturePromise(function(n){return function(i,o){try{var e=KEYUTIL.getKey(a),c=new KJUR.crypto.Signature({alg:"SHA512withRSA"});c.init(e),c.updateString(n);var s=c.sign();i(stob64(hextorstr(s)))}catch(r){console.error("QZ Tray semnare eșuată:",r),i()}}}),qz.websocket.setClosedCallbacks(function(n){console.warn("⚠️ QZ Tray: Conexiune pierdută. Se reconectează în 3 secunde...",n),I("Reconectare...","#f5b041"),setTimeout(z,3e3)}),console.log("✅ QZ Tray: Securitate configurată cu certificat digital")}}async function z(){if(typeof qz>"u")return!1;if(qz.websocket.isActive())return await P(),I(`Conectat (${h||"Implicită"})`,"#2ecc71"),!0;if(T)return!1;T=!0;try{return _(),await qz.websocket.connect({retries:3,delay:1}),console.log("✅ QZ Tray: WebSocket conectat cu succes!"),await P(),I(`Conectat (${h||"Implicită"})`,"#2ecc71"),T=!1,!0}catch(t){return console.warn("❌ QZ Tray: Nu s-a putut conecta (aplicația QZ Tray pornită pe laptop?):",t.message||t),I("Deconectat","#f5b041"),T=!1,!1}}async function P(){if(qz.websocket.isActive())try{const t=await qz.printers.find();console.log("🖨️ QZ Tray: Imprimante detectate:",t),h=t.find(n=>n&&(n.toLowerCase().includes("ocpp")||n.toLowerCase().includes("pos-80")||n.toLowerCase().includes("pos 80")||n.toLowerCase().includes("pos80")||n.toLowerCase().includes("thermal")||n.toLowerCase().includes("receipt")||n.toLowerCase().includes("samsung")||n.toLowerCase().includes("m2020")||n.toLowerCase().includes("m2026")||n.toLowerCase().includes("xprinter")||n.toLowerCase().includes("epson")))||await qz.printers.getDefault(),console.log("🖨️ QZ Tray: Imprimantă selectată:",h)}catch(t){console.warn("QZ Tray: Nu s-au putut detecta imprimantele:",t)}}async function B(){return typeof qz>"u"?(I("Lipsă SDK QZ","#e74c3c"),!1):await z()}function I(t,a){const n=document.getElementById("qz-status-badge");if(n){const i=a==="#2ecc71"?"46, 204, 113":a==="#e74c3c"?"231, 76, 60":"245, 176, 65";n.style.background=`rgba(${i}, 0.2)`,n.style.color=a,n.style.borderColor=a,n.innerHTML=`<i class="fas fa-print"></i> QZ Tray: ${t}`}}window.testQZPrint=async function(){if(await B()&&qz.websocket.isActive())try{const a=h||await qz.printers.getDefault(),n=qz.configs.create(a),o=[{type:"pixel",format:"html",flavor:"plain",data:`
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${a}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `}];await qz.print(n,o),alert(`✅ Test trimis cu succes pe imprimanta: ${a}!
Bonul a fost printat SILENȚIOS fără fereastră de dialog!`)}catch(a){alert("❌ Eroare la printare prin QZ Tray: "+(a.message||a))}else alert(`❌ QZ Tray nu este pornit pe laptop.

1. Deschide aplicația QZ Tray pe Windows
2. Verifică iconița verde lângă ceas
3. Apasă din nou Test`)};window.printOrderReceipt=function(t){const a=m.find(n=>n.id===t);a&&($(a),a.status==="noua"&&window.updateOrderStatus(t,"in_preparare"))};V();setTimeout(B,1e3);setInterval(async()=>{typeof qz<"u"&&!qz.websocket.isActive()&&!T&&(console.log("🔄 QZ Tray: Keep-alive reconectare..."),await z())},1e4);
