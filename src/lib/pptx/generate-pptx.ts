import PptxGenJS from "pptxgenjs";
import {
  buildSlideModel,
  type SlideModelEntry,
  type SlideModelContext,
} from "./slide-model";

export type PptxEntry = SlideModelEntry;
export type PptxContext = SlideModelContext;

const COLORS = {
  background: "FAFAF7",
  overline: "6B7280",
  title: "1C1C1E",
  subtitle: "9B2C2C",
  scripture: "0F766E",
  body: "27272A",
  accentBar: "1C1C1E",
  accentSoft: "E7E4DC",
};

/**
 * A consistent vector "background image" for every slide — no raster image
 * file or external asset needed, so this stays free/self-hosted. A large
 * soft accent circle bleeds off the bottom-right corner on every slide, plus
 * a thin top/side accent bar, giving the deck a unified cover-to-cover look.
 */
function addBrandedBackground(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  variant: "title" | "content",
) {
  slide.background = { color: variant === "title" ? COLORS.background : "FFFFFF" };

  slide.addShape(pptx.ShapeType.ellipse, {
    x: 7.6,
    y: 3.6,
    w: 4.2,
    h: 4.2,
    fill: { color: COLORS.accentSoft, transparency: 40 },
    line: { type: "none" },
  });

  if (variant === "title") {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.15,
      h: 5.63,
      fill: { color: COLORS.accentBar },
      line: { type: "none" },
    });
  } else {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.08,
      fill: { color: COLORS.accentBar },
      line: { type: "none" },
    });
  }
}

export async function generateEntryPptx(
  entry: PptxEntry,
  ctx: PptxContext,
): Promise<Buffer> {
  const model = buildSlideModel(entry, ctx);
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDESCREEN", width: 10, height: 5.63 });
  pptx.layout = "WIDESCREEN";

  // Title slide -----------------------------------------------------------
  const titleSlide = pptx.addSlide();
  addBrandedBackground(titleSlide, pptx, "title");

  titleSlide.addText(model.overline, {
    x: 0.7,
    y: 0.6,
    w: 8.6,
    h: 0.4,
    fontSize: 14,
    color: COLORS.overline,
    fontFace: "PingFang TC",
  });

  titleSlide.addText(model.titleText, {
    x: 0.7,
    y: 1.4,
    w: 8.6,
    h: 1.6,
    fontSize: 32,
    bold: true,
    color: COLORS.title,
    fontFace: "PingFang TC",
    valign: "top",
  });

  if (model.subtitle) {
    titleSlide.addText(model.subtitle, {
      x: 0.7,
      y: 3.1,
      w: 8.6,
      h: 0.7,
      fontSize: 20,
      bold: true,
      color: COLORS.subtitle,
      fontFace: "PingFang TC",
    });
  }

  if (model.scriptureReference) {
    titleSlide.addText(model.scriptureReference, {
      x: 0.7,
      y: 4.6,
      w: 8.6,
      h: 0.5,
      fontSize: 16,
      color: COLORS.scripture,
      fontFace: "PingFang TC",
    });
  }

  // Content slides ----------------------------------------------------------
  const chunks = model.contentChunks;
  chunks.forEach((chunk, index) => {
    const slide = pptx.addSlide();
    addBrandedBackground(slide, pptx, "content");

    slide.addText(model.titleText, {
      x: 0.6,
      y: 0.3,
      w: 8.8,
      h: 0.4,
      fontSize: 12,
      color: COLORS.overline,
      fontFace: "PingFang TC",
    });

    slide.addText(chunk, {
      x: 0.6,
      y: 0.9,
      w: 8.8,
      h: 4.3,
      fontSize: 16,
      color: COLORS.body,
      fontFace: "PingFang TC",
      valign: "top",
      lineSpacingMultiple: 1.3,
      paraSpaceAfter: 6,
      fit: "shrink",
    });

    slide.addText(`${index + 2} / ${chunks.length + 1}`, {
      x: 8.8,
      y: 5.2,
      w: 0.9,
      h: 0.3,
      fontSize: 10,
      color: COLORS.overline,
      align: "right",
    });
  });

  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}
