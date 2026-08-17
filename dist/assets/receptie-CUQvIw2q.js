import"./supabase-Cnp1ATid.js";import"./security-Bv09CpAF.js";import"./app-wBbXJArf.js";let u=[];async function N(){const t=document.getElementById("login-overlay"),e=document.getElementById("btn-owner-login"),i=document.getElementById("btn-owner-logout"),a=document.getElementById("owner-email"),o=document.getElementById("owner-password"),n=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)t.style.display="none",D();else{const r=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");r&&(r.style.display="none"),l&&(l.style.display="block")}async function s(){const r=a.value.trim(),l=o.value,d=window.checkLoginRateLimit();if(d.blocked){n.style.display="block",n.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!r||!l){n.style.display="block",n.innerText="Completați email-ul și parola.";return}if(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(r,l)).success)window.resetLoginAttempts(),n.style.display="none",t.style.display="none",D();else{const m=window.recordFailedLogin();n.style.display="block",m.blocked?n.innerText="Cont blocat temporar. Așteptați 5 minute.":n.innerText=`Email sau parolă incorectă. Mai aveți ${m.attemptsLeft} încercări.`}e.disabled=!1,e.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}e&&e.addEventListener("click",s),o&&o.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),a&&a.addEventListener("keypress",r=>{r.key==="Enter"&&s()}),i&&i.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function D(){if(!window.supabaseClient)return;const{authenticated:t}=await window.getAuthSession();if(!t){document.getElementById("login-overlay").style.display="flex";const a=document.getElementById("auth-loading"),o=document.getElementById("login-form-content");a&&(a.style.display="none"),o&&(o.style.display="block");return}const{data:e,error:i}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(i){console.error("Eroare:",i);return}u=e||[],u.forEach(a=>T(a)),renderOwnerOrders(),window.ownerChannelSubscribed||(window.ownerChannelSubscribed=!0,window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},a=>{if(a.eventType==="INSERT")u.findIndex(n=>n.id===a.new.id)===-1&&u.unshift(a.new),T(a.new);else if(a.eventType==="UPDATE"){const o=u.findIndex(n=>n.id===a.new.id);o>-1?u[o]=a.new:u.unshift(a.new),T(a.new)}else a.eventType==="DELETE"&&(u=u.filter(o=>o.id!==a.old.id));renderOwnerOrders()}).subscribe()),window.ownerPollInterval||(window.ownerPollInterval=setInterval(async()=>{if(window.supabaseClient){const{data:a}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});a&&(u=a,u.forEach(o=>T(o)),renderOwnerOrders())}},5e3))}const O=new Set;async function T(t){if(!t||t.status!=="noua")return;const e=Array.isArray(t.detalii_comanda)?t.detalii_comanda.length:0,i=`${t.id}_${t.total}_${e}`;O.has(i)||(O.add(i),console.log("🖨️ Auto-print declanșat automat pentru comanda #",t.id,"Masa:",t.numar_masa),await Q(t))}window.renderOwnerOrders=function(){const t=document.getElementById("comenzi-container");if(!t)return;t.innerHTML="";const e=new Date;e.setHours(0,0,0,0);let i=0;if(u.length===0){t.innerHTML="<p>Nicio comandă înregistrată.</p>";return}u.forEach(n=>{if(n.status!=="finalizata"&&(i+=parseFloat(n.total)||0),n.status==="finalizata")return;const c=document.createElement("div");c.className="modern-card",n.status,n.status;let s=R(n.detalii_comanda);const r=new Date(n.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=new Date(n.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let d=n.status.toUpperCase(),f="#f39c12";n.status==="noua"?(d="NOUĂ",f="#f39c12"):n.status==="in_preparare"?(d="ÎN PREPARARE",f="#2ecc71"):n.status==="servita"&&(d="SERVITĂ",f="#95a5a6");let m="";n.status==="noua"?m=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(n.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:n.status==="in_preparare"?m=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(n.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:n.status==="servita"&&(m=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(n.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(n.numar_masa))}</button>`),c.innerHTML=`
            <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                <div class="modern-card-tab">Masa ${escapeHTML(String(n.numar_masa))}</div>
                <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(n.total))} Lei</span>
            </div>
            <div class="modern-card-body">
                <div class="modern-card-title-row">
                    <h3>Comanda #${parseInt(n.id)}</h3>
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
            <button class="modern-card-btn" style="background: #2c3e50; margin-top: 0;" onclick="window.printOrderReceipt(${parseInt(n.id)})"><i class="fas fa-print"></i> Printează Bon</button>
        `,t.appendChild(c)});const a=u.filter(n=>new Date(n.created_at)>=e&&n.status!=="finalizata");if(a.length>0||i>0){const n=document.createElement("div");n.style.gridColumn="1 / -1",n.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${i.toFixed(2)} Lei</h2>`,t.insertBefore(n,t.firstChild)}const o=document.getElementById("btn-incheiere-zi");o&&(o.style.display=a.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const t=document.getElementById("history-content");if(!t)return;const e=new Date;e.setDate(e.getDate()-7);const i=u.filter(n=>new Date(n.created_at)>=e);let a="",o="";if(i.length===0)a='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const n={};i.forEach(c=>{const s=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});n[s]=(n[s]||0)+(parseFloat(c.total)||0)}),i.forEach(c=>{const s=new Date(c.created_at),r=s.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=s.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=s.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==o){const m=n[d]?n[d].toFixed(2):"0.00";a+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${m} Lei</h3>
                         </div>`,o=d}let f=R(c.detalii_comanda);a+=`
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
            `})}t.innerHTML=a};window.showEndDayModal=function(){const t=document.getElementById("end-day-modal"),e=document.getElementById("end-day-summary"),i=new Date;i.setHours(0,0,0,0);const a=u.filter(r=>new Date(r.created_at)>=i),o=a.filter(r=>r.status==="noua"||r.status==="in_preparare"),n=a.filter(r=>r.status==="servita"),c=a.reduce((r,l)=>r+(parseFloat(l.total)||0),0),s=a.length;e.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${s}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${n.length}</strong></p>
        ${o.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${o.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,t.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:t}=await window.getAuthSession();if(!t){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const e=new Date;e.setDate(e.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",e.toISOString())}catch(s){console.error("Eroare la curățarea istoricului vechi:",s)}const i=new Date;i.setHours(0,0,0,0);const a=u.filter(s=>new Date(s.created_at)>=i&&s.status!=="finalizata");if(a.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let o=0;for(const s of a){const{error:r}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",s.id);r&&(console.error("Eroare la finalizare comanda #"+s.id,r),o++)}window.closeEndDayModal();const n=document.getElementById("cb-force-close");let c=!1;if(n&&n.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(s){console.error("Nu s-a putut forța închiderea:",s)}if(o===0){const s=u.filter(l=>new Date(l.created_at)>=i).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let r=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${s.toFixed(2)} Lei
Comenzi finalizate: ${a.length}

Toate comenzile au fost mutate în Istoric.${r}`)}else alert(`Ziua a fost închisă, dar ${o} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=t=>{const e=document.getElementById("receptie-panel"),i=document.getElementById("istoric-panel");t?(e.style.display="none",i.style.display="block"):(e.style.display="block",i.style.display="none")};let x;const y=document.getElementById("install-app-btn");function $(){const t=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;y&&(t?y.style.display="none":y.style.display="inline-flex")}$();window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),x=t,$()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),y&&(y.style.display="none")});y&&y.addEventListener("click",async()=>{if(x){x.prompt();const{outcome:t}=await x.userChoice;console.log(`PWA install choice: ${t}`),t==="accepted"&&(y.style.display="none"),x=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function R(t){if(!t||!Array.isArray(t)||t.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const e={};t.forEach(n=>{const c=n.customer_name&&n.customer_name.trim()!==""?n.customer_name:"Masa";e[c]||(e[c]=[]),e[c].push(n)});let i="";const a=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let o=0;for(const[n,c]of Object.entries(e)){let s=0;const r=c.map(m=>{const A=parseFloat(m.product.pret||0),p=parseInt(m.quantity||1),g=A*p;s+=g;const b=m.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(m.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${p}x</b> ${escapeHTML(m.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${g.toFixed(2)} Lei</span>
            </div>${b}`}).join(""),l=a[o%a.length];o++;const f=n==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(n)}`;i+=`
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
        `}return i}async function Q(t){if(!t)return;const e=t.detalii_comanda||[],i=String(t.numar_masa||"?"),a=parseFloat(t.total||0).toFixed(2),o=new Date(t.created_at),n=o.toLocaleDateString("ro-RO",{day:"2-digit",month:"2-digit",year:"numeric"}),c=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),s=e.some(p=>p.is_new===!0),r=s,l=s?e.filter(p=>p.is_new===!0):e,d={};l.forEach(p=>{const g=p.customer_name&&p.customer_name.trim()!==""?p.customer_name:"Masa";d[g]||(d[g]=[]),d[g].push(p)});let f="";for(const[p,g]of Object.entries(d)){const b=p==="Masa"?"👥 Împreună":`👤 ${p}`;let L=0;f+=`<div style="border-top: 1px dashed #000; padding: 4px 0 2px; margin-top: 4px;">
            <b>${b}</b>
        </div>`,g.forEach(h=>{var M,C;const S=parseInt(h.quantity||1),H=parseFloat(((M=h.product)==null?void 0:M.pret)||0),B=S*H;L+=B;const q=h.notes?`<br><small><i>* ${h.notes}</i></small>`:"";f+=`<div style="display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0;">
                <span>${S}x ${((C=h.product)==null?void 0:C.nume)||"Produs"}</span>
                <span>${B.toFixed(2)}</span>
            </div>${q}`}),f+=`<div style="text-align: right; font-size: 11px; font-weight: bold; padding-top: 2px;">Subtotal: ${L.toFixed(2)} Lei</div>`}const m=`
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
            <span>#${parseInt(t.id)}</span>
        </div>
        <div class="info" style="border-bottom: none; font-weight: normal;">
            <span>${n}</span>
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
    </html>`;if(await z()&&typeof qz<"u"&&qz.websocket.isActive())try{const p=w||await qz.printers.getDefault(),g=qz.configs.create(p),b=[{type:"pixel",format:"html",flavor:"plain",data:m}];await qz.print(g,b),console.log("✅ Bon printat 100% silențios via QZ Tray pe:",p);return}catch(p){console.warn("Eroare trimitere job QZ Tray, fallback la browser:",p)}Z(m)}function Z(t){let e=document.getElementById("receipt-print-frame");e||(e=document.createElement("iframe"),e.id="receipt-print-frame",e.style.cssText="position: fixed; top: -10000px; left: -10000px; width: 80mm; height: 0; border: none; visibility: hidden;",document.body.appendChild(e));const i=e.contentDocument||e.contentWindow.document;i.open(),i.write(t),i.close(),e.onload=()=>{try{e.contentWindow.focus(),e.contentWindow.print()}catch(a){console.warn("Printare automată blocată, se deschide fereastra manuală:",a);const o=window.open("","_blank","width=320,height=600");o&&(o.document.write(t),o.document.close(),o.onload=()=>{o.print(),o.onafterprint=()=>o.close()})}}}let w=null,k=!1,v=!1;function F(){if(k||typeof qz>"u")return;k=!0;const t=`-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;qz.security.setCertificatePromise(function(e,i){fetch("/digital-certificate.txt").then(function(a){return a.text()}).then(e).catch(function(){e(`-----BEGIN CERTIFICATE-----
MIIEpAIBAAKCAQEAyIlOlsiH0rt8+x5TodLsyrlhKhDKVKqtRIbxKgr+U2AdNaT7
fRAzDCaYvLYNgNxyjoBMBRt97UTIIUY35oHBVMq4AwVwJQEe81MxoLJpV8PerYsS
-----END CERTIFICATE-----`)})}),qz.security.setSignaturePromise(function(e){return function(i,a){try{var o=KEYUTIL.getKey(t),n=new KJUR.crypto.Signature({alg:"SHA512withRSA"});n.init(o),n.updateString(e);var c=n.sign();i(stob64(hextorstr(c)))}catch(s){console.error("QZ Tray: Eroare la semnare:",s),a(s)}}}),qz.websocket.setClosedCallbacks(function(e){console.warn("⚠️ QZ Tray: Conexiune pierdută. Se reconectează în 3 secunde...",e),I("Reconectare...","#f5b041"),setTimeout(E,3e3)}),console.log("✅ QZ Tray: Securitate configurată cu certificat digital")}async function E(){if(typeof qz>"u")return!1;if(qz.websocket.isActive())return await P(),I(`Conectat (${w||"Implicită"})`,"#2ecc71"),!0;if(v)return!1;v=!0;try{return F(),await qz.websocket.connect({retries:3,delay:1}),console.log("✅ QZ Tray: WebSocket conectat cu succes!"),await P(),I(`Conectat (${w||"Implicită"})`,"#2ecc71"),v=!1,!0}catch(t){return console.warn("❌ QZ Tray: Nu s-a putut conecta (aplicația QZ Tray pornită pe laptop?):",t.message||t),I("Deconectat","#f5b041"),v=!1,!1}}async function P(){if(qz.websocket.isActive())try{const t=await qz.printers.find();console.log("🖨️ QZ Tray: Imprimante detectate:",t),w=t.find(i=>i&&(i.toLowerCase().includes("samsung")||i.toLowerCase().includes("m2020")||i.toLowerCase().includes("m2026")))||await qz.printers.getDefault(),console.log("🖨️ QZ Tray: Imprimantă selectată:",w)}catch(t){console.warn("QZ Tray: Nu s-au putut detecta imprimantele:",t)}}async function z(){return typeof qz>"u"?(I("Lipsă SDK QZ","#e74c3c"),!1):await E()}function I(t,e){const i=document.getElementById("qz-status-badge");if(i){const a=e==="#2ecc71"?"46, 204, 113":e==="#e74c3c"?"231, 76, 60":"245, 176, 65";i.style.background=`rgba(${a}, 0.2)`,i.style.color=e,i.style.borderColor=e,i.innerHTML=`<i class="fas fa-print"></i> QZ Tray: ${t}`}}window.testQZPrint=async function(){if(await z()&&qz.websocket.isActive())try{const e=w||await qz.printers.getDefault(),i=qz.configs.create(e),o=[{type:"pixel",format:"html",flavor:"plain",data:`
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px dashed #000;">
                    <h2 style="margin: 0; font-size: 20px;">BELLA ROMA - PUB & PIZZERIE</h2>
                    <p style="margin: 5px 0;">Test Imprimare Silențioasă QZ Tray</p>
                    <hr style="border: 1px dashed #000; margin: 10px 0;">
                    <p style="font-weight: bold; font-size: 16px;">Imprimantă: ${e}</p>
                    <p style="font-size: 14px; color: green; font-weight: bold;">TEST REUȘIT 🚀</p>
                </div>
            `}];await qz.print(i,o),alert(`✅ Test trimis cu succes pe imprimanta: ${e}!
Bonul a fost printat SILENȚIOS fără fereastră de dialog!`)}catch(e){alert("❌ Eroare la printare prin QZ Tray: "+(e.message||e))}else alert(`❌ QZ Tray nu este pornit pe laptop.

1. Deschide aplicația QZ Tray pe Windows
2. Verifică iconița verde lângă ceas
3. Apasă din nou Test`)};window.printOrderReceipt=function(t){const e=u.find(i=>i.id===t);e&&(Q(e),e.status==="noua"&&window.updateOrderStatus(t,"in_preparare"))};N();setTimeout(z,1e3);setInterval(async()=>{typeof qz<"u"&&!qz.websocket.isActive()&&!v&&(console.log("🔄 QZ Tray: Keep-alive reconectare..."),await E())},1e4);
