/* app.js - 메인 기능 코드 */

const SUPABASE_URL = "https://mpyxzzbmpweakzjemngm.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_TzdeL4ssUn7nB8uAeQCthA_t4xBkbSf";

    let supabaseClient = null;

    const DB = {
      mode: "local",
      lastError: ""
    };

    const HOME_LOGIN_SESSION_KEY = "warehouse_home_login_ok";

    async function getMyProfileRole(){
      if(!supabaseClient) return null;

      try{
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if(userError) throw userError;
        if(!user) return null;

        const { data, error } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if(error) throw error;
        return data?.role || null;
      }catch(err){
        console.error("프로필 role 조회 실패:", err);
        return null;
      }
    }

    async function isAdminUser(){
      const role = await getMyProfileRole();
      return role === "admin";
    }

    function isHomeLoggedIn(){
      return sessionStorage.getItem(HOME_LOGIN_SESSION_KEY) === "yes";
    }

    function setHomeLoggedIn(ok){
      if(ok){
        sessionStorage.setItem(HOME_LOGIN_SESSION_KEY, "yes");
      }else{
        sessionStorage.removeItem(HOME_LOGIN_SESSION_KEY);
      }
    }

    async function syncHomeLoginSessionFromSupabase(){
      if(!supabaseClient){
        setHomeLoggedIn(false);
        return false;
      }

      try{
        const { data, error } = await supabaseClient.auth.getSession();
        if(error) throw error;
        const hasSession = !!data?.session;
        setHomeLoggedIn(hasSession);
        return hasSession;
      }catch(err){
        console.error("홈 로그인 세션 확인 실패:", err);
        setHomeLoggedIn(false);
        return false;
      }
    }
    
    function updateTopbarLogo(){
  const topbar = document.getElementById("topbar");
  const searchBox = document.getElementById("searchBox");
  if(!topbar || !searchBox) return;

  const searchHidden =
    searchBox.style.display === "none" ||
    searchBox.hidden ||
    searchBox.classList.contains("hidden");

  topbar.classList.toggle("no-search", searchHidden);
}

    async function logoutHome(){
      try{
        if(supabaseClient){
          await supabaseClient.auth.signOut();
        }
      }catch(err){
        console.error("로그아웃 실패:", err);
      }finally{
        setHomeLoggedIn(false);
        location.hash = "#/login";
      }
    }

    function initSupabase(){
  console.log("[boot] initSupabase 시작");
  try{
    console.log("[boot] window.supabase:", !!window.supabase);
    console.log("[boot] createClient 존재:", !!(window.supabase && window.supabase.createClient));

    if(window.supabase && typeof window.supabase.createClient === "function"){
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("[boot] supabaseClient 생성 완료:", !!supabaseClient);

      DB.mode = "connected";
      DB.lastError = "";
      return true;
    }
  }catch(e){
    console.error("Supabase init 실패:", e);
    DB.mode = "error";
    DB.lastError = String(e?.message || e);
  }

  console.warn("[boot] supabaseClient 생성 실패");
  supabaseClient = null;
  DB.mode = "local";
  return false;
}

    function dbReady(){ return !!supabaseClient; }

    function dbStatusText(){
      if(DB.mode === "synced") return "연동됨(동기화됨)";
      if(DB.mode === "connected") return "연결됨(동기화 대기)";
      if(DB.mode === "error") return "DB 오류(로컬로 동작)";
      return "로컬만(연동안됨)";
    }

    const STORAGE_KEY = "warehouse_stock_v1";

    // 홈 화면 도록 메뉴 전용 고정 이미지
    // 내부 상세페이지 galleryImages와 완전히 분리해서 사용함
    const CATALOG_HOME_FIXED_IMAGES = {
      "offline-auction": "images/sa-ca-01.png",
      "contemporary-art-auction": "images/sa-ca-02.png",
      "zero-base": "images/sa-ca-03.png"
    };

    const CATALOG_MENU = [
      {
        id: "offline-auction",
        label: "Major\\nAuction",
        theme: "light",
        iconImg: CATALOG_HOME_FIXED_IMAGES["offline-auction"]
      },
      {
        id: "contemporary-art-auction",
        label: "Contemporary\\nArt Sale",
        theme: "mint",
        iconImg: CATALOG_HOME_FIXED_IMAGES["contemporary-art-auction"]
      },
      {
        id: "zero-base",
        label: "Zero\\nBase",
        theme: "light",
        iconImg: CATALOG_HOME_FIXED_IMAGES["zero-base"]
      }
    ];

    const CATALOG_PAGE_CONFIG = {
  "offline-auction": {
    title: "도록 | Major Auction",
    yearPlaceholder: "연도",
    galleryImages: [
      "images/1/2601_189.jpg",
      "images/1/2602_190.jpg",
      "images/1/2603_contem.jpg",
      "images/1/sa-d-1.jpg",
      "images/sa-ca-01.png",
      "images/sa-ca-01.png"
    ],
    data: {
      "2031": [],
      "2030": [],
      "2029": [],
      "2028": [],
      "2027": [],
      "2026": ["191회", "190회", "189회"]
    },
  
  },

  "contemporary-art-auction": {
    title: "도록 | Contemporary Art Sale",
    yearPlaceholder: "연도",
    galleryImages: [
      "images/sa-ca-02.png",
      "images/sa-ca-02.png",
      "images/sa-ca-02.png",
      "images/sa-ca-02.png",
      "images/sa-ca-02.png",
      "images/sa-ca-02.png"
    ],
    data: {
      "2031": [],
      "2030": [],
      "2029": [],
      "2028": [],
      "2027": [],
      "2026": ["3월 컨템", "6월 컨템"]
    },
  
  },

  "zero-base": {
    title: "도록 | Zero Base",
    yearPlaceholder: "연도",
    galleryImages: [
      "images/sa-ca-03.png",
      "images/sa-ca-03.png",
      "images/sa-ca-03.png",
      "images/sa-ca-03.png",
      "images/sa-ca-03.png",
      "images/sa-ca-03.png"
    ],
    data: {
      "2031": [],
      "2030": [],
      "2029": [],
      "2028": [],
      "2027": [],
      "2026": ["5월 화성"]
    },
  
  }
};

    function getCatalogDisplayTitle(catalogId){
      switch(String(catalogId || "")){
        case "offline-auction":
          return "도록 | Major Auction";
        case "contemporary-art-auction":
          return "도록 | Contemporary Art Sale";
        case "zero-base":
          return "도록 | Zero Base";
        default:
          return "도록 | Major Auction";
      }
    }

    function getCatalogTypeLabel(catalogId){
      switch(String(catalogId || "")){
        case "offline-auction":
          return "Major Auction";
        case "contemporary-art-auction":
          return "Contemporary Art Sale";
        case "zero-base":
          return "Zero Base";
        default:
          return "Major Auction";
      }
    }

    function getUnifiedCatalogOptions(){
      return [
        { id: "offline-auction", label: "Major Auction" },
        { id: "contemporary-art-auction", label: "Contemporary Art Sale" },
        { id: "zero-base", label: "Zero Base" }
      ];
    }

    function getUnifiedCatalogConfig(catalogId){
  const id = String(catalogId || "offline-auction");
  const base = CATALOG_PAGE_CONFIG[id] || CATALOG_PAGE_CONFIG["offline-auction"] || {};

  const galleryImages = Array.isArray(base.galleryImages)
    ? [...base.galleryImages]
    : [];

  return {
    ...base,
    id,
    title: getCatalogDisplayTitle(id),
    typeLabel: getCatalogTypeLabel(id),
    typeOptions: getUnifiedCatalogOptions(),
    galleryImages
  };
}


    const data = [
      {
        category: "봉투",
        items: [
          {
            id: "env-big",
            name: "대봉투",
            size: "210*297mm",
            baseStock: 1720,
            img: "large-paper-bag(Front).jpg",
            images: ["large-paper-bag(Front).jpg","large-paper-bag(Back).jpg"],
            logs: [
              { d:"2026-03-17", t:"출고", dept:"아카이브팀", person:"ooo선임", qty:200 },
              { d:"2026-03-31", t:"입고", dept:"운영팀", person:"(입력)", qty:800 },
              { d:"2026-02-02", t:"출고", dept:"아카이브팀", person:"ooo선임", qty:200 },
              { d:"2026-02-18", t:"입고", dept:"아카이브팀", person:"ooo선임", qty:500 },
            ],
          },
          {
            id: "env-letter",
            name: "편지봉투",
            size: "390*140*300mm",
            baseStock: 1000,
            img: "Letter-Envelope(Front).jpg",
            images: ["Letter-Envelope(Front).jpg","Letter-envelope(back).jpg"],
            logs: [
              { d:"2026-02-10", t:"출고", dept:"운영팀", person:"ooo", qty:120 },
              { d:"2026-02-18", t:"입고", dept:"운영팀", person:"ooo", qty:300 },
            ],
          },
          {
            id: "mint-delivery-bag-big",
            name: "민트봉투(大)",
            size: "290*400mm",
            baseStock: 6500,
            img: "mint-delivery-bag-1.jpg",
            images: ["mint-delivery-bag-1.jpg", null],
            logs: [
              { d:"2026-02-12", t:"출고", dept:"운영팀", person:"ooo", qty:50 },
            ]
          },
          {
            id: "mint-delivery-bag-small",
            name: "민트봉투(小)",
            size: "290*400mm",
            baseStock: 1000,
            img: "mint-delivery-bag-2.jpg",
            images: ["mint-delivery-bag-2.jpg", null],
            logs: [
              { d:"2026-02-12", t:"출고", dept:"운영팀", person:"ooo", qty:50 },
            ]
          },
        ]
      },
      {
        category: "홀더",
        items: [
          {
            id: "holder-gray",
            name: "보증서홀더(회색)",
            size: "225*310mm",
            baseStock: 1720,
            img: "Warranty-Holder(Gray-Front).jpg",
            images: ["Warranty-Holder(Gray-Front).jpg", "Warranty-Holder(Gray-in).jpg"],
            logs: [
              { d:"2026-02-07", t:"입고", dept:"구매", person:"ooo", qty:300 },
              { d:"2026-02-17", t:"출고", dept:"아카이브팀", person:"ooo", qty:80 },
            ]
          },
          {
            id: "office-holder-sky",
            name: "사무용홀더",
            size: "225*310mm",
            baseStock: 1000,
            img: "Guaranteed-Holder(in-SkyBlue-F).jpg",
            images: ["Guaranteed-Holder(in-SkyBlue-F).jpg","Guaranteed-Holder(in-SkyBlue).jpg"],
            logs: [
              { d:"2026-02-12", t:"출고", dept:"운영팀", person:"ooo", qty:40 },
            ]
          },
          {
            id: "holder-navy",
            name: "수입지홀더(남색)",
            size: "225*310mm",
            baseStock: 100,
            img: "Warranty-holder(navy).jpg",
            images: ["Warranty-holder(navy).jpg", null],
            logs: []
          },
          {
            id: "holder-purple",
            name: "수입지홀더(보라색)",
            size: "225*310mm",
            baseStock: 1000,
            img: "Warranty-holder(purple).jpg",
            images: ["Warranty-holder(purple).jpg", "Warranty-holder.jpg"],
            logs: [
              { d:"2026-02-12", t:"출고", dept:"운영팀", person:"ooo", qty:90 },
            ]
          },
        
        ]
      },
      {
        category: "쇼핑백",
        items: [
          {
            id: "bag-black-big",
            name: "흑지쇼핑백(大)",
            size: "480*180*380mm",
            baseStock: 1720,
            img: "Black-Shopping-Bag(L).jpg",
            images: ["Black-Shopping-Bag(L).jpg", "Black-Shopping-Bag.jpg"],
            logs: [
              { d:"2026-02-05", t:"출고", dept:"전시팀", person:"ooo", qty:100 },
            ]
          },
          {
            id: "bag-black-small",
            name: "흑지쇼핑백(小)",
            size: "390*140*300mm",
            baseStock: 1000,
            img: "Black-Shopping-Bag(S).jpg",
            images: ["Black-Shopping-Bag(S).jpg", "Black-Shopping-Bag.jpg"],
            logs: [
              { d:"2026-02-11", t:"출고", dept:"전시팀", person:"ooo", qty:60 },
            ]
          },
          {
            id: "blackwhite-shopping-bag",
            name: "검흰쇼핑백",
            size: "310*95*230mm",
            baseStock: 1000,
            img: "black&white-shopping-bag(1).jpg",
            images: ["black&white-shopping-bag(1).jpg", "black&white-shopping-bag(2).jpg"],
            logs: [
              { d:"2/11", t:"출고", to:"전시팀 - ooo", qty:200 },
            ]
          },
          {
            id: "wine-shopping-bag",
            name: "와인쇼핑백(1구)",
            size: "130*110*360mm",
            baseStock: 1000,
            img: "wine-shopping-bag.jpg",
            images: ["wine-shopping-bag-1.jpg", "wine-shopping-bag.jpg"],
            logs: [
              { d:"2/11", t:"출고", to:"전시팀 - ooo", qty:200 },
            ]
          },
          {
            id: "env-pvc",
            name: "PVC 쇼핑백",
            size: "310*95*230mm",
            baseStock: 1000,
            img: "PVC-bag.jpg",
            images: ["PVC-bag.jpg", "PVC-bag-1.jpg"],
            logs: [
              { d:"2026-02-01", t:"입고", dept:"구매", person:"ooo", qty:200 },
              { d:"2026-02-17", t:"출고", dept:"운영팀", person:"ooo", qty:80 },
            ],
          },
          {
            id: "env-gray",
            name: "회색쇼핑백",
            size: "130*110*360mm",
            baseStock: 1000,
            img: "gray-hand-bag.jpg",
            images: ["gray-hand-bag.jpg", "gray-hand-bag-1.jpg"],
            logs: [
              { d:"2026-02-17", t:"입고", dept:"구매", person:"ooo", qty:200 },
            ],
          },
        ]
      },
      {
        category: "박스",
        items: [
          {
            id: "wine-box-1",
            name: "와인박스(1구)",
            size: "",
            baseStock: 1000,
            img: "wine-box-1.jpg",
            images: ["wine-box-1.jpg", null],
            logs: []
          },
        ]
      },

      {
        category: "기타",
        items: [
          {
            id:"etc-shirt-black",
            name:"조지몰튼 티셔츠(B)",
            size:"",
            baseStock:1000,
            img:"images/sa-GM-T-black.jpg",
            images:["images/sa-GM-T-black.jpg"],
            logs:[],
            price:"35,700원"
          },
          {
            id:"etc-shirt-white",
            name:"조지몰튼 티셔츠(W)",
            size:"",
            baseStock:1000,
            img:"images/sa-GM-T-white.jpg",
            images:["images/sa-GM-T-white.jpg"],
            logs:[],
            price:"35,700원"
          },
          {
            id:"etc-bag",
            name:"SA 가방",
            size:"310*200*40mm",
            baseStock:1000,
            img:"SA-bag.jpg",
            images:["SA-bag.jpg"],
            logs:[],
            price:"24,000원"
          }
        ]
      }
    ];

    const INITIAL_ITEM_IDS = new Set(
      data.flatMap(sec => (sec.items || []).map(it => it.id))
    );

    const app = document.getElementById("app");
    const navBack = document.getElementById("navBack");
const navForward = document.getElementById("navForward");
const navHome = document.getElementById("navHome");
const navReload = document.getElementById("navReload");
    const q = document.getElementById("q");
    const doSearch = document.getElementById("doSearch");
    const searchBox = document.getElementById("searchBox");
    const topbarLogo = document.getElementById("topbarLogo");
    const homeLink = document.getElementById("homeLink");
    const topbar = document.getElementById("topbar");
    const topTitle = document.getElementById("topTitle");

    const TOPBAR_TITLE_LOGO_HTML = `<img src="images/sa-logo-5.jpg" class="topLogo" alt="SeoulAuction">`;
    const TOPBAR_RIGHT_LOGO_HTML = `<img src="images/sa-logo-5.jpg" alt="SeoulAuction">`;
    const TOPBAR_CATALOG_SEARCH_HTML = `<input id="catalogSearch" class="catalogTopSearch" type="text" placeholder="" aria-label="검색">`;

    function setTopbarTitleLogo(){
      if(topTitle) topTitle.innerHTML = TOPBAR_TITLE_LOGO_HTML;
    }

    function setTopbarRightLogo(){
      if(topbarLogo) topbarLogo.innerHTML = TOPBAR_RIGHT_LOGO_HTML;
    }

    function setTopbarRightSearch(){
      if(!topbarLogo) return;
      topbarLogo.innerHTML = TOPBAR_CATALOG_SEARCH_HTML;
    }

    const itemModal = document.getElementById("itemModal");
    const itemOverlay = document.getElementById("itemOverlay");
    const itemClose = document.getElementById("itemClose");
    const createItemBtn = document.getElementById("createItemBtn");
    const nCategory = document.getElementById("nCategory");
    const nName = document.getElementById("nName");
    const nSize = document.getElementById("nSize");
    const nBase = document.getElementById("nBase");
    const nImgFile = document.getElementById("nImgFile");
    const nImgFileName = document.getElementById("nImgFileName");
    const nImgPreviewBox = document.getElementById("nImgPreviewBox");
    const nImgPreview = document.getElementById("nImgPreview");

    nImgFile?.addEventListener("change", () => {
      const file = nImgFile.files?.[0];
      nImgFileName.textContent = file ? file.name : "선택된 파일 없음";

      if(file){
        const previewUrl = URL.createObjectURL(file);
        nImgPreview.src = previewUrl;
        nImgPreviewBox.style.display = "flex";
      }else{
        nImgPreview.removeAttribute("src");
        nImgPreviewBox.style.display = "none";
      }
    });

    function saveAllLocal(){
      try{
        const payload = data.map(sec => ({
          category: sec.category,
          items: (sec.items||[]).map(it => ({
            id: it.id,
            name: it.name,
            size: it.size,
            img: it.img ?? null,
            images: Array.isArray(it.images) ? it.images : [it.img ?? null, null],
            baseStock: Number(it.baseStock||0),
            logs: it.logs || [],
            requests: it.requests || []
          }))
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }catch(e){}
    }

    function loadAllLocal(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return;
        const saved = JSON.parse(raw);
        if(!Array.isArray(saved)) return;

        const firstItem = saved?.[0]?.items?.[0];
        const isNew = !!(firstItem && typeof firstItem === "object" && ("name" in firstItem));

        if(!isNew){
          const byId = new Map();
          for(const sec of saved){
            for(const it of (sec.items||[])){
              byId.set(it.id, it);
            }
          }
          for(const sec of data){
            for(const it of sec.items){
              const s = byId.get(it.id);
              if(s){
                if(typeof s.baseStock === "number") it.baseStock = s.baseStock;
                if(Array.isArray(s.logs)) it.logs = s.logs;
                if(Array.isArray(s.requests)) it.requests = s.requests;
              }
            }
          }
          return;
        }

        const baseIds = new Set();
        for(const sec of data) for(const it of (sec.items||[])) baseIds.add(it.id);

        const savedById = new Map(); 
        for(const sec of saved){
          for(const it of (sec.items||[])){
            savedById.set(it.id, it);
          }
        }

        for(const sec of data){
          for(const it of (sec.items||[])){
            const s = savedById.get(it.id);
            if(s){
              if(typeof s.baseStock === "number") it.baseStock = s.baseStock;
              if(Array.isArray(s.logs)) it.logs = s.logs;
              if(Array.isArray(s.requests)) it.requests = s.requests;
              if(s.img && !it.img) it.img = s.img;
              if(Array.isArray(s.images) && s.images.filter(Boolean).length > 0){
  it.images = s.images.filter(Boolean);
}
            }
          }
        }

        for(const sSec of saved){
          if(!sSec || !sSec.category) continue;
          const cat = String(sSec.category);
          let target = data.find(x => x.category === cat);
          if(!target){
            target = { category: cat, items: [] };
            data.push(target);
          }
          for(const sIt of (sSec.items||[])){
            if(!sIt || !sIt.id) continue;
            if(baseIds.has(sIt.id)) continue;
            target.items.push({
              id: sIt.id,
              name: sIt.name || "(신규)",
              size: sIt.size || "",
              baseStock: Number(sIt.baseStock||0),
              img: sIt.img ?? null,
              images: Array.isArray(sIt.images) ? sIt.images : [sIt.img ?? null, null],
              logs: Array.isArray(sIt.logs) ? sIt.logs : [],
              requests: Array.isArray(sIt.requests) ? sIt.requests : []
            });
            baseIds.add(sIt.id);
          }
        }
      }catch(e){}
    }

    function iconPlaceholder(){
      return `
        <svg class="imgPh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7 7h10v14H7V7Z" stroke="#cbd5e1" stroke-width="1.6"/>
          <path d="M9 7a3 3 0 0 1 6 0" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
    }

    function escapeHtml(str){
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function escapeAttr(str){
      return escapeHtml(str);
    }

    function isAbsoluteLike(path){
      return /^(https?:)?\/\//i.test(path) || /^data:/i.test(path) || /^blob:/i.test(path) || path.startsWith("/");
    }

    function uniq(arr){
      return [...new Set(arr.filter(Boolean))];
    }

    function getImageCandidates(path){
      const raw = String(path || "").trim();
      if(!raw) return [];
      if(isAbsoluteLike(raw)) return [raw];

      const noHeadSlash = raw.replace(/^\.?\//, "");
      return uniq([
        raw,
        "./" + noHeadSlash,
        "images/" + noHeadSlash,
        "./images/" + noHeadSlash
      ]);
    }

    window.handleImgLoad = function(imgEl){
      imgEl.classList.add("is-loaded");
    };

    window.handleImgError = function(imgEl){
      try{
        const list = JSON.parse(imgEl.dataset.candidates || "[]");
        let idx = Number(imgEl.dataset.idx || "0");
        idx += 1;

        if(idx < list.length){
          imgEl.dataset.idx = String(idx);
          imgEl.classList.remove("is-loaded");
          imgEl.src = list[idx];
          return;
        }

        const fallback = imgEl.dataset.fallback || "";
        if(fallback){
          imgEl.onerror = null;
          imgEl.outerHTML = fallback;
        }
      }catch(e){
        const fallback = imgEl.dataset.fallback || "";
        if(fallback){
          imgEl.onerror = null;
          imgEl.outerHTML = fallback;
        }
      }
    };

    function renderSmartImage(path, alt="", className=""){
      const candidates = getImageCandidates(path);
      const fallback = iconPlaceholder();
      if(!candidates.length) return fallback;

      return `
        <img
          ${className ? `class="${escapeAttr(className)}"` : ""}
          src="${escapeAttr(candidates[0])}"
          alt=""
          draggable="false"
          loading="eager"
          decoding="async"
          data-candidates='${escapeAttr(JSON.stringify(candidates))}'
          data-idx="0"
          data-fallback='${escapeAttr(fallback)}'
          onload="window.handleImgLoad(this)"
          onerror="window.handleImgError(this)"
        >
      `;
    }


    function getCatalogHomeFixedImage(catalogId){
      return CATALOG_HOME_FIXED_IMAGES[String(catalogId || "")] || "";
    }

function renderCatalogMenuImage(item){
      const id = String(item?.id || "");
      const img = getCatalogHomeFixedImage(id);
      if(img){
        return `<img src="${escapeAttr(img)}" alt="${escapeAttr(item?.label || "")}" class="catalogMenuThumbImg">`;
      }
      return `<div class="catalogMenuThumbPlaceholder">IMAGE</div>`;
    }

    function renderCatalogMenu(){
      return `
        <div class="catalogMenuSection">
          <div class="catalogMenuInner">
            <div class="catalogMenuHead">
              <div class="catalogMenuTitleGroup">
                <h3 class="catalogMenuTitle">도록</h3>
                <span class="catalogMenuDivider">|</span>
                <div class="catalogMenuTitleSub">Catalogue</div>
              </div>
              <button class="catalogMenuAction" type="button" data-catalog-open="offline-auction">신청하기 <span>▶</span></button>
            </div>

            <div class="catalogMenuGrid">
              ${getUnifiedCatalogOptions().map(item => `
                <button class="catalogMenuCard" type="button" data-catalog-open="${escapeAttr(item.id)}">
                  <div class="catalogMenuThumb">${renderCatalogMenuImage(item)}</div>
                  <div class="catalogMenuLabel">${escapeHtml(item.id === "zero-base" ? "ZEROBASE" : item.label)}</div>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }



    function getCatalogPrimaryYearRound(catalogId){
      const config = getUnifiedCatalogConfig(catalogId);
      const years = Object.keys(config?.data || {}).sort((a, b) => String(b).localeCompare(String(a)));
      const year = years.find(y => Array.isArray(config.data?.[y]) && config.data[y].length) || years[0] || "";
      const round = (Array.isArray(config?.data?.[year]) ? config.data[year][0] : "") || "";
      return { year, round };
    }

    function getCatalogPendingQty(catalogId){
      const rows = getCatalogRequests(catalogId);
      return rows
        .filter(r => (r.status || "pending") === "pending")
        .reduce((sum, r) => sum + Number(r.qty || 0), 0);
    }

    function renderAdminCatalogSummary(){
      const items = getUnifiedCatalogOptions();
      return `
        <div class="adminCatalogHomeSection">
          <div class="adminCatalogHomeTitle">도록</div>
          <div class="adminCatalogHomeList">
            ${items.map(item => {
              const meta = getCatalogPrimaryYearRound(item.id);
              const pendingQty = getCatalogPendingQty(item.id);
              const qtyText = pendingQty > 0 ? `-${pendingQty.toLocaleString()}개` : `0개`;
              const label = item.id === "zero-base" ? "ZERO BASE" : item.label;
              return `
                <button class="adminCatalogHomeRow" type="button" data-catalog-open="${escapeAttr(item.id)}">
                  <span class="adminCatalogHomeMain">
                    <strong>${escapeHtml(label)}</strong>
                    <em>${escapeHtml(meta.year || "-")} ${escapeHtml(meta.round || "")}</em>
                  </span>
                  <span class="adminCatalogHomeStatus">출고신청</span>
                  <span class="adminCatalogHomeQty">${escapeHtml(qtyText)}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    function getCatalogApplyStorageKey(catalogId){
      return `catalog_apply_selection_${catalogId}`;
    }

    function getCatalogRequestStorageKey(catalogId){
      return `catalog_request_rows_${catalogId}`;
    }

    function getCatalogRequests(catalogId){
      try{
        const raw = localStorage.getItem(getCatalogRequestStorageKey(catalogId));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
          ? parsed.map(row => normalizeLog({ ...row, t: "신청" }))
          : [];
      }catch(err){
        console.error("catalog request read 실패:", err);
        return [];
      }
    }

    function saveCatalogRequests(catalogId, rows){
      try{
        localStorage.setItem(getCatalogRequestStorageKey(catalogId), JSON.stringify(rows || []));
      }catch(err){
        console.error("catalog request save 실패:", err);
      }
    }
    async function getCatalogStockFromDB(catalogId, year, round){
      if(!dbReady()) return 0;

      const { data, error } = await supabaseClient
        .from(DB_CATALOG_STOCKS)
        .select("current_stock")
        .eq("catalog_id", catalogId)
        .eq("catalog_year", String(year || ""))
        .eq("catalog_round", String(round || ""))
        .maybeSingle();

      if(error){
        console.error("도록 재고 조회 실패:", error);
        return 0;
      }

      return Number(data?.current_stock || 0);
    }

    async function loadCatalogRequestsFromDB(catalogId){
      if(!dbReady()) return null;

      const { data, error } = await supabaseClient
        .from(DB_CATALOG_REQUESTS)
        .select("id, catalog_id, catalog_title, catalog_year, catalog_round, qty, department, requester_name, requester_email, status, current_stock, created_at, approved_at, approved_by, rejected_at, rejected_by")
        .eq("catalog_id", catalogId)
        .order("created_at", { ascending:false });

      if(error){
        console.error("도록 신청내역 조회 실패:", error);
        return null;
      }

      return (data || []).map(r => normalizeLog({
        d: r.created_at,
        t: "신청",
        dept: r.department || "-",
        person: r.requester_name || "",
        qty: Number(r.qty || 0),
        __key: `catalog_req_${r.id}`,
        _dbid: r.id,
        email: r.requester_email || "",
        status: r.status || "pending",
        year: r.catalog_year || "",
        round: r.catalog_round || "",
        currentStock: Number(r.current_stock || 0),
        approved_at: r.approved_at || "",
        approved_by: r.approved_by || "",
        rejected_at: r.rejected_at || "",
        rejected_by: r.rejected_by || ""
      }));
    }

    async function syncCatalogRequestsFromDB(catalogId){
      const rows = await loadCatalogRequestsFromDB(catalogId);
      if(!rows) return false;
      saveCatalogRequests(catalogId, rows);
      return true;
    }

    async function addCatalogRequestToDB(catalogId, row){
      if(!dbReady()) return null;

      const email = await getCurrentUserEmail();

      const payload = {
        catalog_id: catalogId,
        catalog_title: getCatalogDisplayTitle(catalogId),
        catalog_year: String(row.year || ""),
        catalog_round: String(row.round || ""),
        qty: Number(row.qty || 0),
        department: row.dept || "-",
        requester_name: row.person || "",
        requester_email: email || "",
        status: "pending",

      };

      const { data, error } = await supabaseClient
        .from(DB_CATALOG_REQUESTS)
        .insert(payload)
        .select("*")
        .single();

      if(error) throw error;
      return data;
    }

    async function deleteCatalogRequestsByKeys(catalogId, rows){
      if(!dbReady()) return;
      const ids = (rows || []).map(r => r?._dbid).filter(Boolean);
      if(!ids.length) return;

      const { error } = await supabaseClient
        .from(DB_CATALOG_REQUESTS)
        .delete()
        .eq("catalog_id", catalogId)
        .in("id", ids);

      if(error) throw error;
    }

    function saveCatalogApplySelection(catalogId, payload){
      try{
        sessionStorage.setItem(getCatalogApplyStorageKey(catalogId), JSON.stringify(payload || {}));
      }catch(err){
        console.error("catalog selection save 실패:", err);
      }
    }

    function getCatalogApplySelection(catalogId){
      try{
        const raw = sessionStorage.getItem(getCatalogApplyStorageKey(catalogId));
        return raw ? JSON.parse(raw) : {};
      }catch(err){
        console.error("catalog selection read 실패:", err);
        return {};
      }
    }

    function renderSmartLogo(path, alt=""){
      const candidates = getImageCandidates(path);
      if(!candidates.length){
        return `<div class="mainLogoPlaceholder"></div>`;
      }

      return `
        <img
          class="mainLogoImg"
          src="${escapeAttr(candidates[0])}"
          alt=""
          draggable="false"
          loading="eager"
          decoding="async"
          data-candidates='${escapeAttr(JSON.stringify(candidates))}'
          data-idx="0"
          data-fallback='<div class="mainLogoPlaceholder"></div>'
          onload="window.handleImgLoad(this)"
          onerror="window.handleImgError(this)"
        />
      `;
    }

    function statusClass(s){ return s === "입고" ? "in" : "out"; }

    function toISODateLike(d){
      if(!d) return "";
      const raw = String(d).trim();
      if(/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

      const isoPrefix = raw.match(/^(\d{4}-\d{2}-\d{2})[T\s]/);
      if(isoPrefix) return isoPrefix[1];

      const m = raw.match(/^(\d{1,2})\/(\d{1,2})$/);
      if(m){
        const y = new Date().getFullYear();
        const mm = String(m[1]).padStart(2,"0");
        const dd = String(m[2]).padStart(2,"0");
        return `${y}-${mm}-${dd}`;
      }

      const parsed = new Date(raw);
      if(!Number.isNaN(parsed.getTime())){
        const y = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2,"0");
        const dd = String(parsed.getDate()).padStart(2,"0");
        return `${y}-${mm}-${dd}`;
      }

      return raw;
    }

    function formatKRDate(d){
      const iso = toISODateLike(d);
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if(!m) return iso || "-";
      return `${Number(m[2])}/${Number(m[3])}`;
    }

    function normalizeLog(r){
      const out = { ...r };
      out.d = toISODateLike(out.d);

      if(!out.dept && out.to){
        const parts = String(out.to).split("-").map(s=>s.trim());
        out.dept = parts[0] || out.dept;
        out.person = (parts[1] || "").replace(/^\(|\)$/g,"") || out.person;
      }
      out.t = out.t === "입고" ? "입고" : (out.t === "출고" ? "출고" : "신청");
      out.dept = out.dept || "-";
      out.person = out.person || "";
      out.qty = Number(out.qty || 0);
      if(!out.__key) out.__key = `k_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      return out;
    }

    function ensureLogs(it){
      it.logs = (it.logs || []).map(normalizeLog);
    }

    function ensureRequests(it){
      it.requests = (it.requests || []).map(r => normalizeLog({ ...r, t: "신청" }));
    }

    function countPendingRequests(it){
      ensureRequests(it);
      return (it.requests || []).filter(r => (r.status || "pending") === "pending").length;
    }

    function requestStatusLabel(status){
      if(status === "approved") return "승인";
      if(status === "rejected") return "반려";
      return "신청";
    }

    function requestStatusClass(status){
      if(status === "approved") return "approved";
      if(status === "rejected") return "rejected";
      return "pending";
    }

    async function getCurrentUserEmail(){
      if(!supabaseClient) return null;
      try{
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if(error) throw error;
        return user?.email || null;
      }catch(err){
        console.error("현재 사용자 이메일 조회 실패:", err);
        return null;
      }
    }

    function sortByLatestDateAndKey(rows){
      return [...(rows || [])].sort((a, b) => {
        const ad = String(toISODateLike(a?.d) || "");
        const bd = String(toISODateLike(b?.d) || "");
        if (bd !== ad) return bd.localeCompare(ad);
        const ak = String(a?.__key || "");
        const bk = String(b?.__key || "");
        return bk.localeCompare(ak);
      });
    }

    async function maybePromptOneSignalPermission(){
      try{
        if(!window.OneSignalDeferred) return;
        window.OneSignalDeferred.push(async function(OneSignal){
          const supported = OneSignal?.Notifications && typeof OneSignal.Notifications.requestPermission === "function";
          if(!supported) return;
          let permission = "default";
          try{
            permission = await OneSignal.Notifications.permission;
          }catch(_){}
          if(permission === "default"){
            await OneSignal.Notifications.requestPermission();
          }
        });
      }catch(err){
        console.warn("OneSignal 권한 요청 스킵:", err);
      }
    }

    function signedQty(row){
  const qty = Number(row.qty || 0);
  if (!qty) return 0;
  return row.t === "입고" ? qty : -qty;
}

function calcStock(it){
  return Number(it?.baseStock || 0);
}

    function getLastLogInfo(it){
      ensureLogs(it);
      if(!it.logs || it.logs.length === 0) return { status:"-", date:"-", delta:0 };
      const sorted = [...it.logs].sort((a,b) => (toISODateLike(b.d)||"").localeCompare(toISODateLike(a.d)||""));
      const r = sorted[0];
      return { status: r.t || "-", date: formatKRDate(r.d), delta: signedQty(r) };
    }

    function findItemById(id){
      for(const section of data){
        for(const it of section.items){
          if(it.id === id) return { section, it };
        }
      }
      return null;
    }

    function flattenItems(){
      const arr = [];
      for(const sec of data) for(const it of sec.items) arr.push(it);
      return arr;
    }

    function applyCustomItemOrder(){
      const holderOrderIds = ["holder-gray", "office-holder-sky", "holder-navy", "holder-purple"];
      const holderOrderNames = ["보증서홀더(회색)", "사무용홀더", "수입지홀더(남색)", "수입지홀더(보라색)"];
      const holderSection = data.find(sec => sec.category === "홀더");
      if(!holderSection || !Array.isArray(holderSection.items)) return;

      holderSection.items.sort((a, b) => {
        const ai = holderOrderIds.indexOf(String(a?.id || ""));
        const bi = holderOrderIds.indexOf(String(b?.id || ""));
        const an = holderOrderNames.indexOf(String(a?.name || ""));
        const bn = holderOrderNames.indexOf(String(b?.name || ""));

        const av = ai >= 0 ? ai : (an >= 0 ? an : 999);
        const bv = bi >= 0 ? bi : (bn >= 0 ? bn : 999);

        if(av !== bv) return av - bv;
        return String(a?.name || "").localeCompare(String(b?.name || ""), "ko");
      });
    }


    function ensureCategory(cat){
      const name = String(cat || "").trim();
      if(!name) return null;
      let sec = data.find(s => s.category === name);
      if(!sec){
        sec = { category: name, items: [] };
        data.push(sec);
      }
      return sec;
    }

    function slugifyId(s){
      return String(s || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-가-힣]/g, "")
        .replace(/\-+/g, "-")
        .slice(0, 50) || `item-${Date.now()}`;
    }

    function removeItemLocal(itemId){
      for(const sec of data){
        const before = (sec.items||[]).length;
        sec.items = (sec.items||[]).filter(it => it.id !== itemId);
        if(sec.items.length !== before) break;
      }
      saveAllLocal();
    }

    const DB_ITEMS = "warehouse_items";
    const DB_LOGS  = "warehouse_logs";
    const DB_REQUESTS = "warehouse_requests";
    const DB_CATALOG_REQUESTS = "catalog_requests";
    const DB_CATALOG_STOCKS = "catalog_stocks";


    function buildDefaultItemPayloads(){
      const rows = [];

      for(const sec of data){
        for(const it of (sec.items || [])){
          if(!it || !it.id) continue;

          const images = Array.isArray(it.images)
            ? it.images.filter(Boolean)
            : [it.img].filter(Boolean);

          rows.push({
            id: it.id,
            base_stock: Number(it.baseStock || 0),
            category: sec.category || it.category || null,
            name: it.name || it.id,
            size: it.size || null,
            img: it.img || (images[0] || null),
            images
          });
        }
      }

      return rows;
    }

    async function syncDefaultItemsToDB(){
      if(!dbReady()) return false;

      const defaultRows = buildDefaultItemPayloads();
      if(!defaultRows.length) return true;

      let existingRows = [];
      try{
        const { data: rows, error } = await supabaseClient
          .from(DB_ITEMS)
          .select("id, base_stock, category, name, size, img, images");

        if(error) throw error;
        existingRows = rows || [];
      }catch(err){
        console.warn("기본 품목 DB 확인 실패:", err);
        return false;
      }

      const existingById = new Map(existingRows.map(row => [String(row.id), row]));
      const missingRows = defaultRows.filter(row => !existingById.has(String(row.id)));

      if(missingRows.length){
        const { error } = await supabaseClient
          .from(DB_ITEMS)
          .insert(missingRows);

        if(error){
          console.warn("누락 기본 품목 자동 생성 실패:", error);
          return false;
        }
      }

      for(const row of defaultRows){
        const existing = existingById.get(String(row.id));
        if(!existing) continue;

        const patch = {};
        if(!existing.category && row.category) patch.category = row.category;
        if(!existing.name && row.name) patch.name = row.name;
        if(!existing.size && row.size) patch.size = row.size;
        if(!existing.img && row.img) patch.img = row.img;
        if((!Array.isArray(existing.images) || existing.images.filter(Boolean).length === 0) && row.images && row.images.length){
          patch.images = row.images;
        }

        if(Object.keys(patch).length){
          const { error } = await supabaseClient
            .from(DB_ITEMS)
            .update(patch)
            .eq("id", row.id);

          if(error){
            console.warn('기본 품목 메타데이터 보정 실패(' + row.id + '):', error);
          }
        }
      }

      return true;
    }

    async function loadAllFromDB_FORCE(){
      if(!dbReady()) throw new Error("supabaseClient not ready");

      const { data: itemRows, error: e1 } = await supabaseClient
        .from(DB_ITEMS)
        .select("id, base_stock, category, name, size, img, images");
      if(e1) throw e1;

      const { data: logRows, error: e2 } = await supabaseClient
        .from(DB_LOGS)
        .select("item_id, d, t, dept, person, qty, __key");
      if(e2) throw e2;

      let requestRows = [];
      try{
        const { data, error } = await supabaseClient
          .from(DB_REQUESTS)
          .select("id, item_id, department, requester_name, requester_email, qty, status, created_at, item_name, item_size, approved_at, approved_by, processed_log_key");
        if(error) throw error;
        requestRows = data || [];
      }catch(err){
        console.warn("warehouse_requests 테이블 로드 실패:", err);
      }

      const dbItemIds = new Set((itemRows || []).map(r => r.id));
      const logsByItem = new Map();
      const requestsByItem = new Map();

      for(const sec of data){
        sec.items = (sec.items || []).filter(it => {
          if(INITIAL_ITEM_IDS.has(it.id)) return true;
          return dbItemIds.has(it.id);
        });
      }

      for(const row of (itemRows || [])){
        let found = findItemById(row.id);
        if(!found){
          const sec = ensureCategory(row.category || "기타");
          const item = {
            id: row.id,
            category: row.category || "기타",
            name: row.name || row.id,
            size: row.size || "",
            baseStock: Number(row.base_stock || 0),
            img: row.img || null,
            images: Array.isArray(row.images)
  ? row.images.filter(Boolean)
  : [row.img].filter(Boolean),
            logs: [],
            requests: []
          };
          sec.items.push(item);
          found = { section: sec, it: item };
        }

        const item = found.it;
        const section = found.section;
        item.category = row.category || section.category || item.category || "기타";
        item.name = row.name || item.name || row.id;
        item.size = row.size || item.size || "";
        item.baseStock = Number(row.base_stock || 0);
        item.img = row.img || item.img || null;
        item.images = Array.isArray(row.images)
  ? row.images.filter(Boolean)
  : (item.images || [item.img]).filter(Boolean);

if(item.img && (!item.images || !item.images[0])){
  item.images = [item.img].filter(Boolean);
}
      }

      for(const r of (logRows || [])){
        if(!logsByItem.has(r.item_id)) logsByItem.set(r.item_id, []);
        logsByItem.get(r.item_id).push(normalizeLog({
          d: r.d,
          t: r.t,
          dept: r.dept,
          person: r.person,
          qty: r.qty,
          __key: r.__key
        }));
      }

      for(const r of (requestRows || [])){
        if(!requestsByItem.has(r.item_id)) requestsByItem.set(r.item_id, []);
        requestsByItem.get(r.item_id).push(normalizeLog({
          d: r.created_at,
          t: "신청",
          dept: r.department,
          person: r.requester_name,
          qty: r.qty,
          __key: `req_${r.id}`,
          _dbid: r.id,
          status: r.status || "pending",
          email: r.requester_email || "",
          approved_at: r.approved_at || "",
          approved_by: r.approved_by || "",
          processed_log_key: r.processed_log_key || ""
        }));
      }

      for(const it of flattenItems()){
        const dbLogs = logsByItem.get(it.id);
        const dbRequests = requestsByItem.get(it.id);
        it.logs = dbLogs || [];
        it.requests = dbRequests || [];
      }

      saveAllLocal();
      DB.mode = "synced";
      DB.lastError = "";
      return true;
    }

    async function uploadItemImage(file, itemId){
      if(!supabaseClient) throw new Error("supabaseClient not ready");
      if(!file) return null;

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `items/${itemId}-${Date.now()}.${safeExt}`;

      const { error: uploadError } = await supabaseClient
        .storage
        .from("warehouse-item-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if(uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient
        .storage
        .from("warehouse-item-images")
        .getPublicUrl(filePath);

      return publicUrlData?.publicUrl || null;
    }

    async function saveItemToDB(item, categoryName){
      if(!dbReady()) return;
      const payload = {
        id: item.id,
        base_stock: Number(item.baseStock || 0),
        category: categoryName || item.category || null,
        name: item.name || null,
        size: item.size || null,
        img: item.img || null,
        images: Array.isArray(item.images) ? item.images : [item.img || null, null]
      };
      const { error } = await supabaseClient.from(DB_ITEMS).upsert(payload, { onConflict: "id" });
      if(error) throw error;
    }

    async function addLogToDB(itemId, row){
      if(!dbReady()) return;
      const r = normalizeLog(row);
      const payload = {
        item_id: itemId,
        d: toISODateLike(r.d),
        t: r.t,
        dept: r.dept || "-",
        person: r.person || "",
        qty: Number(r.qty||0),
        __key: r.__key
      };
      const { error } = await supabaseClient.from(DB_LOGS).insert(payload);
      if(error) throw error;
    }

    async function addRequestToDB(item, row){
      if(!dbReady()) return null;
      const r = normalizeLog({ ...row, t: "신청" });
      const payload = {
        item_id: item.id,
        item_name: item.name || item.id,
        item_size: item.size || null,
        qty: Number(r.qty||0),
        department: r.dept || "-",
        requester_name: r.person || "",
        requester_email: (await getCurrentUserEmail()) || "",
        request_note: null,
        status: "pending",
        approved_at: null,
        approved_by: null,
        processed_log_key: null
      };
      const { data: inserted, error } = await supabaseClient
        .from(DB_REQUESTS)
        .insert(payload)
        .select("id, created_at")
        .single();
      if(error) throw error;
      return inserted || null;
    }

    async function deleteRequestsByKeys(itemId, rows){
      if(!dbReady()) return;
      const ids = (rows || []).map(r => r?._dbid).filter(Boolean);
      if(!ids.length) return;
      const { error } = await supabaseClient
        .from(DB_REQUESTS)
        .delete()
        .eq("item_id", itemId)
        .in("id", ids);
      if(error) throw error;
    }

    async function updateRequestStatusByIds(ids, status, meta = {}){
      if(!dbReady()) return;
      const cleanIds = (ids || []).filter(Boolean);
      if(!cleanIds.length) return;
      const payload = {
        status,
        approved_at: meta.approved_at || null,
        approved_by: meta.approved_by || null
      };
      if(Object.prototype.hasOwnProperty.call(meta, "processed_log_key")){
        payload.processed_log_key = meta.processed_log_key || null;
      }
      const { error } = await supabaseClient
        .from(DB_REQUESTS)
        .update(payload)
        .in("id", cleanIds);
      if(error) throw error;
    }

    async function approveRequestByRpc(requestId, approvedBy){
      if(!dbReady()) throw new Error("supabaseClient not ready");
      const numericId = Number(requestId);
      if(!Number.isFinite(numericId)) throw new Error("요청 ID가 올바르지 않습니다.");
      const { data, error } = await supabaseClient.rpc("approve_warehouse_request", {
        p_request_id: numericId,
        p_approved_by: approvedBy || ""
      });
      if(error) throw error;
      return Array.isArray(data) ? (data[0] || null) : (data || null);
    }

    async function rejectRequestByRpc(requestId, approvedBy){
      if(!dbReady()) throw new Error("supabaseClient not ready");
      const numericId = Number(requestId);
      if(!Number.isFinite(numericId)) throw new Error("요청 ID가 올바르지 않습니다.");
      const { data, error } = await supabaseClient.rpc("reject_warehouse_request", {
        p_request_id: numericId,
        p_approved_by: approvedBy || ""
      });
      if(error) throw error;
      return Array.isArray(data) ? (data[0] || null) : (data || null);
    }

    async function decreaseStock(itemId, amount){
      if(!dbReady()) return null;

      const { data, error: readErr } = await supabaseClient
        .from(DB_ITEMS)
        .select("base_stock")
        .eq("id", itemId)
        .single();

      if(readErr) throw readErr;

      const current = Number(data?.base_stock || 0);
      const next = current - Number(amount || 0);

      if(next < 0){
        throw new Error("재고가 부족합니다.");
      }

      const { error: updateErr } = await supabaseClient
        .from(DB_ITEMS)
        .update({ base_stock: next })
        .eq("id", itemId);

      if(updateErr) throw updateErr;
      return next;
    }

    async function updateItemBaseStock(itemId, next){
      const numericNext = Number(next);
      if(!Number.isFinite(numericNext) || numericNext < 0){
        throw new Error("기존재고는 0 이상의 숫자만 입력할 수 있습니다.");
      }

      const found = findItemById(itemId);
      if(found?.it){
        found.it.baseStock = numericNext;
        saveAllLocal();
      }

      if(!dbReady()) return numericNext;

      const { error } = await supabaseClient
        .from(DB_ITEMS)
        .update({ base_stock: numericNext })
        .eq("id", itemId);

      if(error) throw error;
      return numericNext;
    }

    async function insertLogsBulk(rows){
      if(!dbReady() || !rows?.length) return;
      const payload = rows.map(({ item_id, row }) => {
        const r = normalizeLog(row);
        return {
          item_id,
          d: toISODateLike(r.d),
          t: r.t,
          dept: r.dept || "-",
          person: r.person || "",
          qty: Number(r.qty || 0),
          __key: r.__key
        };
      });
      const { error } = await supabaseClient.from(DB_LOGS).insert(payload);
      if(error) throw error;
    }

    async function deleteLogsByKeys(itemId, keys){
      if(!dbReady()) return;
      const { error } = await supabaseClient
        .from(DB_LOGS)
        .delete()
        .eq("item_id", itemId)
        .in("__key", keys);
      if(error) throw error;
    }

    async function deleteItemFromDB(itemId){
      if(!dbReady()) return;

      const { error: e1 } = await supabaseClient
        .from(DB_LOGS)
        .delete()
        .eq("item_id", itemId);
      if(e1) throw e1;

      const { error: e2 } = await supabaseClient
        .from(DB_REQUESTS)
        .delete()
        .eq("item_id", itemId);
      if(e2) throw e2;

      const { error: e3 } = await supabaseClient
        .from(DB_ITEMS)
        .delete()
        .eq("id", itemId);
      if(e3) throw e3;
    }

    let realtimeChannel = null;
    let reloadTimer = null;

    function scheduleDBReload(){
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(async ()=>{
        try{
          await loadAllFromDB_FORCE();
          router();
        }catch(e){
          console.error("Realtime DB reload 실패:", e);
          DB.mode = "error";
          DB.lastError = String(e?.message || e);
          router();
        }
      }, 250);
    }

    function startRealtime(){
      if(!dbReady()) return;
      if(realtimeChannel) return;

      try{
        realtimeChannel = supabaseClient
          .channel("warehouse_sync")
          .on("postgres_changes", { event:"*", schema:"public", table: DB_ITEMS }, () => scheduleDBReload())
          .on("postgres_changes", { event:"*", schema:"public", table: DB_LOGS  }, () => scheduleDBReload())
          .on("postgres_changes", { event:"*", schema:"public", table: DB_REQUESTS }, () => scheduleDBReload())
          .on("postgres_changes", { event:"*", schema:"public", table: DB_CATALOG_REQUESTS }, () => scheduleDBReload())
          .on("postgres_changes", { event:"*", schema:"public", table: DB_CATALOG_STOCKS }, () => scheduleDBReload())
          .subscribe(()=>{});
      }catch(e){
        console.error("Realtime 시작 실패:", e);
      }
    }

    function setTopTitleByMode(mode){
      setTopbarTitleLogo();
    }

    function setBodyMode(mode){
      document.body.classList.remove("mode-request", "mode-list", "mode-admin", "mode-shop", "auth-page");
      document.documentElement.classList.remove("auth-page");
      if(mode === "request"){
        document.body.classList.add("mode-request");
      }else if(mode === "list"){
        document.body.classList.add("mode-list");
      }else if(mode === "admin"){
        document.body.classList.add("mode-admin");
      }
    }

    function renderAuthShell(innerHtml){
      topbar.style.display = "none";
      setTopbarRightLogo();
      if(topbarLogo) topbarLogo.classList.remove("show");
      document.body.classList.remove("mode-request", "mode-list", "mode-admin");
      document.body.classList.add("auth-page");
      document.documentElement.classList.add("auth-page");

      const hideHeader = ["#/signup","#/reset-password"].includes(location.hash);

      app.innerHTML = `
        <div class="loginScreen">
          <div class="loginWrap">
            ${hideHeader ? "" : `
            <div class="loginLogoWrap">
              <div class="loginLogoBox">
                <img class="loginLogoImage" src="images/sa-logo_4.png" alt="Seoul Auction 로고" />
              </div>
            </div>
            <div class="authHeaderLine"></div>
            <div class="authHeaderTitle">서울옥션 디자인팀 창고 재고 관리</div>
            `}
            ${innerHtml}
          </div>
        </div>
      `;
    }

    function setAuthError(message){
      const errorBox = document.getElementById("homeLoginError");
      if(!errorBox) return;
      if(message){
        errorBox.textContent = message;
        errorBox.classList.add("show");
      }else{
        errorBox.textContent = "";
        errorBox.classList.remove("show");
      }
    }

    function getAuthInputValue(id){
      return (document.getElementById(id)?.value || "").trim();
    }

    function attachAuthEnter(ids, handler){
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if(!el) return;
        el.addEventListener("keydown", (e)=>{
          if(e.key === "Enter"){
            handler();
          }
        });
      });
    }

    function renderLoginPage(){
      renderAuthShell(`
        <div class="loginForm">
          <input id="homeLoginId" class="loginInput" type="email" placeholder="이메일을 입력해 주세요." autocomplete="username" />
          <input id="homeLoginPw" class="loginInput" type="password" placeholder="비밀번호를 입력해 주세요." autocomplete="current-password" />

          <div class="loginSubLinks">
            <a href="#/signup">회원가입</a>
            <span>|</span>
            <a href="#/reset-password">비밀번호 찾기</a>
          </div>

          <button class="loginBtn" id="homeLoginBtn" type="button">로그인하기</button>
          <div class="loginErrorText" id="homeLoginError"></div>
        </div>
      `);

      async function submitHomeLogin(){
        const email = getAuthInputValue("homeLoginId").toLowerCase();
        const password = getAuthInputValue("homeLoginPw");

        if(!email || !password){
          setAuthError("아이디과 비밀번호를 입력해주세요.");
          return;
        }

        if(!supabaseClient){
          setAuthError("로그인 연결이 준비되지 않았습니다.");
          return;
        }

        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
        setAuthError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
}

        setHomeLoggedIn(true);
        setAuthError("");
        location.hash = "#/";
      }

      document.getElementById("homeLoginBtn")?.addEventListener("click", submitHomeLogin);
      attachAuthEnter(["homeLoginId", "homeLoginPw"], submitHomeLogin);
    }

    function renderSignupPage(){
      renderAuthShell(`
        <div class="loginForm signupForm">
          <h2 class="authPageTitle">회원가입</h2>
          <p class="authPageDesc">서울옥션 이메일 계정으로 이용해 주세요.</p>

          <input id="signupEmail" class="loginInput" type="email" placeholder="이메일을 입력해 주세요." autocomplete="email" />
          <input id="signupPassword" class="loginInput" type="password" placeholder="비밀번호를 입력해 주세요." autocomplete="new-password" />
          <input id="signupPasswordConfirm" class="loginInput" type="password" placeholder="비밀번호를 다시 입력해 주세요." autocomplete="new-password" />

          <button class="loginBtn" id="signupSubmitBtn" type="button">회원가입 완료</button>
          <button class="authSecondaryBtn" id="signupBackBtn" type="button">로그인으로 이동</button>
          <div class="loginErrorText" id="homeLoginError"></div>
        </div>
      `);

      async function submitSignup(){
        const email = getAuthInputValue("signupEmail").toLowerCase();
        const password = getAuthInputValue("signupPassword");
        const confirmPassword = getAuthInputValue("signupPasswordConfirm");

        if(!email || !password || !confirmPassword){
          setAuthError("모든 항목을 입력해주세요.");
          return;
        }

        if(password !== confirmPassword){
          setAuthError("비밀번호가 일치하지 않습니다.");
          return;
        }

        if(password.length < 6){
          setAuthError("비밀번호는 6자 이상 입력해주세요.");
          return;
        }

        if(!supabaseClient){
          setAuthError("회원가입 연결이 준비되지 않았습니다.");
          return;
        }

        const { error } = await supabaseClient.auth.signUp({
          email,
          password
        });

        if(error){
          setAuthError(error.message || "회원가입에 실패했습니다.");
          return;
        }

        setAuthError("회원가입이 완료되었습니다.\n로그인 화면에서 로그인해주세요.");
      }

      document.getElementById("signupSubmitBtn")?.addEventListener("click", submitSignup);
      document.getElementById("signupBackBtn")?.addEventListener("click", ()=>{ location.hash = "#/login"; });
      attachAuthEnter(["signupEmail", "signupPassword", "signupPasswordConfirm"], submitSignup);
    }

    

    function renderResetPasswordPage(){
  renderAuthShell(`
    <div class="loginForm resetPwForm">
      <h2 class="authPageTitle">비밀번호 재설정하기</h2>
      <p class="authPageDesc">아이디와 새 비밀번호를 입력해주세요.</p>

      <input id="resetEmail" class="loginInput" type="email" placeholder="아이디(이메일)" autocomplete="username" />
      <input id="newPassword" class="loginInput" type="password" placeholder="비밀번호" autocomplete="new-password" />
      <input id="newPasswordConfirm" class="loginInput" type="password" placeholder="비밀번호 재확인" autocomplete="new-password" />

      <button class="loginBtn" id="resetPasswordBtn" type="button">재설정하기</button>
      <button class="authSecondaryBtn" id="resetPasswordBackBtn" type="button">로그인으로 이동</button>
      <div class="loginErrorText" id="homeLoginError"></div>
    </div>
  `);

  async function submitResetPassword(){
    const email = getAuthInputValue("resetEmail").toLowerCase();
    const newPassword = getAuthInputValue("newPassword");
    const newPasswordConfirm = getAuthInputValue("newPasswordConfirm");

    if(!email || !newPassword || !newPasswordConfirm){
      setAuthError("모든 항목을 입력해주세요.");
      return;
    }

    if(newPassword !== newPasswordConfirm){
      setAuthError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if(newPassword.length < 6){
      setAuthError("비밀번호는 6자 이상 입력해주세요.");
      return;
    }

    const resetBtn = document.getElementById("resetPasswordBtn");
    if(resetBtn) resetBtn.disabled = true;
    setAuthError("처리 중입니다.");

    try{
      const res = await fetch(
        "https://mpyxzzbmpweakzjemngm.supabase.co/functions/v1/admin-reset-password",
        {
          method: "POST",
          mode: "cors",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "x-reset-secret": "sa-reset-2026-abc123"
          },
          body: JSON.stringify({
            email,
            new_password: newPassword
          })
        }
      );

      const text = await res.text();
      let result = {};
      try{
        result = text ? JSON.parse(text) : {};
      }catch(parseErr){
        console.error("[reset] JSON 파싱 실패:", parseErr, text);
      }

      if(!res.ok || !result?.success){
        setAuthError(result?.message || `비밀번호 재설정에 실패했습니다. (${res.status})`);
        return;
      }

      setAuthError("비밀번호가 재설정되었습니다.");
      setTimeout(() => {
        location.hash = "#/login";
      }, 1000);
    }catch(err){
      console.error("[reset] 예외 발생:", err);
      setAuthError("서버 연결에 실패했습니다. Edge Function CORS/배포/Secrets 설정을 확인해주세요.");
    }finally{
      if(resetBtn) resetBtn.disabled = false;
    }
  }

  document.getElementById("resetPasswordBtn")?.addEventListener("click", submitResetPassword);
  document.getElementById("resetPasswordBackBtn")?.addEventListener("click", ()=>{
    location.hash = "#/login";
  });

  attachAuthEnter(["resetEmail", "newPassword", "newPasswordConfirm"], submitResetPassword);
}

    async function renderMainHome(){
      topbar.style.display = "none";
      setTopbarRightLogo();
      if(topbarLogo) topbarLogo.classList.remove("show");
      document.body.classList.remove("mode-request", "mode-list", "mode-admin", "auth-page");
      document.documentElement.classList.remove("auth-page");

      const isAdmin = await isAdminUser();

      app.innerHTML = `
        <div class="mainHome">
          <div class="mainLogoArea" id="mainHomeLogoBtn">
            ${renderSmartLogo("sa-logo_4.png", "Seoul Auction 로고")}
          </div>

          <div class="mainHomeLine"></div>
          <div class="mainHomeTitle">서울옥션 디자인팀 창고재고관리</div>

          <div class="mainHomeBtns oneRole">
            ${
              isAdmin
                ? `<button class="mainHomeBtn adminMintBtn" id="goAdminPage" type="button">관리자 페이지</button>`
                : `<button class="mainHomeBtn requestDarkBtn" id="goRequestPage" type="button"> 신청하기</button>`
            }
            <button class="mainHomeBtn stockBtn" id="goStockPage" type="button">물품 재고현황</button>
            <button class="mainHomeBtn shopHomeBtn" id="goShopPage" type="button">제품 구매하기</button>
            <button class="mainHomeBtn logoutBtn" id="logoutBtn" type="button">로그아웃</button>
          </div>
        </div>
      `;

      if(isAdmin){
        document.getElementById("goAdminPage")?.addEventListener("click", ()=>{
          location.hash = "#/admin";
        });
      }else{
        document.getElementById("goRequestPage")?.addEventListener("click", ()=>{
          location.hash = "#/request";
        });
      }

      document.getElementById("goStockPage")?.addEventListener("click", ()=>{
        location.hash = "#/list";
      });

      document.getElementById("goShopPage")?.addEventListener("click", ()=>{
        location.hash = "#/shop";
      });

      document.getElementById("logoutBtn")?.addEventListener("click", logoutHome);

      document.getElementById("mainHomeLogoBtn")?.addEventListener("click", ()=>{
        if(q) q.value = "";
        location.hash = "#/";
        window.location.reload();
      });
    }


    function getShopItems(){
      const section = data.find(sec => sec.category === "기타");
      return section ? (section.items || []) : [];
    }

    function getShopItemById(id){
      return getShopItems().find(it => String(it.id) === String(id)) || null;
    }

    const SHOP_CART_KEY = "sa_shop_cart_v1";

    function getShopCart(){
      try{
        const parsed = JSON.parse(localStorage.getItem(SHOP_CART_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      }catch(e){
        return [];
      }
    }

    function saveShopCart(cart){
      localStorage.setItem(SHOP_CART_KEY, JSON.stringify(cart || []));
    }

    function parsePrice(v){
      return Number(String(v || "0").replace(/[^0-9]/g, "")) || 0;
    }

    function formatPrice(v){
      return `${Number(v || 0).toLocaleString()}`;
    }

    function getShopColorLabel(it){
      const n = String(it?.name || "");
      if(n.includes("(B)") || n.includes("Black") || n.includes("블랙")) return "Black";
      if(n.includes("(W)") || n.includes("White") || n.includes("화이트")) return "White";
      if(n.includes("가방")) return "Black";
      return "-";
    }

    function addShopCart(itemId, qty=1){
      const item = getShopItemById(itemId);
      if(!item) return;
      const cart = getShopCart();
      const found = cart.find(row => row.id === itemId);
      if(found){
        found.qty = Number(found.qty || 0) + qty;
      }else{
        cart.push({ id:itemId, qty });
      }
      saveShopCart(cart);
    }



    const SHOP_ORDER_KEY = "sa_shop_order_history_v1";

    function getShopOrderHistory(){
      try{
        const parsed = JSON.parse(localStorage.getItem(SHOP_ORDER_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      }catch(e){
        return [];
      }
    }

    function saveShopOrderHistory(rows){
      localStorage.setItem(SHOP_ORDER_KEY, JSON.stringify(rows || []));
    }

    function getShopDisplayName(it){
      return String(it?.name || "").replace('(B)','').replace('(W)','');
    }

    function makeShopOrderNo(){
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      const key = `${y}${m}${day}`;
      const count = getShopOrderHistory().filter(o => String(o.orderNo || '').includes(key)).length + 1;
      return `${key.slice(0,4)}-${m}-${day} (${key}-${String(count).padStart(5,'0')})`;
    }

    async function submitShopOrder(rows){
      if(!rows || !rows.length) return null;
      const orderNo = makeShopOrderNo();
      const createdAt = new Date().toISOString();
      const requesterEmail = await getCurrentUserEmail();
      const localRows = [];

      for(const row of rows){
        const it = row.item || getShopItemById(row.id);
        if(!it) continue;
        const qty = Number(row.qty || 1);
        const reqRow = normalizeLog({
          d: createdAt,
          t: "신청",
          dept: "SHOP",
          person: requesterEmail || "제품 구매",
          qty,
          status: "pending"
        });
        try{
          const inserted = await addRequestToDB(it, reqRow);
          if(inserted?.id){
            reqRow._dbid = inserted.id;
            reqRow.__key = `req_${inserted.id}`;
            reqRow.d = inserted.created_at || createdAt;
          }
        }catch(err){
          console.error("SHOP 구매 신청 DB 저장 실패:", err);
          throw err;
        }
        it.requests = it.requests || [];
        it.requests.push(reqRow);
        localRows.push({
          orderNo,
          createdAt,
          id: it.id,
          name: it.name,
          color: getShopColorLabel(it),
          img: it.img,
          price: parsePrice(it.price),
          qty,
          status: "pending",
          requestDbId: reqRow._dbid || null
        });
      }

      const history = getShopOrderHistory();
      history.unshift({ orderNo, createdAt, rows: localRows });
      saveShopOrderHistory(history);
      saveAllLocal();
      return orderNo;
    }

    function getShopRequestRows(){
      return getShopItems().flatMap(it => (it.requests || []).map(r => ({ ...r, item: it })));
    }

    function getShopRequestBadgeText(row){
      const status = row.status || "pending";
      if(status === "approved") return "승인 완료";
      if(status === "rejected") return "반려";
      return "승인 필요";
    }

    function getShopRequestCountText(item){
      const count = (item.requests || []).filter(r => (r.status || "pending") === "pending").length;
      return count > 0 ? `신청 ${count}건` : "신청 0건";
    }

    function renderShopSection(section){
      return `
        <section class="shopSection">
          <div class="shopInner">
            <div class="shopHead">
              <h2 class="shopTitle">SHOP</h2>
              <button class="shopLink" type="button" data-go-shop>제품 구매하기 <span>▶</span></button>
            </div>
            <div class="shopGrid">
            ${(section.items || []).map(it => `
              <button class="shopCard" type="button" data-shop-open="${escapeAttr(it.id)}" data-name="${escapeAttr(it.name || '')}">
                <div class="shopThumb">
                  ${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}
                </div>
                <div class="shopMeta">
                  <div class="shopName">${escapeHtml(it.name || "")}</div>
                  <div class="shopPrice">${escapeHtml(it.price || "")}</div>
                </div>
              </button>
            `).join("")}
            </div>
          </div>
        </section>
      `;
    }

    function prepareShopPage(title="제품 구매하기"){
      topbar.style.display = "flex";
      searchBox.style.display = "flex";
      setTopbarRightLogo();
      if(topbarLogo) topbarLogo.classList.remove("show");
      topbar.classList.remove("no-search");
      setBodyMode("request");
      document.body.classList.add("mode-shop");
      setTopbarTitleLogo();
    }

    function renderShopPageHeader(title="제품 | Product", active="list"){
      const cartCount = getShopCart().reduce((sum, row)=>sum + Number(row.qty || 0), 0);
      return `
        <div class="shopPageHead">
          <div class="shopPageTitle"><strong>제품</strong><span>|</span><em>Product</em></div>
          <div class="shopPageIcons">
            <button class="shopIconBtn ${active === 'account' ? 'active' : ''}" type="button" data-shop-account title="마이페이지" aria-label="마이페이지">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12.2c2.25 0 4.05-1.86 4.05-4.15C16.05 5.78 14.25 4 12 4S7.95 5.78 7.95 8.05c0 2.29 1.8 4.15 4.05 4.15Z"/><path d="M5.8 21c.62-3.72 2.98-5.8 6.2-5.8s5.58 2.08 6.2 5.8"/></svg>
            </button>
            <button class="shopIconBtn ${active === 'cart' ? 'active' : ''}" type="button" data-shop-cart title="장바구니" aria-label="장바구니">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8.5h9.6l.9 11H6.3l.9-11Z"/><path d="M9.2 8.5V7.1A2.8 2.8 0 0 1 12 4.3a2.8 2.8 0 0 1 2.8 2.8v1.4"/></svg>${cartCount ? `<span>${cartCount}</span>` : ``}
            </button>
          </div>
        </div>
      `;
    }

    function renderShopListPage(){
      prepareShopPage("제품 구매하기");
      const shopKeyword = String(q?.value || "").trim().toLowerCase();
      const items = getShopItems().filter(it => {
        if(!shopKeyword) return true;
        const target = `${it.name || ""} ${it.price || ""} ${getShopColorLabel(it) || ""}`.toLowerCase();
        return target.includes(shopKeyword);
      });
      app.innerHTML = `
        <div class="shopPage">
          ${renderShopPageHeader("제품 | Product", "list")}
          <div class="shopProductGrid">
            ${items.length ? items.map((it, idx) => `
              <button class="shopProductCard ${idx === 3 ? 'is-ready' : ''}" type="button" data-shop-open="${escapeAttr(it.id)}">
                <div class="shopProductThumb">
                  ${idx === 3 ? `<div class="shopReadyIcon">▢</div>` : (it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder())}
                </div>
                <div class="shopProductInfo">
                  <div class="shopProductName">${idx === 3 ? '상품 준비중' : escapeHtml(String(it.name || '').replace('(B)','').replace('(W)',''))}</div>
                  <div class="shopProductColor">${idx === 3 ? '-' : escapeHtml(getShopColorLabel(it))}</div>
                  <div class="shopProductPrice">${idx === 3 ? '-' : escapeHtml(formatPrice(parsePrice(it.price)))}</div>
                </div>
              </button>
            `).join("") : `<div class="shopEmptyResult">검색 결과가 없습니다.</div>`}
          </div>
        </div>
      `;
      bindShopCommonEvents();
    }

    function renderShopAccountPage(){
      prepareShopPage("마이페이지");
      app.innerHTML = `
        <div class="shopPage shopAccountPage">
          ${renderShopPageHeader("제품 | Product", "account")}
          <div class="shopAccountPanel">
            <div class="shopAccountIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 12.2c2.25 0 4.05-1.86 4.05-4.15C16.05 5.78 14.25 4 12 4S7.95 5.78 7.95 8.05c0 2.29 1.8 4.15 4.05 4.15Z"/><path d="M5.8 21c.62-3.72 2.98-5.8 6.2-5.8s5.58 2.08 6.2 5.8"/></svg>
            </div>
            <div class="shopAccountTitle">MY PAGE</div>
            <div class="shopAccountSub">제품 구매 내역과 장바구니를 확인할 수 있습니다.</div>
            <div class="shopAccountMenu">
              <button type="button" data-shop-orders>주문조회</button>
              <button type="button" data-shop-cart>장바구니</button>
              <button type="button" data-shop-home>제품 목록</button>
            </div>
          </div>
        </div>
      `;
      bindShopCommonEvents();
    }

    function renderShopDetailPage(itemId){
      const it = getShopItemById(itemId);
      prepareShopPage("제품 구매하기");
      if(!it){
        app.innerHTML = `<div class="paper"><div class="paper-body">제품을 찾을 수 없습니다.</div></div>`;
        return;
      }
      app.innerHTML = `
        <div class="shopPage shopDetailPage">
          ${renderShopPageHeader("제품 | Product", "detail")}
          <div class="shopDetailHero">
            <div class="shopDetailImg">${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}</div>
            <div class="shopDetailInfo">
              <div>
                <div class="shopDetailName">${escapeHtml(String(it.name || '').replace('(B)','').replace('(W)',''))}</div>
                <div class="shopDetailColor">${escapeHtml(getShopColorLabel(it))}</div>
              </div>
              <div class="shopDetailPrice">${escapeHtml(formatPrice(parsePrice(it.price)))}</div>
            </div>
            <select class="shopOptionSelect" id="shopColorOption">
              <option>${escapeHtml(getShopColorLabel(it))}</option>
            </select>
            <div class="shopDetailActions">
              <button class="shopBuyBtn" type="button" id="shopBuyNow">BUY NOW</button>
              <button class="shopCartBtn" type="button" id="shopAddCart">+ CART</button>
            </div>
            <div class="shopDetailsBlock">
              <div class="shopDetailsTitle">DETAILS</div>
              <div class="shopDetailsText">${escapeHtml(getShopColorLabel(it))}</div>
            </div>
          </div>
        </div>
      `;
      bindShopCommonEvents();
      document.getElementById("shopAddCart")?.addEventListener("click", ()=>{
        addShopCart(it.id, 1);
        alert("장바구니에 담았습니다.");
        renderShopDetailPage(it.id);
      });
      document.getElementById("shopBuyNow")?.addEventListener("click", ()=>{
        addShopCart(it.id, 1);
        location.hash = "#/shop/cart";
      });
    }

    function renderShopCartPage(){
      prepareShopPage("제품 구매하기");
      const cart = getShopCart();
      const rows = cart.map(row => ({ ...row, item:getShopItemById(row.id) })).filter(row => row.item);
      app.innerHTML = `
        <div class="shopPage shopCartPage">
          ${renderShopPageHeader("장바구니", "cart")}
          <h2 class="shopSubTitle">장바구니</h2>
          <div class="shopCartList">
            ${rows.length ? rows.map(row => {
              const it = row.item;
              const qty = Number(row.qty || 0);
              const lineTotal = parsePrice(it.price) * qty;
              return `
                <div class="shopCartRow" data-cart-id="${escapeAttr(it.id)}">
                  <button class="shopCartRemove" type="button" data-cart-remove="${escapeAttr(it.id)}">×</button>
                  <div class="shopCartThumb">${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}</div>
                  <div class="shopCartInfo">
                    <div class="shopCartName">${escapeHtml(getShopDisplayName(it))}</div>
                    <div class="shopCartColor">${escapeHtml(getShopColorLabel(it))}</div>
                    <div class="shopQtyControl">
                      <span>${qty}</span>
                      <button type="button" data-cart-plus="${escapeAttr(it.id)}">+</button>
                      <button type="button" data-cart-minus="${escapeAttr(it.id)}">-</button>
                    </div>
                    <div class="shopCartUnit">${escapeHtml(formatPrice(parsePrice(it.price)))}</div>
                  </div>
                  <div class="shopCartPrice">${escapeHtml(formatPrice(lineTotal))}</div>
                </div>
              `;
            }).join("") : `<div class="shopCartEmpty">장바구니가 비어 있습니다.</div>`}
          </div>
          ${rows.length ? `<button class="shopOrderBtn" type="button" id="shopOrderBtn">ORDER</button>` : ``}
        </div>
      `;
      bindShopCommonEvents();
      app.querySelectorAll("[data-cart-remove]").forEach(btn => btn.addEventListener("click", ()=>{
        saveShopCart(getShopCart().filter(row => row.id !== btn.dataset.cartRemove));
        renderShopCartPage();
      }));
      app.querySelectorAll("[data-cart-minus]").forEach(btn => btn.addEventListener("click", ()=>{
        const cart = getShopCart();
        const row = cart.find(r => r.id === btn.dataset.cartMinus);
        if(row) row.qty = Math.max(1, Number(row.qty || 1) - 1);
        saveShopCart(cart);
        renderShopCartPage();
      }));
      app.querySelectorAll("[data-cart-plus]").forEach(btn => btn.addEventListener("click", ()=>{
        const cart = getShopCart();
        const row = cart.find(r => r.id === btn.dataset.cartPlus);
        if(row) row.qty = Number(row.qty || 1) + 1;
        saveShopCart(cart);
        renderShopCartPage();
      }));
      document.getElementById("shopOrderBtn")?.addEventListener("click", async ()=>{
        try{
          await submitShopOrder(rows);
          saveShopCart([]);
          await loadAllFromDB_FORCE().catch(()=>{});
          location.hash = "#/shop/orders";
        }catch(err){
          alert("구매 신청 등록 실패: " + (err?.message || err));
        }
      });
    }

    function renderShopOrdersPage(){
      prepareShopPage("주문조회");
      const history = getShopOrderHistory();
      const total = history.reduce((sum, order)=> sum + (order.rows || []).reduce((s,r)=>s + Number(r.price || 0) * Number(r.qty || 0), 0), 0);
      app.innerHTML = `
        <div class="shopPage shopOrdersPage">
          ${renderShopPageHeader("주문조회", "account")}
          <h2 class="shopSubTitle">주문조회</h2>
          <div class="shopOrderHistoryList">
            ${history.length ? history.map(order => `
              <div class="shopOrderGroup">
                <div class="shopOrderNo">${escapeHtml(order.orderNo || "주문번호")}</div>
                ${(order.rows || []).map(row => {
                  const lineTotal = Number(row.price || 0) * Number(row.qty || 0);
                  return `
                    <div class="shopOrderRow">
                      <div class="shopOrderThumb">${row.img ? renderSmartImage(row.img, row.name) : iconPlaceholder()}</div>
                      <div class="shopOrderInfo">
                        <div class="shopOrderName">${escapeHtml(getShopDisplayName(row))}</div>
                        <div class="shopOrderColor">${escapeHtml(row.color || "-")}</div>
                        <div class="shopOrderLine"></div>
                        <div class="shopOrderMeta"><span>${Number(row.qty || 0)}개</span><em>${escapeHtml(formatPrice(row.price || 0))} KRW</em></div>
                        <div class="shopOrderTotal">${escapeHtml(formatPrice(lineTotal))} KRW</div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `).join("") : `<div class="shopCartEmpty">주문 신청 내역이 없습니다.</div>`}
          </div>
          ${history.length ? `<div class="shopGrandTotal"><span>총 주문 금액</span><strong>${escapeHtml(formatPrice(total))} KRW</strong></div>` : ``}
        </div>
      `;
      bindShopCommonEvents();
    }

    async function renderShopAdminRequestsPage(){
      prepareShopPage("구매 신청내역");
      await loadAllFromDB_FORCE().catch(()=>{});
      const rows = getShopRequestRows().filter(r => (r.status || "pending") === "pending");
      app.innerHTML = `
        <div class="shopPage shopAdminRequestsPage">
          ${renderShopPageHeader("구매 신청내역", "cart")}
          <h2 class="shopSubTitle">구매 신청내역</h2>
          <div class="shopAdminRequestList">
            ${rows.length ? rows.map(r => {
              const it = r.item;
              return `
                <button class="shopAdminRequestCard" type="button" data-admin-shop-open="${escapeAttr(it.id)}">
                  <div class="shopAdminRequestThumb">${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}</div>
                  <div class="shopAdminRequestInfo">
                    <div class="shopAdminRequestName">${escapeHtml(getShopDisplayName(it))}</div>
                    <div class="shopAdminRequestColor">${escapeHtml(getShopColorLabel(it))}</div>
                    <div class="shopAdminRequestLine"></div>
                    <div class="shopAdminRequestStatus"><span>${escapeHtml(getShopRequestCountText(it))}</span><em>${escapeHtml(getShopRequestBadgeText(r))}</em></div>
                    <div class="shopAdminRequestBottom"><strong>${Number(r.qty || 0)}개</strong><b>${escapeHtml(formatPrice(parsePrice(it.price)))}원</b></div>
                  </div>
                </button>
              `;
            }).join("") : `<div class="shopCartEmpty">구매 신청내역이 없습니다.</div>`}
          </div>
        </div>
      `;
      bindShopCommonEvents();
      app.querySelectorAll("[data-admin-shop-open]").forEach(btn => {
        btn.addEventListener("click", ()=>{ location.hash = `#/admin/shop/item/${btn.dataset.adminShopOpen}`; });
      });
    }

    async function renderShopAdminDetailPage(itemId){
      prepareShopPage("구매 신청내역");
      await loadAllFromDB_FORCE().catch(()=>{});
      const it = getShopItemById(itemId);
      if(!it){
        app.innerHTML = `<div class="paper"><div class="paper-body">제품을 찾을 수 없습니다.</div></div>`;
        return;
      }
      const requestRows = (it.requests || []).filter(r => {
  const status = r.status || "pending";
  return status === "pending" || status === "rejected";
});
      const logRows = (it.logs || []).filter(r => r.dept === "SHOP" || r.person === "SHOP" || String(r.person || '').includes('@'));
      app.innerHTML = `
        <div class="shopPage shopAdminDetailPage">
          ${renderShopPageHeader("구매 신청내역", "cart")}
          <h2 class="shopSubTitle">구매 신청내역</h2>
          <div class="shopAdminDetailHero">
            <div class="shopAdminDetailImg">${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}</div>
            <div class="shopAdminDetailInfo">
              <div class="shopAdminDetailName">${escapeHtml(getShopDisplayName(it))}</div>
              <div class="shopAdminDetailColor">${escapeHtml(getShopColorLabel(it))}</div>
              <div class="shopAdminDetailLine"></div>
              <div class="shopAdminStock"><span>현재 재고</span><strong>${Number(calcStock(it) || 0).toLocaleString()}개</strong></div>
            </div>
          </div>
          <div class="shopAdminTableTitleRow">
            <h3>신청 내역</h3>
            <div class="shopAdminActions">
              <button type="button" id="shopApproveBtn">승인</button>
              <button type="button" id="shopRejectBtn">반려</button>
              <button type="button" id="shopDeleteBtn">삭제</button>
            </div>
          </div>
          <div class="shopAdminMiniTable">
            <div class="shopAdminMiniHead"><span>연도. 월. 일.</span><span>구분</span><span>전채 부서</span><span>전채 상태</span></div>
            ${requestRows.length ? requestRows.map(r => `
              <label class="shopAdminMiniRow">
                <input type="checkbox" data-shop-req="${escapeAttr(r.__key)}" checked>
                <span>${escapeHtml(formatKRDate(r.d))}</span><span>신청</span><span>${escapeHtml(r.dept || '-')}</span><span>${escapeHtml(getShopRequestBadgeText(r))}</span>
              </label>
            `).join("") : `<div class="shopAdminMiniEmpty"></div><div class="shopAdminMiniEmpty"></div>`}
          </div>
          <div class="shopAdminTableTitleRow shopAdminLogTitleRow">
            <h3>입출고 내역</h3>
            <div class="shopAdminActions"><button type="button">삭제</button></div>
          </div>
          <div class="shopAdminMiniTable">
            <div class="shopAdminMiniHead"><span>연도. 월. 일.</span><span>구분</span><span>전채 부서</span><span>전채 상태</span></div>
            ${logRows.length ? logRows.map(r => `
              <div class="shopAdminMiniRow noCheck"><span>${escapeHtml(formatKRDate(r.d))}</span><span>${escapeHtml(r.t || '-')}</span><span>${escapeHtml(r.dept || '-')}</span><span>${Number(r.qty || 0)}개</span></div>
            `).join("") : `<div class="shopAdminMiniEmpty"></div><div class="shopAdminMiniEmpty"></div>`}
          </div>
        </div>
      `;
      bindShopCommonEvents();
      const selectedRows = () => requestRows.filter(r => app.querySelector(`[data-shop-req="${CSS.escape(r.__key)}"]`)?.checked);
      document.getElementById("shopApproveBtn")?.addEventListener("click", async ()=>{
        const rows = selectedRows();
        if(!rows.length){ alert("승인할 신청 내역을 선택해주세요."); return; }
        try{
          const email = await getCurrentUserEmail();
          for(const r of rows){
            if(!r._dbid) throw new Error("DB 요청 ID가 없습니다.");
            await approveRequestByRpc(r._dbid, email || "");
          }
          await loadAllFromDB_FORCE();
          renderShopAdminDetailPage(itemId);
        }catch(err){
          alert("승인 반영 실패: " + (err?.message || err));
        }
      });
      document.getElementById("shopRejectBtn")?.addEventListener("click", async ()=>{
        const rows = selectedRows();
        if(!rows.length){ alert("반려할 신청 내역을 선택해주세요."); return; }
        try{
          const email = await getCurrentUserEmail();
          for(const r of rows){
            if(!r._dbid) throw new Error("DB 요청 ID가 없습니다.");
            await rejectRequestByRpc(r._dbid, email || "");
          }
          await loadAllFromDB_FORCE();
          renderShopAdminDetailPage(itemId);
        }catch(err){
          alert("반려 반영 실패: " + (err?.message || err));
        }
      });
      document.getElementById("shopDeleteBtn")?.addEventListener("click", async ()=>{
        const rows = selectedRows();
        if(!rows.length){ alert("삭제할 신청 내역을 선택해주세요."); return; }
        try{
          await deleteRequestsByKeys(it.id, rows);
          await loadAllFromDB_FORCE();
          renderShopAdminDetailPage(itemId);
        }catch(err){
          alert("삭제 실패: " + (err?.message || err));
        }
      });
    }

    function bindShopCommonEvents(){
      app.querySelectorAll("[data-shop-open]").forEach(btn => {
        btn.addEventListener("click", ()=>{
          if(btn.classList.contains("is-ready")) return;
          location.hash = `#/shop/item/${btn.dataset.shopOpen}`;
        });
      });
      app.querySelectorAll("[data-go-shop], [data-shop-home]").forEach(btn => {
        btn.addEventListener("click", ()=>{ location.hash = "#/shop"; });
      });
      app.querySelectorAll("[data-shop-cart]").forEach(btn => {
        btn.addEventListener("click", async ()=>{
          const ok = await isAdminUser();
          location.hash = ok ? "#/shop" : "#/shop/cart";
        });
      });
      app.querySelectorAll("[data-shop-account]").forEach(btn => {
        btn.addEventListener("click", async ()=>{
          const ok = await isAdminUser();
          location.hash = ok ? "#/shop" : "#/shop/account";
        });
      });
      app.querySelectorAll("[data-shop-orders]").forEach(btn => {
        btn.addEventListener("click", async ()=>{
          const ok = await isAdminUser();
          location.hash = ok ? "#/shop" : "#/shop/orders";
        });
      });
    }


    function renderStockCatalogSummary(){
      const cards = [
        { title:"Major Auction", year:"2026", round:"191회", stock:"10개", id:"offline-auction" },
        { title:"Contemporary<br>Art Sale", year:"2026", round:"3월", stock:"5개", id:"contemporary-art-auction" },
        { title:"ZERO BASE", year:"2026", round:"5월 화성", stock:"5개", id:"zero-base" }
      ];

      return `
        <div class="stockCatalogSection">
          <div class="stockCatalogInner">
            <div class="stockCatalogHead">
              <div class="stockCatalogTitle">
                <span>도록</span>
                <em>|</em>
                <small>Catalogue</small>
              </div>
              <div class="stockCatalogRight">재고</div>
            </div>

            <div class="stockCatalogCards">
              ${cards.map(card => `
                <button class="stockCatalogCard" type="button" data-stock-catalog-apply="${escapeAttr(card.id)}">
                  <div class="stockCatalogCardTitle">${card.title}</div>
                  <div class="stockCatalogLine"></div>
                  <div class="stockCatalogYear">${escapeHtml(card.year)}</div>
                  <div class="stockCatalogRound">${escapeHtml(card.round)}</div>
                  <div class="stockCatalogLine"></div>
                  <div class="stockCatalogQty">${escapeHtml(card.stock)}</div>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    function renderHome(mode = "request"){
      applyCustomItemOrder();
      topbar.style.display = "flex";
      searchBox.style.display = "flex";
      setTopbarRightLogo();
      if(topbarLogo) topbarLogo.classList.remove("show");
      updateTopbarLogo();
      setTopTitleByMode(mode);
      setBodyMode(mode);

      const keyword = (q.value || "").trim().toLowerCase();
      const isStockMode = mode === "list";
      const showCatalogMenu = false; // 도록 신청하기/도록 메뉴 전체 비노출

      const sectionsHtml = data.map((section, sectionIndex) => {
        const filtered = (section.items||[]).filter(it => {
          const hay = `${it.name} ${it.size}`.toLowerCase();
          return keyword ? hay.includes(keyword) : true;
        });

        if(filtered.length === 0) return "";
        if(section.category === "기타"){
          return renderShopSection({ ...section, items: filtered });
        }

        return `
          <div class="section">
            <div class="secHead">
              <div class="secHeadTitle">
                <h2>${escapeHtml(section.category)}</h2>
              </div>
              ${mode === "admin" && sectionIndex === 0 ? `
                <div class="secHeadAction">
                  <button class="btn sectionAddBtn" id="sectionAddItemBtn" type="button">품목 추가</button>
                </div>
              ` : ``}
            </div>

            ${
              isStockMode
                ? `
                  <div class="list">
                    ${filtered.map(it => {
                      const stock = calcStock(it);
                      return `
                        <div class="row stockStatusRow ${it.name === "와인박스(1구)" ? "wineboxGap" : ""}">
                          <div class="card stockStatusCard" role="button" tabindex="0" data-open="${escapeAttr(it.id)}">
                            <div class="thumb stockStatusThumb">
                              ${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}
                            </div>

                            <div class="meta stockStatusMeta">
                              <div class="meta-top">
                                <div class="title stockStatusTitle">${escapeHtml(it.name)}</div>
                                <div class="size stockStatusSize">${escapeHtml(it.size || "")}</div>
                              </div>
                              <div class="stockStatusSub">대기 없음 · +0</div>
                            </div>
                          </div>

                          <div class="stock stockStatusQty">
                            ${Number.isFinite(stock) ? `${stock.toLocaleString()}<small>개</small>` : `-`}
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>
                `
                : `
                  <div class="list">
                    ${filtered.map(it => {
                      const stock = calcStock(it);
                      const last = getLastLogInfo(it);
                      const pendingCount = countPendingRequests(it);
                      const statusText = mode === "admin"
                        ? (pendingCount > 0 ? `신청 ${pendingCount}건` : "대기 없음")
                        : (last.status || "-");
                      const deltaText = mode === "admin"
                        ? (pendingCount > 0 ? "" : (last.date || "-"))
                        : (last.date || "-");
                      const deltaClass = mode === "admin"
                        ? (pendingCount > 0 ? "out" : (last.delta >= 0 ? "in" : "out"))
                        : (last.delta >= 0 ? "in" : "out");
                      const deltaValue = mode === "admin"
                        ? (pendingCount > 0 ? "승인 필요" : `${(last.delta>=0?"+":"")}${(last.delta||0).toLocaleString()}`)
                        : `${(last.delta>=0?"+":"")}${(last.delta||0).toLocaleString()}`;
                      return `
                        <div class="row ${it.name === "와인박스(1구)" ? "wineboxGap" : ""}">
                          <div class="card" role="button" tabindex="0" data-open="${escapeAttr(it.id)}">
                            <div class="thumb">
                              ${it.img ? renderSmartImage(it.img, it.name) : iconPlaceholder()}
                            </div>

                            <div class="meta">
                              <div class="meta-top">
                                <div class="title">${escapeHtml(it.name)}</div>
                                <div class="size">${escapeHtml(it.size || "")}</div>
                              </div>

                              <div class="meta-bot">
                                <div class="status ${mode === "admin" ? (pendingCount > 0 ? "out" : "in") : statusClass(last.status)}">${escapeHtml(statusText)}</div>
                                <div class="delta">
                                  <span>${escapeHtml(deltaText)}</span>
                                  <span class="qty ${deltaClass}">${escapeHtml(deltaValue)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="stock">
                            ${Number.isFinite(stock) ? `${stock.toLocaleString()}<small>개</small>` : `-`}
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>
                `
            }
          </div>
        `;
      }).join("");

      // 도록 신청하기 자체 제거: 신청/관리자/재고현황 홈에서 도록 영역을 표시하지 않음
      const catalogMenuHtml = "";
      app.innerHTML = (catalogMenuHtml + sectionsHtml) || `
        <div class="paper">
          <div class="paper-head">안내</div>
          <div class="paper-body">등록된 품목이 없습니다.</div>
        </div>
      `;

      bindShopCommonEvents();

      const sectionAddItemBtn = document.getElementById("sectionAddItemBtn");
      if(sectionAddItemBtn){
        sectionAddItemBtn.addEventListener("click", ()=> openItemModal(""));
      }

      app.querySelectorAll("[data-open]").forEach(el => {
        if(mode === "list") return;

        const go = () => location.hash = `#/${mode}/item/${el.dataset.open}`;
        el.addEventListener("click", go);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go();
          }
        });
      });

      app.querySelectorAll("[data-catalog-open]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.catalogOpen;
          location.hash = `#/request/catalog/${id}`;
        });
      });
    }


    
function renderCatalogDetail(catalogId){
      topbar.style.display = "flex";
      searchBox.style.display = "none";
      setTopbarRightSearch();
      if(topbarLogo) topbarLogo.classList.add("show");
      updateTopbarLogo();
      setTopTitleByMode("request");
      setBodyMode("request");

      const config = getUnifiedCatalogConfig(catalogId);
      if(!config){
        app.innerHTML = `
          <div class="paper">
            <div class="paper-head">알림</div>
            <div class="paper-body">페이지를 찾을 수 없습니다.</div>
          </div>
        `;
        return;
      }

      const allDepts = [
        "경영기획팀","인사팀","관재팀","재무팀","서비스운영팀","아카이브팀","대외협력팀","디자인팀","영업팀","브랜드기획팀","고객관리팀","작품관리팀","VIP사업기획팀","웹서비스개발팀"
      ];

      let reqDateFilter = "";
      let reqDeptFilter = "전체";
      let reqStatusFilter = "전체";
      let selectedRequestKeys = new Set();

      function getRequestRows(){
        let rows = [...getCatalogRequests(catalogId)];
        if(reqDateFilter) rows = rows.filter(r => toISODateLike(r.d) === reqDateFilter);
        if(reqDeptFilter !== "전체") rows = rows.filter(r => (r.dept || "-") === reqDeptFilter);
        if(reqStatusFilter === "전체") {
          rows = rows.filter(r => (r.status || "pending") !== "approved");
        } else {
          rows = rows.filter(r => (r.status || "pending") === reqStatusFilter);
        }
        return sortByLatestDateAndKey(rows);
      }

      function tableRows(rows){
        if(rows.length === 0){
          return `<div class="logEmpty">내역이 없습니다.</div>`;
        }
        return rows.map(r => {
          const key = r.__key;
          const selected = selectedRequestKeys.has(key);
          const statusText = requestStatusLabel(r.status);
          const statusClassName = requestStatusClass(r.status);
          return `
            <div class="logRow clickable ${selected ? "selected" : ""}" data-row="${escapeAttr(key)}" data-kind="request">
              <div class="logDate">${escapeHtml(formatKRDate(r.d))}</div>
              <div class="logType"><span class="typeBadge request">${escapeHtml(r.t || "신청")}</span></div>
              <div class="logDept">${escapeHtml(r.dept || "-")}</div>
              <div class="logType"><span class="typeBadge ${statusClassName}">${escapeHtml(statusText)}</span></div>
              <div class="logPerson">${escapeHtml(r.person || "-")}</div>
              <div class="logQty">${Number(r.qty || 0).toLocaleString()}개</div>
            </div>
          `;
        }).join("");
      }

      function render(){
        const requestRows = getRequestRows();
        const selected = getCatalogApplySelection(catalogId);
        const currentYear = selected?.year || "";
        const currentRound = selected?.round || "";
        const currentStock = Number(selected?.currentStock ?? config.currentStock ?? 0);
        const galleryImages = Array.isArray(config.galleryImages) ? config.galleryImages : [];
        const galleryHtml = Array.from({ length: Math.max(galleryImages.length, 10) || 10 }, (_, idx) => {
          const imagePath = galleryImages[idx] || "";
          return `
            <div class="catalogGalleryItem">
              ${imagePath ? renderSmartImage(imagePath, `${config.title || "Catalog"} ${idx + 1}`) : `<div class="catalogGalleryPlaceholder">IMAGE</div>`}
            </div>
          `;
        }).join("");

        const yearList = Object.keys(config.data || {});
        const fallbackYear = currentYear || yearList[0] || "";
        const roundList = Array.isArray(config.data?.[fallbackYear]) ? config.data[fallbackYear] : [];
        const activeRound = roundList.includes(currentRound) ? currentRound : (roundList[0] || "");

        const yearOptions = [
          `<option value="">${escapeHtml(config.yearPlaceholder || "연도")}</option>`,
          ...yearList.map(year => `<option value="${escapeAttr(year)}" ${fallbackYear === year ? "selected" : ""}>${escapeHtml(year)}</option>`)
        ].join("");

        const roundOptions = [
          `<option value="">${escapeHtml(roundList.length ? "회차 선택" : "회차 미정")}</option>`,
          ...roundList.map(round => {
            const selectedAttr = round === activeRound ? "selected" : "";
            return `<option value="${escapeAttr(round)}" ${selectedAttr}>${escapeHtml(round)}</option>`;
          })
        ].join("");

        app.innerHTML = `
          <div class="paper detailPaper requestDetailPaper">
            </div>

            <div class="paper-body detailPaperBody">
              <div class="catalogDetailPage">
                <div class="catalogDetailTop">
                  <h2 class="catalogDetailTitle">
  <span class="catalogTitleKr">도록</span>
  <span class="catalogTitleDivider">|</span>
  <span class="catalogTitleEn">${escapeHtml(getCatalogTypeLabel(catalogId))}</span>
</h2>
                </div>

              

                <div class="catalogControlLabel">선택</div>
                <div class="catalogDetailControlRow">
                  <div class="catalogSelectWrap">
                    <select class="catalogSelect" id="catalogTypeSelect">
                      ${(config.typeOptions || getUnifiedCatalogOptions()).map(opt => `<option value="${escapeAttr(opt.id)}" ${String(config.id || "") === String(opt.id) ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}
                    </select>
                    <span class="catalogSelectArrow">▼</span>
                  </div>
                  <div class="catalogSelectWrap">
                    <select class="catalogSelect" id="catalogYearSelect">
                      ${yearOptions}
                    </select>
                    <span class="catalogSelectArrow">▼</span>
                  </div>
                  <div class="catalogSelectWrap">
                    <select class="catalogSelect" id="catalogRoundSelect">
                      ${roundOptions}
                    </select>
                    <span class="catalogSelectArrow">▼</span>
                  </div>
                  <div class="catalogDetailAction">
                    <button class="catalogDetailSubmit" id="catalogRequestSubmitBtn" type="button">출고 신청하기</button>
                  </div>
                </div>

                <div class="catalogStockCaption">현재 재고</div>
                <div class="catalogStockBox">
                  <div class="catalogStockRow">
                    <div class="catalogStockLabel">현재 재고</div>
                    <div class="catalogStockValue">${currentStock.toLocaleString()}개</div>
                  </div>
                </div>

                <div class="catalogGalleryTitle">도록</div>
                <div class="catalogGalleryGrid">${galleryHtml}</div>
              </div>

              <div class="detailSectionBlock">
                <div class="boxTitleRow detailSectionHead">
                  <p class="boxTitle">신청 내역</p>
                  <div class="requestAdminActions">
                    <button class="selDelBtn" id="catalogBulkDeleteRequests" type="button">삭제</button>
                  </div>
                </div>
                <div class="logBox requestLogBox requestTable">
                  <div class="logMinWidth">
                    <div class="logHead subtleHead">
                      <div class="logHeadCell">
                        <input type="date" id="catalogReqDateFilter" class="headerFilterDate" value="${reqDateFilter}">
                      </div>
                      <div class="logHeadCell"><div class="logHeadLabel">구분</div></div>
                      <div class="logHeadCell">
                        <select id="catalogReqDeptSel" class="headerFilterSelect">
                          <option value="전체" ${reqDeptFilter === "전체" ? "selected" : ""}>전체 부서</option>
                          ${allDepts.map(d => `<option value="${escapeAttr(d)}" ${reqDeptFilter === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
                        </select>
                      </div>
                      <div class="logHeadCell">
                        <select id="catalogReqStatusSel" class="headerFilterSelect">
                          <option value="전체" ${reqStatusFilter === "전체" ? "selected" : ""}>전체 상태</option>
                          <option value="pending" ${reqStatusFilter === "pending" ? "selected" : ""}>신청</option>
                          <option value="approved" ${reqStatusFilter === "approved" ? "selected" : ""}>승인</option>
                          <option value="rejected" ${reqStatusFilter === "rejected" ? "selected" : ""}>반려</option>
                        </select>
                      </div>
                      <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                      <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
                    </div>
                    ${tableRows(requestRows)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal" id="catalogAddModal" aria-hidden="true">
            <div class="modalOverlay" id="catalogAddOverlay"></div>
            <div class="sheet" role="dialog" aria-modal="true" aria-label="출고 신청하기">
              <div class="sheetHead">
                <div>출고 신청하기</div>
                <button class="sheetClose" id="catalogAddClose">닫기</button>
              </div>
              <div class="sheetBody">
                <div class="field">
                  <label for="catalogAddDate">날짜</label>
                  <input type="date" id="catalogAddDate">
                </div>
                <input type="hidden" id="catalogAddType" value="신청">
                <div class="field">
                  <label for="catalogAddDept">부서</label>
                  <select id="catalogAddDept">
                    ${allDepts.map(d => `<option value="${escapeAttr(d)}">${escapeHtml(d)}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="catalogAddQty">수량</label>
                  <input id="catalogAddQty" inputmode="numeric" placeholder="예) 100" />
                </div>
                <div class="field">
                  <label for="catalogAddPerson">담당자</label>
                  <input id="catalogAddPerson" placeholder="" />
                </div>
              </div>
              <div class="sheetFoot">
                <button class="btn primary" id="catalogAddBtn">출고 신청하기</button>
              </div>
            </div>
          </div>
        `;

        const typeSelect = app.querySelector("#catalogTypeSelect");
        const yearSelect = app.querySelector("#catalogYearSelect");
        const roundSelect = app.querySelector("#catalogRoundSelect");
        const submitBtn = app.querySelector("#catalogRequestSubmitBtn");
        const catalogAddModal = app.querySelector("#catalogAddModal");
        const catalogAddOverlay = app.querySelector("#catalogAddOverlay");
        const catalogAddClose = app.querySelector("#catalogAddClose");
        const catalogAddBtn = app.querySelector("#catalogAddBtn");
        const catalogAddDate = app.querySelector("#catalogAddDate");

        function openCatalogRequestModal(){
          if(!catalogAddModal) return;
          catalogAddModal.classList.add("show");
          document.body.style.overflow = "hidden";
          if(catalogAddDate && !catalogAddDate.value){
            catalogAddDate.value = new Date().toISOString().slice(0, 10);
          }
        }

        function closeCatalogRequestModal(){
          if(!catalogAddModal) return;
          catalogAddModal.classList.remove("show");
          document.body.style.overflow = "";
        }

        if(typeSelect){
          typeSelect.addEventListener("change", ()=>{
            const nextType = typeSelect.value || "offline-auction";
            location.hash = `#/request/catalog/${encodeURIComponent(nextType)}`;
          });
        }

        if(yearSelect){
          yearSelect.addEventListener("change", ()=>{
            const nextYear = yearSelect.value || "";
            const nextRounds = Array.isArray(config.data?.[nextYear]) ? config.data[nextYear] : [];
            saveCatalogApplySelection(catalogId, {
              ...getCatalogApplySelection(catalogId),
              year: nextYear,
              round: nextRounds[0] || "",
              currentStock
            });
            render();
          });
        }

        if(roundSelect){
          roundSelect.addEventListener("change", ()=>{
            saveCatalogApplySelection(catalogId, {
              ...getCatalogApplySelection(catalogId),
              year: yearSelect?.value || "",
              round: roundSelect.value || "",
              currentStock
            });
            render();
          });
        }

        if(submitBtn){
          submitBtn.addEventListener("click", async ()=>{
            const year = yearSelect?.value || "";
            const round = roundSelect?.value || activeRound || "";
            if(!year){
              alert("연도를 선택해주세요.");
              return;
            }
            saveCatalogApplySelection(catalogId, {
              year,
              round,
              currentStock
            });
            openCatalogRequestModal();
          });
        }

        if(catalogAddOverlay) catalogAddOverlay.addEventListener("click", closeCatalogRequestModal);
        if(catalogAddClose) catalogAddClose.addEventListener("click", closeCatalogRequestModal);

        if(catalogAddBtn){
          catalogAddBtn.addEventListener("click", async ()=>{
            const selectedInfo = getCatalogApplySelection(catalogId);
            const date = app.querySelector("#catalogAddDate")?.value || "";
            const dept = app.querySelector("#catalogAddDept")?.value || "";
            const qty = Number(app.querySelector("#catalogAddQty")?.value || 0);
            const person = (app.querySelector("#catalogAddPerson")?.value || "").trim();
            const year = selectedInfo?.year || yearSelect?.value || "";
            const round = selectedInfo?.round || roundSelect?.value || "";
            const stockValue = Number(selectedInfo?.currentStock ?? currentStock ?? 0);

            if(!year){
              alert("연도를 선택해주세요.");
              return;
            }
            if(!date || !dept || !qty || !person){
              alert("모든 항목을 입력해주세요.");
              return;
            }
            if(!Number.isFinite(qty) || qty <= 0){
              alert("수량은 0보다 큰 숫자로 입력해주세요.");
              return;
            }

            const rows = getCatalogRequests(catalogId);
            const row = normalizeLog({
              d: date,
              t: "신청",
              dept,
              person,
              qty,
              status: "pending",
              year,
              round,
              currentStock: stockValue
            });

            try{
              await addCatalogRequestToDB(catalogId, row);

              rows.push(row);
              saveCatalogRequests(catalogId, rows);

              closeCatalogRequestModal();
              render();
              alert("출고 신청이 접수되었습니다.");
            }catch(err){
              console.error("도록 신청 DB 저장 실패:", err);
              alert("DB 저장 중 오류가 발생했습니다.");
              return;
            }
          });
        }

        const reqDateFilterEl = app.querySelector("#catalogReqDateFilter");
        const reqDeptSel = app.querySelector("#catalogReqDeptSel");
        const reqStatusSel = app.querySelector("#catalogReqStatusSel");
        const bulkDeleteBtn = app.querySelector("#catalogBulkDeleteRequests");

        if(reqDateFilterEl){
          reqDateFilterEl.addEventListener("change", (e)=>{
            reqDateFilter = e.target.value || "";
            render();
          });
        }
        if(reqDeptSel){
          reqDeptSel.addEventListener("change", (e)=>{
            reqDeptFilter = e.target.value || "전체";
            render();
          });
        }
        if(reqStatusSel){
          reqStatusSel.addEventListener("change", (e)=>{
            reqStatusFilter = e.target.value || "전체";
            render();
          });
        }

        app.querySelectorAll('[data-kind="request"]').forEach(row => {
          row.addEventListener("click", ()=>{
            const key = row.dataset.row;
            if(selectedRequestKeys.has(key)) selectedRequestKeys.delete(key);
            else selectedRequestKeys.add(key);
            render();
          });
        });

        if(bulkDeleteBtn){
          bulkDeleteBtn.addEventListener("click", ()=>{
            if(selectedRequestKeys.size === 0){
              alert("삭제할 신청 내역을 선택해주세요.");
              return;
            }
            const ok = confirm("선택한 신청 내역을 삭제하시겠습니까?");
            if(!ok) return;
            const nextRows = getCatalogRequests(catalogId).filter(r => !selectedRequestKeys.has(r.__key));
            saveCatalogRequests(catalogId, nextRows);
            selectedRequestKeys.clear();
            render();
          });
        }
      }

      render();
    }

function renderCatalogApplyPage(catalogId){
      topbar.style.display = "flex";
      searchBox.style.display = "none";
      setTopbarRightSearch();
      if(topbarLogo) topbarLogo.classList.add("show");
      updateTopbarLogo();
      setTopTitleByMode("request");
      setBodyMode("request");

      const config = getUnifiedCatalogConfig(catalogId);
      if(!config){
        app.innerHTML = `
          <div class="paper">
            <div class="paper-head">알림</div>
            <div class="paper-body">페이지를 찾을 수 없습니다.</div>
          </div>
        `;
        return;
      }

      const saved = getCatalogApplySelection(catalogId);
      const selectedYear = saved?.year || "";
      const selectedRound = saved?.round || config.roundDefault || "";
      const currentStock = Number(saved?.currentStock ?? config.currentStock ?? 0);

      const allDepts = [
        "경영기획팀","인사팀","관재팀","재무팀","서비스운영팀","아카이브팀","대외협력팀","디자인팀","영업팀","브랜드기획팀","고객관리팀","작품관리팀","VIP사업기획팀","웹서비스개발팀"
      ];

      app.innerHTML = `
        <div class="catalogApplySummary catalogApplyTitleSummary">
  <div class="catalogApplySummaryRow catalogApplySummaryRowSingle">
    <div class="catalogApplySummaryCell catalogApplyTitleCell">${escapeHtml(config.title || "")}</div>
  </div>
</div>

<div class="catalogApplySummary">
  <div class="catalogApplySummaryRow catalogApplySummaryRowDouble">
    <div class="catalogApplySummaryCell">${escapeHtml(selectedYear || "연도 미선택")}</div>
    <div class="catalogApplySummaryCell">${escapeHtml(selectedRound || "회차 미선택")}</div>
  </div>
</div>

<div class="catalogApplySummary" style="margin-bottom:18px;">
  <div class="catalogApplySummaryRow catalogApplySummaryRowDouble">
    <div class="catalogApplySummaryCell">현재 재고</div>
    <div class="catalogApplySummaryCell">${currentStock.toLocaleString()}개</div>
  </div>
</div>

          <div class="catalogApplyForm">
            <div class="field">
              <label for="catalogApplyDate">날짜</label>
              <input type="date" id="catalogApplyDate">
            </div>
            <div class="field">
              <label for="catalogApplyDept">부서</label>
              <select id="catalogApplyDept">
                ${allDepts.map(d => `<option value="${escapeAttr(d)}">${escapeHtml(d)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="catalogApplyQty">수량</label>
              <input id="catalogApplyQty" inputmode="numeric" placeholder="예) 10" />
            </div>
            <div class="field">
              <label for="catalogApplyPerson">담당자</label>
              <input id="catalogApplyPerson" placeholder="담당자명을 입력해주세요." />
            </div>
          </div>

          <button class="catalogApplyBtn" id="catalogApplySubmitBtn" type="button">출고 신청하기</button>
        </div>
      `;

      const dateInput = app.querySelector("#catalogApplyDate");
      if(dateInput){
        dateInput.value = new Date().toISOString().slice(0, 10);
      }

      const submitBtn = app.querySelector("#catalogApplySubmitBtn");
      if(submitBtn){
        submitBtn.addEventListener("click", async ()=>{
          const date = app.querySelector("#catalogApplyDate")?.value || "";
          const dept = app.querySelector("#catalogApplyDept")?.value || "";
          const qty = Number(app.querySelector("#catalogApplyQty")?.value || 0);
          const person = (app.querySelector("#catalogApplyPerson")?.value || "").trim();

          if(!selectedYear){
            alert("연도 선택 후 다시 진행해주세요.");
            location.hash = `#/request/catalog/${encodeURIComponent(catalogId)}`;
            return;
          }
          if(!date || !dept || !qty || !person){
            alert("모든 항목을 입력해주세요.");
            return;
          }
          if(!Number.isFinite(qty) || qty <= 0){
            alert("수량은 0보다 큰 숫자로 입력해주세요.");
            return;
          }

          const rows = getCatalogRequests(catalogId);
          const row = normalizeLog({
            d: date,
            t: "신청",
            dept,
            person,
            qty,
            status: "pending",
            year: selectedYear,
            round: selectedRound,
            currentStock
          });

          try{
            await addCatalogRequestToDB(catalogId, row);

            rows.push(row);
            saveCatalogRequests(catalogId, rows);

            alert("출고 신청이 접수되었습니다.");
            location.hash = `#/request/catalog/${encodeURIComponent(catalogId)}`;
          }catch(err){
            console.error("도록 신청 DB 저장 실패:", err);
            alert("DB 저장 중 오류가 발생했습니다.");
            return;
          }
        });
      }
    }

    function renderDetail(id, mode = "request"){
      topbar.style.display = "flex";
      searchBox.style.display = "none";
      setTopbarRightLogo();
      if(topbarLogo) topbarLogo.classList.toggle("show", mode === "admin");
      updateTopbarLogo();
      setTopTitleByMode(mode);
      setBodyMode(mode);

      const isRequest = mode === "request";
      const isAdmin = mode === "admin";
      const found = findItemById(id);
      if(!found){
        app.innerHTML = `
          <div class="paper">
            <div class="paper-head">알림</div>
            <div class="paper-body">품목을 찾을 수 없습니다.</div>
          </div>
        `;
        return;
      }

      const { section, it } = found;
      if(isRequest && section?.category === "기타"){
        setTopbarTitleLogo();
      }
      ensureLogs(it);
      ensureRequests(it);

      let reqDateFilter = "";
      let logDateFilter = "";
      let logTypeFilter = "전체";
      let logDeptFilter = "전체";
      let selectedRequestKeys = new Set();
      let selectedLogKeys = new Set();

      const allDepts = [
        "경영기획팀","인사팀","관재팀","재무팀","서비스운영팀","아카이브팀","대외협력팀","디자인팀","영업팀","브랜드기획팀","고객관리팀","작품관리팀","VIP사업기획팀","웹서비스개발팀","인사팀","관재팀","재무팀",
      ];

      let reqDeptFilter = "전체";
      let reqStatusFilter = "전체";

      function getRequestRows(){
        let rows = [...(it.requests || [])];
        if(reqDateFilter) rows = rows.filter(r => toISODateLike(r.d) === reqDateFilter);
        if(reqDeptFilter !== "전체") rows = rows.filter(r => (r.dept || "-") === reqDeptFilter);
        if(reqStatusFilter === "전체") {
          rows = rows.filter(r => (r.status || "pending") !== "approved");
        } else {
          rows = rows.filter(r => (r.status || "pending") === reqStatusFilter);
        }
        return sortByLatestDateAndKey(rows);
      }

      function getLogRows(){
        let rows = [...(it.logs || [])];
        if(logDateFilter) rows = rows.filter(r => toISODateLike(r.d) === logDateFilter);
        if(logTypeFilter !== "전체") rows = rows.filter(r => r.t === logTypeFilter);
        if(logDeptFilter !== "전체") rows = rows.filter(r => (r.dept || "-") === logDeptFilter);
        return sortByLatestDateAndKey(rows);
      }

      function tableRows(rows, kind){
        if(rows.length === 0){
          return `<div class="logEmpty">내역이 없습니다.</div>`;
        }
        return rows.map(r => {
          const key = r.__key;
          const selected = kind === "request" ? selectedRequestKeys.has(key) : selectedLogKeys.has(key);
          const typeClass = r.t === "입고" ? "in" : (r.t === "출고" ? "out" : "request");
          if(kind === "request"){
            const statusText = requestStatusLabel(r.status);
            const statusClassName = requestStatusClass(r.status);
            return `
              <div class="logRow clickable ${selected ? "selected" : ""}" data-row="${escapeAttr(key)}" data-kind="${kind}">
                <div class="logDate">${escapeHtml(formatKRDate(r.d))}</div>
                <div class="logType"><span class="typeBadge ${typeClass}">${escapeHtml(r.t)}</span></div>
                <div class="logDept">${escapeHtml(r.dept || "-")}</div>
                <div class="logType"><span class="typeBadge ${statusClassName}">${escapeHtml(statusText)}</span></div>
                <div class="logPerson">${escapeHtml(r.person || "-")}</div>
                <div class="logQty">${Number(r.qty || 0).toLocaleString()}개</div>
              </div>
            `;
          }
          return `
            <div class="logRow clickable ${selected ? "selected" : ""}" data-row="${escapeAttr(key)}" data-kind="${kind}">
              <div class="logDate">${escapeHtml(formatKRDate(r.d))}</div>
              <div class="logType"><span class="typeBadge ${typeClass}">${escapeHtml(r.t)}</span></div>
              <div class="logDept">${escapeHtml(r.dept || "-")}</div>
              <div class="logPerson">${escapeHtml(r.person || "-")}</div>
              <div class="logQty">${Number(r.qty || 0).toLocaleString()}개</div>
            </div>
          `;
        }).join("");
      }

      function render(){
        ensureLogs(it);
        ensureRequests(it);

        const detailImages = Array.isArray(it.images)
  ? it.images.filter(Boolean)
  : [it.img].filter(Boolean);

const detailImagesHtml = detailImages.length
  ? detailImages.map(img => `
      <div class="imgBox requestImgBox">${renderSmartImage(img, it.name)}</div>
    `).join("")
  : `<div class="imgBox requestImgBox">${iconPlaceholder()}</div>`;
        const stockNow = calcStock(it);
        const requestRows = getRequestRows();
        const logRows = getLogRows();

        app.innerHTML = `
          <style>
            @media (max-width: 768px){
              .requestImgRow.oneImage{
                justify-content: flex-end !important;
              }
              .requestImgRow.oneImage .requestImgBox{
                margin-left: auto !important;
                margin-right: 0 !important;
              }
            }
          </style>
          <div class="paper detailPaper ${isRequest ? "requestDetailPaper" : ""}">
            <div class="paper-body detailPaperBody">
              <div class="detailAdminHero">
                <div class="detailAdminIntro">
                  <h2 class="detailAdminName">${escapeHtml(it.name)}</h2>
                  <p class="detailAdminSize">${escapeHtml(it.size || "")}</p>
                </div>
                <div class="detailImageFrame">
  <div class="imgRow requestImgRow ${detailImages.length === 1 ? "oneImage" : ""}">
    ${detailImagesHtml}
  </div>
</div>
              </div>

              <div class="statsGrid requestStatsGrid">
                <div class="statCard current requestStatCard">
                  <div class="statRow">
                    <div class="statLabel"><span class="txt">현재 재고</span></div>
                    <div class="statValue">${Number.isFinite(stockNow) ? `${stockNow.toLocaleString()}개` : "0개"}</div>
                  </div>
                </div>
              </div>

              ${isRequest ? `
                <div class="requestActionWrap requestActionWrapLarge">
                  <button class="requestSubmitBtn" id="openRequestBtn" type="button">출고 신청하기</button>
                </div>
              ` : ``}

              <div class="detailSectionBlock">
                <div class="boxTitleRow detailSectionHead">
                  <p class="boxTitle">신청 내역</p>
                  ${(isRequest || isAdmin) ? `
                    <div class="requestAdminActions">
                      ${isAdmin ? `<button class="selDelBtn reqApproveBtn" id="approveRequestsBtn" type="button">승인</button>
                      <button class="selDelBtn reqRejectBtn" id="rejectRequestsBtn" type="button">반려</button>` : ``}
                      <button class="selDelBtn" id="bulkDeleteRequests" type="button">삭제</button>
                    </div>
                  ` : ``}
                </div>
                <div class="logBox requestLogBox requestTable">
                  <div class="logMinWidth">
                    <div class="logHead subtleHead">
                      <div class="logHeadCell">
                        <input type="date" id="reqDateFilter" class="headerFilterDate" value="${reqDateFilter}">
                      </div>
                      <div class="logHeadCell"><div class="logHeadLabel">구분</div></div>
                      <div class="logHeadCell">
                        <select id="reqDeptSel" class="headerFilterSelect">
                          <option value="전체" ${reqDeptFilter === "전체" ? "selected" : ""}>전체 부서</option>
                          ${allDepts.map(d => `<option value="${escapeAttr(d)}" ${reqDeptFilter === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
                        </select>
                      </div>
                      <div class="logHeadCell">
                        <select id="reqStatusSel" class="headerFilterSelect">
                          <option value="전체" ${reqStatusFilter === "전체" ? "selected" : ""}>전체 상태</option>
                          <option value="pending" ${reqStatusFilter === "pending" ? "selected" : ""}>신청</option>
                          <option value="approved" ${reqStatusFilter === "approved" ? "selected" : ""}>승인</option>
                          <option value="rejected" ${reqStatusFilter === "rejected" ? "selected" : ""}>반려</option>
                        </select>
                      </div>
                      <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                      <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
                    </div>
                    ${tableRows(requestRows, "request")}
                  </div>
                </div>
              </div>

              ${isRequest ? `
                <div class="detailSectionBlock">
                  <div class="boxTitleRow detailSectionHead">
                    <p class="boxTitle">입출고 내역</p>
                  </div>
                  <div class="logBox requestLogBox">
                    <div class="logMinWidth">
                      <div class="logHead subtleHead">
                        <div class="logHeadCell">
                          <input type="date" id="logDateFilter" class="headerFilterDate" value="${logDateFilter}">
                        </div>
                        <div class="logHeadCell">
                          <select id="logTypeSel" class="headerFilterSelect">
                            <option value="전체" ${logTypeFilter === "전체" ? "selected" : ""}>전체</option>
                            <option value="출고" ${logTypeFilter === "출고" ? "selected" : ""}>출고</option>
                            <option value="입고" ${logTypeFilter === "입고" ? "selected" : ""}>입고</option>
                          </select>
                        </div>
                        <div class="logHeadCell">
                          <select id="logDeptSel" class="headerFilterSelect">
                            <option value="전체" ${logDeptFilter === "전체" ? "selected" : ""}>전체 부서</option>
                            ${allDepts.map(d => `<option value="${escapeAttr(d)}" ${logDeptFilter === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
                          </select>
                        </div>
                        <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                        <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
                      </div>
                      ${tableRows(logRows, "log")}
                    </div>
                  </div>
                </div>
              ` : `
                <div class="divider"></div>
                <div class="boxTitleRow detailSectionHead" style="margin-top:0;">
                  <p class="boxTitle">입출고 내역</p>
                  ${isAdmin ? `
                    <div class="logActionBtns">
                      <button class="selDelBtn" id="bulkDeleteLogs" type="button">삭제</button>
                    </div>
                  ` : ``}
                </div>
                <div class="logBox">
                  <div class="logMinWidth">
                    <div class="logHead subtleHead">
                      <div class="logHeadCell">
                        <input type="date" id="logDateFilter" class="headerFilterDate" value="${logDateFilter}">
                      </div>
                      <div class="logHeadCell">
                        <select id="logTypeSel" class="headerFilterSelect">
                          <option value="전체" ${logTypeFilter === "전체" ? "selected" : ""}>전체</option>
                          <option value="출고" ${logTypeFilter === "출고" ? "selected" : ""}>출고</option>
                          <option value="입고" ${logTypeFilter === "입고" ? "selected" : ""}>입고</option>
                        </select>
                      </div>
                      <div class="logHeadCell">
                        <select id="logDeptSel" class="headerFilterSelect">
                          <option value="전체" ${logDeptFilter === "전체" ? "selected" : ""}>전체 부서</option>
                          ${allDepts.map(d => `<option value="${escapeAttr(d)}" ${logDeptFilter === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
                        </select>
                      </div>
                      <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                      <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
                    </div>
                    ${tableRows(logRows, "log")}
                  </div>
                </div>
                ${isAdmin ? `
                  <div class="adminBottomRow">
                    <div class="adminBottomLeft">
                      <span> </span>
                      <div class="stockInline">
                        <button class="stockInlineValue" id="editBaseStockBtn" type="button">기존재고 <b>${Number(it.baseStock || 0)}</b></button>
                        <div class="stockInlineEdit" id="baseStockEditRow">
                          <input class="stockInlineInput" id="baseStockInput" inputmode="numeric" value="${Number(it.baseStock || 0)}" />
                          <button class="stockInlineMini" id="saveBaseStockBtn" type="button">저장</button>
                          <button class="miniBtn" id="cancelBaseStockBtn" type="button">취소</button>
                        </div>
                      </div>
                    </div>
                    <div class="adminBottomRight"></div>
                  </div>
                  <div class="dangerBox">
                    <div class="dangerText">품목 삭제 시 복구가 어려우니 삭제 전 확인해 주세요.</div>
                    <button class="dangerBtn" id="deleteItemBtn" type="button">품목 제거</button>
                  </div>
                  <div class="dbStatusLine">
                    DB상태: <b>${dbStatusText()}</b>
                    ${DB.mode === "error" && DB.lastError ? `<div style="margin-top:4px;">(${escapeHtml(DB.lastError)})</div>` : ``}
                  </div>
                ` : `
                  <div class="dbStatusLine">DB상태: <b>${dbStatusText()}</b></div>
                `}
              `}
            </div>
          </div>

          <div class="modal" id="addModal" aria-hidden="true">
            <div class="modalOverlay" id="addOverlay"></div>
            <div class="sheet" role="dialog" aria-modal="true" aria-label="${isRequest ? '출고 신청하기' : '추가'}">
              <div class="sheetHead">
                <div>${isRequest ? '출고 신청하기' : '추가'}</div>
                <button class="sheetClose" id="addClose">닫기</button>
              </div>
              <div class="sheetBody">
                <div class="field">
                  <label for="aDate">날짜</label>
                  <input type="date" id="aDate">
                </div>
                ${isRequest ? `<input type="hidden" id="aType" value="신청">` : `
                  <div class="field">
                    <label>구분</label>
                    <input type="hidden" id="aType" value="출고">
                    <div class="seg" id="aTypeSeg">
                      <button type="button" class="active out" data-v="출고">출고</button>
                      <button type="button" class="in" data-v="입고">입고</button>
                    </div>
                  </div>
                `}
                <div class="field">
                  <label for="aDept">부서</label>
                  <select id="aDept">
                    ${allDepts.map(d => `<option value="${escapeAttr(d)}">${escapeHtml(d)}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="aQty">수량</label>
                  <input id="aQty" inputmode="numeric" placeholder="예) 100" />
                </div>
                <div class="field">
                  <label for="aPerson">담당자</label>
                  <input id="aPerson" placeholder="" />
                </div>
              </div>
              <div class="sheetFoot">
                <button class="btn primary" id="addBtn">${isRequest ? '출고 신청하기' : '추가'}</button>
              </div>
            </div>
          </div>
        `;

        const reqDateFilterEl = app.querySelector("#reqDateFilter");
        const reqDeptSel = app.querySelector("#reqDeptSel");
        const reqStatusSel = app.querySelector("#reqStatusSel");
        const logDateFilterEl = app.querySelector("#logDateFilter");
        const logTypeSel = app.querySelector("#logTypeSel");
        const logDeptSel = app.querySelector("#logDeptSel");
        const openRequestBtn = app.querySelector("#openRequestBtn");
        const addModal = app.querySelector("#addModal");
        const addOverlay = app.querySelector("#addOverlay");
        const addClose = app.querySelector("#addClose");
        const addBtn = app.querySelector("#addBtn");
        const aPersonInput = app.querySelector("#aPerson");
        const aType = app.querySelector("#aType");
        const seg = app.querySelector("#aTypeSeg");

        if(reqDateFilterEl){
          reqDateFilterEl.addEventListener("change", (e)=>{
            reqDateFilter = e.target.value || "";
            render();
          });
        }
        if(reqDeptSel){
          reqDeptSel.addEventListener("change", (e)=>{
            reqDeptFilter = e.target.value || "전체";
            render();
          });
        }
        if(reqStatusSel){
          reqStatusSel.addEventListener("change", (e)=>{
            reqStatusFilter = e.target.value || "전체";
            render();
          });
        }
        if(logDateFilterEl){
          logDateFilterEl.addEventListener("change", (e)=>{
            logDateFilter = e.target.value || "";
            render();
          });
        }
        if(logTypeSel){
          logTypeSel.addEventListener("change", (e)=>{
            logTypeFilter = e.target.value;
            render();
          });
        }
        if(logDeptSel){
          logDeptSel.addEventListener("change", (e)=>{
            logDeptFilter = e.target.value;
            render();
          });
        }

        app.querySelectorAll("[data-row]").forEach(row => {
          row.addEventListener("click", ()=>{
            const key = row.dataset.row;
            const kind = row.dataset.kind;
            const targetSet = kind === "request" ? selectedRequestKeys : selectedLogKeys;
            if(targetSet.has(key)) targetSet.delete(key);
            else targetSet.add(key);
            render();
          });
        });

        const approveRequestsBtn = app.querySelector("#approveRequestsBtn");
        if(approveRequestsBtn){
          approveRequestsBtn.addEventListener("click", async ()=>{
            const rows = (it.requests || []).filter(r => selectedRequestKeys.has(r.__key));
            const approvableRows = rows.filter(r => {
              const status = r.status || "pending";
              return status === "pending" || status === "rejected";
            });

            if(approvableRows.length === 0){
              alert("승인할 요청 내역을 선택해주세요.");
              return;
            }

            const approverEmail = await getCurrentUserEmail();

            try{
              for(const r of approvableRows){
                if(!r._dbid){
                  throw new Error("DB 요청 ID가 없습니다.");
                }
                await approveRequestByRpc(r._dbid, approverEmail || "");
              }

              await maybePromptOneSignalPermission();
              await loadAllFromDB_FORCE();
              selectedRequestKeys.clear();
              render();
            }catch(err){
              console.error(err);
              alert("요청 승인 반영 실패: " + (err?.message || err));
              DB.mode = "error";
              DB.lastError = String(err?.message || err);
            }
          });
        }

        const rejectRequestsBtn = app.querySelector("#rejectRequestsBtn");
        if(rejectRequestsBtn){
          rejectRequestsBtn.addEventListener("click", async ()=>{
            const rows = (it.requests || []).filter(r => selectedRequestKeys.has(r.__key));
            const pendingRows = rows.filter(r => (r.status || "pending") === "pending");
            if(pendingRows.length === 0){
              alert("반려할 요청 내역을 선택해주세요.");
              return;
            }

            const approverEmail = await getCurrentUserEmail();

            try{
              for(const r of pendingRows){
                if(!r._dbid){
                  throw new Error("DB 요청 ID가 없습니다.");
                }
                await rejectRequestByRpc(r._dbid, approverEmail || "");
              }

              await loadAllFromDB_FORCE();
              selectedRequestKeys.clear();
              render();
            }catch(err){
              console.error(err);
              alert("요청 반려 반영 실패: " + (err?.message || err));
              DB.mode = "error";
              DB.lastError = String(err?.message || err);
            }
          });
        }

        const bulkDeleteRequests = app.querySelector("#bulkDeleteRequests");
        if(bulkDeleteRequests){
          bulkDeleteRequests.addEventListener("click", async ()=>{
            if(selectedRequestKeys.size === 0){
              alert("삭제할 신청 내역을 선택해주세요.");
              return;
            }
            const rowsToDelete = (it.requests || []).filter(r => selectedRequestKeys.has(r.__key));
            it.requests = (it.requests || []).filter(r => !selectedRequestKeys.has(r.__key));
            selectedRequestKeys.clear();
            saveAllLocal();
            try{
              await deleteRequestsByKeys(it.id, rowsToDelete);
            }catch(err){
              console.error(err);
              alert("DB에서 신청 내역 삭제에 실패했습니다.");
            }
            render();
          });
        }

        const bulkDeleteLogs = app.querySelector("#bulkDeleteLogs");
        if(bulkDeleteLogs){
          bulkDeleteLogs.addEventListener("click", async ()=>{
            if(selectedLogKeys.size === 0){
              alert("삭제할 내역을 선택해주세요.");
              return;
            }
            const keys = Array.from(selectedLogKeys);
            it.logs = (it.logs || []).filter(r => !selectedLogKeys.has(r.__key));
            selectedLogKeys.clear();
            saveAllLocal();
            try{
              await deleteLogsByKeys(it.id, keys);
            }catch(err){
              console.error(err);
              alert("DB에서 내역 삭제에 실패했습니다.");
            }
            render();
          });
        }

        if(isAdmin){
          const deleteItemBtn = app.querySelector("#deleteItemBtn");
          if(deleteItemBtn) deleteItemBtn.addEventListener("click", handleDeleteItem);

          const editBaseStockBtn = app.querySelector("#editBaseStockBtn");
          const baseStockEditRow = app.querySelector("#baseStockEditRow");
          const baseStockInput = app.querySelector("#baseStockInput");
          const saveBaseStockBtn = app.querySelector("#saveBaseStockBtn");
          const cancelBaseStockBtn = app.querySelector("#cancelBaseStockBtn");

          function openBaseStockEditor(){
            if(!baseStockEditRow || !baseStockInput) return;
            baseStockEditRow.classList.add("show");
            baseStockInput.value = String(Number(it.baseStock || 0));
            requestAnimationFrame(()=>{
              baseStockInput.focus();
              baseStockInput.select();
            });
          }

          function closeBaseStockEditor(){
            if(!baseStockEditRow || !baseStockInput) return;
            baseStockEditRow.classList.remove("show");
            baseStockInput.value = String(Number(it.baseStock || 0));
          }

          if(editBaseStockBtn){
            editBaseStockBtn.addEventListener("click", (e)=>{
              e.preventDefault();
              e.stopPropagation();
              openBaseStockEditor();
            });
          }

          if(cancelBaseStockBtn){
            cancelBaseStockBtn.addEventListener("click", (e)=>{
              e.preventDefault();
              e.stopPropagation();
              closeBaseStockEditor();
            });
          }

          if(saveBaseStockBtn){
            saveBaseStockBtn.addEventListener("click", async (e)=>{
              e.preventDefault();
              e.stopPropagation();

              const next = Number((baseStockInput?.value || "").trim());
              if(!Number.isFinite(next) || next < 0){
                alert("기존재고는 0 이상의 숫자만 입력해주세요.");
                return;
              }

              try{
                await updateItemBaseStock(it.id, next);
                await loadAllFromDB_FORCE();
                closeBaseStockEditor();
                render();
              }catch(err){
                console.error(err);
                alert("기존재고 저장 실패: " + (err?.message || err));
                DB.mode = "error";
                DB.lastError = String(err?.message || err);
              }
            });
          }

          if(baseStockInput){
            baseStockInput.addEventListener("keydown", async (e)=>{
              if(e.key === "Enter"){
                e.preventDefault();
                saveBaseStockBtn?.click();
              }
              if(e.key === "Escape"){
                e.preventDefault();
                closeBaseStockEditor();
              }
            });
          }
        }

        function openAddModal(){
          addModal.classList.add("show");
          document.body.style.overflow = "hidden";
          const aDate = app.querySelector("#aDate");
          if(aDate && !aDate.value) aDate.value = getToday();
        }

        function closeAddModal(){
          addModal.classList.remove("show");
          document.body.style.overflow = "";
        }

        if(openRequestBtn) openRequestBtn.addEventListener("click", openAddModal);
        addOverlay?.addEventListener("click", closeAddModal);
        addClose?.addEventListener("click", closeAddModal);

        if(aPersonInput){
          aPersonInput.addEventListener("blur", ()=> setNameTitleIfNeeded(aPersonInput));
        }

        if(seg && aType){
          function setType(v){
            aType.value = v;
            seg.querySelectorAll("button").forEach(b => {
              const on = b.dataset.v === v;
              b.classList.toggle("active", on);
              b.classList.toggle("out", b.dataset.v === "출고");
              b.classList.toggle("in", b.dataset.v === "입고");
            });
          }
          seg.querySelectorAll("button").forEach(b => b.addEventListener("click", ()=> setType(b.dataset.v)));
        }

        addBtn?.addEventListener("click", async ()=>{
          const d = app.querySelector("#aDate").value;
          const dept = app.querySelector("#aDept").value;
          const person = (app.querySelector("#aPerson").value || "").trim();
          const qty = Number((app.querySelector("#aQty").value || "").trim());
          const t = isRequest ? "신청" : app.querySelector("#aType").value;

          if(!d){ alert("날짜를 선택해주세요."); return; }
          if(!Number.isFinite(qty) || qty <= 0){ alert("수량은 0보다 큰 숫자여야 합니다."); return; }

          const row = normalizeLog({ d, t, dept, person: person || "(입력)", qty });

          try{
            if(isRequest){
              it.requests = it.requests || [];
              it.requests.push(row);
              saveAllLocal();
              const inserted = await addRequestToDB(it, row);
              if(inserted?.id){
                row._dbid = inserted.id;
                row.__key = `req_${inserted.id}`;
              }
              if(inserted?.created_at) row.d = inserted.created_at;
              alert(`신청이 접수되었습니다. 재고는 관리자 반영 후 변경됩니다.`);
            }else{
              it.logs = it.logs || [];
              it.logs.push(row);
              saveAllLocal();
              await addLogToDB(it.id, row);
            }
          }catch(err){
            console.error(err);
            alert(isRequest
              ? `신청 저장 실패: ${err?.message || err}`
              : `DB 저장 실패: ${err?.message || err}`);
            DB.mode = "error";
            DB.lastError = String(err?.message || err);
          }

          app.querySelector("#aQty").value = "";
          app.querySelector("#aPerson").value = "";
          closeAddModal();
          render();
        });
      }

      async function handleDeleteItem(){
        const itemName = (it.name || "해당 품목");
        const ok = confirm(`정말 "${itemName}" 품목을 삭제하시겠습니까?`);
        if(!ok) return;

        removeItemLocal(it.id);

        try{
          await deleteItemFromDB(it.id);
        }catch(err){
          console.error(err);
          alert(`DB에서 품목 삭제에 실패했습니다. (로컬에서는 삭제됨)\n권한/RLS 설정을 확인해주세요.`);
          DB.mode = "error";
          DB.lastError = String(err?.message || err);
        }

        if(q) q.value = "";
        location.hash = "#/admin";
        router();
      }

      render();
    }

    async function updateFabVisibility(){
      const hash = location.hash || "#/login";
      const hideFab = ["#/login", "#/signup", "#/find-id", "#/reset-password", "#/"] .includes(hash)
        || hash === "#/admin"
        || /^#\/admin\//.test(hash)
        || hash === "#/list"
        || /^#\/list\//.test(hash)
        || hash === "#/shop"
        || /^#\/shop\//.test(hash);

    }

    async function router(){
      await updateFabVisibility();

      const hash = location.hash || "#/login";
      const isPublicAuthPage = ["#/login", "#/signup", "#/reset-password"].includes(hash);

      if(!isHomeLoggedIn() && !isPublicAuthPage){
        location.hash = "#/login";
        return;
      }

      const shopItem = hash.match(/^#\/shop\/item\/(.+)$/);
      const adminShopItem = hash.match(/^#\/admin\/shop\/item\/(.+)$/);
      const requestItem = hash.match(/^#\/request\/item\/(.+)$/);
      const requestCatalogApply = hash.match(/^#\/request\/catalog\/([^/]+)\/apply$/);
      const requestCatalog = hash.match(/^#\/request\/catalog\/([^/]+)$/);
      const adminItem = hash.match(/^#\/admin\/item\/(.+)$/);
      const listItem = hash.match(/^#\/list\/item\/(.+)$/);

      if(hash === "#/login"){
        renderLoginPage();
      }else if(hash === "#/signup"){
        renderSignupPage();
      }else if(hash === "#/reset-password"){
        renderResetPasswordPage();
      }else if(hash === "#/" || hash === ""){
        await renderMainHome();
      }else if(hash === "#/shop"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopListPage();
      }else if(hash === "#/shop/account"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopAccountPage();
      }else if(hash === "#/shop/orders"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopOrdersPage();
      }else if(hash === "#/shop/cart"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopCartPage();
      }else if(adminShopItem){
        const ok = await isAdminUser();
        if(!ok){ alert("관리자 권한이 없습니다."); location.hash = "#/"; return; }
        await renderShopAdminDetailPage(decodeURIComponent(adminShopItem[1]));
      }else if(shopItem){
        renderShopDetailPage(decodeURIComponent(shopItem[1]));
      }else if(hash === "#/request"){
        const ok = await isAdminUser();
        if(ok){
          location.hash = "#/admin";
          return;
        }
        renderHome("request");
      }else if(requestCatalogApply){
        // 도록 신청하기 제거: 기존 링크/북마크로 접근해도 신청 페이지로 돌려보냄
        location.hash = "#/request";
        return;
      }else if(requestCatalog){
        // 도록 신청하기 제거: 기존 링크/북마크로 접근해도 신청 페이지로 돌려보냄
        location.hash = "#/request";
        return;
      }else if(hash === "#/list"){
        renderHome("list");
      }else if(hash === "#/admin"){
        const ok = await isAdminUser();
        if(!ok){
          alert("관리자 권한이 없습니다.");
          location.hash = "#/";
          return;
        }
        renderHome("admin");
      }else if(requestItem){
        renderDetail(decodeURIComponent(requestItem[1]), "request");
      }else if(adminItem){
        const ok = await isAdminUser();
        if(!ok){
          alert("관리자 권한이 없습니다.");
          location.hash = "#/";
          return;
        }
        renderDetail(decodeURIComponent(adminItem[1]), "admin");
      }else if(listItem){
        renderDetail(decodeURIComponent(listItem[1]), "list");
      }else{
        await renderMainHome();
      }
    }

    function openItemModal(prefillCategory){
      itemModal?.classList.add("show");
      document.body.style.overflow = "hidden";
      if(prefillCategory && nCategory) nCategory.value = prefillCategory;
      if(nBase && !nBase.value) nBase.value = "1000";
      setTimeout(()=>{ (nName?.value ? nSize : nName)?.focus?.(); }, 30);
    }

    function closeItemModal(){
      itemModal?.classList.remove("show");
      document.body.style.overflow = "";
    }

    function getToday(){
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    function setNameTitleIfNeeded(input){
      if(!input) return;
      input.value = (input.value || "").trim();
    }

    itemOverlay?.addEventListener("click", closeItemModal);
    itemClose?.addEventListener("click", closeItemModal);

    createItemBtn?.addEventListener("click", async ()=>{
      const category = (nCategory?.value || "").trim();
      const name = (nName?.value || "").trim();
      const size = (nSize?.value || "").trim();
      const base = Number(String(nBase?.value || "").replace(/,/g,""));
      const imageFile = nImgFile?.files?.[0] || null;

      if(!category){ alert("카테고리를 입력해주세요."); return; }
      if(!name){ alert("품목명을 입력해주세요."); return; }
      if(!Number.isFinite(base) || base < 0){ alert("기준재고는 0 이상 숫자여야 합니다."); return; }

      const sec = ensureCategory(category);
      if(!sec){ alert("카테고리 생성에 실패했습니다."); return; }

      const baseId = slugifyId(`${category}-${name}-${size}`);
      let id = baseId;
      let n = 2;
      while(findItemById(id)){
        id = `${baseId}-${n++}`;
      }

      let uploadedImageUrl = null;

      if(imageFile){
        try{
          uploadedImageUrl = await uploadItemImage(imageFile, id);
        }catch(err){
          console.error(err);
          alert("이미지 업로드에 실패했습니다.\nStorage 버킷/권한 설정을 확인해주세요.");
          return;
        }
      }

      const newItem = {
        id,
        name,
        size,
        baseStock: base,
        img: uploadedImageUrl || null,
        images: [uploadedImageUrl || null, null],
        logs: [],
        requests: []
      };

      sec.items = sec.items || [];
      sec.items.push(newItem);

      saveAllLocal();

      try{
        await saveItemToDB(newItem, category);
      }catch(err){
        console.error(err);
        DB.mode = "error";
        DB.lastError = String(err?.message || err);
        alert("품목은 추가되었지만 DB 저장에 실패했습니다. (로컬에는 저장됨)\n권한/RLS 설정을 확인해주세요.");
      }

      nCategory.value = "";
      nName.value = "";
      nSize.value = "";
      nBase.value = "";
      if(nImgFile) nImgFile.value = "";
      if(nImgFileName) nImgFileName.textContent = "선택된 파일 없음";
      if(nImgPreview) nImgPreview.removeAttribute("src");
      if(nImgPreviewBox) nImgPreviewBox.style.display = "none";

      closeItemModal();

      if(q) q.value = "";
      location.hash = "#/admin";
      router();
    });

    doSearch?.addEventListener("click", async ()=>{
      const hash = location.hash || "#/";
      if(hash === "#/admin"){
        const ok = await isAdminUser();
        if(!ok){
          alert("관리자 권한이 없습니다.");
          location.hash = "#/";
          return;
        }
        renderHome("admin");
      }else if(hash === "#/list"){
        renderHome("list");
      }else{
        const ok = await isAdminUser();
        if(ok){
          location.hash = "#/admin";
          return;
        }
        renderHome("request");
      }
    });

    q?.addEventListener("keydown", async (e)=>{
      if(e.key === "Enter"){
        const hash = location.hash || "#/";
        if(hash === "#/admin"){
          const ok = await isAdminUser();
          if(!ok){
            alert("관리자 권한이 없습니다.");
            location.hash = "#/";
            return;
          }
          renderHome("admin");
        }else if(hash === "#/list"){
          renderHome("list");
        }else{
          const ok = await isAdminUser();
          if(ok){
            location.hash = "#/admin";
            return;
          }
          renderHome("request");
        }
      }
    });

    q?.addEventListener("input", async ()=>{
      const hash = location.hash || "#/";
      if(hash === "#/admin"){
        const ok = await isAdminUser();
        if(!ok){
          location.hash = "#/";
          return;
        }
        renderHome("admin");
      }else if(hash === "#/list"){
        renderHome("list");
      }else if(hash === "#/shop"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopListPage();
      }else if(hash === "#/shop/account"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopAccountPage();
      }else if(hash === "#/shop/cart"){
        const ok = await isAdminUser();
        if(ok) await renderShopAdminRequestsPage();
        else renderShopCartPage();
      }else if(/^#\/shop\/item\//.test(hash)){
        return;
      }else if(hash === "#/request"){
        const ok = await isAdminUser();
        if(ok){
          location.hash = "#/admin";
          return;
        }
        renderHome("request");
      }
    });

    homeLink?.addEventListener("click", (e)=>{
      const hash = location.hash || "";

      if(hash.startsWith("#/request") || hash.startsWith("#/shop")){
        e.preventDefault();
        if(q) q.value = "";
        location.hash = "#/request";
      }
    });
    
    navBack?.addEventListener("click", ()=>{
  const hash = location.hash || "";

  if(hash.startsWith("#/request/catalog/")){
    if(q) q.value = "";
    location.hash = "#/request";
    return;
  }

  history.back();
});

navForward?.addEventListener("click", ()=>{
  history.forward();
});

navHome?.addEventListener("click", ()=>{
  if(q) q.value = "";
  location.hash = "#/";
});

navReload?.addEventListener("click", ()=>{
  location.reload();
});

    window.addEventListener("hashchange", router);

    (async function boot(){
  console.log("[boot] 시작");
  loadAllLocal();

      if(!location.hash) location.hash = "#/login";

      renderLoginPage(); 
      document.body.classList.remove("preboot");

      const ok = initSupabase();
console.log("[boot] initSupabase 결과:", ok, "client:", supabaseClient);

if(!ok){
  DB.mode = "local";
  return;
}

      try{
        await syncHomeLoginSessionFromSupabase();
        await syncDefaultItemsToDB();
        await loadAllFromDB_FORCE();
      }catch(err){
        console.error("DB 로드 실패:", err);
        DB.mode = "error";
        DB.lastError = String(err?.message || err);
      }

      supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log("[auth] 상태변경", event, !!session);
        const authHashes = ["#/login", "#/signup", "#/find-id", "#/reset-password"];
        if(session && authHashes.includes(location.hash || "#/login")){
          location.hash = "#/";
          return;
        }
        if(!session && !authHashes.includes(location.hash || "#/login")){
          location.hash = "#/login";
        }
      });

      startRealtime();
      router();
    })();


window.addEventListener("error", function(e){
  console.error("JS 에러:", e.message, e.filename, e.lineno, e.colno);
});

/* ===== Catalogue page redesign override 2026-04-28 / fixed v4 layout ===== */

function __catalogRoundMeta(catalogId, year, round){
  const id = String(catalogId || "offline-auction");
  const y = String(year || "");
  const r = String(round || "");

  if(id === "offline-auction"){
    if(r.includes("191")) return { round:"191회", title:"제191회 미술품 경매 도록", date:"04/21(화)", image:"images/2604_191.jpg" };
    if(r.includes("190")) return { round:"190회", title:"제190회 미술품 경매 도록", date:"02/25(수)", image:"images/2602_190.jpg" };
    if(r.includes("189")) return { round:"189회", title:"제189회 미술품 경매 도록", date:"01/27(화)", image:"images/2601_189.jpg" };
    return { round:r || "-", title:`${y || "2026"} Major Auction 도록`, date:"", image:"" };
  }

  if(id === "contemporary-art-auction"){
    if(r.includes("6")) return { round:"6월 컨템", title:"6월 컨템포러리 아트 세일 도록", date:"06월", image:"images/2603_contem.jpg" };
    if(r.includes("3")) return { round:"3월 컨템", title:"3월 컨템포러리 아트 세일 도록", date:"03월", image:"images/2603_contem.jpg" };
    return { round:r || "-", title:`${y || "2026"} Contemporary Art Sale 도록`, date:"", image:"images/2603_contem.jpg" };
  }

  if(id === "zero-base"){
    if(r.includes("5")) return { round:"5월 화성", title:"제로베이스 도록", date:"5월", image:"images/2604_191.jpg" };
    return { round:r || "-", title:`${y || "2026"} Zero Base 도록`, date:"", image:"images/2604_191.jpg" };
  }

  return { round:r || "-", title:"도록", date:"", image:"" };
}

function __catalogYearResults(catalogId, year, round){
  const config = getUnifiedCatalogConfig(catalogId);
  const rounds = Array.isArray(config?.data?.[year]) ? config.data[year] : [];

  if(round){
    return [__catalogRoundMeta(catalogId, year, round)].filter(x => x && x.image);
  }

  return rounds
    .map(r => __catalogRoundMeta(catalogId, year, r))
    .filter(x => x && x.image);
}

function __goCatalogWholeSection(){
  location.hash = "#/request";
  setTimeout(() => {
    const el = document.querySelector(".catalogMenuSection");
    if(el){
      el.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  }, 180);
}

function renderCatalogDetail(catalogId){
  topbar.style.display = "flex";
  searchBox.style.display = "none";
  setTopbarRightSearch();
  if(topbarLogo) topbarLogo.classList.add("show");
  updateTopbarLogo();
  setTopTitleByMode("request");
  setBodyMode("request");

  const config = getUnifiedCatalogConfig(catalogId);
  if(!config){
    app.innerHTML = `<div class="paper"><div class="paper-head">알림</div><div class="paper-body">페이지를 찾을 수 없습니다.</div></div>`;
    return;
  }

  const allDepts = ["경영기획팀","인사팀","관재팀","재무팀","서비스운영팀","아카이브팀","대외협력팀","디자인팀","영업팀","브랜드기획팀","고객관리팀","작품관리팀","VIP사업기획팀","웹서비스개발팀"];
  let reqDateFilter = "";
  let reqDeptFilter = "전체";
  let reqStatusFilter = "전체";
  let selectedRequestKeys = new Set();
  let viewMode = sessionStorage.getItem(`catalog_view_${catalogId}`) || "gallery";

  function getRequestRows(){
    let rows = [...getCatalogRequests(catalogId)];
    if(reqDateFilter) rows = rows.filter(r => toISODateLike(r.d) === reqDateFilter);
    if(reqDeptFilter !== "전체") rows = rows.filter(r => (r.dept || "-") === reqDeptFilter);
    if(reqStatusFilter === "전체") rows = rows.filter(r => (r.status || "pending") !== "approved");
    else rows = rows.filter(r => (r.status || "pending") === reqStatusFilter);
    return sortByLatestDateAndKey(rows);
  }

  function tableRows(rows){
    if(rows.length === 0) return `<div class="logEmpty">내역이 없습니다.</div>`;
    return rows.map(r => {
      const key = r.__key;
      const selected = selectedRequestKeys.has(key);
      const statusText = requestStatusLabel(r.status);
      const statusClassName = requestStatusClass(r.status);
      return `
        <div class="logRow clickable ${selected ? "selected" : ""}" data-row="${escapeAttr(key)}" data-kind="request">
          <div class="logDate">${escapeHtml(formatKRDate(r.d))}</div>
          <div class="logType"><span class="typeBadge request">${escapeHtml(r.t || "신청")}</span></div>
          <div class="logDept">${escapeHtml(r.dept || "-")}</div>
          <div class="logType"><span class="typeBadge ${statusClassName}">${escapeHtml(statusText)}</span></div>
          <div class="logPerson">${escapeHtml(r.person || "-")}</div>
          <div class="logQty">${Number(r.qty || 0).toLocaleString()}개</div>
        </div>`;
    }).join("");
  }

  function resultCards(year, round){
    const results = __catalogYearResults(catalogId, year, round);
    const isRoundSelected = !!round;

    if(!year){
      return `<div class="catalogEmptyResult">연도를 선택한 뒤 검색해주세요.</div>`;
    }

    if(!results.length){
      return `<div class="catalogEmptyResult">해당 연도에 등록된 도록 이미지가 없습니다.</div>`;
    }

    if(isRoundSelected){
      const meta = results[0];
      return `
        <div class="catalogRoundDetailLayout">
          <div class="catalogRoundInfo">
            <div class="catalogYearBadge">${escapeHtml(year)}</div>
            <h3 class="catalogRoundTitle">${escapeHtml(meta.title || "")}</h3>
            <p class="catalogRoundDate">${escapeHtml(meta.date || meta.round || "")}</p>
            <button class="catalogRoundApplyBtn" type="button" data-result-round="${escapeAttr(meta.round || "")}">신청하기</button>
          </div>

          <button class="catalogRoundImageBtn" type="button" data-result-round="${escapeAttr(meta.round || "")}">
            <div class="catalogRoundImage">${renderSmartImage(meta.image, meta.title)}</div>
          </button>
        </div>
      `;
    }

    return `
      <div class="catalogResultGrid yearOnly">
        ${results.map(meta => `
          <button class="catalogResultCard yearOnlyCard" type="button" data-result-round="${escapeAttr(meta.round || "")}">
            <div class="catalogResultCardImg">${renderSmartImage(meta.image, meta.title)}</div>
          </button>
        `).join("")}
      </div>
    `;
  }

  function render(){
    const selected = getCatalogApplySelection(catalogId);
    const yearList = Object.keys(config.data || {});
    const currentYear = selected?.year || "";
    const roundList = Array.isArray(config.data?.[currentYear]) ? config.data[currentYear] : [];
    const currentRound = selected?.round || "";
    const activeRound = roundList.includes(currentRound) ? currentRound : "";
    const requestRows = getRequestRows();
    const isRoundSelected = viewMode === "result" && !!activeRound;

    const galleryImages = Array.isArray(config.galleryImages) && config.galleryImages.length
      ? config.galleryImages
      : ["images/2601_189.jpg","images/2602_190.jpg","images/2603_contem.jpg","images/2604_191.jpg"];

    const galleryHtml = Array.from({ length: 12 }, (_, idx) => {
      const imagePath = galleryImages[idx % galleryImages.length] || "";
      return `<button class="catalogGalleryItem" type="button" data-catalog-cover="${idx}">${imagePath ? renderSmartImage(imagePath, `${config.title || "Catalog"} ${idx + 1}`) : `<div class="catalogGalleryPlaceholder">IMAGE</div>`}</button>`;
    }).join("");

    const yearOptions = [
      `<option value="">연도</option>`,
      ...yearList.map(year => `<option value="${escapeAttr(year)}" ${currentYear === year ? "selected" : ""}>${escapeHtml(year)}</option>`)
    ].join("");

    const roundOptions = [
      `<option value="">-</option>`,
      ...roundList.map(round => `<option value="${escapeAttr(round)}" ${activeRound === round ? "selected" : ""}>${escapeHtml(round)}</option>`)
    ].join("");

    app.innerHTML = `
      <div class="paper detailPaper requestDetailPaper"></div>
      <div class="paper-body detailPaperBody">
        <div class="catalogDetailPage">
          <div class="catalogDetailTop">
            <button class="catalogDetailTitle catalogWholeBackBtn" type="button" id="catalogWholeBackBtn">
              <span class="catalogTitleKr">도록</span><span class="catalogTitleDivider">|</span><span class="catalogTitleEn">Catalogue</span>
            </button>
          </div>

          <div class="catalogControlLabel">선택</div>
          <div class="catalogDetailControlRow">
            <div class="catalogSelectWrap"><select class="catalogSelect" id="catalogTypeSelect">${(config.typeOptions || getUnifiedCatalogOptions()).map(opt => `<option value="${escapeAttr(opt.id)}" ${String(config.id || "") === String(opt.id) ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}</select><span class="catalogSelectArrow">▼</span></div>
            <div class="catalogSelectWrap"><select class="catalogSelect" id="catalogYearSelect">${yearOptions}</select><span class="catalogSelectArrow">▼</span></div>
            <div class="catalogSelectWrap"><select class="catalogSelect" id="catalogRoundSelect">${roundOptions}</select><span class="catalogSelectArrow">▼</span></div>
            <div class="catalogDetailAction"><button class="catalogDetailSubmit" id="catalogSearchBtn" type="button">검색하기</button></div>
          </div>

          ${viewMode === "result" ? `
            <div class="catalogResultView">
              ${resultCards(currentYear, activeRound)}
            </div>` : `
            <div class="catalogGalleryGrid catalogGridView">${galleryHtml}</div>`}
        </div>

        ${true ? `
        <div class="detailSectionBlock">
          <div class="boxTitleRow detailSectionHead">
            <p class="boxTitle">신청 내역</p>
            <div class="requestAdminActions"><button class="selDelBtn" id="catalogBulkDeleteRequests" type="button">삭제</button></div>
          </div>
          <div class="logBox requestLogBox requestTable">
            <div class="logMinWidth">
              <div class="logHead subtleHead">
                <div class="logHeadCell"><div class="logHeadLabel">연도. 월. 일.</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">구분</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">전체 부서</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">전체 상태</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
              </div>
              ${tableRows(requestRows)}
            </div>
          </div>
        </div>` : ``}
      </div>

      <div class="modal" id="catalogAddModal" aria-hidden="true">
        <div class="modalOverlay" id="catalogAddOverlay"></div>
        <div class="sheet" role="dialog" aria-modal="true" aria-label="출고 신청하기">
          <div class="sheetHead"><div>출고 신청하기</div><button class="sheetClose" id="catalogAddClose">닫기</button></div>
          <div class="sheetBody">
            <div class="field"><label for="catalogAddDate">날짜</label><input type="date" id="catalogAddDate"></div>
            <input type="hidden" id="catalogAddType" value="신청">
            <div class="field"><label for="catalogAddDept">부서</label><select id="catalogAddDept">${allDepts.map(d => `<option value="${escapeAttr(d)}">${escapeHtml(d)}</option>`).join("")}</select></div>
            <div class="field"><label for="catalogAddQty">수량</label><input id="catalogAddQty" inputmode="numeric" placeholder="예) 100" /></div>
            <div class="field"><label for="catalogAddPerson">담당자</label><input id="catalogAddPerson" placeholder="" /></div>
          </div>
          <div class="sheetFoot"><button class="btn primary" id="catalogAddBtn">출고 신청하기</button></div>
        </div>
      </div>`;

    const typeSelect = app.querySelector("#catalogTypeSelect");
    const yearSelect = app.querySelector("#catalogYearSelect");
    const roundSelect = app.querySelector("#catalogRoundSelect");
    const searchBtn = app.querySelector("#catalogSearchBtn");
    const catalogAddModal = app.querySelector("#catalogAddModal");
    const catalogAddOverlay = app.querySelector("#catalogAddOverlay");
    const catalogAddClose = app.querySelector("#catalogAddClose");
    const catalogAddBtn = app.querySelector("#catalogAddBtn");
    const catalogAddDate = app.querySelector("#catalogAddDate");

    function openCatalogRequestModal(){
      if(!catalogAddModal) return;
      catalogAddModal.classList.add("show");
      document.body.style.overflow = "hidden";
      if(catalogAddDate && !catalogAddDate.value) catalogAddDate.value = new Date().toISOString().slice(0, 10);
    }

    function closeCatalogRequestModal(){
      if(!catalogAddModal) return;
      catalogAddModal.classList.remove("show");
      document.body.style.overflow = "";
    }

    app.querySelector("#catalogWholeBackBtn")?.addEventListener("click", __goCatalogWholeSection);

    typeSelect?.addEventListener("change", ()=>{
      const nextType = typeSelect.value || "offline-auction";
      sessionStorage.removeItem(`catalog_view_${nextType}`);
      saveCatalogApplySelection(nextType, { year:"", round:"" });
      location.hash = `#/request/catalog/${encodeURIComponent(nextType)}`;
    });

    yearSelect?.addEventListener("change", ()=>{
      const nextYear = yearSelect.value || "";
      saveCatalogApplySelection(catalogId, {
        ...getCatalogApplySelection(catalogId),
        year: nextYear,
        round: ""
      });
      sessionStorage.setItem(`catalog_view_${catalogId}`, "gallery");
      viewMode = "gallery";
      render();
    });

    roundSelect?.addEventListener("change", ()=>{
      saveCatalogApplySelection(catalogId, {
        ...getCatalogApplySelection(catalogId),
        year: yearSelect?.value || "",
        round: roundSelect.value || ""
      });
    });

    searchBtn?.addEventListener("click", ()=>{
      const year = yearSelect?.value || "";
      const round = roundSelect?.value || "";
      if(!year){
        alert("연도를 선택해주세요.");
        return;
      }

      saveCatalogApplySelection(catalogId, { year, round });
      sessionStorage.setItem(`catalog_view_${catalogId}`, "result");
      viewMode = "result";
      render();
    });

    app.querySelectorAll("[data-catalog-cover]").forEach(btn => {
      btn.addEventListener("click", ()=>{
        const year = yearSelect?.value || currentYear || "2026";
        const nextRounds = Array.isArray(config.data?.[year]) ? config.data[year] : [];
        const round = roundSelect?.value || nextRounds[0] || "";
        saveCatalogApplySelection(catalogId, { year, round });
        sessionStorage.setItem(`catalog_view_${catalogId}`, "result");
        viewMode = "result";
        render();
      });
    });

    app.querySelectorAll("[data-result-round]").forEach(btn => {
      btn.addEventListener("click", ()=>{
        const year = yearSelect?.value || currentYear || "";
        const round = btn.dataset.resultRound || "";
        if(!round) return;
        saveCatalogApplySelection(catalogId, { year, round, currentStock:Number(config.currentStock || 0) });
        sessionStorage.setItem(`catalog_view_${catalogId}`, "result");
        viewMode = "result";
        render();
        setTimeout(openCatalogRequestModal, 80);
      });
    });

    catalogAddOverlay?.addEventListener("click", closeCatalogRequestModal);
    catalogAddClose?.addEventListener("click", closeCatalogRequestModal);

    catalogAddBtn?.addEventListener("click", async ()=>{
      const selectedInfo = getCatalogApplySelection(catalogId);
      const date = app.querySelector("#catalogAddDate")?.value || "";
      const dept = app.querySelector("#catalogAddDept")?.value || "";
      const qty = Number(app.querySelector("#catalogAddQty")?.value || 0);
      const person = (app.querySelector("#catalogAddPerson")?.value || "").trim();
      const year = selectedInfo?.year || yearSelect?.value || "";
      const round = selectedInfo?.round || roundSelect?.value || "";

      if(!date || !dept || !qty || !person){ alert("모든 항목을 입력해주세요."); return; }
      if(!Number.isFinite(qty) || qty <= 0){ alert("수량은 0보다 큰 숫자로 입력해주세요."); return; }

      const rows = getCatalogRequests(catalogId);
      const row = normalizeLog({ d: date, t: "신청", dept, person, qty, status:"pending", year, round, currentStock:Number(config.currentStock || 0) });

      try{
        const inserted = await addCatalogRequestToDB(catalogId, row);
        if(inserted?.id){
          row._dbid = inserted.id;
          row.__key = `catalog_req_${inserted.id}`;
        }
        rows.push(row);
        saveCatalogRequests(catalogId, rows);
        closeCatalogRequestModal();
        render();
        alert("출고 신청이 접수되었습니다.");
      }catch(err){
        console.error("도록 신청 DB 저장 실패:", err);
        alert("DB 저장 중 오류가 발생했습니다.");
      }
    });

    app.querySelectorAll('.logRow.clickable[data-kind="request"]').forEach(rowEl => {
      rowEl.addEventListener("click", ()=>{
        const key = rowEl.dataset.row;
        if(selectedRequestKeys.has(key)) selectedRequestKeys.delete(key);
        else selectedRequestKeys.add(key);
        rowEl.classList.toggle("selected");
      });
    });

    app.querySelector("#catalogBulkDeleteRequests")?.addEventListener("click", async ()=>{
      if(selectedRequestKeys.size === 0){ alert("삭제할 내역을 선택해주세요."); return; }

      const currentRows = getCatalogRequests(catalogId);
      const rowsToDelete = currentRows.filter(r => selectedRequestKeys.has(r.__key));
      const nextRows = currentRows.filter(r => !selectedRequestKeys.has(r.__key));

      try{
        await deleteCatalogRequestsByKeys(catalogId, rowsToDelete);
        saveCatalogRequests(catalogId, nextRows);
        selectedRequestKeys.clear();
        render();
      }catch(err){
        console.error("도록 신청내역 DB 삭제 실패:", err);
        alert("DB 삭제 중 오류가 발생했습니다.");
      }
    });
  }

  render();
  syncCatalogRequestsFromDB(catalogId).then((changed)=>{
    if(changed) render();
  }).catch(err => console.error("도록 신청내역 DB 동기화 실패:", err));
}



/* ===== FINAL DIRECT FIX: 물품재고현황 도록 카드 클릭 시 신청 폼 열기 ===== */
(function(){
  const STOCK_CATALOG_PAYLOADS = {
    "offline-auction": { year:"2026", round:"191회", currentStock:10 },
    "contemporary-art-auction": { year:"2026", round:"3월 컨템", currentStock:5 },
    "zero-base": { year:"2026", round:"5월 화성", currentStock:5 }
  };

  function getStockCatalogTitle(catalogId){
    if(catalogId === "contemporary-art-auction") return "도록 | Contemporary Art Sale";
    if(catalogId === "zero-base") return "도록 | Zero Base";
    return "도록 | Major Auction";
  }

  function ensureStockCatalogApplyModal(){
    let modal = document.getElementById("stockCatalogApplyModal");
    if(modal) return modal;

    const depts = ["경영기획팀","인사팀","관재팀","재무팀","서비스운영팀","아카이브팀","대외협력팀","디자인팀","영업팀","브랜드기획팀","고객관리팀","작품관리팀","VIP사업기획팀","웹서비스개발팀"];

    modal = document.createElement("div");
    modal.className = "modal stockCatalogApplyModal";
    modal.id = "stockCatalogApplyModal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="modalOverlay" data-stock-catalog-close="1"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="출고 신청하기">
        <div class="sheetHead">
          <div>출고 신청하기</div>
          <button class="sheetClose" type="button" data-stock-catalog-close="1">닫기</button>
        </div>
        <div class="sheetBody">
          <div class="field"><label>도록</label><input id="stockCatalogApplyTitle" readonly></div>
          <div class="field"><label>날짜</label><input type="date" id="stockCatalogApplyDate"></div>
          <div class="field"><label>부서</label><select id="stockCatalogApplyDept">${depts.map(d => `<option value="${d}">${d}</option>`).join("")}</select></div>
          <div class="field"><label>수량</label><input id="stockCatalogApplyQty" inputmode="numeric" placeholder="예) 100"></div>
          <div class="field"><label>담당자</label><input id="stockCatalogApplyPerson" placeholder=""></div>
        </div>
        <div class="sheetFoot"><button class="btn primary" id="stockCatalogApplySubmit" type="button">출고 신청하기</button></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", async function(e){
      if(e.target.closest("[data-stock-catalog-close]")){
        closeStockCatalogApplyModal();
        return;
      }

      const submit = e.target.closest("#stockCatalogApplySubmit");
      if(!submit) return;

      const catalogId = modal.dataset.catalogId || "offline-auction";
      const payload = STOCK_CATALOG_PAYLOADS[catalogId] || STOCK_CATALOG_PAYLOADS["offline-auction"];

      const date = modal.querySelector("#stockCatalogApplyDate")?.value || "";
      const dept = modal.querySelector("#stockCatalogApplyDept")?.value || "";
      const qty = Number(modal.querySelector("#stockCatalogApplyQty")?.value || 0);
      const person = (modal.querySelector("#stockCatalogApplyPerson")?.value || "").trim();

      if(!date || !dept || !qty || !person){
        alert("모든 항목을 입력해주세요.");
        return;
      }

      if(!Number.isFinite(qty) || qty <= 0){
        alert("수량은 0보다 큰 숫자로 입력해주세요.");
        return;
      }

      try{
        const row = normalizeLog({
          d: date,
          t: "신청",
          dept,
          person,
          qty,
          status: "pending",
          year: payload.year,
          round: payload.round,
          currentStock: payload.currentStock
        });

        const rows = getCatalogRequests(catalogId);
        try{
          const inserted = await addCatalogRequestToDB(catalogId, row);
          if(inserted?.id){
            row._dbid = inserted.id;
            row.__key = `catalog_req_${inserted.id}`;
          }
        }catch(dbErr){
          console.error("도록 신청 DB 저장 실패, 로컬 저장으로 진행:", dbErr);
        }

        rows.push(row);
        saveCatalogRequests(catalogId, rows);
        closeStockCatalogApplyModal();
        alert("출고 신청이 접수되었습니다.");
      }catch(err){
        console.error("도록 신청 저장 실패:", err);
        alert("신청 저장 중 오류가 발생했습니다.");
      }
    });

    return modal;
  }

  function openStockCatalogApplyModal(catalogId){
    const modal = ensureStockCatalogApplyModal();
    const payload = STOCK_CATALOG_PAYLOADS[catalogId] || STOCK_CATALOG_PAYLOADS["offline-auction"];

    modal.dataset.catalogId = catalogId;
    modal.querySelector("#stockCatalogApplyTitle").value = `${getStockCatalogTitle(catalogId)} / ${payload.year} / ${payload.round}`;
    modal.querySelector("#stockCatalogApplyDate").value = new Date().toISOString().slice(0,10);
    modal.querySelector("#stockCatalogApplyQty").value = "";
    modal.querySelector("#stockCatalogApplyPerson").value = "";

    try{
      saveCatalogApplySelection(catalogId, payload);
    }catch(err){}

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeStockCatalogApplyModal(){
    const modal = document.getElementById("stockCatalogApplyModal");
    if(!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function(e){
    const card = e.target.closest("[data-stock-catalog-apply]");
    if(!card) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const catalogId = card.getAttribute("data-stock-catalog-apply") || "offline-auction";
    openStockCatalogApplyModal(catalogId);
  }, true);
})();

/* ===== PATCH: catalog admin approve/reject/delete mirrors item request detail ===== */
async function upsertCatalogStockToDB(catalogId, year, round, nextStock){
  if(!dbReady()) return;
  const payload = {
    catalog_id: catalogId,
    catalog_title: getCatalogDisplayTitle(catalogId),
    catalog_year: String(year || ""),
    catalog_round: String(round || ""),
    updated_at: new Date().toISOString()
  };
  const { error } = await supabaseClient
    .from(DB_CATALOG_STOCKS)
    .upsert(payload, { onConflict: "catalog_id,catalog_year,catalog_round" });
  if(error) throw error;
}

async function updateCatalogRequestStatusById(requestId, status, approvedBy){
  if(!dbReady()) return;
  const numericId = Number(requestId);
  if(!Number.isFinite(numericId)) throw new Error("도록 신청 ID가 올바르지 않습니다.");
  const nowIso = new Date().toISOString();
  const payload = status === "approved"
    ? { status:"approved", approved_at:nowIso, approved_by:approvedBy || "", rejected_at:null, rejected_by:null }
    : { status:"rejected", rejected_at:nowIso, rejected_by:approvedBy || "" };
  const { error } = await supabaseClient
    .from(DB_CATALOG_REQUESTS)
    .update(payload)
    .eq("id", numericId);
  if(error) throw error;
}

async function approveCatalogRequestRow(catalogId, row, approvedBy){
  if(!row) return;
  const year = String(row.year || "");
  const round = String(row.round || "");
  const qty = Number(row.qty || 0);
  const dbStock = await getCatalogStockFromDB(catalogId, year, round);
  const before = Number(dbStock || row.currentStock || 0);
  const nextStock = Math.max(0, before - qty);
  await upsertCatalogStockToDB(catalogId, year, round, nextStock);
  if(row._dbid) await updateCatalogRequestStatusById(row._dbid, "approved", approvedBy);
  row.status = "approved";
  row.approved_at = new Date().toISOString();
  row.approved_by = approvedBy || "";
  row.currentStock = nextStock;
}

async function rejectCatalogRequestRow(row, approvedBy){
  if(!row) return;
  if(row._dbid) await updateCatalogRequestStatusById(row._dbid, "rejected", approvedBy);
  row.status = "rejected";
  row.rejected_at = new Date().toISOString();
  row.rejected_by = approvedBy || "";
}

async function renderCatalogDetail(catalogId){
  topbar.style.display = "flex";
  searchBox.style.display = "none";
  setTopbarRightSearch();
  if(topbarLogo) topbarLogo.classList.add("show");
  updateTopbarLogo();
  setTopTitleByMode("request");
  setBodyMode("request");

  const config = getUnifiedCatalogConfig(catalogId);
  const isAdmin = await isAdminUser();
  if(!config){
    app.innerHTML = `<div class="paper"><div class="paper-head">알림</div><div class="paper-body">페이지를 찾을 수 없습니다.</div></div>`;
    return;
  }

  const allDepts = ["경영기획팀","인사팀","관재팀","재무팀","서비스운영팀","아카이브팀","대외협력팀","디자인팀","영업팀","브랜드기획팀","고객관리팀","작품관리팀","VIP사업기획팀","웹서비스개발팀"];
  let selectedRequestKeys = new Set();
  let selectedLogKeys = new Set();
  let viewMode = sessionStorage.getItem(`catalog_view_${catalogId}`) || "gallery";

  function rowHtml(rows, kind="request"){
    if(!rows.length) return `<div class="logEmpty">내역이 없습니다.</div>`;
    return rows.map(r => {
      const key = r.__key;
      const selected = kind === "log" ? selectedLogKeys.has(key) : selectedRequestKeys.has(key);
      const type = kind === "log" ? "출고" : "신청";
      const statusText = requestStatusLabel(r.status);
      const statusClassName = requestStatusClass(r.status);
      return `
        <div class="logRow clickable ${selected ? "selected" : ""}" data-row="${escapeAttr(key)}" data-kind="${escapeAttr(kind)}">
          <div class="logDate">${escapeHtml(formatKRDate(r.d))}</div>
          <div class="logType"><span class="typeBadge ${kind === "log" ? "out" : "request"}">${escapeHtml(type)}</span></div>
          <div class="logDept">${escapeHtml(r.dept || "-")}</div>
          ${kind === "request" ? `<div class="logType"><span class="typeBadge ${statusClassName}">${escapeHtml(statusText)}</span></div>` : ``}
          <div class="logPerson">${escapeHtml(r.person || "-")}</div>
          <div class="logQty">${Number(r.qty || 0).toLocaleString()}개</div>
        </div>`;
    }).join("");
  }

  function resultCards(year, round){
    const results = __catalogYearResults(catalogId, year, round);
    if(!year) return `<div class="catalogEmptyResult">연도를 선택한 뒤 검색해주세요.</div>`;
    if(!results.length) return `<div class="catalogEmptyResult">해당 연도에 등록된 도록 이미지가 없습니다.</div>`;
    if(round){
      const meta = results[0];
      return `
        <div class="catalogRoundDetailLayout">
          <div class="catalogRoundInfo">
            <div class="catalogYearBadge">${escapeHtml(year)}</div>
            <h3 class="catalogRoundTitle">${escapeHtml(meta.title || "")}</h3>
            <p class="catalogRoundDate">${escapeHtml(meta.date || meta.round || "")}</p>
            ${isAdmin
              ? `<div class="catalogRoundApplyBtn adminStockOnly" aria-label="현재재고">현재 재고 : <b data-catalog-current-stock>0</b>부</div>`
              : `<button class="catalogRoundApplyBtn" type="button" data-result-round="${escapeAttr(meta.round || "")}">신청하기</button>`}
          </div>
          <button class="catalogRoundImageBtn" type="button" data-result-round="${escapeAttr(meta.round || "")}">
            <div class="catalogRoundImage">${renderSmartImage(meta.image, meta.title)}</div>
          </button>
        </div>`;
    }
    return `<div class="catalogResultGrid yearOnly">${results.map(meta => `
      <button class="catalogResultCard yearOnlyCard" type="button" data-result-round="${escapeAttr(meta.round || "")}">
        <div class="catalogResultCardImg">${renderSmartImage(meta.image, meta.title)}</div>
      </button>`).join("")}</div>`;
  }

  function render(){
    const selected = getCatalogApplySelection(catalogId);
    const yearList = Object.keys(config.data || {});
    const currentYear = selected?.year || "";
    const roundList = Array.isArray(config.data?.[currentYear]) ? config.data[currentYear] : [];
    const currentRound = selected?.round || "";
    const activeRound = roundList.includes(currentRound) ? currentRound : "";
    const isRoundSelected = viewMode === "result" && !!activeRound;

    const allRows = sortByLatestDateAndKey(getCatalogRequests(catalogId));
    const scopedRows = allRows.filter(r => !isRoundSelected || (String(r.year || "") === String(currentYear || "") && String(r.round || "") === String(activeRound || "")));
    const requestRows = scopedRows.filter(r => (r.status || "pending") !== "approved");
    const approvedLogRows = scopedRows.filter(r => (r.status || "pending") === "approved").map(r => normalizeLog({ ...r, t:"출고", __key:r.__key }));
    const baseCatalogStock = Number(config.currentStock || 0);
    const approvedOutQty = approvedLogRows.reduce((sum, r) => sum + Number(r.qty || 0), 0);
    const catalogCurrentStock = Math.max(0, baseCatalogStock - approvedOutQty);

    const galleryImages = Array.isArray(config.galleryImages) && config.galleryImages.length
      ? config.galleryImages
      : ["images/2601_189.jpg","images/2602_190.jpg","images/2603_contem.jpg","images/2604_191.jpg"];
    const galleryHtml = Array.from({ length: 12 }, (_, idx) => {
      const imagePath = galleryImages[idx % galleryImages.length] || "";
      return `<button class="catalogGalleryItem" type="button" data-catalog-cover="${idx}">${imagePath ? renderSmartImage(imagePath, `${config.title || "Catalog"} ${idx + 1}`) : `<div class="catalogGalleryPlaceholder">IMAGE</div>`}</button>`;
    }).join("");
    const yearOptions = [`<option value="">연도</option>`, ...yearList.map(year => `<option value="${escapeAttr(year)}" ${currentYear === year ? "selected" : ""}>${escapeHtml(year)}</option>`)].join("");
    const roundOptions = [`<option value="">-</option>`, ...roundList.map(round => `<option value="${escapeAttr(round)}" ${activeRound === round ? "selected" : ""}>${escapeHtml(round)}</option>`)].join("");

    app.innerHTML = `
      <div class="paper detailPaper requestDetailPaper"></div>
      <div class="paper-body detailPaperBody">
        <div class="catalogDetailPage">
          <div class="catalogDetailTop">
            <button class="catalogDetailTitle catalogWholeBackBtn" type="button" id="catalogWholeBackBtn">
              <span class="catalogTitleKr">도록</span><span class="catalogTitleDivider">|</span><span class="catalogTitleEn">Catalogue</span>
            </button>
          </div>
          <div class="catalogControlLabel">선택</div>
          <div class="catalogDetailControlRow">
            <div class="catalogSelectWrap"><select class="catalogSelect" id="catalogTypeSelect">${(config.typeOptions || getUnifiedCatalogOptions()).map(opt => `<option value="${escapeAttr(opt.id)}" ${String(config.id || "") === String(opt.id) ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}</select><span class="catalogSelectArrow">▼</span></div>
            <div class="catalogSelectWrap"><select class="catalogSelect" id="catalogYearSelect">${yearOptions}</select><span class="catalogSelectArrow">▼</span></div>
            <div class="catalogSelectWrap"><select class="catalogSelect" id="catalogRoundSelect">${roundOptions}</select><span class="catalogSelectArrow">▼</span></div>
            <div class="catalogDetailAction"><button class="catalogDetailSubmit" id="catalogSearchBtn" type="button">검색하기</button></div>
          </div>
          ${viewMode === "result" ? `<div class="catalogResultView">${resultCards(currentYear, activeRound)}</div>` : `<div class="catalogGalleryGrid catalogGridView">${galleryHtml}</div>`}
        </div>

        ${true ? `
        <div class="detailSectionBlock">
          <div class="boxTitleRow detailSectionHead">
            <p class="boxTitle">신청 내역</p>
            <div class="requestAdminActions">
              ${isAdmin ? `<button class="selDelBtn reqApproveBtn" id="catalogApproveRequestsBtn" type="button">승인</button><button class="selDelBtn reqRejectBtn" id="catalogRejectRequestsBtn" type="button">반려</button>` : ``}
              <button class="selDelBtn" id="catalogBulkDeleteRequests" type="button">삭제</button>
            </div>
          </div>
          <div class="logBox requestLogBox requestTable">
            <div class="logMinWidth">
              <div class="logHead subtleHead">
                <div class="logHeadCell"><div class="logHeadLabel">연도. 월. 일.</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">구분</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">전체 부서</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">전체 상태</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
              </div>
              ${rowHtml(requestRows, "request")}
            </div>
          </div>
        </div>
        <div class="detailSectionBlock catalogLogSection">
          <div class="boxTitleRow detailSectionHead"><p class="boxTitle">입출고 내역</p><div class="requestAdminActions">${isAdmin ? `<button class="selDelBtn" id="catalogBulkDeleteLogs" type="button">삭제</button>` : ``}</div></div>
          <div class="logBox requestLogBox">
            <div class="logMinWidth">
              <div class="logHead subtleHead">
                <div class="logHeadCell"><div class="logHeadLabel">연도. 월. 일.</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">전체</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">전체 부서</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">담당자</div></div>
                <div class="logHeadCell"><div class="logHeadLabel">수량</div></div>
              </div>
              ${rowHtml(approvedLogRows, "log")}
            </div>
          </div>
          <div class="adminBottomRow catalogStockBottom"><div class="adminBottomLeft"><span>기준재고</span> <b>${Number(catalogCurrentStock || 0).toLocaleString()}</b></div><div class="adminBottomRight"></div></div>
        </div>` : ``}
      </div>

      <div class="modal" id="catalogAddModal" aria-hidden="true">
        <div class="modalOverlay" id="catalogAddOverlay"></div>
        <div class="sheet" role="dialog" aria-modal="true" aria-label="출고 신청하기">
          <div class="sheetHead"><div>출고 신청하기</div><button class="sheetClose" id="catalogAddClose">닫기</button></div>
          <div class="sheetBody">
            <div class="field"><label for="catalogAddDate">날짜</label><input type="date" id="catalogAddDate"></div>
            <input type="hidden" id="catalogAddType" value="신청">
            <div class="field"><label for="catalogAddDept">부서</label><select id="catalogAddDept">${allDepts.map(d => `<option value="${escapeAttr(d)}">${escapeHtml(d)}</option>`).join("")}</select></div>
            <div class="field"><label for="catalogAddQty">수량</label><input id="catalogAddQty" inputmode="numeric" placeholder="예) 100" /></div>
            <div class="field"><label for="catalogAddPerson">담당자</label><input id="catalogAddPerson" placeholder="" /></div>
          </div>
          <div class="sheetFoot"><button class="btn primary" id="catalogAddBtn">출고 신청하기</button></div>
        </div>
      </div>`;

    const currentStockEl = app.querySelector("[data-catalog-current-stock]");
    if(currentStockEl) currentStockEl.textContent = Number(catalogCurrentStock || 0).toLocaleString();

    const typeSelect = app.querySelector("#catalogTypeSelect");
    const yearSelect = app.querySelector("#catalogYearSelect");
    const roundSelect = app.querySelector("#catalogRoundSelect");
    const searchBtn = app.querySelector("#catalogSearchBtn");
    const catalogAddModal = app.querySelector("#catalogAddModal");
    const catalogAddDate = app.querySelector("#catalogAddDate");

    function openCatalogRequestModal(){
      if(isAdmin) return;
      catalogAddModal?.classList.add("show");
      document.body.style.overflow = "hidden";
      if(catalogAddDate && !catalogAddDate.value) catalogAddDate.value = new Date().toISOString().slice(0, 10);
    }
    function closeCatalogRequestModal(){ catalogAddModal?.classList.remove("show"); document.body.style.overflow = ""; }

    app.querySelector("#catalogWholeBackBtn")?.addEventListener("click", __goCatalogWholeSection);
    typeSelect?.addEventListener("change", ()=>{
      const nextType = typeSelect.value || "offline-auction";
      sessionStorage.removeItem(`catalog_view_${nextType}`);
      saveCatalogApplySelection(nextType, { year:"", round:"" });
      location.hash = `#/request/catalog/${encodeURIComponent(nextType)}`;
    });
    yearSelect?.addEventListener("change", ()=>{
      saveCatalogApplySelection(catalogId, { ...getCatalogApplySelection(catalogId), year: yearSelect.value || "", round: "" });
      sessionStorage.setItem(`catalog_view_${catalogId}`, "gallery");
      viewMode = "gallery";
      render();
    });
    roundSelect?.addEventListener("change", ()=> saveCatalogApplySelection(catalogId, { ...getCatalogApplySelection(catalogId), year: yearSelect?.value || "", round: roundSelect.value || "" }));
    searchBtn?.addEventListener("click", ()=>{
      const year = yearSelect?.value || "";
      const round = roundSelect?.value || "";
      if(!year){ alert("연도를 선택해주세요."); return; }
      saveCatalogApplySelection(catalogId, { year, round, currentStock:Number(config.currentStock || 0) });
      sessionStorage.setItem(`catalog_view_${catalogId}`, "result");
      viewMode = "result";
      render();
    });
    app.querySelectorAll("[data-catalog-cover]").forEach(btn => btn.addEventListener("click", ()=>{
      const year = yearSelect?.value || currentYear || "2026";
      const nextRounds = Array.isArray(config.data?.[year]) ? config.data[year] : [];
      const round = roundSelect?.value || nextRounds[0] || "";
      saveCatalogApplySelection(catalogId, { year, round, currentStock:Number(config.currentStock || 0) });
      sessionStorage.setItem(`catalog_view_${catalogId}`, "result");
      viewMode = "result";
      render();
    }));
    app.querySelectorAll("[data-result-round]").forEach(btn => btn.addEventListener("click", ()=>{
      const year = yearSelect?.value || currentYear || "";
      const round = btn.dataset.resultRound || "";
      if(!round) return;
      saveCatalogApplySelection(catalogId, { year, round, currentStock:Number(config.currentStock || 0) });
      sessionStorage.setItem(`catalog_view_${catalogId}`, "result");
      viewMode = "result";
      render();
      if(!isAdmin) setTimeout(openCatalogRequestModal, 80);
    }));
    app.querySelector("#catalogAddOverlay")?.addEventListener("click", closeCatalogRequestModal);
    app.querySelector("#catalogAddClose")?.addEventListener("click", closeCatalogRequestModal);
    app.querySelector("#catalogAddBtn")?.addEventListener("click", async ()=>{
      const selectedInfo = getCatalogApplySelection(catalogId);
      const date = app.querySelector("#catalogAddDate")?.value || "";
      const dept = app.querySelector("#catalogAddDept")?.value || "";
      const qty = Number(app.querySelector("#catalogAddQty")?.value || 0);
      const person = (app.querySelector("#catalogAddPerson")?.value || "").trim();
      const year = selectedInfo?.year || yearSelect?.value || "";
      const round = selectedInfo?.round || roundSelect?.value || "";
      if(!date || !dept || !qty || !person){ alert("모든 항목을 입력해주세요."); return; }
      if(!Number.isFinite(qty) || qty <= 0){ alert("수량은 0보다 큰 숫자로 입력해주세요."); return; }
      const rows = getCatalogRequests(catalogId);
      const row = normalizeLog({ d: date, t: "신청", dept, person, qty, status:"pending", year, round, currentStock:Number(config.currentStock || 0) });
      try{
        const inserted = await addCatalogRequestToDB(catalogId, row);
        if(inserted?.id){ row._dbid = inserted.id; row.__key = `catalog_req_${inserted.id}`; }
        rows.push(row);
        saveCatalogRequests(catalogId, rows);
        closeCatalogRequestModal();
        render();
        alert("출고 신청이 접수되었습니다.");
      }catch(err){ console.error("도록 신청 DB 저장 실패:", err); alert("DB 저장 중 오류가 발생했습니다."); }
    });

    app.querySelectorAll('.logRow.clickable').forEach(rowEl => rowEl.addEventListener("click", ()=>{
      const key = rowEl.dataset.row;
      const set = rowEl.dataset.kind === "log" ? selectedLogKeys : selectedRequestKeys;
      if(set.has(key)) set.delete(key); else set.add(key);
      rowEl.classList.toggle("selected");
    }));
    app.querySelector("#catalogApproveRequestsBtn")?.addEventListener("click", async ()=>{
      const currentRows = getCatalogRequests(catalogId);
      const approvableRows = currentRows.filter(r => {
        const status = r.status || "pending";
        return selectedRequestKeys.has(r.__key) && (status === "pending" || status === "rejected");
      });
      if(!approvableRows.length){ alert("승인할 신청 내역을 선택해주세요."); return; }
      const approverEmail = await getCurrentUserEmail();
      try{
        for(const r of approvableRows) await approveCatalogRequestRow(catalogId, r, approverEmail || "");
        await syncCatalogRequestsFromDB(catalogId);
        selectedRequestKeys.clear();
        render();
      }catch(err){ console.error(err); alert("도록 신청 승인 반영 실패: " + (err?.message || err)); }
    });
    app.querySelector("#catalogRejectRequestsBtn")?.addEventListener("click", async ()=>{
      const currentRows = getCatalogRequests(catalogId);
      const pendingRows = currentRows.filter(r => selectedRequestKeys.has(r.__key) && (r.status || "pending") === "pending");
      if(!pendingRows.length){ alert("반려할 신청 내역을 선택해주세요."); return; }
      const approverEmail = await getCurrentUserEmail();
      try{
        for(const r of pendingRows) await rejectCatalogRequestRow(r, approverEmail || "");
        saveCatalogRequests(catalogId, currentRows);
        await syncCatalogRequestsFromDB(catalogId);
        selectedRequestKeys.clear();
        render();
      }catch(err){ console.error(err); alert("도록 신청 반려 반영 실패: " + (err?.message || err)); }
    });
    app.querySelector("#catalogBulkDeleteRequests")?.addEventListener("click", async ()=>{
      if(!selectedRequestKeys.size){ alert("삭제할 내역을 선택해주세요."); return; }
      const currentRows = getCatalogRequests(catalogId);
      const rowsToDelete = currentRows.filter(r => selectedRequestKeys.has(r.__key));
      const nextRows = currentRows.filter(r => !selectedRequestKeys.has(r.__key));
      try{ await deleteCatalogRequestsByKeys(catalogId, rowsToDelete); saveCatalogRequests(catalogId, nextRows); selectedRequestKeys.clear(); render(); }
      catch(err){ console.error(err); alert("DB 삭제 중 오류가 발생했습니다."); }
    });
    app.querySelector("#catalogBulkDeleteLogs")?.addEventListener("click", async ()=>{
      if(!selectedLogKeys.size){ alert("삭제할 입출고 내역을 선택해주세요."); return; }
      const currentRows = getCatalogRequests(catalogId);
      const rowsToDelete = currentRows.filter(r => selectedLogKeys.has(r.__key));
      const nextRows = currentRows.filter(r => !selectedLogKeys.has(r.__key));
      try{ await deleteCatalogRequestsByKeys(catalogId, rowsToDelete); saveCatalogRequests(catalogId, nextRows); selectedLogKeys.clear(); render(); }
      catch(err){ console.error(err); alert("DB 삭제 중 오류가 발생했습니다."); }
    });
  }

  render();
  syncCatalogRequestsFromDB(catalogId).then(changed => { if(changed) render(); }).catch(err => console.error("도록 신청내역 DB 동기화 실패:", err));
}
