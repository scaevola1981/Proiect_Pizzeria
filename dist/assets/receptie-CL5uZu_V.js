import"./supabase-DN6Li8NU.js";import"./security-Bbd6_ndX.js";import"./app-B9xdcTwm.js";let u=[];async function E(){const n=document.getElementById("login-overlay"),i=document.getElementById("btn-owner-login"),r=document.getElementById("btn-owner-logout"),t=document.getElementById("owner-email"),s=document.getElementById("owner-password"),e=document.getElementById("owner-login-error"),{authenticated:c}=await window.getAuthSession();if(c)n.style.display="none",h();else{const a=document.getElementById("auth-loading"),l=document.getElementById("login-form-content");a&&(a.style.display="none"),l&&(l.style.display="block")}async function o(){const a=t.value.trim(),l=s.value,p=window.checkLoginRateLimit();if(p.blocked){e.style.display="block",e.innerText=`Prea multe încercări. Așteptați ${p.remainingSeconds} secunde.`;return}if(!a||!l){e.style.display="block",e.innerText="Completați email-ul și parola.";return}if(i.disabled=!0,i.innerHTML='<i class="fas fa-spinner fa-spin"></i> Se autentifică...',(await window.loginAdmin(a,l)).success)window.resetLoginAttempts(),e.style.display="none",n.style.display="none",h();else{const d=window.recordFailedLogin();e.style.display="block",d.blocked?e.innerText="Cont blocat temporar. Așteptați 5 minute.":e.innerText=`Email sau parolă incorectă. Mai aveți ${d.attemptsLeft} încercări.`}i.disabled=!1,i.innerHTML='<i class="fas fa-sign-in-alt"></i> Autentificare'}i&&i.addEventListener("click",o),s&&s.addEventListener("keypress",a=>{a.key==="Enter"&&o()}),t&&t.addEventListener("keypress",a=>{a.key==="Enter"&&o()}),r&&r.addEventListener("click",async()=>{await window.supabaseClient.auth.signOut(),window.location.reload()})}async function h(){if(!window.supabaseClient)return;const{authenticated:n}=await window.getAuthSession();if(!n){document.getElementById("login-overlay").style.display="flex";const t=document.getElementById("auth-loading"),s=document.getElementById("login-form-content");t&&(t.style.display="none"),s&&(s.style.display="block");return}const{data:i,error:r}=await window.supabaseClient.from("comenzi").select("*").order("created_at",{ascending:!1});if(r){console.error("Eroare:",r);return}u=i||[],renderOwnerOrders(),window.supabaseClient.channel("owner_channel").on("postgres_changes",{event:"*",schema:"public",table:"comenzi"},t=>{if(t.eventType==="INSERT")u.unshift(t.new);else if(t.eventType==="UPDATE"){const s=u.findIndex(e=>e.id===t.new.id);s>-1&&(u[s]=t.new)}else t.eventType==="DELETE"&&(u=u.filter(s=>s.id!==t.old.id));renderOwnerOrders()}).subscribe()}window.renderOwnerOrders=function(){const n=document.getElementById("comenzi-container");if(!n)return;n.innerHTML="";const i=new Date;i.setHours(0,0,0,0);let r=0;if(u.length===0){n.innerHTML="<p>Nicio comandă înregistrată.</p>";return}u.forEach(e=>{const o=new Date(e.created_at)>=i;if(o&&e.status!=="finalizata"&&(r+=parseFloat(e.total)||0),e.status==="finalizata"||!o)return;const a=document.createElement("div");a.className="modern-card",e.status,e.status;let l=x(e.detalii_comanda);const p=new Date(e.created_at).toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),g=new Date(e.created_at).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"});let d=e.status.toUpperCase(),y="#f39c12";e.status==="noua"?(d="NOUĂ",y="#f39c12"):e.status==="in_preparare"?(d="ÎN PREPARARE",y="#2ecc71"):e.status==="servita"&&(d="SERVITĂ",y="#95a5a6");let f="";e.status==="noua"?f=`<button class="modern-card-btn" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'in_preparare')"><i class="fas fa-check"></i> Acceptă Comanda</button>`:e.status==="in_preparare"?f=`<button class="modern-card-btn success" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'servita')"><i class="fas fa-flag-checkered"></i> Marchează ca Servită</button>`:e.status==="servita"&&(f=`<button class="modern-card-btn success" style="background: #e74c3c;" onclick="window.updateOrderStatus(${parseInt(e.id)}, 'finalizata')"><i class="fas fa-broom"></i> Eliberează Masa ${escapeHTML(String(e.numar_masa))}</button>`),a.innerHTML=`
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
                    <span class="modern-tag">Ora ${escapeHTML(g)}</span>
                    <span class="modern-tag">${escapeHTML(p)}</span>
                    <span class="modern-tag" style="background: ${y}; color: white;">${escapeHTML(d)}</span>
                </div>
            </div>
            ${f}
        `,n.appendChild(a)});const t=u.filter(e=>new Date(e.created_at)>=i&&e.status!=="finalizata");if(t.length>0||r>0){const e=document.createElement("div");e.style.gridColumn="1 / -1",e.innerHTML=`<h2 style="margin-bottom:20px; color:#2ecc71; text-align: center;">Încasări Azi: ${r.toFixed(2)} Lei</h2>`,n.insertBefore(e,n.firstChild)}const s=document.getElementById("btn-incheiere-zi");s&&(s.style.display=t.length>0?"inline-block":"none"),window.renderHistory()};window.renderHistory=function(){const n=document.getElementById("history-content");if(!n)return;const i=new Date;i.setDate(i.getDate()-7);const r=u.filter(e=>new Date(e.created_at)>=i);let t="",s="";if(r.length===0)t='<p style="text-align:center; margin-top:20px;">Nu există comenzi în ultimele 7 zile.</p>';else{const e={};r.forEach(c=>{const o=new Date(c.created_at).toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});e[o]=(e[o]||0)+(parseFloat(c.total)||0)}),r.forEach(c=>{const o=new Date(c.created_at),a=o.toLocaleDateString("ro-RO",{weekday:"short",day:"numeric",month:"short"}),l=o.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"}),p=o.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(p!==s){const d=e[p]?e[p].toFixed(2):"0.00";t+=`<div style="grid-column: 1 / -1; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                             <h3 style="color: #f1c40f; text-transform: capitalize; margin: 0;">${escapeHTML(p)}</h3>
                             <h3 style="color: #2ecc71; margin: 0; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 8px;">Total Zi: ${d} Lei</h3>
                         </div>`,s=p}let g=x(c.detalii_comanda);t+=`
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
                            ${g}
                        </div>
                        <div class="modern-card-tags">
                            <span class="modern-tag">Ora ${escapeHTML(l)}</span>
                            <span class="modern-tag">${escapeHTML(a)}</span>
                        </div>
                    </div>
                </div>
            `})}n.innerHTML=t};window.showEndDayModal=function(){const n=document.getElementById("end-day-modal"),i=document.getElementById("end-day-summary"),r=new Date;r.setHours(0,0,0,0);const t=u.filter(a=>new Date(a.created_at)>=r),s=t.filter(a=>a.status==="noua"||a.status==="in_preparare"),e=t.filter(a=>a.status==="servita"),c=t.reduce((a,l)=>a+(parseFloat(l.total)||0),0),o=t.length;i.innerHTML=`
        <p style="color: #f5b041; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">Sumar Zi de Lucru</p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-receipt" style="width: 20px;"></i> Total comenzi azi: <strong>${o}</strong></p>
        <p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-check-circle" style="width: 20px;"></i> Comenzi servite: <strong style="color: #2ecc71;">${e.length}</strong></p>
        ${s.length>0?`<p style="color: #e2e8f0; margin-bottom: 5px;"><i class="fas fa-exclamation-circle" style="width: 20px;"></i> Comenzi încă active: <strong style="color: #e74c3c;">${s.length}</strong></p>`:""}
        <p style="color: #2ecc71; font-size: 1.3rem; font-weight: bold; margin-top: 10px;"><i class="fas fa-cash-register" style="width: 20px;"></i> Încasări: ${c.toFixed(2)} Lei</p>
    `,n.classList.remove("hidden")};window.closeEndDayModal=function(){document.getElementById("end-day-modal").classList.add("hidden")};window.confirmEndDay=async function(){const{authenticated:n}=await window.getAuthSession();if(!n){alert("Sesiunea a expirat. Autentificați-vă din nou."),window.location.reload();return}const i=new Date;i.setDate(i.getDate()-7);try{await window.supabaseClient.from("comenzi").delete().lt("created_at",i.toISOString())}catch(o){console.error("Eroare la curățarea istoricului vechi:",o)}const r=new Date;r.setHours(0,0,0,0);const t=u.filter(o=>new Date(o.created_at)>=r&&o.status!=="finalizata");if(t.length===0){alert("Nu există comenzi active de finalizat."),window.closeEndDayModal();return}let s=0;for(const o of t){const{error:a}=await window.supabaseClient.from("comenzi").update({status:"finalizata"}).eq("id",o.id);a&&(console.error("Eroare la finalizare comanda #"+o.id,a),s++)}window.closeEndDayModal();const e=document.getElementById("cb-force-close");let c=!1;if(e&&e.checked)try{await window.supabaseClient.from("setari").upsert({key:"store_force_close",value:"true"},{onConflict:"key"}),c=!0}catch(o){console.error("Nu s-a putut forța închiderea:",o)}if(s===0){const o=u.filter(l=>new Date(l.created_at)>=r).reduce((l,p)=>l+(parseFloat(p.total)||0),0);let a=c?`

⚠️ NOTĂ: Preluarea comenzilor a fost blocată (Forțare Închidere). Nu uitați să debifați din Admin mâine!`:"";alert(`✅ Ziua de muncă a fost închisă cu succes!

Total încasări: ${o.toFixed(2)} Lei
Comenzi finalizate: ${t.length}

Toate comenzile au fost mutate în Istoric.${a}`)}else alert(`Ziua a fost închisă, dar ${s} comenzi au avut erori. Verificați istoricul.`)};window.toggleHistory=n=>{const i=document.getElementById("receptie-panel"),r=document.getElementById("istoric-panel");n?(i.style.display="none",r.style.display="block"):(i.style.display="block",r.style.display="none")};let w;const m=document.getElementById("install-app-btn");function v(){const n=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0;m&&(n?m.style.display="none":m.style.display="inline-flex")}v();window.addEventListener("beforeinstallprompt",n=>{n.preventDefault(),w=n,v()});window.addEventListener("appinstalled",()=>{console.log("🎉 PWA Recepție instalată cu succes!"),m&&(m.style.display="none")});m&&m.addEventListener("click",async()=>{if(w){w.prompt();const{outcome:n}=await w.userChoice;console.log(`PWA install choice: ${n}`),n==="accepted"&&(m.style.display="none"),w=null}else alert(`Pentru a instala aplicația pe ecranul principal:

• Pe iPhone (Safari): Apasă Partajare ⎋ -> Adaugă pe ecranul principal ➕
• Pe iPhone (Chrome): Apasă Partajare ⎋ sus -> Adaugă pe ecranul principal ➕
• Pe Android / PC (Chrome): Apasă Meniu ⁝ -> Instalează aplicația`)});function x(n){if(!n||!Array.isArray(n)||n.length===0)return'<p style="color: #cbd5e1; font-style: italic;">Fără detalii</p>';const i={};n.forEach(e=>{const c=e.customer_name&&e.customer_name.trim()!==""?e.customer_name:"Masa";i[c]||(i[c]=[]),i[c].push(e)});let r="";const t=["#f5b041","#3498db","#9b59b6","#2ecc71","#e67e22","#1abc9c"];let s=0;for(const[e,c]of Object.entries(i)){let o=0;const a=c.map(d=>{const y=parseFloat(d.product.pret||0),f=parseInt(d.quantity||1),b=y*f;o+=b;const L=d.notes?`<br><small style="color: #e74c3c; font-weight: bold;">* Observații: ${escapeHTML(d.notes)}</small>`:"";return`<div style="color: #fff; font-size: 0.9rem; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span><b>${f}x</b> ${escapeHTML(d.product.nume)}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${b.toFixed(2)} Lei</span>
            </div>${L}`}).join(""),l=t[s%t.length];s++;const g=e==="Masa"?"👥 Comandă Împreună":`👤 ${escapeHTML(e)}`;r+=`
            <div style="margin-bottom: 10px; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; border-left: 4px solid ${l}; border: 1px solid rgba(255,255,255,0.15); border-left-width: 4px; border-left-color: ${l};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <span style="color: ${l}; font-weight: 800; font-size: 0.95rem;">
                        ${g}
                    </span>
                    <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #2ecc71;">
                        De plată: ${o.toFixed(2)} Lei
                    </span>
                </div>
                ${a}
            </div>
        `}return r}E();
