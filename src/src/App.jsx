import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const T = {
  primary: "#e63946", dark: "#1a1a2e", success: "#2a9d8f",
  warning: "#f4a261", info: "#457b9d", muted: "#6c757d",
  border: "#e9ecef", bg: "#f8f9fa",
  catBg: {
    Grocery: "linear-gradient(135deg,#d8f3dc,#b7e4c7)",
    Dairy: "linear-gradient(135deg,#caf0f8,#ade8f4)",
    Snacks: "linear-gradient(135deg,#fff3b0,#ffe066)",
    Household: "linear-gradient(135deg,#e9d8fd,#d0bfff)",
    "Personal Care": "linear-gradient(135deg,#ffd6e7,#ffb3c1)",
    Beverages: "linear-gradient(135deg,#d8f3dc,#95d5b2)",
  },
  catCol: {
    Grocery:"#1b4332", Dairy:"#023e8a", Snacks:"#7b2d00",
    Household:"#4a1942", "Personal Care":"#6b2d50", Beverages:"#1a3a1a",
  },
};

const COUPONS = [
  { code:"MAMTA10", label:"10% OFF", desc:"10% off on all orders", type:"percent", value:10, min:200 },
  { code:"FIRST50", label:"₹50 OFF", desc:"₹50 off on your first order", type:"flat", value:50, min:300 },
  { code:"FREEDEL", label:"FREE DELIVERY", desc:"Free delivery on any order", type:"delivery", value:0, min:0 },
  { code:"SAVE100", label:"₹100 OFF", desc:"₹100 off on orders above ₹800", type:"flat", value:100, min:800 },
];

const PRODUCTS = [
  {id:1,name:"Tata Salt 1kg",cat:"Grocery",price:28,emoji:"🧂",rating:4.8,sold:1240},
  {id:2,name:"Amul Butter 500g",cat:"Dairy",price:275,emoji:"🧈",rating:4.9,sold:890},
  {id:3,name:"Aashirvaad Atta 5kg",cat:"Grocery",price:275,emoji:"🌾",rating:4.7,sold:560},
  {id:4,name:"Surf Excel 1kg",cat:"Household",price:195,emoji:"🧺",rating:4.6,sold:430},
  {id:5,name:"Parle-G Biscuits",cat:"Snacks",price:10,emoji:"🍪",rating:4.9,sold:3200},
  {id:6,name:"Maggi Noodles 12pk",cat:"Snacks",price:144,emoji:"🍜",rating:4.8,sold:2100},
  {id:7,name:"Colgate Toothpaste",cat:"Personal Care",price:99,emoji:"🪥",rating:4.7,sold:780},
  {id:8,name:"Lifebuoy Soap 4pk",cat:"Personal Care",price:120,emoji:"🧼",rating:4.5,sold:650},
  {id:9,name:"Amul Milk 1L",cat:"Dairy",price:66,emoji:"🥛",rating:4.9,sold:1800},
  {id:10,name:"Basmati Rice 5kg",cat:"Grocery",price:450,emoji:"🍚",rating:4.8,sold:970},
  {id:11,name:"Toor Dal 1kg",cat:"Grocery",price:160,emoji:"🫘",rating:4.6,sold:540},
  {id:12,name:"Sunflower Oil 1L",cat:"Grocery",price:135,emoji:"🫙",rating:4.7,sold:620},
  {id:13,name:"Lay's Chips 26g",cat:"Snacks",price:20,emoji:"🥔",rating:4.8,sold:2800},
  {id:14,name:"Tropicana OJ 1L",cat:"Beverages",price:120,emoji:"🍊",rating:4.6,sold:430},
  {id:15,name:"Horlicks 500g",cat:"Beverages",price:295,emoji:"☕",rating:4.7,sold:310},
  {id:16,name:"Dettol Handwash",cat:"Personal Care",price:89,emoji:"🫧",rating:4.8,sold:920},
];

const CATS = ["All","Grocery","Dairy","Snacks","Household","Personal Care","Beverages"];
const ORDER_STEPS = ["placed","confirmed","packed","dispatched","delivered"];
const ADMIN_USER = "mamtamart", ADMIN_PASS = "admin@123";

// localStorage helpers (works on any website/server)
function sGet(k) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
}
function sSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

// Toast
function Toast({ toasts }) {
  return (
    <div style={{position:"fixed",top:70,right:0,left:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",gap:8,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:t.type==="success"?"#2a9d8f":t.type==="error"?"#e63946":"#1a1a2e",color:"#fff",borderRadius:14,padding:"10px 18px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",maxWidth:320,textAlign:"center"}}>{t.msg}</div>
      ))}
    </div>
  );
}
function useToast() {
  const [toasts,setToasts]=useState([]);
  const show=(msg,type="success")=>{const id=Date.now();setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);};
  return {toasts,show};
}

const S = {
  app:{fontFamily:"'Nunito',sans-serif",minHeight:"100vh",background:T.bg,color:"#212529",maxWidth:430,margin:"0 auto",boxShadow:"0 0 60px rgba(0,0,0,0.12)"},
  hdr:(bg)=>({background:bg||`linear-gradient(135deg,${T.primary},#c1121f)`,color:"#fff",padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}),
  btn:(c=T.primary,full=false)=>({background:c,color:"#fff",border:"none",borderRadius:12,padding:"11px 20px",fontWeight:800,fontSize:14,cursor:"pointer",width:full?"100%":"auto",fontFamily:"inherit"}),
  ghost:{background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)",borderRadius:10,padding:"5px 12px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:12},
  card:{background:"#fff",borderRadius:18,padding:16,boxShadow:"0 2px 16px rgba(0,0,0,0.06)",marginBottom:12},
  sec:{padding:"14px 16px"},
  nav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e9ecef",display:"flex",zIndex:200},
  navBtn:(a,c=T.primary)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"9px 0 6px",cursor:"pointer",color:a?c:T.muted,fontWeight:a?800:500,fontSize:10,background:"none",border:"none",fontFamily:"inherit"}),
  input:{width:"100%",border:"2px solid #e9ecef",borderRadius:12,padding:"11px 14px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"},
  lbl:{fontSize:12,fontWeight:800,color:T.muted,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:0.5},
  row:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8},
  col:{display:"flex",flexDirection:"column",gap:10},
  div:{height:1,background:"#e9ecef",margin:"10px 0"},
  chip:(a)=>({padding:"6px 14px",borderRadius:20,border:`2px solid ${a?T.primary:"#e9ecef"}`,background:a?T.primary:"#fff",color:a?"#fff":"#212529",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}),
  tag:(c=T.primary)=>({background:c+"20",color:c,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:800,display:"inline-block"}),
  dot:(s)=>({width:8,height:8,borderRadius:"50%",background:s==="delivered"?T.success:s==="dispatched"?T.warning:s==="cancelled"?"#e63946":"#adb5bd",display:"inline-block",marginRight:5}),
};

function DeliveryTracker({status}) {
  const steps=[{key:"placed",icon:"📋",label:"Placed"},{key:"confirmed",icon:"✅",label:"Confirmed"},{key:"packed",icon:"📦",label:"Packed"},{key:"dispatched",icon:"🚚",label:"On Way"},{key:"delivered",icon:"🏠",label:"Delivered"}];
  const curr=ORDER_STEPS.indexOf(status);
  return (
    <div style={{padding:"8px 0"}}>
      {status==="cancelled"?(
        <div style={{textAlign:"center",padding:12,background:"#fff5f5",borderRadius:12,color:T.primary,fontWeight:700}}>❌ Order Cancelled</div>
      ):(
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"relative"}}>
          <div style={{position:"absolute",top:16,left:"10%",right:"10%",height:3,background:"#e9ecef",borderRadius:2,zIndex:0}}/>
          <div style={{position:"absolute",top:16,left:"10%",width:`${Math.max(0,(curr/(steps.length-1))*80)}%`,height:3,background:T.success,borderRadius:2,zIndex:1,transition:"width 0.5s"}}/>
          {steps.map((s,i)=>{
            const done=i<=curr; const active=i===curr;
            return (
              <div key={s.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative",zIndex:2}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:done?T.success:"#fff",border:`3px solid ${done?T.success:"#e9ecef"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:active?"0 0 0 4px #2a9d8f30":"none"}}>
                  {done?(i<curr?"✓":s.icon):s.icon}
                </div>
                <div style={{fontSize:9,fontWeight:active?800:600,color:done?T.success:T.muted,textAlign:"center",lineHeight:1.2}}>{s.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductCard({p,qty,onAdd,onRem}) {
  const bg=T.catBg[p.cat]||"linear-gradient(135deg,#f0f0f0,#e0e0e0)";
  const col=T.catCol[p.cat]||"#333";
  return (
    <div style={{background:"#fff",borderRadius:18,overflow:"hidden",boxShadow:"0 3px 16px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column"}}>
      <div style={{background:bg,padding:"20px 10px 14px",textAlign:"center",position:"relative"}}>
        <div style={{fontSize:46}}>{p.emoji}</div>
        <div style={{position:"absolute",top:8,right:8,background:col,color:"#fff",borderRadius:10,padding:"2px 7px",fontSize:10,fontWeight:800}}>★ {p.rating}</div>
      </div>
      <div style={{padding:"10px 12px 12px",display:"flex",flexDirection:"column",gap:5,flex:1}}>
        <div style={{fontSize:13,fontWeight:800,lineHeight:1.3}}>{p.name}</div>
        <div style={S.tag(col)}>{p.cat}</div>
        <div style={{fontSize:11,color:T.muted}}>{p.sold.toLocaleString("en-IN")}+ sold</div>
        <div style={{...S.row,marginTop:"auto"}}>
          <div style={{fontWeight:900,fontSize:17,color:T.primary}}>₹{p.price}</div>
          {qty?(
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <button onClick={onRem} style={{width:27,height:27,borderRadius:8,border:`2px solid ${T.primary}`,background:"#fff",color:T.primary,fontWeight:900,cursor:"pointer",fontSize:16}}>−</button>
              <span style={{fontWeight:900,minWidth:16,textAlign:"center"}}>{qty}</span>
              <button onClick={onAdd} style={{width:27,height:27,borderRadius:8,border:"none",background:T.primary,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:16}}>+</button>
            </div>
          ):(
            <button onClick={onAdd} style={{background:T.primary,border:"none",borderRadius:9,width:32,height:32,color:"#fff",fontSize:20,cursor:"pointer"}}>+</button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminLogin({onLogin}) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [show,setShow]=useState(false); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const login=async()=>{
    if(!u||!p){setErr("Enter username and password");return;}
    setLoading(true); await new Promise(r=>setTimeout(r,700));
    if(u===ADMIN_USER&&p===ADMIN_PASS){onLogin();}else{setErr("❌ Wrong username or password!");}
    setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${T.dark},#16213e,#0f3460)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:24,padding:30,width:"100%",maxWidth:380,boxShadow:"0 24px 60px rgba(0,0,0,0.35)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:70,height:70,background:`linear-gradient(135deg,${T.dark},#457b9d)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 12px"}}>⚙️</div>
          <div style={{fontSize:22,fontWeight:900,color:T.dark}}>Admin Login</div>
          <div style={{fontSize:13,color:T.muted}}>Mamta Mart · Dholka</div>
          <div style={{background:"#fffde7",border:"1px solid #ffd54f",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#795548",marginTop:10,fontWeight:700}}>
            Demo → <b>mamtamart</b> / <b>admin@123</b>
          </div>
        </div>
        <div style={S.col}>
          <div><label style={S.lbl}>Username</label><input style={S.input} placeholder="Enter username" value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/></div>
          <div><label style={S.lbl}>Password</label>
            <div style={{position:"relative"}}>
              <input style={{...S.input,paddingRight:46}} type={show?"text":"password"} placeholder="Enter password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
              <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18}}>{show?"🙈":"👁️"}</button>
            </div>
          </div>
          {err&&<div style={{background:"#fff5f5",borderRadius:10,padding:"9px 12px",color:T.primary,fontSize:13,fontWeight:700}}>{err}</div>}
          <button style={S.btn(T.dark,true)} onClick={login} disabled={loading}>{loading?"Checking...":"🔐 Login"}</button>
        </div>
      </div>
    </div>
  );
}

function CustomerLogin({onLogin}) {
  const [step,setStep]=useState(1); const [phone,setPhone]=useState(""); const [otp,setOtp]=useState(""); const [gen,setGen]=useState(""); const [name,setName]=useState(""); const [addr,setAddr]=useState(""); const [isNew,setIsNew]=useState(false); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const sendOtp=async()=>{
    if(phone.length!==10){setErr("Enter valid 10-digit number");return;}
    setLoading(true); await new Promise(r=>setTimeout(r,700));
    const code=Math.floor(100000+Math.random()*900000).toString(); setGen(code);
    const users=sGet("mm_cust")||{}; setIsNew(!users[phone]);
    setLoading(false); setErr(""); setStep(2);
  };
  const verify=async()=>{
    if(otp!==gen){setErr("Wrong OTP. Please check and retry.");return;}
    if(isNew&&!name.trim()){setErr("Please enter your name");return;}
    setLoading(true); await new Promise(r=>setTimeout(r,400));
    const users=sGet("mm_cust")||{};
    if(isNew){users[phone]={phone,name,address:addr,joinedAt:new Date().toISOString()};sSet("mm_cust",users);}
    onLogin(users[phone]); setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#c1121f,${T.primary} 50%,${T.warning})`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:24,padding:30,width:"100%",maxWidth:380,boxShadow:"0 24px 60px rgba(0,0,0,0.2)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:70,height:70,background:`linear-gradient(135deg,${T.primary},${T.warning})`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 12px"}}>🛒</div>
          <div style={{fontSize:24,fontWeight:900,color:T.primary}}>Mamta Mart</div>
          <div style={{fontSize:13,color:T.muted}}>Dholka's Digital Bazaar 🌟</div>
        </div>
        {step===1?(
          <div style={S.col}>
            <div><label style={S.lbl}>Mobile Number</label>
              <div style={{display:"flex",gap:8}}>
                <div style={{background:T.bg,border:"2px solid #e9ecef",borderRadius:12,padding:"11px 12px",fontWeight:800,color:T.muted,whiteSpace:"nowrap",fontSize:13}}>+91</div>
                <input style={S.input} placeholder="9876543210" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/,""))} onKeyDown={e=>e.key==="Enter"&&sendOtp()}/>
              </div>
            </div>
            {err&&<div style={{color:T.primary,fontSize:13,fontWeight:700}}>{err}</div>}
            <button style={S.btn(T.primary,true)} onClick={sendOtp} disabled={loading}>{loading?"Sending...":"Send OTP →"}</button>
          </div>
        ):(
          <div style={S.col}>
            <div style={{background:"#fffde7",border:"1.5px dashed #ffd54f",borderRadius:12,padding:"10px 14px"}}>
              <div style={{fontSize:12,color:"#795548",fontWeight:700}}>📱 <b>Demo Mode:</b> In real app, OTP comes via SMS.</div>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:5,color:T.dark,textAlign:"center",marginTop:5}}>{gen}</div>
            </div>
            <div><label style={S.lbl}>Enter OTP</label>
              <input style={{...S.input,letterSpacing:8,fontSize:22,fontWeight:900,textAlign:"center"}} placeholder="------" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/,""))}/>
            </div>
            {isNew&&<>
              <div style={{background:"#e8f5e9",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#2e7d32",fontWeight:700}}>👋 New customer! Fill your details.</div>
              <div><label style={S.lbl}>Full Name</label><input style={S.input} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div><label style={S.lbl}>Delivery Address (Dholka)</label><input style={S.input} placeholder="Area, Street, Landmark..." value={addr} onChange={e=>setAddr(e.target.value)}/></div>
            </>}
            {err&&<div style={{background:"#fff5f5",borderRadius:10,padding:"8px 12px",color:T.primary,fontSize:13,fontWeight:700}}>{err}</div>}
            <button style={S.btn(T.primary,true)} onClick={verify} disabled={loading}>{loading?"Verifying...":isNew?"Register & Enter 🎉":"Login →"}</button>
            <button onClick={()=>{setStep(1);setOtp("");setErr("");}} style={{background:"none",border:"2px solid #e9ecef",borderRadius:12,padding:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",color:T.muted}}>← Change Number</button>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerApp({user,onLogout}) {
  const [tab,setTab]=useState("home");
  const [products,setProducts]=useState([]);
  const [cart,setCart]=useState({});
  const [orders,setOrders]=useState([]);
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("All");
  const [checkout,setCheckout]=useState(0);
  const [payMethod,setPayMethod]=useState("COD");
  const [couponInput,setCouponInput]=useState("");
  const [appliedCoupon,setAppliedCoupon]=useState(null);
  const [couponErr,setCouponErr]=useState("");
  const [success,setSuccess]=useState(null);
  const [notifs,setNotifs]=useState([]);
  const [selectedOrder,setSelectedOrder]=useState(null);
  const {toasts,show:showToast}=useToast();

  useEffect(()=>{
    let p=sGet("mm_products"); if(!p){p=PRODUCTS;sSet("mm_products",p);} setProducts(p);
    const o=sGet("mm_orders")||[]; setOrders(o.filter(x=>x.customerPhone===user.phone));
    setNotifs(sGet("mm_notifs_"+user.phone)||[]);
  },[]);

  const itemsTotal=Object.entries(cart).reduce((s,[id,q])=>{const p=products.find(x=>x.id===+id);return s+(p?p.price*q:0);},0);
  const deliveryFee=itemsTotal>=1000||appliedCoupon?.type==="delivery"?0:40;
  let discount=0;
  if(appliedCoupon){if(appliedCoupon.type==="percent")discount=Math.round(itemsTotal*appliedCoupon.value/100);else if(appliedCoupon.type==="flat")discount=appliedCoupon.value;}
  const grandTotal=Math.max(0,itemsTotal-discount+deliveryFee);
  const cartCount=Object.values(cart).reduce((a,b)=>a+b,0);
  const unreadNotifs=notifs.filter(n=>!n.read).length;

  const add=(id)=>setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const rem=(id)=>setCart(c=>{const n={...c};n[id]>1?n[id]--:delete n[id];return n;});

  const applyCoupon=()=>{
    const c=COUPONS.find(x=>x.code===couponInput.toUpperCase().trim());
    if(!c){setCouponErr("❌ Invalid coupon code");setAppliedCoupon(null);return;}
    if(itemsTotal<c.min){setCouponErr(`❌ Min order ₹${c.min} required`);setAppliedCoupon(null);return;}
    setAppliedCoupon(c);setCouponErr("");showToast(`✅ Coupon applied! ${c.desc}`);
  };

  const filtered=products.filter(p=>(cat==="All"||p.cat===cat)&&p.name.toLowerCase().includes(search.toLowerCase()));

  const placeOrder=()=>{
    const items=Object.entries(cart).map(([id,qty])=>{const p=products.find(x=>x.id===+id);return{productId:+id,name:p.name,price:p.price,qty,subtotal:p.price*qty};});
    const order={id:"MM"+Date.now(),customerPhone:user.phone,customerName:user.name,customerAddress:user.address,items,itemsTotal,discount,deliveryFee,total:grandTotal,coupon:appliedCoupon?.code||null,paymentMethod:payMethod,status:"placed",placedAt:new Date().toISOString()};
    const all=sGet("mm_orders")||[]; all.unshift(order); sSet("mm_orders",all);
    setOrders(prev=>[order,...prev]);
    setCart({}); setCheckout(0); setAppliedCoupon(null); setCouponInput(""); setSuccess(order); setTab("orders");
    showToast("🎉 Order placed!");
  };

  const markRead=()=>{const u=notifs.map(n=>({...n,read:true}));setNotifs(u);sSet("mm_notifs_"+user.phone,u);};

  return (
    <div style={S.app}>
      <Toast toasts={toasts}/>
      <div style={S.hdr()}>
        <div><div style={{fontSize:18,fontWeight:900}}>🛒 Mamta Mart</div><div style={{fontSize:11,opacity:0.85}}>👤 {user.name}</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {cartCount>0&&tab!=="cart"&&<button onClick={()=>setTab("cart")} style={{background:T.warning,border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>🛒 {cartCount}</button>}
          <button onClick={()=>{setTab("notifs");markRead();}} style={{...S.ghost,position:"relative"}}>🔔{unreadNotifs>0&&<span style={{position:"absolute",top:-4,right:-4,background:T.primary,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadNotifs}</span>}</button>
          <button onClick={onLogout} style={S.ghost}>Logout</button>
        </div>
      </div>

      <div style={{paddingBottom:76,overflowY:"auto",maxHeight:"calc(100vh - 56px)"}}>
        {success&&tab==="orders"&&(
          <div style={{margin:"14px 16px 0"}}>
            <div style={{background:"linear-gradient(135deg,#f0fff4,#dcfce7)",border:`2px solid ${T.success}`,borderRadius:18,padding:20,textAlign:"center"}}>
              <div style={{fontSize:44}}>🎉</div>
              <div style={{fontWeight:900,fontSize:18,color:T.success}}>Order Placed!</div>
              <div style={{fontSize:12,color:T.muted}}>ID: {success.id}</div>
              <div style={{fontSize:14,marginTop:4}}>₹{success.total} {success.deliveryFee===0?"· 🚚 Free Delivery!":""}</div>
              {success.discount>0&&<div style={{fontSize:12,color:T.success,fontWeight:700}}>💰 Saved ₹{success.discount}!</div>}
              <button onClick={()=>setSuccess(null)} style={{...S.btn(T.success),marginTop:12,padding:"8px 20px",fontSize:13}}>Track Order →</button>
            </div>
          </div>
        )}

        {tab==="home"&&(
          <div>
            <div style={{margin:"14px 16px",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(230,57,70,0.2)"}}>
              <div style={{background:`linear-gradient(120deg,${T.primary},${T.warning})`,padding:"20px 22px",color:"#fff"}}>
                <div style={{fontSize:12,opacity:0.9,fontWeight:600}}>🚚 Free Home Delivery above</div>
                <div style={{fontSize:34,fontWeight:900}}>₹1,000</div>
                <div style={{fontSize:12,opacity:0.8}}>Use code <b>MAMTA10</b> for 10% off!</div>
              </div>
              <div style={{background:"#1a1a2e",display:"flex",gap:8,padding:"10px 14px",overflowX:"auto",scrollbarWidth:"none"}}>
                {COUPONS.map(c=>(
                  <div key={c.code} style={{background:"rgba(255,255,255,0.08)",border:"1.5px dashed rgba(255,255,255,0.3)",borderRadius:10,padding:"5px 12px",whiteSpace:"nowrap",flexShrink:0}}>
                    <div style={{fontSize:10,color:T.warning,fontWeight:900}}>{c.label}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.6)"}}>{c.code}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"0 16px 10px"}}><input style={{...S.input,background:"#fff",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}} placeholder="🔍  Search products..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div style={{display:"flex",gap:8,padding:"0 16px 14px",overflowX:"auto",scrollbarWidth:"none"}}>{CATS.map(c=><button key={c} style={S.chip(cat===c)} onClick={()=>setCat(c)}>{c}</button>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"0 16px"}}>
              {filtered.map(p=><ProductCard key={p.id} p={p} qty={cart[p.id]} onAdd={()=>add(p.id)} onRem={()=>rem(p.id)}/>)}
            </div>
            <div style={{height:18}}/>
          </div>
        )}

        {tab==="cart"&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>🛒 My Cart</h2>
            {cartCount===0?(
              <div style={{textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:60}}>🛒</div><div style={{fontWeight:700,marginTop:10}}>Cart is empty</div><button style={{...S.btn(T.primary),marginTop:14}} onClick={()=>setTab("home")}>Shop Now</button></div>
            ):checkout===0?(
              <>
                {Object.entries(cart).map(([id,qty])=>{const p=products.find(x=>x.id===+id);return p?(
                  <div key={id} style={{...S.card,display:"flex",gap:12,alignItems:"center",padding:12}}>
                    <div style={{fontSize:32,background:T.catBg[p.cat],borderRadius:12,width:50,height:50,display:"flex",alignItems:"center",justifyContent:"center"}}>{p.emoji}</div>
                    <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13}}>{p.name}</div><div style={{color:T.primary,fontWeight:900,fontSize:13}}>₹{p.price} × {qty} = ₹{p.price*qty}</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <button onClick={()=>rem(+id)} style={{width:27,height:27,borderRadius:8,border:`2px solid ${T.primary}`,background:"#fff",color:T.primary,fontWeight:900,cursor:"pointer"}}>−</button>
                      <span style={{fontWeight:900}}>{qty}</span>
                      <button onClick={()=>add(+id)} style={{width:27,height:27,borderRadius:8,border:"none",background:T.primary,color:"#fff",fontWeight:900,cursor:"pointer"}}>+</button>
                    </div>
                  </div>
                ):null;})}
                <div style={S.card}>
                  <div style={{fontWeight:800,marginBottom:8,fontSize:14}}>🏷️ Apply Coupon</div>
                  <div style={{display:"flex",gap:8}}>
                    <input style={{...S.input,textTransform:"uppercase"}} placeholder="Enter coupon code" value={couponInput} onChange={e=>setCouponInput(e.target.value)}/>
                    <button style={{...S.btn(T.dark),whiteSpace:"nowrap",borderRadius:10}} onClick={applyCoupon}>Apply</button>
                  </div>
                  {couponErr&&<div style={{fontSize:12,color:T.primary,fontWeight:700,marginTop:5}}>{couponErr}</div>}
                  {appliedCoupon&&<div style={{fontSize:12,color:T.success,fontWeight:800,marginTop:5}}>✅ {appliedCoupon.desc}</div>}
                  <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                    {COUPONS.map(c=><button key={c.code} onClick={()=>setCouponInput(c.code)} style={{background:T.bg,border:"1.5px dashed #e9ecef",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",color:T.dark}}>{c.code}</button>)}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.row}><span style={{color:T.muted}}>Items Total</span><span style={{fontWeight:700}}>₹{itemsTotal}</span></div>
                  {discount>0&&<div style={{...S.row,color:T.success}}><span>Coupon Discount</span><span style={{fontWeight:800}}>− ₹{discount}</span></div>}
                  <div style={S.row}><span style={{color:T.muted}}>Delivery</span><span style={{fontWeight:800,color:deliveryFee===0?T.success:"#212529"}}>{deliveryFee===0?"FREE 🎉":"₹40"}</span></div>
                  {itemsTotal<1000&&deliveryFee>0&&<div style={{fontSize:11,color:T.warning,fontWeight:700}}>Add ₹{1000-itemsTotal} more for free delivery!</div>}
                  <div style={S.div}/>
                  <div style={{...S.row,fontSize:17,fontWeight:900}}><span>Grand Total</span><span style={{color:T.primary}}>₹{grandTotal}</span></div>
                </div>
                <button style={S.btn(T.primary,true)} onClick={()=>setCheckout(1)}>Proceed to Checkout →</button>
              </>
            ):(
              <>
                <div style={S.card}><div style={{fontWeight:800,marginBottom:7}}>📍 Delivery Address</div><div style={{fontSize:14,color:T.muted}}>{user.address||"Not set"}</div></div>
                <div style={S.card}>
                  <div style={{fontWeight:800,marginBottom:10}}>💳 Payment Method</div>
                  {[["COD","💵 Cash on Delivery"],["UPI","📱 UPI / PhonePe / GPay"],["Card","💳 Debit / Credit Card"]].map(([v,l])=>(
                    <label key={v} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer",padding:"10px 12px",borderRadius:12,border:`2px solid ${payMethod===v?T.primary:"#e9ecef"}`,background:payMethod===v?T.primary+"08":"#fff"}}>
                      <input type="radio" name="pay" value={v} checked={payMethod===v} onChange={()=>setPayMethod(v)}/><span style={{fontWeight:700,fontSize:14}}>{l}</span>
                    </label>
                  ))}
                </div>
                <div style={{...S.card,background:"linear-gradient(135deg,#f0fff4,#dcfce7)"}}>
                  {discount>0&&<div style={{...S.row,color:T.success,marginBottom:6,fontSize:13}}><span>💰 You save</span><span style={{fontWeight:900}}>₹{discount}</span></div>}
                  <div style={{...S.row,fontSize:17,fontWeight:900}}><span>Grand Total</span><span style={{color:T.success}}>₹{grandTotal}</span></div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button style={S.btn(T.muted)} onClick={()=>setCheckout(0)}>← Back</button>
                  <button style={{...S.btn(T.success),flex:1}} onClick={placeOrder}>✅ Place Order</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab==="orders"&&!success&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>📦 My Orders</h2>
            {orders.length===0?(
              <div style={{textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:60}}>📦</div><div style={{fontWeight:700,marginTop:10}}>No orders yet</div><button style={{...S.btn(T.primary),marginTop:14}} onClick={()=>setTab("home")}>Start Shopping</button></div>
            ):selectedOrder?(
              <div>
                <button onClick={()=>setSelectedOrder(null)} style={{...S.btn(T.muted),marginBottom:14,padding:"8px 16px",fontSize:13}}>← All Orders</button>
                <div style={S.card}>
                  <div style={{...S.row,marginBottom:12}}><div style={{fontWeight:900,fontSize:15}}>{selectedOrder.id}</div><div style={{fontSize:12,color:T.muted}}>{new Date(selectedOrder.placedAt).toLocaleDateString("en-IN")}</div></div>
                  <DeliveryTracker status={selectedOrder.status}/>
                  <div style={S.div}/>
                  <div style={{fontWeight:800,marginBottom:8}}>📋 Items</div>
                  {selectedOrder.items.map(i=><div key={i.productId} style={{...S.row,marginBottom:5,fontSize:13}}><span style={{color:T.muted}}>• {i.name} × {i.qty}</span><span style={{fontWeight:700}}>₹{i.subtotal}</span></div>)}
                  <div style={S.div}/>
                  {selectedOrder.discount>0&&<div style={{...S.row,color:T.success,fontSize:13,marginBottom:4}}><span>Coupon Discount</span><span style={{fontWeight:800}}>− ₹{selectedOrder.discount}</span></div>}
                  <div style={{...S.row,fontSize:16,fontWeight:900,color:T.primary}}><span>Total Paid</span><span>₹{selectedOrder.total}</span></div>
                  <div style={{fontSize:12,color:T.muted,marginTop:5}}>Payment: {selectedOrder.paymentMethod}</div>
                </div>
              </div>
            ):orders.map(o=>(
              <div key={o.id} style={{...S.card,cursor:"pointer"}} onClick={()=>setSelectedOrder(o)}>
                <div style={S.row}><div style={{fontWeight:900,fontSize:13}}>{o.id}</div><div style={{fontSize:11,color:T.muted}}>{new Date(o.placedAt).toLocaleDateString("en-IN")}</div></div>
                <div style={{fontSize:12,color:T.muted,marginTop:5}}>{o.items.slice(0,2).map(i=><span key={i.productId} style={{marginRight:8}}>• {i.name} ×{i.qty}</span>)}{o.items.length>2&&<span>+{o.items.length-2} more</span>}</div>
                <div style={S.div}/>
                <div style={S.row}><span style={{fontWeight:900,color:T.primary,fontSize:15}}>₹{o.total}</span><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12,fontWeight:800,textTransform:"capitalize"}}><span style={S.dot(o.status)}/>{o.status}</span><span style={{color:T.muted,fontSize:11}}>Track →</span></div></div>
              </div>
            ))}
          </div>
        )}

        {tab==="notifs"&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>🔔 Notifications</h2>
            {notifs.length===0?(<div style={{textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:60}}>🔔</div><div style={{fontWeight:700,marginTop:10}}>No notifications yet</div></div>)
            :notifs.map(n=>(
              <div key={n.id} style={{...S.card,borderLeft:`4px solid ${n.read?T.border:T.primary}`,padding:14}}>
                <div style={{fontWeight:800,fontSize:14}}>{n.title}</div>
                <div style={{fontSize:13,color:T.muted,marginTop:3}}>{n.msg}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:5}}>{new Date(n.time).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="profile"&&(
          <div style={S.sec}>
            <div style={{...S.card,textAlign:"center",padding:28}}>
              <div style={{width:72,height:72,background:`linear-gradient(135deg,${T.primary},${T.warning})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 12px",color:"#fff"}}>👤</div>
              <div style={{fontWeight:900,fontSize:20}}>{user.name}</div>
              <div style={{color:T.muted,fontSize:14,marginTop:3}}>📱 +91 {user.phone}</div>
              <div style={{color:T.muted,fontSize:13,marginTop:3}}>📍 {user.address}</div>
            </div>
            <div style={S.card}>
              <div style={{fontWeight:800,marginBottom:10}}>📊 My Stats</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["📦","Total Orders",orders.length],["💰","Total Spent","₹"+orders.reduce((s,o)=>s+o.total,0).toLocaleString("en-IN")]].map(([icon,label,val])=>(
                  <div key={label} style={{background:T.bg,borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:22}}>{icon}</div><div style={{fontWeight:900,fontSize:16,color:T.primary}}>{val}</div><div style={{fontSize:11,color:T.muted}}>{label}</div></div>
                ))}
              </div>
            </div>
            <button style={S.btn("#dc3545",true)} onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>

      <div style={S.nav}>
        {[["home","🏠","Home"],["cart","🛒",cartCount>0?`Cart(${cartCount})`:"Cart"],["orders","📦","Orders"],["notifs","🔔",unreadNotifs>0?`(${unreadNotifs})`:"Alerts"],["profile","👤","Profile"]].map(([t,icon,label])=>(
          <button key={t} style={S.navBtn(tab===t)} onClick={()=>{setTab(t);if(t!=="orders")setSuccess(null);}}>
            <span style={{fontSize:18}}>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminPortal({onLogout}) {
  const [tab,setTab]=useState("dashboard");
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [customers,setCustomers]=useState({});
  const [editP,setEditP]=useState(null);
  const [newP,setNewP]=useState({name:"",cat:"Grocery",price:"",emoji:"📦",stock:""});
  const [showAdd,setShowAdd]=useState(false);
  const {toasts,show:showToast}=useToast();

  const load=()=>{
    let p=sGet("mm_products"); if(!p){p=PRODUCTS;sSet("mm_products",p);} setProducts(p);
    setOrders(sGet("mm_orders")||[]);
    setCustomers(sGet("mm_cust")||{});
  };
  useEffect(()=>{load();},[]);

  const updateStatus=(id,status)=>{
    const updated=orders.map(o=>o.id===id?{...o,status}:o);
    setOrders(updated); sSet("mm_orders",updated);
    const order=orders.find(o=>o.id===id);
    if(order){
      const nk="mm_notifs_"+order.customerPhone;
      const notifs=sGet(nk)||[];
      notifs.unshift({id:Date.now(),title:`Order ${id} Update`,msg:`Your order is now: ${status.charAt(0).toUpperCase()+status.slice(1)} ${status==="dispatched"?"🚚":status==="delivered"?"✅":"📦"}`,time:new Date().toISOString(),read:false});
      sSet(nk,notifs);
    }
    showToast(`Updated to: ${status}`);
  };

  const saveProduct=()=>{
    if(!newP.name||!newP.price)return;
    const list=[...products,{...newP,id:Date.now(),price:+newP.price,stock:+newP.stock||0,rating:4.5,sold:0}];
    setProducts(list);sSet("mm_products",list);
    setNewP({name:"",cat:"Grocery",price:"",emoji:"📦",stock:""});setShowAdd(false);showToast("✅ Product added!");
  };
  const deleteProduct=(id)=>{const l=products.filter(p=>p.id!==id);setProducts(l);sSet("mm_products",l);showToast("🗑️ Deleted");};
  const updateProduct=()=>{const l=products.map(p=>p.id===editP.id?{...editP,price:+editP.price,stock:+editP.stock}:p);setProducts(l);sSet("mm_products",l);setEditP(null);showToast("✅ Updated!");};

  const revenue=orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const pending=orders.filter(o=>!["delivered","cancelled"].includes(o.status)).length;
  const delivered=orders.filter(o=>o.status==="delivered").length;

  const chartData=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const day=d.toLocaleDateString("en-IN",{weekday:"short"});
    const dayOrders=orders.filter(o=>{const od=new Date(o.placedAt);return od.toDateString()===d.toDateString();});
    return{day,orders:dayOrders.length,revenue:dayOrders.reduce((s,o)=>s+o.total,0)};
  });

  return (
    <div style={S.app}>
      <Toast toasts={toasts}/>
      <div style={S.hdr(`linear-gradient(135deg,${T.dark},#16213e)`)}>
        <div><div style={{fontSize:17,fontWeight:900}}>⚙️ Admin Portal</div><div style={{fontSize:10,opacity:0.75}}>Mamta Mart · Dholka</div></div>
        <button onClick={onLogout} style={S.ghost}>Logout</button>
      </div>

      <div style={{paddingBottom:76,overflowY:"auto",maxHeight:"calc(100vh - 56px)"}}>
        {tab==="dashboard"&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>📊 Dashboard</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[["📦",orders.length,"Total Orders",T.primary],["⏳",pending,"Pending",T.warning],["✅",delivered,"Delivered",T.success],["💰","₹"+revenue.toLocaleString("en-IN"),"Revenue",T.info]].map(([icon,val,label,color])=>(
                <div key={label} style={{...S.card,textAlign:"center",borderTop:`4px solid ${color}`,padding:14,margin:0}}>
                  <div style={{fontSize:24}}>{icon}</div><div style={{fontWeight:900,fontSize:18,color}}>{val}</div><div style={{fontSize:11,color:T.muted,fontWeight:700}}>{label}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:900,marginBottom:12,fontSize:14}}>📈 Revenue — Last 7 Days</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="day" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}}/>
                  <Tooltip formatter={(v)=>["₹"+v,"Revenue"]} contentStyle={{borderRadius:10,fontSize:12}}/>
                  <Bar dataKey="revenue" fill={T.primary} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={{fontWeight:900,marginBottom:12,fontSize:14}}>📦 Orders — Last 7 Days</div>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={chartData} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="day" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} allowDecimals={false}/>
                  <Tooltip contentStyle={{borderRadius:10,fontSize:12}}/>
                  <Line type="monotone" dataKey="orders" stroke={T.success} strokeWidth={3} dot={{r:4,fill:T.success}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{fontWeight:900,fontSize:14,margin:"4px 0 10px"}}>🕐 Recent Orders</div>
            {orders.length===0&&<div style={{textAlign:"center",padding:24,color:T.muted,fontSize:13}}>No orders yet 😊</div>}
            {orders.slice(0,5).map(o=>(
              <div key={o.id} style={{...S.card,padding:12,margin:"0 0 10px"}}>
                <div style={S.row}>
                  <div><div style={{fontWeight:900,fontSize:12}}>{o.id}</div><div style={{fontSize:12,color:T.muted}}>👤 {o.customerName} · ₹{o.total}</div></div>
                  <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{fontSize:11,borderRadius:8,border:"1.5px solid #e9ecef",padding:"4px 6px",fontFamily:"inherit",fontWeight:700}}>
                    {ORDER_STEPS.concat("cancelled").map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="orders"&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>📦 All Orders ({orders.length})</h2>
            {orders.length===0&&<div style={{textAlign:"center",padding:36,color:T.muted}}>No orders yet</div>}
            {orders.map(o=>(
              <div key={o.id} style={{...S.card,padding:13}}>
                <div style={S.row}><div style={{fontWeight:900,fontSize:13}}>{o.id}</div><div style={{fontSize:11,color:T.muted}}>{new Date(o.placedAt).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</div></div>
                <div style={{fontSize:13,marginTop:5}}><b>👤 {o.customerName}</b> · 📱 {o.customerPhone}</div>
                <div style={{fontSize:12,color:T.muted}}>📍 {o.customerAddress}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:4}}>{o.items.map(i=><span key={i.productId} style={{marginRight:8}}>• {i.name} ×{i.qty}</span>)}</div>
                <DeliveryTracker status={o.status}/>
                <div style={S.div}/>
                <div style={S.row}>
                  <span style={{fontWeight:900,color:T.primary}}>₹{o.total} · {o.paymentMethod}</span>
                  <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{fontSize:12,borderRadius:9,border:"2px solid #e9ecef",padding:"5px 8px",fontFamily:"inherit",fontWeight:700}}>
                    {ORDER_STEPS.concat("cancelled").map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="products"&&(
          <div style={S.sec}>
            <div style={{...S.row,marginBottom:12}}><h2 style={{margin:0,fontWeight:900}}>🛍️ Products ({products.length})</h2><button style={S.btn(T.success)} onClick={()=>setShowAdd(true)}>+ Add</button></div>
            {showAdd&&(
              <div style={{...S.card,borderTop:`4px solid ${T.success}`,marginBottom:12}}>
                <div style={{fontWeight:800,marginBottom:8}}>➕ New Product</div>
                {[["name","Product Name"],["price","Price (₹)"],["stock","Stock Qty"],["emoji","Emoji Icon"]].map(([k,l])=>(
                  <div key={k} style={{marginBottom:8}}><label style={S.lbl}>{l}</label><input style={S.input} value={newP[k]} onChange={e=>setNewP(p=>({...p,[k]:e.target.value}))}/></div>
                ))}
                <div style={{marginBottom:8}}><label style={S.lbl}>Category</label><select style={{...S.input}} value={newP.cat} onChange={e=>setNewP(p=>({...p,cat:e.target.value}))}>{CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
                <div style={{display:"flex",gap:8}}><button style={S.btn(T.success)} onClick={saveProduct}>Save</button><button style={S.btn(T.muted)} onClick={()=>setShowAdd(false)}>Cancel</button></div>
              </div>
            )}
            {products.map(p=>(
              <div key={p.id} style={{...S.card,padding:11}}>
                {editP?.id===p.id?(
                  <div>
                    {[["name","Name"],["price","Price"],["stock","Stock"],["emoji","Icon"]].map(([k,l])=>(
                      <div key={k} style={{marginBottom:7}}><label style={S.lbl}>{l}</label><input style={S.input} value={editP[k]} onChange={e=>setEditP(ep=>({...ep,[k]:e.target.value}))}/></div>
                    ))}
                    <div style={{display:"flex",gap:8}}><button style={S.btn(T.success)} onClick={updateProduct}>Save</button><button style={S.btn(T.muted)} onClick={()=>setEditP(null)}>Cancel</button></div>
                  </div>
                ):(
                  <div style={S.row}>
                    <div style={{display:"flex",gap:10,alignItems:"center",flex:1,minWidth:0}}>
                      <div style={{fontSize:26,background:T.catBg[p.cat],borderRadius:10,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{p.emoji}</div>
                      <div style={{minWidth:0}}><div style={{fontWeight:800,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div><div style={{fontSize:11,color:T.muted}}>{p.cat} · Stock: {p.stock}</div><div style={{fontWeight:900,color:T.primary,fontSize:14}}>₹{p.price}</div></div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={()=>setEditP(p)} style={{background:"#e3f2fd",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>✏️</button>
                      <button onClick={()=>deleteProduct(p.id)} style={{background:"#fff5f5",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab==="customers"&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>👥 Customers ({Object.keys(customers).length})</h2>
            {Object.keys(customers).length===0&&<div style={{textAlign:"center",padding:36,color:T.muted}}><div style={{fontSize:52}}>👥</div><div style={{fontWeight:700,marginTop:10}}>No customers yet</div></div>}
            {Object.values(customers).map(c=>(
              <div key={c.phone} style={S.card}>
                <div style={S.row}>
                  <div><div style={{fontWeight:800}}>👤 {c.name}</div><div style={{fontSize:13,color:T.muted}}>📱 +91 {c.phone}</div><div style={{fontSize:12,color:T.muted}}>📍 {c.address}</div></div>
                  <div style={{textAlign:"right"}}><div style={S.tag(T.success)}>Active</div><div style={{fontSize:11,color:T.muted,marginTop:5}}>{new Date(c.joinedAt||Date.now()).toLocaleDateString("en-IN")}</div><div style={{fontSize:11,color:T.primary,fontWeight:700,marginTop:2}}>{orders.filter(o=>o.customerPhone===c.phone).length} orders</div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="coupons"&&(
          <div style={S.sec}>
            <h2 style={{margin:"0 0 14px",fontWeight:900}}>🏷️ Coupons</h2>
            {COUPONS.map(c=>(
              <div key={c.code} style={{...S.card,borderLeft:`4px solid ${T.warning}`}}>
                <div style={S.row}><div style={{fontWeight:900,fontSize:16,letterSpacing:1}}>{c.code}</div><div style={S.tag(T.warning)}>{c.label}</div></div>
                <div style={{fontSize:13,color:T.muted,marginTop:5}}>{c.desc}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>Min order: ₹{c.min}</div>
                <div style={{fontSize:12,marginTop:6,color:T.info,fontWeight:700}}>Used: {orders.filter(o=>o.coupon===c.code).length} times</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.nav}>
        {[["dashboard","📊","Dashboard"],["orders","📦","Orders"],["products","🛍️","Products"],["customers","👥","Customers"],["coupons","🏷️","Coupons"]].map(([t,icon,label])=>(
          <button key={t} style={S.navBtn(tab===t,T.dark)} onClick={()=>{setTab(t);load();}}>
            <span style={{fontSize:18}}>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [mode,setMode]=useState("select");
  const [user,setUser]=useState(null);

  if(mode==="select") return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#c1121f,${T.primary} 45%,${T.warning})`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{textAlign:"center",color:"#fff",maxWidth:360,width:"100%"}}>
        <div style={{width:90,height:90,background:"rgba(255,255,255,0.15)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,margin:"0 auto 14px",border:"2px solid rgba(255,255,255,0.3)"}}>🛒</div>
        <div style={{fontSize:38,fontWeight:900,letterSpacing:"-1px"}}>Mamta Mart</div>
        <div style={{fontSize:15,opacity:0.9,marginTop:4}}>Dholka's Digital Bazaar</div>
        <div style={{display:"inline-flex",gap:6,alignItems:"center",background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 16px",margin:"10px 0 36px",fontSize:12}}>🚚 Free delivery above ₹1,000 in Dholka</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <button style={{background:"#fff",color:T.primary,border:"none",borderRadius:20,padding:20,fontWeight:900,fontSize:16,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",textAlign:"left",display:"flex",alignItems:"center",gap:14}} onClick={()=>setMode("customer")}>
            <div style={{width:48,height:48,background:`linear-gradient(135deg,${T.primary},${T.warning})`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🛍️</div>
            <div><div>Customer App</div><div style={{fontSize:12,fontWeight:500,color:T.muted,marginTop:2}}>Browse & order products</div></div>
          </button>
          <button style={{background:"rgba(255,255,255,0.12)",color:"#fff",border:"2px solid rgba(255,255,255,0.3)",borderRadius:20,padding:20,fontWeight:900,fontSize:16,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:14}} onClick={()=>setMode("admin")}>
            <div style={{width:48,height:48,background:"rgba(255,255,255,0.15)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>⚙️</div>
            <div><div>Admin Portal</div><div style={{fontSize:12,fontWeight:500,opacity:0.8,marginTop:2}}>Manage store & analytics</div></div>
          </button>
        </div>
        <div style={{fontSize:11,opacity:0.6,marginTop:24}}>Powered by Mamta Mart Digital · Dholka</div>
      </div>
    </div>
  );

  if(mode==="customer") return <CustomerLogin onLogin={(u)=>{setUser(u);setMode("customer-app");}}/>;
  if(mode==="admin") return <AdminLogin onLogin={()=>setMode("admin-app")}/>;
  if(mode==="customer-app"&&user) return <CustomerApp user={user} onLogout={()=>{setUser(null);setMode("select");}}/>;
  if(mode==="admin-app") return <AdminPortal onLogout={()=>setMode("select")}/>;
  return null;
}

