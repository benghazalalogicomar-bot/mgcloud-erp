import React, { useState, useCallback, useEffect, useRef } from "react";
const DOC_CFG = {
"ach-devis":    {titre:"Demandes de Prix",   tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#7c3aed",isAchat:true, stockImpact:null,    statuts:["Brouillon","Envoyé","Accepté","Annulé"]},
"ach-bc":       {titre:"Bons de Commande",   tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#1a56db",isAchat:true, stockImpact:null,    statuts:["Brouillon","Confirmé","En cours","Reçu","Annulé"]},
"ach-proforma": {titre:"Factures Pro Forma", tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#8b5cf6",isAchat:true, stockImpact:null,    statuts:["Brouillon","Envoyée","Confirmée","Annulée"],isProforma:true},
"ach-bl":       {titre:"Bons de Livraison",  tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#0891b2",isAchat:true, stockImpact:"entree",statuts:["Brouillon","Validé","Annulé"]},
"ach-br":       {titre:"Bons de Retour",     tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#dc2626",isAchat:true, stockImpact:"sortie",statuts:["Brouillon","Validé","Annulé"]},
"ach-facture":  {titre:"Factures Achat",     tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#d97706",isAchat:true, stockImpact:null,    statuts:["Brouillon","Validée","Payée","Annulée"]},
"ach-avoir":    {titre:"Avoirs Achat",       tiers:"fournisseurs",tiersLabel:"Fournisseur",color:"#059669",isAchat:true, stockImpact:null,    statuts:["Brouillon","Validé","Annulé"]},
"vte-devis":    {titre:"Devis",              tiers:"clients",     tiersLabel:"Client",     color:"#7c3aed",isAchat:false,stockImpact:null,    statuts:["Brouillon","Envoyé","Accepté","Refusé","Annulé"]},
"vte-bc":       {titre:"Bons de Commande",   tiers:"clients",     tiersLabel:"Client",     color:"#1a56db",isAchat:false,stockImpact:null,    statuts:["Brouillon","Confirmé","En préparation","Expédié","Annulé"]},
"vte-proforma": {titre:"Factures Pro Forma", tiers:"clients",     tiersLabel:"Client",     color:"#8b5cf6",isAchat:false,stockImpact:null,    statuts:["Brouillon","Envoyée","Confirmée","Annulée"],isProforma:true},
"vte-bl":       {titre:"Bons de Livraison",  tiers:"clients",     tiersLabel:"Client",     color:"#0891b2",isAchat:false,stockImpact:"sortie",statuts:["Brouillon","Validé","Annulé"]},
"vte-br":       {titre:"Bons de Retour",     tiers:"clients",     tiersLabel:"Client",     color:"#dc2626",isAchat:false,stockImpact:"entree",statuts:["Brouillon","Validé","Annulé"]},
"vte-facture":  {titre:"Factures Vente",     tiers:"clients",     tiersLabel:"Client",     color:"#d97706",isAchat:false,stockImpact:null,    statuts:["Brouillon","Validée","Payée","Annulée"]},
"vte-avoir":    {titre:"Avoirs Vente",       tiers:"clients",     tiersLabel:"Client",     color:"#059669",isAchat:false,stockImpact:null,    statuts:["Brouillon","Validé","Annulé"]},
};
const STATUTS_STOCK = ["Validé","Validée","Reçu","Payée"];
const CIRCUIT = {
"ach-devis":   {next:"ach-bc",       lbl:"Générer BC Achat"},
"ach-bc":      {next:"ach-bl",       lbl:"Générer BL Achat"},
"ach-bl":      {next:"ach-proforma", lbl:"Générer Pro Forma Achat"},
"ach-proforma":{next:"ach-facture",  lbl:"Générer Facture Achat"},
"ach-facture": {next:"ach-avoir",    lbl:"Générer Avoir Achat"},
"vte-devis":   {next:"vte-bc",       lbl:"Générer BC Vente"},
"vte-bc":      {next:"vte-bl",       lbl:"Générer BL Vente"},
"vte-bl":      {next:"vte-proforma", lbl:"Générer Pro Forma Vente"},
"vte-proforma":{next:"vte-facture",  lbl:"Générer Facture Vente"},
"vte-facture": {next:"vte-avoir",    lbl:"Générer Avoir Vente"},
};
const COMPTEURS_DEF = {
"ach-devis":    {prefix:"DP-",  sep:"-",annee:true,seq:1,pad:4,label:"Demandes de Prix",   color:"#7c3aed"},
"ach-bc":       {prefix:"BC-",  sep:"-",annee:true,seq:1,pad:4,label:"BC Achat",             color:"#1a56db"},
"ach-proforma": {prefix:"PFA-", sep:"-",annee:true,seq:1,pad:4,label:"Pro Forma Achat",      color:"#8b5cf6"},
"ach-bl":       {prefix:"BL-",  sep:"-",annee:true,seq:1,pad:4,label:"BL Achat",             color:"#0891b2"},
"ach-br":       {prefix:"BR-",  sep:"-",annee:true,seq:1,pad:4,label:"BR Achat",             color:"#dc2626"},
"ach-facture":  {prefix:"FA-",  sep:"-",annee:true,seq:1,pad:4,label:"Facture Achat",        color:"#d97706"},
"ach-avoir":    {prefix:"AA-",  sep:"-",annee:true,seq:1,pad:4,label:"Avoir Achat",          color:"#059669"},
"vte-devis":    {prefix:"DV-",  sep:"-",annee:true,seq:1,pad:4,label:"Devis",                color:"#7c3aed"},
"vte-bc":       {prefix:"BCV-", sep:"-",annee:true,seq:1,pad:4,label:"BC Vente",             color:"#1a56db"},
"vte-proforma": {prefix:"PFV-", sep:"-",annee:true,seq:1,pad:4,label:"Pro Forma Vente",      color:"#8b5cf6"},
"vte-bl":       {prefix:"BLV-", sep:"-",annee:true,seq:1,pad:4,label:"BL Vente",            color:"#0891b2"},
"vte-br":       {prefix:"BRV-", sep:"-",annee:true,seq:1,pad:4,label:"BR Vente",            color:"#dc2626"},
"vte-facture":  {prefix:"FV-",  sep:"-",annee:true,seq:1,pad:4,label:"Facture Vente",       color:"#d97706"},
"vte-avoir":    {prefix:"AV-",  sep:"-",annee:true,seq:1,pad:4,label:"Avoir Vente",         color:"#059669"},
"client":     {prefix:"C",   sep:"", annee:false,seq:1,pad:4,label:"Clients",          color:"#1a56db"},
"fournisseur":{prefix:"F",   sep:"", annee:false,seq:1,pad:4,label:"Fournisseurs",     color:"#7c3aed"},
"article":    {prefix:"ART-",sep:"", annee:false,seq:1,pad:4,label:"Articles",         color:"#0891b2"},
};
const INIT = {
compteurs:COMPTEURS_DEF,
documents:{
"ach-devis":[],"ach-bc":[],"ach-proforma":[],"ach-bl":[],"ach-br":[],"ach-facture":[],"ach-avoir":[],
"vte-devis":[],"vte-bc":[],"vte-proforma":[],"vte-bl":[],"vte-br":[],"vte-facture":[],"vte-avoir":[],
},
customFields:{client:[],fournisseur:[],article:[]},
utilisateurs:[
{id:"USR01",nom:"Administrateur",login:"admin",email:"",role:"ROLE01",agences:[],actif:true},
],
roles:[
{id:"ROLE01",nom:"Administrateur",couleur:"#7c3aed"},
{id:"ROLE02",nom:"Responsable Achat",couleur:"#1a56db"},
{id:"ROLE03",nom:"Commercial",couleur:"#0891b2"},
],
famillesClient:[],sousFamillesClient:[],clients:[],
famillesFournisseur:[],sousFamillesFournisseur:[],fournisseurs:[],
famillesArticle:[],sousFamillesArticle:[],articles:[],
agences:[],depots:[],stockDepots:{},
reglements:[],reglementsAchat:[],reglementsVente:[],
mouvementsStock:[],
champsCalcules:[],
champsEnteteDoc:[],
seriesNum:[],
seriesDoc:[],
compteursSeries:{},
planRenames:{},
commerciaux:[],
caisses:[],
banques:[],
mouvementsTreso:[],
// Taux TVA configurables
tauxTVA:[
{id:"tva0", taux:0,  label:"Exonéré (0%)",      actif:true},
{id:"tva7", taux:7,  label:"Taux réduit (7%)",   actif:true},
{id:"tva10",taux:10, label:"Taux réduit (10%)",  actif:true},
{id:"tva14",taux:14, label:"Taux intermédiaire (14%)", actif:true},
{id:"tva20",taux:20, label:"Taux normal (20%)",  actif:true},
],
// Tarifs commerciaux
tarifsCommerciaux:[],
// Plan comptable marocain
planComptable:[],
societe:{
raisonSociale:"",nomCommercial:"",formeJuridique:"SARL",
adresse:"",ville:"",cp:"",tel:"",email:"",
ice:"",rc:"",if_:"",patente:"",
couleurPrincipale:"#1a2332",couleurAccent:"#e8a020",
piedPage:"",mentionsLegales:"",
},
};
const MENU = [
{id:"referentiels",label:"Referentiels",icon:"🗂",droit:"clients",children:[
{id:"fam-clients",           label:"Familles Clients",         icon:"👥", droit:"clients"},
{id:"sous-fam-clients",      label:"Sous-familles Clients",    icon:"👤", droit:"clients"},
{id:"clients",               label:"Clients",                  icon:"🏪", droit:"clients"},
{id:"fam-fournisseurs",      label:"Familles Fournisseurs",    icon:"🏭", droit:"fournisseurs"},
{id:"sous-fam-fournisseurs", label:"Sous-familles Fourn.",     icon:"🔧", droit:"fournisseurs"},
{id:"fournisseurs",          label:"Fournisseurs",             icon:"🚚", droit:"fournisseurs"},
{id:"fam-articles",          label:"Familles Articles",        icon:"📦", droit:"articles"},
{id:"sous-fam-articles",     label:"Sous-familles Articles",   icon:"📫", droit:"articles"},
{id:"articles",              label:"Articles",                 icon:"🔩", droit:"articles"},
{id:"commerciaux",           label:"Commerciaux & Collaborateurs",icon:"👔",droit:"administration"},
]},
{id:"stock",label:"Stock",icon:"📊",droit:"stock",children:[
{id:"stock-global",     label:"Stock global",         icon:"📦", droit:"stock"},
{id:"stock-etat",       label:"État de stock",        icon:"📋", droit:"stock"},
{id:"stock-inventaire", label:"Saisie / Inventaire",  icon:"✏️",droit:"stock"},
{id:"stock-agences",    label:"Stock par agence",     icon:"🏬", droit:"stock"},
{id:"stock-article",    label:"Fiche stock article",  icon:"🔍", droit:"stock"},
{id:"stock-mvt",        label:"Mouvements",           icon:"🔄", droit:"stock"},
{id:"stock-alertes",    label:"Alertes",              icon:"⚠️",droit:"stock"},
]},
{id:"achats",label:"Achats",icon:"🛒",droit:"achats",children:[
{id:"ach-devis",   label:"Demandes de Prix",    icon:"📋", droit:"achats"},
{id:"ach-bc",      label:"Bons de Commande",    icon:"📝", droit:"achats"},
{id:"ach-bl",      label:"Bons de Livraison",   icon:"📬", droit:"achats"},
{id:"ach-br",      label:"Bons de Retour",      icon:"↩️",droit:"achats"},
{id:"ach-proforma",label:"Factures Pro Forma",  icon:"🔖", droit:"achats"},
{id:"ach-facture", label:"Factures Achat",      icon:"🧾", droit:"achats"},
{id:"ach-avoir",   label:"Avoirs Achat",        icon:"💳", droit:"achats"},
{id:"regl-achat",  label:"Règlements Achat",    icon:"💰", droit:"reglements"},
]},
{id:"ventes",label:"Ventes",icon:"💰",droit:"ventes",children:[
{id:"vte-devis",   label:"Devis",               icon:"📋", droit:"ventes"},
{id:"vte-bc",      label:"Bons de Commande",    icon:"📝", droit:"ventes"},
{id:"vte-bl",      label:"Bons de Livraison",   icon:"📬", droit:"ventes"},
{id:"vte-br",      label:"Bons de Retour",      icon:"↩️",droit:"ventes"},
{id:"vte-proforma",label:"Factures Pro Forma",  icon:"🔖", droit:"ventes"},
{id:"vte-facture", label:"Factures Vente",      icon:"🧾", droit:"ventes"},
{id:"vte-avoir",   label:"Avoirs Vente",        icon:"💳", droit:"ventes"},
{id:"regl-vente",  label:"Règlements Vente",    icon:"💰", droit:"reglements"},
]},
{id:"tresorerie",label:"Trésorerie",icon:"🏦",droit:"reglements",children:[
{id:"treso-caisses",   label:"Caisses",             icon:"💰", droit:"reglements"},
{id:"treso-banques",   label:"Banques",             icon:"🏦", droit:"reglements"},
{id:"treso-mvt",       label:"Mouvements",          icon:"🔄", droit:"reglements"},
{id:"treso-rapproch",  label:"Rapprochement",       icon:"🔍", droit:"reglements"},
]},
{id:"statistiques",label:"Statistiques",icon:"📈",droit:"statistiques",children:[
{id:"stats-ventes",        label:"Statistiques Ventes",       icon:"📈", droit:"statistiques"},
{id:"stats-achats",        label:"Statistiques Achats",        icon:"📉", droit:"statistiques"},
{id:"stats-par-client",    label:"Analyse par Client",         icon:"👤", droit:"statistiques"},
{id:"stats-par-fourn",     label:"Analyse par Fournisseur",    icon:"🏭", droit:"statistiques"},
{id:"stats-articles",      label:"Top Articles",               icon:"🔩", droit:"statistiques"},
{id:"stats-clients",       label:"Top Clients",                icon:"🏪", droit:"statistiques"},
{id:"balance-clients",     label:"Balance Clients",            icon:"⚖️",droit:"statistiques"},
{id:"balance-fournisseurs",label:"Balance Fournisseurs",       icon:"⚖️",droit:"statistiques"},
{id:"grand-livre",         label:"Grand Livre Comptable",      icon:"📒", droit:"statistiques"},
]},
{id:"administration",label:"Administration",icon:"⚙️",droit:"administration",children:[
{id:"sauvegarde",        label:"Sauvegarde & Restauration",icon:"💾",droit:"administration"},
{id:"journal",          label:"Journal des mouvements",   icon:"📋",droit:"administration"},
{id:"agences-admin",    label:"Agences & Dépôts",        icon:"🏬", droit:"administration"},
{id:"tarifs-admin",     label:"Tarifs commerciaux",       icon:"🏷️",droit:"administration"},
{id:"tva-admin",        label:"Taux TVA",                 icon:"💹", droit:"administration"},
{id:"plan-comptable",   label:"Plan comptable",           icon:"📒", droit:"administration"},
{id:"champs-calcules",  label:"Champs calculés",          icon:"🧮", droit:"administration"},
{id:"champs-entete-doc",label:"Champs en-tête docs",      icon:"📋", droit:"administration"},
{id:"numerotation",     label:"Numérotation",             icon:"🔢", droit:"administration"},
{id:"societe",          label:"Paramètres Société",       icon:"⚙️",droit:"administration"},
{id:"utilisateurs",     label:"Utilisateurs",             icon:"👨‍💼",droit:"administration"},
]},
];
const uid       = (p="X") => `${p}-${Date.now()}-${Math.floor(Math.random()*9999)}`;
const today     = ()      => new Date().toISOString().split("T")[0];

// ── Export CSV/Excel universel ─────────────────────────────
function exportCSV(rows,filename){
if(!rows||!rows.length)return;
const headers=Object.keys(rows[0]);
const esc=(v)=>{
if(v===null||v===undefined)return "";
const s=String(v).replace(/"/g,'""');
return (s.includes(",")||s.includes("\n")||s.includes('"'))?`"${s}"`:s;
};
const bom="\uFEFF";
const csv=bom+[headers.map(esc).join(","),...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
const a=document.createElement("a");
a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
a.download=(filename||"export")+".csv";
a.click();
}
function copyToExcel(headers,rows){
if(!rows||!rows.length)return false;
const lines=[
headers.join("\t"),
...rows.map(r=>headers.map((h,i)=>{
const v=Array.isArray(r)?r[i]:r[h];
return(v===null||v===undefined)?"":String(v).replace(/\t/g," ").replace(/\n/g," ");
}).join("\t"))
];
const text=lines.join("\n");
try{
if(navigator.clipboard&&window.isSecureContext){
navigator.clipboard.writeText(text);
}else{
const ta=document.createElement("textarea");
ta.value=text;ta.style.position="fixed";ta.style.opacity="0";
document.body.appendChild(ta);ta.select();
document.execCommand("copy");
document.body.removeChild(ta);
}
return true;
}catch(e){return false;}
}

// Hook sélection de lignes
function useRowSelect(){
const [sel,setSel]=useState(new Set());
const toggle=(id)=>setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
const toggleAll=(ids)=>setSel(p=>p.size===ids.length&&ids.every(id=>p.has(id))?new Set():new Set(ids));
const clear=()=>setSel(new Set());
const isAll=(ids)=>ids.length>0&&ids.every(id=>sel.has(id));
return{sel,toggle,toggleAll,clear,isAll};
}

// Barre sélection + copie Excel
function SelectBar({sel,allIds,onToggleAll,onCopy,onClear}){
const allSel=allIds.length>0&&allIds.every(id=>sel.has(id));
const [flash,setFlash]=useState(false);
const doCopy=()=>{
const ok=onCopy();
if(ok){setFlash(true);setTimeout(()=>{setFlash(false);onClear();},2000);}
};
return(
<div style={{display:"flex",alignItems:"center",gap:6}}>
<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:11,color:"#64748b",userSelect:"none"}}>
<input type="checkbox" checked={allSel} onChange={()=>onToggleAll(allIds)}
style={{accentColor:"#1a56db",width:14,height:14}}/>
<span>Tout</span>
</label>
{sel.size>0&&(
<>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",fontSize:11,fontWeight:700}}>
{sel.size} ligne{sel.size>1?"s":""}
</span>
<button onClick={doCopy}
style={{...S.btnSm,background:flash?"#f0fdf4":"#fff",color:flash?"#16a34a":"#1a56db",
borderColor:flash?"#86efac":"#c7d2fe",fontSize:11,display:"flex",alignItems:"center",gap:3,fontWeight:700}}>
{flash?"✅ Copié dans Excel !":"📋 Copier Excel"}
</button>
<button onClick={onClear} style={{...S.btnSm,fontSize:10,color:"#94a3b8"}} title="Désélectionner">✕</button>
</>
)}
</div>
);
}
const fmt       = (n)     => Number(n||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct       = (n)     => Number(n||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
const ligneNetHT = (l) => (+l.qte||0) * (+l.prix||0) * (1 - (+l.remise||0)/100);
const ligneTVA   = (l) => ligneNetHT(l) * (+l.tva||0)/100;
const ligneTTC   = (l) => ligneNetHT(l) + ligneTVA(l);
const docCalc = (lignes=[], remiseGlobale=0) => {
const brut      = lignes.reduce((s,l)=>s+(+l.qte||0)*(+l.prix||0),0);
const remLignes = lignes.reduce((s,l)=>s+(+l.qte||0)*(+l.prix||0)*(+l.remise||0)/100,0);
const netHT     = brut - remLignes;
const remGlob   = netHT * (+remiseGlobale||0)/100;
const baseHT    = netHT - remGlob;
const tvaMap = {};
lignes.forEach(l=>{
const base = ligneNetHT(l) * (1-(+remiseGlobale||0)/100);
const taux = +l.tva||20;
if(!tvaMap[taux]) tvaMap[taux]={taux,base:0,montant:0};
tvaMap[taux].base    += base;
tvaMap[taux].montant += base * taux/100;
});
const totalTVA = Object.values(tvaMap).reduce((s,t)=>s+t.montant,0);
const ttc      = baseHT + totalTVA;
return { brut, remLignes, netHT, remGlob, baseHT, tvaMap, totalTVA, ttc };
};
const newLigne  = () => ({id:uid("L"),articleId:"",article:"",designation:"",unite:"",qte:1,prix:0,remise:0,tva:20,depotId:"",emplacement:"",note:""});
const genNum    = (c,o=0) => { const s=String((c.seq||1)+o).padStart(c.pad||4,"0"); return c.annee?`${c.prefix}${new Date().getFullYear()}${c.sep}${s}`:`${c.prefix}${s}`; };
const avatarC   = (n="")  => ["#7c3aed","#1a56db","#0891b2","#d97706","#dc2626","#16a34a"][Math.abs([...n].reduce((h,c)=>(h<<5)-h+c.charCodeAt(0),0))%6];
const initials  = (n="")  => n.split(" ").map(p=>p[0]||"").join("").toUpperCase().slice(0,2);
const stockTotal= (sd,id) => Object.values(sd[id]||{}).reduce((s,d)=>s+(d.qte||0),0);
const applyStock=(sd,lignes,impact)=>{
const ns=JSON.parse(JSON.stringify(sd));
const mvts=[];
lignes.forEach(l=>{
if(!l.articleId||!l.depotId) return;
const q=+l.qte||0;
if(q===0) return; // 0 → rien à faire, mais négatif → autorisé
if(!ns[l.articleId]) ns[l.articleId]={};
if(!ns[l.articleId][l.depotId]) ns[l.articleId][l.depotId]={qte:0,emplacement:""};
const before=ns[l.articleId][l.depotId].qte;
// Qté négative inverse le sens du mouvement
const realImpact = q<0 ? (impact==="entree"?"sortie":"entree") : impact;
const absQ = Math.abs(q);
const after = realImpact==="entree" ? before+absQ : before-absQ; // stock peut être négatif
ns[l.articleId][l.depotId].qte=after;
if(l.emplacement) ns[l.articleId][l.depotId].emplacement=l.emplacement;
mvts.push({
id:uid("MVT"),date:today(),type:realImpact,
articleId:l.articleId,articleRef:l.article||"",articleNom:l.designation||"",
qte:absQ,avant:before,apres:after,
depotId:l.depotId,emplacement:l.emplacement||"",
note: q<0?"Quantité négative saisie":"",
});
});
return {ns,mvts};
};
// ── Impression universelle — fonctionne sur PC, iPhone, Android ──
function openPrint(html){
// Méthode 1 : nouvelle fenêtre (PC Chrome/Firefox)
try{
const w=window.open("","_blank","width=900,height=700");
if(w){
w.document.write(html);
w.document.close();
w.focus();
return;
}
}catch(e){}
// Méthode 2 : iframe caché (si popup bloqué)
try{
const existing=document.getElementById("_mgc_print_frame");
if(existing) document.body.removeChild(existing);
const iframe=document.createElement("iframe");
iframe.id="_mgc_print_frame";
iframe.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:99999;background:#fff";
document.body.appendChild(iframe);
iframe.contentDocument.write(html);
iframe.contentDocument.close();
// Ajouter bouton fermeture
const closeBtn=iframe.contentDocument.createElement("button");
closeBtn.innerHTML="✕ Fermer";
closeBtn.style.cssText="position:fixed;top:10px;right:10px;z-index:999999;background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:700";
closeBtn.onclick=()=>document.body.removeChild(iframe);
iframe.contentDocument.body.appendChild(closeBtn);
return;
}catch(e){}
// Méthode 3 : data URL (fallback iPhone Safari)
try{
const blob=new Blob([html],{type:"text/html;charset=utf-8"});
const r=new FileReader();
r.onload=()=>{
const a=document.createElement("a");
a.href=r.result;
a.download="document.html";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
};
r.readAsDataURL(blob);
}catch(e){}
}


function exportToExcel(rows,cols,filename){
const bom="\uFEFF";
const hdr=cols.map(c=>'"'+(c.label||"").replace(/"/g,'""')+'"').join(";");
const body=rows.map(r=>cols.map(c=>{
const v=c.get?c.get(r):(r[c.key]??"");
const s=String(v).replace(/"/g,'""');
return '"'+s+'"';
}).join(";")).join("\n");
const csv=bom+hdr+"\n"+body;
const a=document.createElement("a");
a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
a.download=(filename||"export")+".csv";a.click();
}
function useVues(listKey, defaultCols, defaultFilters={}){
const storageKey=VUE_DEF_KEY+listKey;
const [vues,setVuesRaw]=useState(()=>LS.get(storageKey)||[]);
const [vueActive,setVueActiveRaw]=useState(null);

const saveVues=(v)=>{LS.set(storageKey,v);setVuesRaw(v);};

const saveVue=(nom,cols,filters,sort)=>{
const existing=vues.find(v=>v.nom===nom);
if(existing){
const updated=vues.map(v=>v.nom===nom?{...v,cols,filters,sort,updatedAt:today()}:v);
saveVues(updated);
}else{
const rec={id:uid("VUE"),nom,cols,filters:filters||{},sort:sort||null,createdAt:today(),updatedAt:today()};
saveVues([...vues,rec]);
setVueActiveRaw(rec.id);
}
};

const deleteVue=(id)=>{
saveVues(vues.filter(v=>v.id!==id));
if(vueActive===id)setVueActiveRaw(null);
};

const loadVue=(vue)=>{setVueActiveRaw(vue.id);return vue;};
const resetVue=()=>setVueActiveRaw(null);
const activeVue=vues.find(v=>v.id===vueActive)||null;

return{vues,vueActive,activeVue,saveVue,deleteVue,loadVue,resetVue};
}

// Composant barre de vues
function VueBar({listKey,cols,filters,sort,setFilters,setCols,allCols,children}){
const {vues,vueActive,activeVue,saveVue,deleteVue,loadVue,resetVue}=useVues(listKey);
const [showSave,setShowSave]=useState(false);
const [nomVue,setNomVue]=useState("");
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2000);};

const handleSave=()=>{
if(!nomVue.trim())return showToast("Nom obligatoire",false);
saveVue(nomVue.trim(),cols,filters,sort);
showToast(`Vue "${nomVue}" sauvegardée ✅`);
setNomVue("");setShowSave(false);
};

const handleLoad=(vue)=>{
loadVue(vue);
if(setCols&&vue.cols)setCols(vue.cols);
if(setFilters&&vue.filters)setFilters(vue.filters);
showToast(`Vue "${vue.nom}" chargée ✅`);
};

return(
<>
<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",padding:"6px 16px",background:"#f8fafc",borderBottom:"1px solid #f0f4f8"}}>
<span style={{fontSize:11,fontWeight:700,color:"#64748b"}}>👁 Vues :</span>

{/* Vue par défaut */}
<button onClick={resetVue}
style={{padding:"3px 10px",border:"1px solid "+(vueActive===null?"#1a56db":"#e2e8f0"),
borderRadius:5,cursor:"pointer",fontSize:11,
background:vueActive===null?"#1a56db":"#fff",
color:vueActive===null?"#fff":"#64748b",
fontFamily:"inherit",fontWeight:vueActive===null?700:400}}>
Par défaut
</button>

{/* Vues sauvegardées */}
{vues.map(v=>(
<div key={v.id} style={{display:"flex",alignItems:"center",gap:0}}>
<button onClick={()=>handleLoad(v)}
style={{padding:"3px 10px",border:"1px solid "+(vueActive===v.id?"#7c3aed":"#e2e8f0"),
borderRadius:"5px 0 0 5px",cursor:"pointer",fontSize:11,
background:vueActive===v.id?"#7c3aed":"#fff",
color:vueActive===v.id?"#fff":"#64748b",
fontFamily:"inherit",fontWeight:vueActive===v.id?700:400}}>
{v.nom}
</button>
<button onClick={()=>{if(window.confirm(`Supprimer la vue "${v.nom}" ?`))deleteVue(v.id);}}
style={{padding:"3px 6px",border:"1px solid #e2e8f0",borderLeft:"none",
borderRadius:"0 5px 5px 0",cursor:"pointer",fontSize:10,
background:"#fff",color:"#94a3b8",fontFamily:"inherit"}}>
✕
</button>
</div>
))}

{/* Sauvegarder vue actuelle */}
{!showSave?(
<button onClick={()=>setShowSave(true)}
style={{padding:"3px 10px",border:"1px dashed #7c3aed",
borderRadius:5,cursor:"pointer",fontSize:11,
background:"#f5f3ff",color:"#7c3aed",fontFamily:"inherit"}}>
＋ Sauvegarder vue
</button>
):(
<div style={{display:"flex",gap:4,alignItems:"center"}}>
<input autoFocus value={nomVue} onChange={e=>setNomVue(e.target.value)}
onKeyDown={e=>{if(e.key==="Enter")handleSave();if(e.key==="Escape")setShowSave(false);}}
style={{...S.inp,width:130,height:26,padding:"2px 8px",fontSize:11}}
placeholder="Nom de la vue..."/>
<button onClick={handleSave} style={{...S.btnP,padding:"2px 10px",fontSize:11}}>✓</button>
<button onClick={()=>setShowSave(false)} style={{...S.btnS,padding:"2px 8px",fontSize:11}}>✕</button>
</div>
)}

{/* Info vue active */}
{activeVue&&(
<span style={{marginLeft:"auto",fontSize:10,color:"#7c3aed",background:"#f5f3ff",padding:"2px 8px",borderRadius:4}}>
Vue : <strong>{activeVue.nom}</strong> · {activeVue.updatedAt}
</span>
)}
</div>
{children}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}


function FilterTh({label, col, filters, setFilters, type="text", options=[]}) {
const val = filters[col]||"";
const [open, setOpen] = useState(false);
const hasFilter = !!val;
return (
<th style={{...S.th, padding:0, position:"relative", minWidth:80}}>
<div style={{display:"flex",flexDirection:"column"}}>
<div style={{padding:"6px 8px",fontWeight:700,display:"flex",alignItems:"center",gap:4,justifyContent:"space-between"}}>
<span style={{fontSize:12}}>{label}</span>
<button onClick={()=>setOpen(o=>!o)}
style={{background:hasFilter?"#1a56db":"rgba(0,0,0,.06)",border:"none",borderRadius:4,
width:18,height:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
flexShrink:0,padding:0}}>
<span style={{fontSize:9,color:hasFilter?"#fff":"#64748b"}}>{hasFilter?"✕":"▼"}</span>
</button>
</div>
{hasFilter&&<div style={{height:2,background:"#1a56db",borderRadius:1}}/>}
</div>
{open&&(
<>
<div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:490}}/>
<div style={{position:"absolute",top:"100%",left:0,zIndex:500,background:"#fff",
border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,.12)",
minWidth:180,padding:8}}>
{type==="select"?(
<>
<div onClick={()=>{setFilters(p=>({...p,[col]:""}));setOpen(false);}}
style={{padding:"6px 10px",cursor:"pointer",fontSize:12,color:"#64748b",borderRadius:5,
background:val===""?"#f0f9ff":"transparent"}}>Tous</div>
{options.map(o=>(
<div key={o} onClick={()=>{setFilters(p=>({...p,[col]:o}));setOpen(false);}}
style={{padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:val===o?700:400,
color:val===o?"#1a56db":"#1a2332",borderRadius:5,background:val===o?"#eff6ff":"transparent"}}>
{o}
</div>
))}
</>
):(
<>
<input autoFocus value={val}
onChange={e=>setFilters(p=>({...p,[col]:e.target.value}))}
onKeyDown={e=>e.key==="Escape"&&setOpen(false)}
placeholder={"Filtrer "+label.toLowerCase()+"..."}
style={{...S.inp,width:"100%",fontSize:12}}/>
{val&&<button onClick={()=>setFilters(p=>({...p,[col]:""}))}
style={{...S.btnS,width:"100%",marginTop:6,fontSize:11,color:"#dc2626",borderColor:"#fecaca"}}>
✕ Effacer
</button>}
</>
)}
</div>
</>
)}
</th>
);
}

// Appliquer les filtres sur un tableau
function applyFilters(rows, filters, colMap) {
return rows.filter(row=>
Object.entries(filters).every(([col, val])=>{
if(!val) return true;
const getter = colMap[col];
if(!getter) return true;
const cellVal = String(getter(row)||"").toLowerCase();
return cellVal.includes(val.toLowerCase());
})
);
}

function ColonnesChoisir({allCols, visible, setVisible}){
const [open,setOpen]=useState(false);
const toggle=(id)=>setVisible(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
const selectAll=()=>setVisible(allCols.map(c=>c.id));
const selectNone=()=>setVisible([allCols[0].id]); // garder au moins 1
return(
<div style={{position:"relative",display:"inline-block"}}>
<button onClick={()=>setOpen(o=>!o)}
style={{...S.btnS,color:"#1a56db",borderColor:"#c7d2fe",display:"flex",alignItems:"center",gap:5}}>
<span>🏛</span><span>Colonnes</span><span style={{fontSize:10,color:"#94a3b8"}}>({visible.length}/{allCols.length})</span>
</button>
{open&&(
<>
<div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:400}}/>
<div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.12)",zIndex:500,minWidth:220,padding:8}}>
<div style={{display:"flex",justifyContent:"space-between",padding:"4px 8px 8px",borderBottom:"1px solid #f0f4f8",marginBottom:4}}>
<span style={{fontSize:11,fontWeight:700,color:"#64748b"}}>Colonnes visibles</span>
<div style={{display:"flex",gap:6}}>
<button onClick={selectAll} style={{fontSize:10,color:"#1a56db",background:"none",border:"none",cursor:"pointer",fontWeight:700}}>Tout</button>
<button onClick={selectNone} style={{fontSize:10,color:"#94a3b8",background:"none",border:"none",cursor:"pointer"}}>Aucun</button>
</div>
</div>
{allCols.map((c,i)=>(
<label key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,cursor:"pointer",background:"transparent",fontSize:13}}
onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
<input type="checkbox" checked={visible.includes(c.id)} onChange={()=>toggle(c.id)}
style={{width:14,height:14,accentColor:"#1a56db"}} disabled={visible.length===1&&visible.includes(c.id)}/>
<span style={{flex:1,color:"#1a2332"}}>{c.label}</span>
{i===0&&<span style={{fontSize:9,color:"#94a3b8"}}>fixe</span>}
</label>
))}
</div>
</>
)}
</div>
);
}

// GESTIONNAIRE DE LAYOUT FORMULAIRE
// Double-clic pour renommer · Drag pour réordonner · Masquer
const FORM_LAYOUTS_KEY="lgm_formlayout_";
const FIELD_LABELS_KEY="lgm_fieldlabels_";

function ArticlePickerCell({l,cur,setCur,cfg,data,tiersList}){
const [open,setOpen]=useState(false);
const [search,setSearch]=useState("");
const dropRef=useRef(null);
const triggerRef=useRef(null);
const selArt=data.articles.find(a=>a.id===l.articleId);
const filteredArts=search.length>0
?data.articles.filter(a=>{
// Exclure articles inactifs ou en sommeil
if(a.statutActivite==="inactif")return false;
// Filtrer selon vendable/achetable
if(cfg.isAchat&&a.achetable===false)return false;
if(!cfg.isAchat&&a.vendable===false)return false;
return a.ref?.toLowerCase().includes(search.toLowerCase())||
a.designation?.toLowerCase().includes(search.toLowerCase());
})
:data.articles.filter(a=>{
if(a.statutActivite==="inactif")return false;
if(cfg.isAchat&&a.achetable===false)return false;
if(!cfg.isAchat&&a.vendable===false)return false;
return true;
});

useEffect(()=>{
if(!open)return;
// Positionner le dropdown sous le trigger
if(dropRef.current&&triggerRef.current){
const rect=triggerRef.current.getBoundingClientRect();
dropRef.current.style.top=(rect.bottom+4)+"px";
dropRef.current.style.left=rect.left+"px";
dropRef.current.style.width=Math.max(rect.width,340)+"px";
}
},[open]);

const pick=(a)=>{
const px=cfg.isAchat?+a.prixAchat||0:+a.prixVente||0;
const tiers2=tiersList.find(t=>t.id===cur.tiers);
let remise=0;
if(!cfg.isAchat&&(a.tarifs||[]).length>0){
const tarif=a.tarifs.find(t=>t.actif!==false&&(
t.cible==="tous"||(t.cible==="famille"&&t.familleClientId===tiers2?.famille)||(t.cible==="client"&&t.clientId===cur.tiers)
));
if(tarif)remise=+tarif.remise||0;
}
setCur(p=>({...p,lignes:p.lignes.map(li=>li.id===l.id
?{...li,articleId:a.id,article:a.ref,designation:a.designation,unite:a.unite||"Pce",prix:px,tva:+a.tva||20,remise}
:li)}));
setOpen(false);setSearch("");
};

const clear=(e)=>{
e.stopPropagation();
setCur(p=>({...p,lignes:p.lignes.map(li=>li.id===l.id
?{...li,articleId:"",article:"",designation:"",unite:"",prix:0,tva:20,remise:0}
:li)}));
};

return(
<div style={{position:"relative",minWidth:160}}>
{/* Trigger */}
<div ref={triggerRef} onClick={()=>setOpen(o=>!o)}
style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",
border:"1.5px solid "+(open?"#1a56db":selArt?"#a5b4fc":"#d1d9e0"),
borderRadius:6,background:"#fff",cursor:"pointer",minHeight:34}}>
{selArt?(
<div style={{flex:1,minWidth:0}}>
<div style={{fontWeight:700,fontSize:11,color:"#1a2332",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selArt.ref}</div>
<div style={{fontSize:9,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selArt.designation}</div>
</div>
):(
<span style={{color:"#94a3b8",fontSize:11,flex:1}}>Choisir article...</span>
)}
{selArt&&<span onClick={clear} style={{color:"#94a3b8",fontSize:15,cursor:"pointer",lineHeight:1,flexShrink:0}}>×</span>}
<span style={{fontSize:9,color:"#94a3b8",flexShrink:0}}>{open?"▲":"▼"}</span>
</div>
{/* Overlay + Dropdown position:fixed */}
{open&&(
<>
<div style={{position:"fixed",inset:0,zIndex:9998}} onClick={()=>{setOpen(false);setSearch("");}}/>
<div ref={dropRef}
style={{position:"fixed",zIndex:9999,background:"#fff",
border:"1.5px solid #c7d2fe",borderRadius:8,
boxShadow:"0 12px 40px rgba(0,0,0,.25)",
minWidth:340,overflow:"hidden"}}>
<div style={{padding:"6px 8px",borderBottom:"1px solid #f0f4f8",background:"#f8fafc"}}>
<input autoFocus style={{...S.inp,padding:"4px 8px",fontSize:12,width:"100%"}}
placeholder="🔍 Réf ou désignation..."
value={search} onChange={e=>setSearch(e.target.value)}
onClick={e=>e.stopPropagation()}/>
<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>
{filteredArts.length} / {data.articles.length} article(s)
</div>
</div>
<div style={{maxHeight:260,overflowY:"auto"}}>
{filteredArts.length===0
?<div style={{padding:16,textAlign:"center",color:"#94a3b8",fontSize:12}}>Aucun résultat</div>
:filteredArts.map(a=>{
const tot=stockTotal(data.stockDepots,a.id);
const px=cfg.isAchat?+a.prixAchat||0:+a.prixVente||0;
const isSel=a.id===l.articleId;
const sc2=tot<=0?"#dc2626":tot<=(+a.stockMin||5)?"#d97706":"#16a34a";
return(
<div key={a.id} onClick={()=>pick(a)}
style={{padding:"7px 10px",cursor:"pointer",borderBottom:"1px solid #f8fafc",
background:isSel?"#eef2ff":"#fff",display:"flex",alignItems:"center",gap:8}}
onMouseEnter={e=>e.currentTarget.style.background=isSel?"#e0e7ff":"#f5f7ff"}
onMouseLeave={e=>e.currentTarget.style.background=isSel?"#eef2ff":"#fff"}>
<div style={{flex:1,minWidth:0}}>
<div style={{display:"flex",alignItems:"center",gap:5}}>
<span style={{fontWeight:700,fontSize:12,color:isSel?"#1a56db":"#1a2332"}}>{a.ref}</span>
{tot<=0&&a.gererStock!==false&&<span style={{...S.badge,background:"#fef2f2",color:"#dc2626",fontSize:9}}>Rupture</span>}
{tot>0&&tot<=(+a.stockMin||5)&&a.gererStock!==false&&<span style={{...S.badge,background:"#fef9c3",color:"#d97706",fontSize:9}}>Bas</span>}
{a.gererStock===false&&<span style={{...S.badge,background:"#f1f5f9",color:"#64748b",fontSize:9}}>Hors stock</span>}
{a.statutActivite==="sommeil"&&<span style={{...S.badge,background:"#fef9c3",color:"#d97706",fontSize:9}}>Sommeil</span>}
</div>
<div style={{fontSize:10,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.designation}</div>
<div style={{fontSize:10,marginTop:2,display:"flex",gap:10}}>
<span style={{fontWeight:600,color:"#0891b2"}}>{fmt(px)} DH</span>
{a.gererStock!==false?(
<span style={{fontWeight:700,color:sc2}}>Stock : {tot} {a.unite||"u."}</span>
):(
<span style={{color:"#94a3b8"}}>Stock non géré</span>
)}
</div>
</div>
{isSel&&<span style={{color:"#1a56db",fontWeight:800,flexShrink:0}}>✓</span>}
</div>
);
})}
</div>
</div>
</>
)}
</div>
);
}

function SearchSelect({
value, onChange,
options,
placeholder="Choisir...",
color="#1a56db",
width="100%",
disabled=false,
}){
const [open,   setOpen  ] = useState(false);
const [search, setSearch] = useState("");
const wrapRef = useRef(null);
const selected = options.find(o=>String(o.id)===String(value)&&o.id!=="");
const filtered  = search
? options.filter(o=>
(o.label||"").toLowerCase().includes(search.toLowerCase())||
(o.sub||"").toLowerCase().includes(search.toLowerCase())||
(o.meta||"").toLowerCase().includes(search.toLowerCase())
)
: options;
useEffect(()=>{
if(!open) return;
const h=(e)=>{
if(wrapRef.current&&!wrapRef.current.contains(e.target)) setOpen(false);
};
document.addEventListener("mousedown",h);
return()=>document.removeEventListener("mousedown",h);
},[open]);
const choose=(id)=>{ onChange(id); setOpen(false); setSearch(""); };
return(
<div ref={wrapRef} style={{position:"relative",width}}>
<div
onClick={()=>{ if(!disabled){ setOpen(o=>!o); setSearch(""); }}}
style={{
display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
border:`1.5px solid ${open?"#1a56db":selected?"#a5b4fc":"#d1d9e0"}`,
borderRadius:6,background:disabled?"#f8fafc":"#fff",
cursor:disabled?"not-allowed":"pointer",minHeight:36,
boxShadow:open?"0 0 0 3px rgba(26,86,219,.12)":"none",
transition:"all .15s",userSelect:"none",
}}>
{selected?(
<div style={{flex:1,minWidth:0}}>
<div style={{fontWeight:700,fontSize:13,color:"#1a2332",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.label}</div>
{selected.sub&&<div style={{fontSize:11,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.sub}</div>}
</div>
):(
<span style={{color:"#94a3b8",fontSize:13,flex:1}}>{placeholder}</span>
)}
{value&&value!==""&&!disabled&&(
<span onClick={e=>{e.stopPropagation();choose("");}} style={{color:"#94a3b8",fontSize:18,cursor:"pointer",lineHeight:1,flexShrink:0}} title="Effacer">×</span>
)}
<span style={{color:"#94a3b8",fontSize:10,flexShrink:0,marginLeft:2}}>{open?"▲":"▼"}</span>
</div>
{open&&(
<div style={{
position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:9999,
background:"#fff",border:"1.5px solid #c7d2fe",borderRadius:8,
boxShadow:"0 8px 32px rgba(0,0,0,.18)",overflow:"hidden",
minWidth:280,
}}>
<div style={{padding:"8px 10px",borderBottom:"1px solid #f0f4f8",background:"#f8fafc"}}>
<div style={{position:"relative"}}>
<span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",pointerEvents:"none"}}>🔍</span>
<input
autoFocus
style={{...S.inp,paddingLeft:28}}
placeholder="Rechercher dans la liste..."
value={search}
onChange={e=>setSearch(e.target.value)}
onClick={e=>e.stopPropagation()}
/>
</div>
<div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>
{filtered.length} / {options.length} élément{options.length>1?"s":""}
</div>
</div>
<div style={{maxHeight:240,overflowY:"auto"}}>
{filtered.length===0?(
<div style={{padding:"20px",textAlign:"center",color:"#94a3b8",fontSize:12}}>
Aucun résultat pour « {search} »
</div>
):filtered.map(o=>{
const isSel=String(o.id)===String(value);
return(
<div key={String(o.id)}
style={{padding:"9px 12px",cursor:"pointer",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:10,background:isSel?"#eef2ff":"#fff"}}
onMouseEnter={e=>e.currentTarget.style.background=isSel?"#e0e7ff":"#f5f7ff"}
onMouseLeave={e=>e.currentTarget.style.background=isSel?"#eef2ff":"#fff"}
onClick={()=>choose(o.id)}>
<div style={{flex:1,minWidth:0}}>
<div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
<span style={{fontWeight:700,fontSize:13,color:isSel?color:"#1a2332"}}>{o.label}</span>
{o.badge&&<span style={{...S.badge,background:`${o.badgeColor||"#64748b"}20`,color:o.badgeColor||"#64748b",fontSize:10}}>{o.badge}</span>}
</div>
{o.sub&&<div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{o.sub}</div>}
{o.meta&&<div style={{fontSize:11,color:"#0891b2",marginTop:1}}>{o.meta}</div>}
</div>
{isSel&&<span style={{color,fontWeight:800,fontSize:16,flexShrink:0}}>✓</span>}
</div>
);
})}
</div>
</div>
)}
</div>
);
}
function Toast({msg,ok=true}){
if(!msg)return null;
return <div style={{position:"fixed",bottom:28,right:28,padding:"12px 26px",borderRadius:8,fontWeight:700,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,.2)",zIndex:9999,background:ok?"#16a34a":"#dc2626",color:"#fff"}}>{ok?"✓":"⚠"} {msg}</div>;
}
function ConfirmDeleteModal({item, reasons, onConfirm, onCancel}){
const blocked = reasons && reasons.length > 0;
return(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:12,padding:28,width:460,maxWidth:"94vw",boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
<div style={{textAlign:"center",marginBottom:18}}>
<div style={{fontSize:38,marginBottom:8}}>{blocked?"🔒":"🗑️"}</div>
<div style={{fontWeight:800,fontSize:16,color:"#1a2332",marginBottom:6}}>
{blocked?"Suppression impossible":"Confirmer la suppression"}
</div>
<div style={{fontSize:13,color:"#64748b"}}>{item}</div>
</div>
{blocked?(
<div>
<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
<div style={{fontWeight:700,color:"#dc2626",fontSize:13,marginBottom:8}}>Cet enregistrement est utilise dans :</div>
{reasons.map((r,i)=>(
<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:13,color:"#7f1d1d"}}>
<span style={{color:"#dc2626"}}>•</span> {r}
</div>
))}
</div>
<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",marginBottom:16}}>
Veuillez d'abord modifier ou supprimer ces enregistrements liés.
</div>
<button style={{...S.btnP,width:"100%",background:"#1a2332"}} onClick={onCancel}>Fermer</button>
</div>
):(
<div>
<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:13,color:"#92400e",textAlign:"center"}}>
Cette action est irréversible.
</div>
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={onCancel}>Annuler</button>
<button style={{...S.btnP,flex:1,background:"#dc2626"}} onClick={onConfirm}>Supprimer définitivement</button>
</div>
</div>
)}
</div>
</div>
);
}
function useSecureDelete(data, setData){
const [pending, setPending] = useState(null);
const checkAndDelete = (type, id, label) => {
const reasons = [];
const allDocs = Object.values(data.documents).flat();
if(type === "client"){
const inDocs = allDocs.filter(d=>d.tiers===id);
if(inDocs.length>0) reasons.push(`${inDocs.length} document(s) de vente (BL, factures...)`);
}
if(type === "fournisseur"){
const inDocs = allDocs.filter(d=>d.tiers===id);
if(inDocs.length>0) reasons.push(`${inDocs.length} document(s) d'achat (BC, BL, factures...)`);
}
if(type === "article"){
const inDocs = allDocs.filter(d=>d.lignes?.some(l=>l.articleId===id));
if(inDocs.length>0) reasons.push(`${inDocs.length} document(s) contenant cet article`);
const inMvts = (data.mouvementsStock||[]).filter(m=>m.articleId===id);
if(inMvts.length>0) reasons.push(`${inMvts.length} mouvement(s) de stock`);
const inStock = Object.values(data.stockDepots[id]||{}).some(d=>d.qte>0);
if(inStock) reasons.push("Stock non nul dans un ou plusieurs dépôts");
}
if(type === "famille-client"){
const used = data.clients.filter(c=>c.famille===id);
if(used.length>0) reasons.push(`${used.length} client(s) avec cette famille`);
const sfUsed = (data.sousFamillesClient||[]).filter(sf=>sf.familleId===id);
if(sfUsed.length>0) reasons.push(`${sfUsed.length} sous-famille(s) liée(s)`);
}
if(type === "sous-famille-client"){
const used = data.clients.filter(c=>c.sousFamille===id);
if(used.length>0) reasons.push(`${used.length} client(s) avec cette sous-famille`);
}
if(type === "famille-fournisseur"){
const used = data.fournisseurs.filter(f=>f.famille===id);
if(used.length>0) reasons.push(`${used.length} fournisseur(s) avec cette famille`);
const sfUsed = (data.sousFamillesFournisseur||[]).filter(sf=>sf.familleId===id);
if(sfUsed.length>0) reasons.push(`${sfUsed.length} sous-famille(s) liée(s)`);
}
if(type === "sous-famille-fournisseur"){
const used = data.fournisseurs.filter(f=>f.sousFamille===id);
if(used.length>0) reasons.push(`${used.length} fournisseur(s) avec cette sous-famille`);
}
if(type === "famille-article"){
const used = data.articles.filter(a=>a.famille===id);
if(used.length>0) reasons.push(`${used.length} article(s) avec cette famille`);
const sfUsed = (data.sousFamillesArticle||[]).filter(sf=>sf.familleId===id);
if(sfUsed.length>0) reasons.push(`${sfUsed.length} sous-famille(s) liée(s)`);
}
if(type === "sous-famille-article"){
const used = data.articles.filter(a=>a.sousFamille===id);
if(used.length>0) reasons.push(`${used.length} article(s) avec cette sous-famille`);
}
if(type === "agence"){
const depotsAgence = data.depots.filter(d=>d.agenceId===id);
if(depotsAgence.length>0) reasons.push(`${depotsAgence.length} dépôt(s) rattaché(s) à cette agence`);
const inDocs = allDocs.filter(d=>d.agence===id);
if(inDocs.length>0) reasons.push(`${inDocs.length} document(s) associé(s) à cette agence`);
}
if(type === "depot"){
const inStock = Object.entries(data.stockDepots).some(([,depots])=>depots[id]?.qte>0);
if(inStock) reasons.push("Stock non nul dans ce dépôt");
const inMvts = (data.mouvementsStock||[]).filter(m=>m.depotId===id);
if(inMvts.length>0) reasons.push(`${inMvts.length} mouvement(s) de stock`);
const inDocs = allDocs.filter(d=>d.lignes?.some(l=>l.depotId===id));
if(inDocs.length>0) reasons.push(`${inDocs.length} document(s) avec des lignes sur ce dépôt`);
}
const doDelete = () => {
const MAP = {
"client":                (p)=>({...p,clients:p.clients.filter(r=>r.id!==id)}),
"fournisseur":           (p)=>({...p,fournisseurs:p.fournisseurs.filter(r=>r.id!==id)}),
"article":               (p)=>({...p,articles:p.articles.filter(r=>r.id!==id)}),
"famille-client":        (p)=>({...p,famillesClient:p.famillesClient.filter(r=>r.id!==id)}),
"sous-famille-client":   (p)=>({...p,sousFamillesClient:p.sousFamillesClient.filter(r=>r.id!==id)}),
"famille-fournisseur":   (p)=>({...p,famillesFournisseur:p.famillesFournisseur.filter(r=>r.id!==id)}),
"sous-famille-fournisseur":(p)=>({...p,sousFamillesFournisseur:p.sousFamillesFournisseur.filter(r=>r.id!==id)}),
"famille-article":       (p)=>({...p,famillesArticle:p.famillesArticle.filter(r=>r.id!==id)}),
"sous-famille-article":  (p)=>({...p,sousFamillesArticle:p.sousFamillesArticle.filter(r=>r.id!==id)}),
"agence":                (p)=>({...p,agences:p.agences.filter(r=>r.id!==id)}),
"depot":                 (p)=>({...p,depots:p.depots.filter(r=>r.id!==id)}),
};
if(MAP[type]) setData(MAP[type]);
setPending(null);
};
setPending({type, id, label, reasons, onConfirm: doDelete});
};
const modal = pending ? (
<ConfirmDeleteModal
item={pending.label}
reasons={pending.reasons}
onConfirm={pending.onConfirm}
onCancel={()=>setPending(null)}
/>
) : null;
return {checkAndDelete, modal};
}
function Modal({title,onClose,children,width=560}){
return(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:12,padding:28,width,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.25)"}}>
<div style={{display:"flex",alignItems:"center",marginBottom:20,paddingBottom:14,borderBottom:"1px solid #f0f4f8"}}>
<span style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>{title}</span>
<button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>x</button>
</div>
{children}
</div>
</div>
);
}
function Fld({label,required,hint,full,children}){
return(
<div style={{marginBottom:14,gridColumn:full?"1/-1":"auto"}}>
{label&&<label style={S.lbl}>{label}{required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label>}
{children}
{hint&&<div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>{hint}</div>}
</div>
);
}
function FamilleSousFamille({familles,sousFamilles,selectedFam,selectedSF,onChangeFam,onChangeSF,famLabel="Famille",sfLabel="Sous-famille"}){
const sfFiltered=sousFamilles.filter(sf=>sf.familleId===selectedFam);
return(
<div>
<Fld label={famLabel} required>
<select style={{...S.inp,borderColor:!selectedFam?"#fca5a5":undefined}} value={selectedFam||""} onChange={e=>{onChangeFam(e.target.value);onChangeSF("");}}>
<option value="">-- Sélectionner --</option>
{familles.map(f=><option key={f.id} value={f.id}>{f.code} -- {f.nom}</option>)}
</select>
</Fld>
<Fld label={sfLabel} required>
<select style={{...S.inp,borderColor:!selectedSF&&selectedFam?"#fca5a5":undefined,background:!selectedFam?"#f8fafc":"#fff"}} value={selectedSF||""} disabled={!selectedFam} onChange={e=>onChangeSF(e.target.value)}>
<option value="">{selectedFam?"-- Sélectionner --":"-- Choisissez d abord une famille --"}</option>
{sfFiltered.map(sf=><option key={sf.id} value={sf.id}>{sf.code} -- {sf.nom}</option>)}
</select>
</Fld>
</div>
);
}

function FamillesModule({data,setData,type}){
const MAP={
"fam-clients":           {key:"famillesClient",         sfKey:"sousFamillesClient",         title:"Familles Clients",          icon:"👥",extra:[{k:"remise",l:"Remise %",t:"number"}]},
"sous-fam-clients":      {key:"sousFamillesClient",     parentKey:"famillesClient",          title:"Sous-familles Clients",     icon:"👤",isSF:true},
"fam-fournisseurs":      {key:"famillesFournisseur",    sfKey:"sousFamillesFournisseur",     title:"Familles Fournisseurs",     icon:"🏭",extra:[{k:"delai",l:"Delai livraison (j)",t:"number"}]},
"sous-fam-fournisseurs": {key:"sousFamillesFournisseur",parentKey:"famillesFournisseur",     title:"Sous-familles Fournisseurs",icon:"🔧",isSF:true},
"fam-articles":          {key:"famillesArticle",        sfKey:"sousFamillesArticle",         title:"Familles Articles",         icon:"📦",extra:[{k:"tva",l:"TVA %",t:"number"}]},
"sous-fam-articles":     {key:"sousFamillesArticle",    parentKey:"famillesArticle",         title:"Sous-familles Articles",    icon:"📫",isSF:true},
};
const cfg=MAP[type]; if(!cfg)return null;
const rows=data[cfg.key]||[];
const parents=cfg.isSF?(data[cfg.parentKey]||[]):[];
const [modal,setModal]=useState(null);
const [form,setForm]=useState({});
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2000);};
const {checkAndDelete, modal:deleteModal} = useSecureDelete(data,setData);
const deleteTypeMap={
"fam-clients":"famille-client","sous-fam-clients":"sous-famille-client",
"fam-fournisseurs":"famille-fournisseur","sous-fam-fournisseurs":"sous-famille-fournisseur",
"fam-articles":"famille-article","sous-fam-articles":"sous-famille-article",
};
const FAMILLE_PREFIXES={
"fam-clients":"FC","sous-fam-clients":"SFC",
"fam-fournisseurs":"FF","sous-fam-fournisseurs":"SFF",
"fam-articles":"FA","sous-fam-articles":"SFA",
};
const genFamCode=()=>{
const prefix=FAMILLE_PREFIXES[type]||"F";
const seq=rows.length+1;
return prefix+String(seq).padStart(2,"0");
};
const ALL_COLS_FAM=[
{id:"code",label:"Code"},
{id:"nom",label:"Désignation"},
...(cfg.isSF?[{id:"parent",label:"Famille parente"}]:[]),
...(cfg.extra||[]).map(e=>({id:e.k,label:e.l})),
];
const [visColsFam,setVisColsFam_raw]=useState(()=>LS.get("lgm_cols_fam_"+type)||ALL_COLS_FAM.map(c=>c.id));
const setVisColsFam=(v)=>{LS.set("lgm_cols_fam_"+type,v);setVisColsFam_raw(v);};
const openNew=()=>{
const base={code:genFamCode(),nom:""};
if(cfg.isSF)base.familleId="";
if(cfg.extra)cfg.extra.forEach(e=>base[e.k]="");
setForm(base);setModal("form");
};
const openEdit=(r)=>{setForm({...r});setModal("form");};
const save=()=>{
if(!form.code?.trim()||!form.nom?.trim())return showToast("Code et nom obligatoires",false);
if(cfg.isSF&&!form.familleId)return showToast("Famille parente obligatoire",false);
const record={...form,id:form.id||uid("F")};
setData(p=>({...p,[cfg.key]:p[cfg.key].find(r=>r.id===record.id)?p[cfg.key].map(r=>r.id===record.id?record:r):[...p[cfg.key],record]}));
showToast("Enregistre !");setModal(null);
};
const del=(id,nom)=>checkAndDelete(deleteTypeMap[type]||type, id, nom||id);
return(
<>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontSize:16}}>{cfg.icon}</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>{cfg.title}</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{rows.length}</span>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<ColonnesChoisir allCols={ALL_COLS_FAM} visible={visColsFam} setVisible={setVisColsFam}/>
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac"}} onClick={()=>{
const cols=[
{label:"Code",key:"code"},{label:"Désignation",key:"nom"},
...(cfg.isSF?[{label:"Famille parente",get:r=>parents.find(p=>p.id===r.familleId)?.nom||""}]:[]),
...(cfg.extra||[]).map(e=>({label:e.l,key:e.k})),
];
exportToExcel(rows,cols,cfg.key);
}}>⬇ Excel</button>
<button style={S.btnP} onClick={openNew}>+ Nouveau</button>
</div>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr>
{visColsFam.includes("code")&&<th style={S.th}>Code</th>}
{visColsFam.includes("nom")&&<th style={S.th}>Désignation</th>}
{cfg.isSF&&visColsFam.includes("parent")&&<th style={S.th}>Famille parente</th>}
{cfg.extra&&cfg.extra.filter(e=>visColsFam.includes(e.k)).map(e=><th key={e.k} style={S.th}>{e.l}</th>)}
<th style={S.th}>Actions</th>
</tr>
</thead>
<tbody>
{rows.length===0&&<tr><td colSpan={10} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>Aucun enregistrement</td></tr>}
{rows.map(r=>(
<tr key={r.id} onDoubleClick={()=>openEdit(r)} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
{visColsFam.includes("code")&&<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#1a56db"}}>{r.code}</td>}
{visColsFam.includes("nom")&&<td style={S.td}>{r.nom}</td>}
{cfg.isSF&&visColsFam.includes("parent")&&<td style={S.td}><span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed"}}>{parents.find(p=>p.id===r.familleId)?.nom||"-"}</span></td>}
{cfg.extra&&cfg.extra.filter(e=>visColsFam.includes(e.k)).map(e=><td key={e.k} style={S.td}>{r[e.k]}</td>)}
<td style={S.td}>
<button style={S.btnSm} onClick={()=>openEdit(r)}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(r.id, `${r.code} -- ${r.nom}`)}>🗑</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
{modal&&(
<Modal title={form.id&&rows.find(r=>r.id===form.id)?"Modifier":"Nouveau"} onClose={()=>setModal(null)} width={480}>
<Fld label="Code" required>
<CodeAutoField value={form.code||""} onChange={v=>setForm(p=>({...p,code:v.toUpperCase()}))} isNew={!form.id}/>
</Fld>
<Fld label="Designation" required>
<input style={S.inp} value={form.nom||""} onChange={e=>setForm(p=>({...p,nom:e.target.value}))}/>
</Fld>
{cfg.isSF&&(
<Fld label="Famille parente" required>
<select style={S.inp} value={form.familleId||""} onChange={e=>setForm(p=>({...p,familleId:e.target.value}))}>
<option value="">-- Choisir --</option>
{parents.map(p=><option key={p.id} value={p.id}>{p.code} -- {p.nom}</option>)}
</select>
</Fld>
)}
{cfg.extra&&cfg.extra.map(e=>(
<Fld key={e.k} label={e.l}>
<input type={e.t||"text"} style={S.inp} value={form[e.k]||""} onChange={ev=>setForm(p=>({...p,[e.k]:ev.target.value}))}/>
</Fld>
))}
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,borderTop:"1px solid #f0f4f8",paddingTop:14}}>
<button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
<button style={S.btnP} onClick={save}>Enregistrer</button>
</div>
</Modal>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
{deleteModal}
</>
);
}
const FIELD_TYPES=[
{v:"text",l:"Texte libre"},{v:"number",l:"Nombre"},{v:"email",l:"Email"},
{v:"tel",l:"Telephone"},{v:"date",l:"Date"},{v:"textarea",l:"Zone de texte"},
{v:"checkbox",l:"Case a cocher"},{v:"select",l:"Liste de choix"},
];
function CustomFieldInput({field,value,onChange}){
const v=value??(field.type==="checkbox"?false:"");
if(field.type==="textarea") return <textarea style={{...S.inp,resize:"vertical",minHeight:56,lineHeight:1.6}} value={v} onChange={e=>onChange(e.target.value)}/>;
if(field.type==="checkbox") return <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={!!v} onChange={e=>onChange(e.target.checked)} style={{width:16,height:16,accentColor:"#1a56db"}}/><span style={{fontWeight:500}}>{field.label}</span></label>;
if(field.type==="select"){const opts=(field.options||"").split(",").map(s=>s.trim()).filter(Boolean);return <select style={S.inp} value={v} onChange={e=>onChange(e.target.value)}><option value="">--</option>{opts.map(o=><option key={o}>{o}</option>)}</select>;}
return <input type={field.type||"text"} style={S.inp} value={v} onChange={e=>onChange(e.target.value)}/>;
}
function CustomFieldsManager({fields,setFields}){
const [form,setForm]=useState(null);
const [err,setErr]=useState("");
const TYPES=[
{v:"text",l:"Texte"},{v:"number",l:"Nombre"},{v:"email",l:"Email"},
{v:"tel",l:"Telephone"},{v:"date",l:"Date"},{v:"textarea",l:"Zone de texte"},
{v:"checkbox",l:"Case a cocher"},{v:"select",l:"Liste de choix"},
];
const openNew=()=>setForm({id:uid("CF"),label:"",key:"",type:"text",options:"",required:false});
const openEdit=(f)=>setForm({...f});
const save=()=>{
if(!form.label.trim())return setErr("Libellé obligatoire");
const key=form.key.trim()||form.label.trim().toLowerCase().replace(/[^a-z0-9]/g,"_");
if(!form.id){
if(fields.find(f=>f.key===key))return setErr("Ce code existe déjà");
}
const record={...form,key};
setFields(prev=>prev.find(f=>f.id===record.id)?prev.map(f=>f.id===record.id?record:f):[...prev,record]);
setForm(null);setErr("");
};
const del=(id)=>setFields(prev=>prev.filter(f=>f.id!==id));
const move=(idx,dir)=>{
const arr=[...fields];
const t=arr[idx];arr[idx]=arr[idx+dir];arr[idx+dir]=t;
setFields(arr);
};
return(
<div>
<div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
<button style={S.btnP} onClick={openNew}>+ Ajouter un champ</button>
</div>
{fields.length===0&&(
<div style={{textAlign:"center",padding:"24px 0",color:"#94a3b8",fontSize:13,background:"#f8fafc",borderRadius:8,border:"1px dashed #e2e8f0"}}>
Aucun champ personnalisé — cliquez sur "+ Ajouter un champ"
</div>
)}
{fields.map((f,i)=>(
<div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0",marginBottom:6}}>
<div style={{display:"flex",flexDirection:"column",gap:1}}>
<button onClick={()=>i>0&&move(i,-1)} disabled={i===0} style={{...S.btnSm,padding:"1px 5px",fontSize:10,opacity:i===0?.3:1}}>▲</button>
<button onClick={()=>i<fields.length-1&&move(i,1)} disabled={i===fields.length-1} style={{...S.btnSm,padding:"1px 5px",fontSize:10,opacity:i===fields.length-1?.3:1}}>▼</button>
</div>
<div style={{flex:1}}>
<span style={{fontWeight:700,color:"#1a2332"}}>{f.label}</span>
{f.required&&<span style={{...S.badge,background:"#fef2f2",color:"#dc2626",marginLeft:6,fontSize:10}}>Requis</span>}
<div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>
<span style={{fontFamily:"monospace",background:"#e2e8f0",padding:"1px 5px",borderRadius:3,marginRight:6}}>{f.key}</span>
<span>{TYPES.find(t=>t.v===f.type)?.l||f.type}</span>
{f.type==="select"&&f.options&&<span style={{marginLeft:6}}>Options: {f.options}</span>}
</div>
</div>
<button style={S.btnSm} onClick={()=>openEdit(f)}>✏️</button>
<button style={{...S.btnSm,color:"#dc2626"}} onClick={()=>del(f.id)}>🗑</button>
</div>
))}
{form&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:12,padding:24,width:440,maxWidth:"95vw"}}>
<div style={{fontWeight:800,fontSize:15,color:"#1a2332",marginBottom:16}}>{form.id&&fields.find(f=>f.id===form.id)?"Modifier":"Nouveau"} champ personnalisé</div>
<Fld label="Libellé" required>
<input style={S.inp} value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value}))} autoFocus placeholder="Ex: Numéro TVA"/>
</Fld>
<Fld label="Code interne (optionnel)">
<input style={{...S.inp,fontFamily:"monospace"}} value={form.key} onChange={e=>setForm(p=>({...p,key:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")}))} placeholder="ex: num_tva (auto si vide)"/>
</Fld>
<Fld label="Type de champ">
<select style={S.inp} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
{TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
</select>
</Fld>
{form.type==="select"&&(
<Fld label="Options (séparées par des virgules)">
<input style={S.inp} value={form.options||""} onChange={e=>setForm(p=>({...p,options:e.target.value}))} placeholder="Option 1, Option 2, Option 3"/>
</Fld>
)}
<div style={{marginBottom:14}}>
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
<input type="checkbox" checked={!!form.required} onChange={e=>setForm(p=>({...p,required:e.target.checked}))} style={{width:16,height:16,accentColor:"#1a56db"}}/>
<span style={{fontSize:13,fontWeight:600}}>Champ obligatoire</span>
</label>
</div>
{err&&<div style={{color:"#dc2626",fontSize:12,marginBottom:10,padding:"6px 10px",background:"#fef2f2",borderRadius:6}}>⚠ {err}</div>}
<div style={{display:"flex",gap:10,justifyContent:"flex-end",borderTop:"1px solid #f0f4f8",paddingTop:14}}>
<button style={S.btnS} onClick={()=>{setForm(null);setErr("");}}>Annuler</button>
<button style={S.btnP} onClick={save}>Enregistrer</button>
</div>
</div>
</div>
)}
</div>
);
}

function CodeAutoField({value, onChange, isNew}){
const [locked, setLocked] = useState(isNew);
return(
<div style={{display:"flex",gap:6,alignItems:"center"}}>
<div style={{position:"relative",flex:1}}>
<input
style={{...S.inp,fontFamily:"monospace",fontWeight:700,
background:locked?"#f0fdf4":"#fff",
color:locked?"#16a34a":"#1a2332",
paddingRight:locked?60:8,
border:locked?"1.5px solid #86efac":S.inp.border,
}}
value={value}
onChange={e=>!locked&&onChange(e.target.value)}
readOnly={locked}
/>
{locked&&(
<span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
background:"#16a34a",color:"#fff",fontSize:9,fontWeight:800,
borderRadius:4,padding:"2px 6px",letterSpacing:".05em"}}>AUTO</span>
)}
</div>
<button
type="button"
onClick={()=>setLocked(l=>!l)}
title={locked?"Modifier manuellement":"Reverrouiller"}
style={{background:locked?"#f1f5f9":"#fef2f2",border:"1px solid "+(locked?"#cbd5e1":"#fecaca"),
borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:13,flexShrink:0,
color:locked?"#64748b":"#dc2626",fontFamily:"inherit"}}>
{locked?"✏️":"🔒"}
</button>
</div>
);
}
function TiersModule({data,setData,type}){
const isCli=type==="clients";
const cfg={
title:isCli?"Clients":"Fournisseurs",
icon:isCli?"🏪":"🚚",
dk:type,
famKey:isCli?"famillesClient":"famillesFournisseur",
sfKey:isCli?"sousFamillesClient":"sousFamillesFournisseur",
codePrefix:isCli?"C":"F",
color:isCli?"#1a56db":"#7c3aed",
cfKey:isCli?"client":"fournisseur",
};
const rows=data[cfg.dk]||[];
const customFieldsDef=data.customFields[cfg.cfKey]||[];
const [view,setView]=useState("list");
const [form,setForm]=useState({});
const [search,setSearch]=useState("");
const [colFilters,setColFilters]=useState({});
const [toast,setToast]=useState(null);
const [tab,setTab]=useState("coord");
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const {checkAndDelete, modal:deleteModal} = useSecureDelete(data,setData);
const getFamNom=(id)=>(data[cfg.famKey]||[]).find(f=>f.id===id)?.nom||"-";
const getSFNom =(id)=>(data[cfg.sfKey] ||[]).find(f=>f.id===id)?.nom||"-";
const TIERS_COL_MAP={
code:r=>r.code, nom:r=>r.nom, nomCom:r=>r.nomCommercial,
famille:r=>getFamNom(r.famille), sousFam:r=>getSFNom(r.sousFamille),
tel:r=>r.tel, email:r=>r.email, ville:r=>r.ville,
ice:r=>r.ice, rc:r=>r.rc, reglement:r=>r.modeReglement,
actif:r=>r.actif!==false?"Actif":"Inactif",
};
const filtered=applyFilters(
rows.filter(r=>!search||[r.code,r.nom,r.ville,r.tel,r.ice].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase()))),
colFilters, TIERS_COL_MAP
);
const hasActiveFilters=Object.values(colFilters).some(v=>!!v);
const ALL_COLS_TIERS=[
{id:"code",     label:"Code"},
{id:"nom",      label:"Raison sociale"},
{id:"nomCom",   label:"Nom commercial"},
{id:"famille",  label:"Famille"},
{id:"sousFam",  label:"Sous-famille"},
{id:"tel",      label:"Téléphone"},
{id:"email",    label:"Email"},
{id:"ville",    label:"Ville"},
{id:"ice",      label:"ICE"},
{id:"rc",       label:"RC"},
{id:"reglement",label:"Mode règlement"},
{id:"actif",    label:"Statut"},
...customFieldsDef.map(f=>({id:"cf_"+f.key,label:"★ "+f.label,cfKey:f.key})),
];
const DEF_COLS_TIERS=["code","nom","famille","sousFam","tel","ville","actif"];
const LS_KEY_TIERS="lgm_cols_"+type;
const [visCols,setVisColsRaw]=useState(()=>{
const saved=LS.get(LS_KEY_TIERS);
return saved||[...DEF_COLS_TIERS];
});
const setVisCols=(v)=>{
LS.set(LS_KEY_TIERS,v);
setVisColsRaw(v);
};
const blankForm=()=>{
const cKey = isCli?"client":"fournisseur";
const cpt = data.compteurs?.[cKey] || COMPTEURS_DEF[cKey];
const code = genNum(cpt);
const base={
code,
nom:"",nomCommercial:"",famille:"",sousFamille:"",
tel:"",tel2:"",fax:"",email:"",email2:"",siteWeb:"",
adresse:"",adresse2:"",ville:"",cp:"",pays:"Maroc",region:"",
rc:"",ice:"",if_:"",patente:"",cnss:"",
modeReglement:"30 jours",delaiPaiement:"30",plafondCredit:"",
remiseGlobale:"",devise:"MAD (DH)",commercial:"",compteComptable:"",
notes:"",actif:true,
};
if(isCli){base.typeClient="Entreprise";}
else{base.delaiLivraison="";base.minCommande="";base.catalogueRef="";}
customFieldsDef.forEach(f=>{base[f.key]=f.type==="checkbox"?false:"";});
return base;
};
const openNew=()=>{setForm(blankForm());setTab("coord");setView("form");};
const openEdit=(r)=>{
const f={...blankForm(),...r};
customFieldsDef.forEach(cf=>{if(f[cf.key]===undefined)f[cf.key]=cf.type==="checkbox"?false:"";});
setForm(f);setTab("coord");setView("form");
};
const save=()=>{
if(!form.code?.trim()||!form.nom?.trim())return showToast("Code et raison sociale obligatoires",false);
if(!form.famille)return showToast("La famille est obligatoire",false);
if(!form.sousFamille)return showToast("La sous-famille est obligatoire",false);
const record={...form,id:form.id||uid(type)};
const isNew = !data[cfg.dk].find(r=>r.id===record.id);
setData(p=>{
const cKey=isCli?"client":"fournisseur";
const cpt=p.compteurs?.[cKey]||COMPTEURS_DEF[cKey];
return {
...p,
[cfg.dk]:p[cfg.dk].find(r=>r.id===record.id)?p[cfg.dk].map(r=>r.id===record.id?record:r):[...p[cfg.dk],record],
...(isNew?{compteurs:{...p.compteurs,[cKey]:{...cpt,seq:(cpt.seq||1)+1}}}:{}),
};
});
showToast(`${cfg.title.slice(0,-1)} "${form.nom}" enregistre(e) !`);
setView("list");
};
const del=(id,nom)=>checkAndDelete(isCli?"client":"fournisseur", id, nom||id);
const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
const printTiers=(r)=>{
const {societe}=data;
const cP=societe.couleurPrincipale||"#1a2332";
const cA=societe.couleurAccent||"#e8a020";
const fam=(data[cfg.famKey]||[]).find(f=>f.id===r.famille)?.nom||"--";
const sf=(data[cfg.sfKey]||[]).find(f=>f.id===r.sousFamille)?.nom||"--";
const allDocTypes=isCli?["vte-devis","vte-bc","vte-bl","vte-facture"]:["ach-devis","ach-bc","ach-bl","ach-facture"];
const docs=allDocTypes.flatMap(k=>(data.documents[k]||[]).filter(d=>d.tiers===r.id).map(d=>({...d,_type:k})));
const docRows=docs.slice(-10).reverse().map(d=>{
const cfg2=DOC_CFG[d._type];
const ttc=docCalc(d.lignes,d.remiseGlobale||0).ttc;
return`<tr><td style="padding:6px 10px;font-family:monospace;font-weight:700;color:${cfg2?.color||"#1a56db"}">${d.ref}</td>
<td style="padding:6px 10px">${cfg2?.titre||d._type}</td>
<td style="padding:6px 10px">${d.dateDoc||""}</td>
<td style="padding:6px 10px"><span style="background:${d.statut==="Validé"||d.statut==="Validée"?"#f0fdf4":"#f8fafc"};color:${d.statut==="Validé"||d.statut==="Validée"?"#16a34a":"#64748b"};padding:2px 8px;border-radius:4px;font-size:11px">${d.statut}</span></td>
<td style="padding:6px 10px;text-align:right;font-weight:700">${fmt(ttc)} DH</td></tr>`;
}).join("");
const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Fiche ${isCli?"Client":"Fournisseur"} ${r.code}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1a2332;}
.p{padding:32px;max-width:860px;margin:0 auto;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid ${cA};}
.logo{background:${cP};color:#fff;padding:12px 20px;border-radius:8px;}.logo h1{font-size:20px;font-weight:900;}.logo p{font-size:9px;letter-spacing:.1em;color:${cA};margin-top:2px;}
.badge-code{background:${cfg.color};color:#fff;padding:14px 22px;border-radius:8px;text-align:right;}
.badge-code h2{font-size:20px;font-weight:900;font-family:monospace;}.badge-code p{font-size:11px;opacity:.7;margin-top:3px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;}
.box h3{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;font-weight:700;margin-bottom:10px;}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f4f8;font-size:12px;gap:10px;}
.row span:first-child{color:#64748b;flex-shrink:0;}.row span:last-child{font-weight:600;text-align:right;}
table{width:100%;border-collapse:collapse;margin-bottom:16px;}
th{background:${cP};color:#fff;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:7px 10px;text-align:left;}
td{border-bottom:1px solid #e8edf2;}
.foot{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;}
@media print{.btn{display:none;}}
</style></head><body><div class="p">
<div class="hdr">
<div class="logo"><h1>${societe.nomCommercial||"MGCLOUD"}</h1><p>GARANTIE DISTRIBUTION</p></div>
<div class="badge-code"><h2>${r.code}</h2><p>Fiche ${isCli?"Client":"Fournisseur"} · ${today()}</p></div>
</div>
<div class="g2">
<div class="box"><h3>Informations générales</h3>
<div class="row"><span>Raison sociale</span><span style="font-weight:800">${r.nom}</span></div>
${r.nomCommercial?`<div class="row"><span>Nom commercial</span><span>${r.nomCommercial}</span></div>`:""}
${isCli?`<div class="row"><span>Type</span><span>${r.typeClient||"Entreprise"}</span></div>`:""}
<div class="row"><span>Famille</span><span>${fam}</span></div>
<div class="row"><span>Sous-famille</span><span>${sf}</span></div>
${r.actif!==false?"":`<div class="row"><span>Statut</span><span style="color:#dc2626">Inactif</span></div>`}
</div>
<div class="box"><h3>Contact</h3>
${r.tel?`<div class="row"><span>Téléphone</span><span>${r.tel}</span></div>`:""}
${r.tel2?`<div class="row"><span>Téléphone 2</span><span>${r.tel2}</span></div>`:""}
${r.fax?`<div class="row"><span>Fax</span><span>${r.fax}</span></div>`:""}
${r.email?`<div class="row"><span>Email</span><span>${r.email}</span></div>`:""}
${r.siteWeb?`<div class="row"><span>Site web</span><span>${r.siteWeb}</span></div>`:""}
</div>
<div class="box"><h3>Adresse</h3>
${r.adresse?`<div class="row"><span>Adresse</span><span>${r.adresse}</span></div>`:""}
${r.ville?`<div class="row"><span>Ville</span><span>${r.cp||""} ${r.ville}</span></div>`:""}
${r.region?`<div class="row"><span>Région</span><span>${r.region}</span></div>`:""}
<div class="row"><span>Pays</span><span>${r.pays||"Maroc"}</span></div>
</div>
<div class="box"><h3>Identifiants fiscaux</h3>
${r.rc?`<div class="row"><span>RC</span><span style="font-family:monospace">${r.rc}</span></div>`:""}
${r.ice?`<div class="row"><span>ICE</span><span style="font-family:monospace">${r.ice}</span></div>`:""}
${r.if_?`<div class="row"><span>IF</span><span style="font-family:monospace">${r.if_}</span></div>`:""}
${r.patente?`<div class="row"><span>Patente</span><span style="font-family:monospace">${r.patente}</span></div>`:""}
${isCli&&r.cnss?`<div class="row"><span>CNSS</span><span style="font-family:monospace">${r.cnss}</span></div>`:""}
${r.compteComptable?`<div class="row"><span>Compte comptable</span><span style="font-family:monospace">${r.compteComptable}</span></div>`:""}
</div>
<div class="box"><h3>Conditions ${isCli?"commerciales":"achat"}</h3>
${r.modeReglement?`<div class="row"><span>Mode règlement</span><span>${r.modeReglement}</span></div>`:""}
${r.delaiPaiement?`<div class="row"><span>Délai paiement</span><span>${r.delaiPaiement} jours</span></div>`:""}
${isCli&&r.plafondCredit?`<div class="row"><span>Plafond crédit</span><span>${fmt(r.plafondCredit)} DH</span></div>`:""}
${r.remiseGlobale?`<div class="row"><span>Remise globale</span><span style="color:#d97706;font-weight:700">${r.remiseGlobale}%</span></div>`:""}
<div class="row"><span>Devise</span><span>${r.devise||"MAD (DH)"}</span></div>
${isCli&&r.commercial?`<div class="row"><span>Commercial</span><span>${r.commercial}</span></div>`:""}
${!isCli&&r.delaiLivraison?`<div class="row"><span>Délai livraison</span><span>${r.delaiLivraison} jours</span></div>`:""}
</div>
${r.notes?`<div class="box"><h3>Notes</h3><p style="line-height:1.6;margin-top:6px;font-size:12px">${r.notes}</p></div>`:""}
</div>
${docs.length>0?`<h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:10px">Derniers documents (10)</h3>
<table><thead><tr><th>N° Document</th><th>Type</th><th>Date</th><th>Statut</th><th style="text-align:right">Total TTC</th></tr></thead>
<tbody>${docRows}</tbody></table>`:""}
<div class="foot"><p>${societe.piedPage||""}</p></div>
<div class="btn" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:${cP};color:#fff;border:none;padding:10px 28px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:700">Imprimer / PDF</button></div>
</div></body></html>`;
openPrint(html);
};
const PAYS=["Maroc","France","Belgique","Espagne","Italie","Allemagne","Tunisie","Algerie","Autre"];
const MODES=["Comptant","30 jours","60 jours","90 jours","A la commande","Virement","Cheque","Traite"];
const DEVISES=["MAD (DH)","EUR","USD","GBP","CHF","AED"];
const TABS=[
{id:"coord",label:"Coordonnees"},
{id:"classif",label:"Classification"},
{id:"fiscal",label:"Identifiants fiscaux"},
{id:"commercial",label:isCli?"Conditions commerciales":"Conditions achat"},
...(isCli?[{id:"tarifs",label:"Tarifs affectés"}]:[]),
{id:"compta",label:"Comptabilité"},
...(isCli?[{id:"serie",label:"Numérotation"}]:[]),
{id:"custom",label:customFieldsDef.length>0?`Champs perso (${customFieldsDef.length})`:"Champs perso"},
];
const inputRow=(fields)=>(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
{fields.map(([k,l,type,opts])=>(
<Fld key={k} label={l} full={type==="textarea"||opts?.full}>
{type==="select"?(
<select style={S.inp} value={form[k]||""} onChange={e=>upd(k,e.target.value)}>
<option value="">--</option>
{opts.items.map(o=><option key={o}>{o}</option>)}
</select>
):type==="textarea"?(
<textarea style={{...S.inp,resize:"vertical",minHeight:60,lineHeight:1.6}} value={form[k]||""} onChange={e=>upd(k,e.target.value)}/>
):(
<input type={type||"text"} style={S.inp} value={form[k]||""} onChange={e=>upd(k,e.target.value)}/>
)}
</Fld>
))}
</div>
);
if(view==="form")return(
<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
<button style={{...S.btnS,padding:"6px 14px"}} onClick={()=>setView("list")}>Retour</button>
<div style={{width:4,height:18,background:cfg.color,borderRadius:2}}/>
<span style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>{form.id&&rows.find(r=>r.id===form.id)?"Modifier":"Nouveau"} {cfg.title.slice(0,-1)}</span>
{form.code&&<span style={{...S.badge,background:`${cfg.color}12`,color:cfg.color,fontFamily:"monospace"}}>{form.code}</span>}
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<button style={S.btnS} onClick={()=>setView("list")}>Annuler</button>
{form.id&&rows.find(r=>r.id===form.id)&&(
<button style={{...S.btnS,color:"#0891b2",borderColor:"#0891b2"}} onClick={()=>printTiers(form)}>🖨 PDF</button>
)}
<button style={{...S.btnP,background:cfg.color}} onClick={save}>Enregistrer</button>
</div>
</div>
<div style={S.card}>
<div style={{padding:20}}>
<div style={{display:"flex",gap:2,borderBottom:"2px solid #f0f4f8",marginBottom:20,flexWrap:"wrap"}}>
{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:`2.5px solid ${tab===t.id?cfg.color:"transparent"}`,marginBottom:-2,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?700:400,color:tab===t.id?cfg.color:"#64748b",whiteSpace:"nowrap"}}>{t.label}</button>)}
</div>
{tab==="coord"&&(
<div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<Fld label="Code" required>
<CodeAutoField value={form.code||""} onChange={v=>upd("code",v)} isNew={!form.id}/>
</Fld>
<Fld label="Raison sociale" required><input style={S.inp} value={form.nom||""} onChange={e=>upd("nom",e.target.value)}/></Fld>
<Fld label="Nom commercial"><input style={S.inp} value={form.nomCommercial||""} onChange={e=>upd("nomCommercial",e.target.value)}/></Fld>
{isCli&&<Fld label="Type client"><select style={S.inp} value={form.typeClient||"Entreprise"} onChange={e=>upd("typeClient",e.target.value)}><option>Entreprise</option><option>Particulier</option><option>Administration</option><option>Association</option></select></Fld>}
<Fld label="Telephone principal"><input type="tel" style={S.inp} value={form.tel||""} onChange={e=>upd("tel",e.target.value)}/></Fld>
<Fld label="Telephone secondaire"><input type="tel" style={S.inp} value={form.tel2||""} onChange={e=>upd("tel2",e.target.value)}/></Fld>
<Fld label="Fax"><input type="tel" style={S.inp} value={form.fax||""} onChange={e=>upd("fax",e.target.value)}/></Fld>
<Fld label="Email principal"><input type="email" style={S.inp} value={form.email||""} onChange={e=>upd("email",e.target.value)}/></Fld>
<Fld label="Email secondaire"><input type="email" style={S.inp} value={form.email2||""} onChange={e=>upd("email2",e.target.value)}/></Fld>
<Fld label="Site web"><input style={S.inp} value={form.siteWeb||""} onChange={e=>upd("siteWeb",e.target.value)} placeholder="www.example.com"/></Fld>
<Fld label="Adresse (ligne 1)" full><input style={S.inp} value={form.adresse||""} onChange={e=>upd("adresse",e.target.value)}/></Fld>
<Fld label="Adresse (ligne 2)" full><input style={S.inp} value={form.adresse2||""} onChange={e=>upd("adresse2",e.target.value)}/></Fld>
<Fld label="Ville"><input style={S.inp} value={form.ville||""} onChange={e=>upd("ville",e.target.value)}/></Fld>
<Fld label="Code postal"><input style={S.inp} value={form.cp||""} onChange={e=>upd("cp",e.target.value)}/></Fld>
<Fld label="Region / Province"><input style={S.inp} value={form.region||""} onChange={e=>upd("region",e.target.value)}/></Fld>
<Fld label="Pays"><select style={S.inp} value={form.pays||"Maroc"} onChange={e=>upd("pays",e.target.value)}>{PAYS.map(p=><option key={p}>{p}</option>)}</select></Fld>
<Fld label="Statut"><select style={S.inp} value={form.actif?"1":"0"} onChange={e=>upd("actif",e.target.value==="1")}><option value="1">Actif</option><option value="0">Inactif</option></select></Fld>
</div>
<Fld label="Notes / Observations" full>
<textarea style={{...S.inp,resize:"vertical",minHeight:60,lineHeight:1.6}} value={form.notes||""} onChange={e=>upd("notes",e.target.value)} placeholder="Informations complementaires..."/>
</Fld>
</div>
)}
{tab==="classif"&&(
<div>
<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13}}>
Famille et sous-famille sont <strong>obligatoires</strong> pour classer et filtrer les {cfg.title.toLowerCase()}.
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<Fld label={isCli?"Famille client":"Famille fournisseur"} required>
<SearchSelect
value={form.famille||""}
onChange={v=>setForm(p=>({...p,famille:v,sousFamille:""}))}
color={cfg.color}
placeholder="Choisir famille..."
options={(data[cfg.famKey]||[]).map(f=>({id:f.id,label:f.nom,sub:f.code}))}
/>
</Fld>
<Fld label={isCli?"Sous-famille client":"Sous-famille fournisseur"} required>
<SearchSelect
value={form.sousFamille||""}
onChange={v=>upd("sousFamille",v)}
color={cfg.color}
placeholder="Choisir sous-famille..."
disabled={!form.famille}
options={(data[cfg.sfKey]||[]).filter(f=>f.familleId===form.famille).map(f=>({id:f.id,label:f.nom,sub:f.code}))}
/>
</Fld>
</div>
</div>
)}
{tab==="fiscal"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<Fld label="RC (Registre de Commerce)"><input style={{...S.inp,fontFamily:"monospace"}} value={form.rc||""} onChange={e=>upd("rc",e.target.value)}/></Fld>
<Fld label="ICE"><input style={{...S.inp,fontFamily:"monospace"}} value={form.ice||""} onChange={e=>upd("ice",e.target.value)} placeholder="000000000000000"/></Fld>
<Fld label="Identifiant Fiscal (IF)"><input style={{...S.inp,fontFamily:"monospace"}} value={form.if_||""} onChange={e=>upd("if_",e.target.value)}/></Fld>
<Fld label="Patente"><input style={{...S.inp,fontFamily:"monospace"}} value={form.patente||""} onChange={e=>upd("patente",e.target.value)}/></Fld>
{isCli&&<Fld label="CNSS"><input style={{...S.inp,fontFamily:"monospace"}} value={form.cnss||""} onChange={e=>upd("cnss",e.target.value)}/></Fld>}
<Fld label="Compte comptable">
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",flex:1}} value={form.compteComptable||""} onChange={e=>upd("compteComptable",e.target.value)} placeholder={isCli?"3421":"4411"}/>
<select style={{...S.inp,width:200}} value={form.compteComptable||""} onChange={e=>upd("compteComptable",e.target.value)}>
<option value="">Choisir...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.type===(isCli?"client":"fournisseur")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</Fld>
</div>
)}
{tab==="commercial"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<Fld label="Mode de reglement">
<select style={S.inp} value={form.modeReglement||""} onChange={e=>upd("modeReglement",e.target.value)}>
<option value="">--</option>{MODES.map(m=><option key={m}>{m}</option>)}
</select>
</Fld>
<Fld label="Delai de paiement (jours)"><input type="number" style={S.inp} min="0" value={form.delaiPaiement||""} onChange={e=>upd("delaiPaiement",e.target.value)}/></Fld>
<Fld label={isCli?"Plafond credit (DH)":"Minimum de commande (DH)"}><input type="number" style={S.inp} min="0" value={isCli?(form.plafondCredit||""):(form.minCommande||"")} onChange={e=>upd(isCli?"plafondCredit":"minCommande",e.target.value)}/></Fld>
<Fld label="Remise globale (%)"><input type="number" style={S.inp} min="0" max="100" step="0.1" value={form.remiseGlobale||""} onChange={e=>upd("remiseGlobale",e.target.value)}/></Fld>
<Fld label="Devise">
<select style={S.inp} value={form.devise||"MAD (DH)"} onChange={e=>upd("devise",e.target.value)}>
{DEVISES.map(d=><option key={d}>{d}</option>)}
</select>
</Fld>
{isCli&&<Fld label="Commercial affecté">
<select style={S.inp} value={form.commercialId||""} onChange={e=>upd("commercialId",e.target.value)}>
<option value="">-- Aucun --</option>
{(data.commerciaux||[]).filter(c=>c.actif!==false&&(c.fonction==="commercial"||c.fonction==="directeur")).map(c=>(
<option key={c.id} value={c.id}>{c.prenom?c.prenom+" ":""}{c.nom}</option>
))}
</select>
</Fld>}
{!isCli&&<Fld label="Delai de livraison (jours)"><input type="number" style={S.inp} min="0" value={form.delaiLivraison||""} onChange={e=>upd("delaiLivraison",e.target.value)}/></Fld>}
{!isCli&&<Fld label="Reference catalogue"><input style={S.inp} value={form.catalogueRef||""} onChange={e=>upd("catalogueRef",e.target.value)}/></Fld>}
</div>
)}
{tab==="tarifs"&&isCli&&(()=>{
const tarifsClient=[];
data.articles.forEach(a=>{
(a.tarifs||[]).forEach(t=>{
if(t.actif===false)return;
const ok=t.cible==="tous"||(t.cible==="client"&&t.clientId===form.id)||(t.cible==="famille"&&t.familleClientId===form.famille);
if(ok)tarifsClient.push({...t,article:a,isSpecifique:t.cible==="client"||t.cible==="famille"});
});
});
const parArticle={};
tarifsClient.forEach(t=>{
if(!parArticle[t.article.id])parArticle[t.article.id]={article:t.article,tarifs:[]};
parArticle[t.article.id].tarifs.push(t);
});
const groupes=Object.values(parArticle).sort((a,b)=>a.article.ref.localeCompare(b.article.ref));
return(
<div>
<div style={{background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#3730a3"}}>
Tarifs applicables à ce client selon sa famille et son code.
Les tarifs "Tous" apparaissent aussi -- seul le tarif le plus favorable s'applique lors de la saisie.
</div>
{groupes.length===0&&(
<div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8"}}>
<div style={{fontSize:28,marginBottom:8}}>🏷️</div>
<div>Aucun tarif spécifique pour ce client</div>
<div style={{fontSize:12,marginTop:4}}>Les prix standards des articles s'appliquent</div>
</div>
)}
{groupes.map(({article,tarifs})=>(
<div key={article.id} style={{border:"1px solid #e2e8f0",borderRadius:8,marginBottom:10,overflow:"hidden"}}>
<div style={{background:"#f5f3ff",padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
<span style={{fontFamily:"monospace",fontWeight:700,color:"#7c3aed"}}>{article.ref}</span>
<span style={{fontWeight:600}}>{article.designation}</span>
<span style={{...S.badge,background:"#ede9fe",color:"#7c3aed",fontSize:10}}>{article.unite}</span>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr style={{background:"#f8fafc"}}>{["Tarif","Prix HT","TVA","Remise","Prix TTC","Qté min","Validité","Cible"].map(h=><th key={h} style={{...S.th,background:"#e2e8f0",color:"#64748b",fontSize:10,padding:"6px 10px"}}>{h}</th>)}</tr></thead>
<tbody>
{tarifs.map(t=>(
<tr key={t.id} style={{background:t.cible!=="tous"?"#fffbeb":"#fff"}}>
<td style={{...S.td,fontWeight:700}}>{t.nom}{t.cible!=="tous"&&<span style={{...S.badge,background:"#fef3c7",color:"#d97706",fontSize:9,marginLeft:4}}>Spécifique</span>}</td>
<td style={{...S.td,fontWeight:700,color:"#d97706"}}>{fmt(t.prixHT)} {t.devise||"DH"}</td>
<td style={S.td}>{t.tva||20}%</td>
<td style={{...S.td,color:+t.remise>0?"#d97706":"#94a3b8"}}>{t.remise||0}%</td>
<td style={{...S.td,fontWeight:700,color:"#16a34a"}}>{fmt(+t.prixHT*(1+(+t.tva||20)/100)*(1-(+t.remise||0)/100))} {t.devise||"DH"}</td>
<td style={S.td}>{t.minQte||1} {article.unite}</td>
<td style={{...S.td,fontSize:11,color:"#64748b"}}>{t.dateDebut||"--"}{t.dateFin?` → ${t.dateFin}`:""}</td>
<td style={S.td}><span style={{...S.badge,background:t.cible==="tous"?"#f1f5f9":t.cible==="client"?"#eef2ff":"#fffbeb",color:t.cible==="tous"?"#64748b":t.cible==="client"?"#1a56db":"#d97706",fontSize:10}}>{t.cible==="tous"?"Tous":t.cible==="client"?"Ce client":"Famille"}</span></td>
</tr>
))}
</tbody>
</table>
</div>
))}
</div>
);
})()}
{tab==="compta"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<div style={{gridColumn:"1/-1",marginBottom:14}}>
<label style={S.lbl}>Compte comptable principal</label>
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",width:90}} value={form.compteComptable||""} onChange={e=>upd("compteComptable",e.target.value)} placeholder={isCli?"3421":"4411"}/>
<select style={{...S.inp,flex:1}} value={form.compteComptable||""} onChange={e=>upd("compteComptable",e.target.value)}>
<option value="">Choisir un compte...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.type===(isCli?"client":"fournisseur")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</div>
<div style={{marginBottom:14}}>
<label style={S.lbl}>Compte TVA</label>
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",width:90}} value={form.compteTVA||""} onChange={e=>upd("compteTVA",e.target.value)} placeholder={isCli?"4456":"3455"}/>
<select style={{...S.inp,flex:1}} value={form.compteTVA||""} onChange={e=>upd("compteTVA",e.target.value)}>
<option value="">Choisir...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.code.startsWith("34")||c.code.startsWith("44")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</div>
<div style={{marginBottom:14}}>
<label style={S.lbl}>Compte effets</label>
<input style={{...S.inp,fontFamily:"monospace"}} value={form.compteEffets||""} onChange={e=>upd("compteEffets",e.target.value)} placeholder={isCli?"3422":"4412"}/>
</div>
<div style={{gridColumn:"1/-1",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:12}}>
<div style={{fontWeight:700,fontSize:12,color:"#16a34a",marginBottom:6}}>📋 Comptes affectés</div>
<div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12}}>
{[["Principal",form.compteComptable],["TVA",form.compteTVA],["Effets",form.compteEffets]].map(([l,v])=>v?(
<div key={l}><span style={{color:"#64748b"}}>{l} : </span><span style={{fontFamily:"monospace",fontWeight:700,color:"#16a34a"}}>{v}</span></div>
):null)}
</div>
</div>
</div>
)}
{tab==="serie"&&isCli&&(
<div>
<div style={{marginBottom:14,padding:"10px 14px",background:"#eef2ff",borderRadius:8,border:"1px solid #c7d2fe",fontSize:12,color:"#4338ca"}}>
💡 Définissez des séries de numérotation spécifiques pour ce client. Par exemple : <strong>CLI001-FV-</strong> pour les factures de ce client.
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
{[
["serieDevis","Série Devis","DV-CLI-"],
["serieBC","Série Bon de Commande","BCV-CLI-"],
["serieBL","Série Bon de Livraison","BLV-CLI-"],
["serieProforma","Série Pro Forma","PFV-CLI-"],
["serieFacture","Série Facture","FV-CLI-"],
["serieAvoir","Série Avoir","AV-CLI-"],
].map(([k,l,ph])=>(
<div key={k} style={{marginBottom:14}}>
<label style={S.lbl}>{l}</label>
<div style={{display:"flex",gap:6,alignItems:"center"}}>
<input style={{...S.inp,fontFamily:"monospace",flex:1}} value={form[k]||""} onChange={e=>upd(k,e.target.value)} placeholder={ph}/>
{form[k]&&<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",fontFamily:"monospace",fontSize:11}}>{form[k]}0001</span>}
</div>
</div>
))}
</div>
<div style={{marginTop:10,padding:"10px 14px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,color:"#64748b"}}>
ℹ️ Si aucune série n'est définie, la numérotation standard de l'ERP sera utilisée.
</div>
</div>
)}
{tab==="custom"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
{customFieldsDef.map(f=>(
<div key={f.key} style={{gridColumn:f.type==="textarea"||f.type==="checkbox"?"1/-1":"auto",marginBottom:14}}>
{f.type!=="checkbox"&&<label style={S.lbl}>{f.label}{f.required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label>}
<CustomFieldInput field={f} value={form[f.key]} onChange={v=>upd(f.key,v)}/>
</div>
))}
{customFieldsDef.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"24px 0",fontSize:13}}>
<div style={{fontSize:32,marginBottom:8}}>⚙️</div>
<div style={{color:"#64748b",fontWeight:600,marginBottom:4}}>Aucun champ personnalisé</div>
<div style={{color:"#94a3b8",fontSize:12}}>Faites défiler vers le bas pour en ajouter</div>
</div>}
</div>
)}
</div>
</div>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:700,fontSize:13,color:"#1a2332"}}>Champs personnalises -- {cfg.title}</span>
<span style={{fontSize:12,color:"#64748b",marginLeft:4}}>Disponibles pour toutes les fiches {cfg.title.toLowerCase()}</span>
</div>
<div style={{padding:"0 20px 16px"}}>
<CustomFieldsManager
fields={customFieldsDef}
setFields={nf=>setData(p=>({...p,customFields:{...p.customFields,[cfg.cfKey]:typeof nf==="function"?nf(p.customFields[cfg.cfKey]||[]):nf}}))}
/>
</div>
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
const {sel:selTiers,toggle:toggleTiers,toggleAll:toggleAllTiers,clear:clearTiers}=useRowSelect();
const tiersCopyHeaders=["Code","Raison sociale","Nom commercial","Téléphone","Email","Ville","ICE","RC","Règlement","Statut"];
const tiersCopyRows=()=>filtered.filter(r=>selTiers.has(r.id)).map(r=>({
"Code":r.code||"","Raison sociale":r.nom||"","Nom commercial":r.nomCommercial||"",
"Téléphone":r.tel||"","Email":r.email||"","Ville":r.ville||"",
"ICE":r.ice||"","RC":r.rc||"","Règlement":r.modeReglement||"",
"Statut":r.actif!==false?"Actif":"Inactif",
}));
return(
<>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontSize:18}}>{cfg.icon}</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>{cfg.title}</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{rows.length}</span>
{customFieldsDef.length>0&&<span style={{...S.badge,background:"#f0fdf4",color:"#16a34a",marginLeft:4}}>+{customFieldsDef.length} champ(s)</span>}
<div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
<SelectBar sel={selTiers} allIds={filtered.map(r=>r.id)} onToggleAll={toggleAllTiers} onClear={clearTiers}
onCopy={()=>copyToExcel(tiersCopyHeaders,tiersCopyRows())}/>
<input placeholder="Recherche rapide..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:150}}/>
{hasActiveFilters&&<button onClick={()=>setColFilters({})} style={{...S.btnS,color:"#dc2626",borderColor:"#fecaca",fontSize:11}}>✕ Filtres</button>}
<ColonnesChoisir allCols={ALL_COLS_TIERS} visible={visCols} setVisible={setVisCols} listKey={"tiers_"+type}/>
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac"}} onClick={()=>{
const cols=[
{label:"Code",key:"code"},{label:"Raison sociale",key:"nom"},{label:"Nom commercial",key:"nomCommercial"},
{label:"Telephone",key:"tel"},{label:"Email",key:"email"},{label:"Ville",key:"ville"},
{label:"ICE",key:"ice"},{label:"RC",key:"rc"},
{label:"Famille",get:r=>getFamNom(r.famille)},
{label:"Sous-famille",get:r=>getSFNom(r.sousFamille)},
{label:"Mode reglement",key:"modeReglement"},{label:"Notes",key:"notes"},
...customFieldsDef.map(f=>({label:f.label,key:f.key})),
];
exportToExcel(filtered,cols,(isCli?"clients":"fournisseurs"));
}}>⬇ Excel</button>
<button style={{...S.btnP,background:cfg.color}} onClick={openNew}>+ Nouveau</button>
</div>
</div>
<VueBar listKey={"tiers_"+type} cols={visCols} filters={colFilters} setFilters={setColFilters} setCols={setVisCols} allCols={ALL_COLS_TIERS}>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr>
<th style={{...S.th,width:36,textAlign:"center"}}>
<input type="checkbox" checked={filtered.length>0&&filtered.every(r=>selTiers.has(r.id))}
onChange={()=>toggleAllTiers(filtered.map(r=>r.id))}
style={{accentColor:"#1a56db",width:14,height:14}}/>
</th>
{visCols.includes("code")     &&<FilterTh label="Code"          col="code"      filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("nom")      &&<FilterTh label="Raison sociale" col="nom"       filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("nomCom")   &&<FilterTh label="Nom commercial" col="nomCom"    filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("famille")  &&<FilterTh label="Famille"        col="famille"   filters={colFilters} setFilters={setColFilters} type="select" options={[...new Set((data[cfg.famKey]||[]).map(f=>f.nom))]}/>}
{visCols.includes("sousFam")  &&<FilterTh label="Sous-famille"   col="sousFam"   filters={colFilters} setFilters={setColFilters} type="select" options={[...new Set((data[cfg.sfKey]||[]).map(f=>f.nom))]}/>}
{visCols.includes("tel")      &&<FilterTh label="Téléphone"      col="tel"       filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("email")    &&<FilterTh label="Email"          col="email"     filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("ville")    &&<FilterTh label="Ville"          col="ville"     filters={colFilters} setFilters={setColFilters} type="select" options={[...new Set(rows.map(r=>r.ville).filter(Boolean))]}/>}
{visCols.includes("ice")      &&<FilterTh label="ICE"            col="ice"       filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("rc")       &&<FilterTh label="RC"             col="rc"        filters={colFilters} setFilters={setColFilters}/>}
{visCols.includes("reglement")&&<FilterTh label="Règlement"      col="reglement" filters={colFilters} setFilters={setColFilters} type="select" options={["Comptant","30 jours","60 jours","90 jours"]}/>}
{visCols.includes("actif")    &&<FilterTh label="Statut"         col="actif"     filters={colFilters} setFilters={setColFilters} type="select" options={["Actif","Inactif"]}/>}
{customFieldsDef.filter(f=>visCols.includes("cf_"+f.key)).map(f=>(
<FilterTh key={f.key} label={"★ "+f.label} col={"cf_"+f.key} filters={colFilters} setFilters={setColFilters}/>
))}
<th style={S.th}>Actions</th>
</tr>
</thead>
<tbody>
{filtered.length===0&&<tr><td colSpan={visCols.length+1} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>Aucun enregistrement</td></tr>}
{filtered.map(r=>(
<tr key={r.id}
onClick={e=>{if(e.target.type==="checkbox")return;}}
onDoubleClick={()=>openEdit(r)} style={{cursor:"pointer",transition:"background .1s",background:selTiers.has(r.id)?"#eef2ff":""}} title="Double-clic pour modifier"
onMouseEnter={e=>{if(!selTiers.has(r.id))e.currentTarget.style.background="#f0f7ff"}}
onMouseLeave={e=>{if(!selTiers.has(r.id))e.currentTarget.style.background=""}}>
<td style={{...S.td,textAlign:"center",width:36}} onClick={e=>e.stopPropagation()}>
<input type="checkbox" checked={selTiers.has(r.id)} onChange={()=>toggleTiers(r.id)}
style={{accentColor:"#1a56db",width:14,height:14,cursor:"pointer"}}/>
</td>
{visCols.includes("code")     &&<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:cfg.color}}>{r.code}</td>}
{visCols.includes("nom")      &&<td style={S.td}><div style={{fontWeight:600}}>{r.nom}</div></td>}
{visCols.includes("nomCom")   &&<td style={S.td}>{r.nomCommercial||"--"}</td>}
{visCols.includes("famille")  &&<td style={S.td}>{r.famille?<span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed"}}>{getFamNom(r.famille)}</span>:<span style={{color:"#dc2626",fontSize:11}}>⚠</span>}</td>}
{visCols.includes("sousFam")  &&<td style={S.td}>{r.sousFamille?<span style={{...S.badge,background:"#ecfeff",color:"#0891b2"}}>{getSFNom(r.sousFamille)}</span>:<span style={{color:"#dc2626",fontSize:11}}>⚠</span>}</td>}
{visCols.includes("tel")      &&<td style={S.td}>{r.tel||"--"}</td>}
{visCols.includes("email")    &&<td style={S.td}>{r.email||"--"}</td>}
{visCols.includes("ville")    &&<td style={S.td}>{r.ville||"--"}</td>}
{visCols.includes("ice")      &&<td style={{...S.td,fontFamily:"monospace",fontSize:11}}>{r.ice||"--"}</td>}
{visCols.includes("rc")       &&<td style={{...S.td,fontFamily:"monospace",fontSize:11}}>{r.rc||"--"}</td>}
{visCols.includes("reglement")&&<td style={S.td}><span style={{fontSize:12,color:"#64748b"}}>{r.modeReglement||"--"}</span></td>}
{visCols.includes("actif")    &&<td style={S.td}><span style={{...S.badge,background:r.actif!==false?"#f0fdf4":"#fef2f2",color:r.actif!==false?"#16a34a":"#ef4444"}}>{r.actif!==false?"Actif":"Inactif"}</span></td>}
{customFieldsDef.filter(f=>visCols.includes("cf_"+f.key)).map(f=>(
<td key={f.key} style={S.td}>
{f.type==="checkbox"
?<span style={{...S.badge,background:r[f.key]?"#f0fdf4":"#f8fafc",color:r[f.key]?"#16a34a":"#94a3b8"}}>{r[f.key]?"✓ Oui":"✗ Non"}</span>
:<span style={{fontSize:12}}>{r[f.key]||"--"}</span>}
</td>
))}
<td style={S.td}>
<button style={S.btnSm} onClick={()=>openEdit(r)}>✏️</button>
<button style={{...S.btnSm,marginLeft:4}} onClick={()=>printTiers(r)} title="Imprimer fiche">🖨</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(r.id,`${r.code} -- ${r.nom}`)}>🗑</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
<div style={{padding:"7px 20px",color:"#94a3b8",fontSize:11}}>{filtered.length} enregistrement(s)</div>
</VueBar>
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
{deleteModal}
</>
);
}
function ArticlesModule({data,setData}){
const [view,setView]=useState("list");
const [editId,setEditId]=useState(null);
const [search,setSearch]=useState("");
const [colFiltersArt,setColFiltersArt]=useState({});
const [stockModal,setStockModal]=useState(null);
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const {checkAndDelete, modal:deleteModal} = useSecureDelete(data,setData);
const del=(id,nom)=>checkAndDelete("article", id, nom||id);
const getFam=(id)=>data.famillesArticle.find(f=>f.id===id)?.nom||"-";
const getSF =(id)=>data.sousFamillesArticle.find(f=>f.id===id)?.nom||"-";
const ART_COL_MAP={
ref:a=>a.ref, design:a=>a.designation, famille:a=>getFam(a.famille),
sousFam:a=>getSF(a.sousFamille), unite:a=>a.unite, marque:a=>a.marque,
prixAchat:a=>a.prixAchat, prixVente:a=>a.prixVente, tva:a=>a.tva,
stock:a=>stockTotal(data.stockDepots,a.id), actif:a=>a.actif!==false?"Actif":"Inactif",
};
const filtered=applyFilters(
data.articles.filter(a=>!search||[a.ref,a.designation,a.marque].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase()))),
colFiltersArt, ART_COL_MAP
);
const hasActiveFiltersArt=Object.values(colFiltersArt).some(v=>!!v);
const customFieldsDef=data.customFields?.article||[];
const ALL_COLS_ART=[
{id:"ref",      label:"Référence"},
{id:"design",   label:"Désignation"},
{id:"famille",  label:"Famille"},
{id:"sousFam",  label:"Sous-famille"},
{id:"unite",    label:"Unité"},
{id:"marque",   label:"Marque"},
{id:"prixAchat",label:"Prix achat"},
{id:"prixVente",label:"Prix vente"},
{id:"tva",      label:"TVA %"},
{id:"stock",    label:"Stock"},
{id:"tarifs",   label:"Tarifs"},
{id:"actif",    label:"Statut"},
...customFieldsDef.map(f=>({id:"cf_"+f.key,label:"★ "+f.label,cfKey:f.key})),
];
const DEF_COLS_ART=["ref","design","famille","sousFam","unite","prixVente","stock","actif"];
const [visColsArt,setVisColsArtRaw]=useState(()=>LS.get("lgm_cols_articles")||[...DEF_COLS_ART]);
const {sel:selArt,toggle:toggleArt,toggleAll:toggleAllArt,clear:clearArt}=useRowSelect();
const setVisColsArt=(v)=>{ LS.set("lgm_cols_articles",v); setVisColsArtRaw(v); };
const printArticle=(a)=>{
const fam=getFam(a.famille); const sf=getSF(a.sousFamille);
const {societe}=data;
const cP=societe.couleurPrincipale||"#1a2332";
const cA=societe.couleurAccent||"#e8a020";
const tot=stockTotal(data.stockDepots,a.id);
const stockRows=data.depots.map(d=>{
const ag=data.agences.find(x=>x.id===d.agenceId);
const ds=data.stockDepots[a.id]?.[d.id];
const q=ds?.qte||0;
return`<tr><td style="padding:6px 10px;font-family:monospace;font-weight:700;color:#16a34a">${d.code}</td>
<td style="padding:6px 10px">${d.nom}</td>
<td style="padding:6px 10px;color:#64748b">${ag?.nom||"--"}</td>
<td style="padding:6px 10px;font-family:monospace;color:#0891b2">${ds?.emplacement||"--"}</td>
<td style="padding:6px 10px;text-align:right;font-weight:800;color:${q>0?"#16a34a":"#dc2626"}">${q}</td></tr>`;
}).join("");
const tarifRows=(a.tarifs||[]).map(t=>`<tr>
<td style="padding:5px 8px">${t.nom}</td>
<td style="padding:5px 8px;font-weight:700;color:#d97706">${fmt(t.prixHT)} ${t.devise||"DH"}</td>
<td style="padding:5px 8px">${t.tva||20}%</td>
<td style="padding:5px 8px;color:#d97706">${t.remise||0}%</td>
<td style="padding:5px 8px">${t.minQte||1} ${a.unite}</td>
<td style="padding:5px 8px;color:#64748b">${t.cible==="tous"?"Tous":t.cible==="famille"?data.famillesClient.find(f=>f.id===t.familleClientId)?.nom||"--":data.clients.find(c=>c.id===t.clientId)?.nom||"--"}</td>
</tr>`).join("");
const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Fiche Article ${a.ref}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1a2332;}
.p{padding:32px;max-width:860px;margin:0 auto;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid ${cA};}
.logo{background:${cP};color:#fff;padding:12px 20px;border-radius:8px;}.logo h1{font-size:20px;font-weight:900;}.logo p{font-size:9px;letter-spacing:.1em;color:${cA};margin-top:2px;}
.ref{background:${cP};color:${cA};padding:16px 22px;border-radius:8px;text-align:right;}
.ref h2{font-size:22px;font-weight:900;font-family:monospace;}.ref p{font-size:11px;opacity:.7;margin-top:3px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;}
.box h3{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;font-weight:700;margin-bottom:10px;}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f4f8;font-size:12px;}
.row span:first-child{color:#64748b;}.row span:last-child{font-weight:600;}
table{width:100%;border-collapse:collapse;margin-bottom:16px;}
th{background:${cP};color:#fff;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:7px 10px;text-align:left;}
td{padding:6px 10px;border-bottom:1px solid #e8edf2;}
.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
.k{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;}
.k .v{font-size:18px;font-weight:800;color:#7c3aed}.k .l{font-size:9px;color:#94a3b8;margin-top:2px;}
.foot{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;}
@media print{.btn{display:none;}}
</style></head><body><div class="p">
<div class="hdr">
<div class="logo"><h1>${societe.nomCommercial||"MGCLOUD"}</h1><p>GARANTIE DISTRIBUTION</p></div>
<div class="ref"><h2>${a.ref}</h2><p>Fiche Article · ${today()}</p></div>
</div>
<div class="kpi">
<div class="k"><div class="v" style="color:#d97706">${fmt(a.prixVente)}</div><div class="l">Prix vente HT</div></div>
<div class="k"><div class="v">${fmt(a.prixAchat)}</div><div class="l">Prix achat HT</div></div>
<div class="k"><div class="v" style="color:${tot<=0?"#dc2626":tot<=a.stockMin?"#d97706":"#16a34a"}">${tot}</div><div class="l">Stock total</div></div>
<div class="k"><div class="v">${a.tva||20}%</div><div class="l">TVA</div></div>
</div>
<div class="g2">
<div class="box"><h3>Identification</h3>
<div class="row"><span>Désignation</span><span>${a.designation}</span></div>
${a.designationAr?`<div class="row"><span>Désignation AR</span><span>${a.designationAr}</span></div>`:""}
<div class="row"><span>Famille</span><span>${fam}</span></div>
<div class="row"><span>Sous-famille</span><span>${sf}</span></div>
<div class="row"><span>Unité</span><span>${a.unite}</span></div>
${a.marque?`<div class="row"><span>Marque</span><span>${a.marque}</span></div>`:""}
${a.origine?`<div class="row"><span>Origine</span><span>${a.origine}</span></div>`:""}
${a.codeBarre?`<div class="row"><span>Code barres</span><span style="font-family:monospace">${a.codeBarre}</span></div>`:""}
${a.poids?`<div class="row"><span>Poids</span><span>${a.poids} kg</span></div>`:""}
${a.dimensions?`<div class="row"><span>Dimensions</span><span>${a.dimensions}</span></div>`:""}
</div>
<div class="box"><h3>Stock et Seuils</h3>
<div class="row"><span>Stock minimum</span><span>${a.stockMin} ${a.unite}</span></div>
<div class="row"><span>Stock maximum</span><span>${a.stockMax} ${a.unite}</span></div>
<div class="row"><span>Seuil réappro.</span><span>${a.stockAlerte||a.stockMin} ${a.unite}</span></div>
<div class="row"><span>Prix vente HT</span><span style="color:#d97706;font-weight:800">${fmt(a.prixVente)} DH</span></div>
<div class="row"><span>Prix vente TTC</span><span style="font-weight:700">${fmt(a.prixVente*(1+(a.tva||20)/100))} DH</span></div>
<div class="row"><span>Prix achat HT</span><span>${fmt(a.prixAchat)} DH</span></div>
<div class="row"><span>Marge brute</span><span style="color:#16a34a;font-weight:700">${fmt(a.prixVente-a.prixAchat)} DH (${a.prixAchat>0?Math.round((a.prixVente-a.prixAchat)/a.prixAchat*100):0}%)</span></div>
</div>
</div>
${a.description?`<div class="box" style="margin-bottom:16px"><h3>Description</h3><p style="line-height:1.6;margin-top:6px">${a.description}</p></div>`:""}
<h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:10px">Stock par dépôt</h3>
<table><thead><tr><th>Code dépôt</th><th>Nom</th><th>Agence</th><th>Emplacement</th><th style="text-align:right">Quantité</th></tr></thead>
<tbody>${stockRows}</tbody>
<tfoot><tr style="background:#1a2332"><td colspan="4" style="padding:8px 10px;color:#a8b8cc;font-weight:700">TOTAL STOCK</td><td style="padding:8px 10px;text-align:right;color:${tot>0?"#86efac":"#fca5a5"};font-weight:800;font-size:15px">${tot} ${a.unite}</td></tr></tfoot>
</table>
${(a.tarifs||[]).length>0?`<h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:10px">Tarifs</h3>
<table><thead><tr><th>Nom tarif</th><th>Prix HT</th><th>TVA</th><th>Remise</th><th>Qté min</th><th>Cible</th></tr></thead><tbody>${tarifRows}</tbody></table>`:""}
<div class="foot"><p>${societe.piedPage||""}</p></div>
<div class="btn" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:${cP};color:#fff;border:none;padding:10px 28px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:700">Imprimer / PDF</button></div>
</div></body></html>`;
openPrint(html);
};
if(view==="form")return(
<ArticleForm data={data} setData={setData} articleId={editId}
onSaved={(nom)=>{showToast(`Article "${nom}" enregistre !`);setView("list");setEditId(null);}}
onCancel={()=>{setView("list");setEditId(null);}}
/>
);
return(
<>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontSize:18}}>🔩</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>Articles</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{data.articles.length}</span>
<div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
<SelectBar sel={selArt} allIds={filtered.map(a=>a.id)} onToggleAll={toggleAllArt} onClear={clearArt}
onCopy={()=>copyToExcel(["Référence","Désignation","Famille","Sous-famille","Unité","Marque","Prix achat HT","Prix vente HT","TVA%","Stock","Statut"],artCopyRows())}/>
<input placeholder="Recherche rapide..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:150}}/>
{hasActiveFiltersArt&&<button onClick={()=>setColFiltersArt({})} style={{...S.btnS,color:"#dc2626",borderColor:"#fecaca",fontSize:11}}>✕ Filtres</button>}
<ColonnesChoisir allCols={ALL_COLS_ART} visible={visColsArt} setVisible={setVisColsArt} listKey="articles"/>
<button style={{...S.btnP,background:"#7c3aed"}} onClick={()=>{setEditId(null);setView("form");}}>+ Nouvel article</button>
</div>
</div>
<VueBar listKey="articles" cols={visColsArt} filters={colFiltersArt} setFilters={setColFiltersArt} setCols={setVisColsArt} allCols={ALL_COLS_ART}>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr>
<th style={{...S.th,width:36,textAlign:"center"}}>
<input type="checkbox" checked={filtered.length>0&&filtered.every(a=>selArt.has(a.id))}
onChange={()=>toggleAllArt(filtered.map(a=>a.id))}
style={{accentColor:"#1a56db",width:14,height:14}}/>
</th>
{visColsArt.includes("ref")      &&<FilterTh label="Référence"   col="ref"      filters={colFiltersArt} setFilters={setColFiltersArt}/>}
{visColsArt.includes("design")   &&<FilterTh label="Désignation" col="design"   filters={colFiltersArt} setFilters={setColFiltersArt}/>}
{visColsArt.includes("famille")  &&<FilterTh label="Famille"     col="famille"  filters={colFiltersArt} setFilters={setColFiltersArt} type="select" options={[...new Set(data.famillesArticle.map(f=>f.nom))]}/>}
{visColsArt.includes("sousFam")  &&<FilterTh label="Sous-famille"col="sousFam"  filters={colFiltersArt} setFilters={setColFiltersArt} type="select" options={[...new Set(data.sousFamillesArticle.map(f=>f.nom))]}/>}
{visColsArt.includes("unite")    &&<FilterTh label="Unité"       col="unite"    filters={colFiltersArt} setFilters={setColFiltersArt} type="select" options={[...new Set(data.articles.map(a=>a.unite).filter(Boolean))]}/>}
{visColsArt.includes("marque")   &&<FilterTh label="Marque"      col="marque"   filters={colFiltersArt} setFilters={setColFiltersArt}/>}
{visColsArt.includes("prixAchat")&&<th style={S.th}>Px Achat</th>}
{visColsArt.includes("prixVente")&&<th style={S.th}>Px Vente</th>}
{visColsArt.includes("tva")      &&<FilterTh label="TVA"         col="tva"      filters={colFiltersArt} setFilters={setColFiltersArt} type="select" options={["0","7","10","14","20"]}/>}
{visColsArt.includes("stock")    &&<th style={S.th}>Stock</th>}
{visColsArt.includes("tarifs")   &&<th style={S.th}>Tarifs</th>}
{visColsArt.includes("actif")    &&<FilterTh label="Statut"      col="actif"    filters={colFiltersArt} setFilters={setColFiltersArt} type="select" options={["Actif","Inactif"]}/>}
{customFieldsDef.filter(f=>visColsArt.includes("cf_"+f.key)).map(f=>(
<FilterTh key={f.key} label={"★ "+f.label} col={"cf_"+f.key} filters={colFiltersArt} setFilters={setColFiltersArt}/>
))}
<th style={S.th}>Actions</th>
</tr>
</thead>
<tbody>
{filtered.length===0&&<tr><td colSpan={visColsArt.length+1} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>Aucun article</td></tr>}
{filtered.map(a=>{
const tot=stockTotal(data.stockDepots,a.id);
const st=tot<=0?"Rupture":tot<=a.stockMin?"Critique":"Normal";
const sc={"Rupture":"#dc2626","Critique":"#d97706","Normal":"#16a34a"}[st];
const stockParAgence=data.agences.map(ag=>{
const deps=data.depots.filter(d=>d.agenceId===ag.id);
const q=deps.reduce((s,d)=>s+(data.stockDepots[a.id]?.[d.id]?.qte||0),0);
return{ag,q};
}).filter(x=>x.q>0);
return(
<tr key={a.id} onDoubleClick={()=>{setEditId(a.id);setView("form");}} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
{visColsArt.includes("ref")      &&<td style={{...S.td,color:"#7c3aed",fontWeight:700,fontFamily:"monospace"}}>{a.ref}</td>}
{visColsArt.includes("design")   &&<td style={S.td}><div style={{fontWeight:600}}>{a.designation}</div><div style={{fontSize:11,color:"#94a3b8"}}>{a.marque}{a.origine?` · ${a.origine}`:""}</div></td>}
{visColsArt.includes("famille")  &&<td style={S.td}>{a.famille?<span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed"}}>{getFam(a.famille)}</span>:<span style={{color:"#dc2626",fontSize:11}}>⚠</span>}</td>}
{visColsArt.includes("sousFam")  &&<td style={S.td}>{a.sousFamille?<span style={{...S.badge,background:"#ecfeff",color:"#0891b2"}}>{getSF(a.sousFamille)}</span>:<span style={{color:"#dc2626",fontSize:11}}>⚠</span>}</td>}
{visColsArt.includes("unite")    &&<td style={S.td}>{a.unite}</td>}
{visColsArt.includes("marque")   &&<td style={S.td}>{a.marque||"--"}</td>}
{visColsArt.includes("prixAchat")&&<td style={S.td}>{fmt(a.prixAchat)}</td>}
{visColsArt.includes("prixVente")&&<td style={{...S.td,fontWeight:700,color:"#d97706"}}>{fmt(a.prixVente)}</td>}
{visColsArt.includes("tva")      &&<td style={S.td}>{a.tva}%</td>}
{visColsArt.includes("stock")    &&<td style={S.td}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:800,fontSize:15,color:sc}}>{tot}</span>{stockParAgence.length>0&&<button onClick={()=>setStockModal(a)} style={{...S.btnSm,fontSize:10,padding:"2px 7px",color:"#1a56db",border:"1px solid #c7d2fe",background:"#eef2ff"}}>📊</button>}</div></td>}
{visColsArt.includes("tarifs")   &&<td style={S.td}>{(a.tarifs||[]).length>0?<span style={{...S.badge,background:"#eef2ff",color:"#1a56db"}}>{(a.tarifs||[]).length} tarif{(a.tarifs||[]).length>1?"s":""}</span>:<span style={{color:"#94a3b8",fontSize:11}}>--</span>}</td>}
{visColsArt.includes("actif")    &&<td style={S.td}><span style={{...S.badge,background:a.actif!==false?"#f0fdf4":"#fef2f2",color:a.actif!==false?"#16a34a":"#ef4444"}}>{a.actif!==false?"Actif":"Inactif"}</span></td>}
{customFieldsDef.filter(f=>visColsArt.includes("cf_"+f.key)).map(f=>(
<td key={f.key} style={S.td}>
{f.type==="checkbox"
?<span style={{...S.badge,background:a[f.key]?"#f0fdf4":"#f8fafc",color:a[f.key]?"#16a34a":"#94a3b8"}}>{a[f.key]?"✓ Oui":"✗ Non"}</span>
:<span style={{fontSize:12}}>{a[f.key]||"--"}</span>}
</td>
))}
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setEditId(a.id);setView("form");}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4}} onClick={()=>printArticle(a)} title="Imprimer fiche">🖨</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(a.id,`${a.ref} -- ${a.designation}`)}>🗑</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
<div style={{padding:"7px 20px",color:"#64748b",fontSize:11,borderTop:"1px solid #f0f4f8",display:"flex",justifyContent:"space-between"}}>
<span>{data.articles.length} articles</span>
<span style={{fontWeight:700}}>Valeur stock: {fmt(data.articles.reduce((s,a)=>s+stockTotal(data.stockDepots,a.id)*a.prixAchat,0))} DH</span>
</div>
</VueBar>
</div>
{stockModal&&(
<Modal title={`Stock -- ${stockModal.ref} · ${stockModal.designation}`} onClose={()=>setStockModal(null)} width={600}>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,marginBottom:16}}>
{data.agences.map(ag=>{
const deps=data.depots.filter(d=>d.agenceId===ag.id);
const totAg=deps.reduce((s,d)=>s+(data.stockDepots[stockModal.id]?.[d.id]?.qte||0),0);
return(
<div key={ag.id} style={{background:"#f8fafc",border:`1.5px solid ${totAg>0?"#86efac":"#e2e8f0"}`,borderRadius:8,padding:"12px 14px"}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
<span style={{fontWeight:700,color:"#1a2332"}}>{ag.nom}</span>
<span style={{marginLeft:"auto",fontWeight:800,fontSize:18,color:totAg>0?"#16a34a":"#94a3b8"}}>{totAg}</span>
<span style={{fontSize:11,color:"#64748b"}}>{stockModal.unite}</span>
</div>
{deps.map(d=>{
const ds=data.stockDepots[stockModal.id]?.[d.id];
const q=ds?.qte||0;
return(
<div key={d.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderTop:"1px solid #f0f4f8",fontSize:12}}>
<span style={{...S.badge,background:"#f0fdf4",color:"#16a34a",fontFamily:"monospace",fontSize:10}}>{d.code}</span>
<span style={{color:"#64748b",flex:1}}>{d.nom}</span>
{ds?.emplacement&&<span style={{fontFamily:"monospace",color:"#0891b2",fontSize:10}}>{ds.emplacement}</span>}
<span style={{fontWeight:700,color:q>0?"#16a34a":"#d1d9e0"}}>{q}</span>
</div>
);
})}
</div>
);
})}
</div>
<div style={{background:"#1a2332",borderRadius:8,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{color:"#a8b8cc",fontWeight:700}}>TOTAL STOCK</span>
<span style={{color:"#e8a020",fontWeight:900,fontSize:20}}>{stockTotal(data.stockDepots,stockModal.id)} {stockModal.unite}</span>
</div>
<div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
<button onClick={()=>printArticle(stockModal)} style={{...S.btnP,background:"#7c3aed"}}>🖨 Imprimer fiche</button>
</div>
</Modal>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
{deleteModal}
</>
);
}
function ArticleForm({data,setData,articleId,onSaved,onCancel}){
const editing=articleId?data.articles.find(a=>a.id===articleId):null;
const customFieldsDef=data.customFields.article||[];
const UNITES=["Piece","Bidon","Litre","Kit","Carton","Boite","Kg","Tonne","Metre","M2","M3","Palette","Lot","Forfait"];
const DEVISES=["MAD (DH)","EUR","USD","GBP","CHF","AED"];
const blankTarif=()=>({
id:uid("TAR"), nom:"Tarif standard", prixHT:"", devise:"MAD (DH)", unite:"",
remise:"0", tva:"20", cible:"tous", familleClientId:"", clientId:"",
dateDebut:"", dateFin:"", minQte:"1", actif:true, notes:""
});
const initForm=()=>{
const cpt = data.compteurs?.article || COMPTEURS_DEF.article;
const ref = genNum(cpt);
const base=editing?{...editing}:{
ref:editing?.ref||ref,
designation:"", designationAr:"", famille:"", sousFamille:"",
unite:"Piece", unite2:"", coeffConversion:"",
prixAchat:"", prixVente:"", tva:"20",
stockMin:5, stockMax:100, stockAlerte:10,
marque:"", origine:"", codeBarre:"", codeInterne:"",
poids:"", dimensions:"", description:"",
actif:true, tarifs:[blankTarif()],
};
if(!base.tarifs)base.tarifs=[blankTarif()];
customFieldsDef.forEach(f=>{if(base[f.key]===undefined)base[f.key]=f.type==="checkbox"?false:"";});
return base;
};
const [form,setForm]=useState(initForm);
const [tab,setTab]=useState("id");
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),3000);};
const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
const updTarif=(id,k,v)=>setForm(p=>({...p,tarifs:p.tarifs.map(t=>t.id===id?{...t,[k]:v}:t)}));
const addTarif=()=>setForm(p=>({...p,tarifs:[...p.tarifs,{...blankTarif(),nom:`Tarif ${p.tarifs.length+1}`}]}));
const delTarif=(id)=>setForm(p=>({...p,tarifs:p.tarifs.filter(t=>t.id!==id)}));
const pa=parseFloat(form.prixAchat)||0;
const pv=parseFloat(form.prixVente)||0;
const marge=pv-pa;
const margePct=pa>0?Math.round((marge/pa)*100):0;
const tvaN=parseInt(form.tva)||20;
const save=()=>{
if(!form.ref?.trim()||!form.designation?.trim()) return showToast("Reference et designation obligatoires",false);
if(!form.famille) return showToast("La famille est obligatoire",false);
if(!form.sousFamille) return showToast("La sous-famille est obligatoire",false);
if(!form.prixAchat||!form.prixVente) return showToast("Les prix sont obligatoires",false);
const rec={
...form,
id:editing?.id||uid("ART"),
prixAchat:parseFloat(form.prixAchat)||0,
prixVente:parseFloat(form.prixVente)||0,
tva:parseInt(form.tva)||20,
stockMin:parseInt(form.stockMin)||0,
stockMax:parseInt(form.stockMax)||0,
stockAlerte:parseInt(form.stockAlerte)||0,
};
const isNewArt = !data.articles.find(a=>a.id===rec.id);
setData(p=>{
const cpt=p.compteurs?.article||COMPTEURS_DEF.article;
return {
...p,
articles:p.articles.find(a=>a.id===rec.id)?p.articles.map(a=>a.id===rec.id?rec:a):[...p.articles,rec],
...(isNewArt?{compteurs:{...p.compteurs,article:{...cpt,seq:(cpt.seq||1)+1}}}:{}),
};
});
onSaved(form.designation);
};
const TABS=[
{id:"id",      label:"Identification"},
{id:"classif", label:"Classification"},
{id:"prix",    label:"Prix & Stock"},
{id:"tarifs",  label:`Tarifs (${(form.tarifs||[]).length})`},
{id:"compta",  label:"Comptabilité"},
{id:"custom",  label:customFieldsDef.length>0?`Champs perso (${customFieldsDef.length})`:"Champs perso"},
];
return(
<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
<button style={{...S.btnS,padding:"6px 14px"}} onClick={onCancel}>Retour</button>
<div style={{width:4,height:18,background:"#7c3aed",borderRadius:2}}/>
<span style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>{editing?"Modifier":"Nouvel"} article</span>
{editing&&<span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed",fontFamily:"monospace"}}>{editing.ref}</span>}
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<button style={S.btnS} onClick={onCancel}>Annuler</button>
<button style={{...S.btnP,background:"#7c3aed"}} onClick={save}>Enregistrer</button>
</div>
</div>
<div style={S.card}>
<div style={{padding:20}}>
<div style={{display:"flex",gap:2,borderBottom:"2px solid #f0f4f8",marginBottom:20,flexWrap:"wrap"}}>
{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:`2.5px solid ${tab===t.id?"#7c3aed":"transparent"}`,marginBottom:-2,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?700:400,color:tab===t.id?"#7c3aed":"#64748b",whiteSpace:"nowrap"}}>{t.label}</button>)}
</div>
{tab==="id"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<Fld label="Reference" required>
<CodeAutoField value={form.ref||""} onChange={v=>upd("ref",v)} isNew={!editing}/>
</Fld>
<Fld label="Designation (FR)" required><input style={S.inp} value={form.designation||""} onChange={e=>upd("designation",e.target.value)}/></Fld>
<Fld label="Designation (AR / autre langue)"><input style={{...S.inp,direction:"rtl"}} value={form.designationAr||""} onChange={e=>upd("designationAr",e.target.value)}/></Fld>
<Fld label="Code interne"><input style={{...S.inp,fontFamily:"monospace"}} value={form.codeInterne||""} onChange={e=>upd("codeInterne",e.target.value)}/></Fld>
<Fld label="Code barres (EAN13 / QR)"><input style={{...S.inp,fontFamily:"monospace"}} value={form.codeBarre||""} onChange={e=>upd("codeBarre",e.target.value)}/></Fld>
<Fld label="Marque"><input style={S.inp} value={form.marque||""} onChange={e=>upd("marque",e.target.value)}/></Fld>
<Fld label="Origine / Pays fabrication"><input style={S.inp} value={form.origine||""} onChange={e=>upd("origine",e.target.value)}/></Fld>
<Fld label="Unite principale">
<select style={S.inp} value={form.unite||"Piece"} onChange={e=>upd("unite",e.target.value)}>
{UNITES.map(u=><option key={u}>{u}</option>)}
</select>
</Fld>
<Fld label="Unite secondaire (conditionnement)">
<select style={S.inp} value={form.unite2||""} onChange={e=>upd("unite2",e.target.value)}>
<option value="">-- Aucune --</option>
{UNITES.map(u=><option key={u}>{u}</option>)}
</select>
</Fld>
{form.unite2&&<Fld label={`Coeff. conv. (1 ${form.unite2} = ? ${form.unite})`}><input type="number" min="0" step="0.001" style={S.inp} value={form.coeffConversion||""} onChange={e=>upd("coeffConversion",e.target.value)}/></Fld>}
<Fld label="Poids (kg)"><input type="number" step="0.001" style={S.inp} value={form.poids||""} onChange={e=>upd("poids",e.target.value)}/></Fld>
<Fld label="Dimensions (L x l x H cm)"><input style={S.inp} value={form.dimensions||""} onChange={e=>upd("dimensions",e.target.value)} placeholder="Ex: 30x20x15"/></Fld>
<Fld label="Statut article" full>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
{/* Actif / En sommeil */}
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px"}}>
<div style={{fontWeight:600,fontSize:12,marginBottom:8,color:"#1a2332"}}>Activité</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
{[{v:"actif",l:"Actif",c:"#16a34a",bg:"#f0fdf4"},{v:"sommeil",l:"En sommeil",c:"#d97706",bg:"#fffbeb"},{v:"inactif",l:"Inactif",c:"#dc2626",bg:"#fef2f2"}].map(s=>(
<button key={s.v} type="button"
onClick={()=>upd("statutActivite",s.v)}
style={{padding:"4px 10px",borderRadius:20,border:"2px solid "+((form.statutActivite||"actif")===s.v?s.c:"#e2e8f0"),background:(form.statutActivite||"actif")===s.v?s.bg:"#fff",color:(form.statutActivite||"actif")===s.v?s.c:"#94a3b8",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
{s.l}
</button>
))}
</div>
<div style={{fontSize:10,color:"#94a3b8",marginTop:6}}>
{(form.statutActivite||"actif")==="sommeil"?"Article suspendu temporairement — non proposé dans les documents":""}
{(form.statutActivite||"actif")==="inactif"?"Article désactivé — masqué dans toutes les listes":""}
</div>
</div>
{/* Vendable */}
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px"}}>
<div style={{fontWeight:600,fontSize:12,marginBottom:8,color:"#1a2332"}}>Vente</div>
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:6}}>
<input type="checkbox" checked={form.vendable!==false} onChange={e=>upd("vendable",e.target.checked)} style={{accentColor:"#1a56db",width:15,height:15}}/>
<span style={{fontSize:12,fontWeight:600,color:form.vendable!==false?"#1a56db":"#94a3b8"}}>Vendable</span>
</label>
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
<input type="checkbox" checked={form.achetable!==false} onChange={e=>upd("achetable",e.target.checked)} style={{accentColor:"#7c3aed",width:15,height:15}}/>
<span style={{fontSize:12,fontWeight:600,color:form.achetable!==false?"#7c3aed":"#94a3b8"}}>Achetable</span>
</label>
</div>
{/* Gestion stock */}
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",gridColumn:"1/-1"}}>
<div style={{fontWeight:600,fontSize:12,marginBottom:8,color:"#1a2332"}}>Gestion de stock</div>
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
<input type="checkbox" checked={form.gererStock!==false} onChange={e=>upd("gererStock",e.target.checked)} style={{accentColor:"#059669",width:15,height:15}}/>
<span style={{fontSize:12,fontWeight:600,color:form.gererStock!==false?"#059669":"#94a3b8"}}>
{form.gererStock!==false?"Stock géré — mouvements enregistrés à chaque BL/BR":"Stock non géré — aucun mouvement de stock"}
</span>
</label>
</div>
</div>
</Fld>
<Fld label="Description" full><textarea style={{...S.inp,resize:"vertical",minHeight:70,lineHeight:1.6}} value={form.description||""} onChange={e=>upd("description",e.target.value)} placeholder="Description commerciale, caracteristiques techniques..."/></Fld>
</div>
)}
{tab==="classif"&&(
<div>
<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13}}>
Famille et sous-famille <strong>obligatoires</strong> -- permettent de filtrer les articles dans les documents et d'appliquer le bon taux de TVA.
</div>
<FamilleSousFamille
familles={data.famillesArticle||[]}
sousFamilles={data.sousFamillesArticle||[]}
selectedFam={form.famille||""}
selectedSF={form.sousFamille||""}
onChangeFam={v=>{
const fam=data.famillesArticle.find(f=>f.id===v);
setForm(p=>({...p,famille:v,sousFamille:"",tva:String(fam?.tva||20)}));
}}
onChangeSF={v=>upd("sousFamille",v)}
famLabel="Famille article"
sfLabel="Sous-famille / Categorie"
famColor="#7c3aed"
setData={setData}
famKey="famillesArticle"
sfKey="sousFamillesArticle"
/>
</div>
)}
{tab==="prix"&&(
<div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 18px",marginBottom:8}}>
<Fld label="Prix d'achat HT (DH)" required><input type="number" style={S.inp} min="0" step="0.01" value={form.prixAchat} onChange={e=>upd("prixAchat",e.target.value)}/></Fld>
<Fld label="Prix de vente HT (DH)" required><input type="number" style={S.inp} min="0" step="0.01" value={form.prixVente} onChange={e=>upd("prixVente",e.target.value)}/></Fld>
<Fld label="Taux TVA (%)">
<select style={S.inp} value={form.tva} onChange={e=>upd("tva",e.target.value)}>
{["20","14","10","7","0"].map(v=><option key={v} value={v}>{v}%</option>)}
</select>
</Fld>
</div>
{pa>0&&pv>0&&(
<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"14px 18px",marginBottom:16,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
{[
{l:"Marge brute HT",v:`${fmt(marge)} DH`,c:marge>=0?"#16a34a":"#dc2626"},
{l:"Taux de marge",  v:`${margePct} %`,   c:margePct>=20?"#16a34a":margePct>=10?"#d97706":"#dc2626"},
{l:"Prix vente TTC", v:`${fmt(pv*(1+tvaN/100))} DH`, c:"#1a2332"},
{l:"Coef. multiplicateur",v:`x ${pa>0?(pv/pa).toFixed(2):"--"}`, c:"#7c3aed"},
].map(({l,v,c})=>(
<div key={l} style={{textAlign:"center"}}>
<div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{l}</div>
<div style={{fontSize:17,fontWeight:800,color:c}}>{v}</div>
</div>
))}
</div>
)}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 18px"}}>
<Fld label="Stock minimum (alerte)"><input type="number" style={S.inp} min="0" value={form.stockMin} onChange={e=>upd("stockMin",e.target.value)}/></Fld>
<Fld label="Stock maximum (capacite)"><input type="number" style={S.inp} min="0" value={form.stockMax} onChange={e=>upd("stockMax",e.target.value)}/></Fld>
<Fld label="Seuil reapprovisionnement"><input type="number" style={S.inp} min="0" value={form.stockAlerte} onChange={e=>upd("stockAlerte",e.target.value)}/></Fld>
</div>
</div>
)}
{tab==="tarifs"&&(
<div>
<div style={{background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13}}>
Definissez plusieurs tarifs de vente pour cet article : tarif gros, tarif detail, tarif export, tarifs clients specifiques, tarifs promotionnels...
</div>
{(form.tarifs||[]).map((t,idx)=>(
<div key={t.id} style={{border:`1.5px solid ${t.actif!==false?"#c7d2fe":"#e2e8f0"}`,borderRadius:10,padding:"16px 18px",marginBottom:12,background:t.actif!==false?"#fafbff":"#f8fafc"}}>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
<div style={{width:28,height:28,borderRadius:"50%",background:"#1a56db",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,flexShrink:0}}>{idx+1}</div>
<input style={{...S.inp,fontWeight:700,fontSize:14,border:"none",background:"transparent",padding:"0",outline:"none"}} value={t.nom} onChange={e=>updTarif(t.id,"nom",e.target.value)} placeholder="Nom du tarif..."/>
<label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginLeft:"auto",fontSize:12,color:"#64748b"}}>
<input type="checkbox" checked={t.actif!==false} onChange={e=>updTarif(t.id,"actif",e.target.checked)} style={{accentColor:"#1a56db"}}/>
Actif
</label>
{(form.tarifs||[]).length>1&&<button onClick={()=>delTarif(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:18,padding:"0 4px"}} title="Supprimer ce tarif">×</button>}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0 16px"}}>
<Fld label="Prix HT" required>
<input type="number" style={{...S.inp,fontWeight:700,color:"#d97706"}} min="0" step="0.01" value={t.prixHT} onChange={e=>updTarif(t.id,"prixHT",e.target.value)} placeholder="0.00"/>
</Fld>
<Fld label="Devise">
<select style={S.inp} value={t.devise||"MAD (DH)"} onChange={e=>updTarif(t.id,"devise",e.target.value)}>
{DEVISES.map(d=><option key={d}>{d}</option>)}
</select>
</Fld>
<Fld label="TVA (%)">
<select style={S.inp} value={t.tva||form.tva||"20"} onChange={e=>updTarif(t.id,"tva",e.target.value)}>
{["20","14","10","7","0"].map(v=><option key={v} value={v}>{v}%</option>)}
</select>
</Fld>
<Fld label="Remise (%)">
<input type="number" style={S.inp} min="0" max="100" step="0.1" value={t.remise||"0"} onChange={e=>updTarif(t.id,"remise",e.target.value)}/>
</Fld>
<Fld label="Quantite minimum">
<input type="number" style={S.inp} min="1" value={t.minQte||"1"} onChange={e=>updTarif(t.id,"minQte",e.target.value)}/>
</Fld>
<Fld label="Unite specifique">
<select style={S.inp} value={t.unite||form.unite||""} onChange={e=>updTarif(t.id,"unite",e.target.value)}>
<option value="">Par defaut ({form.unite})</option>
{UNITES.map(u=><option key={u}>{u}</option>)}
</select>
</Fld>
<Fld label="Cible">
<select style={S.inp} value={t.cible||"tous"} onChange={e=>updTarif(t.id,"cible",e.target.value)}>
<option value="tous">Tous les clients</option>
<option value="famille">Famille de clients</option>
<option value="client">Client specifique</option>
</select>
</Fld>
{t.cible==="famille"&&(
<Fld label="Famille client">
<select style={S.inp} value={t.familleClientId||""} onChange={e=>updTarif(t.id,"familleClientId",e.target.value)}>
<option value="">--</option>
{(data.famillesClient||[]).map(f=><option key={f.id} value={f.id}>{f.nom}</option>)}
</select>
</Fld>
)}
{t.cible==="client"&&(
<Fld label="Client">
<select style={S.inp} value={t.clientId||""} onChange={e=>updTarif(t.id,"clientId",e.target.value)}>
<option value="">--</option>
{(data.clients||[]).map(c=><option key={c.id} value={c.id}>{c.code} -- {c.nom}</option>)}
</select>
</Fld>
)}
<Fld label="Date debut"><input type="date" style={S.inp} value={t.dateDebut||""} onChange={e=>updTarif(t.id,"dateDebut",e.target.value)}/></Fld>
<Fld label="Date fin"><input type="date" style={S.inp} value={t.dateFin||""} onChange={e=>updTarif(t.id,"dateFin",e.target.value)}/></Fld>
</div>
{t.prixHT&&(
<div style={{background:"#f0f9ff",borderRadius:6,padding:"8px 12px",marginTop:8,display:"flex",gap:20,flexWrap:"wrap"}}>
<span style={{fontSize:12,color:"#0891b2"}}>Prix HT: <strong>{fmt(t.prixHT)} {t.devise||"DH"}</strong></span>
{t.remise>0&&<span style={{fontSize:12,color:"#d97706"}}>Apres remise: <strong>{fmt(t.prixHT*(1-t.remise/100))} {t.devise||"DH"}</strong></span>}
<span style={{fontSize:12,color:"#16a34a"}}>TTC: <strong>{fmt(t.prixHT*(1+(parseInt(t.tva||20)/100))*(1-(t.remise||0)/100))} {t.devise||"DH"}</strong></span>
<span style={{fontSize:12,color:"#64748b"}}>Cible: <strong>{t.cible==="tous"?"Tous":(data.famillesClient||[]).find(f=>f.id===t.familleClientId)?.nom||(data.clients||[]).find(c=>c.id===t.clientId)?.nom||"--"}</strong></span>
</div>
)}
</div>
))}
<button onClick={addTarif} style={{width:"100%",background:"none",border:"1.5px dashed #c7d2fe",color:"#1a56db",padding:"12px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,marginTop:4}}>
+ Ajouter un tarif
</button>
</div>
)}
{tab==="compta"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<div style={{marginBottom:14}}>
<label style={S.lbl}>Compte de vente (produits)</label>
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",width:80}} value={form.compteVente||""} onChange={e=>upd("compteVente",e.target.value)} placeholder="7111"/>
<select style={{...S.inp,flex:1}} value={form.compteVente||""} onChange={e=>upd("compteVente",e.target.value)}>
<option value="">Choisir...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.type==="article"&&c.code.startsWith("7")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</div>
<div style={{marginBottom:14}}>
<label style={S.lbl}>Compte d'achat (charges)</label>
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",width:80}} value={form.compteAchat||""} onChange={e=>upd("compteAchat",e.target.value)} placeholder="6111"/>
<select style={{...S.inp,flex:1}} value={form.compteAchat||""} onChange={e=>upd("compteAchat",e.target.value)}>
<option value="">Choisir...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.type==="article"&&c.code.startsWith("6")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</div>
<div style={{marginBottom:14}}>
<label style={S.lbl}>Compte TVA collectée</label>
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",width:80}} value={form.compteTVACol||""} onChange={e=>upd("compteTVACol",e.target.value)} placeholder="4456"/>
<select style={{...S.inp,flex:1}} value={form.compteTVACol||""} onChange={e=>upd("compteTVACol",e.target.value)}>
<option value="">Choisir...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.code.startsWith("44")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</div>
<div style={{marginBottom:14}}>
<label style={S.lbl}>Compte TVA récupérable</label>
<div style={{display:"flex",gap:6}}>
<input style={{...S.inp,fontFamily:"monospace",width:80}} value={form.compteTVARec||""} onChange={e=>upd("compteTVARec",e.target.value)} placeholder="3455"/>
<select style={{...S.inp,flex:1}} value={form.compteTVARec||""} onChange={e=>upd("compteTVARec",e.target.value)}>
<option value="">Choisir...</option>
{COMPTES_COMPTABLES_DEF.filter(c=>c.code.startsWith("34")).map(c=>(
<option key={c.code} value={c.code}>{c.code} — {c.lib}</option>
))}
</select>
</div>
</div>
</div>
)}
{tab==="custom"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
{customFieldsDef.map(f=>(
<div key={f.key} style={{gridColumn:f.type==="textarea"||f.type==="checkbox"?"1/-1":"auto",marginBottom:14}}>
{f.type!=="checkbox"&&<label style={S.lbl}>{f.label}{f.required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label>}
<CustomFieldInput field={f} value={form[f.key]} onChange={v=>upd(f.key,v)}/>
</div>
))}
{customFieldsDef.length===0&&<div style={{gridColumn:"1/-1",color:"#94a3b8",textAlign:"center",padding:"20px 0",fontSize:13}}>Aucun champ personnalise</div>}
</div>
)}
</div>
</div>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:700,fontSize:13,color:"#1a2332"}}>Champs personnalises -- Articles</span>
<span style={{fontSize:12,color:"#64748b",marginLeft:4}}>Disponibles pour tous les articles</span>
</div>
<div style={{padding:"0 20px 16px"}}>
<CustomFieldsManager
fields={customFieldsDef}
setFields={nf=>setData(p=>({...p,customFields:{...p.customFields,article:typeof nf==="function"?nf(p.customFields.article||[]):nf}}))}
/>
</div>
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}
function AgencesDepotsModule({data,setData}){
const [tabAD,setTabAD]=useState("agences");
const [modalA,setModalA]=useState(null);
const [fA,setFA]=useState({});
const [modalD,setModalD]=useState(null);
const [fD,setFD]=useState({});
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const saveAgence=()=>{
if(!fA.code?.trim()||!fA.nom?.trim())return showToast("Code et nom obligatoires",false);
const rec={...fA,id:fA.id||uid("AGC")};
setData(p=>({...p,agences:p.agences.find(a=>a.id===rec.id)?p.agences.map(a=>a.id===rec.id?rec:a):[...p.agences,rec]}));
showToast("Agence enregistrée !");setModalA(null);
};
const saveDepot=()=>{
if(!fD.code?.trim()||!fD.nom?.trim())return showToast("Code et nom obligatoires",false);
const rec={...fD,id:fD.id||uid("DEP")};
setData(p=>({...p,depots:p.depots.find(d=>d.id===rec.id)?p.depots.map(d=>d.id===rec.id?rec:d):[...p.depots,rec]}));
showToast("Dépôt enregistré !");setModalD(null);
};
const delAgence=(id)=>{
if(data.depots.some(d=>d.agenceId===id))return showToast("Supprimez d'abord les dépôts",false);
setData(p=>({...p,agences:p.agences.filter(a=>a.id!==id)}));
showToast("Agence supprimée !");
};
const delDepot=(id)=>{
setData(p=>({...p,depots:p.depots.filter(d=>d.id!==id)}));
showToast("Dépôt supprimé !");
};
return(
<>
<div style={S.card}>
<div style={S.hdr}>
<span>🏢</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Agences & Dépôts</span>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<button style={{...S.btnS,background:tabAD==="agences"?"#1a56db":"",color:tabAD==="agences"?"#fff":"#1a56db"}} onClick={()=>setTabAD("agences")}>Agences ({data.agences.length})</button>
<button style={{...S.btnS,background:tabAD==="depots"?"#7c3aed":"",color:tabAD==="depots"?"#fff":"#7c3aed"}} onClick={()=>setTabAD("depots")}>Dépôts ({data.depots.length})</button>
</div>
</div>
{tabAD==="agences"&&(
<>
<div style={{padding:"8px 16px",borderBottom:"1px solid #f0f4f8",display:"flex",justifyContent:"flex-end"}}>
<button style={S.btnP} onClick={()=>{setFA({code:`AGC${String(data.agences.length+1).padStart(2,"0")}`,nom:"",ville:"",tel:"",email:"",responsable:"",actif:true});setModalA("form");}}>+ Nouvelle agence</button>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Code","Nom","Ville","Tél","Responsable","Statut","Dépôts","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{data.agences.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>Aucune agence</td></tr>}
{data.agences.map(a=>(
<tr key={a.id} onDoubleClick={()=>{setEditId(a.id);setView("form");}} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#1a56db"}}>{a.code}</td>
<td style={{...S.td,fontWeight:600}}>{a.nom}</td>
<td style={S.td}>{a.ville||"--"}</td>
<td style={S.td}>{a.tel||"--"}</td>
<td style={S.td}>{a.responsable||"--"}</td>
<td style={S.td}><span style={{...S.badge,background:a.actif?"#f0fdf4":"#fef2f2",color:a.actif?"#16a34a":"#ef4444"}}>{a.actif?"Actif":"Inactif"}</span></td>
<td style={S.td}><span style={{...S.badge,background:"#eef2ff",color:"#1a56db"}}>{data.depots.filter(d=>d.agenceId===a.id).length}</span></td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setFA({...a});setModalA("form");}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>delAgence(a.id)}>🗑</button>
</td>
</tr>
))}
</tbody>
</table>
</>
)}
{tabAD==="depots"&&(
<>
<div style={{padding:"8px 16px",borderBottom:"1px solid #f0f4f8",display:"flex",justifyContent:"flex-end"}}>
<button style={{...S.btnP,background:"#7c3aed"}} onClick={()=>{const ag=data.agences[0];setFD({code:ag?`${ag.code}-D${String(data.depots.length+1).padStart(2,"0")}`:"DEP01",nom:"",agenceId:ag?.id||"",adresse:"",superficie:"",responsable:"",actif:true});setModalD("form");}}>+ Nouveau dépôt</button>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Code","Nom","Agence","Adresse","Responsable","Statut","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{data.depots.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>Aucun dépôt</td></tr>}
{data.depots.map(d=>(
<tr key={d.id} onDoubleClick={()=>editDoc(d)} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour ouvrir" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#7c3aed"}}>{d.code}</td>
<td style={{...S.td,fontWeight:600}}>{d.nom}</td>
<td style={S.td}><span style={{...S.badge,background:"#eef2ff",color:"#1a56db"}}>{data.agences.find(a=>a.id===d.agenceId)?.nom||"--"}</span></td>
<td style={S.td}>{d.adresse||"--"}</td>
<td style={S.td}>{d.responsable||"--"}</td>
<td style={S.td}><span style={{...S.badge,background:d.actif?"#f0fdf4":"#fef2f2",color:d.actif?"#16a34a":"#ef4444"}}>{d.actif?"Actif":"Inactif"}</span></td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setFD({...d});setModalD("form");}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>delDepot(d.id)}>🗑</button>
</td>
</tr>
))}
</tbody>
</table>
</>
)}
</div>
{modalA&&(
<Modal title={fA.id?"Modifier agence":"Nouvelle agence"} onClose={()=>setModalA(null)} width={480}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
<Fld label="Code" required><CodeAutoField value={fA.code||""} onChange={v=>setFA(p=>({...p,code:v}))} isNew={!fA.id}/></Fld>
<Fld label="Nom" required><input style={S.inp} value={fA.nom||""} onChange={e=>setFA(p=>({...p,nom:e.target.value}))}/></Fld>
<Fld label="Ville"><input style={S.inp} value={fA.ville||""} onChange={e=>setFA(p=>({...p,ville:e.target.value}))}/></Fld>
<Fld label="Téléphone"><input style={S.inp} value={fA.tel||""} onChange={e=>setFA(p=>({...p,tel:e.target.value}))}/></Fld>
<Fld label="Email"><input style={S.inp} value={fA.email||""} onChange={e=>setFA(p=>({...p,email:e.target.value}))}/></Fld>
<Fld label="Responsable"><input style={S.inp} value={fA.responsable||""} onChange={e=>setFA(p=>({...p,responsable:e.target.value}))}/></Fld>
</div>
<Fld label="Statut"><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!fA.actif} onChange={e=>setFA(p=>({...p,actif:e.target.checked}))} style={{width:16,height:16,accentColor:"#1a56db"}}/><span>Agence active</span></label></Fld>
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,paddingTop:14,borderTop:"1px solid #f0f4f8"}}>
<button style={S.btnS} onClick={()=>setModalA(null)}>Annuler</button>
<button style={S.btnP} onClick={saveAgence}>Enregistrer</button>
</div>
</Modal>
)}
{modalD&&(
<Modal title={fD.id?"Modifier dépôt":"Nouveau dépôt"} onClose={()=>setModalD(null)} width={480}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
<Fld label="Code" required><CodeAutoField value={fD.code||""} onChange={v=>setFD(p=>({...p,code:v}))} isNew={!fD.id}/></Fld>
<Fld label="Nom" required><input style={S.inp} value={fD.nom||""} onChange={e=>setFD(p=>({...p,nom:e.target.value}))}/></Fld>
<Fld label="Agence" required>
<select style={S.inp} value={fD.agenceId||""} onChange={e=>setFD(p=>({...p,agenceId:e.target.value}))}>
<option value="">-- Choisir --</option>
{data.agences.map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
</select>
</Fld>
<Fld label="Adresse"><input style={S.inp} value={fD.adresse||""} onChange={e=>setFD(p=>({...p,adresse:e.target.value}))}/></Fld>
<Fld label="Superficie (m²)"><input style={S.inp} value={fD.superficie||""} onChange={e=>setFD(p=>({...p,superficie:e.target.value}))}/></Fld>
<Fld label="Responsable"><input style={S.inp} value={fD.responsable||""} onChange={e=>setFD(p=>({...p,responsable:e.target.value}))}/></Fld>
</div>
<Fld label="Statut"><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!fD.actif} onChange={e=>setFD(p=>({...p,actif:e.target.checked}))} style={{width:16,height:16,accentColor:"#1a56db"}}/><span>Dépôt actif</span></label></Fld>
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,paddingTop:14,borderTop:"1px solid #f0f4f8"}}>
<button style={S.btnS} onClick={()=>setModalD(null)}>Annuler</button>
<button style={{...S.btnP,background:"#7c3aed"}} onClick={saveDepot}>Enregistrer</button>
</div>
</Modal>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}

function StockInventaire({data,setData}){
const [search,setSearch]=useState("");
const [modal,setModal]=useState(null);
const [qte,setQte]=useState("");
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const filtered=data.articles.filter(a=>[a.ref,a.designation].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase())));
const saveQte=(articleId,depotId,newQte)=>{
const q=parseInt(newQte)||0;
const art=data.articles.find(a=>a.id===articleId);
const dep=data.depots.find(d=>d.id===depotId);
const avant=data.stockDepots[articleId]?.[depotId]?.qte||0;
const mvt={id:uid("MVT"),type:q>=avant?"entree":"sortie",articleId,articleRef:art?.ref||"",articleNom:art?.designation||"",depotId,qte:Math.abs(q-avant),avant,apres:q,date:today(),docType:"inventaire",docRef:"INV"};
setData(p=>{
const ns=JSON.parse(JSON.stringify(p.stockDepots||{}));
if(!ns[articleId])ns[articleId]={};
ns[articleId][depotId]={qte:q,emplacement:ns[articleId][depotId]?.emplacement||""};
return{...p,stockDepots:ns,mouvementsStock:[...p.mouvementsStock,mvt]};
});
showToast(`Stock mis à jour : ${art?.ref} → ${q} ${art?.unite||""}`);
setModal(null);
};
return(
<>
<div style={S.card}>
<div style={S.hdr}>
<span>📋</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Inventaire & Saisie Stock</span>
<div style={{marginLeft:"auto"}}><input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:200}}/></div>
</div>
{data.depots.length===0&&<div style={{padding:24,textAlign:"center",color:"#94a3b8",fontSize:13}}>Créez d'abord des dépôts dans Administration → Agences & Dépôts</div>}
{data.depots.length>0&&(
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr>
<th style={S.th}>Référence</th>
<th style={S.th}>Désignation</th>
{data.depots.filter(d=>d.actif).map(d=><th key={d.id} style={{...S.th,textAlign:"center"}}>{d.code}</th>)}
<th style={S.th}>Total</th>
<th style={S.th}>Statut</th>
</tr>
</thead>
<tbody>
{filtered.map(a=>{
const tot=stockTotal(data.stockDepots,a.id);
const st=tot<=0?"Rupture":tot<=a.stockMin?"Critique":"Normal";
const sc={"Rupture":"#dc2626","Critique":"#d97706","Normal":"#16a34a"}[st];
return(
<tr key={a.id} onDoubleClick={()=>{setEditId(a.id);setView("form");}} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#7c3aed"}}>{a.ref}</td>
<td style={S.td}>{a.designation}</td>
{data.depots.filter(d=>d.actif).map(d=>{
const q=data.stockDepots[a.id]?.[d.id]?.qte||0;
return(
<td key={d.id} style={{...S.td,textAlign:"center"}}>
<button onClick={()=>{setModal({articleId:a.id,depotId:d.id,art:a,dep:d,current:q});setQte(String(q));}}
style={{background:q>0?"#f0fdf4":"#f8fafc",border:"1px solid "+(q>0?"#86efac":"#e2e8f0"),borderRadius:6,padding:"4px 12px",cursor:"pointer",fontWeight:700,color:q>0?"#16a34a":"#94a3b8",minWidth:50}}>
{q}
</button>
</td>
);
})}
<td style={{...S.td,fontWeight:800,fontSize:15,color:sc,textAlign:"center"}}>{tot}</td>
<td style={S.td}><span style={{...S.badge,background:`${sc}18`,color:sc}}>{st}</span></td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</div>
{modal&&(
<Modal title={`Stock — ${modal.art.ref} / ${modal.dep.code}`} onClose={()=>setModal(null)} width={360}>
<div style={{textAlign:"center",padding:"8px 0 16px"}}>
<div style={{color:"#64748b",fontSize:13,marginBottom:4}}>Stock actuel</div>
<div style={{fontSize:36,fontWeight:900,color:"#1a2332"}}>{modal.current}</div>
<div style={{color:"#94a3b8",fontSize:12}}>{modal.art.unite||"unités"}</div>
</div>
<Fld label="Nouveau stock">
<input type="number" min="0" style={{...S.inp,textAlign:"center",fontSize:20,fontWeight:800}} value={qte} onChange={e=>setQte(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&saveQte(modal.articleId,modal.depotId,qte)}/>
</Fld>
<div style={{display:"flex",gap:10,marginTop:16}}>
<button style={{...S.btnS,flex:1}} onClick={()=>setModal(null)}>Annuler</button>
<button style={{...S.btnP,flex:1}} onClick={()=>saveQte(modal.articleId,modal.depotId,qte)}>Mettre à jour</button>
</div>
</Modal>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}

function StockEtatModule({data}){
const [dateDebut,setDD]=useState(()=>{const d=new Date();d.setDate(1);return d.toISOString().slice(0,10);});
const [dateFin,setDF]=useState(today());
const [vueMode,setVueMode]=useState("article");
const [filtreAgence,setFiltreAgence]=useState("");
const [filtreDepot,setFiltreDepot]=useState("");
const [filtreEmp,setFiltreEmp]=useState("");
const [filtreFam,setFiltreFam]=useState("");
const [filtreSSFam,setFiltreSSFam]=useState("");
const [filtreArt,setFiltreArt]=useState("");
const [search,setSearch]=useState("");
const [afficher,setAfficher]=useState("tous");
const [expandedId,setExpandedId]=useState(null);

const allMvts=data.mouvementsStock||[];

// Stock cumulé AVANT une date (report)
const stockAvant=(artId,depId,dateLimite)=>{
let s=0;
allMvts.forEach(m=>{
if(m.articleId!==artId)return;
if(depId&&m.depotId!==depId)return;
if(m.date>=dateLimite)return;
s+=m.type==="entree"?(+m.qte||0):-(+m.qte||0);
});
return s;
};

// Mouvements dans la période
const mvtsPeriode=(artId,depId)=>allMvts.filter(m=>{
if(m.articleId!==artId)return false;
if(depId&&m.depotId!==depId)return false;
return m.date>=dateDebut&&m.date<=dateFin;
}).sort((a,b)=>a.date.localeCompare(b.date));

// Filtres
const depsFiltres=(data.depots||[]).filter(d=>{
if(filtreDepot&&d.id!==filtreDepot)return false;
if(filtreAgence&&d.agenceId!==filtreAgence)return false;
return true;
});
const artsFiltres=(data.articles||[]).filter(a=>{
if(filtreArt&&a.id!==filtreArt)return false;
if(filtreFam&&a.famille!==filtreFam)return false;
if(filtreSSFam&&a.sousFamille!==filtreSSFam)return false;
if(search){const s=search.toLowerCase();return a.ref?.toLowerCase().includes(s)||a.designation?.toLowerCase().includes(s);}
return true;
});

// Construction lignes
const lignes=[];
artsFiltres.forEach(art=>{
const deps=vueMode==="article"?[null]:depsFiltres.map(d=>d.id);
const list=deps.length?deps:[null];
list.forEach(depId=>{
const dep=depId?(data.depots||[]).find(d=>d.id===depId):null;
const emplacement=depId?data.stockDepots?.[art.id]?.[depId]?.emplacement||"":"";
if(filtreEmp&&!emplacement.toLowerCase().includes(filtreEmp.toLowerCase()))return;
const report=stockAvant(art.id,depId,dateDebut);
const mvts=mvtsPeriode(art.id,depId);
const entrees=mvts.filter(m=>m.type==="entree").reduce((s,m)=>s+(+m.qte||0),0);
const sorties=mvts.filter(m=>m.type==="sortie").reduce((s,m)=>s+(+m.qte||0),0);
const solde=report+entrees-sorties;
const pa=+art.prixAchat||0;
const statut=solde<=0?"rupture":solde<=(+art.stockMin||0)?"critique":"normal";
if(afficher==="positifs"&&solde<=0)return;
if(afficher==="negatifs"&&solde>=0)return;
if(afficher==="rupture"&&solde>0)return;
if(afficher==="critique"&&statut!=="critique")return;
if(afficher==="mouvements"&&entrees===0&&sorties===0)return;
lignes.push({
art,dep,depId,report,entrees,sorties,solde,emplacement,
valeurSolde:solde*pa,valeurEntrees:entrees*pa,valeurSorties:sorties*pa,
stockMin:+art.stockMin||0,statut,mvts,pa,
famNom:(data.famillesArticle||[]).find(f=>f.id===art.famille)?.nom||"--",
sfNom:(data.sousFamillesArticle||[]).find(f=>f.id===art.sousFamille)?.nom||"--",
agenceNom:dep?(data.agences||[]).find(a=>a.id===dep.agenceId)?.nom||"":"",
});
});
});

const totReport=lignes.reduce((s,l)=>s+l.report,0);
const totEntrees=lignes.reduce((s,l)=>s+l.entrees,0);
const totSorties=lignes.reduce((s,l)=>s+l.sorties,0);
const totSolde=lignes.reduce((s,l)=>s+l.solde,0);
const totValeur=lignes.reduce((s,l)=>s+l.valeurSolde,0);
const nbRup=lignes.filter(l=>l.statut==="rupture").length;
const nbCri=lignes.filter(l=>l.statut==="critique").length;

const SS={
rupture:{bg:"#fef2f2",c:"#dc2626",l:"Rupture"},
critique:{bg:"#fef9c3",c:"#d97706",l:"Critique"},
normal:{bg:"#f0fdf4",c:"#16a34a",l:"Normal"},
};

return(
<div>
{/* Filtres */}
<div style={{...S.card,marginBottom:12}}>
<div style={S.hdr}>
<span>📋</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>État de Stock à Date</span>
<div style={{marginLeft:"auto",display:"flex",gap:6}}>
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac",fontSize:11}}
onClick={()=>exportToExcel(lignes.map(l=>({
ref:l.art.ref,designation:l.art.designation,
famille:l.famNom,ssfamille:l.sfNom,
depot:l.dep?.nom||"Tous",emplacement:l.emplacement,
agence:l.agenceNom,report:l.report,
entrees:l.entrees,sorties:l.sorties,solde:l.solde,
valeur:l.valeurSolde,statut:l.statut,
})),[
{label:"Référence",key:"ref"},{label:"Désignation",key:"designation"},
{label:"Famille",key:"famille"},{label:"Ss-Famille",key:"ssfamille"},
{label:"Dépôt",key:"depot"},{label:"Emplacement",key:"emplacement"},
{label:"Agence",key:"agence"},{label:"Report",key:"report"},
{label:"Entrées",key:"entrees"},{label:"Sorties",key:"sorties"},
{label:"Solde",key:"solde"},{label:"Valeur DH",key:"valeur"},
{label:"Statut",key:"statut"},
],"etat_stock_"+dateDebut+"_"+dateFin)}>⬇ Excel</button>
</div>
</div>
<div style={{padding:16}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"0 10px",marginBottom:12}}>
<div>
<label style={S.lbl}>📅 Début (Report)</label>
<input type="date" style={S.inp} value={dateDebut} onChange={e=>setDD(e.target.value)}/>
</div>
<div>
<label style={S.lbl}>📅 Fin</label>
<input type="date" style={S.inp} value={dateFin} onChange={e=>setDF(e.target.value)}/>
</div>
<div>
<label style={S.lbl}>Agence</label>
<select style={S.inp} value={filtreAgence} onChange={e=>{setFiltreAgence(e.target.value);setFiltreDepot("");}}>
<option value="">Toutes</option>
{(data.agences||[]).map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
</select>
</div>
<div>
<label style={S.lbl}>Dépôt</label>
<select style={S.inp} value={filtreDepot} onChange={e=>setFiltreDepot(e.target.value)}>
<option value="">Tous</option>
{(data.depots||[]).filter(d=>!filtreAgence||d.agenceId===filtreAgence).map(d=><option key={d.id} value={d.id}>{d.nom}</option>)}
</select>
</div>
<div>
<label style={S.lbl}>Emplacement</label>
<input style={S.inp} value={filtreEmp} onChange={e=>setFiltreEmp(e.target.value)} placeholder="A1, B2..."/>
</div>
<div>
<label style={S.lbl}>Recherche article</label>
<input style={S.inp} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Réf ou désignation"/>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0 10px",marginBottom:12}}>
<div>
<label style={S.lbl}>Famille article</label>
<select style={S.inp} value={filtreFam} onChange={e=>{setFiltreFam(e.target.value);setFiltreSSFam("");}}>
<option value="">Toutes</option>
{(data.famillesArticle||[]).map(f=><option key={f.id} value={f.id}>{f.nom}</option>)}
</select>
</div>
<div>
<label style={S.lbl}>Sous-famille</label>
<select style={S.inp} value={filtreSSFam} onChange={e=>setFiltreSSFam(e.target.value)}>
<option value="">Toutes</option>
{(data.sousFamillesArticle||[]).filter(sf=>!filtreFam||sf.familleId===filtreFam).map(f=><option key={f.id} value={f.id}>{f.nom}</option>)}
</select>
</div>
<div>
<label style={S.lbl}>Article spécifique</label>
<select style={S.inp} value={filtreArt} onChange={e=>setFiltreArt(e.target.value)}>
<option value="">Tous les articles</option>
{(data.articles||[]).map(a=><option key={a.id} value={a.id}>{a.ref} — {a.designation}</option>)}
</select>
</div>
</div>
{/* Filtres affichage + vue */}
<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
<span style={{fontSize:11,fontWeight:700,color:"#64748b"}}>Afficher :</span>
{[
{id:"tous",l:"Tous"},
{id:"mouvements",l:"Avec mvts"},
{id:"positifs",l:"✅ Stock > 0"},
{id:"negatifs",l:"🔴 Négatif"},
{id:"rupture",l:"💔 Rupture"},
{id:"critique",l:"⚠️ Critique"},
].map(a=>(
<button key={a.id} onClick={()=>setAfficher(a.id)}
style={{padding:"4px 10px",border:"1px solid "+(afficher===a.id?"#1a56db":"#e2e8f0"),
borderRadius:5,cursor:"pointer",fontSize:11,background:afficher===a.id?"#1a56db":"#fff",
color:afficher===a.id?"#fff":"#64748b",fontFamily:"inherit",fontWeight:afficher===a.id?700:400}}>
{a.l}
</button>
))}
<div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
<span style={{fontSize:11,color:"#64748b"}}>Vue :</span>
{[{id:"article",l:"Par article"},{id:"depot",l:"Par dépôt"},{id:"emplacement",l:"Par emplacement"}].map(v=>(
<button key={v.id} onClick={()=>setVueMode(v.id)}
style={{padding:"4px 10px",border:"1px solid "+(vueMode===v.id?"#7c3aed":"#e2e8f0"),
borderRadius:5,cursor:"pointer",fontSize:11,background:vueMode===v.id?"#7c3aed":"#fff",
color:vueMode===v.id?"#fff":"#64748b",fontFamily:"inherit",fontWeight:vueMode===v.id?700:400}}>
{v.l}
</button>
))}
</div>
</div>
</div>
</div>

{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:12}}>
{[
{l:"Lignes",v:lignes.length,c:"#1a56db"},
{l:"Report total",v:fmt(totReport)+" u.",c:"#64748b"},
{l:"Entrées période",v:"+"+fmt(totEntrees)+" u.",c:"#16a34a"},
{l:"Sorties période",v:"-"+fmt(totSorties)+" u.",c:"#dc2626"},
{l:"Solde actuel",v:fmt(totSolde)+" u.",c:"#7c3aed"},
{l:"Valeur stock",v:fmt(totValeur)+" DH",c:"#d97706"},
].map(k=>(
<div key={k.l} style={{background:k.c+"10",borderLeft:"3px solid "+k.c,borderRadius:8,padding:"8px 12px"}}>
<div style={{fontWeight:800,fontSize:13,color:k.c}}>{k.v}</div>
<div style={{fontSize:10,color:"#64748b"}}>{k.l}</div>
</div>
))}
</div>
{(nbRup>0||nbCri>0)&&(
<div style={{marginBottom:12,padding:"8px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,display:"flex",gap:16,fontSize:12}}>
{nbRup>0&&<span style={{color:"#dc2626",fontWeight:700}}>💔 {nbRup} rupture(s)</span>}
{nbCri>0&&<span style={{color:"#d97706",fontWeight:700}}>⚠️ {nbCri} stock(s) critique(s)</span>}
</div>
)}

{/* Tableau principal */}
<div style={S.card}>
<div style={{padding:"8px 16px",borderBottom:"1px solid #f0f4f8",display:"flex",gap:8,alignItems:"center",fontSize:12,color:"#64748b"}}>
<span>📅 <strong style={{color:"#1a2332"}}>{dateDebut}</strong> → <strong style={{color:"#1a2332"}}>{dateFin}</strong></span>
<span style={{marginLeft:"auto",fontWeight:700,color:"#1a56db"}}>{lignes.length} ligne(s)</span>
</div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr style={{background:"#1a2332"}}>
{[
{l:"Référence",w:90},{l:"Désignation",w:null},{l:"Famille",w:100},
{l:"Dépôt",w:90},{l:"Empl.",w:70},{l:"Agence",w:80},
{l:"Report",w:70},{l:"Entrées",w:70},{l:"Sorties",w:70},
{l:"Solde",w:80},{l:"Stk min",w:65},{l:"Valeur DH",w:100},{l:"Statut",w:75},{l:"Détail",w:55},
].map(h=>(
<th key={h.l} style={{...S.th,background:"#1a2332",color:"#fff",width:h.w||"auto",whiteSpace:"nowrap",fontSize:11}}>{h.l}</th>
))}
</tr>
</thead>
<tbody>
{lignes.length===0&&(
<tr><td colSpan={14} style={{...S.td,textAlign:"center",padding:40,color:"#94a3b8"}}>
<div style={{fontSize:40,marginBottom:8}}>📦</div>
<div style={{fontWeight:600}}>Aucun article avec ces filtres</div>
</td></tr>
)}
{lignes.map((l,idx)=>{
const ss=SS[l.statut]||SS.normal;
const expanded=expandedId===l.art.id+(l.depId||"");
return(
<React.Fragment key={l.art.id+(l.depId||"")}>
<tr style={{background:idx%2===0?"#fff":"#f9fbfc",borderBottom:"1px solid #f0f4f8"}}>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#1a56db",fontSize:11}}>{l.art.ref}</td>
<td style={{...S.td,fontWeight:600}}>{l.art.designation}</td>
<td style={S.td}><span style={{...S.badge,background:"#eef2ff",color:"#1a56db",fontSize:10}}>{l.famNom}</span></td>
<td style={S.td}>{vueMode!=="article"?<span style={{fontSize:11}}>{l.dep?.nom||"--"}</span>:<span style={{color:"#94a3b8",fontSize:10}}>Tous</span>}</td>
<td style={S.td}>
{l.emplacement
?<span style={{background:"#fef9c3",padding:"1px 5px",borderRadius:3,fontWeight:700,color:"#854d0e",fontSize:11,fontFamily:"monospace"}}>{l.emplacement}</span>
:"--"}
</td>
<td style={{...S.td,fontSize:11,color:"#64748b"}}>{l.agenceNom||"--"}</td>
{/* Report */}
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:l.report>0?"#1a56db":l.report<0?"#dc2626":"#94a3b8",fontWeight:600,fontSize:12}}>
{l.report>0?"+":""}{l.report}
</td>
{/* Entrées */}
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:l.entrees>0?"#16a34a":"#94a3b8",fontWeight:l.entrees>0?700:400,fontSize:12}}>
{l.entrees>0?"+"+l.entrees:"--"}
</td>
{/* Sorties */}
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:l.sorties>0?"#dc2626":"#94a3b8",fontWeight:l.sorties>0?700:400,fontSize:12}}>
{l.sorties>0?"-"+l.sorties:"--"}
</td>
{/* Solde */}
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:900,fontSize:15,
color:l.solde<0?"#dc2626":l.solde===0?"#94a3b8":"#1a2332",
background:l.solde<0?"#fef2f2":l.solde===0?"#f8fafc":""}}>
{l.solde}
</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#94a3b8",fontSize:11}}>{l.stockMin}</td>
{/* Valeur */}
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontSize:11,color:"#7c3aed",fontWeight:600}}>
{l.pa>0?fmt(l.valeurSolde)+" DH":"--"}
</td>
{/* Statut */}
<td style={S.td}>
<span style={{...S.badge,background:ss.bg,color:ss.c,fontWeight:700,fontSize:10}}>{ss.l}</span>
</td>
{/* Détail */}
<td style={S.td}>
{l.mvts.length>0&&(
<button style={{...S.btnSm,fontSize:10,color:"#7c3aed",borderColor:"#ddd6fe"}}
onClick={()=>setExpandedId(expanded?null:l.art.id+(l.depId||""))}>
{expanded?"▲":"▼"} {l.mvts.length}
</button>
)}
</td>
</tr>
{/* Détail mouvements */}
{expanded&&(
<tr>
<td colSpan={14} style={{padding:0,background:"#f5f3ff"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead>
<tr style={{background:"#7c3aed"}}>
{["Date","Type","Référence","Libellé","Entrée","Sortie","Solde cumulé"].map(h=>(
<th key={h} style={{...S.th,background:"#7c3aed",color:"#fff",fontSize:10,padding:"4px 10px"}}>{h}</th>
))}
</tr>
</thead>
<tbody>
{(()=>{
let cumulE=0,cumulS=0;
const rows=[];
// Report
if(l.report!==0)rows.push(
<tr key="report" style={{background:"#eef2ff"}}>
<td style={{...S.td,fontSize:10,paddingLeft:24}}>{dateDebut}</td>
<td style={{...S.td,fontSize:10}}><span style={{...S.badge,background:"#e0e7ff",color:"#1a56db",fontSize:9}}>REPORT</span></td>
<td style={{...S.td,fontSize:10}}>--</td>
<td style={{...S.td,fontSize:10,fontStyle:"italic"}}>Solde au {dateDebut}</td>
<td style={{...S.td,textAlign:"right",fontSize:10,color:"#1a56db",fontWeight:700}}>{l.report>0?l.report:""}</td>
<td style={{...S.td,textAlign:"right",fontSize:10,color:"#dc2626",fontWeight:700}}>{l.report<0?Math.abs(l.report):""}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontSize:11,fontWeight:800,color:"#1a56db"}}>{l.report}</td>
</tr>
);
let running=l.report;
l.mvts.forEach((m,mi)=>{
const isE=m.type==="entree";
if(isE)cumulE+=+m.qte||0;
else cumulS+=+m.qte||0;
running+=isE?(+m.qte||0):-(+m.qte||0);
rows.push(
<tr key={mi} style={{background:mi%2===0?"#faf5ff":"#f5f3ff"}}>
<td style={{...S.td,fontSize:10,paddingLeft:24}}>{m.date}</td>
<td style={S.td}><span style={{...S.badge,background:isE?"#f0fdf4":"#fef2f2",color:isE?"#16a34a":"#dc2626",fontSize:9}}>{isE?"📥 Entrée":"📤 Sortie"}</span></td>
<td style={{...S.td,fontFamily:"monospace",fontSize:10,color:"#7c3aed"}}>{m.ref||"--"}</td>
<td style={{...S.td,fontSize:11}}>{m.libelle||"--"}</td>
<td style={{...S.td,textAlign:"right",fontWeight:700,color:"#16a34a",fontSize:11}}>{isE?m.qte:""}</td>
<td style={{...S.td,textAlign:"right",fontWeight:700,color:"#dc2626",fontSize:11}}>{!isE?m.qte:""}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:800,fontSize:12,color:running<0?"#dc2626":"#1a2332"}}>{running}</td>
</tr>
);
});
return rows;
})()}
</tbody>
</table>
</td>
</tr>
)}
</React.Fragment>
);
})}
</tbody>
{/* Totaux */}
{lignes.length>0&&(
<tfoot>
<tr style={{background:"#1a2332"}}>
<td colSpan={6} style={{...S.td,color:"#fff",fontWeight:700,fontSize:12}}>TOTAL — {lignes.length} ligne(s)</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#a8b8cc",fontWeight:700}}>{totReport}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#86efac",fontWeight:700}}>+{totEntrees}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#fca5a5",fontWeight:700}}>-{totSorties}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#e8a020",fontWeight:900,fontSize:16}}>{totSolde}</td>
<td style={S.td}></td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#c4b5fd",fontWeight:700,fontSize:11}}>{fmt(totValeur)} DH</td>
<td colSpan={2} style={S.td}></td>
</tr>
</tfoot>
)}
</table>
</div>
</div>
</div>
);
}

function StockGlobal({data}){
const ALL_COLS_SG=[
{id:"ref",label:"Référence"},{id:"design",label:"Désignation"},
{id:"famille",label:"Famille"},{id:"unite",label:"Unité"},
{id:"total",label:"Stock total"},{id:"min",label:"Stock min"},
{id:"statut",label:"Statut"},{id:"valeur",label:"Valeur stock"},
];
const [visColsSG,setVisColsSG_raw]=useState(()=>LS.get("lgm_cols_stock_global")||["ref","design","famille","unite","total","statut"]);
const setVisColsSG=(v)=>{LS.set("lgm_cols_stock_global",v);setVisColsSG_raw(v);};
return(
<div style={S.card}>
<div style={S.hdr}><span>📦</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Stock Global</span>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<ColonnesChoisir allCols={ALL_COLS_SG} visible={visColsSG} setVisible={setVisColsSG}/>
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac"}} onClick={()=>exportToExcel(data.articles,[
{label:"Référence",key:"ref"},{label:"Désignation",key:"designation"},
{label:"Famille",get:r=>data.famillesArticle.find(f=>f.id===r.famille)?.nom||""},
{label:"Unité",key:"unite"},{label:"Stock total",get:r=>stockTotal(data.stockDepots,r.id)},
{label:"Stock min",key:"stockMin"},{label:"Statut",get:r=>{const t=stockTotal(data.stockDepots,r.id);return t<=0?"Rupture":t<=r.stockMin?"Critique":"Normal";}},
{label:"Valeur DH",get:r=>stockTotal(data.stockDepots,r.id)*r.prixAchat},
],"stock_global")}>⬇ Excel</button>
</div>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{visColsSG.includes("ref")    &&<th style={S.th}>Référence</th>}
{visColsSG.includes("design") &&<th style={S.th}>Désignation</th>}
{visColsSG.includes("famille")&&<th style={S.th}>Famille</th>}
{visColsSG.includes("unite")  &&<th style={S.th}>Unité</th>}
{visColsSG.includes("total")  &&<th style={S.th}>Stock total</th>}
{visColsSG.includes("min")    &&<th style={S.th}>Min</th>}
{visColsSG.includes("statut") &&<th style={S.th}>Statut</th>}
{visColsSG.includes("valeur") &&<th style={S.th}>Valeur</th>}
</tr></thead>
<tbody>{data.articles.map(a=>{
const tot=stockTotal(data.stockDepots,a.id);
const st=tot<=0?"Rupture":tot<=a.stockMin?"Critique":"Normal";
const sc={"Rupture":"#dc2626","Critique":"#d97706","Normal":"#16a34a"}[st];
const depArt=data.depots.filter(d=>data.stockDepots[a.id]?.[d.id]?.qte>0);
return(
<tr key={a.id} onDoubleClick={()=>{setEditId(a.id);setView("form");}} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
{visColsSG.includes("ref")    &&<td style={{...S.td,color:"#7c3aed",fontWeight:700,fontFamily:"monospace"}}>{a.ref}</td>}
{visColsSG.includes("design") &&<td style={S.td}><div style={{fontWeight:600}}>{a.designation}</div><div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>{depArt.map(d=><span key={d.id} style={{fontSize:10,background:"#f0fdf4",color:"#16a34a",borderRadius:3,padding:"1px 5px"}}>{d.code}: {data.stockDepots[a.id][d.id].qte}</span>)}</div></td>}
{visColsSG.includes("famille")&&<td style={S.td}><span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed"}}>{data.famillesArticle.find(f=>f.id===a.famille)?.nom||"-"}</span></td>}
{visColsSG.includes("unite")  &&<td style={S.td}>{a.unite}</td>}
{visColsSG.includes("total")  &&<td style={{...S.td,fontWeight:800,fontSize:15,color:sc}}>{tot}</td>}
{visColsSG.includes("min")    &&<td style={S.td}>{a.stockMin}</td>}
{visColsSG.includes("statut") &&<td style={S.td}><span style={{...S.badge,background:`${sc}18`,color:sc}}>{st}</span></td>}
{visColsSG.includes("valeur") &&<td style={{...S.td,fontWeight:700,color:"#d97706"}}>{fmt(tot*a.prixAchat)} DH</td>}
</tr>
);
})}</tbody>
</table>
</div>
);
}
function StockParAgence({data,setData}){
const [selAgence,setSelAgence]=useState("all");
const [editModal,setEditModal]=useState(null);
const [ef,setEf]=useState({qte:0,emplacement:""});
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const agences=selAgence==="all"?data.agences:[data.agences.find(a=>a.id===selAgence)].filter(Boolean);
const saveEdit=()=>{
const {articleId,depotId}=editModal;
setData(p=>{
const ns=JSON.parse(JSON.stringify(p.stockDepots));
if(!ns[articleId])ns[articleId]={};
ns[articleId][depotId]={qte:parseInt(ef.qte)||0,emplacement:ef.emplacement||""};
return{...p,stockDepots:ns};
});
showToast("Stock mis a jour !"); setEditModal(null);
};
return(
<>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
<h2 style={{color:"#1a2332",fontWeight:800,fontSize:18,margin:0}}>Stock par Agence et Depot</h2>
<div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
<select style={{...S.inp,width:220}} value={selAgence} onChange={e=>setSelAgence(e.target.value)}>
<option value="all">Toutes les agences</option>
{data.agences.map(a=><option key={a.id} value={a.id}>{a.code} -- {a.nom}</option>)}
</select>
</div>
</div>
{agences.map(agence=>{
const depotsAgence=data.depots.filter(d=>d.agenceId===agence.id);
if(depotsAgence.length===0)return(
<div key={agence.id} style={{...S.card,padding:16,marginBottom:12,textAlign:"center",color:"#94a3b8"}}>{agence.nom} -- Aucun depot</div>
);
return(
<div key={agence.id} style={{...S.card,marginBottom:14}}>
<div style={{...S.hdr,borderLeft:"4px solid #1a56db",borderRadius:0}}>
<div><div style={{fontWeight:800,fontSize:14}}>{agence.nom}</div><div style={{fontSize:11,color:"#64748b"}}>{agence.ville} -- {depotsAgence.length} depot{depotsAgence.length>1?"s":""}</div></div>
</div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr>
<th style={S.th}>Ref</th>
<th style={S.th}>Article</th>
<th style={S.th}>Total</th>
{depotsAgence.map(d=><th key={d.id} style={{...S.th,minWidth:120}}><div>{d.code}</div><div style={{fontSize:9,fontWeight:400,opacity:.7}}>{d.nom}</div></th>)}
</tr>
</thead>
<tbody>
{data.articles.map(a=>{
const tot=stockTotal(data.stockDepots,a.id);
const sc=tot<=0?"#dc2626":tot<=a.stockMin?"#d97706":"#16a34a";
return(
<tr key={a.id} onDoubleClick={()=>{setEditId(a.id);setView("form");}} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,fontFamily:"monospace",color:"#7c3aed",fontWeight:700}}>{a.ref}</td>
<td style={S.td}><div style={{fontWeight:600}}>{a.designation}</div><div style={{fontSize:10,color:"#94a3b8"}}>{a.unite}</div></td>
<td style={{...S.td,fontWeight:800,fontSize:15,color:sc}}>{tot}</td>
{depotsAgence.map(depot=>{
const ds=data.stockDepots[a.id]?.[depot.id];
const q=ds?.qte||0;
const emp=ds?.emplacement||"";
return(
<td key={depot.id} style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<div>
<div style={{fontWeight:700,fontSize:14,color:q>0?"#1a2332":"#d1d9e0"}}>{q}</div>
{emp&&<div style={{fontSize:10,color:"#0891b2",fontFamily:"monospace",background:"#ecfeff",borderRadius:3,padding:"1px 5px",display:"inline-block"}}>{emp}</div>}
</div>
<button onClick={()=>{setEf({qte:q,emplacement:emp});setEditModal({articleId:a.id,depotId:depot.id});}} style={{...S.btnSm,fontSize:11,marginLeft:"auto",padding:"2px 7px"}}>✏️</button>
</div>
</td>
);
})}
</tr>
);
})}
</tbody>
</table>
</div>
</div>
);
})}
{editModal&&(
<Modal title="Modifier stock depot" onClose={()=>setEditModal(null)} width={400}>
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
<div style={{fontSize:12,color:"#64748b"}}>Article: <strong>{data.articles.find(a=>a.id===editModal.articleId)?.designation}</strong></div>
<div style={{fontSize:12,color:"#64748b",marginTop:3}}>Depot: <strong style={{color:"#16a34a"}}>{data.depots.find(d=>d.id===editModal.depotId)?.nom}</strong></div>
</div>
<Fld label="Quantite" required><input type="number" min="0" style={S.inp} value={ef.qte} onChange={e=>setEf(p=>({...p,qte:e.target.value}))}/></Fld>
<Fld label="Emplacement" hint="Ex: A1-R3 (Allee-Rangee)"><input style={{...S.inp,fontFamily:"monospace",fontWeight:700}} value={ef.emplacement} onChange={e=>setEf(p=>({...p,emplacement:e.target.value.toUpperCase()}))} placeholder="A1-R3"/></Fld>
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,borderTop:"1px solid #f0f4f8",paddingTop:14}}>
<button style={S.btnS} onClick={()=>setEditModal(null)}>Annuler</button>
<button style={S.btnP} onClick={saveEdit}>Enregistrer</button>
</div>
</Modal>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}
function DocModule({data,setData,docType,navigateTo}){
const cfg=DOC_CFG[docType];
const circ=CIRCUIT[docType];
const tiersList=data[cfg.tiers]||[];
const compteur=data.compteurs[docType];
const allDocs=data.documents[docType]||[];
// Masquer les documents transférés vers l'étape suivante
// Ils redeviennent visibles si leur successeur est supprimé
const docs=allDocs.filter(d=>!d._transferred);
const setDocs=useCallback((fn)=>setData(p=>({...p,documents:{...p.documents,[docType]:typeof fn==="function"?fn(p.documents[docType]||[]):fn}})),[docType,setData]);
const [view,setView]=useState("list");
const [cur,setCur]=useState(null);
const [artDD,setArtDD]=useState(null);
const [depDD,setDepDD]=useState(null);
const [toast,setToast]=useState(null);
const [confirmDel,setConfirmDel]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),3000);};
const prevDocType = useState(docType)[0];
useEffect(()=>{ setView("list"); setCur(null); setArtDD(null); setDepDD(null); },[docType]);
const newDoc=()=>{setCur({id:uid(docType),ref:genNum(compteur),agence:"",tiers:"",dateDoc:today(),dateLiv:"",dateEcheance:"",statut:"Brouillon",lignes:[newLigne()],notes:"",sourceRef:"",_stockApplied:false,remiseGlobale:0,modeReglement:"",conditionReglement:""});setView("form");};
const editDoc=(d)=>{setCur({...d,lignes:d.lignes.map(l=>({...l}))});setView("form");};
const isFacture=docType==="vte-facture"||docType==="ach-facture"||docType==="vte-proforma"||docType==="ach-proforma";
const isProforma=docType==="vte-proforma"||docType==="ach-proforma";
const isValidated=cur?.statut==="Validée"||cur?.statut==="Payée";
const saveDoc=(newStatut)=>{
const doc={...cur,statut:newStatut};
// RÈGLE 1 : Facture validée/payée → interdire toute modification sauf depuis Brouillon
if(isFacture&&isValidated&&newStatut!=="Annulée"){
showToast("❌ Facture validée — supprimez-la pour modifier la Pro Forma source",false);
return;
}
const stockImpact=cfg.stockImpact;
const isStockDoc=!!stockImpact;
const isValidation=STATUTS_STOCK.includes(newStatut);
const isAnnulation=newStatut==="Annulé"||newStatut==="Annulée";
// Respect le flag "ne pas gérer le stock" sur le document
const skipStock=doc._skipStock===true;
setData(p=>{
const existing=p.documents[docType]?.find(d=>d.id===doc.id)||null;
const wasApplied=existing?._stockApplied||false;
// Filtrer les lignes : exclure articles avec gererStock===false
const lignesValides=doc.lignes.filter(l=>{
if(!l.articleId||!l.depotId||(+l.qte||0)===0)return false;
const art=(p.articles||[]).find(a=>a.id===l.articleId);
if(art&&art.gererStock===false)return false; // article sans gestion stock
return true;
});
const shouldApply=isStockDoc&&isValidation&&!wasApplied&&lignesValides.length>0&&!skipStock;
const shouldUndo=isStockDoc&&wasApplied&&(isAnnulation||(!isValidation&&!isStockDoc));
let newSD=p.stockDepots;
let newMvts=[...p.mouvementsStock];
const finalDoc={...doc};
if(shouldApply){
const r=applyStock(p.stockDepots, lignesValides, stockImpact);
newSD=r.ns;
newMvts=[...newMvts, ...r.mvts.map(m=>({...m,docRef:doc.ref,docType}))];
finalDoc._stockApplied=true;
} else if(shouldUndo){
const inv=stockImpact==="entree"?"sortie":"entree";
const lignesExist=(existing?.lignes||[]).filter(l=>l.articleId&&l.depotId&&(+l.qte||0)!==0);
if(lignesExist.length>0){
const r=applyStock(p.stockDepots, lignesExist, inv);
newSD=r.ns;
newMvts=[...newMvts, ...r.mvts.map(m=>({...m,docRef:doc.ref,docType,note:"Annulation"}))];
}
finalDoc._stockApplied=false;
}
// RÈGLE 2 : Si Pro Forma modifiée → synchroniser le BL source automatiquement
let newDocs={...p.documents};
if(isProforma&&doc.sourceId){
const blType=docType==="vte-proforma"?"vte-bl":"ach-bl";
const blDocs=p.documents[blType]||[];
const blSource=blDocs.find(b=>b.id===doc.sourceId);
if(blSource){
// Mettre à jour les lignes du BL avec celles de la Pro Forma
const updatedBL={
...blSource,
lignes:doc.lignes.map(l=>({...l,id:uid("L")})),
tiers:doc.tiers,
agence:doc.agence,
dateLiv:doc.dateLiv,
remiseGlobale:doc.remiseGlobale||0,
modeReglement:doc.modeReglement||"",
_syncFromProforma:doc.ref,
_syncAt:today(),
};
newDocs[blType]=blDocs.map(b=>b.id===blSource.id?updatedBL:b);
}
}
const isFirstValidation=isValidation&&!wasApplied&&!existing;
newDocs[docType]=existing
?newDocs[docType].map(d=>d.id===finalDoc.id?finalDoc:d)
:[...newDocs[docType],finalDoc];
return{
...p,
documents:newDocs,
stockDepots:newSD,
mouvementsStock:newMvts,
...(isFirstValidation?{compteurs:{...p.compteurs,[docType]:{...p.compteurs[docType],seq:(p.compteurs[docType]?.seq||1)+1}}}:{}),
};
});
const lignesValides2=cur.lignes.filter(l=>l.articleId&&l.depotId&&(+l.qte||0)!==0).length;
const wasAlreadyApplied=docs.find(d=>d.id===cur.id)?._stockApplied||false;
let sm="";
if(isStockDoc&&isValidation&&!wasAlreadyApplied){
sm=lignesValides2>0?` ✓ Stock mis à jour`:" ⚠️ Aucune ligne valide";
} else if(isStockDoc&&isAnnulation&&wasAlreadyApplied){
sm=` ↩ Stock rétabli`;
}
if(isProforma&&cur.sourceId) sm+=" 🔄 BL source synchronisé";
showToast(`${doc.ref} → ${newStatut}${sm}`, !sm.includes("⚠️"));
setView("list");
};
const generateNext=(targetType)=>{
if(!circ||!cur)return;
const dest=targetType||circ.next;
const nc=data.compteurs[dest];
const nd={id:uid(dest),ref:genNum(nc),agence:cur.agence,tiers:cur.tiers,dateDoc:today(),dateLiv:cur.dateLiv,statut:"Brouillon",lignes:cur.lignes.map(l=>({...l,id:uid("L")})),notes:`Généré depuis ${cur.ref}`,sourceRef:cur.ref,sourceId:cur.id,_stockApplied:false,remiseGlobale:cur.remiseGlobale||0,modeReglement:cur.modeReglement||""};
// Marquer le document source comme "transféré" → verrouillé
setData(p=>{
const updDocs=p.documents[docType].map(d=>d.id===cur.id?{...d,_transferred:dest,_transferredRef:nd.ref}:d);
return{...p,
documents:{...p.documents,[docType]:updDocs,[dest]:[...(p.documents[dest]||[]),nd]},
compteurs:{...p.compteurs,[dest]:{...p.compteurs[dest],seq:(p.compteurs[dest]?.seq||1)+1}}
};
});
showToast(`${DOC_CFG[dest].titre} ${nd.ref} créé ✅`);
setView("list");
setTimeout(()=>navigateTo(dest),1500);
};
const [reglModal,setReglModal]=useState(null);
const [regroupModal,setRegroupModal]=useState(null);
const {sel:selDocs,toggle:toggleDoc2,toggleAll:toggleAllDocs,clear:clearDocs}=useRowSelect();

// Copie Excel des documents sélectionnés
const docsCopyRows=()=>sortedDocs.filter(d=>selDocs.has(d.id)).map(d=>{
const calc2=docCalc(d.lignes,d.remiseGlobale||0);
const isF2=docType==="ach-facture"||docType==="vte-facture";
const isVte2=docType==="vte-facture";
const paye2=isF2?(data[isVte2?"reglementsVente":"reglementsAchat"]||[])
.filter(r=>r.factureId===d.id&&r.statut==="Encaissé")
.reduce((s,r)=>s+(+r.montant||0),0):0;
return{
"N° Document":d.ref||"",
"Origine":d.sourceRef||"",
[cfg.tiersLabel]:tiersList.find(t=>t.id===d.tiers)?.nom||"",
"Date":d.dateDoc||"",
"Livraison":d.dateLiv||"",
"Statut":d.statut||"",
"Base HT":calc2.baseHT,
"Total TTC":calc2.ttc,
...(isF2?{"Réglé":paye2,"Solde":Math.max(0,calc2.ttc-paye2)}:{}),
};
}); // {destType, selectedIds:[]}

// ── Regrouper plusieurs docs en un seul ───────────────────
const saveRegroup=()=>{
if(!regroupModal)return;
const {destType,selectedIds,tiersId}=regroupModal;
if(!selectedIds||selectedIds.length<1){showToast("Sélectionnez au moins un document",false);return;}
const srcDocs=docs.filter(d=>selectedIds.includes(d.id));
if(!srcDocs.length)return;
// Fusionner toutes les lignes
const allLignes=srcDocs.flatMap(d=>d.lignes.map(l=>({...l,id:uid("L"),_fromDoc:d.ref})));
const refs=srcDocs.map(d=>d.ref).join(", ");
const nc=data.compteurs[destType];
const nd={
id:uid(destType),
ref:genNum(nc),
agence:srcDocs[0].agence,
tiers:tiersId||srcDocs[0].tiers,
dateDoc:today(),
dateLiv:srcDocs[0].dateLiv||"",
statut:"Brouillon",
lignes:allLignes,
notes:`Regroupement de : ${refs}`,
sourceRef:refs,
sourceIds:srcDocs.map(d=>d.id),
_stockApplied:false,
remiseGlobale:0,
modeReglement:"",
};
setData(p=>{
// Marquer chaque doc source comme transféré
const updSrc=(p.documents[docType]||[]).map(d=>
selectedIds.includes(d.id)
?{...d,_transferred:destType,_transferredRef:nd.ref}
:d
);
return{
...p,
documents:{
...p.documents,
[docType]:updSrc,
[destType]:[...(p.documents[destType]||[]),nd],
},
compteurs:{...p.compteurs,[destType]:{...p.compteurs[destType],seq:(p.compteurs[destType]?.seq||1)+1}},
};
});
showToast(`${DOC_CFG[destType]?.titre} ${nd.ref} créé — ${srcDocs.length} document(s) regroupés ✅`);
setRegroupModal(null);
setTimeout(()=>navigateTo(destType),1200);
}; // {doc, montant, mode, date, ref, notes}
const genNextFromList=(d,dest)=>{
const nc=data.compteurs[dest];
const nd={id:uid(dest),ref:genNum(nc),agence:d.agence,tiers:d.tiers,dateDoc:today(),dateLiv:d.dateLiv,statut:"Brouillon",lignes:d.lignes.map(l=>({...l,id:uid("L")})),notes:`Généré depuis ${d.ref}`,sourceRef:d.ref,sourceId:d.id,_stockApplied:false,remiseGlobale:d.remiseGlobale||0,modeReglement:d.modeReglement||""};
setData(p=>({...p,
documents:{...p.documents,
[docType]:(p.documents[docType]||[]).map(x=>x.id===d.id?{...x,_transferred:dest,_transferredRef:nd.ref}:x),
[dest]:[...(p.documents[dest]||[]),nd]
},
compteurs:{...p.compteurs,[dest]:{...p.compteurs[dest],seq:(p.compteurs[dest]?.seq||1)+1}}
}));
showToast(`${DOC_CFG[dest].titre} ${nd.ref} créé ✅`);
setTimeout(()=>navigateTo(dest),1200);
};
const saveRegl=()=>{
if(!reglModal)return;
const {doc,montant,mode,date,ref,notes}=reglModal;
if(!montant||+montant<=0){showToast("Montant invalide",false);return;}
const isVte2=docType==="vte-facture"||docType==="vte-proforma";
const regKey=isVte2?"reglementsVente":"reglementsAchat";
const rec={
id:uid("RGL"),factureId:doc.id,factureRef:doc.ref,
tiersId:doc.tiers,montant:+montant,
mode:mode||"Espèces",date:date||today(),
ref:ref||"",notes:notes||"",
statut:"Encaissé",type:isVte2?"vente":"achat",
docType,
};
setData(p=>({...p,[regKey]:[...(p[regKey]||[]),rec]}));
showToast(`Règlement de ${fmt(+montant)} DH enregistré ✅`);
setReglModal(null);
};
const delDoc=(id)=>{
const d=docs.find(x=>x.id===id);
if(!d)return;

const reasons=[];
const blockers=[];

// ── Règle 1 : BL validé → bloqué si une Pro Forma ou Facture en découle ─
const isBL=docType==="ach-bl"||docType==="vte-bl";
const isProformaDoc=docType==="ach-proforma"||docType==="vte-proforma";

if(isBL&&STATUTS_STOCK.includes(d.statut)){
const proformas=Object.values(data.documents).flat()
.filter(x=>x.sourceRef===d.ref&&(x.id?.startsWith("ach-proforma")||x.id?.startsWith("vte-proforma")||DOC_CFG[Object.keys(data.documents).find(k=>(data.documents[k]||[]).some(dd=>dd.id===x.id))]?.isProforma));
const factures=[
...(data.documents["ach-facture"]||[]),
...(data.documents["vte-facture"]||[]),
].filter(x=>x.sourceRef===d.ref);
if(factures.length>0){
blockers.push(`🔒 Facture générée depuis ce BL : ${factures.map(x=>x.ref).join(", ")} — supprimez la facture d'abord`);
}
const pfs=[
...(data.documents["ach-proforma"]||[]),
...(data.documents["vte-proforma"]||[]),
].filter(x=>x.sourceRef===d.ref);
if(pfs.length>0){
blockers.push(`🔒 Pro Forma générée depuis ce BL : ${pfs.map(x=>x.ref).join(", ")} — supprimez la Pro Forma d'abord`);
}
}

// ── Règle 2 : Pro Forma validée → bloquée si une Facture en découle ─
if(isProformaDoc&&STATUTS_STOCK.includes(d.statut)){
const factures=[
...(data.documents["ach-facture"]||[]),
...(data.documents["vte-facture"]||[]),
].filter(x=>x.sourceRef===d.ref||x.sourceId===d.id);
if(factures.length>0){
blockers.push(`🔒 Facture définitive générée : ${factures.map(x=>x.ref).join(", ")} — supprimez la facture d'abord`);
}
}

// ── Règle 3 : Facture validée/payée → bloquée ─
const isFactureDoc=docType==="ach-facture"||docType==="vte-facture";
if(isFactureDoc&&(d.statut==="Validée"||d.statut==="Payée")){
const reglements=[...(data.reglementsVente||[]),(data.reglementsAchat||[]),...(data.reglements||[])]
.filter(r=>r.factureId===d.id||r.factureRef===d.ref);
if(reglements.length>0){
blockers.push(`🔒 ${reglements.length} règlement(s) lié(s) à cette facture — supprimez-les d'abord`);
}
}

// ── Informations non bloquantes ─
if(d._stockApplied&&cfg.stockImpact)
reasons.push(`Stock ${cfg.stockImpact==="entree"?"entré":"sorti"} sera rétabli automatiquement`);

const autresGeneres=Object.values(data.documents).flat()
.filter(x=>x.sourceRef===d.ref&&!blockers.some(b=>b.includes(x.ref)));
if(autresGeneres.length>0)
reasons.push(`${autresGeneres.length} autre(s) document(s) lié(s) : ${autresGeneres.map(x=>x.ref).join(", ")}`);

setConfirmDel({doc:d, reasons, blockers, isBlocked:blockers.length>0, isWarning:reasons.length>0});
};
const confirmDeleteDoc=()=>{
const d=confirmDel?.doc;
if(!d) return;
const stockImpact=cfg.stockImpact;
setData(p=>{
let newSD=p.stockDepots;
let newMvts=p.mouvementsStock;
if(d._stockApplied&&stockImpact){
const inv=stockImpact==="entree"?"sortie":"entree";
const lignesValides=(d.lignes||[]).filter(l=>l.articleId&&l.depotId&&(+l.qte||0)!==0);
if(lignesValides.length>0){
const r=applyStock(p.stockDepots, lignesValides, inv);
newSD=r.ns;
newMvts=[...p.mouvementsStock,...r.mvts.map(m=>({...m,docRef:d.ref,docType,note:"Suppression doc"}))];
}
}
// Supprimer ce document
const newDocs={...p.documents,[docType]:(p.documents[docType]||[]).filter(x=>x.id!==d.id)};
// ── Libérer le document source (retirer _transferred) ──────────────
// Ex: si on supprime une Pro Forma, le BL source redevient visible
if(d.sourceRef||d.sourceId){
const sourceDocType=SOURCE_TYPE[docType]||null;
if(sourceDocType&&newDocs[sourceDocType]){
newDocs[sourceDocType]=newDocs[sourceDocType].map(src=>{
// Libérer si c'est bien ce document qui avait transféré vers notre doc supprimé
if(src._transferredRef===d.ref||src.id===d.sourceId||src.ref===d.sourceRef){
return{...src,_transferred:null,_transferredRef:null};
}
return src;
});
}
}
return{...p,documents:newDocs,stockDepots:newSD,mouvementsStock:newMvts};
});
setConfirmDel(null);
showToast(`${d.ref} supprimé${d._stockApplied?" — stock rétabli":""} · Document source libéré ✅`);
};
const updL=(lid,f,v)=>setCur(p=>({...p,lignes:p.lignes.map(l=>l.id===lid?{...l,[f]:v}:l)}));
const pickArt=(lid,a)=>{
const px=cfg.isAchat?a.prixAchat:a.prixVente;
const tva=a.tva||20;
const tiers=tiersList.find(t=>t.id===cur.tiers);
let remise=0;
if(!cfg.isAchat&&a.tarifs?.length>0){
const tarif=a.tarifs.find(t=>t.actif!==false&&(
t.cible==="tous"||(t.cible==="famille"&&t.familleClientId===tiers?.famille)||(t.cible==="client"&&t.clientId===cur.tiers)
));
if(tarif){remise=+tarif.remise||0;}
} else if(cfg.isAchat){
remise=0;
}
setCur(p=>({...p,lignes:p.lignes.map(l=>l.id===lid?{...l,articleId:a.id,article:a.ref,designation:a.designation,unite:a.unite,prix:px,tva,remise}:l)}));
setArtDD(null);
};
const pickDep=(lid,depotId)=>{
setCur(p=>{
const ligne=p.lignes.find(l=>l.id===lid);
const emp=ligne?.articleId
?data.stockDepots[ligne.articleId]?.[depotId]?.emplacement||""
:"";
return{...p,lignes:p.lignes.map(l=>l.id===lid?{...l,depotId,emplacement:emp}:l)};
});
setDepDD(null);
};
const ALL_COLS = [
{id:"designation", label:"Désignation",    default:true,  required:false},
{id:"unite",       label:"Unité",           default:true,  required:false},
{id:"qte",         label:"Qté",             default:true,  required:true},
{id:"prix",        label:"Prix U. HT",      default:true,  required:true},
{id:"remise",      label:"Remise %",        default:true,  required:false},
{id:"tva",         label:"TVA %",           default:true,  required:false},
{id:"netHT",       label:"Net HT",          default:true,  required:false},
{id:"depot",       label:"Dépôt",           default:true,  required:false},
{id:"emplacement", label:"Emplacement",     default:true,  required:false},
{id:"dispo",       label:"Stock dispo",     default:true,  required:false},
{id:"note",        label:"Note",            default:false, required:false},
];
const [visibleCols, setVisibleCols] = useState(()=>ALL_COLS.filter(c=>c.default).map(c=>c.id));
const [showColPicker, setShowColPicker] = useState(false);
const isVis = (id) => visibleCols.includes(id);
const toggleCol = (id) => {
const col = ALL_COLS.find(c=>c.id===id);
if(col?.required) return;
setVisibleCols(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
};
const sc={"Brouillon":"#94a3b8","Confirmé":"#1a56db","Envoyé":"#7c3aed","Accepté":"#16a34a","Expédié":"#059669","Reçu":"#16a34a","Validé":"#16a34a","Validée":"#16a34a","Payée":"#16a34a","Refusé":"#dc2626","Annulé":"#dc2626","Annulée":"#dc2626","En cours":"#0891b2","En préparation":"#0891b2"};
const depotsDoc=cur?.agence?data.depots.filter(d=>d.agenceId===cur.agence):data.depots;
const isAvoir=docType==="ach-avoir"||docType==="vte-avoir";
const SOURCE_TYPE={
// Factures créées depuis Pro Forma (plus depuis BL directement)
"ach-facture":"ach-proforma","vte-facture":"vte-proforma",
// Pro Forma créées depuis BL
"ach-proforma":"ach-bl","vte-proforma":"vte-bl",
// Avoirs créés depuis Factures
"ach-avoir":"ach-facture","vte-avoir":"vte-facture",
};
const SOURCE_LABEL={
"ach-facture":"Pro Forma Achat","vte-facture":"Pro Forma Vente",
"ach-proforma":"BL Achat","vte-proforma":"BL Vente",
"ach-avoir":"Facture Achat","vte-avoir":"Facture Vente",
};
const sourceType=SOURCE_TYPE[docType]||null;
const sourceLabel=SOURCE_LABEL[docType]||null;
// Statuts valides selon le type source :
// - BL/Facture → STATUTS_STOCK standard
// - Pro Forma → Confirmée ou Envoyée (pas dans STATUTS_STOCK car pas de stock)
const isSourceProforma=sourceType==="ach-proforma"||sourceType==="vte-proforma";
const STATUTS_SOURCE_VALID=isSourceProforma
?[...STATUTS_STOCK,"Confirmée","Envoyée","Brouillon"]
:STATUTS_STOCK;
const blsDisponibles = sourceType ? (data.documents[sourceType]||[]).filter(bl=>{
const dejaPris = docs.some(f=>f.sourceRef===bl.ref||f.sourceId===bl.id);
return STATUTS_SOURCE_VALID.includes(bl.statut) && !dejaPris;
}) : [];
if(view==="list")return(
<div style={S.card}>
<div style={S.hdr}>
<div style={{width:4,height:20,background:cfg.color,borderRadius:2}}/>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:4}}>{cfg.titre}</span>
<span style={{...S.badge,background:`${cfg.color}18`,color:cfg.color,marginLeft:4}}>
{docs.length}
{allDocs.length>docs.length&&<span style={{fontSize:9,color:"#94a3b8",marginLeft:3}}>/{allDocs.length}</span>}
</span>
<div style={{marginLeft:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"3px 10px",display:"flex",alignItems:"center",gap:6}}>
<span style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase"}}>Prochain</span>
<span style={{fontFamily:"monospace",fontWeight:700,color:cfg.color,fontSize:12}}>{genNum(compteur)}</span>
</div>
{cfg.stockImpact&&<span style={{...S.badge,background:cfg.stockImpact==="entree"?"#f0fdf4":"#fef2f2",color:cfg.stockImpact==="entree"?"#16a34a":"#dc2626",fontSize:11}}>📦 {cfg.stockImpact==="entree"?"+ Entrée":"- Sortie"} à validation</span>}
<div style={{marginLeft:"auto"}}>
{isFacture||isAvoir ? (
blsDisponibles.length>0 ? (
<div style={{position:"relative"}}>
<select
style={{...S.inp,color:cfg.color,fontWeight:700,border:`1.5px solid ${cfg.color}`,paddingRight:32,cursor:"pointer"}}
defaultValue=""
onChange={e=>{
if(!e.target.value)return;
const bl=blsDisponibles.find(b=>b.id===e.target.value);
if(!bl)return;
setCur({
id:uid(docType),ref:genNum(compteur),
agence:bl.agence,tiers:bl.tiers,
dateDoc:today(),dateLiv:bl.dateLiv||"",dateEcheance:"",
statut:"Brouillon",
lignes:bl.lignes.map(l=>({...l,id:uid("L")})),
notes:`Généré depuis ${bl.ref}`,
sourceRef:bl.ref,sourceType,
_stockApplied:false,remiseGlobale:bl.remiseGlobale||0,
modeReglement:"",conditionReglement:"",
});
setView("form");
e.target.value="";
}}>
<option value="">+ Créer depuis {sourceLabel}...</option>
{blsDisponibles.map(bl=>(
<option key={bl.id} value={bl.id}>
{bl.ref} -- {tiersList.find(t=>t.id===bl.tiers)?.nom||"?"} -- {bl.dateDoc}
</option>
))}
</select>
</div>
) : (
<span style={{fontSize:12,color:"#94a3b8",fontStyle:"italic"}}>
Aucun {sourceLabel} validé disponible
</span>
)
) : (
<div style={{display:"flex",gap:6}}>
{/* Bouton Regrouper — BL et ProForma uniquement */}
{circ&&docs.filter(d=>STATUTS_STOCK.includes(d.statut)||((docType==="ach-proforma"||docType==="vte-proforma")&&(d.statut==="Confirmée"||d.statut==="Envoyée"))).filter(d=>!d._transferred).length>1&&(
<button style={{...S.btnP,background:"#0891b2",fontSize:12}}
title={`Regrouper plusieurs ${cfg.titre} en un seul ${DOC_CFG[circ.next]?.titre}`}
onClick={()=>setRegroupModal({
destType:circ.next,
selectedIds:[],
tiersId:"",
docs:docs.filter(d=>!d._transferred&&(STATUTS_STOCK.includes(d.statut)||((docType==="ach-proforma"||docType==="vte-proforma")&&(d.statut==="Confirmée"||d.statut==="Envoyée")))),
})}>
🔗 Regrouper
</button>
)}
<button style={{...S.btnP,background:cfg.color}} onClick={newDoc}>+ Nouveau</button>
</div>
)}
</div>
</div>
{(isFacture||isAvoir)&&(
<div style={{background:"#fffbeb",borderBottom:"1px solid #fcd34d",padding:"8px 20px",fontSize:12,color:"#92400e",display:"flex",alignItems:"center",gap:8}}>
<span>🔒</span>
<span>
<strong>{cfg.titre}</strong> ne peut être créé que depuis un <strong>{sourceLabel} validé</strong>.
{blsDisponibles.length>0
?<span style={{color:"#16a34a",marginLeft:6}}>✓ {blsDisponibles.length} {sourceLabel}{blsDisponibles.length>1?"s":""} disponible{blsDisponibles.length>1?"s":""}.</span>
:<span style={{color:"#dc2626",marginLeft:6}}>Aucun {sourceLabel} validé sans {isFacture?"facture":"avoir"} pour le moment.</span>
}
</span>
</div>
)}

{/* ── TABLE DOCUMENTS — colonnes configurables + tri au clic ── */}
{(()=>{
const isF=docType==="ach-facture"||docType==="vte-facture";
const isVte=docType==="vte-facture";
const regKey=isVte?"reglementsVente":"reglementsAchat";
const DCOLS=[
{id:"ref",    label:"N° Document",  fixed:true,  sort:(a,b)=>a.ref?.localeCompare(b.ref)||0},
{id:"source", label:"Origine",      fixed:false, sort:(a,b)=>(a.sourceRef||"").localeCompare(b.sourceRef||"")},
{id:"tiers",  label:cfg.tiersLabel, fixed:false, sort:(a,b)=>(tiersList.find(t=>t.id===a.tiers)?.nom||"").localeCompare(tiersList.find(t=>t.id===b.tiers)?.nom||"")},
{id:"date",   label:"Date",         fixed:false, sort:(a,b)=>(a.dateDoc||"").localeCompare(b.dateDoc||"")},
{id:"dateLiv",label:"Livraison",    fixed:false, sort:(a,b)=>(a.dateLiv||"").localeCompare(b.dateLiv||"")},
{id:"agence", label:"Agence",       fixed:false, sort:(a,b)=>(data.agences?.find(x=>x.id===a.agence)?.nom||"").localeCompare(data.agences?.find(x=>x.id===b.agence)?.nom||"")},
{id:"statut", label:"Statut",       fixed:false, sort:(a,b)=>(a.statut||"").localeCompare(b.statut||"")},
{id:"baseHT", label:"Base HT",      fixed:false, sort:(a,b)=>docCalc(a.lignes,a.remiseGlobale||0).baseHT-docCalc(b.lignes,b.remiseGlobale||0).baseHT},
{id:"ttc",    label:"Total TTC",    fixed:false, sort:(a,b)=>docCalc(a.lignes,a.remiseGlobale||0).ttc-docCalc(b.lignes,b.remiseGlobale||0).ttc},
{id:"du",     label:"Montant dû",   fixed:false, onlyF:true},
{id:"regle",  label:"Réglé",        fixed:false, onlyF:true},
{id:"solde",  label:"Solde",        fixed:false, onlyF:true, sort:(a,b)=>{
const pA=(data[regKey]||[]).filter(r=>r.factureId===a.id&&r.statut==="Encaissé").reduce((s,r)=>s+(+r.montant||0),0);
const pB=(data[regKey]||[]).filter(r=>r.factureId===b.id&&r.statut==="Encaissé").reduce((s,r)=>s+(+r.montant||0),0);
return (docCalc(a.lignes,a.remiseGlobale||0).ttc-pA)-(docCalc(b.lignes,b.remiseGlobale||0).ttc-pB);
}},
{id:"actions",label:"Actions",      fixed:true},
].filter(c=>!c.onlyF||isF);

const LS_KEY="lgm_doccols_"+docType;
const DEF=[...new Set(["ref","source","tiers","date","statut","baseHT","ttc",...(isF?["du","solde"]:[]),"actions"])];
const [visCols,setVisColsRaw]=useState(()=>LS.get(LS_KEY)||DEF);
const setVisCols=(v)=>{LS.set(LS_KEY,v);setVisColsRaw(v);};
const [showCP,setShowCP]=useState(false);
const [sortCol,setSortCol]=useState("date");
const [sortDir,setSortDir]=useState(-1);
const [dragC,setDragC]=useState(null);

const toggleSort=(id)=>{
if(sortCol===id){setSortDir(d=>d*-1);}
else{setSortCol(id);setSortDir(-1);}
};
const sortFn=DCOLS.find(c=>c.id===sortCol)?.sort;
const sortedDocs=sortFn?[...docs].sort((a,b)=>sortFn(a,b)*sortDir):[...docs].reverse();
const ordCols=visCols.map(id=>DCOLS.find(c=>c.id===id)).filter(Boolean);

const onDragStart=(id)=>setDragC(id);
const onDrop=(targetId)=>{
if(!dragC||dragC===targetId)return;
const arr=[...visCols];const fi=arr.indexOf(dragC),ti=arr.indexOf(targetId);
if(fi<0||ti<0)return;arr.splice(fi,1);arr.splice(ti,0,dragC);
setVisCols(arr);setDragC(null);
};

return(
<>
{/* Barre config */}
<div style={{padding:"5px 14px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:8,background:"#f8fafc",position:"relative"}}>
<SelectBar sel={selDocs} allIds={sortedDocs.map(d=>d.id)} onToggleAll={toggleAllDocs} onClear={clearDocs}
onCopy={()=>copyToExcel(["N° Document","Origine",cfg.tiersLabel,"Date","Livraison","Statut","Base HT","Total TTC",...(docType==="ach-facture"||docType==="vte-facture"?["Réglé","Solde"]:[])],docsCopyRows())}/>
<span style={{fontSize:11,color:"#94a3b8",marginLeft:4}}>
{docs.length} doc(s) · {docs.filter(d=>STATUTS_STOCK.includes(d.statut)).length} validé(s)
{allDocs.length>docs.length&&<span style={{color:"#d97706",marginLeft:6}}>· {allDocs.length-docs.length} masqué(s)</span>}
</span>
<button style={{...S.btnSm,marginLeft:"auto",fontSize:10,color:"#7c3aed",borderColor:"#ddd6fe"}}
onClick={()=>setShowCP(v=>!v)}>
⚙️ Colonnes ({visCols.length})
</button>
{showCP&&(
<div style={{position:"absolute",top:"100%",right:0,zIndex:600,background:"#fff",
border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.15)",padding:14,width:280}}>
<div style={{fontWeight:700,fontSize:12,marginBottom:4}}>Colonnes · ☰ glisser pour réordonner</div>
{DCOLS.map(col=>(
<div key={col.id}
draggable={!col.fixed}
onDragStart={()=>!col.fixed&&onDragStart(col.id)}
onDragOver={e=>e.preventDefault()}
onDrop={()=>!col.fixed&&onDrop(col.id)}
style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",borderRadius:5,marginBottom:2,
background:dragC===col.id?"#eef2ff":"#f8fafc",border:"1px solid #f0f4f8",cursor:col.fixed?"default":"grab"}}>
<span style={{color:col.fixed?"#e2e8f0":"#94a3b8",fontSize:12}}>☰</span>
<input type="checkbox" checked={visCols.includes(col.id)} disabled={col.fixed}
onChange={e=>setVisCols(e.target.checked?[...visCols,col.id]:visCols.filter(x=>x!==col.id))}
style={{accentColor:"#1a56db"}}/>
<span style={{fontSize:12}}>{col.label}</span>
{col.fixed&&<span style={{...S.badge,background:"#f1f5f9",color:"#94a3b8",fontSize:9,marginLeft:"auto"}}>fixe</span>}
</div>
))}
<div style={{marginTop:8,display:"flex",gap:5,borderTop:"1px solid #f0f4f8",paddingTop:8}}>
<button style={{...S.btnSm,fontSize:10,flex:1}} onClick={()=>setVisCols(DEF)}>Défaut</button>
<button style={{...S.btnSm,fontSize:10,flex:1}} onClick={()=>setVisCols(DCOLS.map(c=>c.id))}>Tout</button>
<button style={{...S.btnP,fontSize:10,flex:1}} onClick={()=>setShowCP(false)}>✓</button>
</div>
</div>
)}
</div>

{/* Tableau */}
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%",minWidth:500}}>
<thead>
<tr>
<th style={{...S.th,width:36,textAlign:"center"}}>
<input type="checkbox"
checked={sortedDocs.length>0&&sortedDocs.every(d=>selDocs.has(d.id))}
onChange={()=>toggleAllDocs(sortedDocs.map(d=>d.id))}
style={{accentColor:"#1a56db",width:14,height:14}}/>
</th>
{ordCols.map(col=>(
<th key={col.id}
onClick={()=>col.sort&&toggleSort(col.id)}
style={{...S.th,whiteSpace:"nowrap",cursor:col.sort?"pointer":"default",userSelect:"none",
background:sortCol===col.id?"#0f172a":"#1a2332",transition:"background .15s"}}>
<span style={{display:"inline-flex",alignItems:"center",gap:4}}>
{col.label}
{col.sort&&<span style={{fontSize:10,opacity:sortCol===col.id?1:0.35}}>
{sortCol===col.id?(sortDir===1?"▲":"▼"):"⇅"}
</span>}
</span>
</th>
))}
</tr>
</thead>
<tbody>
{docs.length===0&&(
<tr><td colSpan={ordCols.length} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:32}}>
<div style={{fontSize:32,marginBottom:8}}>📄</div>
Aucun document
</td></tr>
)}
{sortedDocs.map(d=>{
const calc2=docCalc(d.lignes,d.remiseGlobale||0);
const regls=(data[regKey]||[]);
const paye2=isF?regls.filter(r=>r.factureId===d.id&&r.statut==="Encaissé").reduce((s,r)=>s+(+r.montant||0),0):0;
const enAtt2=isF?regls.filter(r=>r.factureId===d.id&&r.statut==="En attente").reduce((s,r)=>s+(+r.montant||0),0):0;
const reste2=isF?Math.max(0,calc2.ttc-paye2):0;
const tiers2=tiersList.find(t=>t.id===d.tiers);
const statC2=sc[d.statut]||"#94a3b8";
const isValide2=STATUTS_STOCK.includes(d.statut);
const isPF2=docType==="ach-proforma"||docType==="vte-proforma";
const isValideForNext2=isValide2||(isPF2&&(d.statut==="Confirmée"||d.statut==="Envoyée"));
const isTransferred2=!!d._transferred;
const circ2=CIRCUIT[docType];
const canNext2=isValideForNext2&&circ2&&!isTransferred2;
const isSolde2=isF&&reste2<=0&&calc2.ttc>0;
const hasChildren2=isValide2&&Object.values(data.documents).flat().some(x=>x.sourceRef===d.ref);
const locked2=hasChildren2||(isF&&(d.statut==="Validée"||d.statut==="Payée")&&paye2>0);
return(
<tr key={d.id}
onDoubleClick={()=>editDoc(d)}
style={{cursor:"pointer",verticalAlign:"middle",background:selDocs.has(d.id)?"#eef2ff":""}}
onMouseEnter={e=>{if(!selDocs.has(d.id))e.currentTarget.style.background="#f0f7ff"}}
onMouseLeave={e=>{if(!selDocs.has(d.id))e.currentTarget.style.background=""}}>
<td style={{...S.td,width:36,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
<input type="checkbox" checked={selDocs.has(d.id)} onChange={()=>toggleDoc2(d.id)}
style={{accentColor:"#1a56db",width:14,height:14,cursor:"pointer"}}/>
</td>
{ordCols.map(col=>{
switch(col.id){
case "ref":return(
<td key="ref" style={{...S.td,color:cfg.color,fontWeight:700,fontFamily:"monospace",whiteSpace:"nowrap"}}>{d.ref}</td>);
case "source":return(
<td key="source" style={{...S.td,minWidth:90}}>
{d.sourceRef
?<div>
<div style={{fontSize:9,color:"#94a3b8",marginBottom:1}}>{SOURCE_LABEL[docType]||"Source"}</div>
<span style={{fontFamily:"monospace",fontSize:10,fontWeight:600,color:"#0891b2",
background:"#f0f9ff",padding:"1px 5px",borderRadius:3,border:"1px solid #bae6fd",whiteSpace:"nowrap"}}>
{d.sourceRef}
</span>
</div>
:<span style={{color:"#e2e8f0"}}>—</span>}
</td>);
case "tiers":return(
<td key="tiers" style={S.td}>
<div style={{fontWeight:600}}>{tiers2?.nom||"--"}</div>
{tiers2?.ville&&<div style={{fontSize:10,color:"#94a3b8"}}>{tiers2.ville}</div>}
</td>);
case "date":return(<td key="date" style={{...S.td,whiteSpace:"nowrap"}}>{d.dateDoc||"--"}</td>);
case "dateLiv":return(<td key="dateLiv" style={{...S.td,color:"#64748b",whiteSpace:"nowrap"}}>{d.dateLiv||"--"}</td>);
case "agence":return(<td key="agence" style={S.td}>{data.agences?.find(a=>a.id===d.agence)?.nom||"--"}</td>);
case "statut":return(
<td key="statut" style={S.td}>
<span style={{...S.badge,background:`${statC2}18`,color:statC2,whiteSpace:"nowrap"}}>{d.statut}</span>
{d._stockApplied&&<div style={{fontSize:9,color:"#16a34a",marginTop:2}}>Stock ✓</div>}
</td>);
case "baseHT":return(<td key="baseHT" style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#64748b"}}>{fmt(calc2.baseHT)}</td>);
case "ttc":return(<td key="ttc" style={{...S.td,textAlign:"right",fontWeight:700,fontFamily:"monospace",color:"#d97706"}}>{fmt(calc2.ttc)}</td>);
case "du":return(<td key="du" style={{...S.td,textAlign:"right",fontFamily:"monospace"}}>{isF?<><div style={{fontWeight:700}}>{fmt(calc2.ttc)}</div><div style={{fontSize:9,color:"#94a3b8"}}>TTC</div></>:"--"}</td>);
case "regle":return(
<td key="regle" style={{...S.td,textAlign:"right",fontFamily:"monospace"}}>
{isF?<><div style={{fontWeight:700,color:"#16a34a"}}>{fmt(paye2)}</div>{enAtt2>0&&<div style={{fontSize:9,color:"#d97706"}}>+{fmt(enAtt2)}</div>}</>:"--"}
</td>);
case "solde":return(
<td key="solde" style={{...S.td,textAlign:"right",fontFamily:"monospace"}}>
{isF?(reste2>0
?<><span style={{fontWeight:800,color:"#dc2626",background:"#fef2f2",padding:"2px 5px",borderRadius:3,fontSize:11}}>{fmt(reste2)}</span><div style={{fontSize:9,color:"#dc2626",marginTop:1}}>À payer</div></>
:<span style={{fontWeight:700,color:"#16a34a",fontSize:10}}>✅</span>
):"--"}
</td>);
case "actions":return(
<td key="actions" style={{...S.td,whiteSpace:"nowrap"}}>
<div style={{display:"flex",gap:2,alignItems:"center"}}>
<button style={S.btnSm} onClick={e=>{e.stopPropagation();editDoc(d);}} title="Modifier">✏️</button>
<button style={S.btnSm} onClick={e=>{e.stopPropagation();printDoc(d,cfg,data);}} title="Imprimer">🖨</button>
{canNext2&&(
<button style={{...S.btnSm,background:(DOC_CFG[circ2.next]?.color||"#059669")+"18",color:DOC_CFG[circ2.next]?.color||"#059669",borderColor:(DOC_CFG[circ2.next]?.color||"#059669")+"44",fontWeight:700,fontSize:10}}
title={circ2.lbl} onClick={e=>{e.stopPropagation();genNextFromList(d,circ2.next);}}>
→{(DOC_CFG[circ2.next]?.titre||"").slice(0,5)}
</button>
)}
{/* Bouton Régler — Factures validées + Pro Forma confirmées */}
{(()=>{
const isReglable=(isF&&isValide2)||
(isPF2&&(d.statut==="Confirmée"||d.statut==="Envoyée"||isValide2));
const pfCalc=docCalc(d.lignes,d.remiseGlobale||0);
const pfRegls=(data[isVte?"reglementsVente":"reglementsAchat"]||[]);
const pfPaye=pfRegls.filter(r=>r.factureId===d.id&&r.statut==="Encaissé").reduce((s,r)=>s+(+r.montant||0),0);
const pfReste=Math.max(0,pfCalc.ttc-pfPaye);
const pfSolde=pfReste<=0&&pfCalc.ttc>0;
if(!isReglable)return null;
return pfSolde
?<span style={{...S.badge,background:"#f0fdf4",color:"#16a34a",fontSize:9}}>✅</span>
:<button style={{...S.btnSm,background:"#f0fdf4",color:"#16a34a",borderColor:"#86efac",fontSize:11}}
title="Enregistrer un règlement"
onClick={e=>{e.stopPropagation();setReglModal({doc:d,montant:String(pfReste>0?pfReste:pfCalc.ttc),mode:"Espèces",date:today(),ref:"",notes:""});}}>
💰
</button>;
})()}
{isTransferred2
?<span style={{...S.badge,background:"#fef3c7",color:"#92400e",fontSize:9,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={"→ "+d._transferredRef}>🔒{d._transferredRef}</span>
:<button style={{...S.btnSm,color:locked2?"#94a3b8":"#dc2626"}} title={locked2?"🔒 Verrouillé":"Supprimer"}
onClick={e=>{e.stopPropagation();delDoc(d.id);}}>{locked2?"🔒":"🗑"}</button>}
</div>
</td>);
default:return <td key={col.id} style={S.td}>--</td>;
}
})}
</tr>
);
})}
</tbody>
</table>
</div>

{/* Barre totaux */}
{docs.length>0&&(()=>{
const totHT2=docs.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).baseHT,0);
const totTTC2=docs.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ttc,0);
const totPaye2=isF?docs.reduce((s,d)=>s+(data[regKey]||[]).filter(r=>r.factureId===d.id&&r.statut==="Encaissé").reduce((ss,r)=>ss+(+r.montant||0),0),0):0;
const totReste2=isF?Math.max(0,totTTC2-totPaye2):0;
return(
<div style={{padding:"8px 16px",borderTop:"2px solid #1a2332",background:"#f8fafc",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
<span style={{fontSize:11,color:"#64748b"}}>{docs.length} doc(s)</span>
<div style={{flex:1}}/>
{[
{l:"Base HT",v:fmt(totHT2)+" DH",c:"#1a2332"},
{l:"Total TTC",v:fmt(totTTC2)+" DH",c:"#d97706"},
...(isF?[{l:"Réglé",v:fmt(totPaye2)+" DH",c:"#16a34a"},{l:"Solde",v:totReste2>0?fmt(totReste2)+" DH":"✅",c:totReste2>0?"#dc2626":"#16a34a"}]:[]),
].map(k=>(
<div key={k.l} style={{textAlign:"center",padding:"3px 10px",background:"#fff",borderRadius:5,border:"1px solid #e2e8f0"}}>
<div style={{fontSize:9,color:"#94a3b8"}}>{k.l}</div>
<div style={{fontWeight:800,color:k.c,fontSize:12}}>{k.v}</div>
</div>
))}
</div>
);
})()}
</>
);
})()}

<Toast msg={toast?.msg} ok={toast?.ok}/>
{/* ── MODAL REGROUPEMENT ── */}
{regroupModal&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:14,width:580,maxWidth:"95vw",maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
<div style={{padding:"16px 20px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:8,background:"#0891b2"}}>
<span style={{fontSize:22}}>🔗</span>
<div>
<div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Regrouper en {DOC_CFG[regroupModal.destType]?.titre}</div>
<div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>Sélectionnez les {cfg.titre} à regrouper en un seul document</div>
</div>
<button onClick={()=>setRegroupModal(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:22,color:"rgba(255,255,255,.7)"}}>×</button>
</div>

<div style={{padding:16,borderBottom:"1px solid #f0f4f8",background:"#f0f9ff"}}>
<label style={S.lbl}>Tiers (client/fournisseur)</label>
<select style={S.inp} value={regroupModal.tiersId||""} onChange={e=>setRegroupModal(p=>({...p,tiersId:e.target.value}))}>
<option value="">-- Hériter du premier document --</option>
{tiersList.map(t=><option key={t.id} value={t.id}>{t.nom}</option>)}
</select>
<div style={{fontSize:11,color:"#0891b2",marginTop:6}}>
{regroupModal.selectedIds.length>0
?`✅ ${regroupModal.selectedIds.length} document(s) sélectionné(s) · ${regroupModal.docs.filter(d=>regroupModal.selectedIds.includes(d.id)).reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).lignes?.length||0,0)} lignes au total`
:"Sélectionnez au moins 1 document ci-dessous"}
</div>
</div>

{/* Boutons sélection rapide */}
<div style={{padding:"6px 16px",borderBottom:"1px solid #f0f4f8",display:"flex",gap:6,background:"#f8fafc"}}>
<button style={{...S.btnSm,fontSize:11}} onClick={()=>setRegroupModal(p=>({...p,selectedIds:p.docs.map(d=>d.id)}))}>
✓ Tout sélectionner ({regroupModal.docs.length})
</button>
<button style={{...S.btnSm,fontSize:11}} onClick={()=>setRegroupModal(p=>({...p,selectedIds:[]}))}>
✕ Tout désélectionner
</button>
{regroupModal.tiersId&&(
<button style={{...S.btnSm,fontSize:11,color:"#0891b2"}} onClick={()=>setRegroupModal(p=>({...p,selectedIds:p.docs.filter(d=>d.tiers===p.tiersId).map(d=>d.id)}))}>
Sélectionner ce tiers uniquement
</button>
)}
</div>

{/* Liste des documents */}
<div style={{flex:1,overflowY:"auto",padding:12}}>
{regroupModal.docs.length===0?(
<div style={{textAlign:"center",padding:24,color:"#94a3b8"}}>Aucun document validé disponible</div>
):(
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["","N°","Tiers","Date","Lignes","Total TTC"].map(h=><th key={h} style={S.th}>{h}</th>)}
</tr></thead>
<tbody>
{regroupModal.docs.map(d=>{
const calc2=docCalc(d.lignes,d.remiseGlobale||0);
const tiers2=tiersList.find(t=>t.id===d.tiers);
const isSel=regroupModal.selectedIds.includes(d.id);
return(
<tr key={d.id}
onClick={()=>setRegroupModal(p=>({...p,selectedIds:isSel?p.selectedIds.filter(x=>x!==d.id):[...p.selectedIds,d.id]}))}
style={{cursor:"pointer",background:isSel?"#f0f9ff":"#fff",borderBottom:"1px solid #f0f4f8"}}
onMouseEnter={e=>e.currentTarget.style.background=isSel?"#e0f2fe":"#f8fafc"}
onMouseLeave={e=>e.currentTarget.style.background=isSel?"#f0f9ff":"#fff"}>
<td style={{...S.td,width:36,textAlign:"center"}}>
<input type="checkbox" checked={isSel} onChange={()=>{}} style={{accentColor:"#0891b2",width:15,height:15}}/>
</td>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#0891b2"}}>{d.ref}</td>
<td style={S.td}><div style={{fontWeight:600}}>{tiers2?.nom||"--"}</div><div style={{fontSize:10,color:"#94a3b8"}}>{tiers2?.ville||""}</div></td>
<td style={{...S.td,whiteSpace:"nowrap"}}>{d.dateDoc}</td>
<td style={{...S.td,textAlign:"center",color:"#64748b"}}>{d.lignes?.length||0}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:700,color:"#d97706"}}>{fmt(calc2.ttc)} DH</td>
</tr>
);
})}
</tbody>
{regroupModal.selectedIds.length>0&&(
<tfoot>
<tr style={{background:"#1a2332"}}>
<td colSpan={4} style={{...S.td,color:"#fff",fontWeight:700}}>TOTAL — {regroupModal.selectedIds.length} doc(s)</td>
<td style={{...S.td,textAlign:"center",color:"#a8b8cc",fontWeight:700}}>
{regroupModal.docs.filter(d=>regroupModal.selectedIds.includes(d.id)).reduce((s,d)=>s+(d.lignes?.length||0),0)} lignes
</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:900,color:"#e8a020"}}>
{fmt(regroupModal.docs.filter(d=>regroupModal.selectedIds.includes(d.id)).reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ttc,0))} DH
</td>
</tr>
</tfoot>
)}
</table>
)}
</div>

<div style={{padding:"12px 16px",borderTop:"1px solid #f0f4f8",display:"flex",gap:8}}>
<button style={{...S.btnS,flex:1}} onClick={()=>setRegroupModal(null)}>Annuler</button>
<button style={{...S.btnP,flex:2,background:"#0891b2",opacity:regroupModal.selectedIds.length===0?0.5:1}}
disabled={regroupModal.selectedIds.length===0}
onClick={saveRegroup}>
🔗 Créer {DOC_CFG[regroupModal.destType]?.titre} groupé ({regroupModal.selectedIds.length} doc{regroupModal.selectedIds.length>1?"s":""})
</button>
</div>
</div>
</div>
)}
{/* ── MODAL RÈGLEMENT ── */}
{reglModal&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:14,width:460,maxWidth:"95vw",overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
<div style={{padding:"16px 20px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:8}}>
<span style={{fontSize:22}}>💰</span>
<div>
<div style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>Règlement de facture</div>
<div style={{fontSize:12,color:"#94a3b8"}}>{reglModal.doc.ref} · {tiersList.find(t=>t.id===reglModal.doc.tiers)?.nom||"--"}</div>
</div>
<button onClick={()=>setReglModal(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#94a3b8",lineHeight:1}}>×</button>
</div>
<div style={{padding:20}}>
{/* Récap facture */}
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",gap:16,flexWrap:"wrap"}}>
{(()=>{
const calc2=docCalc(reglModal.doc.lignes,reglModal.doc.remiseGlobale||0);
const isVte=docType==="vte-facture"||docType==="vte-proforma";
const regKey=isVte?"reglementsVente":"reglementsAchat";
const dejaPaye=(data[regKey]||[]).filter(r=>r.factureId===reglModal.doc.id&&r.statut==="Encaissé").reduce((s,r)=>s+(+r.montant||0),0);
const resteDu=calc2.ttc-dejaPaye;
return(
<>
<div><div style={{fontSize:10,color:"#94a3b8"}}>Total TTC</div><div style={{fontWeight:800,color:"#d97706",fontFamily:"monospace"}}>{fmt(calc2.ttc)} DH</div></div>
<div><div style={{fontSize:10,color:"#94a3b8"}}>Déjà réglé</div><div style={{fontWeight:800,color:"#16a34a",fontFamily:"monospace"}}>{fmt(dejaPaye)} DH</div></div>
<div><div style={{fontSize:10,color:"#94a3b8"}}>Reste à payer</div><div style={{fontWeight:800,color:resteDu>0?"#dc2626":"#16a34a",fontFamily:"monospace"}}>{fmt(resteDu)} DH</div></div>
</>
);
})()}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
<div style={{marginBottom:12,gridColumn:"1/-1"}}>
<label style={S.lbl}>Montant à régler (DH) *</label>
<input type="number" step="0.01" min="0.01"
style={{...S.inp,textAlign:"right",fontFamily:"monospace",fontWeight:800,fontSize:18,color:"#16a34a"}}
value={reglModal.montant}
onChange={e=>setReglModal(p=>({...p,montant:e.target.value}))}
autoFocus/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Date de règlement</label>
<input type="date" style={S.inp} value={reglModal.date} onChange={e=>setReglModal(p=>({...p,date:e.target.value}))}/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Mode de paiement</label>
<select style={S.inp} value={reglModal.mode} onChange={e=>setReglModal(p=>({...p,mode:e.target.value}))}>
{["Espèces","Chèque","Virement bancaire","Traite","Carte bancaire","Compensation","Autre"].map(m=><option key={m}>{m}</option>)}
</select>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Référence (N° chèque, virement...)</label>
<input style={{...S.inp,fontFamily:"monospace"}} value={reglModal.ref} onChange={e=>setReglModal(p=>({...p,ref:e.target.value}))} placeholder="CHQ-001, VIR-2026..."/>
</div>
<div style={{marginBottom:16,gridColumn:"1/-1"}}>
<label style={S.lbl}>Notes</label>
<input style={S.inp} value={reglModal.notes} onChange={e=>setReglModal(p=>({...p,notes:e.target.value}))} placeholder="Informations complémentaires..."/>
</div>
</div>
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={()=>setReglModal(null)}>Annuler</button>
<button style={{...S.btnP,flex:1,background:"#16a34a"}} onClick={saveRegl}>💰 Enregistrer le règlement</button>
</div>
</div>
</div>
</div>
)}
{confirmDel&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:12,padding:28,width:500,maxWidth:"94vw",boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
<div style={{textAlign:"center",marginBottom:16}}>
<div style={{fontSize:38,marginBottom:8}}>{confirmDel.isBlocked?"🔒":"⚠️"}</div>
<div style={{fontWeight:800,fontSize:16,color:"#1a2332",marginBottom:6}}>
{confirmDel.isBlocked?"Suppression impossible":"Confirmer la suppression"}
</div>
<div style={{fontFamily:"monospace",fontWeight:700,color:cfg.color,fontSize:14}}>{confirmDel.doc.ref}</div>
<div style={{fontSize:12,color:"#64748b",marginTop:4}}>
{tiersList.find(t=>t.id===confirmDel.doc.tiers)?.nom||""} · {confirmDel.doc.dateDoc} · <span style={{fontWeight:600}}>{confirmDel.doc.statut}</span>
</div>
</div>

{/* Blocages — suppression impossible */}
{confirmDel.isBlocked&&(
<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
<div style={{fontWeight:700,color:"#dc2626",marginBottom:8,fontSize:13}}>🔒 Ce document est verrouillé :</div>
{confirmDel.blockers.map((r,i)=>(
<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:"#7f1d1d",marginBottom:i<confirmDel.blockers.length-1?6:0}}>
<span style={{flexShrink:0,marginTop:1}}>•</span><span>{r}</span>
</div>
))}
</div>
)}

{/* Avertissements non bloquants */}
{!confirmDel.isBlocked&&confirmDel.reasons.length>0&&(
<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
{confirmDel.reasons.map((r,i)=>(
<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:"#92400e",marginBottom:i<confirmDel.reasons.length-1?6:0}}>
<span style={{flexShrink:0}}>ℹ️</span><span>{r}</span>
</div>
))}
</div>
)}

{confirmDel.isBlocked?(
<button style={{...S.btnS,width:"100%"}} onClick={()=>setConfirmDel(null)}>Fermer</button>
):(
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={()=>setConfirmDel(null)}>Annuler</button>
<button style={{...S.btnP,flex:1,background:"#dc2626"}} onClick={confirmDeleteDoc}>
🗑 Supprimer définitivement
</button>
</div>
)}
</div>
</div>
)}
</div>
);
return(
<div onClick={()=>{setArtDD(null);setDepDD(null);}}>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
<button style={{...S.btnS,padding:"6px 14px"}} onClick={()=>setView("list")}>Retour</button>
<div style={{width:4,height:18,background:cfg.color,borderRadius:2}}/>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>{cfg.titre}</span>
<span style={{fontFamily:"monospace",fontWeight:700,color:cfg.color,background:`${cfg.color}12`,padding:"3px 10px",borderRadius:5}}>{cur.ref}</span>
{cur.sourceRef&&<span style={{...S.badge,background:"#f0f9ff",color:"#0891b2"}}>depuis {cur.sourceRef}</span>}
{cur._transferred&&<span style={{...S.badge,background:"#fef3c7",color:"#92400e"}}>🔒 Transféré → {cur._transferredRef}</span>}
{cur._syncFromProforma&&<span style={{...S.badge,background:"#f0fdf4",color:"#16a34a"}}>🔄 Sync depuis {cur._syncFromProforma}</span>}
{isFacture&&isValidated&&<span style={{...S.badge,background:"#fef2f2",color:"#dc2626"}}>🔒 Facture validée — non modifiable</span>}
</div>

{/* Bannière facture validée */}
{isFacture&&isValidated&&(
<div style={{background:"#fef2f2",border:"2px solid #fecaca",borderRadius:8,padding:"12px 16px",marginBottom:12,fontSize:13}}>
<div style={{display:"flex",alignItems:"flex-start",gap:10}}>
<span style={{fontSize:20,flexShrink:0}}>🔒</span>
<div style={{flex:1}}>
<div style={{fontWeight:800,color:"#dc2626",marginBottom:4}}>Facture {cur.statut} — Modification interdite</div>
<div style={{fontSize:12,color:"#78716c",marginBottom:10}}>
Pour modifier, vous devez <strong>supprimer cette facture</strong>, puis modifier la <strong>Pro Forma source</strong> ({cur.sourceRef||"introuvable"}).
Toute modification sur la Pro Forma sera automatiquement synchronisée sur le BL.
</div>
<div style={{display:"flex",gap:8}}>
<button
onClick={()=>{
if(window.confirm(`⚠️ Supprimer la facture "${cur.ref}" ?\n\nCette action est irréversible.\nVous pourrez ensuite modifier la Pro Forma source.\n\nConfirmer ?`)){
delDoc(cur.id);
}
}}
style={{...S.btnP,background:"#dc2626",fontSize:12}}>
🗑 Supprimer cette facture
</button>
{cur.sourceRef&&<button
onClick={()=>{
const pfType=docType==="vte-facture"?"vte-proforma":"ach-proforma";
navigateTo(pfType);
}}
style={{...S.btnP,background:"#8b5cf6",fontSize:12}}>
🔖 Aller à la Pro Forma {cur.sourceRef}
</button>}
</div>
</div>
</div>
</div>
)}
{cur._transferred&&(
<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"12px 16px",marginBottom:12,fontSize:13}}>
<div style={{display:"flex",alignItems:"flex-start",gap:10}}>
<span style={{fontSize:18,flexShrink:0}}>🔒</span>
<div style={{flex:1}}>
<div style={{fontWeight:700,color:"#92400e",marginBottom:4}}>Document verrouillé — transféré vers {cur._transferredRef}</div>
<div style={{fontSize:12,color:"#78716c",marginBottom:10}}>
Ce document a généré <strong>{cur._transferredRef}</strong>. Toute modification ici peut créer une incohérence avec le document successeur.
</div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
<button
onClick={()=>{
if(window.confirm(`⚠️ ATTENTION\n\nVous allez déverrouiller "${cur.ref}".\n\nCela peut créer une incohérence avec "${cur._transferredRef}" qui a été généré à partir de ce document.\n\nÊtes-vous sûr de vouloir continuer ?`)){
// Déverrouiller le document
setData(p=>({...p,documents:{...p.documents,[docType]:p.documents[docType].map(d=>d.id===cur.id?{...d,_transferred:null,_transferredRef:null}:d)}}));
setCur(p=>({...p,_transferred:null,_transferredRef:null}));
}}
}
style={{...S.btnS,color:"#d97706",borderColor:"#fcd34d",fontSize:11,fontWeight:700}}>
🔓 Déverrouiller et modifier
</button>
<button
onClick={()=>navigateTo(docType==="ach-bl"||docType==="vte-bl"?"ach-proforma"===cur._transferred?.split("-")[0]? cur._transferred : cur._transferred : cur._transferred)}
style={{...S.btnP,background:"#0891b2",fontSize:11}}>
→ Aller à {cur._transferredRef}
</button>
</div>
</div>
</div>
</div>
)}
<div style={{...S.card,padding:20,marginBottom:12}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
<Fld label="N° Document"><input style={{...S.inp,fontFamily:"monospace",fontWeight:700,color:cfg.color}} value={cur.ref} onChange={e=>setCur(p=>({...p,ref:e.target.value}))}/></Fld>
<Fld label="Agence">
<select style={S.inp} value={cur.agence} onChange={e=>setCur(p=>({...p,agence:e.target.value}))}>
<option value="">--</option>
{data.agences.map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
</select>
</Fld>
<Fld label={cfg.tiersLabel}>
<SearchSelect
value={cur.tiers}
onChange={v=>setCur(p=>({...p,tiers:v}))}
color={cfg.color}
placeholder={`Choisir ${cfg.tiersLabel.toLowerCase()}...`}
options={tiersList.map(t=>({
id:t.id,
label:`${t.code} -- ${t.nom}`,
sub:[t.ville,t.tel].filter(Boolean).join(" · "),
meta:t.ice?`ICE: ${t.ice}`:"",
}))}
/>
</Fld>
<Fld label="Date document"><input type="date" style={S.inp} value={cur.dateDoc} onChange={e=>setCur(p=>({...p,dateDoc:e.target.value}))}/></Fld>
<Fld label="Date livraison"><input type="date" style={S.inp} value={cur.dateLiv} onChange={e=>setCur(p=>({...p,dateLiv:e.target.value}))}/></Fld>
<Fld label="Statut">
<select style={{...S.inp,color:sc[cur.statut]||"#94a3b8",fontWeight:700}} value={cur.statut} onChange={e=>setCur(p=>({...p,statut:e.target.value}))}>
{cfg.statuts.map(s=><option key={s} value={s}>{s}</option>)}
</select>
</Fld>
</div>
</div>

{/* ── CHAMPS PERSONNALISÉS EN-TÊTE ── */}
{(()=>{
const champsDefs=data.champsEnteteDoc||[];
const champsDocType=champsDefs.filter(c=>c.actif!==false&&(c.docTypes?.includes(docType)||!c.docTypes?.length));
if(champsDocType.length===0)return null;
return(
<div style={{...S.card,marginBottom:12}}>
<div style={{...S.hdr,paddingBottom:8,borderBottom:"1px solid #f0f4f8"}}>
<span style={{fontWeight:700,fontSize:13}}>Informations complémentaires</span>
<span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed",marginLeft:6,fontSize:10}}>{champsDocType.length} champ(s)</span>
</div>
<div style={{padding:"10px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
{champsDocType.map(champ=>(
<Fld key={champ.id} label={champ.label+(champ.required?"*":"")} full={champ.type==="textarea"||champ.full}>
{champ.type==="select"?(
<select style={S.inp} value={cur._entete?.[champ.id]||""} onChange={e=>setCur(p=>({...p,_entete:{...(p._entete||{}),[champ.id]:e.target.value}}))}>
<option value="">--</option>
{(champ.options||[]).map(o=><option key={o} value={o}>{o}</option>)}
</select>
):champ.type==="date"?(
<input type="date" style={S.inp} value={cur._entete?.[champ.id]||""} onChange={e=>setCur(p=>({...p,_entete:{...(p._entete||{}),[champ.id]:e.target.value}}))}/>
):champ.type==="checkbox"?(
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 0"}}>
<input type="checkbox" checked={!!cur._entete?.[champ.id]} onChange={e=>setCur(p=>({...p,_entete:{...(p._entete||{}),[champ.id]:e.target.checked}}))} style={{accentColor:"#7c3aed",width:16,height:16}}/>
<span style={{fontSize:13}}>{cur._entete?.[champ.id]?"Oui":"Non"}</span>
</label>
):champ.type==="textarea"?(
<textarea rows={2} style={{...S.inp,resize:"vertical"}} value={cur._entete?.[champ.id]||""} onChange={e=>setCur(p=>({...p,_entete:{...(p._entete||{}),[champ.id]:e.target.value}}))
} placeholder={champ.placeholder||""}/>
):(
<input type={champ.type==="number"?"number":"text"} style={S.inp} value={cur._entete?.[champ.id]||""} onChange={e=>setCur(p=>({...p,_entete:{...(p._entete||{}),[champ.id]:e.target.value}}))} placeholder={champ.placeholder||""}/>
)}
</Fld>
))}
</div>
</div>
);
})()}
<div style={S.card}>
<div style={{...S.hdr,paddingBottom:10,borderBottom:"1px solid #f0f4f8"}}>
<span style={{fontWeight:700}}>Lignes</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:6}}>{cur.lignes.length}</span>
{cfg.stockImpact&&!cur.agence&&<span style={{fontSize:11,color:"#d97706",marginLeft:8}}>⚠ Selectionnez une agence pour filtrer les depots</span>}
</div>
<div style={{overflowX:"auto",overflowY:"visible",position:"relative"}}>
<table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
<thead>
<tr>
{["#","Article","Désignation","Unité","Qté","Prix U. HT","Rem%","TVA%","Net HT","Dépôt","Emplacement",cfg.stockImpact?"Dispo":"","Note",""].map((h,i)=>h||h===""?<th key={i} style={S.th}>{h}</th>:null)}
</tr>
</thead>
<tbody>
{cur.lignes.map((l,idx)=>{
const depot     = l.depotId ? data.depots.find(d=>d.id===l.depotId) : null;
const agDepot   = depot ? data.agences.find(a=>a.id===depot.agenceId) : null;
const empls     = depot?.emplacements||[];
const sd        = l.articleId&&l.depotId ? (data.stockDepots[l.articleId]?.[l.depotId]?.qte||0) : null;
const artSearch = l.article||"";
const artsFilt  = artSearch.length>0
? data.articles.filter(a=>
a.ref.toLowerCase().includes(artSearch.toLowerCase())||
a.designation.toLowerCase().includes(artSearch.toLowerCase())||
(a.codeBarre||"").includes(artSearch)||
(a.marque||"").toLowerCase().includes(artSearch.toLowerCase())
)
: data.articles;
return(
<tr key={l.id} style={{verticalAlign:"top"}}>
<td style={{...S.td,textAlign:"center",width:32}}>
<span style={{color:cfg.color,fontWeight:700,fontSize:12}}>{idx+1}</span>
</td>
<td style={{...S.td,minWidth:180}} onClick={e=>e.stopPropagation()}>
<ArticlePickerCell l={l} cur={cur} setCur={setCur} cfg={cfg} data={data} tiersList={tiersList}/>
</td>
<td style={{...S.td,minWidth:140}}>
<input style={{...S.inp,minWidth:130}} value={l.designation||""} onChange={e=>updL(l.id,"designation",e.target.value)}/>
</td>
<td style={{...S.td,width:60}}>
<input style={{...S.inp,width:55,textAlign:"center"}} value={l.unite||""} onChange={e=>updL(l.id,"unite",e.target.value)}/>
</td>
<td style={{...S.td,width:70}}>
<input type="number" style={{...S.inp,width:60,textAlign:"right",color:+l.qte<0?"#dc2626":"#16a34a",fontWeight:700}} value={l.qte||0} onChange={e=>updL(l.id,"qte",+e.target.value||0)}/>
</td>
<td style={{...S.td,width:90}}>
<input type="number" step="0.01" style={{...S.inp,width:80,textAlign:"right"}} value={l.prix||0} onChange={e=>updL(l.id,"prix",+e.target.value||0)}/>
</td>
<td style={{...S.td,width:65}}>
<input type="number" step="0.1" min="0" max="100" style={{...S.inp,width:55,textAlign:"right",color:+l.remise>0?"#d97706":"#94a3b8"}} value={l.remise||0} onChange={e=>updL(l.id,"remise",+e.target.value||0)}/>
</td>
<td style={{...S.td,width:70}}>
<select style={{...S.inp,width:60}} value={l.tva||20} onChange={e=>updL(l.id,"tva",+e.target.value)}>
{[0,7,10,14,20].map(t=><option key={t} value={t}>{t}%</option>)}
</select>
</td>
<td style={{...S.td,textAlign:"right",fontWeight:700,width:90}}>
{fmt(ligneNetHT(l))}
</td>
{/* Champs calculés ligne */}
{(data.champsCalcules||[]).filter(c=>c.portee==="ligne"&&c.actif!==false&&c.afficherDoc).map(champ=>{
const ctx={
qte:+l.qte||0,prix:+l.prix||0,remise:+l.remise||0,tva:+l.tva||20,
prixAchat:+(data.articles?.find(a=>a.id===l.articleId)?.prixAchat||0),
netHT:ligneNetHT(l),montantTVA:ligneTVA(l),ttcLigne:ligneTTC(l),
margeHT:(+l.prix||0)-(+(data.articles?.find(a=>a.id===l.articleId)?.prixAchat||0)),
pctMarge:(+l.prix||0)>0?(((+l.prix||0)-(+(data.articles?.find(a=>a.id===l.articleId)?.prixAchat||0)))/(+l.prix||0)*100):0,
};
let val="--";
if(champ.type==="formule"&&champ.formule){
try{val=evalFormule(champ.formule,ctx);}catch(e){val="ERR";}
}
return(
<td key={champ.id} style={{...S.td,textAlign:"right",fontFamily:"monospace",fontSize:12,color:val==="ERR"?"#dc2626":"#7c3aed"}}>
{val!=="ERR"?fmt(+val||0):val} {champ.unite||""}
</td>
);
})}
<td style={{...S.td,minWidth:150}}>
<select
style={{
...S.inp,
borderColor: l.depotId?"#16a34a":"#fca5a5",
background:  l.depotId?"#f0fdf4":"#fff7f7",
color:       l.depotId?"#15803d":"#ef4444",
fontWeight:  700,
}}
value={l.depotId||""}
onChange={e=>{
const depId=e.target.value;
const empStock=l.articleId&&depId?data.stockDepots[l.articleId]?.[depId]?.emplacement||"":"";
setCur(p=>({...p,lignes:p.lignes.map(li=>li.id===l.id?{...li,depotId:depId,emplacement:empStock}:li)}));
}}>
<option value="">-- Dépôt * --</option>
{depotsDoc.map(d=>{
const ag=data.agences.find(a=>a.id===d.agenceId);
return(
<option key={d.id} value={d.id}>
{d.code} -- {d.nom}{ag?` (${ag.nom})`:""}
{d.actif===false?" [Inactif]":""}
</option>
);
})}
</select>
{depot&&agDepot&&(
<div style={{fontSize:9,color:"#94a3b8",marginTop:2,paddingLeft:2}}>{agDepot.nom}</div>
)}
</td>
<td style={{...S.td,minWidth:110}}>
{l.depotId?(
<select
style={{
...S.inp,
fontFamily:"monospace",fontWeight:700,
color:l.emplacement?"#0891b2":"#94a3b8",
borderColor:l.emplacement?"#7dd3fc":"#e2e8f0",
}}
value={l.emplacement||""}
onChange={e=>updL(l.id,"emplacement",e.target.value)}>
<option value="">-- Emplacement --</option>
{empls.map(emp=>{
const isActuel=l.articleId&&data.stockDepots[l.articleId]?.[l.depotId]?.emplacement===emp;
return(
<option key={emp} value={emp}>
{emp}{isActuel?" ★":""}
</option>
);
})}
{l.emplacement&&!empls.includes(l.emplacement)&&(
<option value={l.emplacement}>{l.emplacement}</option>
)}
</select>
):(
<div style={{color:"#d1d9e0",fontSize:11,padding:"6px 4px",textAlign:"center"}}>--</div>
)}
</td>
{cfg.stockImpact&&(
<td style={{...S.td,textAlign:"center",width:60}}>
{sd!==null?(
<span style={{fontWeight:700,fontSize:13,color:sd<=0?"#dc2626":sd<(l.qte||0)?"#d97706":"#16a34a"}}>{sd}</span>
):<span style={{color:"#d1d9e0"}}>--</span>}
</td>
)}
<td style={{...S.td,minWidth:100}}>
<input style={{...S.inp,minWidth:90,fontSize:11}} value={l.note||""} placeholder="Note..." onChange={e=>updL(l.id,"note",e.target.value)}/>
</td>
<td style={{...S.td,textAlign:"center",width:30}}>
<button onClick={()=>setCur(p=>({...p,lignes:p.lignes.filter(li=>li.id!==l.id)}))}
style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:18,lineHeight:1,padding:"2px 4px"}}>×</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
<div style={{padding:"9px 16px",borderTop:"1px solid #f0f4f8"}}>
<button onClick={()=>setCur(p=>({...p,lignes:[...p.lignes,newLigne()]}))} style={{background:"none",border:"1.5px dashed #d1d9e0",color:cfg.color,padding:"6px 16px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:600}}>+ Ajouter ligne</button>
</div>
</div>
<div style={{display:"flex",gap:16,alignItems:"flex-start",marginTop:12}}>
<div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
<div style={{...S.card,padding:14}}>
<Fld label="Notes / Observations">
<textarea style={{...S.inp,resize:"vertical",lineHeight:1.6}} rows={3} value={cur.notes} onChange={e=>setCur(p=>({...p,notes:e.target.value}))} placeholder="Observations, conditions spéciales..."/>
{isStockDoc&&(
<div style={{marginTop:8,padding:"8px 12px",background:cur._skipStock?"#fef9c3":"#f0fdf4",border:"1px solid "+(cur._skipStock?"#fcd34d":"#86efac"),borderRadius:8,display:"flex",alignItems:"center",gap:10}}>
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",flex:1}}>
<input type="checkbox" checked={cur._skipStock===true} onChange={e=>setCur(p=>({...p,_skipStock:e.target.checked}))} style={{accentColor:"#d97706",width:15,height:15}}/>
<span style={{fontSize:12,fontWeight:700,color:cur._skipStock?"#92400e":"#16a34a"}}>
{cur._skipStock?"Stock non géré pour ce document":"Stock géré automatiquement"}
</span>
</label>
<span style={{fontSize:10,color:cur._skipStock?"#d97706":"#94a3b8"}}>
{cur._skipStock?"Aucun mouvement de stock ne sera enregistré":"Mouvements appliqués à la validation"}
</span>
</div>
)}
</Fld>
</div>
<div style={{...S.card,padding:14}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
<Fld label="Mode de règlement">
<select style={S.inp} value={cur.modeReglement||""} onChange={e=>setCur(p=>({...p,modeReglement:e.target.value}))}>
<option value="">-- Sélectionner --</option>
{["Comptant","30 jours","60 jours","90 jours","À la commande","Virement","Chèque","Traite"].map(m=><option key={m}>{m}</option>)}
</select>
</Fld>
<Fld label="Date d'échéance">
<input type="date" style={S.inp} value={cur.dateEcheance||""} onChange={e=>setCur(p=>({...p,dateEcheance:e.target.value}))}/>
</Fld>
</div>
</div>
</div>
<div style={{...S.card,padding:18,minWidth:320}}>
<div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
<span>📊</span> Récapitulatif
</div>
{(()=>{
const c=docCalc(cur.lignes,cur.remiseGlobale||0);
return(
<>
<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,color:"#64748b",borderBottom:"1px solid #f0f4f8"}}>
<span>Montant brut HT</span>
<span style={{fontFamily:"monospace"}}>{fmt(c.brut)} DH</span>
</div>
{c.remLignes>0&&(
<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,color:"#d97706",borderBottom:"1px solid #f0f4f8"}}>
<span>Remises lignes</span>
<span style={{fontFamily:"monospace"}}>- {fmt(c.remLignes)} DH</span>
</div>
)}
<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,color:"#1a2332",borderBottom:"1px solid #f0f4f8",fontWeight:600}}>
<span>Net HT</span>
<span style={{fontFamily:"monospace"}}>{fmt(c.netHT)} DH</span>
</div>
<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,borderBottom:"1px solid #f0f4f8",alignItems:"center"}}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<span style={{color:"#64748b"}}>Remise globale</span>
<input type="number" min="0" max="100" step="0.1"
style={{...S.inp,width:60,padding:"2px 6px",textAlign:"center",fontWeight:700,color:"#d97706",fontSize:12}}
value={cur.remiseGlobale||0}
onChange={e=>setCur(p=>({...p,remiseGlobale:Math.min(100,Math.max(0,+e.target.value||0))}))}/>
<span style={{fontSize:11,color:"#94a3b8"}}>%</span>
</div>
<span style={{fontFamily:"monospace",color:c.remGlob>0?"#d97706":"#94a3b8"}}>
{c.remGlob>0?`- ${fmt(c.remGlob)} DH`:"0,00 DH"}
</span>
</div>
<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,fontWeight:700,color:"#1a2332",borderBottom:"2px solid #e2e8f0"}}>
<span>Base HT imposable</span>
<span style={{fontFamily:"monospace"}}>{fmt(c.baseHT)} DH</span>
</div>
{Object.values(c.tvaMap).filter(t=>t.montant>0).map(t=>(
<div key={t.taux} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:"#64748b",borderBottom:"1px dashed #f0f4f8"}}>
<span>TVA {t.taux}% <span style={{color:"#94a3b8",fontSize:11}}>(base {fmt(t.base)} DH)</span></span>
<span style={{fontFamily:"monospace"}}>{fmt(t.montant)} DH</span>
</div>
))}
{c.totalTVA===0&&(
<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:"#94a3b8",borderBottom:"1px dashed #f0f4f8"}}>
<span>TVA</span><span>0,00 DH</span>
</div>
)}
<div style={{background:"#1a2332",borderRadius:6,padding:"10px 14px",marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{color:"#a8b8cc",fontWeight:700,fontSize:13,textTransform:"uppercase"}}>Total TTC</span>
<span style={{color:"#e8a020",fontWeight:900,fontSize:20,fontFamily:"monospace"}}>{fmt(c.ttc)} DH</span>
</div>
{/* Champs calculés en-tête */}
{(data.champsCalcules||[]).filter(ch=>ch.portee==="entete"&&ch.actif!==false&&ch.afficherDoc).map(champ=>{
const ctx={
totalBrut:c.brut,totalRemise:c.remLignes+c.remGlob,baseHT:c.baseHT,
remiseGlob:+cur.remiseGlobale||0,totalTVA:c.totalTVA,totalTTC:c.ttc,
nbLignes:cur.lignes.length,nbArticles:new Set(cur.lignes.map(l=>l.articleId).filter(Boolean)).size,
dateDoc:cur.dateDoc||"",echeance:cur.dateEcheance||"",
nbJoursEch:cur.dateEcheance&&cur.dateDoc?Math.round((new Date(cur.dateEcheance)-new Date(cur.dateDoc))/(86400000)):0,
};
let val="--";
if(champ.type==="formule"&&champ.formule){
try{val=evalFormule(champ.formule,ctx);}catch(e){val="ERR";}
}
return(
<div key={champ.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,color:"#7c3aed",borderTop:"1px dashed #e9d5ff",marginTop:4}}>
<span style={{fontWeight:600}}>🧮 {champ.nom}</span>
<span style={{fontFamily:"monospace",fontWeight:700}}>{val!=="ERR"?fmt(+val||0):val} {champ.unite||"DH"}</span>
</div>
);
})}
<div style={{marginTop:8,fontSize:11,color:"#94a3b8",textAlign:"right"}}>
{cur.lignes.filter(l=>l.articleId).length} article(s) · {cur.lignes.reduce((s,l)=>s+(+l.qte||0),0)} unité(s)
</div>
</>
);
})()}
</div>
</div>
{cfg.stockImpact&&(
<div style={{background:"#f0f9ff",border:"1px solid #7dd3fc",borderRadius:8,padding:"10px 16px",marginTop:4,fontSize:12}}>
<div style={{fontWeight:700,color:"#0891b2",marginBottom:6}}>Diagnostic stock -- {cfg.stockImpact==="entree"?"BL Achat (Entrée)":"BL Vente (Sortie)"}</div>
<div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
<span>Lignes total : <strong>{cur.lignes.length}</strong></span>
<span style={{color:"#16a34a"}}>Avec article+dépôt : <strong>{cur.lignes.filter(l=>l.articleId&&l.depotId).length}</strong></span>
<span style={{color:"#dc2626"}}>Sans article : <strong>{cur.lignes.filter(l=>!l.articleId).length}</strong></span>
<span style={{color:"#d97706"}}>Sans dépôt : <strong>{cur.lignes.filter(l=>l.articleId&&!l.depotId).length}</strong></span>
<span>Statut actuel : <strong>{cur.statut}</strong></span>
<span>Stock déjà appliqué : <strong>{cur._stockApplied?"OUI":"NON"}</strong></span>
</div>
{cur.lignes.filter(l=>l.articleId&&l.depotId).length>0&&(
<div style={{marginTop:6,color:"#0891b2"}}>
{cur.lignes.filter(l=>l.articleId&&l.depotId).map((l,i)=>(
<div key={l.id}>Ligne {i+1}: {l.article} · Qté {l.qte} · Dépôt {data.depots.find(d=>d.id===l.depotId)?.code||l.depotId}</div>
))}
</div>
)}
</div>
)}
{cfg.stockImpact&&cur.lignes.some(l=>l.articleId&&!l.depotId)&&(
<div style={{background:"#fffbeb",border:"1.5px solid #fcd34d",borderRadius:8,padding:"10px 16px",marginTop:4,display:"flex",alignItems:"center",gap:10}}>
<span style={{fontSize:20}}>⚠️</span>
<div>
<div style={{fontWeight:700,color:"#92400e",fontSize:13}}>
{cur.lignes.filter(l=>l.articleId&&!l.depotId).length} ligne(s) sans dépôt sélectionné
</div>
<div style={{fontSize:12,color:"#92400e",marginTop:2}}>
Le stock ne sera pas mis à jour pour ces lignes lors de la validation.
Sélectionnez un dépôt pour chaque ligne article.
</div>
</div>
</div>
)}
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:14,flexWrap:"wrap",alignItems:"center"}}>
<button style={S.btnS} onClick={()=>setView("list")}>Retour</button>
<button style={{...S.btnS,color:"#0891b2",borderColor:"#0891b2"}} onClick={()=>printDoc(cur,cfg,data)}>🖨 PDF</button>
{(cur._transferred||(isFacture&&isValidated))?(
<div style={{display:"flex",alignItems:"center",gap:6,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"6px 12px",fontSize:12,color:"#dc2626"}}>
🔒 {isFacture&&isValidated?`Facture ${cur.statut} — non modifiable`:`Verrouillé → ${cur._transferredRef}`}
</div>
):(
<>
<button style={S.btnS} onClick={()=>saveDoc("Brouillon")}>Brouillon</button>
{cfg.statuts.filter(s=>s!=="Brouillon"&&!s.includes("Annul")).map(statut=>{
const isStock=STATUTS_STOCK.includes(statut);
const lignesSansDepot=isStock&&cfg.stockImpact?cur.lignes.filter(l=>l.articleId&&!l.depotId).length:0;
return(
<button key={statut}
style={{...S.btnP,background:isStock?"#16a34a":"#1a56db",fontSize:12,padding:"8px 16px",position:"relative"}}
onClick={()=>saveDoc(statut)}
title={lignesSansDepot>0?`⚠️ ${lignesSansDepot} ligne(s) sans dépôt`:""}
>
{isStock?"✓ ":""}{statut}
{lignesSansDepot>0&&(
<span style={{position:"absolute",top:-6,right:-6,background:"#f59e0b",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>!</span>
)}
</button>
);
})}
{circ&&(STATUTS_STOCK.includes(cur.statut)||(isProforma&&(cur.statut==="Confirmée"||cur.statut==="Envoyée")))&&!cur._transferred&&(
<>
<button style={{...S.btnP,background:DOC_CFG[circ.next]?.color||"#059669",fontSize:12}} onClick={()=>generateNext(circ.next)}>
{circ.lbl}
</button>
{circ.nextAlt&&(
<button style={{...S.btnP,background:"#8b5cf6",fontSize:12}} onClick={()=>generateNext(circ.nextAlt)}
title="Créer une Pro Forma pour ajuster avant la facture définitive">
🔖 {circ.lblAlt}
</button>
)}
</>
)}
</>
)}
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}
function printDoc(doc,cfg,data){
const tiersList=data[cfg.tiers]||[];
const tiers=tiersList.find(t=>t.id===doc.tiers)||{nom:"--",adresse:"",ville:"",ice:"",rc:"",tel:""};
const agence=data.agences.find(a=>a.id===doc.agence)||{nom:"--"};
const {societe}=data;
const c=docCalc(doc.lignes,doc.remiseGlobale||0);
const cP=societe.couleurPrincipale||"#1a2332",cA=societe.couleurAccent||"#e8a020";
const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${doc.ref}</title><style>
*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1a2332;}.p{padding:32px;max-width:860px;margin:0 auto;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid ${cA};}
.logo{background:${cP};color:#fff;padding:14px 22px;border-radius:8px;text-align:center;}
.logo h1{font-size:22px;font-weight:900;}.logo p{font-size:9px;letter-spacing:.1em;color:${cA};margin-top:3px;}
.doc-info{text-align:right;}.doc-info h2{font-size:20px;font-weight:800;color:${cfg.color};}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;}
.box h3{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:10px;font-weight:700;}
.box p{margin-bottom:3px;line-height:1.5;}
table{width:100%;border-collapse:collapse;margin-bottom:20px;}
thead tr{background:${cP};}th{color:#fff;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:9px 10px;text-align:left;}
tbody tr:nth-child(even){background:#f8fafc;}td{padding:8px 10px;border-bottom:1px solid #e8edf2;}
.tot{display:flex;justify-content:flex-end;}.tw{width:280px;}
.tr{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f4f8;font-size:13px;color:#64748b;}
.tt{display:flex;justify-content:space-between;padding:10px 0;font-weight:800;font-size:16px;border-top:2px solid #1a2332;}
.foot{margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.8;}
${cfg.isProforma?`.proforma-band{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:80px;font-weight:900;color:rgba(139,92,246,0.12);pointer-events:none;white-space:nowrap;z-index:0;letter-spacing:.1em;}`:""}
@media print{.btn{display:none;}}
</style></head><body><div class="p">
${cfg.isProforma?'<div class="proforma-band">PRO FORMA</div>':""}
${cfg.isProforma?`<div style="background:#f5f3ff;border:2px solid #8b5cf6;border-radius:8px;padding:8px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px"><span style="font-size:18px">🔖</span><div><div style="font-weight:800;color:#7c3aed;font-size:13px">FACTURE PRO FORMA — Document non définitif</div><div style="font-size:11px;color:#6d28d9">Ce document est à titre indicatif. Il sera remplacé par la facture définitive.</div></div></div>`:""}
<div class="hdr">
<div class="logo"><h1>${societe.nomCommercial||"MGCLOUD"}</h1><p>GARANTIE DISTRIBUTION</p></div>
<div class="doc-info"><h2>${cfg.titre}</h2><div style="font-size:14px;color:#64748b">${doc.ref}</div><div style="font-size:12px;color:#94a3b8">Date: ${doc.dateDoc||today()}</div>${doc.dateLiv?`<div style="font-size:12px;color:#94a3b8">Livraison: ${doc.dateLiv}</div>`:""}<div style="margin-top:6px"><span style="background:#f0fdf4;color:#166534;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700">${doc.statut}</span></div>${doc.sourceRef?`<div style="font-size:11px;color:#94a3b8;margin-top:4px">Issu de: ${doc.sourceRef}</div>`:""}</div>
</div>
<div class="g2">
<div class="box"><h3>Emetteur</h3><p><strong>${societe.raisonSociale}</strong></p><p>${societe.adresse||""}</p><p>${societe.cp||""} ${societe.ville||""}</p><p>Tel: ${societe.tel||""}</p><p>ICE: ${societe.ice||""} | RC: ${societe.rc||""}</p><p style="margin-top:6px;font-size:11px;color:#64748b">Agence: ${agence.nom}</p></div>
<div class="box"><h3>${cfg.tiersLabel}</h3><p><strong>${tiers.nom}</strong></p><p>${tiers.adresse||""}</p><p>${tiers.ville||""}</p>${tiers.tel?`<p>Tel: ${tiers.tel}</p>`:""}${tiers.ice?`<p>ICE: ${tiers.ice}</p>`:""}${tiers.rc?`<p>RC: ${tiers.rc}</p>`:""}</div>
</div>
${(()=>{
const champsDefs=(data.champsEnteteDoc||[]).filter(c=>c.actif!==false&&c.imprimer!==false&&doc._entete&&(c.docTypes?.length===0||!c.docTypes?.length||c.docTypes?.includes(docType)));
if(!champsDefs.length||!doc._entete)return "";
const rows=champsDefs.filter(c=>doc._entete[c.id]!==undefined&&doc._entete[c.id]!=="").map(c=>{
const val=c.type==="checkbox"?(doc._entete[c.id]?"Oui":"Non"):String(doc._entete[c.id]||"");
if(!val)return "";
return`<div class="row"><span>${c.label}</span><span style="font-weight:600">${val}</span></div>`;
}).filter(Boolean).join("");
if(!rows)return "";
return`<div class="box" style="margin-bottom:16px"><h3>Informations complémentaires</h3>${rows}</div>`;
})()}
<table><thead><tr><th>#</th><th>Désignation</th><th>Unité</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix U. HT</th><th style="text-align:right">Rem %</th><th style="text-align:right">TVA %</th><th>Dépôt</th><th>Emplacement</th><th style="text-align:right">Net HT</th></tr></thead>
<tbody>${(doc.lignes||[]).map((l,i)=>{const dep=data.depots.find(d=>d.id===l.depotId);return`<tr><td style="color:${cfg.color};font-weight:700">${String(i+1).padStart(2,"0")}</td><td>${l.designation||"--"}</td><td>${l.unite||"--"}</td><td style="text-align:right">${l.qte||0}</td><td style="text-align:right">${fmt(l.prix)}</td><td style="text-align:right;color:#d97706">${l.remise||0}%</td><td style="text-align:right">${l.tva||20}%</td><td>${dep?.code||"--"}</td><td style="font-family:monospace;color:#0891b2">${l.emplacement||"--"}</td><td style="text-align:right;font-weight:700">${fmt(ligneNetHT(l))}</td></tr>`;}).join("")}</tbody>
</table>
<div class="tot"><div class="tw">
${c.remLignes>0?`<div class="tr"><span>Montant brut HT</span><span>${fmt(c.brut)} DH</span></div><div class="tr"><span>Remises lignes</span><span>- ${fmt(c.remLignes)} DH</span></div>`:""}
<div class="tr"><span>Net HT</span><span>${fmt(c.netHT)} DH</span></div>
${c.remGlob>0?`<div class="tr"><span>Remise globale (${doc.remiseGlobale||0}%)</span><span>- ${fmt(c.remGlob)} DH</span></div>`:""}
<div class="tr"><span><b>Base HT imposable</b></span><span><b>${fmt(c.baseHT)} DH</b></span></div>
${Object.values(c.tvaMap).filter(t=>t.montant>0).map(t=>`<div class="tr"><span>TVA ${t.taux}%</span><span>${fmt(t.montant)} DH</span></div>`).join("")}
<div class="tt"><span>TOTAL TTC</span><span style="color:${cA}">${fmt(c.ttc)} DH</span></div>
</div></div>
${doc.notes?`<div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:6px;font-size:12px"><strong>Notes:</strong> ${doc.notes}</div>`:""}
<div class="foot"><p>${societe.piedPage||""}</p><p>${societe.mentionsLegales||""}</p></div>
<div class="btn" style="text-align:center;margin-top:24px"><button onclick="window.print()" style="background:${cP};color:#fff;border:none;padding:10px 28px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:700">Imprimer / PDF</button></div>
</div></body></html>`;
openPrint(html);
}
function StockMvtModule({data}){
const ALL_COLS_MVT=[
{id:"date",label:"Date"},{id:"type",label:"Type"},
{id:"ref",label:"Référence"},{id:"nom",label:"Désignation"},
{id:"qte",label:"Qté"},{id:"avant",label:"Avant"},
{id:"apres",label:"Après"},{id:"depot",label:"Dépôt"},
{id:"doc",label:"Document"},
];
const [visColsMVT,setVisColsMVT_raw]=useState(()=>LS.get("lgm_cols_mvt")||["date","type","ref","nom","qte","apres","depot"]);
const setVisColsMVT=(v)=>{LS.set("lgm_cols_mvt",v);setVisColsMVT_raw(v);};
const mvts=[...data.mouvementsStock].reverse();
const typeC={entree:"#16a34a",sortie:"#dc2626"};
return(
<div style={S.card}>
<div style={S.hdr}><span>🔄</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Mouvements de stock</span><span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{mvts.length}</span>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<ColonnesChoisir allCols={ALL_COLS_MVT} visible={visColsMVT} setVisible={setVisColsMVT}/>
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac"}} onClick={()=>exportToExcel(mvts,[
{label:"Date",key:"date"},{label:"Type",key:"type"},{label:"Référence",key:"articleRef"},
{label:"Désignation",key:"articleNom"},{label:"Qté",key:"qte"},{label:"Avant",key:"avant"},
{label:"Après",key:"apres"},{label:"Dépôt",get:r=>data.depots.find(d=>d.id===r.depotId)?.code||""},
{label:"Document",key:"docRef"},
],"mouvements_stock")}>⬇ Excel</button>
</div>
</div>
{mvts.length===0?<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>Aucun mouvement</div>:(
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{visColsMVT.includes("date") &&<th style={S.th}>Date</th>}
{visColsMVT.includes("type") &&<th style={S.th}>Type</th>}
{visColsMVT.includes("ref")  &&<th style={S.th}>Référence</th>}
{visColsMVT.includes("nom")  &&<th style={S.th}>Désignation</th>}
{visColsMVT.includes("qte")  &&<th style={S.th}>Qté</th>}
{visColsMVT.includes("avant")&&<th style={S.th}>Avant</th>}
{visColsMVT.includes("apres")&&<th style={S.th}>Après</th>}
{visColsMVT.includes("depot")&&<th style={S.th}>Dépôt</th>}
{visColsMVT.includes("doc")  &&<th style={S.th}>Document</th>}
</tr></thead>
<tbody>{mvts.map(m=>{
const dep=data.depots.find(d=>d.id===m.depotId);
const docCfg=m.docType&&m.docType!=="inventaire"?DOC_CFG[m.docType]:null;
return(<tr key={m.id}>
{visColsMVT.includes("date") &&<td style={S.td}>{m.date}</td>}
{visColsMVT.includes("type") &&<td style={S.td}><span style={{...S.badge,background:typeC[m.type]+"18",color:typeC[m.type]}}>{m.type==="entree"?"↑ Entrée":"↓ Sortie"}</span></td>}
{visColsMVT.includes("ref")  &&<td style={{...S.td,fontFamily:"monospace",color:"#7c3aed",fontWeight:700}}>{m.articleRef||"--"}</td>}
{visColsMVT.includes("nom")  &&<td style={S.td}>{m.articleNom||"--"}</td>}
{visColsMVT.includes("qte")  &&<td style={{...S.td,fontWeight:800,color:typeC[m.type]}}>{m.type==="entree"?"+":"-"}{m.qte}</td>}
{visColsMVT.includes("avant")&&<td style={{...S.td,textAlign:"center",color:"#94a3b8"}}>{m.avant??"-"}</td>}
{visColsMVT.includes("apres")&&<td style={{...S.td,textAlign:"center",fontWeight:700}}>{m.apres??"-"}</td>}
{visColsMVT.includes("depot")&&<td style={S.td}>{dep?<span style={{fontFamily:"monospace",fontSize:11}}>{dep.code}</span>:"--"}</td>}
{visColsMVT.includes("doc")  &&<td style={S.td}>{m.docRef?<span style={{fontFamily:"monospace",fontSize:11,color:docCfg?.color||"#64748b"}}>{m.docRef}</span>:"--"}</td>}
</tr>);
})}</tbody>
</table>
</div>
)}
</div>
);
}

function StockArticleModule({data}){
const [sel,setSel]=useState(data.articles[0]?.id||"");
const art=data.articles.find(a=>a.id===sel);
if(!art)return <div style={{...S.card,padding:32,textAlign:"center",color:"#94a3b8"}}>Aucun article</div>;
const mvts=[...data.mouvementsStock].filter(m=>m.articleId===sel).reverse();
return(
<div>
<div style={{...S.card,padding:"14px 20px",marginBottom:14}}>
<select style={{...S.inp,width:300}} value={sel} onChange={e=>setSel(e.target.value)}>
{data.articles.map(a=><option key={a.id} value={a.id}>{a.ref} -- {a.designation}</option>)}
</select>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700}}>Stock par dépôt</span></div>
<div style={{padding:14}}>
{data.depots.map(d=>{const ds=data.stockDepots[sel]?.[d.id];const q=ds?.qte||0;if(!q)return null;return(
<div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f4f8"}}>
<span style={{fontFamily:"monospace",color:"#16a34a",fontWeight:700}}>{d.code}</span>
<span style={{fontWeight:800,color:"#1a2332"}}>{q} {art.unite}</span>
</div>);})}</div>
</div>
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700}}>Mouvements</span></div>
<div style={{padding:14}}>
{mvts.slice(0,10).map(m=>(
<div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f4f8",fontSize:12}}>
<span style={{color:m.type==="entree"?"#16a34a":"#dc2626"}}>{m.type==="entree"?"↑":"-↓"} {m.qte} ({m.date})</span>
<span style={{color:"#64748b"}}>{m.docRef||"Inventaire"}</span>
</div>))}</div>
</div>
</div>
</div>
);
}

function ReglementsModule({data,setData,type}){
const ALL_COLS_REG=[
{id:"ref",label:"Référence"},{id:"date",label:"Date"},
{id:"tiers",label:"Tiers"},{id:"facture",label:"Facture"},
{id:"montant",label:"Montant"},{id:"mode",label:"Mode"},
{id:"banque",label:"Banque"},{id:"statut",label:"Statut"},
];
const [visColsReg,setVisColsReg_raw]=useState(()=>LS.get("lgm_cols_reg_"+type)||["ref","date","tiers","facture","montant","mode","statut"]);
const setVisColsReg=(v)=>{LS.set("lgm_cols_reg_"+type,v);setVisColsReg_raw(v);};
const isAchat=type==="achat";
const color=isAchat?"#d97706":"#16a34a";
const tiersList=isAchat?data.fournisseurs:data.clients;
const factures=(isAchat?["ach-facture"]:["vte-facture"]).flatMap(k=>data.documents[k]||[]);
const MODES=["Chèque","Virement bancaire","Espèces","Traite","LCR","Prélèvement","Carte bancaire","Autre"];
const STATUTS=["En attente","Encaissé","Rejeté","Annulé"];
const sc={"En attente":"#d97706","Encaissé":"#16a34a","Rejeté":"#dc2626","Annulé":"#94a3b8"};
const reglements=(data.reglements||[]).filter(r=>r.type===type);
const [modal,setModal]=useState(null);
const [form,setForm]=useState({});
const [search,setSearch]=useState("");
const [fStatut,setFStatut]=useState("all");
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const soldeFact=(factureId)=>{
const f=factures.find(x=>x.id===factureId);
if(!f)return{ttc:0,regle:0,restant:0};
const ttc=docCalc(f.lignes,f.remiseGlobale||0).ttc;
const regle=(data.reglements||[]).filter(r=>r.factureId===factureId&&r.type===type&&r.statut==="Encaissé").reduce((s,r)=>s+r.montant,0);
return{ttc,regle,restant:Math.max(0,ttc-regle)};
};
const onSelectFacture=(factureId)=>{
const f=factures.find(x=>x.id===factureId);
if(!f){setForm(p=>({...p,factureId:"",factureRef:"",tiersId:"",montant:""}));return;}
const s=soldeFact(factureId);
setForm(p=>({...p,factureId,factureRef:f.ref,tiersId:f.tiers,montant:s.restant.toFixed(2)}));
};
const save=()=>{
if(!form.factureId)return showToast("Sélectionnez une facture",false);
if(!form.montant||+form.montant<=0)return showToast("Montant obligatoire",false);
if(!form.mode)return showToast("Mode de règlement obligatoire",false);
const rec={...form,id:form.id||uid("RGL"),montant:+form.montant};
setData(p=>({...p,reglements:p.reglements?.find(r=>r.id===rec.id)?p.reglements.map(r=>r.id===rec.id?rec:r):[...(p.reglements||[]),rec]}));
showToast("Règlement enregistré !");setModal(null);
};
const del=(id)=>{setData(p=>({...p,reglements:(p.reglements||[]).filter(r=>r.id!==id)}));showToast("Supprimé");};
const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
const totalEnAttente=reglements.filter(r=>r.statut==="En attente").reduce((s,r)=>s+r.montant,0);
const totalEncaisse =reglements.filter(r=>r.statut==="Encaissé").reduce((s,r)=>s+r.montant,0);
const totalRejete   =reglements.filter(r=>r.statut==="Rejeté").reduce((s,r)=>s+r.montant,0);
const parMode={};
reglements.filter(r=>r.statut==="Encaissé").forEach(r=>{
if(!parMode[r.mode])parMode[r.mode]={mode:r.mode,total:0,nb:0};
parMode[r.mode].total+=r.montant; parMode[r.mode].nb+=1;
});
const modesData=Object.values(parMode).sort((a,b)=>b.total-a.total);
const maxMode=Math.max(...modesData.map(m=>m.total),1);
const filtered=reglements.filter(r=>{
if(fStatut!=="all"&&r.statut!==fStatut)return false;
const t=tiersList.find(x=>x.id===r.tiersId);
if(search&&![r.factureRef,t?.nom,r.reference,r.mode].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase())))return false;
return true;
});
return(
<>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
{[
{l:"Total règlements",v:reglements.length,c:"#1a56db",bg:"#eef2ff",i:"📋"},
{l:"En attente (DH)",v:fmt(totalEnAttente),c:"#d97706",bg:"#fffbeb",i:"⏳"},
{l:"Encaissé (DH)",v:fmt(totalEncaisse),c:"#16a34a",bg:"#f0fdf4",i:"✅"},
{l:"Rejeté (DH)",v:fmt(totalRejete),c:"#dc2626",bg:"#fef2f2",i:"❌"},
].map(s=>(
<div key={s.l} style={{background:s.bg,border:`1px solid ${s.c}33`,borderLeft:`4px solid ${s.c}`,borderRadius:10,padding:"14px 16px"}}>
<div style={{fontSize:22,marginBottom:4}}>{s.i}</div>
<div style={{fontWeight:800,fontSize:18,color:s.c}}>{s.v}</div>
<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{s.l}</div>
</div>
))}
</div>
{modesData.length>0&&(
<div style={{...S.card,padding:"16px 20px",marginBottom:14}}>
<div style={{fontWeight:700,color:"#1a2332",marginBottom:12}}>Répartition par mode de règlement (encaissés)</div>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{modesData.map((m,i)=>(
<div key={m.mode} style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:140,fontSize:12,fontWeight:600,color:"#1a2332",flexShrink:0}}>{m.mode}</div>
<div style={{flex:1,background:"#f1f5f9",borderRadius:6,height:24,overflow:"hidden"}}>
<div style={{width:`${(m.total/maxMode)*100}%`,height:"100%",background:["#1a56db","#16a34a","#d97706","#7c3aed","#0891b2","#dc2626"][i%6],borderRadius:6,minWidth:4,display:"flex",alignItems:"center",paddingLeft:8}}>
{m.total/maxMode>0.15&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>{fmt(m.total)} DH</span>}
</div>
</div>
<div style={{width:120,textAlign:"right",fontSize:12,flexShrink:0}}>
<span style={{fontWeight:700,color}}>{fmt(m.total)} DH</span>
<span style={{color:"#94a3b8",marginLeft:6}}>{m.nb} rgl.</span>
</div>
</div>
))}
</div>
</div>
)}
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>Règlements {isAchat?"Fournisseurs":"Clients"}</span>
<span style={{...S.badge,background:`${color}18`,color,marginLeft:4}}>{reglements.length}</span>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:150}}/>
<select style={{...S.inp,width:130}} value={fStatut} onChange={e=>setFStatut(e.target.value)}>
<option value="all">Tous statuts</option>
{STATUTS.map(s=><option key={s}>{s}</option>)}
</select>
<ColonnesChoisir allCols={ALL_COLS_REG} visible={visColsReg} setVisible={setVisColsReg}/>
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac"}} onClick={()=>exportToExcel(filtered,[
{label:"Facture",key:"factureRef"},{label:"Tiers",get:r=>tiersList.find(x=>x.id===r.tiersId)?.nom||""},
{label:"Date",key:"date"},{label:"Montant",key:"montant"},{label:"Mode",key:"mode"},
{label:"Référence",key:"reference"},{label:"Banque",key:"banque"},{label:"Statut",key:"statut"},
],"reglements_"+(isAchat?"achats":"ventes"))}>⬇ Excel</button>
<button style={{...S.btnP,background:color}} onClick={()=>{setForm({id:"",type,factureId:"",factureRef:"",tiersId:"",date:today(),montant:"",mode:"Virement bancaire",reference:"",banque:"",notes:"",statut:"En attente"});setModal("form");}}>+ Nouveau</button>
</div>
</div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{visColsReg.includes("ref")     &&<th style={S.th}>Facture</th>}
{visColsReg.includes("date")    &&<th style={S.th}>Date</th>}
{visColsReg.includes("tiers")   &&<th style={S.th}>Tiers</th>}
{visColsReg.includes("facture") &&<th style={S.th}>Solde facture</th>}
{visColsReg.includes("montant") &&<th style={S.th}>Montant</th>}
{visColsReg.includes("mode")    &&<th style={S.th}>Mode</th>}
{visColsReg.includes("banque")  &&<th style={S.th}>Banque</th>}
{visColsReg.includes("statut")  &&<th style={S.th}>Statut</th>}
<th style={S.th}>Actions</th>
</tr></thead>
<tbody>
{filtered.length===0&&<tr><td colSpan={visColsReg.length+1} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:32}}>Aucun règlement</td></tr>}
{filtered.map(r=>{
const t=tiersList.find(x=>x.id===r.tiersId);
const s=soldeFact(r.factureId);
return(
<tr key={r.id} onDoubleClick={()=>openEdit(r)} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
{visColsReg.includes("ref")    &&<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color}}>{r.factureRef||"--"}</td>}
{visColsReg.includes("date")   &&<td style={S.td}>{r.date}</td>}
{visColsReg.includes("tiers")  &&<td style={S.td}><div style={{fontWeight:600}}>{t?.nom||"--"}</div></td>}
{visColsReg.includes("facture")&&<td style={S.td}><div style={{fontSize:12}}><div>TTC: <strong>{fmt(s.ttc)}</strong></div><div style={{color:"#16a34a"}}>Réglé: {fmt(s.regle)}</div><div style={{fontWeight:700,color:s.restant>0?"#dc2626":"#16a34a"}}>{s.restant>0?`Reste: ${fmt(s.restant)}`:"✓ Soldé"}</div></div></td>}
{visColsReg.includes("montant")&&<td style={{...S.td,fontWeight:800,color,textAlign:"right"}}>{fmt(r.montant)}</td>}
{visColsReg.includes("mode")   &&<td style={S.td}><span style={{...S.badge,background:"#f1f5f9",color:"#475569"}}>{r.mode}</span></td>}
{visColsReg.includes("banque") &&<td style={S.td}>{r.banque||"--"}</td>}
{visColsReg.includes("statut") &&<td style={S.td}><span style={{...S.badge,background:`${sc[r.statut]||"#94a3b8"}18`,color:sc[r.statut]||"#94a3b8"}}>{r.statut}</span></td>}
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setForm({...r});setModal("form");}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(r.id)}>🗑</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
{filtered.length>0&&<div style={{padding:"8px 20px",fontSize:11,color:"#64748b",borderTop:"1px solid #f0f4f8",display:"flex",justifyContent:"space-between"}}><span>{filtered.length} règlement(s)</span><span style={{fontWeight:700,color}}>Total : {fmt(filtered.reduce((s,r)=>s+r.montant,0))} DH</span></div>}
</div>
{modal&&(
<Modal title={form.id?"Modifier règlement":"Nouveau règlement"} onClose={()=>setModal(null)} width={560}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<Fld label="Facture" required full>
<SearchSelect value={form.factureId||""} onChange={onSelectFacture} color={color} placeholder="Choisir une facture..."
options={[{id:"",label:"-- Sélectionner --"},...factures.map(f=>{
const {ttc}=docCalc(f.lignes,f.remiseGlobale||0);
const t=tiersList.find(x=>x.id===f.tiers);
const s=soldeFact(f.id);
return{id:f.id,label:f.ref,sub:t?.nom||"",meta:`TTC: ${fmt(ttc)} · Reste: ${fmt(s.restant)} DH`,badge:s.restant<=0?"Soldé":f.statut,badgeColor:s.restant<=0?"#16a34a":"#d97706"};
})]}
/>
</Fld>
{form.tiersId&&(()=>{const s=soldeFact(form.factureId);return(
<div style={{gridColumn:"1/-1",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",marginBottom:4,display:"flex",gap:20,fontSize:13}}>
<span>Facture: <strong style={{color}}>{form.factureRef}</strong></span>
<span>Tiers: <strong>{tiersList.find(t=>t.id===form.tiersId)?.nom}</strong></span>
<span>TTC: <strong>{fmt(s.ttc)} DH</strong></span>
<span style={{color:s.restant>0?"#dc2626":"#16a34a"}}>Restant: <strong>{fmt(s.restant)} DH</strong></span>
</div>
);})()}
<Fld label="Date" required><input type="date" style={S.inp} value={form.date||today()} onChange={e=>upd("date",e.target.value)}/></Fld>
<Fld label="Montant (DH)" required><input type="number" step="0.01" min="0" style={{...S.inp,fontWeight:700,fontSize:15,color}} value={form.montant||""} onChange={e=>upd("montant",e.target.value)}/></Fld>
<Fld label="Mode de règlement" required>
<select style={S.inp} value={form.mode||""} onChange={e=>upd("mode",e.target.value)}>
<option value="">-- Choisir --</option>
{MODES.map(m=><option key={m}>{m}</option>)}
</select>
</Fld>
<Fld label="Référence (N° chèque / virement)"><input style={{...S.inp,fontFamily:"monospace"}} value={form.reference||""} onChange={e=>upd("reference",e.target.value)} placeholder="CHQ-001234"/></Fld>
<Fld label="Banque"><input style={S.inp} value={form.banque||""} onChange={e=>upd("banque",e.target.value)} placeholder="CIH Maarif"/></Fld>
<Fld label="Statut">
<select style={{...S.inp,fontWeight:700,color:sc[form.statut]||"#94a3b8"}} value={form.statut||"En attente"} onChange={e=>upd("statut",e.target.value)}>
{STATUTS.map(s=><option key={s}>{s}</option>)}
</select>
</Fld>
<Fld label="Notes" full><textarea style={{...S.inp,resize:"vertical",minHeight:50}} value={form.notes||""} onChange={e=>upd("notes",e.target.value)} placeholder="Observations..."/></Fld>
</div>
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,borderTop:"1px solid #f0f4f8",paddingTop:14}}>
<button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
<button style={{...S.btnP,background:color}} onClick={save}>Enregistrer</button>
</div>
</Modal>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}
const TRESO_TYPES_MVT=[
{id:"encaissement", label:"Encaissement",     icon:"📥", color:"#16a34a", sens:1},
{id:"decaissement", label:"Décaissement",     icon:"📤", color:"#dc2626", sens:-1},
{id:"virement_e",   label:"Virement entrant", icon:"↙️", color:"#1a56db", sens:1},
{id:"virement_s",   label:"Virement sortant", icon:"↗️", color:"#d97706", sens:-1},
{id:"remise_cheq",  label:"Remise chèques",   icon:"📋", color:"#7c3aed", sens:1},
{id:"frais_banq",   label:"Frais bancaires",  icon:"🏦", color:"#64748b", sens:-1},
{id:"interets",     label:"Intérêts",         icon:"💹", color:"#059669", sens:1},
{id:"ajustement",   label:"Ajustement",       icon:"🔧", color:"#94a3b8", sens:1},
];

function TresorerieModule({data,setData,subPage}){
const [tab,setTab]     = useState(subPage==="treso-banques"?"banques":"caisses");
const [tabMvt,setTabMvt] = useState("liste"); // liste|form
const [formCompte,setFormCompte] = useState(null);
const [formMvt,setFormMvt]       = useState(null);
const [toast,setToast] = useState(null);
const [dateDebut,setDD] = useState(()=>{const d=new Date();d.setDate(1);return d.toISOString().slice(0,10);});
const [dateFin,setDF]   = useState(today());
const [filtreCompte,setFiltreCompte] = useState("");
const [search,setSearch] = useState("");
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};

const caisses = data.caisses||[];
const banques  = data.banques||[];
const mvts     = data.mouvementsTreso||[];
const comptes  = tab==="caisses"?caisses:banques;
const setComptes=(fn)=>setData(p=>({...p,[tab]:typeof fn==="function"?fn(p[tab]||[]):fn}));

// ── Solde compte ─────────────────────────────────────────
const getSolde=(compteId)=>{
const soldeinit=comptes.find(c=>c.id===compteId)?.soldeInitial||0;
return mvts.filter(m=>m.compteId===compteId&&m.statut!=="Annulé").reduce((s,m)=>{
const type=TRESO_TYPES_MVT.find(t=>t.id===m.type);
return s+(type?.sens||0)*(+m.montant||0);
},+soldeinit);
};

// ── Mouvements filtrés ────────────────────────────────────
const mvtsFiltres=mvts.filter(m=>{
if(filtreCompte&&m.compteId!==filtreCompte)return false;
if(m.date<dateDebut||m.date>dateFin)return false;
if(search){const s=search.toLowerCase();if(!m.libelle?.toLowerCase().includes(s)&&!m.ref?.toLowerCase().includes(s))return false;}
return true;
}).sort((a,b)=>b.date.localeCompare(a.date));

// ── Totaux période ────────────────────────────────────────
const totEntrees=mvtsFiltres.filter(m=>(TRESO_TYPES_MVT.find(t=>t.id===m.type)?.sens||0)>0).reduce((s,m)=>s+(+m.montant||0),0);
const totSorties=mvtsFiltres.filter(m=>(TRESO_TYPES_MVT.find(t=>t.id===m.type)?.sens||0)<0).reduce((s,m)=>s+(+m.montant||0),0);

// ── Save compte ───────────────────────────────────────────
const saveCompte=()=>{
if(!formCompte?.nom?.trim())return showToast("Nom obligatoire",false);
const rec={...formCompte,id:formCompte.id||uid("CPT"),soldeInitial:+formCompte.soldeInitial||0};
setComptes(p=>rec.id&&(p||[]).find(c=>c.id===rec.id)?(p||[]).map(c=>c.id===rec.id?rec:c):[...(p||[]),rec]);
showToast("Compte enregistré ✅");
setFormCompte(null);
};

// ── Save mouvement ────────────────────────────────────────
const saveMvt=()=>{
if(!formMvt?.compteId)return showToast("Compte obligatoire",false);
if(!formMvt?.type)return showToast("Type obligatoire",false);
if(!formMvt?.montant||+formMvt.montant<=0)return showToast("Montant invalide",false);
if(!formMvt?.date)return showToast("Date obligatoire",false);
const rec={...formMvt,id:formMvt.id||uid("MVT"),montant:+formMvt.montant,statut:"Confirmé"};
setData(p=>({...p,mouvementsTreso:rec.id&&p.mouvementsTreso?.find(m=>m.id===rec.id)
?p.mouvementsTreso.map(m=>m.id===rec.id?rec:m)
:[...(p.mouvementsTreso||[]),rec]}));
showToast("Mouvement enregistré ✅");
setFormMvt(null);
};

// ── Impression relevé ─────────────────────────────────────
const printReleve=(compte)=>{
const cmvts=mvts.filter(m=>m.compteId===compte.id&&m.date>=dateDebut&&m.date<=dateFin&&m.statut!=="Annulé").sort((a,b)=>a.date.localeCompare(b.date));
const si=+compte.soldeInitial||0;
let solde=mvts.filter(m=>m.compteId===compte.id&&m.date<dateDebut&&m.statut!=="Annulé").reduce((s,m)=>{const t=TRESO_TYPES_MVT.find(x=>x.id===m.type);return s+(t?.sens||0)*(+m.montant||0);},si);
const {societe}=data;
const cP=societe?.couleurPrincipale||"#1a2332";
const cA=societe?.couleurAccent||"#e8a020";
const rows=cmvts.map(m=>{
const t=TRESO_TYPES_MVT.find(x=>x.id===m.type);
const sens=t?.sens||0;
const e=sens>0?fmt(m.montant)+" DH":"";
const s=sens<0?fmt(m.montant)+" DH":"";
solde+=sens*(+m.montant||0);
return`<tr>
<td style="padding:6px 10px">${m.date}</td>
<td style="padding:6px 10px;font-family:monospace;color:${cP};font-size:11px">${m.ref||"--"}</td>
<td style="padding:6px 10px">${m.libelle||t?.label||""}</td>
<td style="padding:6px 10px;text-align:right;color:#16a34a;font-weight:700">${e}</td>
<td style="padding:6px 10px;text-align:right;color:#dc2626;font-weight:700">${s}</td>
<td style="padding:6px 10px;text-align:right;font-weight:800;color:${solde>=0?"#16a34a":"#dc2626"}">${fmt(solde)} DH</td>
</tr>`;}).join("");
openPrint(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Relevé ${compte.nom}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;}
.h{background:${cP};color:#fff;padding:20px;border-radius:8px;margin-bottom:20px;}
.h h1{margin:0;font-size:20px;font-weight:900;}.h p{color:${cA};margin:4px 0 0;font-size:11px;}
table{width:100%;border-collapse:collapse;}th{background:${cP};color:#fff;padding:8px 10px;text-align:left;font-size:11px;}
tr:nth-child(even){background:#f9fafb;}td{border-bottom:1px solid #f0f4f8;}
.tot{background:#1a2332;color:#fff;font-weight:800;}
@media print{.np{display:none}}</style></head><body>
<div class="h"><h1>${tab==="caisses"?"💰":"🏦"} Relevé — ${compte.nom}</h1>
<p>Période : ${dateDebut} → ${dateFin} · ${societe?.nomCommercial||""}</p></div>
<div class="np" style="margin-bottom:12px"><button onclick="window.print()" style="background:${cP};color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">🖨 Imprimer</button></div>
<table><thead><tr><th>Date</th><th>Référence</th><th>Libellé</th><th>Entrées</th><th>Sorties</th><th>Solde</th></tr></thead>
<tbody>
<tr style="background:#eef2ff"><td colspan="5" style="padding:8px 10px;font-weight:700;color:#1a56db">Report au ${dateDebut}</td>
<td style="padding:8px 10px;text-align:right;font-weight:800">${fmt(mvts.filter(m=>m.compteId===compte.id&&m.date<dateDebut&&m.statut!=="Annulé").reduce((s,m)=>{const t=TRESO_TYPES_MVT.find(x=>x.id===m.type);return s+(t?.sens||0)*(+m.montant||0);},si))} DH</td></tr>
${rows}
</tbody></table></body></html>`);
};

return(
<div>
{/* Tabs caisses/banques */}
<div style={{display:"flex",gap:2,marginBottom:14,background:"#f8fafc",borderRadius:8,padding:3,width:"fit-content"}}>
{[{id:"caisses",l:"💰 Caisses"},{id:"banques",l:"🏦 Banques"},{id:"mouvements",l:"🔄 Mouvements"},{id:"rapproch",l:"🔍 Rapprochement"}].map(t=>(
<button key={t.id} onClick={()=>setTab(t.id)}
style={{padding:"8px 16px",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,
fontWeight:tab===t.id?700:400,background:tab===t.id?"#fff":"transparent",
color:tab===t.id?"#1a2332":"#64748b",
boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",fontFamily:"inherit"}}>
{t.l}
</button>
))}
</div>

{/* ── COMPTES (Caisses ou Banques) ── */}
{(tab==="caisses"||tab==="banques")&&(
<div>
{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(comptes.length+1,5)},1fr)`,gap:10,marginBottom:14}}>
{comptes.map(c=>{
const solde=getSolde(c.id);
return(
<div key={c.id} style={{background:solde>=0?"#f0fdf4":"#fef2f2",border:"1px solid "+(solde>=0?"#86efac":"#fecaca"),borderLeft:"4px solid "+(solde>=0?"#16a34a":"#dc2626"),borderRadius:10,padding:"12px 14px"}}>
<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
<span style={{fontSize:16}}>{tab==="caisses"?"💰":"🏦"}</span>
<span style={{fontWeight:700,fontSize:13,color:"#1a2332"}}>{c.nom}</span>
</div>
<div style={{fontWeight:900,fontSize:20,color:solde>=0?"#16a34a":"#dc2626",fontFamily:"monospace"}}>{fmt(solde)} DH</div>
<div style={{fontSize:10,color:"#64748b",marginTop:2}}>{c.devise||"MAD"}{c.banque?" · "+c.banque:""}</div>
{c.rib&&<div style={{fontSize:9,fontFamily:"monospace",color:"#94a3b8",marginTop:2}}>{c.rib}</div>}
</div>
);
})}
<div style={{border:"2px dashed #e2e8f0",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#94a3b8"}}
onClick={()=>setFormCompte({nom:"",devise:"MAD",soldeInitial:0,actif:true})}>
<div style={{textAlign:"center"}}>
<div style={{fontSize:24,marginBottom:4}}>＋</div>
<div style={{fontSize:11}}>Nouveau {tab==="caisses"?"caisse":"compte"}</div>
</div>
</div>
</div>

{/* Liste comptes */}
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>{tab==="caisses"?"💰 Caisses":"🏦 Comptes bancaires"}</span>
<button style={{...S.btnP,marginLeft:"auto"}} onClick={()=>setFormCompte({nom:"",devise:"MAD",soldeInitial:0,actif:true})}>
+ {tab==="caisses"?"Nouvelle caisse":"Nouveau compte"}
</button>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{(tab==="caisses"
?["Caisse","Devise","Solde initial","Solde actuel","Statut","Actions"]
:["Banque","N° Compte / RIB","Devise","Solde initial","Solde actuel","Statut","Actions"]
).map(h=><th key={h} style={S.th}>{h}</th>)}
</tr></thead>
<tbody>
{comptes.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>
<div style={{fontSize:36,marginBottom:8}}>{tab==="caisses"?"💰":"🏦"}</div>
<div>Aucun {tab==="caisses"?"caisse":"compte bancaire"} — cliquez sur "+ Nouveau"</div>
</td></tr>}
{comptes.map(c=>{
const solde=getSolde(c.id);
const mvtsCompte=mvts.filter(m=>m.compteId===c.id&&m.statut!=="Annulé");
return(<tr key={c.id} onDoubleClick={()=>setFormCompte({...c})} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={S.td}><div style={{fontWeight:700}}>{c.nom}</div>{c.description&&<div style={{fontSize:11,color:"#94a3b8"}}>{c.description}</div>}</td>
{tab==="banques"&&<td style={{...S.td,fontFamily:"monospace",fontSize:11}}>{c.rib||c.numCompte||"--"}{c.banque&&<div style={{fontSize:10,color:"#94a3b8"}}>{c.banque}</div>}</td>}
<td style={{...S.td,textAlign:"center"}}>{c.devise||"MAD"}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#64748b"}}>{fmt(+c.soldeInitial||0)} DH</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:800,color:solde>=0?"#16a34a":"#dc2626",fontSize:15}}>{fmt(solde)} DH</td>
<td style={S.td}><span style={{...S.badge,background:c.actif!==false?"#f0fdf4":"#fef2f2",color:c.actif!==false?"#16a34a":"#ef4444"}}>{c.actif!==false?"Actif":"Inactif"}</span></td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>setFormCompte({...c})}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#1a56db",borderColor:"#c7d2fe"}} onClick={()=>{setFiltreCompte(c.id);setTab("mouvements");}}>📋 Relevé</button>
<button style={{...S.btnSm,marginLeft:4,color:"#7c3aed",borderColor:"#ddd6fe"}} onClick={()=>printReleve(c)}>🖨</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>{if(mvtsCompte.length>0)return showToast(`Impossible — ${mvtsCompte.length} mouvement(s) existent`,false);setComptes(p=>p.filter(x=>x.id!==c.id));showToast("Supprimé");}}>🗑</button>
</td>
</tr>);
})}
</tbody>
</table>
</div>

{/* Dernier mouvement par compte */}
{comptes.length>0&&(
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>📋 Derniers mouvements par compte</span>
<button style={{...S.btnP,marginLeft:"auto"}} onClick={()=>{setFormMvt({compteId:"",type:"encaissement",montant:"",date:today(),libelle:"",ref:"",statut:"Confirmé"});}}>+ Nouveau mouvement</button>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12,padding:16}}>
{comptes.map(c=>{
const derniers=mvts.filter(m=>m.compteId===c.id&&m.statut!=="Annulé").sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
const solde=getSolde(c.id);
return(
<div key={c.id} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden"}}>
<div style={{background:"#1a2332",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontWeight:700,color:"#fff",fontSize:13}}>{tab==="caisses"?"💰":"🏦"} {c.nom}</span>
<span style={{fontWeight:900,color:solde>=0?"#4ade80":"#fca5a5",fontFamily:"monospace",fontSize:14}}>{fmt(solde)} DH</span>
</div>
{derniers.length===0?(
<div style={{padding:"16px",textAlign:"center",color:"#94a3b8",fontSize:12}}>Aucun mouvement</div>
):(
<div>
{derniers.map(m=>{
const t=TRESO_TYPES_MVT.find(x=>x.id===m.type);
return(
<div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderBottom:"1px solid #f0f4f8"}}>
<span style={{fontSize:14}}>{t?.icon||"📌"}</span>
<div style={{flex:1,minWidth:0}}>
<div style={{fontWeight:600,fontSize:12,color:"#1a2332",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.libelle||t?.label}</div>
<div style={{fontSize:10,color:"#94a3b8"}}>{m.date}{m.ref?" · "+m.ref:""}</div>
</div>
<span style={{fontWeight:700,fontSize:12,color:t?.sens>0?"#16a34a":"#dc2626",whiteSpace:"nowrap"}}>{t?.sens>0?"+":"-"}{fmt(+m.montant||0)} DH</span>
</div>
);
})}
</div>
)}
</div>
);
})}
</div>
</div>
)}
</div>
)}

{/* ── MOUVEMENTS ── */}
{tab==="mouvements"&&(
<div>
{/* Filtres */}
<div style={{...S.card,marginBottom:12}}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>🔄 Mouvements de trésorerie</span>
<button style={{...S.btnP,marginLeft:"auto"}} onClick={()=>setFormMvt({compteId:filtreCompte||"",type:"encaissement",montant:"",date:today(),libelle:"",ref:"",statut:"Confirmé"})}>
+ Nouveau mouvement
</button>
</div>
<div style={{padding:"10px 16px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
<div>
<label style={S.lbl}>Du</label>
<input type="date" style={{...S.inp,width:130}} value={dateDebut} onChange={e=>setDD(e.target.value)}/>
</div>
<div>
<label style={S.lbl}>Au</label>
<input type="date" style={{...S.inp,width:130}} value={dateFin} onChange={e=>setDF(e.target.value)}/>
</div>
<div>
<label style={S.lbl}>Compte</label>
<select style={{...S.inp,width:180}} value={filtreCompte} onChange={e=>setFiltreCompte(e.target.value)}>
<option value="">Tous les comptes</option>
<optgroup label="Caisses">{caisses.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</optgroup>
<optgroup label="Banques">{banques.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</optgroup>
</select>
</div>
<div>
<label style={S.lbl}>Recherche</label>
<input style={{...S.inp,width:150}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Libellé ou réf..."/>
</div>
{filtreCompte&&<button style={{...S.btnSm,color:"#dc2626",fontSize:11}} onClick={()=>setFiltreCompte("")}>✕ Filtre</button>}
<button style={{...S.btnS,marginLeft:"auto",color:"#16a34a",borderColor:"#86efac",fontSize:11}}
onClick={()=>exportToExcel(mvtsFiltres.map(m=>{const t=TRESO_TYPES_MVT.find(x=>x.id===m.type);const c=[...caisses,...banques].find(x=>x.id===m.compteId);return{date:m.date,ref:m.ref||"",compte:c?.nom||"",type:t?.label||m.type,libelle:m.libelle||"",entree:t?.sens>0?m.montant:0,sortie:t?.sens<0?m.montant:0,statut:m.statut||""};}),
[{label:"Date",key:"date"},{label:"Référence",key:"ref"},{label:"Compte",key:"compte"},{label:"Type",key:"type"},{label:"Libellé",key:"libelle"},{label:"Entrée",key:"entree"},{label:"Sortie",key:"sortie"},{label:"Statut",key:"statut"}],
"mouvements_treso_"+dateDebut+"_"+dateFin)}>⬇ Excel</button>
</div>
</div>

{/* KPIs période */}
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
{[
{l:"Entrées",v:fmt(totEntrees)+" DH",c:"#16a34a",icon:"📥"},
{l:"Sorties",v:fmt(totSorties)+" DH",c:"#dc2626",icon:"📤"},
{l:"Flux net",v:fmt(totEntrees-totSorties)+" DH",c:totEntrees>=totSorties?"#16a34a":"#dc2626",icon:"⚖️"},
].map(k=>(
<div key={k.l} style={{background:k.c+"10",borderLeft:"4px solid "+k.c,borderRadius:8,padding:"10px 14px"}}>
<div style={{fontSize:18}}>{k.icon}</div>
<div style={{fontWeight:800,fontSize:16,color:k.c,marginTop:3}}>{k.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{k.l} — {mvtsFiltres.length} mouvement(s)</div>
</div>
))}
</div>

{/* Tableau mouvements */}
<div style={S.card}>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Date","Référence","Compte","Type","Libellé","Entrée","Sortie","Statut","Actions"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{mvtsFiltres.length===0&&<tr><td colSpan={9} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>
<div style={{fontSize:32,marginBottom:8}}>🔄</div>
<div>Aucun mouvement sur cette période</div>
</td></tr>}
{mvtsFiltres.map(m=>{
const t=TRESO_TYPES_MVT.find(x=>x.id===m.type);
const compte=[...caisses,...banques].find(c=>c.id===m.compteId);
return(
<tr key={m.id} onDoubleClick={()=>setFormMvt({...m})} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,whiteSpace:"nowrap"}}>{m.date}</td>
<td style={{...S.td,fontFamily:"monospace",fontSize:11,color:"#1a56db"}}>{m.ref||"--"}</td>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:5}}>
<span>{compte?.type==="banque"||tab==="banques"?"🏦":"💰"}</span>
<span style={{fontWeight:600,fontSize:12}}>{compte?.nom||"--"}</span>
</div>
</td>
<td style={S.td}>
<span style={{...S.badge,background:(t?.color||"#94a3b8")+"18",color:t?.color||"#64748b"}}>
{t?.icon} {t?.label||m.type}
</span>
</td>
<td style={{...S.td,maxWidth:200}}>{m.libelle||"--"}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:700,color:"#16a34a"}}>
{t?.sens>0?fmt(+m.montant||0)+" DH":""}
</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:700,color:"#dc2626"}}>
{t?.sens<0?fmt(+m.montant||0)+" DH":""}
</td>
<td style={S.td}>
<span style={{...S.badge,background:m.statut==="Confirmé"?"#f0fdf4":m.statut==="Annulé"?"#fef2f2":"#fef9c3",color:m.statut==="Confirmé"?"#16a34a":m.statut==="Annulé"?"#dc2626":"#d97706"}}>
{m.statut||"Confirmé"}
</span>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>setFormMvt({...m})}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>{setData(p=>({...p,mouvementsTreso:p.mouvementsTreso.map(x=>x.id===m.id?{...x,statut:"Annulé"}:x)}));showToast("Annulé");}}>🚫</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
</div>
</div>
)}

{/* ── RAPPROCHEMENT ── */}
{tab==="rapproch"&&(
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>🔍 Rapprochement bancaire</span></div>
<div style={{padding:24,textAlign:"center",color:"#94a3b8"}}>
<div style={{fontSize:48,marginBottom:12}}>🔍</div>
<div style={{fontWeight:700,fontSize:15,color:"#1a2332",marginBottom:8}}>Rapprochement bancaire</div>
<div style={{fontSize:13,marginBottom:20}}>Comparez vos mouvements ERP avec votre relevé bancaire</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:500,margin:"0 auto",textAlign:"left"}}>
<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:14}}>
<div style={{fontWeight:700,color:"#16a34a",marginBottom:6}}>✅ Confirmés ERP</div>
<div style={{fontWeight:900,fontSize:22,color:"#16a34a",fontFamily:"monospace"}}>{fmt(mvts.filter(m=>m.statut==="Confirmé"&&(TRESO_TYPES_MVT.find(t=>t.id===m.type)?.sens||0)>0).reduce((s,m)=>s+(+m.montant||0),0))} DH</div>
<div style={{fontSize:11,color:"#64748b",marginTop:3}}>Entrées confirmées</div>
</div>
<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:14}}>
<div style={{fontWeight:700,color:"#dc2626",marginBottom:6}}>📤 Sorties confirmées</div>
<div style={{fontWeight:900,fontSize:22,color:"#dc2626",fontFamily:"monospace"}}>{fmt(mvts.filter(m=>m.statut==="Confirmé"&&(TRESO_TYPES_MVT.find(t=>t.id===m.type)?.sens||0)<0).reduce((s,m)=>s+(+m.montant||0),0))} DH</div>
<div style={{fontSize:11,color:"#64748b",marginTop:3}}>Sorties confirmées</div>
</div>
</div>
</div>
</div>
)}

{/* ── MODAL COMPTE ── */}
{formCompte&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:14,width:480,maxWidth:"95vw",overflow:"hidden"}}>
<div style={{padding:"16px 20px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:8}}>
<span style={{fontSize:22}}>{tab==="caisses"?"💰":"🏦"}</span>
<span style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>{formCompte.id?"Modifier":"Nouveau"} {tab==="caisses"?"caisse":"compte bancaire"}</span>
<button onClick={()=>setFormCompte(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8"}}>×</button>
</div>
<div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<div style={{gridColumn:"1/-1",marginBottom:12}}>
<label style={S.lbl}>Nom *</label>
<input style={S.inp} value={formCompte.nom||""} onChange={e=>setFormCompte(p=>({...p,nom:e.target.value}))} autoFocus placeholder={tab==="caisses"?"Caisse principale":"Compte CIH 0001"}/>
</div>
{tab==="banques"&&<>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Banque</label>
<input style={S.inp} value={formCompte.banque||""} onChange={e=>setFormCompte(p=>({...p,banque:e.target.value}))} placeholder="CIH, Attijariwafa, BMCE..."/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>N° Compte</label>
<input style={{...S.inp,fontFamily:"monospace"}} value={formCompte.numCompte||""} onChange={e=>setFormCompte(p=>({...p,numCompte:e.target.value}))} placeholder="011 022 0123456789 01"/>
</div>
<div style={{gridColumn:"1/-1",marginBottom:12}}>
<label style={S.lbl}>RIB</label>
<input style={{...S.inp,fontFamily:"monospace",letterSpacing:2}} value={formCompte.rib||""} onChange={e=>setFormCompte(p=>({...p,rib:e.target.value}))} placeholder="011 022 0123456789012345 01"/>
</div>
</>}
<div style={{marginBottom:12}}>
<label style={S.lbl}>Devise</label>
<select style={S.inp} value={formCompte.devise||"MAD"} onChange={e=>setFormCompte(p=>({...p,devise:e.target.value}))}>
{["MAD","EUR","USD","GBP","CHF"].map(d=><option key={d}>{d}</option>)}
</select>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Solde initial (DH)</label>
<input type="number" step="0.01" style={{...S.inp,textAlign:"right",fontFamily:"monospace"}} value={formCompte.soldeInitial||""} onChange={e=>setFormCompte(p=>({...p,soldeInitial:e.target.value}))} placeholder="0.00"/>
</div>
<div style={{gridColumn:"1/-1",marginBottom:12}}>
<label style={S.lbl}>Description</label>
<input style={S.inp} value={formCompte.description||""} onChange={e=>setFormCompte(p=>({...p,description:e.target.value}))} placeholder="Description optionnelle..."/>
</div>
<div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}>
<input type="checkbox" id="actif_c" checked={formCompte.actif!==false} onChange={e=>setFormCompte(p=>({...p,actif:e.target.checked}))} style={{accentColor:"#16a34a"}}/>
<label htmlFor="actif_c" style={{fontSize:13,cursor:"pointer"}}>Compte actif</label>
</div>
</div>
<div style={{padding:"12px 20px",borderTop:"1px solid #f0f4f8",display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btnS} onClick={()=>setFormCompte(null)}>Annuler</button>
<button style={S.btnP} onClick={saveCompte}>Enregistrer</button>
</div>
</div>
</div>
)}

{/* ── MODAL MOUVEMENT ── */}
{formMvt&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:14,width:520,maxWidth:"95vw",overflow:"hidden"}}>
<div style={{padding:"16px 20px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:8}}>
<span style={{fontSize:20}}>🔄</span>
<span style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>{formMvt.id?"Modifier":"Nouveau"} mouvement</span>
<button onClick={()=>setFormMvt(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8"}}>×</button>
</div>
<div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Date *</label>
<input type="date" style={S.inp} value={formMvt.date||today()} onChange={e=>setFormMvt(p=>({...p,date:e.target.value}))}/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Référence</label>
<input style={{...S.inp,fontFamily:"monospace"}} value={formMvt.ref||""} onChange={e=>setFormMvt(p=>({...p,ref:e.target.value}))} placeholder="CHQ-001, VIR-2026..."/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Compte *</label>
<select style={S.inp} value={formMvt.compteId||""} onChange={e=>setFormMvt(p=>({...p,compteId:e.target.value}))}>
<option value="">-- Choisir --</option>
<optgroup label="💰 Caisses">{caisses.filter(c=>c.actif!==false).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</optgroup>
<optgroup label="🏦 Banques">{banques.filter(c=>c.actif!==false).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</optgroup>
</select>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Type *</label>
<select style={S.inp} value={formMvt.type||""} onChange={e=>setFormMvt(p=>({...p,type:e.target.value}))}>
<option value="">-- Choisir --</option>
{TRESO_TYPES_MVT.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
</select>
</div>
<div style={{gridColumn:"1/-1",marginBottom:12}}>
<label style={S.lbl}>Libellé</label>
<input style={S.inp} value={formMvt.libelle||""} onChange={e=>setFormMvt(p=>({...p,libelle:e.target.value}))} placeholder="Ex: Règlement facture FV-2026-0001"/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Montant (DH) *</label>
<input type="number" step="0.01" min="0" style={{...S.inp,textAlign:"right",fontFamily:"monospace",fontWeight:700,fontSize:16}} value={formMvt.montant||""} onChange={e=>setFormMvt(p=>({...p,montant:e.target.value}))} placeholder="0.00"/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Mode de paiement</label>
<select style={S.inp} value={formMvt.mode||""} onChange={e=>setFormMvt(p=>({...p,mode:e.target.value}))}>
<option value="">--</option>
{["Espèces","Chèque","Virement","Traite","CB","Prélèvement"].map(m=><option key={m}>{m}</option>)}
</select>
</div>
<div style={{gridColumn:"1/-1",marginBottom:12}}>
<label style={S.lbl}>Notes</label>
<input style={S.inp} value={formMvt.notes||""} onChange={e=>setFormMvt(p=>({...p,notes:e.target.value}))} placeholder="Informations complémentaires..."/>
</div>
{/* Aperçu impact */}
{formMvt.type&&formMvt.montant>0&&(()=>{
const t=TRESO_TYPES_MVT.find(x=>x.id===formMvt.type);
return t?(
<div style={{gridColumn:"1/-1",padding:"8px 12px",background:t.sens>0?"#f0fdf4":"#fef2f2",borderRadius:6,border:`1px solid ${t.sens>0?"#86efac":"#fecaca"}`,display:"flex",alignItems:"center",gap:8}}>
<span style={{fontSize:16}}>{t.icon}</span>
<span style={{fontSize:13,color:t.color,fontWeight:700}}>{t.sens>0?"Entrée":"Sortie"} de {fmt(+formMvt.montant||0)} DH</span>
<span style={{fontSize:11,color:"#64748b",marginLeft:"auto"}}>sur {[...caisses,...banques].find(c=>c.id===formMvt.compteId)?.nom||"--"}</span>
</div>
):null;
})()}
</div>
<div style={{padding:"12px 20px",borderTop:"1px solid #f0f4f8",display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btnS} onClick={()=>setFormMvt(null)}>Annuler</button>
<button style={S.btnP} onClick={saveMvt}>Enregistrer</button>
</div>
</div>
</div>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

function BalanceModule({data,type}){
const isClient=type==="clients";
const color=isClient?"#1a56db":"#7c3aed";
const tiersList=isClient?data.clients:data.fournisseurs;
const facKey=isClient?"vte-facture":"ach-facture";
const [search,setSearch]=useState("");
const [expanded,setExpanded]=useState({});
const soldeFact=(f)=>{
const ttc=docCalc(f.lignes,f.remiseGlobale||0).ttc;
const regle=(data.reglements||[]).filter(r=>r.factureId===f.id&&r.statut==="Encaissé").reduce((s,r)=>s+r.montant,0);
return{ttc,regle,restant:Math.max(0,ttc-regle)};
};
const balances=tiersList.map(t=>{
const factures=(data.documents[facKey]||[]).filter(d=>d.tiers===t.id);
const totalFacture=factures.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ttc,0);
const totalRegle=(data.reglements||[]).filter(r=>r.tiersId===t.id&&r.statut==="Encaissé").reduce((s,r)=>s+r.montant,0);
return{...t,factures,totalFacture,totalRegle,solde:totalFacture-totalRegle};
}).filter(b=>b.totalFacture>0||search).filter(b=>!search||b.nom.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.solde-a.solde);
const totalSolde=balances.reduce((s,b)=>s+b.solde,0);
return(
<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
{[{l:isClient?"Clients":"Fournisseurs",v:balances.length,c:color},{l:"Total facturé",v:fmt(balances.reduce((s,b)=>s+b.totalFacture,0))+" DH",c:color},{l:"Solde net",v:fmt(Math.abs(totalSolde))+" DH",c:totalSolde>0?"#dc2626":"#16a34a"}].map(s=>(
<div key={s.l} style={{background:s.c+"12",border:"1px solid "+s.c+"33",borderLeft:"4px solid "+s.c,borderRadius:10,padding:"12px 16px"}}>
<div style={{fontWeight:800,fontSize:18,color:s.c}}>{s.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{s.l}</div>
</div>
))}
</div>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:800}}>Balance {isClient?"Clients":"Fournisseurs"}</span>
<input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:180,marginLeft:"auto"}}/>
</div>
{balances.map(b=>{
const ec=b.solde<=0?"#16a34a":b.solde<1000?"#d97706":"#dc2626";
const isOpen=!!expanded[b.id];
return(
<div key={b.id} style={{borderBottom:"1px solid #f0f4f8"}}>
<div onClick={()=>setExpanded(p=>({...p,[b.id]:!p[b.id]}))} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",cursor:"pointer"}}>
<span style={{color:"#94a3b8",fontSize:11}}>{isOpen?"▼":"▶"}</span>
<div style={{flex:1}}>
<span style={{fontFamily:"monospace",fontWeight:700,color,marginRight:8}}>{b.code}</span>
<span style={{fontWeight:600}}>{b.nom}</span>
<span style={{fontSize:11,color:"#94a3b8",marginLeft:8}}>{b.factures.length} facture(s)</span>
</div>
<div style={{textAlign:"right"}}>
<div style={{fontWeight:800,fontSize:16,color:ec}}>{b.solde>0?fmt(b.solde)+" DH":"Soldé ✓"}</div>
</div>
</div>
{isOpen&&(
<div style={{background:"#f8fafc",borderTop:"1px solid #e2e8f0",padding:"0 0 0 32px"}}>
{b.factures.map(f=>{const s=soldeFact(f);return(
<div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 16px 8px 0",borderBottom:"1px solid #f0f4f8",fontSize:13}}>
<span style={{fontFamily:"monospace",fontWeight:700,color,width:100}}>{f.ref}</span>
<span style={{color:"#64748b",width:80}}>{f.dateDoc}</span>
<span style={{flex:1,fontWeight:700}}>{fmt(s.ttc)} DH</span>
<span style={{color:"#16a34a"}}>Réglé: {fmt(s.regle)}</span>
<span style={{fontWeight:800,color:s.restant>0?"#dc2626":"#16a34a"}}>{s.restant>0?fmt(s.restant)+" DH":"✓"}</span>
<button onClick={()=>printDoc(f,DOC_CFG[isClient?"vte-facture":"ach-facture"],data)} style={{...S.btnSm,fontSize:10}}>🖨</button>
</div>);})}
</div>
)}
</div>
);})}
{balances.length===0&&<div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>Aucune facture trouvée</div>}
<div style={{background:"#1a2332",padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
<span style={{color:"#a8b8cc",fontWeight:700}}>TOTAUX</span>
<span style={{color:totalSolde>0?"#fca5a5":"#86efac",fontWeight:800,fontSize:16}}>{fmt(Math.abs(totalSolde))} DH</span>
</div>
</div>
</div>
);
}

// ── Comptes comptables disponibles ──────────────────────────
const COMPTES_COMPTABLES_DEF=[
// Clients
{code:"3421",lib:"Clients",type:"client"},
{code:"3422",lib:"Clients - Effets à recevoir",type:"client"},
{code:"3424",lib:"Clients douteux",type:"client"},
{code:"3425",lib:"Clients - Avances et acomptes",type:"client"},
// Fournisseurs
{code:"4411",lib:"Fournisseurs",type:"fournisseur"},
{code:"4412",lib:"Fournisseurs - Effets à payer",type:"fournisseur"},
{code:"4415",lib:"Fournisseurs - Avances et acomptes",type:"fournisseur"},
// Articles/Produits
{code:"6111",lib:"Achats de marchandises",type:"article"},
{code:"6112",lib:"Achats de matières premières",type:"article"},
{code:"6113",lib:"Achats de matières consommables",type:"article"},
{code:"7111",lib:"Ventes de marchandises",type:"article"},
{code:"7112",lib:"Ventes de produits finis",type:"article"},
{code:"7113",lib:"Ventes de travaux",type:"article"},
{code:"7114",lib:"Ventes de services",type:"article"},
{code:"4456",lib:"TVA collectée",type:"article"},
{code:"3455",lib:"TVA récupérable",type:"article"},
];

function StatistiquesModule({data,type}){
const isVentes=type==="ventes";
const isClient=type==="client-detail";
const isFourn=type==="fourn-detail";
const color=isVentes?"#16a34a":"#d97706";
const [periode,setPeriode]=useState("all");
const [annee,setAnnee]=useState(new Date().getFullYear().toString());
const [selectedTiers,setSelectedTiers]=useState("");
const [tab,setTab]=useState("overview");

const allDocs=(isVentes||isClient?["vte-bl","vte-facture","vte-proforma"]:["ach-bl","ach-facture","ach-proforma"]).flatMap(k=>(data.documents[k]||[]).filter(d=>STATUTS_STOCK.includes(d.statut)));

const filterByPeriode=(docs)=>{
if(periode==="all") return docs;
if(periode==="annee") return docs.filter(d=>d.dateDoc?.startsWith(annee));
if(periode==="mois"){
const now=new Date();
const m=`${annee}-${String(now.getMonth()+1).padStart(2,"0")}`;
return docs.filter(d=>d.dateDoc?.startsWith(m));
}
return docs;
};

const docs=filterByPeriode(allDocs);
const docsClient=selectedTiers?docs.filter(d=>d.tiers===selectedTiers):docs;

const tiersList=isVentes||isClient?data.clients:data.fournisseurs;
const tiersLabel=isVentes||isClient?"Client":"Fournisseur";

// KPIs
const ca=docsClient.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ttc,0);
const caHT=docsClient.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ht,0);
const tva=ca-caHT;

// Top articles
const artMap={};
docsClient.forEach(d=>(d.lignes||[]).forEach(l=>{
if(!l.articleId)return;
if(!artMap[l.articleId])artMap[l.articleId]={ref:l.article,nom:l.designation,ca:0,qte:0,nb:0};
artMap[l.articleId].ca+=ligneNetHT(l);
artMap[l.articleId].qte+= Math.abs(+l.qte||0);
artMap[l.articleId].nb+=1;
}));
const topArt=Object.values(artMap).sort((a,b)=>b.ca-a.ca).slice(0,15);

// Top tiers
const tiersMap={};
docs.forEach(d=>{
if(!d.tiers)return;
if(!tiersMap[d.tiers])tiersMap[d.tiers]={ca:0,nb:0,docs:[]};
tiersMap[d.tiers].ca+=docCalc(d.lignes,d.remiseGlobale||0).ttc;
tiersMap[d.tiers].nb+=1;
tiersMap[d.tiers].docs.push(d);
});
const topTiers=Object.entries(tiersMap)
.map(([id,v])=>({...v,id,tiers:tiersList.find(t=>t.id===id)}))
.sort((a,b)=>b.ca-a.ca).slice(0,20);

// Evolution mensuelle
const moisMap={};
docsClient.forEach(d=>{
const m=d.dateDoc?.slice(0,7)||"";
if(!m)return;
if(!moisMap[m])moisMap[m]={m,ca:0,nb:0};
moisMap[m].ca+=docCalc(d.lignes,d.remiseGlobale||0).ttc;
moisMap[m].nb+=1;
});
const evolution=Object.values(moisMap).sort((a,b)=>a.m.localeCompare(b.m)).slice(-12);
const maxEvol=Math.max(...evolution.map(e=>e.ca),1);

// Détail client sélectionné
const selTiersInfo=selectedTiers?tiersList.find(t=>t.id===selectedTiers):null;
const selDocs=selectedTiers?docs.filter(d=>d.tiers===selectedTiers):[];

const maxCA=Math.max(...topArt.map(a=>a.ca),1);
const maxT=Math.max(...topTiers.map(t=>t.ca),1);

const ANNEES=[...new Set(allDocs.map(d=>d.dateDoc?.slice(0,4)).filter(Boolean))].sort().reverse();
if(!ANNEES.includes(annee)&&ANNEES.length) setAnnee(ANNEES[0]);

return(
<div>
{/* Filtres */}
<div style={{...S.card,marginBottom:14,padding:"12px 16px"}}>
<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
<span style={{fontWeight:700,fontSize:13,color:"#1a2332"}}>
{isVentes?"📈 Statistiques Ventes":"📉 Statistiques Achats"}
</span>
<div style={{display:"flex",gap:6,marginLeft:"auto",flexWrap:"wrap",alignItems:"center"}}>
<select style={{...S.inp,width:"auto"}} value={periode} onChange={e=>setPeriode(e.target.value)}>
<option value="all">Toutes périodes</option>
<option value="annee">Année</option>
<option value="mois">Mois en cours</option>
</select>
{(periode==="annee"||periode==="mois")&&(
<select style={{...S.inp,width:90}} value={annee} onChange={e=>setAnnee(e.target.value)}>
{(ANNEES.length?ANNEES:[new Date().getFullYear().toString()]).map(y=><option key={y} value={y}>{y}</option>)}
</select>
)}
<select style={{...S.inp,width:180}} value={selectedTiers} onChange={e=>setSelectedTiers(e.target.value)}>
<option value="">Tous les {tiersLabel}s</option>
{tiersList.map(t=><option key={t.id} value={t.id}>{t.nom}</option>)}
</select>
{selectedTiers&&<button style={S.btnSm} onClick={()=>setSelectedTiers("")}>✕</button>}
</div>
</div>
</div>

{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
{[
{l:isVentes?"CA TTC":"Achats TTC",v:fmt(ca)+" DH",c:color,icon:"💰"},
{l:"Base HT",v:fmt(caHT)+" DH",c:"#1a56db",icon:"📋"},
{l:"TVA",v:fmt(tva)+" DH",c:"#7c3aed",icon:"🧾"},
{l:"Documents",v:docsClient.length,c:"#0891b2",icon:"📄"},
].map(s=>(
<div key={s.l} style={{background:s.c+"10",border:"1px solid "+s.c+"30",borderLeft:"4px solid "+s.c,borderRadius:10,padding:"12px 14px"}}>
<div style={{fontSize:16}}>
{s.icon}
</div>
<div style={{fontWeight:800,fontSize:16,color:s.c,marginTop:4}}>{s.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{s.l}</div>
</div>
))}
</div>

{/* Onglets */}
<div style={{display:"flex",gap:0,marginBottom:14,background:"#f8fafc",borderRadius:8,padding:3}}>
{[
{id:"overview",l:"Vue d'ensemble"},
{id:"tiers",l:isVentes?"Par Client":"Par Fournisseur"},
{id:"articles",l:"Par Article"},
{id:"evolution",l:"Évolution"},
].map(t=>(
<button key={t.id} onClick={()=>setTab(t.id)}
style={{flex:1,padding:"7px 0",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:tab===t.id?700:400,
background:tab===t.id?"#fff":"transparent",
color:tab===t.id?color:"#64748b",
boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",
fontFamily:"inherit"}}>
{t.l}
</button>
))}
</div>

{/* Vue d'ensemble */}
{tab==="overview"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700}}>🔩 Top 5 Articles</span></div>
<div style={{padding:"12px 16px"}}>
{topArt.slice(0,5).map((a,i)=>(
<div key={a.ref} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
<span><strong style={{color}}>{i+1}.</strong> {a.nom}</span>
<span style={{fontWeight:700,color}}>{fmt(a.ca)} DH</span>
</div>
<div style={{background:"#f1f5f9",borderRadius:4,height:6}}>
<div style={{width:(a.ca/maxCA*100)+"%",height:"100%",background:color,borderRadius:4}}/>
</div>
</div>
))}
{topArt.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:20}}>Aucune donnée</div>}
</div>
</div>
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700}}>🏢 Top 5 {tiersLabel}s</span></div>
<div style={{padding:"12px 16px"}}>
{topTiers.slice(0,5).map((t,i)=>(
<div key={t.id} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
<span><strong style={{color}}>{i+1}.</strong> {t.tiers?.nom||"?"}</span>
<span style={{fontWeight:700,color}}>{fmt(t.ca)} DH</span>
</div>
<div style={{background:"#f1f5f9",borderRadius:4,height:6}}>
<div style={{width:(t.ca/maxT*100)+"%",height:"100%",background:color,borderRadius:4}}/>
</div>
</div>
))}
{topTiers.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:20}}>Aucune donnée</div>}
</div>
</div>
</div>
)}

{/* Par Tiers */}
{tab==="tiers"&&(
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:700}}>🏢 Détail par {tiersLabel}</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:6}}>{topTiers.length}</span>
</div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Rang",tiersLabel,"Ville","Nb docs","CA HT","CA TTC","% CA","Actions"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{topTiers.map((t,i)=>{
const pcCA=ca>0?(t.ca/ca*100):0;
return(
<tr key={t.id}>
<td style={{...S.td,textAlign:"center"}}>
<span style={{width:24,height:24,background:i<3?color:"#e2e8f0",color:i<3?"#fff":"#64748b",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{i+1}</span>
</td>
<td style={S.td}>
<div style={{fontWeight:700}}>{t.tiers?.nom||"?"}</div>
<div style={{fontSize:11,color:"#94a3b8"}}>{t.tiers?.code||""}</div>
</td>
<td style={S.td}>{t.tiers?.ville||"--"}</td>
<td style={{...S.td,textAlign:"center",fontWeight:700}}>{t.nb}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace"}}>{fmt(t.ca/1.2)} DH</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:700,color}}>{fmt(t.ca)} DH</td>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<div style={{flex:1,background:"#f1f5f9",borderRadius:4,height:6}}>
<div style={{width:pcCA+"%",height:"100%",background:color,borderRadius:4}}/>
</div>
<span style={{fontSize:11,fontWeight:600,color,minWidth:32}}>{pcCA.toFixed(1)}%</span>
</div>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>setSelectedTiers(t.id)}>🔍 Détail</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
{/* Détail tiers sélectionné */}
{selTiersInfo&&(
<div style={{padding:16,borderTop:"2px solid #e2e8f0",background:"#f8fafc"}}>
<div style={{fontWeight:800,fontSize:14,marginBottom:10,color}}>
🔍 Détail : {selTiersInfo.nom}
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Référence","Date","Statut","Base HT","TTC","Réglé","Solde"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{selDocs.sort((a,b)=>b.dateDoc?.localeCompare(a.dateDoc)).map(d=>{
const c2=docCalc(d.lignes,d.remiseGlobale||0);
const reglements=(isVentes?data.reglementsVente:data.reglementsAchat)||[];
const paye=reglements.filter(r=>r.factureRef===d.ref&&r.statut!=="Annulé").reduce((s,r)=>s+(+r.montant||0),0);
const solde=c2.ttc-paye;
return(
<tr key={d.id} onDoubleClick={()=>editDoc(d)} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour ouvrir" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color}}>{d.ref}</td>
<td style={S.td}>{d.dateDoc}</td>
<td style={S.td}><span style={{...S.badge,background:color+"15",color}}>{d.statut}</span></td>
<td style={{...S.td,textAlign:"right"}}>{fmt(c2.ht)} DH</td>
<td style={{...S.td,textAlign:"right",fontWeight:700}}>{fmt(c2.ttc)} DH</td>
<td style={{...S.td,textAlign:"right",color:"#16a34a",fontWeight:700}}>{fmt(paye)} DH</td>
<td style={{...S.td,textAlign:"right"}}>
{solde>0
?<span style={{color:"#dc2626",fontWeight:700}}>{fmt(solde)} DH</span>
:<span style={{color:"#16a34a",fontSize:11}}>✅ Soldé</span>}
</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</div>
)}

{/* Par Article */}
{tab==="articles"&&(
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700}}>🔩 Détail par Article</span></div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Rang","Référence","Désignation","Qté vendue","CA HT","% CA"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{topArt.map((a,i)=>{
const pc=caHT>0?(a.ca/caHT*100):0;
return(
<tr key={a.ref}>
<td style={{...S.td,textAlign:"center"}}>
<span style={{width:24,height:24,background:i<3?color:"#e2e8f0",color:i<3?"#fff":"#64748b",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{i+1}</span>
</td>
<td style={{...S.td,fontFamily:"monospace",color:"#1a56db",fontWeight:600}}>{a.ref}</td>
<td style={{...S.td,fontWeight:600}}>{a.nom}</td>
<td style={{...S.td,textAlign:"center",fontWeight:700,color}}>{fmt(a.qte)}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:700,color}}>{fmt(a.ca)} DH</td>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<div style={{flex:1,background:"#f1f5f9",borderRadius:4,height:6}}>
<div style={{width:pc+"%",height:"100%",background:color,borderRadius:4}}/>
</div>
<span style={{fontSize:11,fontWeight:600,color,minWidth:32}}>{pc.toFixed(1)}%</span>
</div>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
</div>
)}

{/* Évolution mensuelle */}
{tab==="evolution"&&(
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700}}>📅 Évolution mensuelle</span></div>
<div style={{padding:16}}>
{evolution.length===0
?<div style={{textAlign:"center",color:"#94a3b8",padding:40}}>Aucune donnée disponible</div>
:<div>
<div style={{display:"flex",alignItems:"flex-end",gap:6,height:160,paddingBottom:8,borderBottom:"2px solid #e2e8f0",marginBottom:12}}>
{evolution.map((e,i)=>(
<div key={e.m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
<div style={{fontSize:9,color:color,fontWeight:700}}>{e.nb}</div>
<div style={{width:"100%",background:color,borderRadius:"3px 3px 0 0",height:Math.max((e.ca/maxEvol*120),4),minHeight:4,transition:"height .3s",cursor:"pointer",position:"relative"}}
title={`${e.m} : ${fmt(e.ca)} DH`}/>
</div>
))}
</div>
<div style={{display:"flex",gap:6}}>
{evolution.map(e=>(
<div key={e.m} style={{flex:1,textAlign:"center",fontSize:9,color:"#94a3b8"}}>{e.m.slice(5)}</div>
))}
</div>
<div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
{evolution.slice(-3).reverse().map(e=>(
<div key={e.m} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
<div style={{fontSize:11,color:"#94a3b8"}}>{e.m}</div>
<div style={{fontWeight:800,color,fontSize:15,marginTop:2}}>{fmt(e.ca)} DH</div>
<div style={{fontSize:10,color:"#64748b"}}>{e.nb} doc(s)</div>
</div>
))}
</div>
</div>}
</div>
</div>
)}
</div>
);
}


// ── Droits disponibles ──────────────────────────────────────
const DROITS_DEF=[
{id:"clients",      label:"Clients",        icon:"👤"},
{id:"fournisseurs", label:"Fournisseurs",    icon:"🏭"},
{id:"articles",     label:"Articles",        icon:"🔩"},
{id:"achats",       label:"Achats",          icon:"📥"},
{id:"ventes",       label:"Ventes",          icon:"📤"},
{id:"stock",        label:"Stock",           icon:"📦"},
{id:"reglements",   label:"Règlements",      icon:"💳"},
{id:"statistiques", label:"Statistiques",    icon:"📊"},
{id:"administration",label:"Administration", icon:"⚙️"},
];

function UtilisateursModule({data,setData,curUser,societeId}){
const [modal,setModal]=useState(null);
const [form,setForm]=useState({});
const [tab,setTab]=useState("coord");
const [toast,setToast]=useState(null);
const [resetPwd,setResetPwd]=useState({});
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};

const ROLES_DEF=[
{id:"admin",   nom:"Administrateur", couleur:"#7c3aed", droits:DROITS_DEF.map(d=>d.id)},
{id:"manager", nom:"Manager",        couleur:"#1a56db", droits:["clients","fournisseurs","articles","achats","ventes","stock","reglements","statistiques"]},
{id:"commercial",nom:"Commercial",   couleur:"#0891b2", droits:["clients","articles","ventes","reglements","statistiques"]},
{id:"acheteur",nom:"Acheteur",       couleur:"#d97706", droits:["fournisseurs","articles","achats","stock","reglements"]},
{id:"stock",   nom:"Magasinier",     couleur:"#059669", droits:["articles","stock"]},
{id:"custom",  nom:"Personnalisé",   couleur:"#6366f1", droits:[]},
];

const roles=data.roles?.length?data.roles:ROLES_DEF;
const users=data.utilisateurs||[];

const openNew=()=>{
const defRole=roles.find(r=>r.id==="manager")||roles[0];
setForm({
id:"",nom:"",email:"",login:"",pwd:"",
role:defRole?.id||"manager",
droits:[...(defRole?.droits||[])],
agences:[],actif:true,isNew:true,
});
setTab("coord");setModal("form");
};

const openEdit=(u)=>{
// S'assurer que les droits sont initialisés depuis le rôle si vides
const role=roles.find(r=>r.id===u.role);
const droits=(u.droits&&u.droits.length>0)?u.droits:(role?.droits||[]);
setForm({...u,pwd:"",isNew:false,droits:[...droits]});
setTab("coord");setModal("form");
};

const save=()=>{
if(!form.nom?.trim()) return showToast("Nom obligatoire",false);
if(!form.login?.trim()) return showToast("Login obligatoire",false);
if(form.isNew && !form.pwd?.trim()) return showToast("Mot de passe obligatoire",false);
if(form.isNew && users.find(u=>u.login===form.login)) return showToast("Ce login existe déjà",false);
const role=roles.find(r=>r.id===form.role);
const droits=form.role==="custom"?(form.droits||[]):( role?.droits||[]);
const rec={
id:form.id||uid("USR"),
nom:form.nom.trim(),
email:form.email?.trim()||"",
login:form.login.trim(),
pwd:form.pwd?btoa(form.pwd):(form.isNew?"":form.pwd),
role:form.role,
droits,
agences:form.agences||[],
actif:form.actif!==false,
socId:societeId,
};
// Synchroniser dans lgm_users global (connexion + droits)
const gUsers=LS.get("lgm_users")||[];
const gExists=gUsers.find(u=>u.id===rec.id||(u.login===rec.login&&u.socId===societeId));
if(gExists){
// Mettre à jour droits, rôle, nom, email dans lgm_users
LS.set("lgm_users", gUsers.map(u=>(u.id===rec.id||(u.login===rec.login&&u.socId===societeId))
?{...u, nom:rec.nom, email:rec.email, droits:rec.droits, role:rec.role, actif:rec.actif, ...(rec.pwd?{pwd:rec.pwd}:{})}
:u
));
} else {
// Nouvel utilisateur → créer dans lgm_users
LS.set("lgm_users",[...gUsers,{
id:rec.id, nom:rec.nom, email:rec.email,
login:rec.login, pwd:rec.pwd,
droits:rec.droits, role:rec.role,
socId:societeId, actif:rec.actif
}]);
}
setData(p=>({...p,
utilisateurs:p.utilisateurs.find(u=>u.id===rec.id)
?p.utilisateurs.map(u=>u.id===rec.id?rec:u)
:[...p.utilisateurs,rec]
}));
showToast(`Utilisateur "${rec.nom}" enregistré !`);
setModal(null);
};

const del=(u)=>{
if(u.id===curUser?.id) return showToast("Impossible de supprimer votre propre compte",false);
setData(p=>({...p,utilisateurs:p.utilisateurs.filter(x=>x.id!==u.id)}));
const gUsers=LS.get("lgm_users")||[];
LS.set("lgm_users",gUsers.filter(x=>!(x.login===u.login&&x.socId===societeId)));
showToast("Utilisateur supprimé");
};

const toggleActif=(u)=>{
if(u.id===curUser?.id) return showToast("Impossible de désactiver votre propre compte",false);
setData(p=>({...p,utilisateurs:p.utilisateurs.map(x=>x.id===u.id?{...x,actif:!x.actif}:x)}));
};

const role4=(u)=>roles.find(r=>r.id===u.role);

return(
<>
<div style={S.card}>
<div style={S.hdr}>
<span>👥</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Utilisateurs</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{users.length}</span>
<div style={{marginLeft:"auto"}}>
<button style={S.btnP} onClick={openNew}>+ Nouvel utilisateur</button>
</div>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Utilisateur","Login","Rôle","Droits","Agences","Statut","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{users.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:28}}>Aucun utilisateur — cliquez sur "+ Nouvel utilisateur"</td></tr>}
{users.map(u=>{
const r=role4(u);
const droitsLabels=(u.droits||[]).map(d=>DROITS_DEF.find(x=>x.id===d));
return(
<tr key={u.id} onDoubleClick={()=>openEdit(u)} style={{cursor:"pointer",transition:"background .1s"}} title="Double-clic pour modifier" onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:34,height:34,borderRadius:"50%",background:avatarC(u.nom),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12,flexShrink:0}}>{initials(u.nom)}</div>
<div>
<div style={{fontWeight:700}}>{u.nom}</div>
<div style={{fontSize:11,color:"#94a3b8"}}>{u.email||"--"}</div>
</div>
{u.id===curUser?.id&&<span style={{...S.badge,background:"#fef9c3",color:"#854d0e",fontSize:10}}>Vous</span>}
</div>
</td>
<td style={{...S.td,fontFamily:"monospace",color:"#1a56db",fontWeight:600}}>{u.login}</td>
<td style={S.td}>
{r&&<span style={{...S.badge,background:r.couleur+"18",color:r.couleur,fontWeight:700}}>{r.nom}</span>}
</td>
<td style={S.td}>
<div style={{display:"flex",flexWrap:"wrap",gap:3,maxWidth:200}}>
{droitsLabels.filter(Boolean).slice(0,4).map(d=>(
<span key={d.id} style={{...S.badge,background:"#f1f5f9",color:"#475569",fontSize:10}}>{d.icon} {d.label}</span>
))}
{droitsLabels.length>4&&<span style={{...S.badge,background:"#f1f5f9",color:"#94a3b8",fontSize:10}}>+{droitsLabels.length-4}</span>}
{droitsLabels.length===0&&<span style={{color:"#94a3b8",fontSize:11}}>Aucun droit</span>}
</div>
</td>
<td style={S.td}>
<div style={{display:"flex",flexWrap:"wrap",gap:3}}>
{(u.agences||[]).length===0
?<span style={{color:"#94a3b8",fontSize:11}}>Toutes</span>
:(u.agences||[]).map(id=>{const ag=data.agences.find(a=>a.id===id);return ag?<span key={id} style={{...S.badge,background:"#eef2ff",color:"#1a56db",fontSize:10}}>{ag.code}</span>:null;})
}
</div>
</td>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<label style={{display:"flex",alignItems:"center",gap:5,cursor:u.id===curUser?.id?"not-allowed":"pointer"}}>
<input type="checkbox" checked={!!u.actif} onChange={()=>toggleActif(u)}
disabled={u.id===curUser?.id}
style={{width:14,height:14,accentColor:"#16a34a"}}/>
<span style={{...S.badge,background:u.actif?"#f0fdf4":"#fef2f2",color:u.actif?"#16a34a":"#ef4444"}}>{u.actif?"Actif":"Inactif"}</span>
</label>
</div>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>openEdit(u)}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(u)} disabled={u.id===curUser?.id}>🗑</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>

{modal==="form"&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
<div style={{background:"#fff",borderRadius:14,width:560,maxWidth:"98vw",maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
<div style={{padding:"16px 20px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:10}}>
<div style={{width:38,height:38,borderRadius:"50%",background:form.nom?avatarC(form.nom):"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14}}>{form.nom?initials(form.nom):"?"}</div>
<div style={{flex:1}}>
<div style={{fontWeight:800,fontSize:15,color:"#1a2332"}}>{form.isNew?"Nouvel utilisateur":"Modifier "+form.nom}</div>
<div style={{fontSize:11,color:"#94a3b8"}}>Société: {data.societe?.nomCommercial||"--"}</div>
</div>
<button onClick={()=>setModal(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8"}}>×</button>
</div>
<div style={{display:"flex",borderBottom:"1px solid #f0f4f8"}}>
{[{id:"coord",l:"Coordonnées"},{id:"acces",l:"Accès"},{id:"droits",l:"Droits"},{id:"agences",l:"Agences"}].map(t=>(
<button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontWeight:tab===t.id?800:500,color:tab===t.id?"#1a56db":"#64748b",borderBottom:tab===t.id?"2px solid #1a56db":"2px solid transparent",fontSize:12,fontFamily:"inherit"}}>
{t.l}
</button>
))}
</div>
<div style={{flex:1,overflowY:"auto",padding:20}}>
{tab==="coord"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<Fld label="Nom complet" required style={{gridColumn:"1/-1"}}>
<input style={S.inp} value={form.nom||""} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} autoFocus placeholder="Mohammed Alami"/>
</Fld>
<Fld label="Email">
<input style={S.inp} type="email" value={form.email||""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="m.alami@societe.ma"/>
</Fld>
<Fld label="Rôle" required>
<select style={S.inp} value={form.role||"manager"} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
{roles.map(r=><option key={r.id} value={r.id}>{r.nom}</option>)}
</select>
</Fld>
</div>
)}
{tab==="acces"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<Fld label="Login" required>
<input style={{...S.inp,fontFamily:"monospace"}} value={form.login||""} onChange={e=>setForm(p=>({...p,login:e.target.value.toLowerCase().replace(/\s/g,"")}))} placeholder="m.alami"/>
</Fld>
<div/>
<Fld label={form.isNew?"Mot de passe *":"Nouveau mot de passe (laisser vide = inchangé)"}>
<input style={S.inp} type="password" value={form.pwd||""} onChange={e=>setForm(p=>({...p,pwd:e.target.value}))} placeholder="••••••••"/>
</Fld>
{!form.isNew&&<div style={{fontSize:12,color:"#94a3b8",padding:"24px 0 0",gridColumn:"1/-1"}}>Laissez le champ vide pour conserver l'ancien mot de passe.</div>}
</div>
)}
{tab==="droits"&&(
<div>
{/* Raccourcis rôles prédéfinis */}
<div style={{marginBottom:16}}>
<label style={S.lbl}>Charger un profil de droits</label>
<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
{roles.map(r=>(
<button key={r.id}
onClick={()=>setForm(p=>({...p,role:r.id,droits:[...(r.droits||[])]}))}
style={{...S.btnS,
background:form.role===r.id?r.couleur:"#f8fafc",
color:form.role===r.id?"#fff":r.couleur,
borderColor:r.couleur,
fontWeight:form.role===r.id?800:500,
fontSize:12,
}}>
{form.role===r.id?"✓ ":""}{r.nom}
</button>
))}
</div>
<div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>Cliquez sur un profil pour charger ses droits, puis modifiez selon vos besoins.</div>
</div>

{/* Cases à cocher droits — toujours modifiables */}
<label style={S.lbl}>Droits d'accès <span style={{color:"#1a56db",fontWeight:700}}>({(form.droits||[]).length}/{DROITS_DEF.length})</span></label>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
{DROITS_DEF.map(d=>{
const checked=(form.droits||[]).includes(d.id);
return(
<label key={d.id}
onClick={()=>{
const cur=form.droits||[];
setForm(p=>({
...p,
role:"custom",
droits:cur.includes(d.id)?cur.filter(x=>x!==d.id):[...cur,d.id]
}));
}}
style={{
display:"flex",alignItems:"center",gap:10,
padding:"10px 12px",
background:checked?"#f0fdf4":"#f8fafc",
border:"2px solid "+(checked?"#16a34a":"#e2e8f0"),
borderRadius:8,cursor:"pointer",
transition:"all .1s",
userSelect:"none",
}}>
<div style={{
width:20,height:20,borderRadius:5,flexShrink:0,
background:checked?"#16a34a":"#fff",
border:"2px solid "+(checked?"#16a34a":"#d1d5db"),
display:"flex",alignItems:"center",justifyContent:"center",
}}>
{checked&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
</div>
<span style={{fontSize:15}}>{d.icon}</span>
<span style={{fontSize:13,fontWeight:checked?700:400,color:checked?"#16a34a":"#64748b"}}>{d.label}</span>
</label>
);
})}
</div>

{/* Boutons tout/rien */}
<div style={{display:"flex",gap:8,marginTop:12}}>
<button style={{...S.btnS,fontSize:12,flex:1}} onClick={()=>setForm(p=>({...p,role:"custom",droits:DROITS_DEF.map(d=>d.id)}))}>
✅ Tout sélectionner
</button>
<button style={{...S.btnS,fontSize:12,flex:1,color:"#dc2626",borderColor:"#fecaca"}} onClick={()=>setForm(p=>({...p,role:"custom",droits:[]}))}>
☐ Tout décocher
</button>
</div>
</div>
)}
{tab==="agences"&&(
<div>
<div style={{marginBottom:10,fontSize:13,color:"#64748b",background:"#f8fafc",padding:"8px 12px",borderRadius:6}}>
Si aucune agence n'est sélectionnée, l'utilisateur a accès à toutes les agences.
</div>
{data.agences.length===0
?<div style={{textAlign:"center",padding:"24px 0",color:"#94a3b8",fontSize:13}}>Aucune agence créée — Administration → Agences & Dépôts</div>
:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
{data.agences.map(ag=>{
const sel=(form.agences||[]).includes(ag.id);
return(
<label key={ag.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:sel?"#eef2ff":"#f8fafc",border:"1px solid "+(sel?"#c7d2fe":"#e2e8f0"),borderRadius:7,cursor:"pointer"}}>
<input type="checkbox" checked={sel}
onChange={()=>{
const cur=form.agences||[];
setForm(p=>({...p,agences:cur.includes(ag.id)?cur.filter(x=>x!==ag.id):[...cur,ag.id]}));
}}
style={{width:14,height:14,accentColor:"#1a56db"}}/>
<div>
<div style={{fontWeight:600,fontSize:13,color:sel?"#1a56db":"#1a2332"}}>{ag.nom}</div>
<div style={{fontSize:10,color:"#94a3b8"}}>{ag.code} · {ag.ville||"--"}</div>
</div>
</label>
);
})}
</div>
}
</div>
)}
</div>
<div style={{padding:"12px 20px",borderTop:"1px solid #f0f4f8",display:"flex",gap:10,justifyContent:"flex-end"}}>
<button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
<button style={S.btnP} onClick={save}>Enregistrer</button>
</div>
</div>
</div>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}

function SeriesDocModule({data,setData}){
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const [editId,setEditId]=useState(null);
const [selSF,setSelSF]=useState("");
const DOC_TYPES_VTE=["vte-devis","vte-bc","vte-bl","vte-proforma","vte-facture","vte-avoir"];
const DOC_TYPES_ACH=["ach-devis","ach-bc","ach-bl","ach-proforma","ach-facture","ach-avoir"];
const EMPTY={id:"",sousFamilleId:"",label:"",docTypes:[],prefix:"",sep:"-",annee:true,pad:4,seq:1,actif:true};
const [form,setForm]=useState({...EMPTY});
const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
const series=data.seriesDoc||[];
const sfs=data.sousFamillesClients||[];
const fams=data.famillesClients||[];
const sfLabel=(id)=>{
const sf=sfs.find(s=>s.id===id);if(!sf)return "—";
const f=fams.find(x=>x.id===sf.familleId);
return f?f.nom+" › "+sf.nom:sf.nom;
};
const prevNum=(f,seq)=>{
const s=String(seq||f.seq||1).padStart(f.pad||4,"0");
const yr=new Date().getFullYear();
return f.annee!==false?`${f.prefix||""}${yr}${f.sep||""}${s}`:`${f.prefix||""}${s}`;
};
const save=()=>{
if(!form.sousFamilleId)return showToast("Sous-famille obligatoire",false);
if(!form.prefix.trim())return showToast("Préfixe obligatoire",false);
if(!form.docTypes.length)return showToast("Choisir au moins un type de document",false);
const conflict=(data.seriesDoc||[]).find(s=>
s.id!==editId&&s.sousFamilleId===form.sousFamilleId&&
(s.docTypes||[]).some(dt=>form.docTypes.includes(dt)));
if(conflict)return showToast("Conflit avec série : "+conflict.prefix,false);
const rec={...form,id:editId||uid("SRD"),prefix:form.prefix.trim(),pad:+form.pad||4,seq:+form.seq||1};
setData(p=>({...p,seriesDoc:editId?(p.seriesDoc||[]).map(s=>s.id===editId?rec:s):[...(p.seriesDoc||[]),rec]}));
showToast("Série enregistrée ✅");setForm({...EMPTY});setEditId(null);
};
const del=(id)=>{setData(p=>({...p,seriesDoc:(p.seriesDoc||[]).filter(s=>s.id!==id)}));showToast("Supprimé");};
const togDT=(dt)=>upd("docTypes",form.docTypes.includes(dt)?form.docTypes.filter(x=>x!==dt):[...form.docTypes,dt]);
const bySF={};series.forEach(s=>{if(!bySF[s.sousFamilleId])bySF[s.sousFamilleId]=[];bySF[s.sousFamilleId].push(s);});
return(
<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
{[{l:"Séries",v:series.length,c:"#1a56db"},{l:"SF couvertes",v:Object.keys(bySF).length,c:"#7c3aed"},{l:"SF sans série",v:Math.max(0,sfs.length-Object.keys(bySF).length),c:"#d97706"}].map(k=>(
<div key={k.l} style={{background:k.c+"10",borderLeft:"4px solid "+k.c,borderRadius:8,padding:"10px 14px"}}>
<div style={{fontWeight:900,fontSize:22,color:k.c}}>{k.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{k.l}</div>
</div>
))}
</div>
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>{editId?"Modifier":"Nouvelle"} série</span>
{editId&&<button style={{...S.btnSm,marginLeft:"auto"}} onClick={()=>{setForm({...EMPTY});setEditId(null);}}>Annuler</button>}
</div>
<div style={{padding:20}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<div style={{marginBottom:12,gridColumn:"1/-1"}}>
<label style={S.lbl}>Sous-famille client *</label>
<select style={S.inp} value={form.sousFamilleId} onChange={e=>upd("sousFamilleId",e.target.value)}>
<option value="">-- Choisir --</option>
{fams.map(f=>(
<optgroup key={f.id} label={f.nom}>
{sfs.filter(s=>s.familleId===f.id).map(s=>(
<option key={s.id} value={s.id}>{s.nom}</option>
))}
</optgroup>
))}
</select>
</div>
<Fld label="Libellé"><input style={S.inp} value={form.label||""} onChange={e=>upd("label",e.target.value)} placeholder="Grand Compte, Export..."/></Fld>
<Fld label="Préfixe *"><input style={{...S.inp,fontFamily:"monospace",fontWeight:700,textTransform:"uppercase"}} value={form.prefix} onChange={e=>upd("prefix",e.target.value.toUpperCase())} placeholder="GC-, EXP-"/></Fld>
<Fld label="Séparateur">
<select style={S.inp} value={form.sep} onChange={e=>upd("sep",e.target.value)}>
<option value="-">Tiret -</option><option value="/">Slash /</option>
<option value=".">Point .</option><option value="">Aucun</option>
</select>
</Fld>
<Fld label="Nb chiffres">
<select style={S.inp} value={form.pad||4} onChange={e=>upd("pad",+e.target.value)}>
{[3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
</select>
</Fld>
<Fld label="Séquence départ"><input type="number" min="1" style={{...S.inp,fontFamily:"monospace"}} value={form.seq||1} onChange={e=>upd("seq",+e.target.value)}/></Fld>
<Fld label="Options" full>
<div style={{display:"flex",gap:16}}>
{[{k:"annee",l:"Inclure l'année",c:"#1a56db"},{k:"actif",l:"Série active",c:"#16a34a"}].map(o=>(
<label key={o.k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
<input type="checkbox" checked={form[o.k]!==false} onChange={e=>upd(o.k,e.target.checked)} style={{accentColor:o.c}}/>
<span style={{fontWeight:600}}>{o.l}</span>
</label>
))}
</div>
</Fld>
<div style={{marginBottom:12,gridColumn:"1/-1",padding:"10px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,display:"flex",alignItems:"center",gap:14}}>
<span style={{fontSize:11,color:"#64748b"}}>Aperçu :</span>
<span style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:"#0891b2"}}>{prevNum(form)}</span>
<span style={{fontSize:11,color:"#94a3b8"}}>{prevNum(form,(+form.seq||1)+1)} · {prevNum(form,(+form.seq||1)+2)}</span>
</div>
<div style={{gridColumn:"1/-1",marginBottom:12}}>
<label style={{...S.lbl,marginBottom:8,display:"block"}}>Types de documents * <span style={{color:"#94a3b8",fontWeight:400}}>{form.docTypes.length===0?"Aucun":form.docTypes.length+" sélectionné(s)"}</span></label>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
<div>
<div style={{fontSize:11,fontWeight:700,color:"#1a56db",padding:"3px 8px",background:"#eef2ff",borderRadius:5,marginBottom:4}}>Vente</div>
{DOC_TYPES_VTE.map(dt=>(
<label key={dt} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",cursor:"pointer",borderRadius:4,background:form.docTypes.includes(dt)?"#eef2ff":"transparent"}}>
<input type="checkbox" checked={form.docTypes.includes(dt)} onChange={()=>togDT(dt)} style={{accentColor:"#1a56db"}}/>
<span style={{fontSize:11,color:form.docTypes.includes(dt)?"#1a56db":"#64748b"}}>{DOC_CFG[dt]?.titre||dt}</span>
</label>
))}
</div>
<div>
<div style={{fontSize:11,fontWeight:700,color:"#7c3aed",padding:"3px 8px",background:"#f5f3ff",borderRadius:5,marginBottom:4}}>Achat</div>
{DOC_TYPES_ACH.map(dt=>(
<label key={dt} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",cursor:"pointer",borderRadius:4,background:form.docTypes.includes(dt)?"#f5f3ff":"transparent"}}>
<input type="checkbox" checked={form.docTypes.includes(dt)} onChange={()=>togDT(dt)} style={{accentColor:"#7c3aed"}}/>
<span style={{fontSize:11,color:form.docTypes.includes(dt)?"#7c3aed":"#64748b"}}>{DOC_CFG[dt]?.titre||dt}</span>
</label>
))}
</div>
</div>
</div>
</div>
<div style={{display:"flex",justifyContent:"flex-end"}}>
<button style={S.btnP} onClick={save}>{editId?"Modifier":"Créer la série"}</button>
</div>
</div>
</div>
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14}}>Séries configurées</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{series.length}</span>
<div style={{marginLeft:"auto"}}>
<select style={{...S.inp,width:200}} value={selSF} onChange={e=>setSelSF(e.target.value)}>
<option value="">Toutes les sous-familles</option>
{fams.map(f=>(
<optgroup key={f.id} label={f.nom}>
{sfs.filter(s=>s.familleId===f.id).map(s=><option key={s.id} value={s.id}>{s.nom}</option>)}
</optgroup>
))}
</select>
</div>
</div>
{series.length===0?(
<div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>
<div style={{fontSize:36,marginBottom:8}}>🔢</div>
<div style={{fontWeight:600}}>Aucune série configurée</div>
<div style={{fontSize:12,marginTop:4}}>Affectez des préfixes de numérotation par sous-famille client</div>
</div>
):(
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Sous-famille","Libellé","Format","Exemple","Séq.","Documents","Statut",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{series.filter(s=>!selSF||s.sousFamilleId===selSF).map(s=>{
const seq=(data.compteursSeries?.[s.id]?.seq)||s.seq||1;
return(
<tr key={s.id} onDoubleClick={()=>{setEditId(s.id);setForm({...s,docTypes:s.docTypes||[]});window.scrollTo(0,0);}} style={{cursor:"pointer"}}
onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={S.td}><span style={{fontWeight:700}}>{sfLabel(s.sousFamilleId)}</span></td>
<td style={S.td}>{s.label||"—"}</td>
<td style={{...S.td,fontFamily:"monospace",fontSize:11,color:"#0891b2"}}>{s.prefix}{s.annee!==false?new Date().getFullYear()+(s.sep||""):""}{"0".repeat(s.pad||4)}</td>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:"#1a56db"}}>{prevNum(s,seq)}</td>
<td style={{...S.td,textAlign:"center",fontFamily:"monospace",fontWeight:700,color:"#7c3aed"}}>{seq}</td>
<td style={S.td}><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{(s.docTypes||[]).map(dt=><span key={dt} style={{...S.badge,background:(DOC_CFG[dt]?.color||"#94a3b8")+"18",color:DOC_CFG[dt]?.color||"#94a3b8",fontSize:9}}>{(DOC_CFG[dt]?.titre||dt).split(" ")[0]}</span>)}</div></td>
<td style={S.td}>
<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
<input type="checkbox" checked={s.actif!==false} onChange={()=>setData(p=>({...p,seriesDoc:(p.seriesDoc||[]).map(x=>x.id===s.id?{...x,actif:!x.actif}:x)}))} style={{accentColor:"#16a34a"}}/>
<span style={{...S.badge,background:s.actif!==false?"#f0fdf4":"#fef2f2",color:s.actif!==false?"#16a34a":"#ef4444"}}>{s.actif!==false?"Active":"Inactive"}</span>
</label>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setEditId(s.id);setForm({...s,docTypes:s.docTypes||[]});window.scrollTo(0,0);}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(s.id)}>🗑</button>
</td>
</tr>);
})}
</tbody>
</table>
)}
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

function NumerotationModule({data,setData}){
const [modal,setModal]=useState(null);
const [form,setForm]=useState({});
const [toast,setToast]=useState(null);
const [tabN,setTabN]=useState("series");
const [sf,setSf]=useState({nom:"",description:"",type:"vte-facture",prefix:"",sep:"-",annee:true,seq:1,pad:4,actif:true,clientId:""});
const [editSerie,setEditSerie]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const series=data.seriesNum||[];
const groups=[
{label:"Achats",color:"#1a56db",docs:["ach-devis","ach-bc","ach-proforma","ach-bl","ach-br","ach-facture","ach-avoir"]},
{label:"Ventes",color:"#16a34a",docs:["vte-devis","vte-bc","vte-proforma","vte-bl","vte-br","vte-facture","vte-avoir"]},
{label:"Fiches",color:"#7c3aed",docs:["client","fournisseur","article"]},
];
const save=()=>{setData(p=>({...p,compteurs:{...p.compteurs,[modal]:form}}));showToast("Enregistré ✅");setModal(null);};
const saveSerie=()=>{
if(!sf.nom.trim())return showToast("Nom obligatoire",false);
if(!sf.prefix.trim())return showToast("Préfixe obligatoire",false);
if(!sf.type)return showToast("Type obligatoire",false);
const rec={...sf,id:editSerie||uid("SER"),seq:+sf.seq||1,pad:+sf.pad||4};
setData(p=>({...p,seriesNum:editSerie?(p.seriesNum||[]).map(s=>s.id===editSerie?rec:s):[...(p.seriesNum||[]),rec]}));
showToast("Série enregistrée ✅");
setSf({nom:"",description:"",type:"vte-facture",prefix:"",sep:"-",annee:true,seq:1,pad:4,actif:true,clientId:""});
setEditSerie(null);
};
const previewNum=(s)=>{
const sep=s.sep||"-";
const an=s.annee?new Date().getFullYear()+sep:"";
return `${s.prefix||"PFX"}${sep}${an}${String(s.seq||1).padStart(s.pad||4,"0")}`;
};
const ALL_DOC_TYPES=Object.entries(DOC_CFG).map(([k,v])=>({id:k,label:v.titre,isAchat:v.isAchat,color:v.color}));
return(
<>
<div style={{display:"flex",gap:2,marginBottom:14,background:"#f8fafc",borderRadius:8,padding:3,width:"fit-content"}}>
{[{id:"series",l:"📋 Séries de numérotation"},{id:"compteurs",l:"🔢 Compteurs standards"}].map(t=>(
<button key={t.id} onClick={()=>setTabN(t.id)}
style={{padding:"8px 18px",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,
fontWeight:tabN===t.id?700:400,background:tabN===t.id?"#fff":"transparent",
color:tabN===t.id?"#1a2332":"#64748b",
boxShadow:tabN===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",fontFamily:"inherit"}}>
{t.l}
</button>
))}
</div>

{tabN==="series"&&(
<div>
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}>
<span>➕</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>{editSerie?"Modifier":"Nouvelle"} série</span>
{editSerie&&<button style={{...S.btnSm,marginLeft:"auto"}} onClick={()=>{setEditSerie(null);setSf({nom:"",description:"",type:"vte-facture",prefix:"",sep:"-",annee:true,seq:1,pad:4,actif:true,clientId:""});}}>✕ Annuler</button>}
</div>
<div style={{padding:20}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 14px",marginBottom:12}}>
<div>
<label style={S.lbl}>Nom de la série *</label>
<input style={S.inp} value={sf.nom} onChange={e=>setSf(p=>({...p,nom:e.target.value}))} placeholder="Ex: Factures Export"/>
</div>
<div>
<label style={S.lbl}>Type de document *</label>
<select style={S.inp} value={sf.type} onChange={e=>setSf(p=>({...p,type:e.target.value}))}>
<optgroup label="── Ventes ──">
{ALL_DOC_TYPES.filter(d=>!d.isAchat).map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
</optgroup>
<optgroup label="── Achats ──">
{ALL_DOC_TYPES.filter(d=>d.isAchat).map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
</optgroup>
</select>
</div>
<div>
<label style={S.lbl}>Client (optionnel)</label>
<select style={S.inp} value={sf.clientId||""} onChange={e=>setSf(p=>({...p,clientId:e.target.value}))}>
<option value="">Tous les clients</option>
{(data.clients||[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
</select>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"150px 100px 100px 100px 110px 1fr",gap:"0 10px",alignItems:"flex-end",marginBottom:12}}>
<div>
<label style={S.lbl}>Préfixe *</label>
<input style={{...S.inp,fontFamily:"monospace",fontWeight:700,textTransform:"uppercase"}}
value={sf.prefix} onChange={e=>setSf(p=>({...p,prefix:e.target.value.toUpperCase()}))} placeholder="FV-EXP"/>
</div>
<div>
<label style={S.lbl}>Séparateur</label>
<select style={S.inp} value={sf.sep} onChange={e=>setSf(p=>({...p,sep:e.target.value}))}>
<option value="-">Tiret -</option>
<option value="/">Barre /</option>
<option value=".">Point .</option>
<option value="">Aucun</option>
</select>
</div>
<div>
<label style={S.lbl}>Nb chiffres</label>
<select style={S.inp} value={sf.pad} onChange={e=>setSf(p=>({...p,pad:+e.target.value}))}>
{[2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
</select>
</div>
<div>
<label style={S.lbl}>Avec année</label>
<select style={S.inp} value={sf.annee?"1":"0"} onChange={e=>setSf(p=>({...p,annee:e.target.value==="1"}))}>
<option value="1">Oui</option>
<option value="0">Non</option>
</select>
</div>
<div>
<label style={S.lbl}>Départ compteur</label>
<input type="number" min="1" style={{...S.inp,textAlign:"center",fontWeight:700}} value={sf.seq} onChange={e=>setSf(p=>({...p,seq:+e.target.value||1}))}/>
</div>
<div>
<label style={S.lbl}>Aperçu</label>
<div style={{...S.inp,fontFamily:"monospace",fontWeight:800,color:DOC_CFG[sf.type]?.color||"#1a56db",background:"#f8fafc"}}>
{previewNum(sf)}
</div>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"0 10px",alignItems:"flex-end"}}>
<div>
<label style={S.lbl}>Description</label>
<input style={S.inp} value={sf.description||""} onChange={e=>setSf(p=>({...p,description:e.target.value}))} placeholder="Ex: Série pour clients export..."/>
</div>
<button style={{...S.btnP,background:DOC_CFG[sf.type]?.color||"#1a56db",whiteSpace:"nowrap"}} onClick={saveSerie}>
{editSerie?"✓ Modifier":"+ Créer la série"}
</button>
</div>
</div>
</div>
<div style={S.card}>
<div style={S.hdr}>
<span>📋</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Séries créées</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{series.length}</span>
</div>
{series.length===0?(
<div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>
<div style={{fontSize:40,marginBottom:8}}>📋</div>
<div style={{fontWeight:600,marginBottom:4}}>Aucune série créée</div>
<div style={{fontSize:12}}>Créez des séries pour avoir des numérotations distinctes par type de document, client ou agence.</div>
</div>
):(
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Nom","Type","Client","Préfixe","Compteur","Prochain N°","Actif","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{series.map(s=>{
const cfg2=DOC_CFG[s.type];
const client=(data.clients||[]).find(c=>c.id===s.clientId);
return(<tr key={s.id}>
<td style={S.td}><div style={{fontWeight:700}}>{s.nom}</div>{s.description&&<div style={{fontSize:10,color:"#94a3b8"}}>{s.description}</div>}</td>
<td style={S.td}><span style={{...S.badge,background:(cfg2?.color||"#94a3b8")+"18",color:cfg2?.color||"#64748b"}}>{cfg2?.titre||s.type}</span></td>
<td style={S.td}>{client?<span style={{...S.badge,background:"#eef2ff",color:"#1a56db"}}>{client.nom}</span>:<span style={{color:"#94a3b8",fontSize:11}}>Tous</span>}</td>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:cfg2?.color||"#1a56db"}}>{s.prefix}</td>
<td style={{...S.td,textAlign:"center",fontWeight:800,fontSize:16,color:cfg2?.color||"#1a56db"}}>{s.seq}</td>
<td style={{...S.td,fontFamily:"monospace",fontWeight:700,color:cfg2?.color||"#1a56db"}}>{previewNum(s)}</td>
<td style={S.td}>
<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
<input type="checkbox" checked={s.actif!==false}
onChange={()=>setData(p=>({...p,seriesNum:(p.seriesNum||[]).map(x=>x.id===s.id?{...x,actif:!x.actif}:x)}))}
style={{accentColor:"#16a34a"}}/>
<span style={{...S.badge,background:s.actif!==false?"#f0fdf4":"#fef2f2",color:s.actif!==false?"#16a34a":"#ef4444"}}>{s.actif!==false?"Active":"Inactive"}</span>
</label>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setEditSerie(s.id);setSf({...s});}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4}} title="Reset à 1" onClick={()=>{setData(p=>({...p,seriesNum:(p.seriesNum||[]).map(x=>x.id===s.id?{...x,seq:1}:x)}));showToast("Remis à 1");}}>🔄</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>{setData(p=>({...p,seriesNum:(p.seriesNum||[]).filter(x=>x.id!==s.id)}));showToast("Supprimé");}}>🗑</button>
</td>
</tr>);
})}
</tbody>
</table>
</div>
)}
</div>
</div>
)}

{tabN==="compteurs"&&(
<>
{groups.map(grp=>(
<div key={grp.label} style={{...S.card,marginBottom:14,overflow:"hidden"}}>
<div style={{...S.hdr,borderLeft:`4px solid ${grp.color}`,borderRadius:0}}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>{grp.label}</span></div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>{["Document","Préfixe","Compteur","Nb chiffres","Avec année","Prochain N°","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>{grp.docs.map(key=>{
const c=data.compteurs[key]||COMPTEURS_DEF[key];
if(!c)return null;
return(<tr key={key}>
<td style={S.td}><div style={{fontWeight:600}}>{c.label}</div><div style={{fontSize:10,color:"#94a3b8"}}>
{key==="client"?(data.clients||[]).length+" fiche(s)":key==="fournisseur"?(data.fournisseurs||[]).length+" fiche(s)":key==="article"?(data.articles||[]).length+" fiche(s)":(data.documents[key]||[]).length+" doc(s)"}
</div></td>
<td style={S.td}><span style={{fontFamily:"monospace",fontWeight:700,color:c.color,background:`${c.color}12`,padding:"2px 8px",borderRadius:4}}>{c.prefix}</span></td>
<td style={{...S.td,textAlign:"center",fontSize:18,fontWeight:800,color:c.color}}>{c.seq}</td>
<td style={{...S.td,textAlign:"center"}}><span style={{...S.badge,background:"#f1f5f9",color:"#64748b"}}>{c.pad||4}</span></td>
<td style={{...S.td,textAlign:"center"}}><span style={{...S.badge,background:c.annee?"#f0fdf4":"#f1f5f9",color:c.annee?"#16a34a":"#94a3b8"}}>{c.annee?"Oui":"Non"}</span></td>
<td style={S.td}><span style={{fontFamily:"monospace",fontWeight:700,color:c.color,fontSize:12}}>{genNum(c)}</span></td>
<td style={S.td}>
<button style={{background:"#eef2ff",color:"#1a56db",border:"none",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",marginRight:4}} onClick={()=>{setForm({...c});setModal(key);}}>Config</button>
<button style={{background:"#fef2f2",color:"#dc2626",border:"none",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit"}} onClick={()=>{setData(p=>({...p,compteurs:{...p.compteurs,[key]:{...p.compteurs[key],seq:1}}}));showToast("Remis à 1");}}>Reset</button>
</td>
</tr>);
})}</tbody>
</table>
</div>
</div>
))}
{modal&&<Modal title="Configurer compteur" onClose={()=>setModal(null)}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<Fld label="Préfixe" required><input style={{...S.inp,fontFamily:"monospace",fontWeight:700}} value={form.prefix||""} onChange={e=>setForm(p=>({...p,prefix:e.target.value}))}/></Fld>
<Fld label="Séparateur"><select style={S.inp} value={form.sep||"-"} onChange={e=>setForm(p=>({...p,sep:e.target.value}))}><option value="-">Tiret</option><option value="/">Barre</option><option value=".">Point</option><option value="">Aucun</option></select></Fld>
<Fld label="Compteur de départ" required><input type="number" min="1" style={{...S.inp,textAlign:"center",fontSize:16,fontWeight:700}} value={form.seq||1} onChange={e=>setForm(p=>({...p,seq:Math.max(1,+e.target.value||1)}))}/></Fld>
<Fld label="Nb chiffres"><select style={S.inp} value={form.pad||4} onChange={e=>setForm(p=>({...p,pad:+e.target.value}))}>{[2,3,4,5,6].map(n=><option key={n} value={n}>{n} — {String(form.seq||1).padStart(n,"0")}</option>)}</select></Fld>
</div>
<Fld label="Inclure l'année">
<div style={{display:"flex",gap:10}}>
{[{v:true,l:"Oui"},{v:false,l:"Non"}].map(o=>(
<label key={String(o.v)} style={{flex:1,display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 12px",border:`1.5px solid ${form.annee===o.v?"#1a56db":"#d1d9e0"}`,borderRadius:7,background:form.annee===o.v?"#eef2ff":"#fafbfc"}}>
<input type="radio" checked={form.annee===o.v} onChange={()=>setForm(p=>({...p,annee:o.v}))} style={{accentColor:"#1a56db"}}/>
<div><div style={{fontWeight:600,color:form.annee===o.v?"#1a56db":"#1a2332"}}>{o.l}</div><div style={{fontFamily:"monospace",fontSize:11,color:"#94a3b8"}}>{genNum({...form,annee:o.v})}</div></div>
</label>
))}
</div>
</Fld>
<div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,borderTop:"1px solid #f0f4f8",paddingTop:14}}>
<button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
<button style={{...S.btnP,background:DOC_CFG[modal]?.color||"#1a2332"}} onClick={save}>Enregistrer</button>
</div>
</Modal>}
</>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</>
);
}
const PLAN_COMPTABLE_MAROC=[
// CLASSE 1
{classe:"1",code:"1111",lib:"Capital social",type:"Passif",nature:"Bilan"},
{classe:"1",code:"1121",lib:"Réserve légale",type:"Passif",nature:"Bilan"},
{classe:"1",code:"1151",lib:"Résultat net en instance d'affectation",type:"Passif",nature:"Bilan"},
{classe:"1",code:"1161",lib:"Résultat net de l'exercice",type:"Passif",nature:"Bilan"},
{classe:"1",code:"1311",lib:"Emprunts obligataires",type:"Passif",nature:"Bilan"},
{classe:"1",code:"1481",lib:"Dettes de financement",type:"Passif",nature:"Bilan"},
// CLASSE 2
{classe:"2",code:"2110",lib:"Terrains",type:"Actif",nature:"Bilan"},
{classe:"2",code:"2130",lib:"Constructions",type:"Actif",nature:"Bilan"},
{classe:"2",code:"2210",lib:"Installations techniques",type:"Actif",nature:"Bilan"},
{classe:"2",code:"2340",lib:"Matériel de transport",type:"Actif",nature:"Bilan"},
{classe:"2",code:"2350",lib:"Mobilier, matériel de bureau",type:"Actif",nature:"Bilan"},
{classe:"2",code:"2380",lib:"Autres immobilisations corporelles",type:"Actif",nature:"Bilan"},
{classe:"2",code:"2420",lib:"Immobilisations en cours",type:"Actif",nature:"Bilan"},
// CLASSE 3
{classe:"3",code:"3111",lib:"Marchandises",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3121",lib:"Matières premières",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3131",lib:"Matières consommables",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3141",lib:"Produits finis",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3421",lib:"Clients",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3422",lib:"Clients - Effets à recevoir",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3424",lib:"Clients douteux",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3425",lib:"Clients - Avances et acomptes",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3441",lib:"Personnel - Avances",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3455",lib:"TVA récupérable",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3456",lib:"TVA récupérable sur charges",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3481",lib:"Charges constatées d'avance",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3511",lib:"Chèques et valeurs à encaisser",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3516",lib:"Banques",type:"Actif",nature:"Bilan"},
{classe:"3",code:"3517",lib:"Caisse",type:"Actif",nature:"Bilan"},
// CLASSE 4
{classe:"4",code:"4411",lib:"Fournisseurs",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4412",lib:"Fournisseurs - Effets à payer",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4415",lib:"Fournisseurs - Avances et acomptes",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4432",lib:"Personnel - Rémunérations dues",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4441",lib:"État - Impôts et taxes",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4455",lib:"Organismes sociaux",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4456",lib:"TVA collectée",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4458",lib:"TVA à décaisser",type:"Passif",nature:"Bilan"},
{classe:"4",code:"4481",lib:"Produits constatés d'avance",type:"Passif",nature:"Bilan"},
// CLASSE 6
{classe:"6",code:"6111",lib:"Achats de marchandises",type:"Charge",nature:"CPC"},
{classe:"6",code:"6112",lib:"Achats de matières premières",type:"Charge",nature:"CPC"},
{classe:"6",code:"6113",lib:"Achats de matières consommables",type:"Charge",nature:"CPC"},
{classe:"6",code:"6131",lib:"Locations",type:"Charge",nature:"CPC"},
{classe:"6",code:"6141",lib:"Primes d'assurances",type:"Charge",nature:"CPC"},
{classe:"6",code:"6144",lib:"Entretien et réparations",type:"Charge",nature:"CPC"},
{classe:"6",code:"6161",lib:"Frais de télécommunications",type:"Charge",nature:"CPC"},
{classe:"6",code:"6165",lib:"Frais de transport",type:"Charge",nature:"CPC"},
{classe:"6",code:"6171",lib:"Frais de personnel",type:"Charge",nature:"CPC"},
{classe:"6",code:"6193",lib:"Impôts et taxes",type:"Charge",nature:"CPC"},
{classe:"6",code:"6300",lib:"Charges financières",type:"Charge",nature:"CPC"},
// CLASSE 7
{classe:"7",code:"7111",lib:"Ventes de marchandises",type:"Produit",nature:"CPC"},
{classe:"7",code:"7112",lib:"Ventes de produits finis",type:"Produit",nature:"CPC"},
{classe:"7",code:"7113",lib:"Ventes de travaux",type:"Produit",nature:"CPC"},
{classe:"7",code:"7114",lib:"Ventes de services",type:"Produit",nature:"CPC"},
{classe:"7",code:"7120",lib:"Variation de stocks produits finis",type:"Produit",nature:"CPC"},
{classe:"7",code:"7193",lib:"Reprises d'exploitation",type:"Produit",nature:"CPC"},
{classe:"7",code:"7300",lib:"Produits financiers",type:"Produit",nature:"CPC"},
];
const CLASSE_COLORS={"1":"#7c3aed","2":"#0891b2","3":"#16a34a","4":"#dc2626","6":"#d97706","7":"#1a56db"};
const CLASSE_LABELS={"1":"Comptes de financement permanent","2":"Comptes d'actif immobilisé","3":"Comptes d'actif circulant","4":"Comptes de passif circulant","6":"Comptes de charges","7":"Comptes de produits"};

const FONCTIONS_DEF=[
{id:"commercial",    label:"Commercial",         icon:"💼", color:"#1a56db"},
{id:"acheteur",      label:"Acheteur",           icon:"🛒", color:"#d97706"},
{id:"magasinier",    label:"Magasinier",         icon:"📦", color:"#059669"},
{id:"comptable",     label:"Comptable",          icon:"🧾", color:"#7c3aed"},
{id:"chauffeur",     label:"Chauffeur",          icon:"🚚", color:"#0891b2"},
{id:"technicien",    label:"Technicien",         icon:"🔧", color:"#dc2626"},
{id:"administratif", label:"Administratif",      icon:"📋", color:"#64748b"},
{id:"directeur",     label:"Directeur",          icon:"👔", color:"#1a2332"},
{id:"autre",         label:"Autre",              icon:"👤", color:"#94a3b8"},
];

function CommerciauxModule({data,setData}){
const [view,setView]=useState("list");
const [editId,setEditId]=useState(null);
const [search,setSearch]=useState("");
const [filtreFunc,setFiltreFunc]=useState("");
const [filtreAgence,setFiltreAgence]=useState("");
const [tab,setTab]=useState("infos"); // infos|perf|zones
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};

const commerciaux=data.commerciaux||[];
const EMPTY={nom:"",prenom:"",tel:"",mobile:"",email:"",fonction:"commercial",
agenceId:"",objectifCA:0,tauxCommission:0,actif:true,notes:"",
cin:"",dateEntree:"",zones:[],responsable:""};
const [form,setForm]=useState({...EMPTY});
const upd=(k,v)=>setForm(p=>({...p,[k]:v}));

const openEdit=(c)=>{setForm({...EMPTY,...c});setEditId(c.id);setTab("infos");setView("form");};
const openNew=()=>{setForm({...EMPTY});setEditId(null);setTab("infos");setView("form");};

const save=()=>{
if(!form.nom.trim())return showToast("Nom obligatoire",false);
const rec={...form,id:editId||uid("COM"),
nom:form.nom.trim(),prenom:form.prenom?.trim()||"",
objectifCA:+form.objectifCA||0,tauxCommission:+form.tauxCommission||0};
setData(p=>({...p,commerciaux:editId
?(p.commerciaux||[]).map(c=>c.id===editId?rec:c)
:[...(p.commerciaux||[]),rec]}));
showToast(`${rec.prenom?rec.prenom+" ":""}"${rec.nom}" enregistré ✅`);
setView("list");setEditId(null);
};

const del=(id)=>{
setData(p=>({...p,commerciaux:(p.commerciaux||[]).filter(c=>c.id!==id)}));
showToast("Supprimé");
};

// Calcul CA par commercial sur les factures ventes validées
const getCACommercial=(comId)=>{
return(data.documents?.["vte-facture"]||[])
.filter(d=>d.commercialId===comId&&STATUTS_STOCK.includes(d.statut))
.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ttc,0);
};

// Filtres liste
const filtered=commerciaux.filter(c=>{
if(filtreFunc&&c.fonction!==filtreFunc)return false;
if(filtreAgence&&c.agenceId!==filtreAgence)return false;
if(search){const s=search.toLowerCase();
return c.nom?.toLowerCase().includes(s)||c.prenom?.toLowerCase().includes(s)||c.email?.toLowerCase().includes(s);}
return true;
});

const fonctionDef=(f)=>FONCTIONS_DEF.find(x=>x.id===f)||FONCTIONS_DEF[FONCTIONS_DEF.length-1];

if(view==="form")return(
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontSize:20}}>👔</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>
{editId?"Modifier":"Nouveau"} collaborateur
</span>
<button style={{...S.btnS,marginLeft:"auto"}} onClick={()=>setView("list")}>← Retour</button>
<button style={S.btnP} onClick={save}>💾 Enregistrer</button>
</div>

{/* Onglets formulaire */}
<div style={{display:"flex",gap:2,padding:"8px 16px",background:"#f8fafc",borderBottom:"1px solid #f0f4f8"}}>
{[{id:"infos",l:"👤 Informations"},{id:"perf",l:"📈 Objectifs & Commissions"},{id:"zones",l:"🗺️ Zones & Agences"}].map(t=>(
<button key={t.id} onClick={()=>setTab(t.id)}
style={{padding:"6px 14px",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,
fontWeight:tab===t.id?700:400,background:tab===t.id?"#fff":"transparent",
color:tab===t.id?"#1a2332":"#64748b",
boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",fontFamily:"inherit"}}>
{t.l}
</button>
))}
</div>

<div style={{padding:20}}>
{tab==="infos"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
<Fld label="Prénom"><input style={S.inp} value={form.prenom||""} onChange={e=>upd("prenom",e.target.value)} autoFocus placeholder="Ahmed"/></Fld>
<Fld label="Nom *"><input style={S.inp} value={form.nom||""} onChange={e=>upd("nom",e.target.value)} placeholder="Bennani"/></Fld>
<Fld label="Fonction">
<select style={S.inp} value={form.fonction||"commercial"} onChange={e=>upd("fonction",e.target.value)}>
{FONCTIONS_DEF.map(f=><option key={f.id} value={f.id}>{f.icon} {f.label}</option>)}
</select>
</Fld>
<Fld label="Agence affectée">
<select style={S.inp} value={form.agenceId||""} onChange={e=>upd("agenceId",e.target.value)}>
<option value="">-- Aucune --</option>
{(data.agences||[]).map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
</select>
</Fld>
<Fld label="Téléphone fixe"><input style={S.inp} value={form.tel||""} onChange={e=>upd("tel",e.target.value)} placeholder="05XX-XXXXXX"/></Fld>
<Fld label="Mobile"><input style={S.inp} value={form.mobile||""} onChange={e=>upd("mobile",e.target.value)} placeholder="06XX-XXXXXX"/></Fld>
<Fld label="Email" full><input type="email" style={S.inp} value={form.email||""} onChange={e=>upd("email",e.target.value)} placeholder="ahmed@exemple.com"/></Fld>
<Fld label="CIN"><input style={{...S.inp,fontFamily:"monospace",fontWeight:700,textTransform:"uppercase"}} value={form.cin||""} onChange={e=>upd("cin",e.target.value.toUpperCase())} placeholder="AB123456"/></Fld>
<Fld label="Date d'entrée"><input type="date" style={S.inp} value={form.dateEntree||""} onChange={e=>upd("dateEntree",e.target.value)}/></Fld>
<Fld label="Responsable">
<select style={S.inp} value={form.responsable||""} onChange={e=>upd("responsable",e.target.value)}>
<option value="">-- Aucun --</option>
{commerciaux.filter(c=>c.id!==editId).map(c=><option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
</select>
</Fld>
<Fld label="Statut" full>
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
<input type="checkbox" checked={form.actif!==false} onChange={e=>upd("actif",e.target.checked)} style={{accentColor:"#16a34a",width:16,height:16}}/>
<span style={{fontWeight:600,color:form.actif!==false?"#16a34a":"#dc2626"}}>{form.actif!==false?"Actif":"Inactif"}</span>
</label>
</Fld>
<Fld label="Notes" full>
<textarea style={{...S.inp,minHeight:70,resize:"vertical"}} value={form.notes||""} onChange={e=>upd("notes",e.target.value)} placeholder="Observations..."/>
</Fld>
</div>
)}

{tab==="perf"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
<Fld label="Objectif CA mensuel (DH)">
<input type="number" min="0" step="100" style={{...S.inp,textAlign:"right",fontFamily:"monospace",fontWeight:700}} value={form.objectifCA||""} onChange={e=>upd("objectifCA",e.target.value)} placeholder="0"/>
</Fld>
<Fld label="Taux de commission (%)">
<input type="number" min="0" max="100" step="0.1" style={{...S.inp,textAlign:"right",fontFamily:"monospace",fontWeight:700}} value={form.tauxCommission||""} onChange={e=>upd("tauxCommission",e.target.value)} placeholder="0"/>
</Fld>
{editId&&(()=>{
const ca=getCACommercial(editId);
const commission=ca*(+form.tauxCommission||0)/100;
const pct=form.objectifCA>0?(ca/form.objectifCA*100):0;
return(
<div style={{gridColumn:"1/-1",marginTop:8}}>
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:16}}>
<div style={{fontWeight:700,fontSize:13,marginBottom:12,color:"#1a2332"}}>📊 Performance actuelle</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
{[
{l:"CA réalisé",v:fmt(ca)+" DH",c:"#1a56db"},
{l:"Commission",v:fmt(commission)+" DH",c:"#7c3aed"},
{l:"Objectif atteint",v:pct.toFixed(1)+"%",c:pct>=100?"#16a34a":pct>=70?"#d97706":"#dc2626"},
].map(k=>(
<div key={k.l} style={{background:k.c+"10",borderLeft:"3px solid "+k.c,borderRadius:6,padding:"8px 12px"}}>
<div style={{fontWeight:800,fontSize:16,color:k.c}}>{k.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{k.l}</div>
</div>
))}
</div>
{form.objectifCA>0&&(
<div style={{marginTop:12}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:4}}>
<span>Progression</span><span style={{fontWeight:700,color:pct>=100?"#16a34a":"#d97706"}}>{pct.toFixed(1)}%</span>
</div>
<div style={{background:"#e2e8f0",borderRadius:4,height:8}}>
<div style={{width:Math.min(pct,100)+"%",height:"100%",background:pct>=100?"#16a34a":pct>=70?"#d97706":"#dc2626",borderRadius:4,transition:"width .3s"}}/>
</div>
</div>
)}
</div>
</div>
);
})()}
</div>
)}

{tab==="zones"&&(
<div>
<Fld label="Zones de vente / secteurs">
<input style={S.inp} value={(form.zones||[]).join(", ")} onChange={e=>upd("zones",e.target.value.split(",").map(z=>z.trim()).filter(Boolean))} placeholder="Casablanca, Rabat, Marrakech..."/>
<div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Séparez les zones par des virgules</div>
</Fld>
{(form.zones||[]).length>0&&(
<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
{(form.zones||[]).map((z,i)=>(
<span key={i} style={{...S.badge,background:"#eef2ff",color:"#1a56db",cursor:"pointer"}} onClick={()=>upd("zones",(form.zones||[]).filter((_,j)=>j!==i))}>
{z} ✕
</span>
))}
</div>
)}
<div style={{marginTop:20,padding:14,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8}}>
<div style={{fontWeight:700,fontSize:12,marginBottom:8,color:"#1a2332"}}>🏢 Clients affectés à ce commercial</div>
{(data.clients||[]).filter(c=>c.commercialId===editId).length===0
?<div style={{color:"#94a3b8",fontSize:12}}>Aucun client affecté — affectez via la fiche client</div>
:(data.clients||[]).filter(c=>c.commercialId===editId).map(c=>(
<div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #f0f4f8",fontSize:12}}>
<span style={{fontWeight:600}}>{c.nom}</span>
<span style={{color:"#94a3b8"}}>{c.ville||""}</span>
</div>
))}
</div>
</div>
)}
</div>
</div>
);

// ── LISTE ─────────────────────────────────────────────────
return(
<div>
{/* En-tête */}
<div style={{...S.card,marginBottom:12}}>
<div style={S.hdr}>
<span style={{fontSize:20}}>👔</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Commerciaux & Collaborateurs</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{commerciaux.length}</span>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<input placeholder="🔍 Recherche..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:160}}/>
<select style={{...S.inp,width:150}} value={filtreFunc} onChange={e=>setFiltreFunc(e.target.value)}>
<option value="">Toutes fonctions</option>
{FONCTIONS_DEF.map(f=><option key={f.id} value={f.id}>{f.icon} {f.label}</option>)}
</select>
<select style={{...S.inp,width:140}} value={filtreAgence} onChange={e=>setFiltreAgence(e.target.value)}>
<option value="">Toutes agences</option>
{(data.agences||[]).map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
</select>
<button style={S.btnP} onClick={openNew}>+ Nouveau</button>
</div>
</div>
</div>

{/* Cartes + Tableau */}
{filtered.length===0?(
<div style={{...S.card,textAlign:"center",padding:40,color:"#94a3b8"}}>
<div style={{fontSize:48,marginBottom:8}}>👔</div>
<div style={{fontWeight:700,fontSize:15,color:"#1a2332",marginBottom:6}}>Aucun collaborateur</div>
<div style={{fontSize:13,marginBottom:16}}>Créez votre équipe commerciale et de collaborateurs</div>
<button style={S.btnP} onClick={openNew}>+ Ajouter le premier collaborateur</button>
</div>
):(
<>
{/* Cartes résumé */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:14}}>
{filtered.map(c=>{
const fd=fonctionDef(c.fonction);
const ca=getCACommercial(c.id);
const pct=c.objectifCA>0?(ca/c.objectifCA*100):null;
const agence=(data.agences||[]).find(a=>a.id===c.agenceId);
return(
<div key={c.id}
onDoubleClick={()=>openEdit(c)}
style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"box-shadow .15s"}}
onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.1)"}
onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
{/* Header carte */}
<div style={{background:fd.color,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
<div style={{width:40,height:40,background:"rgba(255,255,255,.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
{fd.icon}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontWeight:800,color:"#fff",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
{c.prenom?c.prenom+" ":""}{c.nom}
</div>
<div style={{fontSize:10,color:"rgba(255,255,255,.8)"}}>{fd.label}</div>
</div>
<span style={{...S.badge,background:c.actif!==false?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)",color:"#fff",fontSize:9,flexShrink:0}}>
{c.actif!==false?"Actif":"Inactif"}
</span>
</div>
{/* Body carte */}
<div style={{padding:"10px 14px"}}>
{c.mobile&&<div style={{fontSize:12,color:"#64748b",marginBottom:3}}>📱 {c.mobile}</div>}
{c.email&&<div style={{fontSize:11,color:"#1a56db",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>✉️ {c.email}</div>}
{agence&&<div style={{fontSize:11,color:"#7c3aed",marginBottom:4}}>🏢 {agence.nom}</div>}
{(c.zones||[]).length>0&&<div style={{fontSize:10,color:"#94a3b8",marginBottom:4}}>🗺️ {c.zones.join(", ")}</div>}
{/* Barre objectif */}
{ca>0&&(
<div style={{marginTop:6,paddingTop:6,borderTop:"1px solid #f0f4f8"}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#64748b",marginBottom:3}}>
<span>CA : <strong style={{color:fd.color}}>{fmt(ca)} DH</strong></span>
{pct!==null&&<span style={{color:pct>=100?"#16a34a":"#d97706",fontWeight:700}}>{pct.toFixed(0)}%</span>}
</div>
{pct!==null&&(
<div style={{background:"#f1f5f9",borderRadius:3,height:4}}>
<div style={{width:Math.min(pct,100)+"%",height:"100%",background:pct>=100?"#16a34a":pct>=70?"#d97706":"#dc2626",borderRadius:3}}/>
</div>
)}
</div>
)}
</div>
{/* Footer carte */}
<div style={{padding:"6px 14px",borderTop:"1px solid #f0f4f8",display:"flex",gap:6,justifyContent:"flex-end"}}>
<button style={S.btnSm} onClick={e=>{e.stopPropagation();openEdit(c);}}>✏️ Modifier</button>
<button style={{...S.btnSm,color:"#dc2626"}} onClick={e=>{e.stopPropagation();if(window.confirm("Supprimer ?"))del(c.id);}}>🗑</button>
</div>
</div>
);
})}
</div>

{/* Tableau récapitulatif */}
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:700,fontSize:13}}>📊 Récapitulatif</span></div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Nom","Fonction","Tel / Mobile","Email","Agence","CA réalisé","Objectif","Commission","Statut"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{filtered.map(c=>{
const fd=fonctionDef(c.fonction);
const ca=getCACommercial(c.id);
const commission=ca*(+c.tauxCommission||0)/100;
const pct=c.objectifCA>0?(ca/c.objectifCA*100):null;
const agence=(data.agences||[]).find(a=>a.id===c.agenceId);
return(
<tr key={c.id} onDoubleClick={()=>openEdit(c)} style={{cursor:"pointer"}}
onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"}
onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={S.td}>
<div style={{fontWeight:700}}>{c.prenom?c.prenom+" ":""}{c.nom}</div>
{c.cin&&<div style={{fontSize:10,fontFamily:"monospace",color:"#94a3b8"}}>{c.cin}</div>}
</td>
<td style={S.td}><span style={{...S.badge,background:fd.color+"18",color:fd.color}}>{fd.icon} {fd.label}</span></td>
<td style={S.td}>
{c.mobile&&<div style={{fontSize:12}}>{c.mobile}</div>}
{c.tel&&<div style={{fontSize:11,color:"#94a3b8"}}>{c.tel}</div>}
</td>
<td style={{...S.td,fontSize:11,color:"#1a56db"}}>{c.email||"--"}</td>
<td style={S.td}>{agence?<span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed"}}>{agence.nom}</span>:"--"}</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",fontWeight:700,color:"#1a56db"}}>
{ca>0?fmt(ca)+" DH":"--"}
</td>
<td style={S.td}>
{c.objectifCA>0?(
<div>
<div style={{fontSize:11,fontFamily:"monospace"}}>{fmt(c.objectifCA)} DH</div>
{pct!==null&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
<div style={{width:60,background:"#f1f5f9",borderRadius:2,height:4}}>
<div style={{width:Math.min(pct,100)+"%",height:"100%",background:pct>=100?"#16a34a":pct>=70?"#d97706":"#dc2626",borderRadius:2}}/>
</div>
<span style={{fontSize:9,color:pct>=100?"#16a34a":"#d97706",fontWeight:700}}>{pct.toFixed(0)}%</span>
</div>}
</div>
):"--"}
</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#7c3aed"}}>
{c.tauxCommission>0?<span>{c.tauxCommission}% = <strong>{fmt(commission)} DH</strong></span>:"--"}
</td>
<td style={S.td}><span style={{...S.badge,background:c.actif!==false?"#f0fdf4":"#fef2f2",color:c.actif!==false?"#16a34a":"#ef4444"}}>{c.actif!==false?"Actif":"Inactif"}</span></td>
</tr>
);
})}
</tbody>
{filtered.length>0&&(
<tfoot>
<tr style={{background:"#f8fafc",fontWeight:700}}>
<td colSpan={5} style={{...S.td,color:"#64748b"}}>{filtered.length} collaborateur(s)</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#1a56db",fontWeight:800}}>
{fmt(filtered.reduce((s,c)=>s+getCACommercial(c.id),0))} DH
</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#64748b"}}>
{fmt(filtered.reduce((s,c)=>s+(+c.objectifCA||0),0))} DH
</td>
<td style={{...S.td,textAlign:"right",fontFamily:"monospace",color:"#7c3aed",fontWeight:800}}>
{fmt(filtered.reduce((s,c)=>{const ca=getCACommercial(c.id);return s+ca*(+c.tauxCommission||0)/100;},0))} DH
</td>
<td style={S.td}></td>
</tr>
</tfoot>
)}
</table>
</div>
</div>
</>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

function TvaAdminModule({data,setData}){
const EMPTY={taux:"",label:"",actif:true};
const [form,setForm]=useState({...EMPTY});
const [edit,setEdit]=useState(null);
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const taux=data.tauxTVA||[];

const save=()=>{
if(form.taux===""||isNaN(+form.taux))return showToast("Taux invalide",false);
if(!form.label.trim())return showToast("Libellé obligatoire",false);
// Vérifier doublon
const existing=taux.find(t=>+t.taux===+form.taux&&t.id!==edit);
if(existing)return showToast(`Le taux ${form.taux}% existe déjà (${existing.label})`,false);
const rec={id:edit||uid("TVA"),taux:+form.taux,label:form.label.trim(),actif:form.actif!==false};
setData(p=>({...p,tauxTVA:edit
?(p.tauxTVA||[]).map(t=>t.id===edit?rec:t)
:[...(p.tauxTVA||[]),rec]}));
showToast(`Taux ${rec.taux}% enregistré ✅`);
setForm({...EMPTY});setEdit(null);
};

const del=(id)=>{
const tauval=taux.find(t=>t.id===id)?.taux;
const used=(data.articles||[]).some(a=>+a.tva===+tauval);
if(used)return showToast(`Ce taux est utilisé dans des articles — impossible de supprimer`,false);
setData(p=>({...p,tauxTVA:(p.tauxTVA||[]).filter(t=>t.id!==id)}));
showToast("Taux supprimé");
};

const toggle=(id)=>{
setData(p=>({...p,tauxTVA:(p.tauxTVA||[]).map(t=>t.id===id?{...t,actif:!t.actif}:t)}));
};

return(
<div>
{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
{[
{l:"Taux configurés",v:taux.length,c:"#1a56db"},
{l:"Taux actifs",v:taux.filter(t=>t.actif!==false).length,c:"#16a34a"},
{l:"Taux inactifs",v:taux.filter(t=>t.actif===false).length,c:"#94a3b8"},
].map(k=>(
<div key={k.l} style={{background:k.c+"10",borderLeft:"4px solid "+k.c,borderRadius:8,padding:"10px 14px"}}>
<div style={{fontWeight:800,fontSize:20,color:k.c}}>{k.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{k.l}</div>
</div>
))}
</div>

{/* Formulaire ajout / modification */}
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}>
<span style={{fontSize:18}}>💹</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>
{edit?"Modifier le taux":"Ajouter un taux TVA"}
</span>
{edit&&<button style={{...S.btnSm,marginLeft:"auto"}} onClick={()=>{setEdit(null);setForm({...EMPTY});}}>✕ Annuler</button>}
</div>
<div style={{padding:20}}>
<div style={{display:"grid",gridTemplateColumns:"130px 1fr 140px",gap:"0 14px",alignItems:"flex-end",marginBottom:14}}>
<div>
<label style={S.lbl}>Taux (%) *</label>
<input type="number" min="0" max="100" step="0.01"
style={{...S.inp,textAlign:"right",fontWeight:800,fontSize:18,color:"#1a56db"}}
value={form.taux}
onChange={e=>setForm(p=>({...p,taux:e.target.value}))}
placeholder="0"
autoFocus={!edit}/>
</div>
<div>
<label style={S.lbl}>Libellé *</label>
<input style={S.inp} value={form.label}
onChange={e=>setForm(p=>({...p,label:e.target.value}))}
placeholder="Ex: Taux normal (20%), Taux réduit (7%)..."
onKeyDown={e=>e.key==="Enter"&&save()}/>
</div>
<div>
<label style={S.lbl}>Statut</label>
<select style={S.inp} value={form.actif?"1":"0"}
onChange={e=>setForm(p=>({...p,actif:e.target.value==="1"}))}>
<option value="1">Actif</option>
<option value="0">Inactif</option>
</select>
</div>
</div>
<div style={{display:"flex",justifyContent:"flex-end"}}>
<button style={S.btnP} onClick={save}>{edit?"✓ Modifier":"+ Ajouter ce taux"}</button>
</div>
</div>
</div>

{/* Cartes aperçu rapide */}
<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
{[...taux].sort((a,b)=>a.taux-b.taux).map(t=>(
<div key={t.id} style={{
background:t.actif!==false?"#1a56db":"#e2e8f0",
color:"#fff",borderRadius:10,padding:"10px 18px",
textAlign:"center",cursor:"pointer",opacity:t.actif!==false?1:0.6,
minWidth:90,
}}
onClick={()=>{setEdit(t.id);setForm({taux:t.taux,label:t.label,actif:t.actif!==false});}}>
<div style={{fontWeight:900,fontSize:22}}>{t.taux}%</div>
<div style={{fontSize:10,opacity:.8,marginTop:2}}>{t.actif!==false?"Actif":"Inactif"}</div>
</div>
))}
<div style={{
background:"#f1f5f9",borderRadius:10,padding:"10px 18px",
textAlign:"center",cursor:"pointer",minWidth:90,
border:"2px dashed #cbd5e1",color:"#94a3b8",
display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"
}}
onClick={()=>{setEdit(null);setForm({...EMPTY});document.querySelector('input[type="number"]')?.focus();}}>
<div style={{fontSize:22,fontWeight:900}}>+</div>
<div style={{fontSize:10}}>Nouveau</div>
</div>
</div>

{/* Tableau complet */}
<div style={S.card}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>Tous les taux</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{taux.length}</span>
</div>
{taux.length===0?(
<div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>
<div style={{fontSize:40,marginBottom:8}}>💹</div>
<div style={{fontWeight:600}}>Aucun taux configuré</div>
</div>
):(
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Taux %","Libellé","Utilisé dans","Statut","Actions"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{[...taux].sort((a,b)=>a.taux-b.taux).map(t=>{
const nbArticles=(data.articles||[]).filter(a=>+a.tva===+t.taux).length;
return(
<tr key={t.id}
onDoubleClick={()=>{setEdit(t.id);setForm({taux:t.taux,label:t.label,actif:t.actif!==false});}}
style={{cursor:"pointer"}}
onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"}
onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{...S.td,textAlign:"center"}}>
<span style={{
fontWeight:900,fontSize:20,
color:t.actif!==false?"#1a56db":"#94a3b8",
background:(t.actif!==false?"#1a56db":"#94a3b8")+"15",
padding:"4px 14px",borderRadius:20,display:"inline-block"
}}>{t.taux}%</span>
</td>
<td style={S.td}><span style={{fontWeight:600}}>{t.label}</span></td>
<td style={S.td}>
{nbArticles>0
?<span style={{...S.badge,background:"#eef2ff",color:"#1a56db"}}>{nbArticles} article(s)</span>
:<span style={{color:"#94a3b8",fontSize:11}}>Non utilisé</span>}
</td>
<td style={S.td}>
<label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
<input type="checkbox" checked={t.actif!==false}
onChange={()=>toggle(t.id)}
style={{accentColor:"#16a34a",width:15,height:15}}/>
<span style={{...S.badge,
background:t.actif!==false?"#f0fdf4":"#fef2f2",
color:t.actif!==false?"#16a34a":"#ef4444",
fontWeight:700}}>
{t.actif!==false?"Actif":"Inactif"}
</span>
</label>
</td>
<td style={S.td}>
<button style={S.btnSm}
onClick={()=>{setEdit(t.id);setForm({taux:t.taux,label:t.label,actif:t.actif!==false});}}>
✏️
</button>
<button style={{...S.btnSm,marginLeft:4,color:nbArticles>0?"#94a3b8":"#dc2626"}}
title={nbArticles>0?"Utilisé dans des articles":"Supprimer"}
onClick={()=>del(t.id)}>
🗑
</button>
</td>
</tr>
);
})}
</tbody>
</table>
)}
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

function PlanComptableModule({data,setData}){
const [search,setSearch]=useState("");
const [filtreClasse,setFiltreClasse]=useState("all");
const [filtreNature,setFiltreNature]=useState("all");
const [form,setForm]=useState({code:"",lib:"",type:"Actif",nature:"Bilan"});
const [edit,setEdit]=useState(null);
const [renomModal,setRenomModal]=useState(null); // {code, lib}
const [renomLib,setRenomLib]=useState("");
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};

const planPerso=data.planComptable||[];
const renames=data.planRenames||{}; // {code: nouveau_libelle}

// Fusionner plan standard + perso + renames
const planComplet=[
...PLAN_COMPTABLE_MAROC.map(c=>({...c,lib:renames[c.code]||c.lib,libOriginal:c.lib,isRenamed:!!renames[c.code]})),
...planPerso
];

const filtered=planComplet.filter(c=>{
if(filtreClasse!=="all"&&c.classe!==filtreClasse)return false;
if(filtreNature!=="all"&&c.nature!==filtreNature)return false;
if(search&&!c.code.includes(search)&&!c.lib.toLowerCase().includes(search.toLowerCase()))return false;
return true;
}).sort((a,b)=>a.code.localeCompare(b.code));

const save=()=>{
if(!form.code.trim())return showToast("Code obligatoire",false);
if(!form.lib.trim())return showToast("Libellé obligatoire",false);
if(PLAN_COMPTABLE_MAROC.find(c=>c.code===form.code)&&!edit)
return showToast("Ce code existe dans le plan standard — utilisez Renommer",false);
const rec={...form,id:edit||uid("CPT"),isCustom:true,classe:form.code[0]};
setData(p=>({...p,planComptable:edit
?(p.planComptable||[]).map(c=>c.id===edit?rec:c)
:[...(p.planComptable||[]),rec]}));
showToast("Compte enregistré ✅");
setForm({code:"",lib:"",type:"Actif",nature:"Bilan"});
setEdit(null);
};

const saveRename=()=>{
if(!renomLib.trim())return;
setData(p=>({...p,planRenames:{...(p.planRenames||{}),[renomModal.code]:renomLib.trim()}}));
showToast("Libellé modifié ✅");
setRenomModal(null);
};
const resetRename=(code)=>{
setData(p=>{const r={...(p.planRenames||{})};delete r[code];return{...p,planRenames:r};});
showToast("Libellé original restauré");
};

return(
<div>
{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
{[
{l:"Total comptes",v:planComplet.length,c:"#1a56db"},
{l:"Comptes personnalisés",v:planPerso.length,c:"#7c3aed"},
{l:"Comptes renommés",v:Object.keys(renames).length,c:"#d97706"},
{l:"Comptes CPC",v:planComplet.filter(c=>c.nature==="CPC").length,c:"#059669"},
].map(k=>(
<div key={k.l} style={{background:k.c+"12",borderLeft:"4px solid "+k.c,borderRadius:8,padding:"10px 14px"}}>
<div style={{fontWeight:800,fontSize:18,color:k.c}}>{k.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{k.l}</div>
</div>
))}
</div>

{/* Formulaire nouveau compte */}
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}><span>➕</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Ajouter un compte</span>
{edit&&<button style={{...S.btnSm,marginLeft:"auto"}} onClick={()=>{setEdit(null);setForm({code:"",lib:"",type:"Actif",nature:"Bilan"});}}>✕ Annuler</button>}
</div>
<div style={{padding:16,display:"grid",gridTemplateColumns:"110px 1fr 120px 120px auto",gap:"0 10px",alignItems:"flex-end"}}>
<div>
<label style={S.lbl}>Code *</label>
<input style={{...S.inp,fontFamily:"monospace",fontWeight:700}} value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value}))} placeholder="3429"/>
</div>
<div>
<label style={S.lbl}>Libellé *</label>
<input style={S.inp} value={form.lib} onChange={e=>setForm(p=>({...p,lib:e.target.value}))} placeholder="Clients divers"/>
</div>
<div>
<label style={S.lbl}>Type</label>
<select style={S.inp} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
{["Actif","Passif","Charge","Produit"].map(t=><option key={t}>{t}</option>)}
</select>
</div>
<div>
<label style={S.lbl}>Nature</label>
<select style={S.inp} value={form.nature} onChange={e=>setForm(p=>({...p,nature:e.target.value}))}>
{["Bilan","CPC","Hors bilan"].map(t=><option key={t}>{t}</option>)}
</select>
</div>
<button style={S.btnP} onClick={save}>{edit?"✓ Modifier":"+ Ajouter"}</button>
</div>
</div>

{/* Filtres + Liste */}
<div style={S.card}>
<div style={{padding:"10px 16px",borderBottom:"1px solid #f0f4f8",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input placeholder="🔍 Code ou libellé..." style={{...S.inp,width:200}} value={search} onChange={e=>setSearch(e.target.value)}/>
<select style={{...S.inp,width:140}} value={filtreClasse} onChange={e=>setFiltreClasse(e.target.value)}>
<option value="all">Toutes classes</option>
{["1","2","3","4","6","7"].map(c=><option key={c} value={c}>Classe {c}</option>)}
</select>
<select style={{...S.inp,width:120}} value={filtreNature} onChange={e=>setFiltreNature(e.target.value)}>
<option value="all">Toutes</option>
<option value="Bilan">Bilan</option>
<option value="CPC">CPC</option>
</select>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:"auto"}}>{filtered.length} compte(s)</span>
{search&&<button style={{...S.btnSm,color:"#dc2626"}} onClick={()=>setSearch("")}>✕</button>}
</div>

{["1","2","3","4","6","7"].filter(cl=>filtreClasse==="all"||filtreClasse===cl).map(cl=>{
const comptes=filtered.filter(c=>c.classe===cl);
if(!comptes.length)return null;
const color=CLASSE_COLORS[cl]||"#64748b";
return(
<div key={cl}>
<div style={{background:color+"12",borderLeft:`4px solid ${color}`,padding:"7px 16px",display:"flex",alignItems:"center",gap:8}}>
<span style={{fontWeight:800,color,fontSize:12}}>Classe {cl}</span>
<span style={{color:"#64748b",fontSize:11}}>{CLASSE_LABELS[cl]}</span>
<span style={{...S.badge,background:color+"20",color,marginLeft:"auto",fontSize:10}}>{comptes.length}</span>
</div>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<tbody>
{comptes.map(c=>(
<tr key={c.code||c.id} style={{borderBottom:"1px solid #f8fafc"}}>
<td style={{...S.td,width:90,fontFamily:"monospace",fontWeight:700,color}}>{c.code}</td>
<td style={S.td}>
<span style={{fontWeight:c.isRenamed?700:400}}>{c.lib}</span>
{c.isRenamed&&<span style={{...S.badge,background:"#fef9c3",color:"#854d0e",marginLeft:6,fontSize:9}}>Renommé</span>}
{c.isCustom&&<span style={{...S.badge,background:"#f5f3ff",color:"#7c3aed",marginLeft:6,fontSize:9}}>Perso</span>}
{c.isRenamed&&<div style={{fontSize:10,color:"#94a3b8"}}>Original : {c.libOriginal}</div>}
</td>
<td style={{...S.td,width:70}}><span style={{...S.badge,background:"#f1f5f9",color:"#475569",fontSize:10}}>{c.type}</span></td>
<td style={{...S.td,width:60}}><span style={{...S.badge,background:"#f1f5f9",color:"#475569",fontSize:10}}>{c.nature}</span></td>
<td style={{...S.td,width:120,textAlign:"right"}}>
{c.isCustom?(
<>
<button style={S.btnSm} onClick={()=>{setEdit(c.id);setForm({code:c.code,lib:c.lib,type:c.type,nature:c.nature});}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>{setData(p=>({...p,planComptable:(p.planComptable||[]).filter(x=>x.id!==c.id)}));showToast("Supprimé");}}>🗑</button>
</>
):(
<>
<button style={{...S.btnSm,color:"#d97706",borderColor:"#fed7aa"}} onClick={()=>{setRenomModal({code:c.code,lib:c.lib});setRenomLib(c.lib);}}>✏️ Renommer</button>
{c.isRenamed&&<button style={{...S.btnSm,marginLeft:4,color:"#64748b"}} onClick={()=>resetRename(c.code)}>↩️</button>}
</>
)}
</td>
</tr>
))}
</tbody>
</table>
</div>
);
})}
</div>

{/* Modal renommer */}
{renomModal&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:12,padding:24,width:440,boxShadow:"0 20px 60px rgba(0,0,0,.15)"}}>
<div style={{fontWeight:800,fontSize:15,marginBottom:4}}>✏️ Renommer le compte</div>
<div style={{color:"#64748b",fontSize:12,marginBottom:16}}>Code : <strong style={{fontFamily:"monospace",color:"#1a56db"}}>{renomModal.code}</strong></div>
<label style={S.lbl}>Nouveau libellé</label>
<input style={{...S.inp,marginBottom:16}} value={renomLib} onChange={e=>setRenomLib(e.target.value)} autoFocus
onKeyDown={e=>e.key==="Enter"&&saveRename()}/>
<div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>Libellé original : {renomModal.lib}</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btnS} onClick={()=>setRenomModal(null)}>Annuler</button>
<button style={S.btnP} onClick={saveRename}>✓ Enregistrer</button>
</div>
</div>
</div>
)}
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

// ── Constantes champs calculés ───────────────────────────
const DOC_TYPES_LABELS=Object.entries(DOC_CFG).map(([k,v])=>({id:k,label:v.titre,color:v.color,isAchat:v.isAchat}));
const CHAMP_ENTETE_TYPES=[
{id:"text",     label:"Texte libre"},
{id:"number",   label:"Nombre"},
{id:"date",     label:"Date"},
{id:"select",   label:"Liste de choix"},
{id:"textarea", label:"Zone de texte"},
{id:"checkbox", label:"Case à cocher"},
];

function ChampsEnteteDocModule({data,setData}){
const EMPTY={label:"",type:"text",placeholder:"",required:false,actif:true,
docTypes:[],options:"",full:false,imprimer:true,position:"entete"};
const [form,setForm]=useState({...EMPTY});
const [edit,setEdit]=useState(null);
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const champs=data.champsEnteteDoc||[];

const save=()=>{
if(!form.label.trim())return showToast("Libellé obligatoire",false);
if(form.type==="select"&&!form.options?.trim())return showToast("Options obligatoires pour une liste",false);
const rec={
...form,
id:edit||uid("CHE"),
options:form.type==="select"?(form.options||"").split("\n").map(s=>s.trim()).filter(Boolean):[],
};
setData(p=>({...p,champsEnteteDoc:edit
?(p.champsEnteteDoc||[]).map(c=>c.id===edit?rec:c)
:[...(p.champsEnteteDoc||[]),rec]}));
showToast("Champ enregistré ✅");
setForm({...EMPTY});setEdit(null);
};

const del=(id)=>{
setData(p=>({...p,champsEnteteDoc:(p.champsEnteteDoc||[]).filter(c=>c.id!==id)}));
showToast("Champ supprimé");
};

const toggleDoc=(docType)=>{
setForm(p=>({...p,docTypes:p.docTypes.includes(docType)
?p.docTypes.filter(x=>x!==docType)
:[...p.docTypes,docType]}));
};

return(
<div>
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>
{edit?"Modifier":"Nouveau"} champ d'en-tête
</span>
{edit&&<button style={{...S.btnSm,marginLeft:"auto"}} onClick={()=>{setEdit(null);setForm({...EMPTY});}}>✕ Annuler</button>}
</div>
<div style={{padding:20}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Libellé *</label>
<input style={S.inp} value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value}))} placeholder="Ex: Référence client, N° commande client..." autoFocus/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Type de champ</label>
<select style={S.inp} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
{CHAMP_ENTETE_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
</select>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Placeholder (texte indicatif)</label>
<input style={S.inp} value={form.placeholder||""} onChange={e=>setForm(p=>({...p,placeholder:e.target.value}))} placeholder="Ex: Saisir la réf commande client..."/>
</div>
<div style={{marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
<label style={S.lbl}>Options</label>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
<label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
<input type="checkbox" checked={form.required||false} onChange={e=>setForm(p=>({...p,required:e.target.checked}))} style={{accentColor:"#dc2626"}}/>
Obligatoire
</label>
<label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
<input type="checkbox" checked={form.imprimer!==false} onChange={e=>setForm(p=>({...p,imprimer:e.target.checked}))} style={{accentColor:"#16a34a"}}/>
Imprimable
</label>
<label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
<input type="checkbox" checked={form.full||false} onChange={e=>setForm(p=>({...p,full:e.target.checked}))} style={{accentColor:"#7c3aed"}}/>
Pleine largeur
</label>
<label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
<input type="checkbox" checked={form.actif!==false} onChange={e=>setForm(p=>({...p,actif:e.target.checked}))} style={{accentColor:"#0891b2"}}/>
Actif
</label>
</div>
</div>
{form.type==="select"&&(
<div style={{marginBottom:12,gridColumn:"1/-1"}}>
<label style={S.lbl}>Options de la liste (une par ligne) *</label>
<textarea rows={4} style={{...S.inp,resize:"vertical"}}
value={typeof form.options==="string"?form.options:(form.options||[]).join("\n")}
onChange={e=>setForm(p=>({...p,options:e.target.value}))}
placeholder={"Option 1\nOption 2\nOption 3"}/>
</div>
)}
</div>

{/* Sélection des types de documents */}
<div style={{marginBottom:14}}>
<label style={{...S.lbl,marginBottom:8,display:"block"}}>
Afficher sur ces documents
<span style={{color:"#94a3b8",fontWeight:400,marginLeft:6}}>
{form.docTypes.length===0?"Tous les documents":form.docTypes.length+" type(s) sélectionné(s)"}
</span>
</label>
<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
<button style={{...S.btnSm,fontSize:11,
background:form.docTypes.length===0?"#1a2332":"#fff",
color:form.docTypes.length===0?"#fff":"#64748b"}}
onClick={()=>setForm(p=>({...p,docTypes:[]}))}>
Tous
</button>
{DOC_TYPES_LABELS.map(dt=>(
<button key={dt.id}
onClick={()=>toggleDoc(dt.id)}
style={{...S.btnSm,fontSize:10,
background:form.docTypes.includes(dt.id)?(dt.color||"#1a56db"):"#fff",
color:form.docTypes.includes(dt.id)?"#fff":"#64748b",
borderColor:form.docTypes.includes(dt.id)?(dt.color||"#1a56db"):"#e2e8f0"}}>
{dt.label}
</button>
))}
</div>
</div>

<div style={{display:"flex",justifyContent:"flex-end"}}>
<button style={S.btnP} onClick={save}>{edit?"✓ Modifier":"+ Ajouter le champ"}</button>
</div>
</div>
</div>

{/* Liste des champs */}
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>Champs configurés</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{champs.length}</span>
</div>
{champs.length===0?(
<div style={{textAlign:"center",padding:28,color:"#94a3b8"}}>
<div style={{fontSize:36,marginBottom:8}}>📋</div>
<div style={{fontWeight:600,marginBottom:4}}>Aucun champ configuré</div>
<div style={{fontSize:12}}>Créez des champs pour enrichir vos documents : référence client, N° commande, lieu de livraison...</div>
</div>
):(
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Libellé","Type","Documents","Imprimable","Obligatoire","Actif","Actions"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{champs.map(c=>{
const typeDef=CHAMP_ENTETE_TYPES.find(t=>t.id===c.type);
return(
<tr key={c.id} onDoubleClick={()=>{setEdit(c.id);setForm({...c,options:Array.isArray(c.options)?c.options.join("\n"):c.options||""});}} style={{cursor:"pointer"}}
onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"}
onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={S.td}><div style={{fontWeight:700}}>{c.label}</div>{c.placeholder&&<div style={{fontSize:10,color:"#94a3b8"}}>{c.placeholder}</div>}</td>
<td style={S.td}><span style={{...S.badge,background:"#f1f5f9",color:"#475569"}}>{typeDef?.label||c.type}</span></td>
<td style={S.td}>
{!c.docTypes?.length
?<span style={{...S.badge,background:"#f1f5f9",color:"#64748b",fontSize:10}}>Tous</span>
:<div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
{c.docTypes.map(dt=>{
const d=DOC_TYPES_LABELS.find(x=>x.id===dt);
return<span key={dt} style={{...S.badge,background:(d?.color||"#94a3b8")+"18",color:d?.color||"#64748b",fontSize:9}}>{d?.label||dt}</span>;
})}
</div>}
</td>
<td style={{...S.td,textAlign:"center"}}>{c.imprimer!==false?<span style={{color:"#16a34a"}}>✅</span>:<span style={{color:"#94a3b8"}}>–</span>}</td>
<td style={{...S.td,textAlign:"center"}}>{c.required?<span style={{color:"#dc2626",fontWeight:700}}>*</span>:<span style={{color:"#94a3b8"}}>–</span>}</td>
<td style={S.td}>
<label style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
<input type="checkbox" checked={c.actif!==false}
onChange={()=>setData(p=>({...p,champsEnteteDoc:(p.champsEnteteDoc||[]).map(x=>x.id===c.id?{...x,actif:!x.actif}:x)}))}
style={{accentColor:"#16a34a"}}/>
<span style={{...S.badge,background:c.actif!==false?"#f0fdf4":"#fef2f2",color:c.actif!==false?"#16a34a":"#ef4444",fontSize:10}}>
{c.actif!==false?"Actif":"Inactif"}
</span>
</label>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setEdit(c.id);setForm({...c,options:Array.isArray(c.options)?c.options.join("\n"):c.options||""});}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(c.id)}>🗑</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

const CHAMP_VARS_LIGNE=[
{id:"qte",        label:"Quantité",            exemple:"5"},
{id:"prix",       label:"Prix unitaire HT",     exemple:"100.00"},
{id:"remise",     label:"Remise ligne %",       exemple:"10"},
{id:"tva",        label:"Taux TVA %",           exemple:"20"},
{id:"netHT",      label:"Net HT ligne",         exemple:"90.00"},
{id:"montantTVA", label:"Montant TVA ligne",    exemple:"18.00"},
{id:"ttcLigne",   label:"TTC ligne",            exemple:"108.00"},
{id:"prixAchat",  label:"Prix achat article",   exemple:"60.00"},
{id:"margeHT",    label:"Marge HT",             exemple:"30.00"},
{id:"pctMarge",   label:"% Marge",              exemple:"33.33"},
];
const CHAMP_VARS_ENTETE=[
{id:"totalBrut",   label:"Total brut HT",       exemple:"500.00"},
{id:"totalRemise", label:"Total remises",        exemple:"50.00"},
{id:"baseHT",      label:"Base HT",             exemple:"450.00"},
{id:"remiseGlob",  label:"Remise globale %",    exemple:"5"},
{id:"totalTVA",    label:"Total TVA",           exemple:"90.00"},
{id:"totalTTC",    label:"Total TTC",           exemple:"540.00"},
{id:"nbLignes",    label:"Nb lignes",           exemple:"3"},
{id:"nbArticles",  label:"Nb articles distincts",exemple:"2"},
{id:"dateDoc",     label:"Date document",       exemple:"2026-04-28"},
{id:"nbJoursEch",  label:"Nb jours échéance",   exemple:"30"},
];
const CHAMP_TYPES=[
{id:"nombre",  label:"Nombre",     icon:"🔢"},
{id:"texte",   label:"Texte",      icon:"📝"},
{id:"date",    label:"Date",       icon:"📅"},
{id:"booleen", label:"Oui / Non",  icon:"☑️"},
{id:"formule", label:"Formule JS", icon:"🧮"},
];

function evalFormule(formule, ctx){
try{
const fn=new Function(...Object.keys(ctx),"return "+formule);
const result=fn(...Object.values(ctx));
return isNaN(result)?result:(+result).toFixed(2);
}catch(e){return "ERR";}
}

function ChampCalcModule({data,setData}){
const [tab,setTab]=useState("ligne");
const [form,setForm]=useState({nom:"",type:"nombre",formule:"",portee:"ligne",actif:true,afficherDoc:true,afficherListe:false,format:"",unite:"",description:""});
const [edit,setEdit]=useState(null);
const [test,setTest]=useState({qte:5,prix:100,remise:10,tva:20});
const [toast,setToast]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),2500);};
const champs=(data.champsCalcules||[]).filter(c=>c.portee===(tab==="ligne"?"ligne":"entete"));

const FORMULES_PREDEFINIES_LIGNE=[
{nom:"Marge brute HT",  formule:"(prix - prixAchat) * qte * (1 - remise/100)"},
{nom:"% Marge",         formule:"prixAchat > 0 ? ((prix - prixAchat) / prix * 100) : 0"},
{nom:"Net HT",          formule:"qte * prix * (1 - remise/100)"},
{nom:"Montant TVA",     formule:"qte * prix * (1 - remise/100) * tva/100"},
{nom:"TTC ligne",       formule:"qte * prix * (1 - remise/100) * (1 + tva/100)"},
{nom:"Prix revient",    formule:"prixAchat * qte"},
{nom:"Coeff. vente",    formule:"prixAchat > 0 ? (prix / prixAchat) : 0"},
{nom:"Remise montant",  formule:"qte * prix * remise/100"},
];
const FORMULES_PREDEFINIES_ENTETE=[
{nom:"Marge globale HT",formule:"baseHT - totalBrut * 0.6"},
{nom:"TVA 20%",         formule:"baseHT * 0.20"},
{nom:"Acompte 30%",     formule:"totalTTC * 0.30"},
{nom:"Reste à payer",   formule:"totalTTC * 0.70"},
{nom:"Poids total",     formule:"nbLignes * 2.5"},
{nom:"Frais port",      formule:"totalTTC > 1000 ? 0 : 50"},
];

const ctxTest={
qte:+test.qte||0,prix:+test.prix||0,remise:+test.remise||0,tva:+test.tva||0,
prixAchat:+test.prixAchat||0,
netHT:(+test.qte||0)*(+test.prix||0)*(1-(+test.remise||0)/100),
montantTVA:(+test.qte||0)*(+test.prix||0)*(1-(+test.remise||0)/100)*(+test.tva||0)/100,
ttcLigne:(+test.qte||0)*(+test.prix||0)*(1-(+test.remise||0)/100)*(1+(+test.tva||0)/100),
margeHT:((+test.prix||0)-(+test.prixAchat||0))*(+test.qte||0),
pctMarge:(+test.prix||0)>0?(((+test.prix||0)-(+test.prixAchat||0))/(+test.prix||0)*100):0,
totalBrut:500,totalRemise:50,baseHT:450,remiseGlob:5,totalTVA:90,totalTTC:540,
nbLignes:3,nbArticles:2,poidsTotal:12.5,dateDoc:"2026-04-28",nbJoursEch:30,
};
const resultTest=form.formule?evalFormule(form.formule,ctxTest):"--";

const save=()=>{
if(!form.nom.trim())return showToast("Nom obligatoire",false);
if(form.type==="formule"&&!form.formule.trim())return showToast("Formule obligatoire",false);
const rec={...form,id:edit||uid("CHA"),portee:tab==="ligne"?"ligne":"entete"};
setData(p=>({...p,champsCalcules:edit?(p.champsCalcules||[]).map(c=>c.id===edit?rec:c):[...(p.champsCalcules||[]),rec]}));
showToast("Champ enregistré ✅");
setForm({nom:"",type:"nombre",formule:"",portee:"ligne",actif:true,afficherDoc:true,afficherListe:false,format:"",unite:"",description:""});
setEdit(null);
};
const del=(id)=>{
setData(p=>({...p,champsCalcules:(p.champsCalcules||[]).filter(c=>c.id!==id)}));
showToast("Champ supprimé");
};

return(
<div>
{/* Onglets */}
<div style={{display:"flex",gap:2,marginBottom:14,background:"#f8fafc",borderRadius:8,padding:3,width:"fit-content"}}>
{[{id:"ligne",l:"📄 Champs ligne document"},{id:"entete",l:"📋 Champs en-tête document"}].map(t=>(
<button key={t.id} onClick={()=>{setTab(t.id);setEdit(null);setForm({nom:"",type:"nombre",formule:"",portee:t.id==="ligne"?"ligne":"entete",actif:true,afficherDoc:true,afficherListe:false,format:"",unite:"",description:""}); }}
style={{padding:"8px 18px",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:tab===t.id?700:400,
background:tab===t.id?"#fff":"transparent",color:tab===t.id?"#1a2332":"#64748b",
boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",fontFamily:"inherit"}}>
{t.l}
</button>
))}
</div>

<div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:14}}>
{/* Formulaire */}
<div style={S.card}>
<div style={S.hdr}>
<span>🧮</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>
{edit?"Modifier le champ":"Nouveau champ calculé"}
</span>
{edit&&<button style={{...S.btnSm,marginLeft:"auto"}} onClick={()=>{setEdit(null);setForm({nom:"",type:"nombre",formule:"",actif:true,afficherDoc:true,afficherListe:false,format:"",unite:"",description:""});}}>✕</button>}
</div>
<div style={{padding:20}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Nom du champ *</label>
<input style={S.inp} value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Ex: Marge HT, Acompte..."/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Type</label>
<select style={S.inp} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
{CHAMP_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
</select>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Unité (optionnel)</label>
<input style={S.inp} value={form.unite||""} onChange={e=>setForm(p=>({...p,unite:e.target.value}))} placeholder="DH, %, kg..."/>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Format affichage</label>
<select style={S.inp} value={form.format||""} onChange={e=>setForm(p=>({...p,format:e.target.value}))}>
<option value="">Par défaut</option>
<option value="montant">Montant (1 234,56)</option>
<option value="pct">Pourcentage (%)</option>
<option value="entier">Entier</option>
<option value="date">Date</option>
</select>
</div>
</div>

{form.type==="formule"&&(
<div style={{marginBottom:12}}>
<label style={S.lbl}>Formule JavaScript *</label>

{/* Variables disponibles — cliquables */}
<div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:10,marginBottom:8}}>
<div style={{fontSize:11,fontWeight:700,color:"#1a2332",marginBottom:6}}>
📌 Cliquez sur une variable pour l'insérer dans la formule :
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
{(tab==="ligne"?CHAMP_VARS_LIGNE:CHAMP_VARS_ENTETE).map(v=>(
<button key={v.id}
onClick={()=>{
const ta=document.getElementById("formule-textarea");
if(ta){const s=ta.selectionStart,e2=ta.selectionEnd,val=ta.value,newVal=val.slice(0,s)+v.id+val.slice(e2);setForm(p=>({...p,formule:newVal}));setTimeout(()=>{ta.selectionStart=ta.selectionEnd=s+v.id.length;ta.focus();},10);}
else setForm(p=>({...p,formule:(p.formule||"")+(p.formule?" ":"")+v.id}));
}}
title={`${v.label} — ex: ${v.exemple}`}
style={{
background:"#1a56db",color:"#fff",border:"none",
borderRadius:5,padding:"4px 8px",cursor:"pointer",
fontSize:11,fontFamily:"monospace",fontWeight:600,
}}>
{v.id}
</button>
))}
</div>

{/* Formules prédéfinies */}
<div style={{fontSize:11,fontWeight:700,color:"#1a2332",marginBottom:5}}>⚡ Formules prédéfinies :</div>
<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
{(tab==="ligne"?FORMULES_PREDEFINIES_LIGNE:FORMULES_PREDEFINIES_ENTETE).map(f=>(
<button key={f.nom}
onClick={()=>setForm(p=>({...p,formule:f.formule,nom:p.nom||f.nom}))}
style={{
background:"#059669",color:"#fff",border:"none",
borderRadius:5,padding:"4px 10px",cursor:"pointer",
fontSize:11,fontWeight:600,fontFamily:"inherit",
}}>
⚡ {f.nom}
</button>
))}
</div>
</div>

{/* Zone de saisie formule */}
<textarea
id="formule-textarea"
style={{...S.inp,fontFamily:"monospace",minHeight:80,resize:"vertical",fontSize:13,lineHeight:1.5}}
value={form.formule||""}
onChange={e=>setForm(p=>({...p,formule:e.target.value}))}
placeholder={tab==="ligne"?"qte * prix * (1 - remise/100)":"baseHT * 0.20"}
/>

{/* Résultat en temps réel */}
{form.formule&&(
<div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,padding:"8px 12px",background:resultTest==="ERR"?"#fef2f2":"#f0fdf4",borderRadius:6,border:`1px solid ${resultTest==="ERR"?"#fecaca":"#86efac"}`}}>
<span style={{fontSize:11,color:"#64748b"}}>🧮 Résultat test :</span>
<span style={{fontFamily:"monospace",fontWeight:800,color:resultTest==="ERR"?"#dc2626":"#16a34a",fontSize:14}}>{resultTest} {form.unite}</span>
{resultTest==="ERR"&&<span style={{fontSize:10,color:"#dc2626"}}>⚠ Erreur dans la formule — vérifiez la syntaxe</span>}
</div>
)}
</div>
)}

<div style={{display:"flex",gap:16,marginBottom:14}}>
{[{k:"actif",l:"Actif"},{k:"afficherDoc",l:"Afficher dans le doc"},{k:"afficherListe",l:"Afficher dans la liste"}].map(o=>(
<label key={o.k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13}}>
<input type="checkbox" checked={!!form[o.k]} onChange={e=>setForm(p=>({...p,[o.k]:e.target.checked}))} style={{accentColor:"#1a56db"}}/>
{o.l}
</label>
))}
</div>

<div style={{marginBottom:14}}>
<label style={S.lbl}>Description (optionnel)</label>
<input style={S.inp} value={form.description||""} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Ex: Calcule la marge brute sur chaque ligne..."/>
</div>

<div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
{edit&&<button style={S.btnS} onClick={()=>{setEdit(null);setForm({nom:"",type:"nombre",formule:"",actif:true,afficherDoc:true,afficherListe:false,format:"",unite:"",description:""});}}>Annuler</button>}
<button style={S.btnP} onClick={save}>{edit?"✓ Modifier":"+ Ajouter"}</button>
</div>
</div>
</div>

{/* Panel de test */}
{form.type==="formule"&&(
<div>
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}><span>🧪</span><span style={{fontWeight:700,marginLeft:6}}>Simulateur de test</span></div>
<div style={{padding:16}}>
<div style={{fontSize:11,color:"#64748b",marginBottom:10}}>Modifiez les valeurs pour tester votre formule</div>
{[["qte","Quantité","5"],["prix","Prix HT","100"],["remise","Remise %","10"],["tva","TVA %","20"],["prixAchat","Prix achat","60"]].map(([k,l,ph])=>(
<div key={k} style={{marginBottom:8}}>
<label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
<input type="number" style={{...S.inp,fontSize:12}} value={test[k]||""} onChange={e=>setTest(p=>({...p,[k]:e.target.value}))} placeholder={ph}/>
</div>
))}
<div style={{marginTop:12,padding:"10px 14px",background:resultTest==="ERR"?"#fef2f2":"#f0fdf4",borderRadius:8,border:`1px solid ${resultTest==="ERR"?"#fecaca":"#86efac"}`}}>
<div style={{fontSize:11,color:"#64748b"}}>Résultat :</div>
<div style={{fontWeight:800,fontSize:18,color:resultTest==="ERR"?"#dc2626":"#16a34a",fontFamily:"monospace"}}>{resultTest} {form.unite}</div>
</div>
</div>
</div>

{/* Aide syntaxe */}
<div style={S.card}>
<div style={S.hdr}><span>💡</span><span style={{fontWeight:700,marginLeft:6}}>Aide formules</span></div>
<div style={{padding:14,fontSize:12}}>
{[
["Opérateurs","+ − * / %"],
["Condition","condition ? valeur_si_vrai : valeur_si_faux"],
["Arrondi","Math.round(x * 100) / 100"],
["Minimum","Math.min(a, b)"],
["Maximum","Math.max(a, b)"],
["Valeur absolue","Math.abs(x)"],
].map(([l,v])=>(
<div key={l} style={{marginBottom:7,paddingBottom:7,borderBottom:"1px solid #f0f4f8"}}>
<div style={{color:"#64748b",fontSize:11}}>{l}</div>
<div style={{fontFamily:"monospace",color:"#1a56db",fontSize:11}}>{v}</div>
</div>
))}
<div style={{color:"#94a3b8",fontSize:10,marginTop:6}}>Exemple : <span style={{fontFamily:"monospace",color:"#7c3aed"}}>tva &gt; 0 ? netHT * tva/100 : 0</span></div>
</div>
</div>
</div>
)}
</div>

{/* Liste des champs */}
<div style={{...S.card,marginTop:14}}>
<div style={S.hdr}>
<span>📋</span>
<span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Champs {tab==="ligne"?"ligne":"en-tête"} configurés</span>
<span style={{...S.badge,background:"#eef2ff",color:"#1a56db",marginLeft:4}}>{champs.length}</span>
</div>
{champs.length===0?(
<div style={{textAlign:"center",padding:28,color:"#94a3b8"}}>
<div style={{fontSize:36,marginBottom:8}}>🧮</div>
<div style={{fontWeight:600,marginBottom:4}}>Aucun champ configuré</div>
<div style={{fontSize:12}}>Créez des champs calculés pour enrichir vos documents</div>
</div>
):(
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr>
{["Nom","Type","Formule","Unité","Doc","Liste","Actif","Actions"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr></thead>
<tbody>
{champs.map(c=>{
const typeObj=CHAMP_TYPES.find(t=>t.id===c.type);
return(
<tr key={c.id}>
<td style={S.td}>
<div style={{fontWeight:700}}>{c.nom}</div>
{c.description&&<div style={{fontSize:10,color:"#94a3b8"}}>{c.description}</div>}
</td>
<td style={S.td}>
<span style={{...S.badge,background:"#f1f5f9",color:"#475569"}}>{typeObj?.icon} {typeObj?.label}</span>
</td>
<td style={{...S.td,maxWidth:200}}>
{c.formule?(
<code style={{fontSize:10,color:"#7c3aed",background:"#f5f3ff",padding:"2px 6px",borderRadius:4,display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.formule}</code>
):<span style={{color:"#94a3b8",fontSize:11}}>Saisie</span>}
</td>
<td style={S.td}>{c.unite||"--"}</td>
<td style={{...S.td,textAlign:"center"}}>{c.afficherDoc?<span style={{color:"#16a34a"}}>✅</span>:<span style={{color:"#94a3b8"}}>--</span>}</td>
<td style={{...S.td,textAlign:"center"}}>{c.afficherListe?<span style={{color:"#16a34a"}}>✅</span>:<span style={{color:"#94a3b8"}}>--</span>}</td>
<td style={S.td}>
<label style={{cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
<input type="checkbox" checked={c.actif!==false} onChange={()=>setData(p=>({...p,champsCalcules:(p.champsCalcules||[]).map(x=>x.id===c.id?{...x,actif:!x.actif}:x)}))} style={{accentColor:"#16a34a"}}/>
<span style={{...S.badge,background:c.actif!==false?"#f0fdf4":"#fef2f2",color:c.actif!==false?"#16a34a":"#ef4444"}}>{c.actif!==false?"Actif":"Inactif"}</span>
</label>
</td>
<td style={S.td}>
<button style={S.btnSm} onClick={()=>{setEdit(c.id);setForm({...c});}}>✏️</button>
<button style={{...S.btnSm,marginLeft:4,color:"#dc2626"}} onClick={()=>del(c.id)}>🗑</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</div>
<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

function JournalModule({societeActive,curUser}){
const JOURNAL_KEY="mgcloud_journal_"+societeActive?.id;
const [entries,setEntries]=useState(()=>{
try{return JSON.parse(localStorage.getItem(JOURNAL_KEY)||"[]");}
catch(e){return[];}
});
const [search,setSearch]=useState("");
const [filtreAction,setFiltreAction]=useState("");
const [filtreDate,setFiltreDate]=useState("");
const [page2,setPage2]=useState(1);
const PER_PAGE=50;

// Recharger le journal à chaque ouverture
useEffect(()=>{
try{setEntries(JSON.parse(localStorage.getItem(JOURNAL_KEY)||"[]"));}
catch(e){}
},[JOURNAL_KEY]);

const clearJournal=()=>{
if(!window.confirm("Effacer tout le journal ?"))return;
localStorage.removeItem(JOURNAL_KEY);
setEntries([]);
};

// Catégories d'actions
const ACTION_COLORS={
"Nouveau client":"#1a56db","Suppression client":"#dc2626",
"Nouveau fournisseur":"#7c3aed","Suppression fournisseur":"#dc2626",
"Nouvel article":"#0891b2","Suppression article":"#dc2626","Modification article":"#d97706",
"Règlement enregistré":"#16a34a",
"Nouveau":"#059669","Suppression":"#dc2626","Statut":"#d97706",
"Mouvement stock":"#f59e0b","Modification":"#94a3b8",
};
const getColor=(action)=>{
for(const [k,v] of Object.entries(ACTION_COLORS)){
if(action.includes(k))return v;
}
return"#94a3b8";
};

// Filtres
const filtered=entries.filter(e=>{
if(search&&!e.action.toLowerCase().includes(search.toLowerCase())&&
!e.details.toLowerCase().includes(search.toLowerCase())&&
!e.user.toLowerCase().includes(search.toLowerCase()))return false;
if(filtreAction&&!e.action.includes(filtreAction))return false;
if(filtreDate&&!e.date.startsWith(filtreDate))return false;
return true;
});

const totalPages=Math.ceil(filtered.length/PER_PAGE);
const paged=filtered.slice((page2-1)*PER_PAGE,page2*PER_PAGE);

// Actions uniques pour filtre
const actionsUniques=[...new Set(entries.map(e=>e.action))].sort();

// Stats
const today2=new Date().toISOString().slice(0,10);
const ajd=entries.filter(e=>e.date.startsWith(today2)).length;
const docs=entries.filter(e=>e.action.includes("Document")||DOC_TYPES_LIST.some(d=>e.action.includes(d))).length;
const regl=entries.filter(e=>e.action.includes("Règlement")).length;

const DOC_TYPES_LIST=["Devis","BC","BL","Pro Forma","Facture","Avoir"];

return(
<div>
{/* Header */}
<div style={{...S.card,marginBottom:14,background:"linear-gradient(135deg,#1a2332,#2d3f55)"}}>
<div style={{padding:"16px 24px",display:"flex",alignItems:"center",gap:14}}>
<div style={{width:46,height:46,background:"#e8a020",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📋</div>
<div>
<div style={{fontWeight:900,fontSize:16,color:"#fff"}}>Journal des mouvements</div>
<div style={{fontSize:11,color:"#a8b8cc",marginTop:2}}>{entries.length} entrée(s) enregistrée(s)</div>
</div>
<div style={{marginLeft:"auto",display:"flex",gap:8}}>
<button style={{...S.btnSm,background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}}
onClick={()=>{try{setEntries(JSON.parse(localStorage.getItem(JOURNAL_KEY)||"[]"));}catch(e){}}}>
Actualiser
</button>
<button style={{...S.btnSm,background:"rgba(220,38,38,.2)",color:"#fca5a5",border:"1px solid rgba(220,38,38,.3)"}}
onClick={clearJournal}>
Effacer
</button>
</div>
</div>
</div>

{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
{[
{l:"Total mouvements",v:entries.length,c:"#1a56db"},
{l:"Aujourd'hui",v:ajd,c:"#16a34a"},
{l:"Documents",v:docs,c:"#d97706"},
{l:"Règlements",v:regl,c:"#7c3aed"},
].map(k=>(
<div key={k.l} style={{background:k.c+"10",borderLeft:"4px solid "+k.c,borderRadius:8,padding:"10px 14px"}}>
<div style={{fontWeight:900,fontSize:22,color:k.c}}>{k.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{k.l}</div>
</div>
))}
</div>

{/* Filtres */}
<div style={{...S.card,marginBottom:10}}>
<div style={{padding:"10px 16px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input placeholder="Recherche..." value={search} onChange={e=>{setSearch(e.target.value);setPage2(1);}}
style={{...S.inp,width:180}}/>
<select style={{...S.inp,width:200}} value={filtreAction} onChange={e=>{setFiltreAction(e.target.value);setPage2(1);}}>
<option value="">Toutes les actions</option>
{actionsUniques.map(a=><option key={a} value={a}>{a}</option>)}
</select>
<input type="date" style={{...S.inp,width:150}} value={filtreDate} onChange={e=>{setFiltreDate(e.target.value);setPage2(1);}}/>
{(search||filtreAction||filtreDate)&&(
<button style={{...S.btnSm,color:"#dc2626"}} onClick={()=>{setSearch("");setFiltreAction("");setFiltreDate("");setPage2(1);}}>
✕ Effacer filtres
</button>
)}
<span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8"}}>{filtered.length} résultat(s)</span>
</div>
</div>

{/* Tableau */}
<div style={S.card}>
{entries.length===0?(
<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>
<div style={{fontSize:40,marginBottom:8}}>📋</div>
<div style={{fontWeight:600}}>Aucun mouvement enregistré</div>
<div style={{fontSize:12,marginTop:4}}>Les actions seront enregistrées automatiquement</div>
</div>
):(
<>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead>
<tr>
{["Date & Heure","Utilisateur","Action","Détails"].map(h=>(
<th key={h} style={S.th}>{h}</th>
))}
</tr>
</thead>
<tbody>
{paged.map((e,i)=>{
const color=getColor(e.action);
const dt=new Date(e.date);
return(
<tr key={e.id||i}
style={{background:i%2===0?"#fff":"#f8fafc"}}
onMouseEnter={ev=>ev.currentTarget.style.background="#f0f7ff"}
onMouseLeave={ev=>ev.currentTarget.style.background=i%2===0?"#fff":"#f8fafc"}>
<td style={{...S.td,whiteSpace:"nowrap",fontFamily:"monospace",fontSize:11}}>
<div style={{fontWeight:600}}>{dt.toLocaleDateString("fr-FR")}</div>
<div style={{color:"#94a3b8"}}>{dt.toLocaleTimeString("fr-FR")}</div>
</td>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<div style={{width:26,height:26,borderRadius:"50%",background:color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color,flexShrink:0}}>
{(e.user||"U")[0].toUpperCase()}
</div>
<span style={{fontSize:12}}>{e.user||"Système"}</span>
</div>
</td>
<td style={S.td}>
<span style={{...S.badge,background:color+"15",color,fontWeight:700,fontSize:11}}>
{e.action}
</span>
</td>
<td style={{...S.td,color:"#64748b",fontSize:12}}>
{e.details||"—"}
</td>
</tr>
);
})}
</tbody>
</table>
</div>

{/* Pagination */}
{totalPages>1&&(
<div style={{padding:"10px 16px",borderTop:"1px solid #f0f4f8",display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
<button style={S.btnSm} onClick={()=>setPage2(1)} disabled={page2===1}>«</button>
<button style={S.btnSm} onClick={()=>setPage2(p=>Math.max(1,p-1))} disabled={page2===1}>‹</button>
<span style={{fontSize:12,color:"#64748b",padding:"0 12px"}}>Page {page2} / {totalPages}</span>
<button style={S.btnSm} onClick={()=>setPage2(p=>Math.min(totalPages,p+1))} disabled={page2===totalPages}>›</button>
<button style={S.btnSm} onClick={()=>setPage2(totalPages)} disabled={page2===totalPages}>»</button>
</div>
)}
</>
)}
</div>
</div>
);
}

function SauvegardeModule({data,setData,societeActive}){
const [toast,setToast]=useState(null);
const [importing,setImporting]=useState(false);
const [confirmReset,setConfirmReset]=useState(false);
const [confirmImport,setConfirmImport]=useState(null);
const showToast=(m,ok=true)=>{setToast({msg:m,ok});setTimeout(()=>setToast(null),3000);};

const AUTO_SAVE_KEY="mgcloud_autosave_"+societeActive?.id;
const AUTO_SAVE_META_KEY="mgcloud_autosave_meta_"+societeActive?.id;
const [autoMeta,setAutoMeta]=useState(()=>{
try{const m=localStorage.getItem(AUTO_SAVE_META_KEY);return m?JSON.parse(m):null;}
catch(e){return null;}
});
const restoreAutoSave=()=>{
try{
const raw=localStorage.getItem(AUTO_SAVE_KEY);
if(!raw){showToast("Aucune auto-sauvegarde disponible",false);return;}
const backup=JSON.parse(raw);
if(!backup.data){showToast("Auto-sauvegarde invalide",false);return;}
setConfirmImport({...backup,nomSociete:"Auto-sauvegarde du "+new Date(backup.date).toLocaleString("fr-FR")});
}catch(e){showToast("Erreur lecture auto-sauvegarde",false);}
};
// ── Statistiques de la base ───────────────────────────
const stats=[
{l:"Clients",        v:(data.clients||[]).length,          icon:"👥",c:"#1a56db"},
{l:"Fournisseurs",   v:(data.fournisseurs||[]).length,      icon:"🏭",c:"#7c3aed"},
{l:"Articles",       v:(data.articles||[]).length,          icon:"📦",c:"#0891b2"},
{l:"Documents",      v:Object.values(data.documents||{}).flat().length, icon:"📄",c:"#d97706"},
{l:"Règlements",     v:((data.reglementsVente||[]).length+(data.reglementsAchat||[]).length), icon:"💰",c:"#16a34a"},
{l:"Mouvements stock",v:(data.mouvementsStock||[]).length,  icon:"📊",c:"#dc2626"},
];

// ── Sauvegarde JSON ───────────────────────────────────
const doSauvegarde=()=>{
const backup={
version:"1.0",
date:new Date().toISOString(),
societe:societeActive?.id||"",
nomSociete:data.societe?.nomCommercial||"MGCLOUD",
data:data,
};
const json=JSON.stringify(backup,null,2);
const blob=new Blob([json],{type:"application/json"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
const dateStr=new Date().toISOString().slice(0,10);
const nomSoc=(data.societe?.nomCommercial||"mgcloud").toLowerCase().replace(/\s+/g,"-");
a.href=url;
a.download=`sauvegarde_${nomSoc}_${dateStr}.json`;
a.click();
URL.revokeObjectURL(url);
showToast("Sauvegarde téléchargée ✅");
};

// ── Import fichier JSON ───────────────────────────────
const doImportFile=(e)=>{
const file=e.target.files?.[0];
if(!file)return;
if(!file.name.endsWith(".json")){showToast("Fichier JSON uniquement",false);return;}
setImporting(true);
const reader=new FileReader();
reader.onload=(ev)=>{
try{
const parsed=JSON.parse(ev.target.result);
// Vérifier format
if(!parsed.data||!parsed.version){
showToast("Fichier invalide — pas une sauvegarde MGCLOUD",false);
setImporting(false);return;
}
setConfirmImport(parsed);
}catch(err){
showToast("Erreur lecture fichier : "+err.message,false);
}
setImporting(false);
};
reader.readAsText(file);
e.target.value="";
};

const doRestore=(backup)=>{
setData(p=>({...backup.data,societe:{...backup.data.societe,...(p.societe||{})}}));
setConfirmImport(null);
showToast("Données restaurées avec succès ✅");
};

// ── Export CSV de sections ────────────────────────────
const exportSection=(label,rows)=>{
if(!rows.length){showToast("Aucune donnée à exporter",false);return;}
const headers=Object.keys(rows[0]);
const bom="\uFEFF";
const csv=bom+[headers.join(","),...rows.map(r=>headers.map(h=>{
const v=r[h]===null||r[h]===undefined?"":String(r[h]).replace(/"/g,'""');
return v.includes(",")?"\""+v+"\"":v;
}).join(","))].join("\n");
const a=document.createElement("a");
a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
a.download=label.toLowerCase().replace(/\s+/g,"_")+".csv";
a.click();
showToast(`${label} exporté ✅`);
};

const exports=[
{l:"Clients",   fn:()=>exportSection("clients",(data.clients||[]).map(c=>({Code:c.code,Nom:c.nom,Tel:c.tel||"",Email:c.email||"",Ville:c.ville||"",ICE:c.ice||"",RC:c.rc||""})))},
{l:"Fournisseurs",fn:()=>exportSection("fournisseurs",(data.fournisseurs||[]).map(c=>({Code:c.code,Nom:c.nom,Tel:c.tel||"",Email:c.email||"",Ville:c.ville||"",ICE:c.ice||""})))},
{l:"Articles",  fn:()=>exportSection("articles",(data.articles||[]).map(a=>({Ref:a.ref,Designation:a.designation,Unite:a.unite||"",PrixAchat:a.prixAchat||0,PrixVente:a.prixVente||0,TVA:a.tva||0})))},
{l:"Factures Vente",fn:()=>exportSection("factures_vente",(data.documents?.["vte-facture"]||[]).map(d=>{const c=data.clients?.find(x=>x.id===d.tiers)||{};return{Ref:d.ref,Client:c.nom||"",Date:d.dateDoc||"",Statut:d.statut,TTC:d.lignes?.reduce((s,l)=>s+(+l.qte||0)*(+l.prix||0)*(1-(+l.remise||0)/100)*(1+(+l.tva||0)/100),0)||0};}))},
{l:"Factures Achat",fn:()=>exportSection("factures_achat",(data.documents?.["ach-facture"]||[]).map(d=>{const f=data.fournisseurs?.find(x=>x.id===d.tiers)||{};return{Ref:d.ref,Fournisseur:f.nom||"",Date:d.dateDoc||"",Statut:d.statut};}))},
{l:"Règlements Vente",fn:()=>exportSection("reglements_vente",(data.reglementsVente||[]).map(r=>{const c=data.clients?.find(x=>x.id===r.tiersId)||{};return{Ref:r.id,Facture:r.factureRef||"",Client:c.nom||"",Montant:r.montant,Mode:r.mode||"",Date:r.date||"",Statut:r.statut};}))},
{l:"Stock",     fn:()=>exportSection("stock",(data.articles||[]).map(a=>{const tot=Object.values(data.stockDepots?.[a.id]||{}).reduce((s,d)=>s+(+d.qte||0),0);return{Ref:a.ref,Designation:a.designation,Stock:tot,Unite:a.unite||""};}))},
];

return(
<div>
{/* Header */}
<div style={{...S.card,marginBottom:14,background:"linear-gradient(135deg,#1a2332,#2d3f55)"}}>
<div style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
<div style={{width:52,height:52,background:"#e8a020",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
💾
</div>
<div>
<div style={{fontWeight:900,fontSize:18,color:"#fff"}}>Sauvegarde & Restauration</div>
<div style={{fontSize:12,color:"#a8b8cc",marginTop:2}}>
{data.societe?.nomCommercial||"MGCLOUD"} · Dernière sauvegarde recommandée avant chaque modification importante
</div>
</div>
</div>
</div>

{/* Stats */}
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
{stats.map(s=>(
<div key={s.l} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
<div style={{width:40,height:40,background:s.c+"18",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
<div>
<div style={{fontWeight:900,fontSize:20,color:s.c}}>{s.v}</div>
<div style={{fontSize:11,color:"#64748b"}}>{s.l}</div>
</div>
</div>
))}
</div>

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
{/* Auto-sauvegarde info */}
<div style={{gridColumn:"1/-1",background:autoMeta?"#f0fdf4":"#f8fafc",border:"1px solid "+(autoMeta?"#86efac":"#e2e8f0"),borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
<div style={{width:42,height:42,background:autoMeta?"#16a34a":"#94a3b8",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
{autoMeta?"🟢":"⏸"}
</div>
<div style={{flex:1}}>
<div style={{fontWeight:700,fontSize:13,color:"#1a2332"}}>Auto-sauvegarde</div>
{autoMeta?(
<div style={{fontSize:12,color:"#64748b",marginTop:2}}>
Dernière sauvegarde automatique : <strong>{new Date(autoMeta.date).toLocaleString("fr-FR")}</strong>
<span style={{marginLeft:8,color:"#16a34a"}}>· {autoMeta.nb} enregistrements</span>
</div>
):(
<div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>
Aucune auto-sauvegarde disponible — elle se crée automatiquement 30s après chaque modification
</div>
)}
<div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>
Fréquence : toutes les 5 minutes + 30s après chaque modification
</div>
</div>
{autoMeta&&(
<button style={{...S.btnS,color:"#16a34a",borderColor:"#86efac",flexShrink:0}} onClick={restoreAutoSave}>
Restaurer auto-save
</button>
)}
</div>
<div style={{...S.card}}>
<div style={S.hdr}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>💾 Sauvegarde complète</span></div>
<div style={{padding:20}}>
<div style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
Télécharge <strong>toutes vos données</strong> dans un fichier JSON.<br/>
Clients, fournisseurs, articles, documents, stock, règlements, paramètres...
</div>
<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#16a34a"}}>
<strong>Recommandé :</strong> Sauvegardez avant chaque mise à jour de l'ERP
</div>
<button style={{...S.btnP,width:"100%",background:"#16a34a",fontSize:14,padding:"12px"}} onClick={doSauvegarde}>
💾 Télécharger la sauvegarde
</button>
</div>
</div>

{/* Restauration */}
<div style={{...S.card}}>
<div style={S.hdr}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>📂 Restaurer une sauvegarde</span></div>
<div style={{padding:20}}>
<div style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
Restaure vos données depuis un fichier de sauvegarde JSON précédemment créé.
</div>
<div style={{background:"#fef9c3",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#92400e"}}>
<strong>Attention :</strong> Cette action remplace toutes vos données actuelles
</div>
<label style={{display:"block",width:"100%"}}>
<div style={{...S.btnP,background:"#d97706",fontSize:14,padding:"12px",textAlign:"center",cursor:"pointer",borderRadius:8,fontWeight:700,color:"#fff"}}>
{importing?"Chargement...":"📂 Choisir un fichier"}
</div>
<input type="file" accept=".json" onChange={doImportFile} style={{display:"none"}}/>
</label>
</div>
</div>
</div>

{/* Exports CSV par section */}
<div style={S.card}>
<div style={S.hdr}><span style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>📊 Exports Excel (CSV)</span></div>
<div style={{padding:16}}>
<div style={{fontSize:12,color:"#64748b",marginBottom:14}}>Exportez chaque section séparément pour ouvrir dans Excel</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
{exports.map(e=>(
<button key={e.l} onClick={e.fn}
style={{...S.btnS,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",justifyContent:"flex-start",fontSize:12}}>
<span style={{fontSize:16}}>📥</span>
<span>{e.l}</span>
</button>
))}
</div>
</div>
</div>

{/* Modal confirmation import */}
{confirmImport&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:14,width:480,maxWidth:"95vw",overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
<div style={{padding:"16px 20px",background:"#d97706",display:"flex",alignItems:"center",gap:10}}>
<span style={{fontSize:24}}>⚠️</span>
<div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Confirmer la restauration</div>
</div>
<div style={{padding:24}}>
<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#92400e"}}>
<div style={{fontWeight:700,marginBottom:6}}>Fichier : {confirmImport.nomSociete}</div>
<div>Date sauvegarde : {new Date(confirmImport.date).toLocaleString("fr-FR")}</div>
<div style={{marginTop:6,fontWeight:700,color:"#dc2626"}}>
Vos données actuelles seront REMPLACÉES définitivement.
</div>
</div>
<div style={{fontSize:12,color:"#64748b",marginBottom:20}}>
Êtes-vous sûr de vouloir restaurer cette sauvegarde ?
</div>
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={()=>setConfirmImport(null)}>Annuler</button>
<button style={{...S.btnP,flex:2,background:"#d97706"}} onClick={()=>doRestore(confirmImport)}>
Restaurer les données
</button>
</div>
</div>
</div>
</div>
)}

<Toast msg={toast?.msg} ok={toast?.ok}/>
</div>
);
}

function Dashboard({data}){
const soc = data.societe || {};
const totalDocs = Object.values(data.documents||{}).reduce((s,a)=>s+a.length,0);
const totalVal = Object.values(data.documents||{}).flat()
.filter(d=>STATUTS_STOCK.includes(d.statut))
.reduce((s,d)=>s+docCalc(d.lignes,d.remiseGlobale||0).ttc,0);
const alertes = (data.articles||[]).filter(a=>stockTotal(data.stockDepots||{},a.id)<=(a.stockMin||0)).length;
const recent = Object.entries(data.documents||{})
.flatMap(([k,a])=>a.map(d=>({...d,_t:k})))
.sort((a,b)=>(b.dateDoc||"").localeCompare(a.dateDoc||""))
.slice(0,8);
return(
<div>
<div style={{marginBottom:20}}>
<h2 style={{color:"#1a2332",fontWeight:800,fontSize:20,margin:0}}>{soc.nomCommercial||soc.raisonSociale||"Tableau de bord"}</h2>
<p style={{color:"#64748b",margin:"4px 0 0",fontSize:13}}>{today()}</p>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
{[
{l:"Articles",v:(data.articles||[]).length,i:"🔩",c:"#7c3aed",bg:"#f5f3ff"},
{l:"Documents",v:totalDocs,i:"📄",c:"#1a56db",bg:"#eef2ff"},
{l:"CA valide TTC",v:fmt(totalVal)+" DH",i:"💰",c:"#16a34a",bg:"#f0fdf4"},
{l:"Alertes stock",v:alertes,i:"⚠️",c:"#dc2626",bg:"#fef2f2"},
].map(s=>(
<div key={s.l} style={{background:s.bg,border:"1px solid "+s.c+"33",borderLeft:"4px solid "+s.c,borderRadius:10,padding:"16px 18px"}}>
<div style={{fontSize:22,marginBottom:4}}>{s.i}</div>
<div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
<div style={{color:"#64748b",fontSize:12,marginTop:2}}>{s.l}</div>
</div>
))}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<div style={{...S.card,padding:20}}>
<div style={{fontWeight:700,color:"#1a2332",marginBottom:12}}>Documents récents</div>
{recent.length===0
?<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"16px 0"}}>Aucun document</div>
:recent.map(d=>{
const col=DOC_CFG[d._t]?.color||"#94a3b8";
return(<div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f0f4f8"}}>
<div><span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:col}}>{d.ref}</span><span style={{fontSize:11,color:"#94a3b8",marginLeft:8}}>{d.dateDoc}</span></div>
<span style={{...S.badge,background:"#f0fdf4",color:"#16a34a",fontSize:10}}>{d.statut}</span>
</div>);
})}
</div>
<div style={{...S.card,padding:20}}>
<div style={{fontWeight:700,color:"#1a2332",marginBottom:12}}>Agences et dépôts</div>
{(data.agences||[]).length===0
?<div style={{color:"#94a3b8",fontSize:12,textAlign:"center",padding:"16px 0"}}>Aucune agence — créez-en dans Administration</div>
:(data.agences||[]).map(a=>{
const deps=(data.depots||[]).filter(d=>d.agenceId===a.id);
const tot=(data.articles||[]).reduce((s,art)=>s+deps.reduce((ss,d)=>ss+(data.stockDepots?.[art.id]?.[d.id]?.qte||0),0),0);
return(<div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f0f4f8"}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<span style={{...S.badge,background:a.actif?"#f0fdf4":"#fef2f2",color:a.actif?"#16a34a":"#94a3b8"}}>{a.code}</span>
<span style={{fontWeight:600,fontSize:13}}>{a.nom}</span>
</div>
<span style={{fontWeight:700,color:"#1a56db"}}>{tot} unités</span>
</div>);
})}
</div>
</div>
</div>
);
}
function SocieteSelector({societes, onNew, onSelect, onEdit, onDelete}){
const [confirmSoc, setConfirmSoc] = useState(null);
const [pwd, setPwd] = useState("");
const [err, setErr] = useState("");
const ADMIN_PWD = "admin123";
const tryDelete = () => {
if(pwd !== ADMIN_PWD){ setErr("Mot de passe incorrect"); setPwd(""); return; }
onDelete(confirmSoc.id);
setConfirmSoc(null); setPwd(""); setErr("");
};
const resetAll = () => {
try{
const keys = Object.keys(localStorage).filter(k=>k.startsWith("lgm_"));
keys.forEach(k=>localStorage.removeItem(k));
}catch(e){}
window.location.reload();
};
return(<>
<div style={{minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
<div style={{textAlign:"center",marginBottom:32}}>
<div style={{width:60,height:60,background:"#e8a020",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#1a2332",fontSize:28,margin:"0 auto 12px"}}>L</div>
<div style={{color:"#fff",fontWeight:900,fontSize:22,letterSpacing:".02em"}}>MGCLOUD ERP</div>
<div style={{color:"rgba(255,255,255,.4)",fontSize:13,marginTop:6}}>
{societes.length===0 ? "Créez votre première société pour commencer" : "Sélectionnez une société"}
</div>
</div>
<div style={{width:"100%",maxWidth:800,marginBottom:24}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
{societes.map(soc=>(
<div key={soc.id} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,overflow:"hidden"}}>
<div style={{height:4,background:soc.couleur||"#1a56db"}}/>
<div style={{padding:16}}>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
<div style={{width:42,height:42,background:soc.couleur||"#1a56db",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#e8a020",fontWeight:900,fontSize:20,flexShrink:0}}>
{(soc.nom||"?")[0].toUpperCase()}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{color:"#fff",fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{soc.nom}</div>
<div style={{color:"rgba(255,255,255,.4)",fontSize:11,marginTop:2}}>{soc.forme||"SARL"}{soc.ville?" · "+soc.ville:""}</div>
{soc.ice&&<div style={{color:"rgba(255,255,255,.2)",fontSize:10,fontFamily:"monospace",marginTop:1}}>ICE: {soc.ice}</div>}
</div>
</div>
<div style={{display:"flex",gap:6}}>
<button style={{flex:1,background:"#e8a020",color:"#1a2332",border:"none",borderRadius:7,padding:"9px 0",fontWeight:800,fontSize:13,cursor:"pointer"}}
onClick={()=>onSelect(soc)}>▶ Ouvrir</button>
<button style={{background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.6)",border:"none",borderRadius:7,padding:"9px 11px",cursor:"pointer",fontSize:13}}
onClick={()=>onEdit(soc)}>✏️</button>
<button style={{background:"rgba(220,38,38,.15)",color:"#fca5a5",border:"none",borderRadius:7,padding:"9px 11px",cursor:"pointer",fontSize:13}}
onClick={()=>{setConfirmSoc(soc);setPwd("");setErr("");}}>🗑</button>
</div>
</div>
</div>
))}
</div>
</div>
<button style={{background:"#e8a020",color:"#1a2332",border:"none",borderRadius:10,padding:"14px 32px",fontWeight:900,fontSize:15,cursor:"pointer"}}
onClick={onNew}>+ Créer une société</button>
{societes.length>0&&<button onClick={resetAll} style={{display:"block",marginTop:14,background:"transparent",color:"rgba(255,255,255,.25)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"8px 20px",fontSize:12,cursor:"pointer"}}>🗑 Effacer toutes les données</button>}
</div>
{confirmSoc&&(
<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:14,padding:28,width:380,maxWidth:"94vw"}}>
<div style={{textAlign:"center",marginBottom:20}}>
<div style={{fontSize:40,marginBottom:8}}>🔐</div>
<div style={{fontWeight:800,fontSize:16,color:"#1a2332"}}>Supprimer "{confirmSoc.nom}" ?</div>
<div style={{fontSize:13,color:"#64748b",marginTop:6}}>Toutes les données seront supprimées définitivement.</div>
</div>
<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#7f1d1d",textAlign:"center"}}>
Action irréversible — mot de passe administrateur requis
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Mot de passe administrateur</label>
<input
type="password"
style={{...S.inp,textAlign:"center",fontSize:16,letterSpacing:".2em"}}
value={pwd}
onChange={e=>{setPwd(e.target.value);setErr("");}}
onKeyDown={e=>e.key==="Enter"&&tryDelete()}
autoFocus
placeholder="••••••••"
/>
{err&&<div style={{color:"#dc2626",fontSize:12,marginTop:6,textAlign:"center"}}>⚠ {err}</div>}
</div>
<div style={{fontSize:11,color:"#94a3b8",textAlign:"center",marginBottom:16}}>Mot de passe par défaut : <strong>admin123</strong><br/>Modifiable dans Administration → Paramètres</div>
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={()=>{setConfirmSoc(null);setPwd("");setErr("");}}>Annuler</button>
<button style={{...S.btnP,flex:1,background:"#dc2626"}} onClick={tryDelete}>Supprimer</button>
</div>
</div>
</div>
)}
</>
);
}
function SocieteForm({soc, onSave, onCancel}){
const [nom,    setNom   ] = useState(soc ? soc.nom    : "");
const [forme,  setForme ] = useState(soc ? soc.forme  : "SARL");
const [ville,  setVille ] = useState(soc ? soc.ville  : "");
const [tel,    setTel   ] = useState(soc ? soc.tel    : "");
const [ice,    setIce   ] = useState(soc ? soc.ice    : "");
const [rc,     setRc    ] = useState(soc ? soc.rc     : "");
const [couleur,setCouleur] = useState(soc ? soc.couleur : "#1a2332");
const [err,    setErr   ] = useState("");
const COLS = ["#1a2332","#1a56db","#7c3aed","#059669","#dc2626","#d97706","#0891b2"];
const save = () => {
if(!nom.trim()) return setErr("Nom obligatoire");
onSave({ id: soc ? soc.id : uid("SOC"), nom:nom.trim(), forme, ville, tel, ice, rc, couleur });
};
return(
<div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
<div style={{background:"#fff",borderRadius:14,padding:28,width:460,maxWidth:"96vw"}}>
<div style={{textAlign:"center",marginBottom:20}}>
<div style={{width:44,height:44,background:couleur,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#e8a020",fontWeight:900,fontSize:20,margin:"0 auto 8px"}}>{nom ? nom[0].toUpperCase() : "🏢"}</div>
<div style={{fontWeight:800,fontSize:16,color:"#1a2332"}}>{soc ? "Modifier la société" : "Nouvelle société"}</div>
</div>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Raison sociale *</label>
<input style={{...S.inp,fontSize:15,fontWeight:600}} value={nom} onChange={e=>setNom(e.target.value)} autoFocus placeholder="Ex: MGCLOUD SARL"/>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
<div style={{marginBottom:12}}>
<label style={S.lbl}>Forme juridique</label>
<select style={S.inp} value={forme} onChange={e=>setForme(e.target.value)}>
{["SARL","SA","SNC","Auto-entrepreneur","Association","Autre"].map(f=><option key={f}>{f}</option>)}
</select>
</div>
<div style={{marginBottom:12}}><label style={S.lbl}>Ville</label><input style={S.inp} value={ville} onChange={e=>setVille(e.target.value)}/></div>
<div style={{marginBottom:12}}><label style={S.lbl}>Téléphone</label><input style={S.inp} value={tel} onChange={e=>setTel(e.target.value)}/></div>
<div style={{marginBottom:12}}><label style={S.lbl}>ICE</label><input style={{...S.inp,fontFamily:"monospace"}} value={ice} onChange={e=>setIce(e.target.value)}/></div>
<div style={{marginBottom:12}}><label style={S.lbl}>RC</label><input style={{...S.inp,fontFamily:"monospace"}} value={rc} onChange={e=>setRc(e.target.value)}/></div>
</div>
<div style={{marginBottom:18}}>
<label style={S.lbl}>Couleur</label>
<div style={{display:"flex",gap:8,marginTop:4}}>
{COLS.map(c=><div key={c} onClick={()=>setCouleur(c)} style={{width:32,height:32,background:c,borderRadius:6,cursor:"pointer",outline:couleur===c?"3px solid #e8a020":"none",outlineOffset:2}}/>)}
</div>
</div>
{err&&<div style={{color:"#dc2626",marginBottom:10,fontSize:13,padding:"8px",background:"#fef2f2",borderRadius:6}}>⚠ {err}</div>}
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={onCancel}>Annuler</button>
<button style={{...S.btnP,flex:2,background:couleur,fontSize:14,fontWeight:800}} onClick={save}>
{soc ? "Enregistrer" : "Créer et ouvrir →"}
</button>
</div>
</div>
</div>
);
}
const LS = {
get:(k)=>{ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):null; }catch(e){ return null; } },
set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} },
del:(k)=>{ try{ localStorage.removeItem(k); }catch(e){} },
};
function LoginScreen({onLogin, onRegister}){
const [email,    setEmail   ]=useState(()=>LS.get("lgm_remember_email")||"");
const [pwd,      setPwd     ]=useState("");
const [err,      setErr     ]=useState("");
const [showPwd,  setShowPwd ]=useState(false);
const [remember, setRemember]=useState(()=>!!LS.get("lgm_remember_email"));
const submit=()=>{
if(!email.trim()||!pwd.trim())return setErr("Email et mot de passe requis");
const users=LS.get("lgm_users")||[];
const u=users.find(u=>u.email.toLowerCase()===email.toLowerCase().trim());
if(!u)return setErr("Aucun compte trouvé avec cet email");
if(u.pwd!==btoa(pwd))return setErr("Mot de passe incorrect");
if(remember) LS.set("lgm_remember_email", email.toLowerCase().trim());
else LS.del("lgm_remember_email");
setErr("");
onLogin(u, remember);
};
return(
<div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
<div style={{width:420,maxWidth:"96vw"}}>
<div style={{textAlign:"center",marginBottom:32}}>
<div style={{width:64,height:64,background:"#e8a020",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#1a2332",fontSize:30,margin:"0 auto 14px"}}>M</div>
<div style={{color:"#fff",fontWeight:900,fontSize:24,letterSpacing:".02em"}}>MGCLOUD ERP</div>
<div style={{color:"rgba(255,255,255,.4)",fontSize:13,marginTop:6}}>Connectez-vous à votre espace</div>
</div>
<div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:28}}>
<div style={{marginBottom:16}}>
<label style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>Adresse email</label>
<input style={{...S.inp,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",width:"100%"}}
value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
onKeyDown={e=>e.key==="Enter"&&submit()}
placeholder="votre@email.com" type="email" autoFocus/>
</div>
<div style={{marginBottom:16}}>
<label style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>Mot de passe</label>
<div style={{position:"relative"}}>
<input style={{...S.inp,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",width:"100%",paddingRight:40}}
value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}}
onKeyDown={e=>e.key==="Enter"&&submit()}
type={showPwd?"text":"password"} placeholder="••••••••"/>
<button onClick={()=>setShowPwd(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.4)",fontSize:14}}>{showPwd?"👁":"🔒"}</button>
</div>
</div>
{/* Se souvenir de moi */}
<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:18}}>
<input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{width:15,height:15,accentColor:"#e8a020"}}/>
<span style={{color:"rgba(255,255,255,.6)",fontSize:13}}>Se souvenir de moi</span>
</label>
{err&&<div style={{background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.3)",borderRadius:8,padding:"10px 14px",color:"#fca5a5",fontSize:13,marginBottom:14}}>⚠ {err}</div>}
<button onClick={submit} style={{width:"100%",background:"#e8a020",color:"#1a2332",border:"none",borderRadius:9,padding:"13px 0",fontWeight:900,fontSize:15,cursor:"pointer",marginBottom:16}}>
Se connecter →
</button>
<div style={{textAlign:"center",color:"rgba(255,255,255,.3)",fontSize:12}}>
Pas encore de compte ?{" "}
<button onClick={onRegister} style={{background:"none",border:"none",color:"#e8a020",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>Créer un compte</button>
</div>
</div>
</div>
</div>
);
}

function RegisterScreen({onSave, onBack}){
const [email,setEmail]=useState("");
const [pwd,setPwd]=useState("");
const [pwd2,setPwd2]=useState("");
const [nom,setNom]=useState("");
const [err,setErr]=useState("");
const submit=()=>{
if(!nom.trim())return setErr("Nom obligatoire");
if(!email.trim()||!/^[^@]+@[^@]+\.[^@]+$/.test(email))return setErr("Email invalide");
if(pwd.length<6)return setErr("Mot de passe : 6 caractères minimum");
if(pwd!==pwd2)return setErr("Les mots de passe ne correspondent pas");
const users=LS.get("lgm_users")||[];
if(users.find(u=>u.email.toLowerCase()===email.toLowerCase()))return setErr("Cet email est déjà utilisé");
const newUser={id:uid("USR"),nom:nom.trim(),email:email.toLowerCase().trim(),pwd:btoa(pwd),socId:null,createdAt:today()};
LS.set("lgm_users",[...users,newUser]);
onSave(newUser);
};
return(
<div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
<div style={{width:440,maxWidth:"96vw"}}>
<div style={{textAlign:"center",marginBottom:28}}>
<div style={{width:56,height:56,background:"#e8a020",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#1a2332",fontSize:26,margin:"0 auto 12px"}}>M</div>
<div style={{color:"#fff",fontWeight:900,fontSize:20}}>Créer un compte MGCLOUD</div>
<div style={{color:"rgba(255,255,255,.4)",fontSize:13,marginTop:4}}>Un compte = une société</div>
</div>
<div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:28}}>
{[["Votre nom","text",nom,setNom,"Ex: Mohammed Alami"],["Email","email",email,setEmail,"votre@email.com"],["Mot de passe","password",pwd,setPwd,"6 caractères minimum"],["Confirmer mot de passe","password",pwd2,setPwd2,"Répétez le mot de passe"]].map(([l,t,v,s,p])=>(
<div key={l} style={{marginBottom:14}}>
<label style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{l}</label>
<input style={{...S.inp,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",width:"100%"}}
type={t} value={v} onChange={e=>{s(e.target.value);setErr("");}} placeholder={p}/>
</div>
))}
{err&&<div style={{background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.3)",borderRadius:8,padding:"10px 14px",color:"#fca5a5",fontSize:13,marginBottom:14}}>⚠ {err}</div>}
<button onClick={submit} style={{width:"100%",background:"#e8a020",color:"#1a2332",border:"none",borderRadius:9,padding:"13px 0",fontWeight:900,fontSize:15,cursor:"pointer",marginBottom:12}}>
Créer mon compte →
</button>
<button onClick={onBack} style={{width:"100%",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
← Retour à la connexion
</button>
</div>
</div>
</div>
);
}

export default function App(){
// Restaurer session depuis localStorage au démarrage
const [screen, setScreen] = useState(()=>{
const sess = LS.get("lgm_session");
if(sess?.userId){
const users = LS.get("lgm_users")||[];
const u = users.find(x=>x.id===sess.userId);
if(u) return u.socId ? "erp" : "soc-form";
}
return "login";
});
const [curUser, setCurUser] = useState(()=>{
const sess = LS.get("lgm_session");
if(sess?.userId){
const users = LS.get("lgm_users")||[];
return users.find(x=>x.id===sess.userId)||null;
}
return null;
});
const [dataMap, setDataMap] = useState(()=>{
// Pré-charger les données ERP si session active
const sess = LS.get("lgm_session");
if(sess?.userId){
const users = LS.get("lgm_users")||[];
const u = users.find(x=>x.id===sess.userId);
if(u?.socId){
const saved = LS.get("lgm_d_"+u.socId);
if(saved) return {[u.socId]: saved};
}
}
return {};
});
const curSocRef = useRef(null);

// Initialiser curSocRef si session active
useEffect(()=>{
const sess = LS.get("lgm_session");
if(sess?.userId){
const users = LS.get("lgm_users")||[];
const u = users.find(x=>x.id===sess.userId);
if(u?.socId){
const soc = LS.get("lgm_soc_"+u.socId);
if(soc) curSocRef.current = soc;
}
}
},[]);

const stableSetData = useCallback((fn)=>{
setDataMap(prev=>{
const id=curSocRef.current?.id;
if(!id) return prev;
const cur=prev[id]||{...INIT};
const next=typeof fn==="function"?fn(cur):fn;
LS.set("lgm_d_"+id,next);
return {...prev,[id]:next};
});
},[]);

const makeInitData=(soc)=>({
...INIT,
societe:{...INIT.societe,
raisonSociale:soc.nom||"",nomCommercial:soc.nom||"",
formeJuridique:soc.forme||"SARL",ville:soc.ville||"",
tel:soc.tel||"",ice:soc.ice||"",rc:soc.rc||"",
couleurPrincipale:soc.couleur||"#1a2332",couleurAccent:"#e8a020",
}
});

const getErpData=(soc)=>{
if(dataMap[soc.id]) return dataMap[soc.id];
const saved=LS.get("lgm_d_"+soc.id);
return saved?saved:makeInitData(soc);
};

const handleLogin=(user, remember)=>{
setCurUser(user);
// Sauvegarder session si "Se souvenir"
if(remember) LS.set("lgm_session",{userId:user.id,at:Date.now()});
else LS.del("lgm_session");
if(user.socId){
const soc=LS.get("lgm_soc_"+user.socId);
if(soc){
curSocRef.current=soc;
const saved=LS.get("lgm_d_"+soc.id)||makeInitData(soc);
setDataMap(prev=>({...prev,[soc.id]:saved}));
setScreen("erp");
return;
}
}
setScreen("soc-form");
};

const handleRegister=(user)=>{
setCurUser(user);
LS.set("lgm_session",{userId:user.id,at:Date.now()});
setScreen("soc-form");
};

const handleSaveSoc=(soc)=>{
LS.set("lgm_soc_"+soc.id,soc);
const users=LS.get("lgm_users")||[];
const updUsers=users.map(u=>u.id===curUser.id?{...u,socId:soc.id}:u);
LS.set("lgm_users",updUsers);
// Mettre à jour session
const sess=LS.get("lgm_session");
if(sess) LS.set("lgm_session",{...sess,userId:curUser.id});
setCurUser(prev=>({...prev,socId:soc.id}));
const initData=makeInitData(soc);
setDataMap(prev=>({...prev,[soc.id]:initData}));
LS.set("lgm_d_"+soc.id,initData);
curSocRef.current=soc;
setScreen("erp");
};

const handleLogout=()=>{
LS.del("lgm_session");
setCurUser(null);
curSocRef.current=null;
setScreen("login");
};

const curSoc=curUser?.socId?LS.get("lgm_soc_"+curUser.socId):null;

if(screen==="login")    return <LoginScreen onLogin={handleLogin} onRegister={()=>setScreen("register")}/>;
if(screen==="register") return <RegisterScreen onSave={handleRegister} onBack={()=>setScreen("login")}/>;
if(screen==="soc-form") return <SocieteForm soc={null} onSave={handleSaveSoc} onCancel={handleLogout}/>;
if(screen==="erp"&&curSoc)
return <ERPApp key={curSoc.id} societeActive={curSoc} data={getErpData(curSoc)} setData={stableSetData} onLogout={handleLogout} curUser={curUser}/>;
return <LoginScreen onLogin={handleLogin} onRegister={()=>setScreen("register")}/>;
}
// ── MenuEditorModal ────────────────────────────────────
function MenuEditorModal({menuPerso,MENU_FILTERED,onSave,onClose}){
const [wm,setWm]=useState(()=>menuPerso?JSON.parse(JSON.stringify(menuPerso)):JSON.parse(JSON.stringify(MENU_FILTERED)));
const [editGrp,setEditGrp]=useState(null);
const allItems=MENU_FILTERED.flatMap(g=>g.children||[]);
const toggleGrp=(id)=>setWm(p=>p.map(g=>g.id!==id?g:{...g,_hidden:!g._hidden}));
const removeItem=(grpId,itemId)=>setWm(p=>p.map(g=>g.id!==grpId?g:{...g,children:g.children.filter(c=>c.id!==itemId)}));
const addItem=(grpId,item)=>setWm(p=>p.map(g=>g.id!==grpId?g:{...g,children:[...g.children,item]}));
return(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",zIndex:800,display:"flex",alignItems:"stretch"}}>
<div style={{width:460,maxWidth:"95vw",background:"#fff",display:"flex",flexDirection:"column",boxShadow:"8px 0 40px rgba(0,0,0,.25)"}}>
<div style={{padding:"14px 20px",background:"#1a2332",display:"flex",alignItems:"center",gap:10}}>
<span style={{fontWeight:800,fontSize:15,color:"#fff",flex:1}}>Personnaliser le menu</span>
<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"rgba(255,255,255,.6)"}}>x</button>
</div>
<div style={{flex:1,overflowY:"auto",padding:12}}>
{wm.map(grp=>(
<div key={grp.id} style={{marginBottom:8,border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden",opacity:grp._hidden?0.5:1}}>
<div style={{background:grp._hidden?"#f8fafc":"#1a2332",padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
<input type="checkbox" checked={!grp._hidden} onChange={()=>toggleGrp(grp.id)} style={{accentColor:"#e8a020",width:14,height:14}}/>
{editGrp===grp.id?(
<input autoFocus style={{flex:1,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",borderRadius:4,padding:"2px 8px",color:"#fff",fontSize:12}}
value={grp.label}
onChange={e=>setWm(p=>p.map(g=>g.id===grp.id?{...g,label:e.target.value}:g))}
onBlur={()=>setEditGrp(null)}
onKeyDown={e=>e.key==="Enter"&&setEditGrp(null)}/>
):(
<span onClick={()=>setEditGrp(grp.id)} style={{flex:1,color:grp._hidden?"#94a3b8":"#fff",fontWeight:700,fontSize:11,textTransform:"uppercase",cursor:"text"}}>
{grp.icon} {grp.label}
</span>
)}
<span style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{grp.children.length} item(s)</span>
</div>
{!grp._hidden&&(
<div style={{padding:"6px 8px",background:"#fafbfc"}}>
{grp.children.map(item=>(
<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:5,marginBottom:2,background:"#fff",border:"1px solid #f0f4f8"}}>
<span style={{fontSize:13}}>{item.icon}</span>
<span style={{flex:1,fontSize:12}}>{item.label}</span>
<button onClick={()=>removeItem(grp.id,item.id)} style={{background:"#fef2f2",border:"none",borderRadius:4,padding:"2px 6px",cursor:"pointer",color:"#dc2626",fontSize:10}}>x</button>
</div>
))}
{(()=>{
const used=wm.flatMap(g=>g.children.map(c=>c.id));
const orig=MENU_FILTERED.find(g=>g.id===grp.id);
const avail=(orig?.children||[]).filter(x=>!used.includes(x.id));
if(!avail.length)return null;
return(
<div style={{marginTop:4,paddingTop:4,borderTop:"1px dashed #e2e8f0"}}>
<div style={{fontSize:10,color:"#94a3b8",marginBottom:4}}>Ajouter :</div>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
{avail.map(item=>(
<button key={item.id} onClick={()=>addItem(grp.id,item)}
style={{...S.badge,background:"#f0fdf4",color:"#16a34a",cursor:"pointer",border:"1px solid #86efac",fontSize:10}}>
{"+ "}{item.icon} {item.label}
</button>
))}
</div>
</div>
);
})()}
</div>
)}
</div>
))}
</div>
<div style={{padding:"12px 16px",borderTop:"1px solid #f0f4f8",display:"flex",gap:8}}>
<button style={{...S.btnS,flex:1,fontSize:11}} onClick={()=>{onSave(null);onClose();}}>Rétablir par défaut</button>
<button style={{...S.btnP,flex:2,background:"#1a2332",fontSize:11}} onClick={()=>{onSave(wm.filter(g=>!g._hidden));onClose();}}>Enregistrer</button>
</div>
</div>
<div style={{flex:1}} onClick={onClose}/>
</div>
);
}

function ERPApp({societeActive, data, setData, onLogout, curUser}){
const [saveMsg,  setSaveMsg ] = useState(null);
const [page,     setPage    ] = useState("dashboard");
const [open,     setOpen    ] = useState({referentiels:true,stock:false,achats:false,ventes:false,statistiques:false,administration:false});
const [showReset,setShowReset] = useState(false);
const [importErr,setImportErr] = useState("");
const [autoSaveInfo,setAutoSaveInfo]=useState(null); // {date, nb}

// ── Auto-sauvegarde ────────────────────────────────────
const AUTO_SAVE_KEY="mgcloud_autosave_"+societeActive?.id;
const AUTO_SAVE_META_KEY="mgcloud_autosave_meta_"+societeActive?.id;
const AUTO_SAVE_INTERVAL=5*60*1000; // 5 minutes

// Lire infos dernière auto-save au démarrage
useEffect(()=>{
try{
const meta=localStorage.getItem(AUTO_SAVE_META_KEY);
if(meta)setAutoSaveInfo(JSON.parse(meta));
}catch(e){}
},[]);

// Auto-save toutes les 5 minutes
useEffect(()=>{
const timer=setInterval(()=>{
try{
const backup={version:"1.0",date:new Date().toISOString(),auto:true,data};
localStorage.setItem(AUTO_SAVE_KEY,JSON.stringify(backup));
const meta={date:new Date().toISOString(),nb:(data.clients||[]).length+(data.articles||[]).length+Object.values(data.documents||{}).flat().length};
localStorage.setItem(AUTO_SAVE_META_KEY,JSON.stringify(meta));
setAutoSaveInfo(meta);
}catch(e){}
},AUTO_SAVE_INTERVAL);
return()=>clearInterval(timer);
},[data]);

// Auto-save à chaque modification importante (debounce 30s)
const autoSaveTimerRef=useRef(null);
const triggerAutoSave=useCallback((newData)=>{
if(autoSaveTimerRef.current)clearTimeout(autoSaveTimerRef.current);
autoSaveTimerRef.current=setTimeout(()=>{
try{
const backup={version:"1.0",date:new Date().toISOString(),auto:true,data:newData};
localStorage.setItem(AUTO_SAVE_KEY,JSON.stringify(backup));
const meta={date:new Date().toISOString(),nb:(newData.clients||[]).length+(newData.articles||[]).length+Object.values(newData.documents||{}).flat().length};
localStorage.setItem(AUTO_SAVE_META_KEY,JSON.stringify(meta));
setAutoSaveInfo(meta);
}catch(e){}
},30000); // 30 secondes après la dernière modif
},[]);

// ── Journal des mouvements ────────────────────────────────
const JOURNAL_KEY="mgcloud_journal_"+societeActive?.id;
const MAX_JOURNAL=500; // garder les 500 derniers mouvements

const addJournal=useCallback((action,details,prev,next)=>{
try{
const entry={
id:uid("JRN"),
date:new Date().toISOString(),
user:curUser?.nom||"Utilisateur",
action,
details,
};
const existing=JSON.parse(localStorage.getItem(JOURNAL_KEY)||"[]");
const updated=[entry,...existing].slice(0,MAX_JOURNAL);
localStorage.setItem(JOURNAL_KEY,JSON.stringify(updated));
}catch(e){}
},[JOURNAL_KEY,curUser]);

// Détecter automatiquement l'action selon les données modifiées
const detectAction=useCallback((prev,next)=>{
if(!prev||!next)return{action:"Modification",details:""};

// Documents
const docTypes=Object.keys(next.documents||{});
for(const dt of docTypes){
const prevDocs=(prev.documents?.[dt]||[]);
const nextDocs=(next.documents?.[dt]||[]);
if(nextDocs.length>prevDocs.length){
const newDoc=nextDocs.find(d=>!prevDocs.some(p=>p.id===d.id));
return{action:`Nouveau ${DOC_CFG[dt]?.titre||dt}`,details:`${newDoc?.ref||""} — ${(prev.clients||prev.fournisseurs||[]).find?.(t=>t?.id===newDoc?.tiers)?.nom||""}`};
}
if(nextDocs.length<prevDocs.length){
const delDoc=prevDocs.find(d=>!nextDocs.some(n=>n.id===d.id));
return{action:`Suppression ${DOC_CFG[dt]?.titre||dt}`,details:`${delDoc?.ref||""}`};
}
const modDoc=nextDocs.find(d=>{
const p=prevDocs.find(x=>x.id===d.id);
return p&&p.statut!==d.statut;
});
if(modDoc){
const prevDoc=prevDocs.find(x=>x.id===modDoc.id);
return{action:`Statut ${DOC_CFG[dt]?.titre||dt}`,details:`${modDoc.ref}: ${prevDoc?.statut} → ${modDoc.statut}`};
}
}
// Clients
if((next.clients||[]).length>(prev.clients||[]).length){
const c=(next.clients||[]).find(x=>!(prev.clients||[]).some(p=>p.id===x.id));
return{action:"Nouveau client",details:`${c?.code||""} — ${c?.nom||""}`};
}
if((next.clients||[]).length<(prev.clients||[]).length){
const c=(prev.clients||[]).find(x=>!(next.clients||[]).some(n=>n.id===x.id));
return{action:"Suppression client",details:`${c?.code||""} — ${c?.nom||""}`};
}
// Fournisseurs
if((next.fournisseurs||[]).length>(prev.fournisseurs||[]).length){
const f=(next.fournisseurs||[]).find(x=>!(prev.fournisseurs||[]).some(p=>p.id===x.id));
return{action:"Nouveau fournisseur",details:`${f?.code||""} — ${f?.nom||""}`};
}
// Articles
if((next.articles||[]).length>(prev.articles||[]).length){
const a=(next.articles||[]).find(x=>!(prev.articles||[]).some(p=>p.id===x.id));
return{action:"Nouvel article",details:`${a?.ref||""} — ${a?.designation||""}`};
}
if((next.articles||[]).length<(prev.articles||[]).length){
const a=(prev.articles||[]).find(x=>!(next.articles||[]).some(n=>n.id===x.id));
return{action:"Suppression article",details:`${a?.ref||""} — ${a?.designation||""}`};
}
// Règlements
const prevRV=(prev.reglementsVente||[]).length+(prev.reglementsAchat||[]).length;
const nextRV=(next.reglementsVente||[]).length+(next.reglementsAchat||[]).length;
if(nextRV>prevRV){
const newR=[...(next.reglementsVente||[]),...(next.reglementsAchat||[])].find(r=>
![...(prev.reglementsVente||[]),...(prev.reglementsAchat||[])].some(p=>p.id===r.id)
);
return{action:"Règlement enregistré",details:`${newR?.factureRef||""} — ${fmt(newR?.montant||0)} DH — ${newR?.mode||""}`};
}
// Stock
if(JSON.stringify(next.stockDepots)!==JSON.stringify(prev.stockDepots)){
return{action:"Mouvement stock",details:"Mise à jour stock"};
}
return{action:"Modification",details:""};
},[]);

const wrappedSetData = useCallback((fn)=>{
setData(prev=>{
const next=typeof fn==="function"?fn(prev):fn;
triggerAutoSave(next);
// Journal
const {action,details}=detectAction(prev,next);
addJournal(action,details,prev,next);
return next;
});
setSaveMsg({ok:true,msg:"Sauvegardé ✓"});
setTimeout(()=>setSaveMsg(null),2000);
},[setData,triggerAutoSave,detectAction,addJournal]);
const exportJSON = () => {
try{
const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url; a.download=(data.societe.nomCommercial||"logicomar")+"_backup_"+today()+".json";
document.body.appendChild(a); a.click(); document.body.removeChild(a);
URL.revokeObjectURL(url);
}catch(e){ try{ navigator.clipboard.writeText(JSON.stringify(data,null,2)); setSaveMsg({ok:true,msg:"Copié ✓"}); setTimeout(()=>setSaveMsg(null),3000); }catch(e2){} }
};
const importJSON = (e) => {
const file=e.target.files?.[0]; if(!file) return;
const reader=new FileReader();
reader.onload=(ev)=>{
try{
const parsed=JSON.parse(ev.target.result);
if(!parsed.societe||!parsed.articles) throw new Error("Fichier invalide");
wrappedSetData(mergeWithInit(parsed)||parsed);
setImportErr("");
setSaveMsg({ok:true,msg:"Import réussi ✓"}); setTimeout(()=>setSaveMsg(null),3000);
}catch(err){ setImportErr(err.message||"Erreur"); }
};
reader.readAsText(file); e.target.value="";
};
const doReset = () => {
wrappedSetData({...INIT,societe:{...societeActive}});
setShowReset(false);
};
const nbAlertes=data.articles.filter(a=>stockTotal(data.stockDepots,a.id)<=a.stockMin).length;
const curRole=data.roles?.find(r=>r.id===curUser?.role);
// Lire les droits depuis data.utilisateurs (toujours à jour) ou curUser
const curUserFresh = data.utilisateurs?.find(u=>u.id===curUser?.id) || curUser;
const userDroits = curUserFresh?.droits || DROITS_DEF.map(d=>d.id);
const isAdmin = !curUserFresh?.role || curUserFresh?.role==="admin" || userDroits.includes("administration");
const hasDroit=(d)=>{
if(!d) return true;
if(isAdmin) return true;
return userDroits.includes(d);
};
// Menu filtré selon droits
const MENU_FILTERED=MENU.map(grp=>({
...grp,
children:(grp.children||[]).filter(item=>hasDroit(item.droit))
})).filter(grp=>hasDroit(grp.droit)||grp.children?.length>0);
const curGroup=MENU_FILTERED.find(g=>g.children?.some(c=>c.id===page));
const curItem=MENU_FILTERED.flatMap(g=>g.children||[]).find(c=>c.id===page);
const renderPage=()=>{
// Vérifier accès à la page courante
const pageItem=MENU.flatMap(g=>g.children||[]).find(c=>c.id===page);
if(pageItem&&!hasDroit(pageItem.droit)) return(
<div style={{...S.card,padding:40,textAlign:"center"}}>
<div style={{fontSize:48,marginBottom:12}}>🔒</div>
<div style={{fontWeight:800,fontSize:16,color:"#1a2332",marginBottom:8}}>Accès refusé</div>
<div style={{color:"#64748b",fontSize:13}}>Vous n'avez pas les droits pour accéder à ce module.</div>
<div style={{marginTop:8,fontSize:12,color:"#94a3b8"}}>Contactez votre administrateur.</div>
</div>
);
if(page==="dashboard") return <Dashboard data={data}/>;
if(["fam-clients","sous-fam-clients","fam-fournisseurs","sous-fam-fournisseurs","fam-articles","sous-fam-articles"].includes(page))
return <FamillesModule data={data} setData={wrappedSetData} type={page}/>;
if(page==="clients")      return <TiersModule data={data} setData={wrappedSetData} type="clients"/>;
if(page==="fournisseurs") return <TiersModule data={data} setData={wrappedSetData} type="fournisseurs"/>;
if(page==="articles")     return <ArticlesModule data={data} setData={wrappedSetData}/>;
if(page==="stock-etat")       return <StockEtatModule data={data}/>;
if(page==="stock-global")     return <StockGlobal data={data}/>;
if(page==="stock-inventaire") return <StockInventaire data={data} setData={wrappedSetData}/>;
if(page==="stock-agences")    return <StockParAgence data={data} setData={wrappedSetData}/>;
if(page==="stock-mvt")        return <StockMvtModule data={data}/>;
if(page==="stock-article")    return <StockArticleModule data={data}/>;
if(page==="stock-alertes") return(
<div style={S.card}>
<div style={S.hdr}><span>⚠️</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Alertes Stock</span><span style={{...S.badge,background:"#fef2f2",color:"#dc2626",marginLeft:4}}>{nbAlertes}</span></div>
<div style={{padding:20}}>
{data.articles.filter(a=>stockTotal(data.stockDepots,a.id)<=a.stockMin).length===0
?<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>✅ Aucune alerte</div>
:data.articles.filter(a=>stockTotal(data.stockDepots,a.id)<=a.stockMin).map(a=>{
const tot=stockTotal(data.stockDepots,a.id);
const sc=tot<=0?"#dc2626":"#d97706";
return(
<div key={a.id} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"12px 16px",background:tot<=0?"#fef2f2":"#fffbeb",border:"1px solid "+(tot<=0?"#fecaca":"#fed7aa"),borderRadius:8,marginBottom:8}}>
<span style={{fontSize:22}}>{tot<=0?"🔴":"🟡"}</span>
<div style={{flex:1}}>
<div style={{fontWeight:700}}>{a.ref} -- {a.designation}</div>
<div style={{fontSize:12,color:"#64748b",marginTop:3}}>Stock: <strong style={{color:sc}}>{tot}</strong> / Min: {a.stockMin}</div>
</div>
<span style={{...S.badge,background:tot<=0?"#fef2f2":"#fffbeb",color:sc}}>{tot<=0?"Rupture":"Critique"}</span>
</div>
);
})}
</div>
</div>
);
if(page==="regl-achat") return <ReglementsModule data={data} setData={wrappedSetData} type="achat"/>;
if(page==="regl-vente") return <ReglementsModule data={data} setData={wrappedSetData} type="vente"/>;
if(page==="stats-ventes")    return <StatistiquesModule data={data} type="ventes"/>;
if(page==="stats-achats")    return <StatistiquesModule data={data} type="achats"/>;
if(page==="stats-par-client")return <StatistiquesModule data={data} type="ventes"/>;
if(page==="stats-par-fourn") return <StatistiquesModule data={data} type="achats"/>;
if(page==="stats-articles") return <StatistiquesModule data={data} type="articles"/>;
if(page==="stats-clients")  return <StatistiquesModule data={data} type="clients"/>;
if(page==="treso-caisses")    return <TresorerieModule data={data} setData={wrappedSetData} subPage="treso-caisses"/>;
if(page==="treso-banques")    return <TresorerieModule data={data} setData={wrappedSetData} subPage="treso-banques"/>;
if(page==="treso-mvt")        return <TresorerieModule data={data} setData={wrappedSetData} subPage="treso-mvt"/>;
if(page==="treso-rapproch")   return <TresorerieModule data={data} setData={wrappedSetData} subPage="treso-rapproch"/>;
if(page==="balance-clients")      return <BalanceModule data={data} type="clients"/>;
if(page==="balance-fournisseurs") return <BalanceModule data={data} type="fournisseurs"/>;
if(DOC_CFG[page]) return <DocModule data={data} setData={wrappedSetData} docType={page} navigateTo={setPage}/>;
if(page==="agences-admin") return <AgencesDepotsModule data={data} setData={wrappedSetData}/>;
if(page==="commerciaux")     return <CommerciauxModule data={data} setData={wrappedSetData}/>;
if(page==="tva-admin")        return <TvaAdminModule data={data} setData={wrappedSetData}/>;
if(page==="plan-comptable")  return <PlanComptableModule data={data} setData={wrappedSetData}/>;
if(page==="champs-entete-doc") return <ChampsEnteteDocModule data={data} setData={wrappedSetData}/>;
if(page==="champs-calcules") return <ChampCalcModule data={data} setData={wrappedSetData}/>;
if(page==="series-doc") return <SeriesDocModule data={data} setData={wrappedSetData}/>;
if(page==="numerotation")  return <NumerotationModule data={data} setData={wrappedSetData}/>;
if(page==="sauvegarde")    return <SauvegardeModule data={data} setData={wrappedSetData} societeActive={societeActive}/>;
if(page==="journal")       return <JournalModule societeActive={societeActive} curUser={curUser}/>;
if(page==="societe"){
const soc=data.societe||{};
const upd=(k,v)=>wrappedSetData(p=>({...p,societe:{...p.societe,[k]:v}}));
const THEMES=[
{id:"dark-blue",nom:"Bleu Nuit",   cP:"#1a2332",cA:"#e8a020"},
{id:"blue",     nom:"Bleu Océan",  cP:"#1a56db",cA:"#f59e0b"},
{id:"purple",   nom:"Violet",      cP:"#4c1d95",cA:"#e8a020"},
{id:"green",    nom:"Vert",        cP:"#064e3b",cA:"#10b981"},
{id:"red",      nom:"Rouge",       cP:"#7f1d1d",cA:"#f97316"},
{id:"dark",     nom:"Sombre",      cP:"#0f172a",cA:"#38bdf8"},
{id:"slate",    nom:"Ardoise",     cP:"#334155",cA:"#e8a020"},
{id:"brown",    nom:"Marron",      cP:"#422006",cA:"#f59e0b"},
];
const FONTS=[
{f:"'Segoe UI',system-ui,sans-serif", l:"Segoe UI"},
{f:"'Inter',system-ui,sans-serif",    l:"Inter"},
{f:"'Roboto',system-ui,sans-serif",   l:"Roboto"},
{f:"'Poppins',system-ui,sans-serif",  l:"Poppins"},
{f:"Georgia,serif",                     l:"Georgia"},
{f:"'Courier New',monospace",          l:"Monospace"},
];
const SIZES=[{id:"sm",l:"Compact",fs:12},{id:"md",l:"Normal",fs:13},{id:"lg",l:"Grand",fs:14}];
return(
<div>
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}><span>🏢</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Informations société</span>
<button style={{...S.btnP,marginLeft:"auto"}} onClick={()=>wrappedSetData(p=>({...p,societe:{...p.societe}}))}>✓ Enregistrer</button>
</div>
<div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
{[["raisonSociale","Raison sociale"],["nomCommercial","Nom commercial"],["formeJuridique","Forme juridique"],["tel","Téléphone"],["email","Email"],["ice","ICE"],["rc","RC"],["if_","IF"],["patente","Patente"],["ville","Ville"],["cp","Code postal"]].map(([k,l])=>(
<div key={k} style={{marginBottom:12}}>
<label style={S.lbl}>{l}</label>
<input style={S.inp} value={soc[k]||""} onChange={e=>upd(k,e.target.value)}/>
</div>
))}
{[["adresse","Adresse"],["piedPage","Pied de page"],["mentionsLegales","Mentions légales"]].map(([k,l])=>(
<div key={k} style={{marginBottom:12,gridColumn:"1/-1"}}>
<label style={S.lbl}>{l}</label>
<input style={S.inp} value={soc[k]||""} onChange={e=>upd(k,e.target.value)}/>
</div>
))}
</div>
</div>
<div style={{...S.card,marginBottom:14}}>
<div style={S.hdr}><span>🎨</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Thème & Couleurs</span></div>
<div style={{padding:20}}>
<div style={{marginBottom:20}}>
<label style={S.lbl}>Thèmes prédéfinis</label>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:8}}>
{THEMES.map(t=>(
<div key={t.id} onClick={()=>{upd("couleurPrincipale",t.cP);upd("couleurAccent",t.cA);}}
style={{cursor:"pointer",borderRadius:10,overflow:"hidden",border:"2px solid "+(soc.couleurPrincipale===t.cP?"#1a56db":"#e2e8f0"),transform:soc.couleurPrincipale===t.cP?"scale(1.04)":"scale(1)",transition:"transform .1s"}}>
<div style={{background:t.cP,height:36,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
<div style={{width:14,height:14,borderRadius:3,background:t.cA}}/>
<div style={{width:24,height:5,borderRadius:3,background:"rgba(255,255,255,.3)"}}/>
</div>
<div style={{background:"#f8fafc",padding:"5px 0",fontSize:11,fontWeight:600,color:"#1a2332",textAlign:"center"}}>{t.nom}</div>
</div>
))}
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",marginBottom:20}}>
<div>
<label style={S.lbl}>Couleur principale (sidebar)</label>
<div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
{["#1a2332","#0f172a","#1a56db","#4c1d95","#064e3b","#7f1d1d","#334155","#0c4a6e","#422006","#1c1917"].map(c=>(
<div key={c} onClick={()=>upd("couleurPrincipale",c)} style={{width:26,height:26,background:c,borderRadius:5,cursor:"pointer",outline:soc.couleurPrincipale===c?"3px solid #e8a020":"none",outlineOffset:1}}/>
))}
</div>
<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
<input type="color" value={soc.couleurPrincipale||"#1a2332"} onChange={e=>upd("couleurPrincipale",e.target.value)} style={{width:36,height:26,borderRadius:5,border:"1px solid #e2e8f0",cursor:"pointer",padding:1}}/>
<span style={{fontSize:11,fontFamily:"monospace",color:"#64748b"}}>{soc.couleurPrincipale||"#1a2332"}</span>
</div>
</div>
<div>
<label style={S.lbl}>Couleur accent</label>
<div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
{["#e8a020","#f59e0b","#10b981","#3b82f6","#ec4899","#f97316","#38bdf8","#a78bfa","#34d399","#fb7185"].map(c=>(
<div key={c} onClick={()=>upd("couleurAccent",c)} style={{width:26,height:26,background:c,borderRadius:5,cursor:"pointer",outline:soc.couleurAccent===c?"3px solid #1a56db":"none",outlineOffset:1}}/>
))}
</div>
<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
<input type="color" value={soc.couleurAccent||"#e8a020"} onChange={e=>upd("couleurAccent",e.target.value)} style={{width:36,height:26,borderRadius:5,border:"1px solid #e2e8f0",cursor:"pointer",padding:1}}/>
<span style={{fontSize:11,fontFamily:"monospace",color:"#64748b"}}>{soc.couleurAccent||"#e8a020"}</span>
</div>
</div>
</div>
<div style={{marginBottom:20}}>
<label style={S.lbl}>Police de caractères</label>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:8}}>
{FONTS.map(({f,l})=>(
<div key={l} onClick={()=>upd("fontFamily",f)} style={{padding:"8px 10px",borderRadius:8,border:"2px solid "+(soc.fontFamily===f?"#1a56db":"#e2e8f0"),cursor:"pointer",textAlign:"center",background:soc.fontFamily===f?"#eef2ff":"#f8fafc"}}>
<span style={{fontFamily:f,fontSize:13,fontWeight:600,color:soc.fontFamily===f?"#1a56db":"#1a2332"}}>{l}</span>
<div style={{fontSize:10,color:"#94a3b8",fontFamily:f}}>Abc 123</div>
</div>
))}
</div>
</div>
<div style={{marginBottom:20}}>
<label style={S.lbl}>Taille du texte</label>
<div style={{display:"flex",gap:10,marginTop:8}}>
{SIZES.map(s=>(
<div key={s.id} onClick={()=>upd("fontSize",s.fs)} style={{flex:1,padding:"10px 0",borderRadius:8,border:"2px solid "+(soc.fontSize===s.fs?"#1a56db":"#e2e8f0"),cursor:"pointer",textAlign:"center",background:soc.fontSize===s.fs?"#eef2ff":"#f8fafc"}}>
<div style={{fontSize:s.fs,fontWeight:700,color:soc.fontSize===s.fs?"#1a56db":"#1a2332"}}>{s.l}</div>
<div style={{fontSize:10,color:"#94a3b8"}}>{s.fs}px</div>
</div>
))}
</div>
</div>
<div>
<label style={S.lbl}>Aperçu en temps réel</label>
<div style={{marginTop:8,borderRadius:10,overflow:"hidden",border:"1px solid #e2e8f0",display:"flex",height:130}}>
<div style={{width:170,background:soc.couleurPrincipale||"#1a2332",padding:10,display:"flex",flexDirection:"column",gap:6}}>
<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
<div style={{width:26,height:26,background:soc.couleurAccent||"#e8a020",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:soc.couleurPrincipale||"#1a2332",fontSize:12}}>{(soc.nomCommercial||soc.appNom||"M")[0]}</div>
<div style={{color:"#fff",fontWeight:800,fontSize:11,fontFamily:soc.fontFamily||"inherit"}}>{soc.appNom||"MGCLOUD ERP"}</div>
</div>
{["🏠 Tableau de bord","👤 Clients","🔩 Articles"].map((item,i)=>(
<div key={i} style={{padding:"4px 6px",borderRadius:4,background:i===0?"rgba(255,255,255,.1)":"transparent",borderLeft:i===0?"2px solid "+(soc.couleurAccent||"#e8a020"):"2px solid transparent",color:i===0?(soc.couleurAccent||"#e8a020"):"rgba(255,255,255,.6)",fontSize:10,fontFamily:soc.fontFamily||"inherit"}}>{item}</div>
))}
</div>
<div style={{flex:1,background:"#f8fafc",padding:14}}>
<div style={{fontWeight:800,fontSize:soc.fontSize||13,color:"#1a2332",fontFamily:soc.fontFamily||"inherit",marginBottom:8}}>Tableau de bord</div>
<div style={{display:"flex",gap:6}}>
{[soc.couleurPrincipale||"#1a2332","#1a56db","#16a34a"].map((c,i)=>(
<div key={i} style={{flex:1,background:c+"18",borderLeft:"3px solid "+c,borderRadius:6,padding:"5px 7px"}}>
<div style={{fontWeight:800,fontSize:soc.fontSize||13,color:c}}>--</div>
<div style={{fontSize:9,color:"#64748b",fontFamily:soc.fontFamily||"inherit"}}>KPI</div>
</div>
))}
</div>
</div>
</div>
</div>
</div>
</div>
<div style={S.card}>
<div style={S.hdr}><span>✏️</span><span style={{fontWeight:800,fontSize:14,color:"#1a2332",marginLeft:6}}>Nom de l'application</span></div>
<div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
<div>
<label style={S.lbl}>Nom affiché</label>
<input style={S.inp} value={soc.appNom||"MGCLOUD ERP"} onChange={e=>upd("appNom",e.target.value)} placeholder="MGCLOUD ERP"/>
</div>
<div>
<label style={S.lbl}>Sous-titre</label>
<input style={S.inp} value={soc.appSoustitre||"GARANTIE DISTRIBUTION"} onChange={e=>upd("appSoustitre",e.target.value)}/>
</div>
</div>
</div>
</div>
);
}
if(page==="utilisateurs") return <UtilisateursModule data={data} setData={wrappedSetData} curUser={curUser} societeId={societeActive?.id}/>;

return <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Module en cours de développement</div>;
};
const [showMenuEditor,setShowMenuEditor]=useState(false);
const LS_MENU_KEY="lgm_menu_perso_"+societeActive?.id;
const [menuPerso,setMenuPersoRaw]=useState(()=>LS.get(LS_MENU_KEY)||null);
const setMenuPerso=(v)=>{LS.set(LS_MENU_KEY,v);setMenuPersoRaw(v);};

// Menu actif : perso si défini, sinon MENU_FILTERED
const MENU_ACTIVE=(menuPerso||MENU_FILTERED).map(grp=>({
...grp,
children:(grp.children||[]).filter(item=>{
const original=MENU_FILTERED.flatMap(g=>g.children||[]).find(x=>x.id===item.id);
if(!original)return false;
const droit=original.droit;
return !droit||hasDroit(curUser,droit,"lire");
})
})).filter(g=>g.children?.length>0);

return(
<div style={{display:"flex",height:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:13,background:"#f0f4f8",overflow:"hidden"}}>
<style>{`*{box-sizing:border-box;}input,select,textarea{font-family:inherit;font-size:13px;}input:focus,select:focus,textarea:focus{border-color:#1a56db!important;outline:none;}.ni:hover{background:rgba(255,255,255,.08)!important;}tr:hover td{background:#f7f9fc;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}`}</style>
<div style={{width:252,background:data.societe?.couleurPrincipale||"#1a2332",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
<div style={{padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:38,height:38,background:data.societe?.couleurAccent||"#e8a020",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:data.societe?.couleurPrincipale||"#1a2332",fontSize:18,flexShrink:0}}>
{(data.societe?.nomCommercial||"L")[0]}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{color:"#fff",fontWeight:800,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{data.societe?.nomCommercial||"MGCLOUD"}</div>
<div style={{color:data.societe?.couleurAccent||"#e8a020",fontSize:9,letterSpacing:".1em"}}>ERP</div>
</div>
{/* Bouton personnaliser menu */}
<button onClick={()=>setShowMenuEditor(true)}
title="Personnaliser le menu"
style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:5,padding:"4px 6px",cursor:"pointer",color:"rgba(255,255,255,.6)",fontSize:12,flexShrink:0}}>
⚙
</button>
</div>
<button onClick={onLogout} style={{marginTop:10,width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"6px 10px",color:"rgba(255,255,255,.6)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>
<span>🔄</span><span style={{flex:1,textAlign:"left"}}>Changer de société</span>
</button>
</div>
<div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:9}}>
<div style={{width:30,height:30,borderRadius:"50%",background:avatarC(curUser?.nom||"A"),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:11}}>{initials(curUser?.nom||"A")}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{color:"#fff",fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{curUser?.nom||"Utilisateur"}</div>
{curRole&&<span style={{background:curRole.couleur+"44",color:"#fff",borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:600}}>{curRole.nom}</span>}
</div>
</div>
<div className="ni" onClick={()=>setPage("dashboard")} style={{padding:"10px 16px",cursor:"pointer",color:page==="dashboard"?(data.societe?.couleurAccent||"#e8a020"):"rgba(255,255,255,.7)",background:page==="dashboard"?"rgba(255,255,255,.1)":"transparent",display:"flex",alignItems:"center",gap:8,borderLeft:page==="dashboard"?"3px solid "+(data.societe?.couleurAccent||"#e8a020"):"3px solid transparent"}}>
<span>🏠</span> Tableau de bord
</div>
{MENU_ACTIVE.map(grp=>(
<div key={grp.id}>
<div onClick={()=>setOpen(p=>({...p,[grp.id]:!p[grp.id]}))} style={{padding:"9px 16px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:11,letterSpacing:".05em",textTransform:"uppercase",borderTop:"1px solid rgba(255,255,255,.06)",userSelect:"none",background:"rgba(0,0,0,.15)"}}>
<span style={{fontSize:14}}>{grp.icon}</span>
<span style={{flex:1}}>{grp.label}</span>
{grp.id==="stock"&&nbAlertes>0&&<span style={{background:"#dc2626",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>{nbAlertes}</span>}
<span style={{color:"rgba(255,255,255,.4)",fontSize:10}}>{open[grp.id]?"▾":"▸"}</span>
</div>
{open[grp.id]&&grp.children.map(item=>(
<div key={item.id} className="ni" onClick={()=>setPage(item.id)}
style={{padding:"8px 14px 8px 32px",cursor:"pointer",color:page===item.id?(data.societe?.couleurAccent||"#e8a020"):"rgba(255,255,255,.65)",background:page===item.id?"rgba(255,255,255,.1)":"transparent",display:"flex",alignItems:"center",gap:7,fontSize:12,borderLeft:page===item.id?"3px solid "+(data.societe?.couleurAccent||"#e8a020"):"3px solid transparent"}}>
<span>{item.icon}</span> {item.label}
{item.id==="stock-alertes"&&nbAlertes>0&&<span style={{background:"#dc2626",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700,marginLeft:"auto"}}>{nbAlertes}</span>}
</div>
))}
</div>
))}
{/* Bouton personnaliser en bas */}
<div style={{marginTop:"auto",borderTop:"1px solid rgba(255,255,255,.08)",padding:"8px 12px"}}>
<button onClick={()=>setShowMenuEditor(true)}
style={{width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"7px 12px",color:"rgba(255,255,255,.6)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit"}}>
<span>⚙️</span><span>Personnaliser le menu</span>
{menuPerso&&<span style={{...S.badge,background:"#e8a020",color:"#1a2332",fontSize:9,marginLeft:"auto"}}>Perso</span>}
</button>
</div>
</div>

{/* ── MODAL ÉDITEUR DE MENU ── */}
{showMenuEditor&&<MenuEditorModal menuPerso={menuPerso} MENU_FILTERED={MENU_FILTERED} onSave={(v)=>{setMenuPerso(v);setShowMenuEditor(false);}} onClose={()=>setShowMenuEditor(false)}/>}


<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<div style={{background:"#fff",borderBottom:"1px solid #d1d9e0",padding:"0 20px",height:50,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
<span style={{color:"#94a3b8",fontSize:12}}>{curGroup?.label||"Accueil"}</span>
{curItem&&<><span style={{color:"#d1d9e0"}}>›</span><span style={{color:"#1a2332",fontWeight:700,fontSize:13}}>{curItem.label}</span></>}
<div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
{saveMsg&&<span style={{fontSize:11,fontWeight:600,color:saveMsg.ok?"#16a34a":"#dc2626",background:saveMsg.ok?"#f0fdf4":"#fef2f2",padding:"3px 10px",borderRadius:20}}>{saveMsg.ok?"💾":"⚠️"} {saveMsg.msg}</span>}
{!saveMsg&&autoSaveInfo&&(
<span style={{fontSize:10,color:"#94a3b8",display:"flex",alignItems:"center",gap:4}} title={"Auto-save : "+new Date(autoSaveInfo.date).toLocaleString("fr-FR")}>
<span style={{width:6,height:6,background:"#16a34a",borderRadius:"50%",display:"inline-block"}}/>
Auto-save {new Date(autoSaveInfo.date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
</span>
)}
<button onClick={exportJSON} style={{...S.btnS,fontSize:11,padding:"5px 12px",color:"#059669",borderColor:"#86efac"}}>⬇ Export</button>
<label style={{...S.btnS,fontSize:11,padding:"5px 12px",color:"#1a56db",borderColor:"#c7d2fe",cursor:"pointer",margin:0}}>
⬆ Import<input type="file" accept=".json" onChange={importJSON} style={{display:"none"}}/>
</label>
<button onClick={()=>setShowReset(true)} style={{...S.btnS,fontSize:11,padding:"5px 12px",color:"#dc2626",borderColor:"#fecaca"}}>🗑 Reset</button>
<span style={{background:"#f0fdf4",color:"#16a34a",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>🟢 {curUser?.login||"admin"}</span>
</div>
</div>
{importErr&&<div style={{background:"#fef2f2",borderBottom:"1px solid #fecaca",padding:"8px 20px",fontSize:12,color:"#dc2626",display:"flex",alignItems:"center",gap:8}}>⚠️ {importErr}<button onClick={()=>setImportErr("")} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:16}}>×</button></div>}
<div style={{flex:1,overflowY:"auto",padding:22}}>{renderPage()}</div>
</div>
{showReset&&(
<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{background:"#fff",borderRadius:12,padding:28,width:420,boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
<div style={{textAlign:"center",marginBottom:18}}>
<div style={{fontSize:42,marginBottom:8}}>⚠️</div>
<div style={{fontWeight:800,fontSize:16,color:"#1a2332",marginBottom:6}}>Réinitialiser toutes les données ?</div>
<div style={{fontSize:13,color:"#64748b"}}>Cette action supprime définitivement tous vos données.</div>
</div>
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnS,flex:1}} onClick={()=>setShowReset(false)}>Annuler</button>
<button style={{...S.btnP,flex:1,background:"#dc2626"}} onClick={doReset}>Réinitialiser</button>
</div>
</div>
</div>
)}
</div>
);
}