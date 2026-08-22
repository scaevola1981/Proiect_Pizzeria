import"./supabase-CdU8ZLGB.js";import"./security-Bv09CpAF.js";import"./app-Df9KSSe7.js";let m=[];async function U(){const e=document.getElementById("login-overlay"),i=document.getElementById("btn-owner-login"),n=document.getElementById("btn-owner-logout"),a=document.getElementById("owner-email"),s=document.getElementById("owner-password"),t=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)e.style.display="none",k();else{const r=document.getElementById("auth-loading"),d=document.getElementById("login-form-content");r&&(r.style.display="none"),d&&(d.style.display="block")}async function o(){const r=a.value.trim(),d=s.value,p=window.checkLoginRateLimit();if(p.blocked){t.style.display="block",t.innerText=`Prea multe încercări. Așteptați ${p.remainingSeconds} secunde.`;return}if(!r||!d){t.style.display="block",t.innerText="Completați email-ul și parola.";return}if(i.disabled=!0,i.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(r,d)).success)window.resetLoginAttempts(),t.style.display="none",e.style.display="none",k();else{const u=window.recordFailedLogin();t.style.display="block",u.blocked?t.innerText="Cont blocat temporar. Așteptați 5 minute.":t.innerText=`Email sau parolă incorectă. Mai aveți ${u.attemptsLeft} încercări.`}i.disabled=!1,i.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}i&&i.addEventListener("click",o),s&&s.addEventListener("keypress",r=>{r.key==="Enter"&&o()}),a&&a.addEventListener("keypress",r=>{r.key==="Enter"&&o()}),n&&n.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function k(){if(!window.supabaseClient)return;const{authenticated:e}=await window.getAuthSession();if(!e){document.getElementById("login-overlay").style.display="flex";const a=document.getElementById("auth-loading"),s=document.getElementById("login-form-content");a&&(a.style.display="none"),s&&(s.style.display="block");return}const{data:i,error:n}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(n){console.error("Eroare:",n);return}m=i||[],m.forEach(a=>E(a)),renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},a=>{if(a.eventType==="INSERT")m.findIndex(t=>t.id===a.new.id)===-1&&m.unshift(a.new),E(a.new);else if(a.eventType==="UPDATE"){const s=m.findIndex(t=>t.id===a.new.id);s>-1?m[s]=a.new:m.unshift(a.new),E(a.new)}else a.eventType==="DELETE"&&(m=m.filter(s=>s.id!==a.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:a}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});a&&(m=a,m.forEach(s=>E(s)),renderOwnerOrders())}},5e3))}const H=new Set;async function E(e){if(!e||e.status!=="noua")return;const i=Array.isArray(e.detalii_comanda)?e.detalii_comanda.length:0,n=`${e.id}_${e.total}_${i}`;if(!H.has(n)){if(H.add(n),await S()){console.log("🖨️ Comanda #",e.id,"este gestionată direct de Serviciul In-House (fără trimitere duplicat).");return}console.log("🖨️ Auto-print declanșat automat pentru comanda #",e.id,"Masa:",e.numar_masa),await Z(e),window.updateOrderStatus&&await window.updateOrderStatus(e.id,"in_preparare")}}window.renderOwnerOrders=function(){const e=document.getElementById("comenzi-container");if(!e)return;e.innerHTML="";const i=new Date;i.setHours(0,0,0,0);let n=0;if(m.length===0){e.innerHTML="<p>Nicio comandă înregistrată.</p>";return}m.forEach(t=>{var l;if(t.status!=="finalizata"&&(n+=parseFloat(t.total)||0),t.status==="finalizata")return;const c=document.createElement("div");c.className="modern-card",t.status,t.status;let o=R(t.detalii_comanda);const r=new Date(t.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),d=new Date(t.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit",hour12:!1});let p=t.status.toUpperCase(),f="#f39c12";t.status==="noua"?(p="NOUĂ",f="#f39c12"):t.status==="in_preparare"?(p="PRINTATĂ / ÎN PREPARARE",f="#2ecc71"):t.status==="servita"&&(p="SERVITĂ",f="#3498db");let u="";t.status==="noua"?u=`
                <button class="modern-card-btn" style="background: #e67e22;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>
                <button class="modern-card-btn" style="background: #c0392b; margin-top: 4px;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'finalizata')"><i class="fas fa-broom"></i> Închide & Eliberează Masa ${escapeHTML(String(t.numar_masa))}</button>
            `:t.status==="in_preparare"?u=`
                <button class="modern-card-btn success" style="background: #27ae60;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'servita')"><i class="fas fa-check-circle"></i> Comandă Printată (Marchează Servită)</button>
                <button class="modern-card-btn" style="background: #c0392b; margin-top: 4px;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'finalizata')"><i class="fas fa-broom"></i> Închide & Eliberează Masa ${escapeHTML(String(t.numar_masa))}</button>
            `:t.status==="servita"&&(u=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(t.id)}, 'finalizata')"><i class="fas fa-broom"></i> Închide & Eliberează Masa ${escapeHTML(String(t.numar_masa))}</button>`);const x=t.status==="noua"?"Printează Bon":"Retipărește Bon",b=t.ospatar_nume||(Array.isArray(t.detalii_comanda)?(l=t.detalii_comanda.find(g=>g.ospatar_nume))==null?void 0:l.ospatar_nume:null),y=b?`<span class="modern-tag" style="background: #27ae60; color: white;"><i class="fas fa-user-tie"></i> ${escapeHTML(b)}</span>`:'<span class="modern-tag" style="background: #2980b9; color: white;"><i class="fas fa-qrcode"></i> QR Masă</span>';c.innerHTML=`
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${escapeHTML(String(t.numar_masa))}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(t.total))} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${parseInt(t.id)}</h3>
                </div>
                <div class="modern-card-desc">
                    ${o}
                </div>
                <div class="modern-card-tags">
                    <span class="modern-tag">Ora ${escapeHTML(d)}</span>
                    <span class="modern-tag">${escapeHTML(r)}</span>
                    <span class="modern-tag" style="background: ${f}; color: white;">${escapeHTML(p)}</span>
                    ${y}
                </div>
            </div>
            ${u}
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(t.id)})"><i class="fas fa-print"></i> ${x}</button>
        `,e.appendChild(c)});const a=m.filter(t=>new Date(t.created_at)>=i&&t.status!=="finalizata");if(a.length>0||n>0){const t=document.createElement("div");t.style.gridColumn="1 / -1",t.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${n.toFixed(2)} Lei</h2>`,e.insertBefore(t,e.firstChild)}const s=document.getElementById("btn-incheiere-zi");s&&(s.style.display=a.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const e=document.getElementById("history-content");if(!e)return;const i=new Date;i.setDate(i.getDate()-7);const n=m.filter(t=>new Date(t.created_at)>=i);let a="",s="";if(n.length===0)a='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const t={};n.forEach(c=>{const o=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});t[o]=(t[o]||0)+(parseFloat(c.total)||0)}),n.forEach(c=>{const o=new Date(c.created_at),r=o.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),d=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit",hour12:!1}),p=o.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(p!==s){const u=t[p]?t[p].toFixed(2):"0.00";a+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(p)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${u} Lei</h3>
                         </div>`,s=p}let f=R(c.detalii_comanda);a+=`
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
            `})}e.innerHTML=a};window.showEndDayModal=function(){const e=document.getElementById("end-day-modal"),i=document.getElementById("end-day-summary"),n=new Date;n.setHours(0,0,0,0);const a=m.filter(r=>new Date(r.created_at)>=n),s=a.filter(r=>r.status==="noua"||r.status==="in_preparare"),t=a.filter(r=>r.status==="servita"),c=a.reduce((r,d)=>r+(parseFloat(d.total)||0),0),o=a.length;i.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${o}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${t.length}</strong></p>
        ${s.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${s.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,e.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:e}=await window.getAuthSession();if(!e){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const i=new Date;i.setDate(i.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",i.toISOString())}catch(o){console.error("Eroare la curățarea istoricului vechi:",o)}const n=new Date;n.setHours(0,0,0,0);const a=m.filter(o=>new Date(o.created_at)>=n&&o.status!=="finalizata");if(a.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let s=0;for(const o of a){const{error:r}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",o.id);r&&(console.error("Eroare la finalizare comanda #"+o.id,r),s++)}window.closeEndDayModal();const t=document.getElementById("cb-force-close");let c=!1;if(t&&t.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(o){console.error("Nu s-a putut forța închiderea:",o)}if(s===0){const o=m.filter(d=>new Date(d.created_at)>=n).reduce((d,p)=>d+(parseFloat(p.total)||0),0);let r=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${o.toFixed(2)} Lei
Comenzi finalizate: ${a.length}

Toate comenzile au fost mutate în Istoric.${r}`)}else alert(`Ziua a fost închisă, dar ${s} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=e=>{const i=document.getElementById("receptie-panel"),n=document.getElementById("istoric-panel");e?(i.style.display="none",n.style.display="block"):(i.style.display="block",n.style.display="none")};let A;const w=document.getElementById("install-app-btn");function q(){const e=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;w&&(e?w.style.display="none":w.style.display="inline-flex")}q();window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),A=e,q()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),w&&(w.style.display="none")});w&&w.addEventListener("click",async()=>{if(A){A.prompt();const{outcome:e}=await A.userChoice;console.log(`PWA install choice: ${e}`),e==="accepted"&&(w.style.display="none"),A=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function R(e){if(!e||!Array.isArray(e)||e.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const i={};e.forEach(t=>{const c=t.customer_name&&t.customer_name.trim()!==""?t.customer_name:"Masa";i[c]||(i[c]=[]),i[c].push(t)});let n="";const a=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let s=0;for(const[t,c]of Object.entries(i)){let o=0;const r=c.map(u=>{const x=parseFloat(u.product.pret||0),b=parseInt(u.quantity||1),y=x*b;o+=y;const l=u.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(u.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${b}x</b> ${escapeHTML(u.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${y.toFixed(2)} Lei</span>
            </div>${l}`}).join(""),d=a[s%a.length];s++;const f=t==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(t)}`;n+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${d}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${d};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${d}; font-weight: 800; font-size: 0.95rem;">
                        ${f}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${o.toFixed(2)} Lei
                    </span>
                </div>
                ${r}
            </div>
        `}return n}async function Z(e){var y;if(!e)return;try{const l=await fetch("http://localhost:4000/print",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e),signal:AbortSignal.timeout(2e3)});if(l.ok&&(await l.json()).success){console.log(`✅ Bon printat via Serviciu In-House USB (Comanda #${e.id})`);return}}catch{}const i=e.detalii_comanda||[],n=String(e.numar_masa||"?"),a=parseFloat(e.total||0).toFixed(2),s=new Date(e.created_at),t=s.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit",hour12:!1}),o=i.some(l=>l.is_new===!0),r=o,d=o?i.filter(l=>l.is_new===!0):i,p={};d.forEach(l=>{const g=l.customer_name&&l.customer_name.trim()!==""?l.customer_name:"Masa";p[g]||(p[g]=[]),p[g].push(l)});let f="";for(const[l,g]of Object.entries(p)){const L=l==="Masa"?"--- [ IMPREUNA ] ---":`--- [ ${l.toUpperCase()} ] ---`;let C=0;f+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px; text-align: center;">
            <b style="font-size: 12px; letter-spacing: 1px;">${L}</b>
        </div>`,g.forEach(I=>{var D,N;const M=parseInt(I.quantity||1),F=parseFloat(((D=I.product)==null?void 0:D.pret)||0),O=M*F;C+=O;const V=((N=I.product)==null?void 0:N.nume)||"Produs",_=I.notes?`<div style="font-size: 11px; font-style: italic; padding-left: 8px;">* ${I.notes}</div>`:"";f+=`<div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; padding: 2px 0; line-height: 1.3;">
                <span style="font-weight: bold;"><b>${M}x ${V}</b></span>
                <span style="font-weight: bold; padding-right: 2px;">${O.toFixed(2)}</span>
            </div>${_}`}),f+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px; padding-right: 2px;">Subtotal: ${C.toFixed(2)} Lei</div>`}const u=e.ospatar_nume||(Array.isArray(e.detalii_comanda)?(y=e.detalii_comanda.find(l=>l.ospatar_nume))==null?void 0:y.ospatar_nume:null),x=`
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
            <span>#${parseInt(e.id)}</span>
        </div>
        <div class="info" style="${u?"":"border-bottom: none;"} font-weight: normal;">
            <span>${t}</span>
            <span>${c}</span>
        </div>
        ${u?`<div class="info" style="border-bottom: none; font-weight: bold;">
            <span>Ospatar: ${escapeHTML(u)}</span>
        </div>`:""}

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
    </html>`;if(await B()&&typeof qz<"u"&&qz.websocket.isActive())try{const l=v||await qz.printers.getDefault(),g=qz.configs.create(l),L=[{type:"pixel",format:"html",flavor:"plain",data:x}];await qz.print(g,L),console.log("✅ Bon printat 100% silențios via QZ Tray pe:",l);return}catch(l){console.warn("❌ Eroare trimitere job QZ Tray:",l)}else console.warn("⚠️ QZ Tray nu este conectat — bonul NU a fost printat. Pornește QZ Tray pe laptop!")}let v=null,Q=!1,T=!1;function j(){if(!(Q||typeof qz>"u")){Q=!0;var e=`-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`,i=`-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;qz.security.setCertificatePromise(function(n,a){n(e)}),qz.security.setSignaturePromise(function(n){return function(a,s){try{var t=KEYUTIL.getKey(i),c=new KJUR.crypto.Signature({alg:"SHA512withRSA"});c.init(t),c.updateString(n);var o=c.sign();a(stob64(hextorstr(o)))}catch(r){console.error("QZ Tray semnare eșuată:",r),a()}}}),qz.websocket.setClosedCallbacks(function(n){console.warn("⚠️ QZ Tray: Conexiune pierdută. Se reconectează în 3 secunde...",n),h("Reconectare...","#f5b041"),setTimeout(z,3e3)}),console.log("✅ QZ Tray: Securitate configurată cu certificat digital")}}async function z(){if(typeof qz>"u")return!1;if(qz.websocket.isActive())return await P(),h(`Conectat (${v||"Implicită"})`,"#2ecc71"),!0;if(T)return!1;T=!0;try{return j(),await qz.websocket.connect({retries:3,delay:1}),console.log("✅ QZ Tray: WebSocket conectat cu succes!"),await P(),h(`Conectat (${v||"Implicită"})`,"#2ecc71"),T=!1,!0}catch(e){return console.warn("❌ QZ Tray: Nu s-a putut conecta (aplicația QZ Tray pornită pe laptop?):",e.message||e),h("Deconectat","#f5b041"),T=!1,!1}}async function P(){if(qz.websocket.isActive())try{const e=await qz.printers.find();console.log("🖨️ QZ Tray: Imprimante detectate:",e),v=e.find(n=>n&&(n.toLowerCase().includes("ocpp")||n.toLowerCase().includes("pos-80")||n.toLowerCase().includes("pos 80")||n.toLowerCase().includes("pos80")||n.toLowerCase().includes("thermal")||n.toLowerCase().includes("receipt")||n.toLowerCase().includes("samsung")||n.toLowerCase().includes("m2020")||n.toLowerCase().includes("m2026")||n.toLowerCase().includes("xprinter")||n.toLowerCase().includes("epson")))||await qz.printers.getDefault(),console.log("🖨️ QZ Tray: Imprimantă selectată:",v)}catch(e){console.warn("QZ Tray: Nu s-au putut detecta imprimantele:",e)}}let $=!1;async function S(){try{const e=await fetch("http://localhost:4000/status",{signal:AbortSignal.timeout(1500)});if(e.ok){const i=await e.json();return $=!0,h(`In-House USB Activ (${i.printer||"POS-80"})`,"#2ecc71"),!0}}catch{$=!1}return!1}async function B(){return await S()?!0:typeof qz>"u"?(h("Deconectat","#e74c3c"),!1):await z()}function h(e,i){const n=document.getElementById("qz-status-badge");if(n){const a=i==="#2ecc71"?"46, 204, 113":i==="#e74c3c"?"231, 76, 60":"245, 176, 65";n.style.background=`rgba(${a}, 0.2)`,n.style.color=i,n.style.borderColor=i,n.innerHTML=`<i class="fas fa-print"></i> Print: ${e}`}}window.testQZPrint=async function(){if(await S())try{const a=await(await fetch("http://localhost:4000/test-print")).json();if(a.success){alert(`✅ Test trimis cu succes prin Serviciul In-House pe imprimanta USB "${a.printer||"POS-80"}"!
Bonul a fost tipărit direct fără QZ Tray!`);return}}catch(n){console.warn("Eroare test print in-house:",n)}if(await B()&&typeof qz<"u"&&qz.websocket.isActive())try{const n=v||await qz.printers.getDefault(),a=qz.configs.create(n),t=[{type:"pixel",format:"html",flavor:"plain",data:`
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${n}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `}];await qz.print(a,t),alert(`✅ Test trimis cu succes pe imprimanta: ${n}!
Bonul a fost printat SILENȚIOS fără fereastră de dialog!`)}catch(n){alert("❌ Eroare la printare prin QZ Tray: "+(n.message||n))}else alert(`❌ Niciun serviciu de printare nu este pornit pe laptop.

1. Porniți Serviciul In-House (start-service.bat) sau QZ Tray
2. Apăsați din nou Test`)};window.printOrderReceipt=function(e){const i=m.find(n=>n.id===e);i&&(Z(i),i.status==="noua"&&window.updateOrderStatus(e,"in_preparare"))};U();setTimeout(B,1e3);setInterval(async()=>{!await S()&&typeof qz<"u"&&!qz.websocket.isActive()&&!T&&(console.log("🔄 Keep-alive QZ Tray reconectare..."),await z())},8e3);
