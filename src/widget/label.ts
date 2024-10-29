import { measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";

type LabelAlign = "centre" | "left" | "right";

type SKLabelProps = SKElementProps & {
  text?: string;
  align?: LabelAlign;
};

export class SKLabel extends SKElement {
  constructor({
    text = "?",
    align = "centre",
    ...elementProps
  }: SKLabelProps = {}) {
    super(elementProps);

    this.padding = Style.textPadding;
    this.text = text;
    this.align = align;

    // defaults
    this.fill = "";
    this.border = "";
  }

  align: LabelAlign;

  protected _text = "";
  get text() {
    return this._text;
  }
  set text(t: string) {
    this._text = t;
    this.setMinimalSize(this.width, this.height);
  }

  // Individual corner radii
  protected _borderTopLeftRadius = 0;
  protected _borderTopRightRadius = 0;
  protected _borderBottomLeftRadius = 0;
  protected _borderBottomRightRadius = 0;

  set borderTopLeftRadius(r: number) {
    this._borderTopLeftRadius = r;
  }
  get borderTopLeftRadius() {
    return this._borderTopLeftRadius;
  }

  set borderTopRightRadius(r: number) {
    this._borderTopRightRadius = r;
  }
  get borderTopRightRadius() {
    return this._borderTopRightRadius;
  }

  set borderBottomLeftRadius(r: number) {
    this._borderBottomLeftRadius = r;
  }
  get borderBottomLeftRadius() {
    return this._borderBottomLeftRadius;
  }

  set borderBottomRightRadius(r: number) {
    this._borderBottomRightRadius = r;
  }
  get borderBottomRightRadius() {
    return this._borderBottomRightRadius;
  }

  protected _font = Style.font;
  set font(s: string){
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font(){
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }

  setMinimalSize(width?: number, height?: number) {
    // need this if w or h not specified
    const m = measureText(this.text || " ", this._font);

    if (!m) {
      console.warn(`measureText failed in SKLabel for ${this.text}`);
      return;
    }

    this.height = height || m.height + this.padding * 2;
    this.width = width || m.width + this.padding * 2;
  }

  draw(gc: CanvasRenderingContext2D) {
    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);

    if (this.fill) {
      // Create gradient
      const gradient = gc.createLinearGradient(this.x, this.y, this.x, this.y + h);
      gradient.addColorStop(0, "#ffffff"); // Light color at the top
      gradient.addColorStop(1, this.fill); // Original fill color at the bottom

      gc.beginPath();
      gc.moveTo(this.x + this._borderTopLeftRadius, this.y);
      gc.lineTo(this.x + w - this._borderTopRightRadius, this.y);
      gc.quadraticCurveTo(this.x + w, this.y, this.x + w, this.y + this._borderTopRightRadius);
      gc.lineTo(this.x + w, this.y + h - this._borderBottomRightRadius);
      gc.lineTo(this.x + w, this.y + h);
      gc.lineTo(this.x, this.y + h);
      gc.lineTo(this.x, this.y + h - this._borderBottomLeftRadius);
      gc.lineTo(this.x, this.y + this._borderTopLeftRadius);
      gc.quadraticCurveTo(this.x, this.y, this.x + this._borderTopLeftRadius, this.y);
      gc.closePath();

      // Apply gradient fill
      gc.fillStyle = gradient;
      gc.fill();

      // Add shadow for bubbly effect
      gc.shadowColor = "rgba(0, 0, 0, 0.3)";
      gc.shadowBlur = 10;
      gc.shadowOffsetX = 0;
      gc.shadowOffsetY = 5;
    }

    if (this.border) {
      gc.strokeStyle = this.border;
      gc.lineWidth = 1;
      gc.stroke();
    }

    // render text
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textBaseline = "middle";

    switch (this.align) {
      case "left":
        gc.textAlign = "left";
        gc.fillText(this.text, this.x + this.padding, this.y + h / 2);

        break;
      case "centre":
        gc.textAlign = "center";
        gc.fillText(this.text, this.x + w / 2, this.y + h / 2);

        break;
      case "right":
        gc.textAlign = "right";
        gc.fillText(this.text, this.x + w - this.padding, this.y + h / 2);

        break;
    }

    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
  }

  public toString(): string {
    return `SKLabel '${this.text}'`;
  }
}
