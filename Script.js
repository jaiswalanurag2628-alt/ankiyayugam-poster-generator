(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const canvas = $("posterCanvas");
  const ctx = canvas.getContext("2d");
  const state = {
    theme: "saffron", bgColor: "#d95b16", bgImage: null, logo: null,
    overlay: 0.28, format: "square", selected: "heading",
    positions: { heading: {x:540,y:390}, subheading:{x:540,y:485}, message:{x:540,y:590}, company:{x:540,y:930}, tagline:{x:540,y:966}, contact:{x:540,y:1010} },
    dragging: false, dragOffset: {x:0,y:0}, lastPointer:{x:0,y:0}
  };
  const themes = {
    saffron:{a:"#f7a928",b:"#a72d19",c:"#641c24",accent:"#ffe29a"},
    midnight:{a:"#263f78",b:"#10172f",c:"#080d20",accent:"#f7d78a"},
    rose:{a:"#f59ba8",b:"#9a386b",c:"#52234e",accent:"#fff0d8"},
    emerald:{a:"#58c6a0",b:"#08645c",c:"#063c45",accent:"#e2f4bd"},
    cream:{a:"#fff0c8",b:"#d5a66d",c:"#79513e",accent:"#563c32"}
  };
  const formats = {square:[1080,1080],portrait:[1080,1350],story:[1080,1920],landscape:[1200,675]};
  const read = (id) => $(id).value;
  const wrapLines = (text, maxWidth, font) => {
    ctx.font = font;
    const words = String(text || "").split(/\s+/);
    const lines=[]; let line="";
    words.forEach(word => {
      const test=line ? line+" "+word : word;
      if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=word;} else line=test;
    });
    if(line) lines.push(line);
    return lines;
  };
  function drawTextBlock(key,text,opts={}) {
    if(!text) return;
    const p=state.positions[key], size=opts.size, family=opts.family||"Georgia";
    const weight=opts.weight||"700", color=opts.color||"#fff", align=read("textAlign");
    const font=`${weight} ${size}px "${family}"`;
    const lines=wrapLines(text,opts.maxWidth||canvas.width*.82,font);
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="middle";
    const lineHeight=opts.lineHeight||size*1.2;
    lines.forEach((line,i)=>ctx.fillText(line,p.x,p.y+(i-(lines.length-1)/2)*lineHeight));
    if(state.selected===key){
      const max=Math.max(...lines.map(l=>ctx.measureText(l).width));
      const x=align==="left"?p.x:align==="right"?p.x-max:p.x-max/2;
      ctx.save();ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=2;ctx.setLineDash([8,6]);
      ctx.strokeRect(x-12,p.y-(lines.length*lineHeight)/2-8,max+24,lines.length*lineHeight+16);ctx.restore();
    }
  }
  function draw() {
    const w=canvas.width,h=canvas.height;
    const t=themes[state.theme]||themes.saffron;
    ctx.clearRect(0,0,w,h);
    const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,t.a);grad.addColorStop(.55,t.b);grad.addColorStop(1,t.c);
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    if(state.bgImage){
      const im=state.bgImage, scale=Math.max(w/im.width,h/im.height), iw=im.width*scale,ih=im.height*scale;
      ctx.drawImage(im,(w-iw)/2,(h-ih)/2,iw,ih);
      ctx.fillStyle=`rgba(10,12,25,${state.overlay})`;ctx.fillRect(0,0,w,h);
    } else {
      ctx.fillStyle=`rgba(0,0,0,${state.overlay*.55})`;ctx.fillRect(0,0,w,h);
    }
    // Decorative framing and subtle light accents
    ctx.save();ctx.strokeStyle=t.accent;ctx.globalAlpha=.55;ctx.lineWidth=4;
    const m=w*.045;ctx.strokeRect(m,m,w-2*m,h-2*m);ctx.globalAlpha=.22;ctx.lineWidth=2;ctx.strokeRect(m+13,m+13,w-2*(m+13),h-2*(m+13));
    ctx.globalAlpha=.35;for(let i=0;i<22;i++){const x=(i*173+71)%w,y=(i*293+113)%h;ctx.beginPath();ctx.arc(x,y,3+(i%3)*2,0,Math.PI*2);ctx.fillStyle=t.accent;ctx.fill();}
    ctx.restore();
    // Small decorative motif
    ctx.save();ctx.translate(w/2,h*.19);ctx.strokeStyle=t.accent;ctx.lineWidth=4;ctx.globalAlpha=.85;
    ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(35,0);ctx.lineTo(0,35);ctx.lineTo(-35,0);ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,35);ctx.lineTo(0,58);ctx.stroke();ctx.restore();
    const titleColor=read("headingColor"), textColor=read("textColor");
    drawTextBlock("heading",read("headingInput"),{size:Number(read("fontSize"))||68,family:read("fontFamily"),color:titleColor,maxWidth:w*.84});
    drawTextBlock("subheading",read("subheadingInput"),{size:34,family:"Trebuchet MS",weight:"600",color:textColor,maxWidth:w*.82});
    drawTextBlock("message",read("messageInput"),{size:27,family:"Arial",weight:"400",color:textColor,maxWidth:w*.76,lineHeight:39});
    if($("showBranding").checked){
      if(state.logo){const im=state.logo,maxW=125,maxH=100,scale=Math.min(maxW/im.width,maxH/im.height);ctx.drawImage(im,w/2-(im.width*scale)/2,h*.79,im.width*scale,im.height*scale);}
      drawTextBlock("company",read("companyInput"),{size:31,family:"Arial",color:t.accent,maxWidth:w*.8});
      drawTextBlock("tagline",read("taglineInput"),{size:19,family:"Arial",weight:"400",color:textColor,maxWidth:w*.8});
      drawTextBlock("contact",read("contactInput"),{size:20,family:"Arial",weight:"600",color:textColor,maxWidth:w*.8});
    }
  }
  function setFormat(value){
    state.format=value;const [w,h]=formats[value];canvas.width=w;canvas.height=h;
    $("dimensionLabel").textContent=`${w} × ${h} px`;
    const old=state.positions;
    Object.keys(old).forEach(k=>{old[k].x=w/2;});
    old.heading.y=h*.36;old.subheading.y=h*.45;old.message.y=h*.56;
    old.company.y=h*.85;old.tagline.y=h*.89;old.contact.y=h*.93;
    draw();
  }
  function loadImage(file,callback){
    if(!file)return;
    if(!file.type.startsWith("image/")){alert("Please choose an image file.");return;}
    const reader=new FileReader();
    reader.onload=()=>{const im=new Image();im.onload=()=>callback(im);im.src=reader.result;};
    reader.readAsDataURL(file);
  }
  function update(){state.overlay=Number(read("overlayStrength"))/100;state.bgColor=read("backgroundColor");draw();}
  ["headingInput","subheadingInput","messageInput","headingColor","textColor","textAlign","companyInput","taglineInput","contactInput","showBranding","fontSize","fontFamily","overlayStrength","backgroundColor"].forEach(id=>{
    $(id).addEventListener("input",update);$(id).addEventListener("change",update);
  });
  $("formatSelect").addEventListener("change",e=>setFormat(e.target.value));
  $("backgroundUpload").addEventListener("change",e=>loadImage(e.target.files[0],im=>{state.bgImage=im;draw();}));
  $("logoUpload").addEventListener("change",e=>loadImage(e.target.files[0],im=>{state.logo=im;draw();}));
  $("removeBackgroundBtn").addEventListener("click",()=>{state.bgImage=null;$("backgroundUpload").value="";draw();});
  $("themeSwatches").addEventListener("click",e=>{
    const b=e.target.closest("[data-theme]");if(!b)return;
    state.theme=b.dataset.theme;document.querySelectorAll(".swatch").forEach(x=>x.classList.toggle("active",x===b));draw();
  });
  function canvasPoint(e){
    const r=canvas.getBoundingClientRect();
    return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};
  }
  function hitTest(pt){
    const keys=["heading","subheading","message","company","tagline","contact"];
    for(const key of keys){
      if(["company","tagline","contact"].includes(key)&&!$("showBranding").checked)continue;
      const p=state.positions[key], size=key==="heading"?Number(read("fontSize")):key==="subheading"?34:key==="message"?27:key==="company"?31:20;
      const txt=key==="heading"?read("headingInput"):key==="subheading"?read("subheadingInput"):key==="message"?read("messageInput"):key==="company"?read("companyInput"):key==="tagline"?read("taglineInput"):read("contactInput");
      ctx.font=`700 ${size}px Georgia`;const width=Math.min(canvas.width*.9,Math.max(120,ctx.measureText(txt).width+90));
      if(Math.abs(pt.x-p.x)<width/2 && Math.abs(pt.y-p.y)<Math.max(45,size*1.3))return key;
    }
    return null;
  }
  canvas.addEventListener("pointerdown",e=>{
    const pt=canvasPoint(e),key=hitTest(pt);state.selected=key;
    if(key){state.dragging=true;state.dragOffset={x:pt.x-state.positions[key].x,y:pt.y-state.positions[key].y};canvas.setPointerCapture(e.pointerId);}
    $("selectionLabel").textContent=key?`Selected: ${key}`:"No text element selected.";
    draw();
  });
  canvas.addEventListener("pointermove",e=>{
    if(!state.dragging||!state.selected)return;
    const pt=canvasPoint(e);state.positions[state.selected]={x:Math.max(30,Math.min(canvas.width-30,pt.x-state.dragOffset.x)),y:Math.max(40,Math.min(canvas.height-35,pt.y-state.dragOffset.y))};draw();
  });
  canvas.addEventListener("pointerup",()=>{state.dragging=false;});
  $("centerElementBtn").addEventListener("click",()=>{if(state.selected){state.positions[state.selected].x=canvas.width/2;draw();}});
  function download(){
    draw();const type=read("exportFormat"),ext=type==="image/jpeg"?"jpg":"png";
    const link=document.createElement("a");link.download=`${(read("companyInput")||"my").trim().replace(/[^a-z0-9-_]+/gi,"-")}-poster.${ext}`;
    link.href=canvas.toDataURL(type,type==="image/jpeg"?.94:1);link.click();
  }
  $("downloadBtn").addEventListener("click",download);$("exportBtn").addEventListener("click",download);
  $("resetBtn").addEventListener("click",()=>{
    if(!confirm("Reset the poster to its original design?"))return;
    $("headingInput").value="Happy Makar Sankranti!";$("subheadingInput").value="May your days soar high with happiness";
    $("messageInput").value="Wishing you and your family joy, prosperity and success.";
    $("headingColor").value="#ffffff";$("textColor").value="#fff4dc";$("textAlign").value="center";
    $("backgroundColor").value="#d95b16";$("overlayStrength").value=28;$("formatSelect").value="square";
    state.theme="saffron";state.bgImage=null;state.logo=null;state.selected=null;setFormat("square");
    document.querySelectorAll(".swatch").forEach(x=>x.classList.toggle("active",x.dataset.theme==="saffron"));draw();
  });
  $("applyPromptBtn").addEventListener("click",()=>{
    const prompt=read("promptInput").trim();if(!prompt){alert("Enter a short description first.");return;}
    const lower=prompt.toLowerCase();
    const choices=[["diwali","Happy Diwali!","May the festival of lights bring joy and prosperity."],["holi","Happy Holi!","Wishing you a colourful celebration filled with happiness."],["birthday","Happy Birthday!","Wishing you a wonderful year ahead."],["sankranti","Happy Makar Sankranti!","May your days soar high with happiness"],["christmas","Merry Christmas!","Wishing you peace, love and joy."]];
    const found=choices.find(x=>lower.includes(x[0]));
    if(found){$("headingInput").value=found[1];$("subheadingInput").value=found[2];}
    $("messageInput").value=prompt.length>150?prompt.slice(0,150):prompt;
    draw();
  });

  // Generate an AI background through the same-origin serverless endpoint.
  $("generateAiBtn").addEventListener("click", async () => {
    const prompt = read("promptInput").trim();
    if (!prompt) {
      $("aiStatus").textContent = "Please describe the background you want first.";
      $("aiStatus").className = "small-note error";
      $("promptInput").focus();
      return;
    }
    const button = $("generateAiBtn");
    const status = $("aiStatus");
    button.disabled = true;
    button.textContent = "Creating your image…";
    status.className = "small-note";
    status.textContent = "Generating your AI background. This can take a minute or two. Please keep this page open.";
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          prompt,
          size: state.format === "landscape" ? "1536x1024" :
                (state.format === "portrait" || state.format === "story") ? "1024x1536" : "1024x1024",
          quality: read("aiQuality")
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Image generation failed (${response.status}).`);
      if (!result.image) throw new Error("The image service returned no image.");
      const image = new Image();
      image.onload = () => {
        state.bgImage = image;
        state.overlay = Math.max(state.overlay, 0.22);
        $("overlayStrength").value = Math.round(state.overlay * 100);
        draw();
        status.textContent = "Your AI background is ready. Add or edit your branding and download the poster.";
        status.className = "small-note success";
      };
      image.onerror = () => {
        status.textContent = "The generated image could not be loaded. Please try again.";
        status.className = "small-note error";
      };
      image.src = result.image;
    } catch (error) {
      status.textContent = error.message || "Something went wrong while generating the image.";
      status.className = "small-note error";
    } finally {
      button.disabled = false;
      button.textContent = "✦ Generate AI background";
    }
  });

  // Restore saved brand details between visits on the same browser.
  ["companyInput","taglineInput","contactInput"].forEach(id=>{
    const saved=localStorage.getItem("posterStudio_"+id);if(saved!==null)$(id).value=saved;
    $(id).addEventListener("change",()=>localStorage.setItem("posterStudio_"+id,read(id)));
  });
  setFormat("square");draw();
})(); 
