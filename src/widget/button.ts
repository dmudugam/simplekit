import { insideHitTestRectangle, measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";
import { SKEvent, SKMouseEvent } from "../events";

import { requestMouseFocus } from "../dispatch";

export type SKButtonProps = SKElementProps & { text?: string; hoverFill?: string };

export class SKButton extends SKElement {
  constructor({ 
    text = "", 
    fill = "lightgrey",
    hoverFill = "darkgrey",
    ...elementProps
  }: SKButtonProps = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    this.text = text;
    this.fill = fill;
    this.hoverFill = hoverFill;
    this.calculateBasis();
    this.doLayout();
  }

  state: "idle" | "hover" | "down" = "idle";
  public enabled: boolean = true; // Add enabled property

  protected _text = "";
  get text() {
    return this._text;
  }
  set text(t: string) {
    this._text = t;
    this.setMinimalSize(this.width, this.height);
  }

  protected _radius = 4;
  set radius(r: number) {
    this._radius = r;
  }
  get radius() {
    return this._radius;
  }

  protected _font = Style.font;
  set font(s: string) {
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font() {
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }

  protected _highlightColour = Style.highlightColour;
  set highlightColour(hc: string){
    this._highlightColour = hc;
  }

  protected _hoverFill = "darkgrey";
  set hoverFill(hf: string) {
    this._hoverFill = hf;
  }
  get hoverFill() {
    return this._hoverFill;
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

  setMinimalSize(width?: number, height?: number) {
    width = width || this.width;
    height = height || this.height;
    const m = measureText(this.text, this._font);

    if (!m) {
      console.warn(`measureText failed in SKButton for ${this.text}`);
      return;
    }

    this.height = height || m.height + this.padding * 2;
    this.width = width || m.width + this.padding * 2;
    if (!width) this.width = Math.max(this.width, 80);
  }

  handleMouseEvent(me: SKMouseEvent) {
    if (!this.enabled) return false; // Ignore events if the button is disabled

    switch (me.type) {
      case "mousedown":
        this.state = "down";
        requestMouseFocus(this);
        return true;
      case "mouseup":
        this.state = "hover";
        return this.sendEvent({
          source: this,
          timeStamp: me.timeStamp,
          type: "action",
        } as SKEvent);
      case "mouseenter":
        this.state = "hover";
        return true;
      case "mouseexit":
        this.state = "idle";
        return true;
    }
    return false;
  }

  draw(gc: CanvasRenderingContext2D) {
    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);

    if (this.state == "hover" || this.state == "down") {
      gc.beginPath();
      gc.moveTo(this.x + this._borderTopLeftRadius, this.y);
      gc.lineTo(this.x + w - this._borderTopRightRadius, this.y);
      gc.quadraticCurveTo(this.x + w, this.y, this.x + w, this.y + this._borderTopRightRadius);
      gc.lineTo(this.x + w, this.y + h - this._borderBottomRightRadius);
      gc.quadraticCurveTo(this.x + w, this.y + h, this.x + w - this._borderBottomRightRadius, this.y + h);
      gc.lineTo(this.x + this._borderBottomLeftRadius, this.y + h);
      gc.quadraticCurveTo(this.x, this.y + h, this.x, this.y + h - this._borderBottomLeftRadius);
      gc.lineTo(this.x, this.y + this._borderTopLeftRadius);
      gc.quadraticCurveTo(this.x, this.y, this.x + this._borderTopLeftRadius, this.y);
      gc.strokeStyle = this._highlightColour;
      gc.lineWidth = 8;
      gc.stroke();
    }

    gc.beginPath();
    gc.moveTo(this.x + this._borderTopLeftRadius, this.y);
    gc.lineTo(this.x + w - this._borderTopRightRadius, this.y);
    gc.quadraticCurveTo(this.x + w, this.y, this.x + w, this.y + this._borderTopRightRadius);
    gc.lineTo(this.x + w, this.y + h - this._borderBottomRightRadius);
    gc.quadraticCurveTo(this.x + w, this.y + h, this.x + w - this._borderBottomRightRadius, this.y + h);
    gc.lineTo(this.x + this._borderBottomLeftRadius, this.y + h);
    gc.quadraticCurveTo(this.x, this.y + h, this.x, this.y + h - this._borderBottomLeftRadius);
    gc.lineTo(this.x, this.y + this._borderTopLeftRadius);
    gc.quadraticCurveTo(this.x, this.y, this.x + this._borderTopLeftRadius, this.y);

    const gradient = gc.createLinearGradient(this.x, this.y, this.x, this.y + h);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, this.state == "hover" ? this._hoverFill : this.fill);

    gc.fillStyle = this.enabled ? gradient : "grey"; // Change fill color if disabled
    gc.fill();

    gc.shadowColor = "rgba(0, 0, 0, 0.3)";
    gc.shadowBlur = 10;
    gc.shadowOffsetX = 0;
    gc.shadowOffsetY = 5;

    gc.strokeStyle = this.border;
    gc.lineWidth = this.state == "down" ? 4 : 2;
    gc.stroke();
    gc.clip();

    gc.font = this._font;
    gc.fillStyle = this.enabled ? this._fontColour : "darkgrey"; // Change font color if disabled
    gc.textAlign = "center";
    gc.textBaseline = "middle";
    gc.fillText(this.text, this.x + w / 2, this.y + h / 2);

    gc.restore();

    super.draw(gc);
  }

  public toString(): string {
    return `SKButton '${this.text}'`;
  }
}