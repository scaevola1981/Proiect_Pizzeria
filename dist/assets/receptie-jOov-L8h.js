import"./supabase-DN6Li8NU.js";import"./security-Bbd6_ndX.js";import"./app-B9xdcTwm.js";let p=[];async function $(){const o=document.getElementById("login-overlay"),i=document.getElementById("btn-owner-login"),c=document.getElementById("btn-owner-logout"),a=document.getElementById("owner-email"),r=document.getElementById("owner-password"),e=document.getElementById("owner-login-error"),{authenticated:s}=await window.getAuthSession();if(s)o.style.display="none",v();else{const t=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");t&&(t.style.display="none"),l&&(l.style.display="block")}async function n(){const t=a.value.trim(),l=r.value,d=window.checkLoginRateLimit();if(d.blocked){e.style.display="block",e.innerText=`Prea multe încercări. Așteptați ${d.remainingSeconds} secunde.`;return}if(!t||!l){e.style.display="block",e.innerText="Completați email-ul și parola.";return}if(i.disabled=!0,i.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(t,l)).success)window.resetLoginAttempts(),e.style.display="none",o.style.display="none",v();else{const m=window.recordFailedLogin();e.style.display="block",m.blocked?e.innerText="Cont blocat temporar. Așteptați 5 minute.":e.innerText=`Email sau parolă incorectă. Mai aveți ${m.attemptsLeft} încercări.`}i.disabled=!1,i.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}i&&i.addEventListener("click",n),r&&r.addEventListener("keypress",t=>{t.key==="Enter"&&n()}),a&&a.addEventListener("keypress",t=>{t.key==="Enter"&&n()}),c&&c.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function v(){if(!window.supabaseClient)return;const{authenticated:o}=await window.getAuthSession();if(!o){document.getElementById("login-overlay").style.display="flex";const a=document.getElementById("auth-loading"),r=document.getElementById("login-form-content");a&&(a.style.display="none"),r&&(r.style.display="block");return}const{data:i,error:c}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(c){console.error("Eroare:",c);return}p=i||[],renderOwnerOrders(),window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},a=>{if(a.eventType==="INSERT")p.unshift(a.new);else if(a.eventType==="UPDATE"){const r=p.findIndex(e=>e.id===a.new.id);r>-1&&(p[r]=a.new)}else a.eventType==="DELETE"&&(p=p.filter(r=>r.id!==a.old.id));renderOwnerOrders()}).subscribe()}window.renderOwnerOrders=function(){const o=document.getElementById("comenzi-container");if(!o)return;o.innerHTML="";const i=new Date;i.setHours(0,0,0,0);let c=0;if(p.length===0){o.innerHTML="<p>Nicio comandă înregistrată.</p>";return}p.forEach(e=>{const n=new Date(e.created_at)>=i;if(n&&e.status!=="finalizata"&&(c+=parseFloat(e.total)||0),e.status==="finalizata"||!n)return;const t=document.createElement("div");t.className="modern-card",e.status,e.status;let l=L(e.detalii_comanda);const d=new Date(e.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),y=new Date(e.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let m=e.status.toUpperCase(),u="#f39c12";e.status==="noua"?(m="NOUĂ",u="#f39c12"):e.status==="in_preparare"?(m="ÎN PREPARARE",u="#2ecc71"):e.status==="servita"&&(m="SERVITĂ",u="#95a5a6");let g="";e.status==="noua"?g=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:e.status==="in_preparare"?g=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:e.status==="servita"&&(g=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(e.numar_masa))}</button>`),t.innerHTML=`
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
                    <span class="modern-tag" style="background: ${u}; color: white;">${escapeHTML(m)}</span>
                </div>
            </div>
            ${g}
        `,o.appendChild(t)});const a=p.filter(e=>new Date(e.created_at)>=i&&e.status!=="finalizata");if(a.length>0||c>0){const e=document.createElement("div");e.style.gridColumn="1 / -1",e.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${c.toFixed(2)} Lei</h2>`,o.insertBefore(e,o.firstChild)}const r=document.getElementById("btn-incheiere-zi");r&&(r.style.display=a.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const o=document.getElementById("history-content");if(!o)return;const i=new Date;i.setDate(i.getDate()-7);const c=p.filter(e=>new Date(e.created_at)>=i);let a="",r="";if(c.length===0)a='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const e={};c.forEach(s=>{const n=new Date(s.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});e[n]=(e[n]||0)+(parseFloat(s.total)||0)}),c.forEach(s=>{const n=new Date(s.created_at),t=n.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=n.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),d=n.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(d!==r){const m=e[d]?e[d].toFixed(2):"0.00";a+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(d)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${m} Lei</h3>
                         </div>`,r=d}let y=L(s.detalii_comanda);a+=`
                <div class="modern-card history-card">
                    <div class="modern-card-header" style="background: url('/img/bella-roma.png') center/cover; position: relative;">
                        <div class="modern-card-tab">Masa ${escapeHTML(String(s.numar_masa))}</div>
                        <span class="modern-card-price" style="position: absolute; bottom: 10px; right: 10px;">${escapeHTML(String(s.total))} Lei</span>
                    </div>
                    <div class="modern-card-body">
                        <div class="modern-card-title-row">
                            <h3>Comanda #${parseInt(s.id)}</h3>
                        </div>
                        <div class="modern-card-desc">
                            ${y}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${escapeHTML(l)}</span>
                            <span class="modern-tag">${escapeHTML(t)}</span>
                        </div>
                    </div>
                </div>
            `})}o.innerHTML=a};window.showEndDayModal=function(){const o=document.getElementById("end-day-modal"),i=document.getElementById("end-day-summary"),c=new Date;c.setHours(0,0,0,0);const a=p.filter(t=>new Date(t.created_at)>=c),r=a.filter(t=>t.status==="noua"||t.status==="in_preparare"),e=a.filter(t=>t.status==="servita"),s=a.reduce((t,l)=>t+(parseFloat(l.total)||0),0),n=a.length;i.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${n}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${e.length}</strong></p>
        ${r.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${r.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${s.toFixed(2)} Lei</p>
    `,o.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:o}=await window.getAuthSession();if(!o){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const i=new Date;i.setDate(i.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",i.toISOString())}catch(n){console.error("Eroare la curățarea istoricului vechi:",n)}const c=new Date;c.setHours(0,0,0,0);const a=p.filter(n=>new Date(n.created_at)>=c&&n.status!=="finalizata");if(a.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let r=0;for(const n of a){const{error:t}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",n.id);t&&(console.error("Eroare la finalizare comanda #"+n.id,t),r++)}window.closeEndDayModal();const e=document.getElementById("cb-force-close");let s=!1;if(e&&e.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),s=!0}catch(n){console.error("Nu s-a putut forța închiderea:",n)}if(r===0){const n=p.filter(l=>new Date(l.created_at)>=c).reduce((l,d)=>l+(parseFloat(d.total)||0),0);let t=s?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${n.toFixed(2)} Lei
Comenzi finalizate: ${a.length}

Toate comenzile au fost mutate în Istoric.${t}`)}else alert(`Ziua a fost închisă, dar ${r} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=o=>{const i=document.getElementById("receptie-panel"),c=document.getElementById("istoric-panel");o?(i.style.display="none",c.style.display="block"):(i.style.display="block",c.style.display="none")};let w;const f=document.getElementById("install-app-btn");function x(){const o=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;f&&(o?f.style.display="none":f.style.display="inline-flex")}x();window.addEventListener("beforeinstallprompt",o=>{o.preventDefault(),w=o,x()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),f&&(f.style.display="none")});f&&f.addEventListener("click",async()=>{if(w){w.prompt();const{outcome:o}=await w.userChoice;console.log(`PWA install choice: ${o}`),o==="accepted"&&(f.style.display="none"),w=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function L(o){if(!o||!Array.isArray(o)||o.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const i={};o.forEach(s=>{const n=s.customer_name&&s.customer_name.trim()!==""?s.customer_name:"Masa";i[n]||(i[n]=[]),i[n].push(s)});const c=Object.keys(i);if(c.length===1&&c[0]==="Masa")return i.Masa.map(s=>{const n=parseFloat(s.product.pret||0),t=parseInt(s.quantity||1),l=n*t,d=s.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(s.notes)}</small>`:"";return`<div style="margin-bottom: 6px; font-size: 0.95rem; color: #fff;">
                <b style="color: #f5b041;">${t}x</b> ${escapeHTML(s.product.nume)} 
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">(${l.toFixed(2)} Lei)</span>
                ${d}
            </div>`}).join("");let a="";const r=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let e=0;for(const[s,n]of Object.entries(i)){let t=0;const l=n.map(u=>{const g=parseFloat(u.product.pret||0),b=parseInt(u.quantity||1),h=g*b;t+=h;const E=u.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(u.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${b}x</b> ${escapeHTML(u.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${h.toFixed(2)} Lei</span>
            </div>${E}`}).join(""),d=r[e%r.length];e++;const m=s==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(s)}`;a+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${d}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${d};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${d}; font-weight: 800; font-size: 0.95rem;">
                        ${m}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${t.toFixed(2)} Lei
                    </span>
                </div>
                ${l}
            </div>
        `}return a}$();
