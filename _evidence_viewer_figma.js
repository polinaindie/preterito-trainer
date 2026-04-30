await figma.loadFontAsync({ family: "Inter", style: "Regular" });
for (const sty of ["Light", "Medium", "Regular"]) {
  try {
    await figma.loadFontAsync({ family: "e-Ukraine", style: sty });
  } catch (e) {}
}
try {
  await figma.loadFontAsync({ family: "e-Ukraine Head", style: "Light" });
} catch (e) {}
const styleList = await figma.getLocalTextStylesAsync();
const SN = Object.fromEntries(styleList.map((s) => [s.name, s]));
function solid(c, a = 1) {
  return [{ type: "SOLID", color: c, opacity: a }];
}
const C = {
  black: { r: 15 / 255, g: 15 / 255, b: 15 / 255 },
  blue: { r: 78 / 255, g: 81 / 255, b: 255 / 255 },
  gray: { r: 78 / 255, g: 83 / 255, b: 98 / 255 },
  bgLight: { r: 243 / 255, g: 244 / 255, b: 252 / 255 },
  scrim: { r: 15 / 255, g: 15 / 255, b: 15 / 255 },
};
function mkStyled(content, styleName, fillOverride) {
  const t = figma.createText();
  t.characters = content;
  const st = SN[styleName];
  if (!st) throw new Error("Missing style: " + styleName);
  t.textStyleId = st.id;
  if (fillOverride) t.fills = solid(fillOverride);
  return t;
}

function buildModal(bpW, mode) {
  const isPhoto = mode === "photo";
  const typeLabel = isPhoto ? "Фото" : "Документ";
  const unitShort = isPhoto ? "фото" : "сторінок";
  const unitPage = isPhoto ? "Фото" : "Сторінка";
  const total = isPhoto ? 24 : 12;
  const cur = 3;
  const h = bpW <= 480 ? 780 : bpW <= 768 ? 840 : 900;
  const pad = bpW <= 480 ? 16 : bpW <= 768 ? 20 : 32;
  const edge = bpW <= 480 ? 0 : 24;

  const root = figma.createAutoLayout("VERTICAL");
  root.name = "Evidence viewer — " + mode + " — " + bpW + "px";
  root.primaryAxisSizingMode = "FIXED";
  root.counterAxisSizingMode = "FIXED";
  root.resize(bpW + edge * 2, h + edge * 2);
  root.itemSpacing = 0;
  root.fills = solid(C.scrim, 0.72);
  root.paddingLeft = root.paddingRight = edge;
  root.paddingTop = root.paddingBottom = edge;
  root.clipsContent = false;

  const shell = figma.createAutoLayout("VERTICAL");
  shell.name = "Shell";
  shell.layoutGrow = 1;
  shell.itemSpacing = 0;
  shell.fills = solid({ r: 1, g: 1, b: 1 });
  shell.cornerRadius = bpW <= 480 ? 0 : 12;

  const header = figma.createAutoLayout("HORIZONTAL");
  header.name = "Header";
  header.primaryAxisAlignItems = "CENTER";
  header.counterAxisAlignItems = "CENTER";
  header.paddingLeft = header.paddingRight = pad;
  header.paddingTop = pad;
  header.paddingBottom = pad * 0.5;
  header.itemSpacing = 16;
  header.fills = solid({ r: 1, g: 1, b: 1 });

  const chip = figma.createAutoLayout("HORIZONTAL");
  chip.paddingLeft = chip.paddingRight = 12;
  chip.paddingTop = chip.paddingBottom = 6;
  chip.cornerRadius = 80;
  chip.fills = solid(C.bgLight);
  chip.appendChild(mkStyled(typeLabel, "Body M Medium"));

  const titleStyle = bpW <= 480 ? "Body M Medium" : "Body L Light";
  const title = mkStyled(
    "Корпус бронежилета класу IV (приклад назви позиції)",
    titleStyle
  );
  title.name = "Position title";

  const closeBtn = figma.createAutoLayout("HORIZONTAL");
  closeBtn.name = "Close";
  closeBtn.paddingLeft = closeBtn.paddingRight = 10;
  closeBtn.paddingTop = closeBtn.paddingBottom = 6;
  closeBtn.cornerRadius = 80;
  closeBtn.itemSpacing = 0;
  closeBtn.appendChild(mkStyled("×", "Body M Medium", C.gray));

  header.appendChild(chip);
  header.appendChild(title);
  header.appendChild(closeBtn);
  title.layoutSizingHorizontal = "FILL";

  const viewport = figma.createAutoLayout("VERTICAL");
  viewport.name = "Viewport";
  viewport.layoutGrow = 1;
  viewport.paddingLeft = viewport.paddingRight = pad;
  viewport.paddingTop = viewport.paddingBottom = pad;
  viewport.itemSpacing = 12;
  viewport.fills = solid(C.bgLight);

  const stage = figma.createAutoLayout("VERTICAL");
  stage.name = isPhoto ? "Photo stage" : "Document stage";
  stage.primaryAxisSizingMode = "FIXED";
  stage.counterAxisSizingMode = "FIXED";
  stage.minHeight = bpW <= 480 ? 300 : 360;
  stage.paddingLeft = stage.paddingRight = 16;
  stage.paddingTop = stage.paddingBottom = 16;
  stage.itemSpacing = 0;
  stage.fills = solid({ r: 1, g: 1, b: 1 });
  stage.strokes = solid({ r: 0.88, g: 0.89, b: 0.93 });
  stage.strokeWeight = 1;
  stage.cornerRadius = 8;
  const stageHint = mkStyled(
    isPhoto ? "Фото витрати — область перегляду" : "PDF / акт — область перегляду",
    "Body S Light",
    C.gray
  );
  stage.appendChild(stageHint);

  const zoomHint = mkStyled(
    "Наведіть курсор і використайте коліщатко для масштабу",
    "Body S Light",
    C.gray
  );
  zoomHint.name = "Zoom affordance";

  viewport.appendChild(stage);
  viewport.appendChild(zoomHint);
  stage.layoutSizingHorizontal = "FILL";
  stage.layoutSizingVertical = "FILL";

  const footer = figma.createAutoLayout("VERTICAL");
  footer.name = "Footer";
  footer.paddingLeft = footer.paddingRight = pad;
  footer.paddingTop = pad * 0.5;
  footer.paddingBottom = pad;
  footer.itemSpacing = 10;
  footer.fills = solid({ r: 1, g: 1, b: 1 });

  const counterLine = mkStyled(
    "Загалом " + total + " " + unitShort + " · " + unitPage + " " + cur + " з " + total,
    "Body M Medium"
  );
  counterLine.name = "Counter";

  const navWrap = figma.createAutoLayout("VERTICAL");
  navWrap.name = "Pagination block";
  navWrap.itemSpacing = 8;

  if (bpW > 768) {
    const navRow = figma.createAutoLayout("HORIZONTAL");
    navRow.name = "Pagination";
    navRow.counterAxisAlignItems = "CENTER";
    navRow.primaryAxisAlignItems = "CENTER";
    navRow.itemSpacing = 10;
    const midLabel = cur + " / " + total;
    const parts = [
      { label: "«« перша", blue: false },
      { label: "‹ попередня", blue: false },
      { label: midLabel, blue: true },
      { label: "наступна ›", blue: false },
      { label: "остання »»", blue: false },
    ];
    for (const p of parts) {
      const btn = figma.createAutoLayout("HORIZONTAL");
      btn.paddingLeft = btn.paddingRight = p.blue ? 14 : 10;
      btn.paddingTop = btn.paddingBottom = 8;
      btn.cornerRadius = 80;
      btn.fills = solid(p.blue ? C.bgLight : { r: 1, g: 1, b: 1 });
      btn.strokes = solid({ r: 0.88, g: 0.89, b: 0.93 });
      btn.strokeWeight = 1;
      const te = mkStyled(p.label, "Body M " + (p.blue ? "Medium" : "Light"), p.blue ? C.blue : C.black);
      btn.appendChild(te);
      navRow.appendChild(btn);
    }
    navWrap.appendChild(navRow);
    navRow.layoutSizingHorizontal = "FILL";
  } else {
    const mini = mkStyled(
      unitPage + " " + cur + " з " + total + " · свайп ←→",
      "Body M Medium"
    );
    const swipe = mkStyled(
      "Мобільна навігація: свайп ліворуч / праворуч («Назад» / «Вперед»)",
      "Body S Light",
      C.gray
    );
    navWrap.appendChild(mini);
    navWrap.appendChild(swipe);
  }

  footer.appendChild(counterLine);
  footer.appendChild(navWrap);
  navWrap.layoutSizingHorizontal = "FILL";

  shell.appendChild(header);
  header.layoutSizingHorizontal = "FILL";
  shell.appendChild(viewport);
  shell.appendChild(footer);
  footer.layoutSizingHorizontal = "FILL";
  viewport.layoutSizingHorizontal = "FILL";
  viewport.layoutSizingVertical = "FILL";

  root.appendChild(shell);
  shell.layoutSizingHorizontal = "FILL";
  shell.layoutSizingVertical = "FILL";

  return root;
}

const delivery = figma.root.children.find((p) => p.name === "Delivery");
await figma.setCurrentPageAsync(delivery);
try {
  const orphan = await figma.getNodeByIdAsync("2681:18");
  if (orphan && "remove" in orphan) orphan.remove();
} catch (e) {}

let maxX = 0;
for (const n of figma.currentPage.children) {
  if ("width" in n && "x" in n) maxX = Math.max(maxX, n.x + n.width);
}

const wrap = figma.createAutoLayout("VERTICAL");
wrap.name = "Fullscreen evidence viewer — donor proofs";
wrap.itemSpacing = 120;
wrap.paddingLeft = wrap.paddingRight = wrap.paddingTop = wrap.paddingBottom = 80;
wrap.counterAxisSizingMode = "AUTO";
wrap.primaryAxisSizingMode = "AUTO";

const breakpoints = [1920, 1440, 1200, 1024, 768, 480];

const grid = figma.createAutoLayout("HORIZONTAL");
grid.name = "Сітка брейкпоінтів (колонка = ширина viewport)";
grid.itemSpacing = 56;
grid.counterAxisAlignItems = "MIN";

const created = [];
for (const w of breakpoints) {
  const col = figma.createAutoLayout("VERTICAL");
  col.name = "Breakpoint " + w + " px";
  col.itemSpacing = 72;
  col.counterAxisAlignItems = "CENTER";
  const docFr = buildModal(w, "document");
  const photoFr = buildModal(w, "photo");
  col.appendChild(docFr);
  col.appendChild(photoFr);
  grid.appendChild(col);
  created.push(docFr.id, photoFr.id);
}

wrap.appendChild(grid);
figma.currentPage.appendChild(wrap);
wrap.x = maxX + 200;
wrap.y = -600;

return {
  createdNodeIds: [wrap.id, grid.id, ...created],
  wrapId: wrap.id,
  note: "12 модальних макетів у 6 колонках (1920…480). Текстові стилі файлу через textStyleId.",
};
