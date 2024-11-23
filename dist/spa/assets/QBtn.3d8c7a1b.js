import{a as o,c as V,h as v,g as F,a3 as de,D as N,J as fe,K as ve,W as ae,a4 as ge,r as U,C as P,I as me,f as he,O as be,B as ye,j as ke}from"./index.8c08e6f4.js";import{h as pe,a as z,c as xe}from"./dom.90484a39.js";const Q={xs:18,sm:24,md:32,lg:38,xl:46},re={size:String};function ue(e,t=Q){return o(()=>e.size!==void 0?{fontSize:e.size in t?`${t[e.size]}px`:e.size}:null)}const W="0 0 24 24",H=e=>e,D=e=>`ionicons ${e}`,le={"mdi-":e=>`mdi ${e}`,"icon-":H,"bt-":e=>`bt ${e}`,"eva-":e=>`eva ${e}`,"ion-md":D,"ion-ios":D,"ion-logo":D,"iconfont ":H,"ti-":e=>`themify-icon ${e}`,"bi-":e=>`bootstrap-icons ${e}`},ie={o_:"-outlined",r_:"-round",s_:"-sharp"},se={sym_o_:"-outlined",sym_r_:"-rounded",sym_s_:"-sharp"},qe=new RegExp("^("+Object.keys(le).join("|")+")"),$e=new RegExp("^("+Object.keys(ie).join("|")+")"),X=new RegExp("^("+Object.keys(se).join("|")+")"),Ee=/^[Mm]\s?[-+]?\.?\d/,Se=/^img:/,Re=/^svguse:/,we=/^ion-/,Be=/^(fa-(classic|sharp|solid|regular|light|brands|duotone|thin)|[lf]a[srlbdk]?) /;var J=V({name:"QIcon",props:{...re,tag:{type:String,default:"i"},name:String,color:String,left:Boolean,right:Boolean},setup(e,{slots:t}){const{proxy:{$q:u}}=F(),n=ue(e),i=o(()=>"q-icon"+(e.left===!0?" on-left":"")+(e.right===!0?" on-right":"")+(e.color!==void 0?` text-${e.color}`:"")),f=o(()=>{let c,r=e.name;if(r==="none"||!r)return{none:!0};if(u.iconMapFn!==null){const s=u.iconMapFn(r);if(s!==void 0)if(s.icon!==void 0){if(r=s.icon,r==="none"||!r)return{none:!0}}else return{cls:s.cls,content:s.content!==void 0?s.content:" "}}if(Ee.test(r)===!0){const[s,y=W]=r.split("|");return{svg:!0,viewBox:y,nodes:s.split("&&").map(l=>{const[k,h,p]=l.split("@@");return v("path",{style:h,d:k,transform:p})})}}if(Se.test(r)===!0)return{img:!0,src:r.substring(4)};if(Re.test(r)===!0){const[s,y=W]=r.split("|");return{svguse:!0,src:s.substring(7),viewBox:y}}let q=" ";const b=r.match(qe);if(b!==null)c=le[b[1]](r);else if(Be.test(r)===!0)c=r;else if(we.test(r)===!0)c=`ionicons ion-${u.platform.is.ios===!0?"ios":"md"}${r.substring(3)}`;else if(X.test(r)===!0){c="notranslate material-symbols";const s=r.match(X);s!==null&&(r=r.substring(6),c+=se[s[1]]),q=r}else{c="notranslate material-icons";const s=r.match($e);s!==null&&(r=r.substring(2),c+=ie[s[1]]),q=r}return{cls:c,content:q}});return()=>{const c={class:i.value,style:n.value,"aria-hidden":"true",role:"presentation"};return f.value.none===!0?v(e.tag,c,pe(t.default)):f.value.img===!0?v(e.tag,c,z(t.default,[v("img",{src:f.value.src})])):f.value.svg===!0?v(e.tag,c,z(t.default,[v("svg",{viewBox:f.value.viewBox||"0 0 24 24"},f.value.nodes)])):f.value.svguse===!0?v(e.tag,c,z(t.default,[v("svg",{viewBox:f.value.viewBox},[v("use",{"xlink:href":f.value.src})])])):(f.value.cls!==void 0&&(c.class+=" "+f.value.cls),v(e.tag,c,z(t.default,[f.value.content])))}}});function Ce(e,t=250){let u=!1,n;return function(){return u===!1&&(u=!0,setTimeout(()=>{u=!1},t),n=e.apply(this,arguments)),n}}function Y(e,t,u,n){u.modifiers.stop===!0&&ae(e);const i=u.modifiers.color;let f=u.modifiers.center;f=f===!0||n===!0;const c=document.createElement("span"),r=document.createElement("span"),q=ge(e),{left:b,top:s,width:y,height:l}=t.getBoundingClientRect(),k=Math.sqrt(y*y+l*l),h=k/2,p=`${(y-k)/2}px`,d=f?p:`${q.left-b-h}px`,x=`${(l-k)/2}px`,_=f?x:`${q.top-s-h}px`;r.className="q-ripple__inner",xe(r,{height:`${k}px`,width:`${k}px`,transform:`translate3d(${d},${_},0) scale3d(.2,.2,1)`,opacity:0}),c.className=`q-ripple${i?" text-"+i:""}`,c.setAttribute("dir","ltr"),c.appendChild(r),t.appendChild(c);const C=()=>{c.remove(),clearTimeout(L)};u.abort.push(C);let L=setTimeout(()=>{r.classList.add("q-ripple__inner--enter"),r.style.transform=`translate3d(${p},${x},0) scale3d(1,1,1)`,r.style.opacity=.2,L=setTimeout(()=>{r.classList.remove("q-ripple__inner--enter"),r.classList.add("q-ripple__inner--leave"),r.style.opacity=0,L=setTimeout(()=>{c.remove(),u.abort.splice(u.abort.indexOf(C),1)},275)},250)},50)}function G(e,{modifiers:t,value:u,arg:n}){const i=Object.assign({},e.cfg.ripple,t,u);e.modifiers={early:i.early===!0,stop:i.stop===!0,center:i.center===!0,color:i.color||n,keyCodes:[].concat(i.keyCodes||13)}}var Le=de({name:"ripple",beforeMount(e,t){const u=t.instance.$.appContext.config.globalProperties.$q.config||{};if(u.ripple===!1)return;const n={cfg:u,enabled:t.value!==!1,modifiers:{},abort:[],start(i){n.enabled===!0&&i.qSkipRipple!==!0&&i.type===(n.modifiers.early===!0?"pointerdown":"click")&&Y(i,e,n,i.qKeyEvent===!0)},keystart:Ce(i=>{n.enabled===!0&&i.qSkipRipple!==!0&&N(i,n.modifiers.keyCodes)===!0&&i.type===`key${n.modifiers.early===!0?"down":"up"}`&&Y(i,e,n,!0)},300)};G(n,t),e.__qripple=n,fe(n,"main",[[e,"pointerdown","start","passive"],[e,"click","start","passive"],[e,"keydown","keystart","passive"],[e,"keyup","keystart","passive"]])},updated(e,t){if(t.oldValue!==t.value){const u=e.__qripple;u!==void 0&&(u.enabled=t.value!==!1,u.enabled===!0&&Object(t.value)===t.value&&G(u,t))}},beforeUnmount(e){const t=e.__qripple;t!==void 0&&(t.abort.forEach(u=>{u()}),ve(t,"main"),delete e._qripple)}});function _e(e){return e.appContext.config.globalProperties.$router!==void 0}function Ge(e){return e.isUnmounted===!0||e.isDeactivated===!0}const Pe={size:{type:[String,Number],default:"1em"},color:String};function Te(e){return{cSize:o(()=>e.size in Q?`${Q[e.size]}px`:e.size),classes:o(()=>"q-spinner"+(e.color?` text-${e.color}`:""))}}var Oe=V({name:"QSpinner",props:{...Pe,thickness:{type:Number,default:5}},setup(e){const{cSize:t,classes:u}=Te(e);return()=>v("svg",{class:u.value+" q-spinner-mat",width:t.value,height:t.value,viewBox:"25 25 50 50"},[v("circle",{class:"path",cx:"50",cy:"50",r:"20",fill:"none",stroke:"currentColor","stroke-width":e.thickness,"stroke-miterlimit":"10"})])}});const oe={left:"start",center:"center",right:"end",between:"between",around:"around",evenly:"evenly",stretch:"stretch"},Ae=Object.keys(oe),Me={align:{type:String,validator:e=>Ae.includes(e)}};function je(e){return o(()=>{const t=e.align===void 0?e.vertical===!0?"stretch":"left":e.align;return`${e.vertical===!0?"items":"justify"}-${oe[t]}`})}function Z(e){return e?e.aliasOf?e.aliasOf.path:e.path:""}function ee(e,t){return(e.aliasOf||e)===(t.aliasOf||t)}function ze(e,t){for(const u in t){const n=t[u],i=e[u];if(typeof n=="string"){if(n!==i)return!1}else if(Array.isArray(i)===!1||i.length!==n.length||n.some((f,c)=>f!==i[c]))return!1}return!0}function te(e,t){return Array.isArray(t)===!0?e.length===t.length&&e.every((u,n)=>u===t[n]):e.length===1&&e[0]===t}function Ke(e,t){return Array.isArray(e)===!0?te(e,t):Array.isArray(t)===!0?te(t,e):e===t}function Ie(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(const u in e)if(Ke(e[u],t[u])===!1)return!1;return!0}const ce={to:[String,Object],replace:Boolean,href:String,target:String,disable:Boolean},Ze={...ce,exact:Boolean,activeClass:{type:String,default:"q-router-link--active"},exactActiveClass:{type:String,default:"q-router-link--exact-active"}};function De({fallbackTag:e,useDisableForRouterLinkProps:t=!0}={}){const u=F(),{props:n,proxy:i,emit:f}=u,c=_e(u),r=o(()=>n.disable!==!0&&n.href!==void 0),q=t===!0?o(()=>c===!0&&n.disable!==!0&&r.value!==!0&&n.to!==void 0&&n.to!==null&&n.to!==""):o(()=>c===!0&&r.value!==!0&&n.to!==void 0&&n.to!==null&&n.to!==""),b=o(()=>q.value===!0?_(n.to):null),s=o(()=>b.value!==null),y=o(()=>r.value===!0||s.value===!0),l=o(()=>n.type==="a"||y.value===!0?"a":n.tag||e||"div"),k=o(()=>r.value===!0?{href:n.href,target:n.target}:s.value===!0?{href:b.value.href,target:n.target}:{}),h=o(()=>{if(s.value===!1)return-1;const{matched:g}=b.value,{length:$}=g,S=g[$-1];if(S===void 0)return-1;const w=i.$route.matched;if(w.length===0)return-1;const B=w.findIndex(ee.bind(null,S));if(B!==-1)return B;const K=Z(g[$-2]);return $>1&&Z(S)===K&&w[w.length-1].path!==K?w.findIndex(ee.bind(null,g[$-2])):B}),p=o(()=>s.value===!0&&h.value!==-1&&ze(i.$route.params,b.value.params)),d=o(()=>p.value===!0&&h.value===i.$route.matched.length-1&&Ie(i.$route.params,b.value.params)),x=o(()=>s.value===!0?d.value===!0?` ${n.exactActiveClass} ${n.activeClass}`:n.exact===!0?"":p.value===!0?` ${n.activeClass}`:"":"");function _(g){try{return i.$router.resolve(g)}catch{}return null}function C(g,{returnRouterError:$,to:S=n.to,replace:w=n.replace}={}){if(n.disable===!0)return g.preventDefault(),Promise.resolve(!1);if(g.metaKey||g.altKey||g.ctrlKey||g.shiftKey||g.button!==void 0&&g.button!==0||n.target==="_blank")return Promise.resolve(!1);g.preventDefault();const B=i.$router[w===!0?"replace":"push"](S);return $===!0?B:B.then(()=>{}).catch(()=>{})}function L(g){if(s.value===!0){const $=S=>C(g,S);f("click",g,$),g.defaultPrevented!==!0&&$()}else f("click",g)}return{hasRouterLink:s,hasHrefLink:r,hasLink:y,linkTag:l,resolvedLink:b,linkIsActive:p,linkIsExactActive:d,linkClass:x,linkAttrs:k,getLink:_,navigateToRouterLink:C,navigateOnClick:L}}const ne={none:0,xs:4,sm:8,md:16,lg:24,xl:32},Ne={xs:8,sm:10,md:14,lg:20,xl:24},Qe=["button","submit","reset"],Ve=/[^\s]\/[^\s]/,Fe=["flat","outline","push","unelevated"];function Ue(e,t){return e.flat===!0?"flat":e.outline===!0?"outline":e.push===!0?"push":e.unelevated===!0?"unelevated":t}const We={...re,...ce,type:{type:String,default:"button"},label:[Number,String],icon:String,iconRight:String,...Fe.reduce((e,t)=>(e[t]=Boolean)&&e,{}),square:Boolean,rounded:Boolean,glossy:Boolean,size:String,fab:Boolean,fabMini:Boolean,padding:String,color:String,textColor:String,noCaps:Boolean,noWrap:Boolean,dense:Boolean,tabindex:[Number,String],ripple:{type:[Boolean,Object],default:!0},align:{...Me.align,default:"center"},stack:Boolean,stretch:Boolean,loading:{type:Boolean,default:null},disable:Boolean},He={...We,round:Boolean};function Xe(e){const t=ue(e,Ne),u=je(e),{hasRouterLink:n,hasLink:i,linkTag:f,linkAttrs:c,navigateOnClick:r}=De({fallbackTag:"button"}),q=o(()=>{const d=e.fab===!1&&e.fabMini===!1?t.value:{};return e.padding!==void 0?Object.assign({},d,{padding:e.padding.split(/\s+/).map(x=>x in ne?ne[x]+"px":x).join(" "),minWidth:"0",minHeight:"0"}):d}),b=o(()=>e.rounded===!0||e.fab===!0||e.fabMini===!0),s=o(()=>e.disable!==!0&&e.loading!==!0),y=o(()=>s.value===!0?e.tabindex||0:-1),l=o(()=>Ue(e,"standard")),k=o(()=>{const d={tabindex:y.value};return i.value===!0?Object.assign(d,c.value):Qe.includes(e.type)===!0&&(d.type=e.type),f.value==="a"?(e.disable===!0?d["aria-disabled"]="true":d.href===void 0&&(d.role="button"),n.value!==!0&&Ve.test(e.type)===!0&&(d.type=e.type)):e.disable===!0&&(d.disabled="",d["aria-disabled"]="true"),e.loading===!0&&e.percentage!==void 0&&Object.assign(d,{role:"progressbar","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":e.percentage}),d}),h=o(()=>{let d;e.color!==void 0?e.flat===!0||e.outline===!0?d=`text-${e.textColor||e.color}`:d=`bg-${e.color} text-${e.textColor||"white"}`:e.textColor&&(d=`text-${e.textColor}`);const x=e.round===!0?"round":`rectangle${b.value===!0?" q-btn--rounded":e.square===!0?" q-btn--square":""}`;return`q-btn--${l.value} q-btn--${x}`+(d!==void 0?" "+d:"")+(s.value===!0?" q-btn--actionable q-focusable q-hoverable":e.disable===!0?" disabled":"")+(e.fab===!0?" q-btn--fab":e.fabMini===!0?" q-btn--fab-mini":"")+(e.noCaps===!0?" q-btn--no-uppercase":"")+(e.dense===!0?" q-btn--dense":"")+(e.stretch===!0?" no-border-radius self-stretch":"")+(e.glossy===!0?" glossy":"")+(e.square?" q-btn--square":"")}),p=o(()=>u.value+(e.stack===!0?" column":" row")+(e.noWrap===!0?" no-wrap text-no-wrap":"")+(e.loading===!0?" q-btn__content--hidden":""));return{classes:h,style:q,innerClasses:p,attributes:k,hasLink:i,linkTag:f,navigateOnClick:r,isActionable:s}}const{passiveCapture:E}=ke;let T=null,O=null,A=null;var et=V({name:"QBtn",props:{...He,percentage:Number,darkPercentage:Boolean,onTouchstart:[Function,Array]},emits:["click","keydown","mousedown","keyup"],setup(e,{slots:t,emit:u}){const{proxy:n}=F(),{classes:i,style:f,innerClasses:c,attributes:r,hasLink:q,linkTag:b,navigateOnClick:s,isActionable:y}=Xe(e),l=U(null),k=U(null);let h=null,p,d=null;const x=o(()=>e.label!==void 0&&e.label!==null&&e.label!==""),_=o(()=>e.disable===!0||e.ripple===!1?!1:{keyCodes:q.value===!0?[13,32]:[13],...e.ripple===!0?{}:e.ripple}),C=o(()=>({center:e.round})),L=o(()=>{const a=Math.max(0,Math.min(100,e.percentage));return a>0?{transition:"transform 0.6s",transform:`translateX(${a-100}%)`}:{}}),g=o(()=>{if(e.loading===!0)return{onMousedown:j,onTouchstart:j,onClick:j,onKeydown:j,onKeyup:j};if(y.value===!0){const a={onClick:S,onKeydown:w,onMousedown:K};if(n.$q.platform.has.touch===!0){const m=e.onTouchstart!==void 0?"":"Passive";a[`onTouchstart${m}`]=B}return a}return{onClick:P}}),$=o(()=>({ref:l,class:"q-btn q-btn-item non-selectable no-outline "+i.value,style:f.value,...r.value,...g.value}));function S(a){if(l.value!==null){if(a!==void 0){if(a.defaultPrevented===!0)return;const m=document.activeElement;if(e.type==="submit"&&m!==document.body&&l.value.contains(m)===!1&&m.contains(l.value)===!1){l.value.focus();const I=()=>{document.removeEventListener("keydown",P,!0),document.removeEventListener("keyup",I,E),l.value!==null&&l.value.removeEventListener("blur",I,E)};document.addEventListener("keydown",P,!0),document.addEventListener("keyup",I,E),l.value.addEventListener("blur",I,E)}}s(a)}}function w(a){l.value!==null&&(u("keydown",a),N(a,[13,32])===!0&&O!==l.value&&(O!==null&&M(),a.defaultPrevented!==!0&&(l.value.focus(),O=l.value,l.value.classList.add("q-btn--active"),document.addEventListener("keyup",R,!0),l.value.addEventListener("blur",R,E)),P(a)))}function B(a){l.value!==null&&(u("touchstart",a),a.defaultPrevented!==!0&&(T!==l.value&&(T!==null&&M(),T=l.value,h=a.target,h.addEventListener("touchcancel",R,E),h.addEventListener("touchend",R,E)),p=!0,d!==null&&clearTimeout(d),d=setTimeout(()=>{d=null,p=!1},200)))}function K(a){l.value!==null&&(a.qSkipRipple=p===!0,u("mousedown",a),a.defaultPrevented!==!0&&A!==l.value&&(A!==null&&M(),A=l.value,l.value.classList.add("q-btn--active"),document.addEventListener("mouseup",R,E)))}function R(a){if(l.value!==null&&!(a!==void 0&&a.type==="blur"&&document.activeElement===l.value)){if(a!==void 0&&a.type==="keyup"){if(O===l.value&&N(a,[13,32])===!0){const m=new MouseEvent("click",a);m.qKeyEvent=!0,a.defaultPrevented===!0&&me(m),a.cancelBubble===!0&&ae(m),l.value.dispatchEvent(m),P(a),a.qKeyEvent=!0}u("keyup",a)}M()}}function M(a){const m=k.value;a!==!0&&(T===l.value||A===l.value)&&m!==null&&m!==document.activeElement&&(m.setAttribute("tabindex",-1),m.focus()),T===l.value&&(h!==null&&(h.removeEventListener("touchcancel",R,E),h.removeEventListener("touchend",R,E)),T=h=null),A===l.value&&(document.removeEventListener("mouseup",R,E),A=null),O===l.value&&(document.removeEventListener("keyup",R,!0),l.value!==null&&l.value.removeEventListener("blur",R,E),O=null),l.value!==null&&l.value.classList.remove("q-btn--active")}function j(a){P(a),a.qSkipRipple=!0}return he(()=>{M(!0)}),Object.assign(n,{click:a=>{y.value===!0&&S(a)}}),()=>{let a=[];e.icon!==void 0&&a.push(v(J,{name:e.icon,left:e.stack!==!0&&x.value===!0,role:"img"})),x.value===!0&&a.push(v("span",{class:"block"},[e.label])),a=z(t.default,a),e.iconRight!==void 0&&e.round===!1&&a.push(v(J,{name:e.iconRight,right:e.stack!==!0&&x.value===!0,role:"img"}));const m=[v("span",{class:"q-focus-helper",ref:k})];return e.loading===!0&&e.percentage!==void 0&&m.push(v("span",{class:"q-btn__progress absolute-full overflow-hidden"+(e.darkPercentage===!0?" q-btn__progress--dark":"")},[v("span",{class:"q-btn__progress-indicator fit block",style:L.value})])),m.push(v("span",{class:"q-btn__content text-center col items-center q-anchor--skip "+c.value},a)),e.loading!==null&&m.push(v(be,{name:"q-transition--fade"},()=>e.loading===!0?[v("span",{key:"loading",class:"absolute-full flex flex-center"},t.loading!==void 0?t.loading():[v(Oe)])]:null)),ye(v(b.value,$.value,m),[[Le,_.value,void 0,C.value]])}}});export{J as Q,Le as R,_e as a,ue as b,Oe as c,Ze as d,De as e,et as f,Me as g,je as h,Pe as i,Te as j,re as u,Ge as v};
