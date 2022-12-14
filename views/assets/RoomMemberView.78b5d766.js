import{d as m,c as d,l as p,m as _,a as b,b as t,t as n,u as o,n as i,e as x,f,j as h,p as g,q as k,A as w,s as v,k as y,_ as C}from"./index.e6b19b83.js";const P={class:"w-full h-full flex flex-col items-center justify-between bg-slate-900 text-white"},R={class:"p-6 text-center"},E={class:"text-4xl font-semibold"},q={class:"text-4xl my-3 mb-10"},I=m({__name:"RoomMemberView",setup(Q){const u=x(),e=h();d(),p(u.params.roomCode);const l=_(()=>e.state.queuePosition===-1?g:k);async function c(){const s=new URLSearchParams;s.set("code",u.params.roomCode);const a=new Headers,r=localStorage.getItem("auth_token");r&&a.set("Authorization","Bearer "+r),(await fetch(w+"/rooms/exit/?"+s,{headers:a})).ok&&(v(""),y.push("/"))}return(s,a)=>(f(),b("div",P,[t("div",R,[t("p",E," Current Room: "+n(s.$route.params.roomCode),1),t("p",q,n(o(e).state.member.name),1),t("p",{class:i(["text-4xl font-semibold m-1 transition-opacity",{disabled:o(e).state.queuePosition===-1}])}," In Queue! ",2),t("p",{class:i(["text-3xl transition-opacity",{disabled:o(e).state.queuePosition===-1}])}," Queue Position: "+n(o(e).state.queuePosition),3)]),t("button",{type:"button",class:i(["bg-green-500 p-6 w-52 m-4 text-xl font-semibold rounded text-black transition-colors hover:text-white",{exitColor:o(e).state.queuePosition!==-1}]),onClick:a[0]||(a[0]=r=>o(l)(s.$route.params.roomCode))},n(o(e).state.queuePosition===-1?"JOIN QUEUE":"LEAVE QUEUE"),3),t("button",{type:"button",class:"bg-slate-500 p-4 px-6 m-10 mb-52 sm:mb-10 text-xl font-semibold rounded transition-colors hover:bg-slate-200 hover:text-black",onClick:c}," EXIT ROOM ")]))}});const S=C(I,[["__scopeId","data-v-ae2f5416"]]);export{S as default};